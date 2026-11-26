import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarCheck,
  DollarSign,
  Handshake,
  Megaphone,
  Target,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { localizeCampaignName } from '../../i18n/localizeData';
import { formatMAD, formatNumber } from '../../i18n/translations';
import { AdPlatform } from '../../types/domain';
import { addDaysIso, getDateRangeBounds, getTodayIso, GlobalTimePeriod } from '../../utils/dateUtils';
import {
  AreaTrendChart,
  BarComparisonChart,
  DonutDistributionChart,
  DualAxisSpendCplChart,
} from '../ui/Charts';
import { EmptyState, KpiCard, StatusLabel } from '../ui/DataPrimitives';

function diffDaysInclusive(startIso: string, endIso: string): number {
  const s = new Date(`${startIso.slice(0, 10)}T00:00:00Z`).getTime();
  const e = new Date(`${endIso.slice(0, 10)}T00:00:00Z`).getTime();
  if (Number.isNaN(s) || Number.isNaN(e) || e < s) return 0;
  return Math.floor((e - s) / 86_400_000) + 1;
}

function getOverlapRatio(
  itemStart: string,
  itemEnd: string,
  boundFrom: string | null,
  boundTo: string | null
): number {
  if (!boundFrom && !boundTo) return 1;
  const totalDays = Math.max(diffDaysInclusive(itemStart, itemEnd), 1);
  const effStart = boundFrom && boundFrom > itemStart ? boundFrom : itemStart;
  const effEnd = boundTo && boundTo < itemEnd ? boundTo : itemEnd;
  const overlapDays = diffDaysInclusive(effStart, effEnd);
  if (overlapDays <= 0) return 0;
  return Math.min(1, overlapDays / totalDays);
}

export const AdsAnalyticsSection: React.FC = () => {
  const { t, language, adCampaigns } = useAgency();

  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [campaignStatusOverrides, setCampaignStatusOverrides] = useState<Record<string, AdCampaign['status']>>({});
  const getCampaignStatus = (campaign: AdCampaign) => campaignStatusOverrides[campaign.id] ?? campaign.status;
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<GlobalTimePeriod>('all');
  const [customFrom, setCustomFrom] = useState(() => addDaysIso(getTodayIso(), -29));
  const [customTo, setCustomTo] = useState(getTodayIso());

  const bounds = useMemo(
    () => getDateRangeBounds(dateRange, customFrom, customTo),
    [dateRange, customFrom, customTo]
  );

  const filteredCampaigns = useMemo(() => {
    return adCampaigns
      .filter((c) => {
        if (platformFilter !== 'all' && c.platform !== platformFilter) return false;
        if (statusFilter !== 'all' && getCampaignStatus(c) !== statusFilter) return false;
        return true;
      })
      .map((c) => {
        const ratio = getOverlapRatio(c.start_date, c.end_date, bounds.from, bounds.to);
        if (ratio <= 0) return null;
        return {
          ...c,
          periodSpend: Math.round(c.spend * ratio),
          periodLeads: Math.round(c.leads * ratio),
          periodQualified: Math.round(c.qualified_leads * ratio),
          periodAppointments: Math.round(c.appointments * ratio),
          periodVisits: Math.round(c.visits * ratio),
          periodSales: Math.round(c.sales * ratio),
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);
  }, [adCampaigns, platformFilter, statusFilter, bounds, campaignStatusOverrides]);

  const totals = useMemo(() => {
    const spend = filteredCampaigns.reduce((s, c) => s + c.periodSpend, 0);
    const leads = filteredCampaigns.reduce((s, c) => s + c.periodLeads, 0);
    const qualified = filteredCampaigns.reduce((s, c) => s + c.periodQualified, 0);
    const appointments = filteredCampaigns.reduce((s, c) => s + c.periodAppointments, 0);
    const visits = filteredCampaigns.reduce((s, c) => s + c.periodVisits, 0);
    const sales = filteredCampaigns.reduce((s, c) => s + c.periodSales, 0);
    const cpl = leads > 0 ? Math.round(spend / leads) : 0;
    const cpa = appointments > 0 ? Math.round(spend / appointments) : 0;
    const convRate = leads > 0 ? ((sales / leads) * 100).toFixed(1) : '0.0';
    return { spend, leads, qualified, appointments, visits, sales, cpl, cpa, convRate };
  }, [filteredCampaigns]);

  const leadsByCampaignSeries = useMemo(
    () =>
      filteredCampaigns.map((c) => ({
        label: localizeCampaignName(c.name, language).split('—')[0].trim().slice(0, 14),
        value: c.periodLeads,
        secondaryValue: c.periodAppointments,
      })),
    [filteredCampaigns, language]
  );

  const platformSlices = useMemo(() => {
    const colors: Record<AdPlatform, string> = {
      facebook_ads: '#2563EB',
      instagram_ads: '#EA580C',
      google_ads: '#0EA5E9',
      other: '#64748B',
    };
    const grouped: Partial<Record<AdPlatform, number>> = {};
    filteredCampaigns.forEach((c) => {
      grouped[c.platform] = (grouped[c.platform] ?? 0) + c.periodLeads;
    });
    return (Object.keys(grouped) as AdPlatform[]).map((p) => ({
      label: t.adPlatforms[p],
      value: grouped[p] ?? 0,
      color: colors[p],
    }));
  }, [filteredCampaigns, t.adPlatforms]);

  const campaignTrend = useMemo(() => {
    return filteredCampaigns.map((c) => ({
      label: c.start_date.slice(5),
      value: c.periodLeads,
    }));
  }, [filteredCampaigns]);

  const spendAndCplSeries = useMemo(
    () =>
      filteredCampaigns.map((c) => ({
        label: localizeCampaignName(c.name, language).split('—')[0].trim().slice(0, 14),
        spend: c.periodSpend,
        cpl: c.periodLeads > 0 ? Math.round(c.periodSpend / c.periodLeads) : 0,
        leads: c.periodLeads,
      })),
    [filteredCampaigns, language]
  );

  return (
    <div className="space-y-5">
      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-[19px] font-bold text-[#1F2937]">{t.ads.title}</h2>
          <p className="text-xs text-[#64748B] font-medium mt-0.5">{t.ads.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as GlobalTimePeriod)}
            className="h-9 px-3 text-xs font-semibold border border-slate-200 rounded-xl bg-white text-zinc-950"
          >
            <option value="today">{t.reports.timeFilter.today}</option>
            <option value="last7">{t.overview.dateFilters.last7}</option>
            <option value="thisMonth">{t.reports.timeFilter.thisMonth}</option>
            <option value="last30">{t.overview.dateFilters.last30}</option>
            <option value="thisYear">{t.reports.timeFilter.thisYear}</option>
            <option value="all">{t.reports.timeFilter.all}</option>
            <option value="custom">{t.reports.timeFilter.custom}</option>
          </select>

          {dateRange === 'custom' && (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 h-9 text-xs">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="font-mono-num text-zinc-950 focus:outline-none"
              />
              <span className="text-zinc-400">–</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="font-mono-num text-zinc-950 focus:outline-none"
              />
            </div>
          )}

          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="h-9 px-3 text-xs font-semibold border border-slate-200 rounded-xl bg-white text-zinc-950"
          >
            <option value="all">{t.app.all}</option>
            {(Object.keys(t.adPlatforms) as AdPlatform[]).map((p) => (
              <option key={p} value={p}>
                {t.adPlatforms[p]}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 text-xs font-semibold border border-slate-200 rounded-xl bg-white text-zinc-950"
          >
            <option value="all">{t.leads.filters.allStatuses}</option>
            <option value="active">{t.ads.campaignStatuses.active}</option>
            <option value="paused">{t.ads.campaignStatuses.paused}</option>
            <option value="completed">{t.ads.campaignStatuses.completed}</option>
          </select>
        </div>
      </div>

      {/* Honest Demo Data Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2.5 text-xs font-medium text-amber-900">
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
        <span>{t.ads.demoWarning}</span>
      </div>

      {/* 9 Marketing KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          title={t.ads.kpis.totalSpend}
          value={formatMAD(totals.spend, language)}
          icon={<DollarSign className="h-4 w-4" />}
          tone="navy"
        />
        <KpiCard
          title={t.ads.kpis.totalLeads}
          value={formatNumber(totals.leads, language)}
          icon={<Users className="h-4 w-4" />}
          tone="orange"
        />
        <KpiCard
          title={t.ads.kpis.cpl}
          value={formatMAD(totals.cpl, language)}
          icon={<Target className="h-4 w-4" />}
          tone="sky"
        />
        <KpiCard
          title={t.ads.kpis.qualifiedLeads}
          value={formatNumber(totals.qualified, language)}
          icon={<UserCheck className="h-4 w-4" />}
          tone="emerald"
        />
        <KpiCard
          title={t.ads.kpis.appointments}
          value={formatNumber(totals.appointments, language)}
          icon={<CalendarCheck className="h-4 w-4" />}
          tone="teal"
        />
        <KpiCard
          title={t.ads.kpis.costPerAppointment}
          value={formatMAD(totals.cpa, language)}
          icon={<Megaphone className="h-4 w-4" />}
          tone="amber"
        />
        <KpiCard
          title={t.ads.kpis.visits}
          value={formatNumber(totals.visits, language)}
          icon={<TrendingUp className="h-4 w-4" />}
          tone="indigo"
        />
        <KpiCard
          title={t.ads.kpis.attributedSales}
          value={formatNumber(totals.sales, language)}
          icon={<Handshake className="h-4 w-4" />}
          tone="emerald"
        />
        <KpiCard
          title={t.ads.kpis.conversionRate}
          value={`${totals.convRate}%`}
          icon={<Target className="h-4 w-4" />}
          tone="orange"
        />
      </div>

      {filteredCampaigns.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="h-6 w-6" />}
          title={t.reports.adsSection.noAdDataInPeriod}
        />
      ) : (
        <>
          {/* Charts Grid */}
                    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 text-sm text-slate-600 mb-4">
            Campaign performance is presented in the table below for a clearer, more focused view.
          </div>

          {/* Campaigns Table */}
          <div className="bg-white border border-[#E2E8F0] card-surface rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start border-collapse">
                <thead>
                  <tr className="bg-[#1E293B] text-white border-b-2 border-[#EA580C] font-bold whitespace-nowrap">
                    <th className="py-3.5 px-4 text-start">{t.ads.table.campaignName}</th>
                    <th className="py-3.5 px-4 text-start">{t.ads.table.platform}</th>
                    <th className="py-3.5 px-4 text-start">{t.ads.table.budget}</th>
                    <th className="py-3.5 px-4 text-start">{t.ads.table.spend}</th>
                    <th className="py-3.5 px-4 text-start">{t.ads.table.leads}</th>
                    <th className="py-3.5 px-4 text-start">{t.ads.table.appointments}</th>
                    <th className="py-3.5 px-4 text-start">{t.ads.table.cpl}</th>
                    <th className="py-3.5 px-4 text-start">{t.ads.table.status}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredCampaigns.map((camp) => {
                    const cpl =
                      camp.periodLeads > 0 ? Math.round(camp.periodSpend / camp.periodLeads) : 0;
                    return (
                      <tr key={camp.id} className="hover:bg-[#FFF7ED]">
                        <td className="py-3 px-4 font-bold text-[#1F2937]">
                          {localizeCampaignName(camp.name, language)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-medium text-[#1F2937]">
                          {t.adPlatforms[camp.platform]}
                        </td>
                        <td className="py-3 px-4 font-mono-num whitespace-nowrap text-[#1F2937]">
                          {formatMAD(camp.budget, language)}
                        </td>
                        <td className="py-3 px-4 font-mono-num font-semibold text-[#1F2937] whitespace-nowrap">
                          {formatMAD(camp.periodSpend, language)}
                        </td>
                        <td className="py-3 px-4 font-mono-num font-bold text-[#1F2937]">
                          {camp.periodLeads}
                        </td>
                        <td className="py-3 px-4 font-mono-num font-medium text-[#1F2937]">
                          {camp.periodAppointments}
                        </td>
                        <td className="py-3 px-4 font-mono-num font-bold text-[#C2410C] whitespace-nowrap">
                          {formatMAD(cpl, language)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <select value={getCampaignStatus(camp)} onChange={(e) => setCampaignStatusOverrides((prev) => ({ ...prev, [camp.id]: e.target.value as AdCampaign['status'] }))} className="rounded-lg border border-[#E2E8F0] bg-white px-2 py-1.5 text-[11px] font-bold text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-orange-200" aria-label={t.ads.table.status}>{(['active', 'paused', 'completed'] as AdCampaign['status'][]).map((status) => <option key={status} value={status}>{t.ads.campaignStatuses[status]}</option>)}</select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
