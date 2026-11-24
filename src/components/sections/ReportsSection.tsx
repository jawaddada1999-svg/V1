import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Building2,
  Calendar,
  CalendarCheck2,
  Check,
  CheckCircle2,
  DollarSign,
  Edit3,
  Handshake,
  Home,
  KeyRound,
  Lock,
  Megaphone,
  Printer,
  RotateCcw,
  Target,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
  UserX,
  X,
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { formatMAD } from '../../i18n/translations';
import {
  localizeCampaignName,
  localizeCity,
  localizePersonName,
  normalizeCityKey,
} from '../../i18n/localizeData';
import { PropertyType } from '../../types/domain';
import {
  addDaysIso,
  getDateRangeBounds,
  getTodayIso,
  GlobalTimePeriod,
  isIsoDateInRange,
} from '../../utils/dateUtils';
import { triggerPrintPdfReport } from '../../utils/exportUtils';
import { DonutDistributionChart, HorizontalBarChart } from '../ui/Charts';
import { EmptyState, KpiCard, StatusLabel } from '../ui/DataPrimitives';

type ReportTab = 'leads' | 'appointments' | 'properties' | 'team' | 'sales' | 'ads';

const PROPERTY_TYPE_COLORS: Record<PropertyType, string> = {
  apartment: '#0284C7',
  villa: '#EA580C',
  house: '#6366F1',
  land: '#F59E0B',
  office: '#1E293B',
  commercial: '#EC4899',
  other: '#64748B',
};

const CITY_PALETTE = [
  '#EA580C',
  '#0284C7',
  '#6366F1',
  '#F59E0B',
  '#EC4899',
  '#1E293B',
  '#0EA5E9',
  '#D97706',
  '#64748B',
];

function computeMostRequestedNumeric(values: number[]): number {
  if (!values.length) return 0;
  const freq = new Map<number, number>();
  let bestVal = values[0];
  let bestCount = 0;
  for (const v of values) {
    const next = (freq.get(v) ?? 0) + 1;
    freq.set(v, next);
    if (next > bestCount) {
      bestCount = next;
      bestVal = v;
    }
  }
  if (bestCount > 1) return bestVal;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

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

export const ReportsSection: React.FC = () => {
  const {
    t,
    language,
    leads,
    properties,
    appointments,
    employees,
    adCampaigns,
    teamPerformanceOverrides,
    updateTeamPerformance,
    resetTeamPerformance,
    pushToast,
  } = useAgency();

  const [activeTab, setActiveTab] = useState<ReportTab>('leads');
  const [timePeriod, setTimePeriod] = useState<GlobalTimePeriod>('all');
  const [customFrom, setCustomFrom] = useState('2026-09-01');
  const [customTo, setCustomTo] = useState(getTodayIso());

  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [financialInput, setFinancialInput] = useState<string>('');

  const bounds = useMemo(
    () => getDateRangeBounds(timePeriod, customFrom, customTo),
    [timePeriod, customFrom, customTo]
  );

  // Scoped CRM datasets aligned with exact date semantics
  const filteredLeads = useMemo(
    () => leads.filter((l) => isIsoDateInRange(l.created_at, bounds.from, bounds.to)),
    [leads, bounds]
  );

  const filteredAppointments = useMemo(
    () => appointments.filter((a) => isIsoDateInRange(a.date, bounds.from, bounds.to)),
    [appointments, bounds]
  );

  const filteredWonLeads = useMemo(
    () =>
      leads.filter(
        (l) =>
          l.status === 'closed_won' &&
          isIsoDateInRange(l.closed_date ?? l.last_interaction ?? l.created_at, bounds.from, bounds.to)
      ),
    [leads, bounds]
  );

  const filteredLostLeads = useMemo(
    () =>
      leads.filter(
        (l) =>
          l.status === 'closed_lost' &&
          isIsoDateInRange(l.closed_date ?? l.last_interaction ?? l.created_at, bounds.from, bounds.to)
      ),
    [leads, bounds]
  );

  const filteredProperties = useMemo(
    () => properties.filter((p) => isIsoDateInRange(p.created_at, bounds.from, bounds.to)),
    [properties, bounds]
  );

  // 1. CLIENT REPORTS DATA
  const leadStats = useMemo(() => {
    const total = filteredLeads.length;
    const newLeads = filteredLeads.filter((l) => l.status === 'new').length;
    const wonInPeriod = filteredLeads.filter((l) => l.status === 'closed_won').length;
    const convRate = total > 0 ? Math.round((wonInPeriod / total) * 100) : 0;

    const buyers = filteredLeads.filter((l) => l.transaction_type === 'sale').length;
    const renters = filteredLeads.filter((l) => l.transaction_type === 'rent').length;
    const ownersSell = filteredLeads.filter((l) => l.transaction_type === 'sell').length;
    const ownersRentOut = filteredLeads.filter((l) => l.transaction_type === 'rent_out').length;

    const byPropertyType = (Object.keys(t.propertyTypes) as PropertyType[])
      .map((pt) => ({
        type: pt,
        label: t.propertyTypes[pt],
        value: filteredLeads.filter((l) => l.property_type === pt).length,
        color: PROPERTY_TYPE_COLORS[pt],
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    const UNSPECIFIED_CITY_KEY = '__unspecified__';
    const cityCounts = new Map<string, number>();
    filteredLeads.forEach((l) => {
      const rawCity = (l.city || '').trim();
      const key = rawCity ? normalizeCityKey(rawCity) : UNSPECIFIED_CITY_KEY;
      cityCounts.set(key, (cityCounts.get(key) ?? 0) + 1);
    });
    const byDesiredCity = Array.from(cityCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([cityKey, value], idx) => ({
        label:
          cityKey === UNSPECIFIED_CITY_KEY
            ? language === 'ar'
              ? 'غير محدد'
              : language === 'fr'
                ? 'Non spécifié'
                : 'Unspecified'
            : localizeCity(cityKey, language),
        value,
        color: CITY_PALETTE[idx % CITY_PALETTE.length],
      }));

    return {
      total,
      newLeads,
      convRate,
      buyers,
      renters,
      ownersSell,
      ownersRentOut,
      byPropertyType,
      byDesiredCity,
    };
  }, [filteredLeads, t.propertyTypes, language]);

  // 2. APPOINTMENT REPORTS DATA (strict completed outcome partition, zero double counting)
  const aptStats = useMemo(() => {
    const total = filteredAppointments.length;
    const attendedApts = filteredAppointments.filter((a) => a.status === 'attended');
    const noShowApts = filteredAppointments.filter((a) => a.status === 'no_show');
    const pendingOrExcluded = total - attendedApts.length - noShowApts.length;
    const completed = attendedApts.length + noShowApts.length;

    const wonLeadIds = new Set(
      leads
        .filter(
          (l) =>
            l.status === 'closed_won' &&
            (bounds.from || bounds.to
              ? isIsoDateInRange(l.closed_date ?? l.last_interaction ?? l.created_at, bounds.from, bounds.to)
              : true)
        )
        .map((l) => l.id)
    );

    // Count each closed_won lead at most once among its attended appointments in this period
    const attributedLeadIds = new Set<string>();
    let attendedWonCount = 0;
    for (const apt of attendedApts) {
      if (wonLeadIds.has(apt.lead_id) && !attributedLeadIds.has(apt.lead_id)) {
        attributedLeadIds.add(apt.lead_id);
        attendedWonCount += 1;
      }
    }

    const attendedNoDealCount = Math.max(0, attendedApts.length - attendedWonCount);
    const noShowCount = noShowApts.length;

    const attendanceRate = completed > 0 ? Math.round((attendedApts.length / completed) * 100) : 0;
    const absenceRate = completed > 0 ? 100 - attendanceRate : 0;
    const closingRate = completed > 0 ? Math.round((attendedWonCount / completed) * 100) : 0;

    return {
      total,
      completed,
      attendedCount: attendedApts.length,
      noShowCount,
      attendedWonCount,
      attendedNoDealCount,
      pendingOrExcluded,
      attendanceRate,
      absenceRate,
      closingRate,
    };
  }, [filteredAppointments, leads, bounds]);

  // 3. PROPERTY REPORTS DATA (strictly seeker demand from period + inventory status)
  const propStats = useMemo(() => {
    const available = filteredProperties.filter((p) => p.status === 'available').length;
    const sold = filteredProperties.filter((p) => p.status === 'sold').length;
    const rented = filteredProperties.filter((p) => p.status === 'rented').length;

    const demandLeads = filteredLeads.filter(
      (l) => l.transaction_type === 'sale' || l.transaction_type === 'rent'
    );

    const demandByType = (Object.keys(t.propertyTypes) as PropertyType[])
      .map((pt) => {
        const typeLeads = demandLeads.filter((l) => l.property_type === pt);
        if (!typeLeads.length) return null;

        const areas = typeLeads.map((l) => l.desired_area).filter((v) => v > 0);
        const budgets = typeLeads.map((l) => l.budget).filter((v) => v > 0);

        const minArea = areas.length ? Math.min(...areas) : 0;
        const maxArea = areas.length ? Math.max(...areas) : 0;
        const mostArea = computeMostRequestedNumeric(areas);

        const minBudget = budgets.length ? Math.min(...budgets) : 0;
        const maxBudget = budgets.length ? Math.max(...budgets) : 0;
        const mostBudget = computeMostRequestedNumeric(budgets);

        return {
          type: pt,
          label: t.propertyTypes[pt],
          color: PROPERTY_TYPE_COLORS[pt],
          count: typeLeads.length,
          minArea,
          maxArea,
          mostArea,
          minBudget,
          maxBudget,
          mostBudget,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.count - a.count);

    return {
      available,
      sold,
      rented,
      totalDemand: demandLeads.length,
      demandByType,
    };
  }, [filteredProperties, filteredLeads, t.propertyTypes]);

  // 4. TEAM PERFORMANCE DATA
  const teamRows = useMemo(() => {
    return employees.map((emp) => {
      const leadsHandled = filteredLeads.filter((l) => l.assigned_employee_id === emp.id).length;
      const empApts = filteredAppointments.filter((a) => a.employee_id === emp.id);
      const appointmentsCount = empApts.length;
      const visitsCompleted = empApts.filter(
        (a) => a.status === 'attended' || a.status === 'no_show'
      ).length;
      const empWon = filteredWonLeads.filter((l) => l.assigned_employee_id === emp.id);
      const successfulDeals = empWon.length;
      const lostDeals = filteredLostLeads.filter((l) => l.assigned_employee_id === emp.id).length;

      const computedFinancial = empWon.reduce((sum, l) => sum + (l.deal_value ?? l.budget), 0);
      const override = teamPerformanceOverrides[emp.id];
      const hasManualFinancial = typeof override?.financial_performance === 'number';
      const financialPerformance = hasManualFinancial
        ? override.financial_performance!
        : computedFinancial;

      const denominator = Math.max(leadsHandled, successfulDeals + lostDeals);
      const conversionRate = denominator > 0 ? Math.round((successfulDeals / denominator) * 100) : 0;

      return {
        id: emp.id,
        name: localizePersonName(emp.name, language),
        role: t.employeeRoles[emp.role],
        leadsHandled,
        appointmentsCount,
        visitsCompleted,
        successfulDeals,
        lostDeals,
        conversionRate,
        computedFinancial,
        financialPerformance,
        hasManualFinancial,
      };
    });
  }, [
    employees,
    filteredLeads,
    filteredAppointments,
    filteredWonLeads,
    filteredLostLeads,
    teamPerformanceOverrides,
    t.employeeRoles,
    language,
  ]);

  // 5. SALES REPORTS DATA
  const salesStats = useMemo(() => {
    const convRate =
      filteredLeads.length > 0
        ? Math.round((filteredWonLeads.length / filteredLeads.length) * 100)
        : 0;
    return {
      count: filteredWonLeads.length,
      convRate,
    };
  }, [filteredWonLeads, filteredLeads]);

  // 6. ADVERTISING SPEND & CPL DATA
  const adsStats = useMemo(() => {
    const campaignRows = adCampaigns
      .map((camp) => {
        const ratio = getOverlapRatio(camp.start_date, camp.end_date, bounds.from, bounds.to);
        if (ratio <= 0) return null;
        const spend = Math.round(camp.spend * ratio);
        const adLeads = Math.round(camp.leads * ratio);
        const qualified = Math.round(camp.qualified_leads * ratio);
        const visits = Math.round(camp.appointments * ratio);
        const cpl = adLeads > 0 ? Math.round(spend / adLeads) : 0;
        return {
          ...camp,
          periodSpend: spend,
          periodLeads: adLeads,
          periodQualified: qualified,
          periodAppointments: visits,
          periodCpl: cpl,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);

    const totalSpend = campaignRows.reduce((s, r) => s + r.periodSpend, 0);
    const totalAdLeads = campaignRows.reduce((s, r) => s + r.periodLeads, 0);
    const avgCpl = totalAdLeads > 0 ? Math.round(totalSpend / totalAdLeads) : 0;

    const crmAdLeads = filteredLeads.filter(
      (l) =>
        l.source === 'facebook_ads' ||
        l.source === 'instagram_ads' ||
        l.source === 'google_ads'
    ).length;

    let cplDeltaVsPrev: number | null = null;
    if (bounds.from && bounds.to) {
      const span = Math.max(diffDaysInclusive(bounds.from, bounds.to), 1);
      const prevEnd = addDaysIso(bounds.from, -1);
      const prevStart = addDaysIso(prevEnd, -(span - 1));
      let prevSpend = 0;
      let prevLeads = 0;
      adCampaigns.forEach((c) => {
        const r = getOverlapRatio(c.start_date, c.end_date, prevStart, prevEnd);
        if (r > 0) {
          prevSpend += Math.round(c.spend * r);
          prevLeads += Math.round(c.leads * r);
        }
      });
      if (prevLeads > 0 && avgCpl > 0) {
        const prevCpl = prevSpend / prevLeads;
        cplDeltaVsPrev = Math.round(((avgCpl - prevCpl) / prevCpl) * 100);
      }
    }

    return {
      campaignRows,
      totalSpend,
      totalAdLeads,
      avgCpl,
      crmAdLeads,
      cplDeltaVsPrev,
    };
  }, [adCampaigns, bounds, filteredLeads]);

  const startEditRow = (empId: string, currentFinancial: number) => {
    setEditingEmployeeId(empId);
    setFinancialInput(String(currentFinancial));
  };

  const saveEditRow = (empId: string) => {
    const parsed = Number(financialInput);
    if (!Number.isFinite(parsed) || parsed < 0) {
      pushToast({ type: 'warning', title: t.leads.form.validationBudget });
      return;
    }
    updateTeamPerformance(empId, {
      employee_id: empId,
      financial_performance: Math.round(parsed),
      updated_at: getTodayIso(),
    });
    setEditingEmployeeId(null);
  };

  const timePeriodButtons: { id: GlobalTimePeriod; label: string }[] = [
    { id: 'today', label: t.reports.timeFilter.today },
    { id: 'thisWeek', label: t.reports.timeFilter.thisWeek },
    { id: 'thisMonth', label: t.reports.timeFilter.thisMonth },
    { id: 'thisYear', label: t.reports.timeFilter.thisYear },
    { id: 'all', label: t.reports.timeFilter.all },
    { id: 'custom', label: t.reports.timeFilter.custom },
  ];

  const hasAnyOverride = Object.keys(teamPerformanceOverrides).length > 0;
  const pctOfTotal = (count: number) =>
    leadStats.total > 0 ? Math.round((count / leadStats.total) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Header & PDF Export */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-[20px] font-extrabold text-[#1F2937]">{t.reports.title}</h2>
          <p className="text-xs text-[#64748B] font-medium mt-0.5">{t.reports.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 no-print">
          <button
            type="button"
            onClick={triggerPrintPdfReport}
            className="h-9 px-4 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 btn-primary"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>{t.app.exportPdf}</span>
          </button>
        </div>
      </div>

      {/* Unified Global Time Filter Bar */}
      <div className="bg-white border border-[#E3EAE5] card-surface rounded-2xl p-4 space-y-3 no-print">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#1E293B] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-[#1F2937]">{t.reports.timeFilter.label}</div>
              <div className="text-[11px] font-mono-num font-semibold text-[#64748B]">
                {bounds.from || bounds.to
                  ? `${bounds.from ?? '…'} → ${bounds.to ?? '…'}`
                  : t.reports.timeFilter.all}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {timePeriodButtons.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTimePeriod(opt.id)}
                className={`h-8 px-3.5 rounded-xl text-xs font-bold border transition-all ${
                  timePeriod === opt.id
                    ? 'btn-primary border-transparent shadow-xs'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#1F2937] hover:bg-[#FFF7ED] hover:border-[#FDBA74] hover:text-[#C2410C]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {timePeriod === 'custom' && (
          <div className="pt-3 border-t border-[#E3EAE5] flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-[#1F2937]">{t.reports.timeFilter.from}</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="h-9 px-3 text-xs font-semibold font-mono-num border border-[#E3EAE5] rounded-xl bg-white text-[#1F2937] focus:outline-none focus:border-[#EA580C]"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-[#1F2937]">{t.reports.timeFilter.to}</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="h-9 px-3 text-xs font-semibold font-mono-num border border-[#E3EAE5] rounded-xl bg-white text-[#1F2937] focus:outline-none focus:border-[#EA580C]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Report Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white border border-[#E3EAE5] card-surface rounded-2xl no-print">
        {(['leads', 'appointments', 'properties', 'team', 'sales', 'ads'] as ReportTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab ? 'btn-primary' : 'text-[#1F2937] hover:bg-[#F5F7F5]'
            }`}
          >
            {t.reports.tabs[tab]}
          </button>
        ))}
      </div>

      {/* ================= 1. CLIENT REPORTS ================= */}
      {activeTab === 'leads' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard
              title={t.reports.leadsSection.totalLeads}
              value={leadStats.total}
              icon={<Users className="h-4 w-4" />}
              tone="navy"
            />
            <KpiCard
              title={t.reports.leadsSection.newLeads}
              value={leadStats.newLeads}
              icon={<UserCheck className="h-4 w-4" />}
              tone="orange"
            />
            <KpiCard
              title={t.reports.leadsSection.conversionRate}
              value={`${leadStats.convRate}%`}
              icon={<TrendingUp className="h-4 w-4" />}
              tone="emerald"
            />
          </div>

          {/* 4 Large Prominent Colorful Intent Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="rounded-2xl border-2 border-sky-300 bg-gradient-to-br from-sky-50 via-white to-sky-100/80 overflow-hidden shadow-xs hover:shadow-md transition-all">
              <div className="h-1.5 w-full bg-sky-600" />
              <div className="p-5 flex flex-col justify-between gap-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[14px] font-extrabold text-sky-950 leading-snug">
                    {t.reports.leadsSection.buyersCount}
                  </span>
                  <div className="h-10 w-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Home className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex items-end justify-between gap-2">
                  <span className="text-3xl font-extrabold font-mono-num text-sky-950 leading-none">
                    {leadStats.buyers}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-sky-600 text-white text-xs font-extrabold font-mono-num">
                    {pctOfTotal(leadStats.buyers)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-white to-amber-100/75 overflow-hidden shadow-xs hover:shadow-md transition-all">
              <div className="h-1.5 w-full bg-[#F59E0B]" />
              <div className="p-5 flex flex-col justify-between gap-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[14px] font-extrabold text-[#1F2937] leading-snug">
                    {t.reports.leadsSection.rentersCount}
                  </span>
                  <div className="h-10 w-10 rounded-xl bg-[#F59E0B] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <KeyRound className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex items-end justify-between gap-2">
                  <span className="text-3xl font-extrabold font-mono-num text-[#1F2937] leading-none">
                    {leadStats.renters}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#F59E0B] text-white text-xs font-extrabold font-mono-num">
                    {pctOfTotal(leadStats.renters)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-emerald-100/75 overflow-hidden shadow-xs hover:shadow-md transition-all">
              <div className="h-1.5 w-full bg-[#16966A]" />
              <div className="p-5 flex flex-col justify-between gap-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[14px] font-extrabold text-[#1F2937] leading-snug">
                    {t.reports.leadsSection.ownersSellCount}
                  </span>
                  <div className="h-10 w-10 rounded-xl bg-[#16966A] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Building2 className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex items-end justify-between gap-2">
                  <span className="text-3xl font-extrabold font-mono-num text-[#1F2937] leading-none">
                    {leadStats.ownersSell}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#16966A] text-white text-xs font-extrabold font-mono-num">
                    {pctOfTotal(leadStats.ownersSell)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-[#E3EAE5] bg-gradient-to-br from-[#F5F7F5] via-white to-[#ECFDF5] overflow-hidden shadow-xs hover:shadow-md transition-all">
              <div className="h-1.5 w-full bg-[#12352B]" />
              <div className="p-5 flex flex-col justify-between gap-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[14px] font-extrabold text-[#1F2937] leading-snug">
                    {t.reports.leadsSection.ownersRentOutCount}
                  </span>
                  <div className="h-10 w-10 rounded-xl bg-[#12352B] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Handshake className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex items-end justify-between gap-2">
                  <span className="text-3xl font-extrabold font-mono-num text-[#1F2937] leading-none">
                    {leadStats.ownersRentOut}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#12352B] text-white text-xs font-extrabold font-mono-num">
                    {pctOfTotal(leadStats.ownersRentOut)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {leadStats.total === 0 ? (
            <EmptyState
              icon={<Users className="h-6 w-6" />}
              title={t.reports.leadsSection.noLeadsInPeriod}
            />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {/* By Property Type */}
              <div className="bg-white border-2 border-[#FDBA74] card-surface rounded-2xl overflow-hidden">
                <div className="h-1.5 w-full bg-[#EA580C]" />
                <div className="px-5 py-4 bg-[#FFF7ED] border-b border-[#FFEDD5] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#EA580C]" />
                    <h3 className="text-[15px] font-extrabold text-[#1F2937]">
                      {t.reports.leadsSection.byPropertyType}
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#EA580C] text-white text-xs font-extrabold font-mono-num">
                    {leadStats.total}
                  </span>
                </div>
                <div className="p-6">
                  <DonutDistributionChart
                    size="lg"
                    slices={leadStats.byPropertyType.map((s) => ({
                      label: s.label,
                      value: s.value,
                      color: s.color,
                    }))}
                    centerValue={leadStats.total}
                    centerLabel={t.reports.leadsSection.totalLeads}
                  />
                </div>
              </div>

              {/* By Desired City */}
              <div className="bg-white border-2 border-[#BAE6FD] card-surface rounded-2xl overflow-hidden">
                <div className="h-1.5 w-full bg-[#0284C7]" />
                <div className="px-5 py-4 bg-[#F0F9FF] border-b border-[#E0F2FE] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#0284C7]" />
                    <h3 className="text-[15px] font-extrabold text-[#1F2937]">
                      {t.reports.leadsSection.byDesiredCity}
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#0284C7] text-white text-xs font-extrabold font-mono-num">
                    {leadStats.byDesiredCity.length}
                  </span>
                </div>
                <div className="p-6">
                  <DonutDistributionChart
                    size="lg"
                    slices={leadStats.byDesiredCity}
                    centerValue={leadStats.total}
                    centerLabel={t.reports.leadsSection.totalLeads}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= 2. APPOINTMENT REPORTS ================= */}
      {activeTab === 'appointments' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border-2 border-[#E3EAE5] bg-gradient-to-br from-[#F5F7F5] via-white to-[#ECFDF5] overflow-hidden shadow-xs">
              <div className="h-1.5 w-full bg-[#12352B]" />
              <div className="p-5 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-extrabold text-[#12352B]">
                    {t.reports.appointmentsSection.total}
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-[#12352B] text-white flex items-center justify-center shrink-0">
                    <Calendar className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold font-mono-num text-[#1F2937]">
                  {aptStats.total}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-sky-300 bg-gradient-to-br from-sky-50 via-white to-sky-100/90 overflow-hidden shadow-xs">
              <div className="h-1.5 w-full bg-sky-600" />
              <div className="p-5 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-extrabold text-sky-950">
                    {t.reports.appointmentsSection.completed}
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
                    <CalendarCheck2 className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold font-mono-num text-sky-950">
                  {aptStats.completed}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-emerald-100/90 overflow-hidden shadow-xs">
              <div className="h-1.5 w-full bg-emerald-600" />
              <div className="p-5 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-extrabold text-emerald-950">
                    {t.reports.appointmentsSection.attendanceRate}
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold font-mono-num text-emerald-800">
                  {aptStats.attendanceRate}%
                </div>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-rose-300 bg-gradient-to-br from-rose-50 via-white to-rose-100/90 overflow-hidden shadow-xs">
              <div className="h-1.5 w-full bg-rose-600" />
              <div className="p-5 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-extrabold text-rose-950">
                    {t.reports.appointmentsSection.absenceRate}
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                    <UserX className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold font-mono-num text-rose-800">
                  {aptStats.absenceRate}%
                </div>
              </div>
            </div>
          </div>

          <div className="bg-sky-50 border-2 border-sky-200 rounded-xl px-4 py-3 flex items-start gap-2.5 text-xs text-sky-950 font-semibold">
            <AlertCircle className="h-4 w-4 text-sky-700 shrink-0 mt-0.5" />
            <span>
              {t.reports.appointmentsSection.pendingExcludedNote}{' '}
              <strong className="font-mono-num font-extrabold">({aptStats.pendingOrExcluded})</strong>
            </span>
          </div>

          {aptStats.completed === 0 ? (
            <EmptyState
              icon={<CalendarCheck2 className="h-6 w-6" />}
              title={t.reports.appointmentsSection.noCompletedVisits}
            />
          ) : (
            <div className="bg-white border-2 border-[#BAE6FD] card-surface rounded-2xl overflow-hidden shadow-sm">
              <div className="h-1.5 w-full bg-[#0EA5E9]" />
              <div className="px-6 py-4 bg-[#F0F9FF] border-b border-[#E0F2FE] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="h-3 w-3 rounded-full bg-[#0EA5E9]" />
                  <h3 className="text-[15px] font-extrabold text-[#1F2937]">
                    {t.reports.appointmentsSection.outcomeBreakdown}
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-lg bg-[#0EA5E9] text-white text-xs font-extrabold font-mono-num">
                  {t.reports.appointmentsSection.completed}: {aptStats.completed}
                </span>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7">
                  <DonutDistributionChart
                    size="lg"
                    slices={[
                      {
                        label: t.reports.appointmentsSection.closedDealsFromVisits,
                        value: aptStats.attendedWonCount,
                        color: '#EA580C',
                        sublabel: `${t.reports.appointmentsSection.closingRate}: ${aptStats.closingRate}%`,
                      },
                      {
                        label: t.reports.appointmentsSection.attendedNoDeal,
                        value: aptStats.attendedNoDealCount,
                        color: '#0284C7',
                        sublabel: `${t.reports.appointmentsSection.attendanceRate}: ${aptStats.attendanceRate}%`,
                      },
                      {
                        label: t.reports.appointmentsSection.noShowLabel,
                        value: aptStats.noShowCount,
                        color: '#EF4444',
                        sublabel: `${t.reports.appointmentsSection.absenceRate}: ${aptStats.absenceRate}%`,
                      },
                    ]}
                    centerValue={`${aptStats.attendanceRate}%`}
                    centerLabel={t.reports.appointmentsSection.attendanceRate}
                  />
                </div>

                {/* Clear Colorful Breakdown Cards */}
                <div className="lg:col-span-5 space-y-3.5">
                  <div className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-l from-emerald-50 to-emerald-100/70 p-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[13px] font-extrabold text-emerald-950">
                        {t.reports.appointmentsSection.attendanceRate}
                      </div>
                      <div className="text-xs font-bold font-mono-num text-emerald-800 mt-1">
                        {aptStats.attendedCount} / {aptStats.completed}
                      </div>
                    </div>
                    <div className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xl font-extrabold font-mono-num shadow-xs">
                      {aptStats.attendanceRate}%
                    </div>
                  </div>

                  <div className="rounded-2xl border-2 border-rose-300 bg-gradient-to-l from-rose-50 to-rose-100/70 p-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[13px] font-extrabold text-rose-950">
                        {t.reports.appointmentsSection.absenceRate}
                      </div>
                      <div className="text-xs font-bold font-mono-num text-rose-800 mt-1">
                        {aptStats.noShowCount} / {aptStats.completed}
                      </div>
                    </div>
                    <div className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xl font-extrabold font-mono-num shadow-xs">
                      {aptStats.absenceRate}%
                    </div>
                  </div>

                  <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-l from-amber-50 to-amber-100/70 p-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[13px] font-extrabold text-amber-950">
                        {t.reports.appointmentsSection.closingRate}
                      </div>
                      <div className="text-xs font-bold font-mono-num text-amber-800 mt-1">
                        {aptStats.attendedWonCount} / {aptStats.completed}
                      </div>
                    </div>
                    <div className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white text-xl font-extrabold font-mono-num shadow-xs">
                      {aptStats.closingRate}%
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-300 bg-zinc-100/80 px-4 py-3 flex items-center justify-between text-xs text-zinc-800 font-semibold">
                    <span>{t.reports.appointmentsSection.pendingExcludedLabel}</span>
                    <span className="font-extrabold font-mono-num text-sm text-zinc-950">
                      {aptStats.pendingOrExcluded}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= 3. PROPERTY REPORTS ================= */}
      {activeTab === 'properties' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-emerald-100/90 overflow-hidden shadow-xs">
              <div className="h-1.5 w-full bg-emerald-600" />
              <div className="p-5 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-extrabold text-emerald-950">
                    {t.reports.propertiesSection.available}
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Building2 className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold font-mono-num text-emerald-900">
                  {propStats.available}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-sky-300 bg-gradient-to-br from-sky-50 via-white to-sky-100/90 overflow-hidden shadow-xs">
              <div className="h-1.5 w-full bg-sky-600" />
              <div className="p-5 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-extrabold text-sky-950">
                    {t.reports.propertiesSection.sold}
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold font-mono-num text-sky-900">
                  {propStats.sold}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-white to-amber-100/80 overflow-hidden shadow-xs">
              <div className="h-1.5 w-full bg-[#F59E0B]" />
              <div className="p-5 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-extrabold text-[#1F2937]">
                    {t.reports.propertiesSection.rented}
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-[#F59E0B] text-white flex items-center justify-center shrink-0">
                    <KeyRound className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold font-mono-num text-[#1F2937]">
                  {propStats.rented}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 via-white to-indigo-100/90 overflow-hidden shadow-xs">
              <div className="h-1.5 w-full bg-indigo-600" />
              <div className="p-5 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-extrabold text-indigo-950">
                    {t.reports.propertiesSection.activeDemandCount}
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Target className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold font-mono-num text-indigo-900">
                  {propStats.totalDemand}
                </div>
              </div>
            </div>
          </div>

          {propStats.demandByType.length === 0 ? (
            <EmptyState
              icon={<Building2 className="h-6 w-6" />}
              title={t.reports.propertiesSection.noDemandInPeriod}
            />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
              {/* Most Requested Property Types Chart */}
              <div className="xl:col-span-5 bg-white border-2 border-[#FDBA74] card-surface rounded-2xl overflow-hidden shadow-xs">
                <div className="h-1.5 w-full bg-[#EA580C]" />
                <div className="px-5 py-4 bg-[#FFF7ED] border-b border-[#FFEDD5] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#EA580C]" />
                    <h3 className="text-[15px] font-extrabold text-[#1F2937]">
                      {t.reports.propertiesSection.mostRequestedTypes}
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#EA580C] text-white text-xs font-extrabold font-mono-num">
                    {propStats.totalDemand}
                  </span>
                </div>
                <div className="p-5">
                  <HorizontalBarChart
                    items={propStats.demandByType.map((d) => ({
                      label: d.label,
                      value: d.count,
                      color: d.color,
                    }))}
                  />
                </div>
              </div>

              {/* Requested Areas & Budgets Analysis Table */}
              <div className="xl:col-span-7 bg-white border-2 border-[#CBD5E1] card-surface rounded-2xl overflow-hidden shadow-xs">
                <div className="h-1.5 w-full bg-[#0284C7]" />
                <div className="px-5 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#0284C7]" />
                    <h3 className="text-[15px] font-extrabold text-[#1F2937]">
                      {t.reports.propertiesSection.mostRequestedTableTitle}
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#0284C7] text-white text-xs font-extrabold font-mono-num md:hidden">
                    {propStats.demandByType.length}
                  </span>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-xs text-start border-collapse">
                    <thead>
                      <tr className="bg-[#1E293B] text-white border-b-2 border-[#EA580C] font-extrabold whitespace-nowrap">
                        <th className="py-3.5 px-4 text-start border-e border-white/15">
                          {t.leads.columns.propertyType}
                        </th>
                        <th className="py-3.5 px-4 text-start border-e border-white/15">
                          {t.reports.propertiesSection.demandCount}
                        </th>
                        <th className="py-3.5 px-4 text-start border-e border-white/15">
                          {t.reports.propertiesSection.mostRequestedArea}
                        </th>
                        <th className="py-3.5 px-4 text-start border-e border-white/15">
                          {t.reports.propertiesSection.areaRange}
                        </th>
                        <th className="py-3.5 px-4 text-start border-e border-white/15">
                          {t.reports.propertiesSection.mostRequestedBudget}
                        </th>
                        <th className="py-3.5 px-4 text-start">
                          {t.reports.propertiesSection.budgetRange}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {propStats.demandByType.map((row, idx) => (
                        <tr
                          key={row.type}
                          className={idx % 2 === 0 ? 'bg-white hover:bg-[#FFF7ED]' : 'bg-[#F8FAFC] hover:bg-[#FFF7ED]'}
                        >
                          <td className="py-3.5 px-4 whitespace-nowrap border-e border-[#E2E8F0]">
                            <span
                              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg font-extrabold text-white text-xs shadow-2xs"
                              style={{ backgroundColor: row.color }}
                            >
                              {row.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono-num border-e border-[#E2E8F0]">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-sky-50 border border-sky-200 text-[#0369A1] font-extrabold text-sm">
                              {row.count}
                            </span>
                            {row.count === 1 && (
                              <span className="block text-[10px] font-bold text-amber-700 mt-1">
                                {t.reports.propertiesSection.singleSample}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono-num whitespace-nowrap border-e border-[#E2E8F0]">
                            {row.mostArea > 0 ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 font-extrabold text-[13px]">
                                {row.mostArea} {t.app.sqm}
                              </span>
                            ) : (
                              <span className="text-[#64748B] font-semibold">
                                {t.reports.propertiesSection.insufficientData}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono-num font-bold text-[#1F2937] whitespace-nowrap border-e border-[#E2E8F0]">
                            {row.count <= 1
                              ? row.minArea > 0
                                ? `${row.minArea} ${t.app.sqm}`
                                : '—'
                              : `${row.minArea} – ${row.maxArea} ${t.app.sqm}`}
                          </td>
                          <td className="py-3.5 px-4 font-mono-num whitespace-nowrap border-e border-[#E2E8F0]">
                            {row.mostBudget > 0 ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-[#FFF7ED] border border-[#FDBA74] text-[#C2410C] font-extrabold text-[13px]">
                                {formatMAD(row.mostBudget, language)}
                              </span>
                            ) : (
                              <span className="text-[#64748B] font-semibold">
                                {t.reports.propertiesSection.insufficientData}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono-num font-bold text-[#1F2937] whitespace-nowrap">
                            {row.count <= 1
                              ? row.minBudget > 0
                                ? formatMAD(row.minBudget, language)
                                : '—'
                              : `${formatMAD(row.minBudget, language)} – ${formatMAD(row.maxBudget, language)}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Responsive Demand Cards (No Horizontal Scroll) */}
                <div className="grid grid-cols-1 gap-3 p-4 md:hidden">
                  {propStats.demandByType.map((row) => (
                    <div
                      key={row.type}
                      className="rounded-xl border-2 border-[#E2E8F0] bg-white p-3.5 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#E2E8F0]">
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-[#64748B] block mb-1">
                            {t.leads.columns.propertyType}
                          </span>
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-extrabold text-white text-xs shadow-2xs"
                            style={{ backgroundColor: row.color }}
                          >
                            {row.label}
                          </span>
                        </div>
                        <div className="text-end shrink-0">
                          <span className="text-[10px] font-bold text-[#64748B] block mb-1">
                            {t.reports.propertiesSection.demandCount}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-sky-50 border border-sky-200 text-[#0369A1] font-extrabold text-sm font-mono-num">
                            {row.count}
                          </span>
                        </div>
                      </div>

                      {row.count === 1 && (
                        <div className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                          {t.reports.propertiesSection.singleSample}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                        <div className="rounded-xl bg-indigo-50/70 border border-indigo-200 p-2.5">
                          <span className="text-[11px] font-bold text-indigo-950 block mb-1">
                            {t.reports.propertiesSection.mostRequestedArea}
                          </span>
                          {row.mostArea > 0 ? (
                            <span className="font-extrabold text-sm font-mono-num text-indigo-900">
                              {row.mostArea} {t.app.sqm}
                            </span>
                          ) : (
                            <span className="text-[#64748B] font-semibold">
                              {t.reports.propertiesSection.insufficientData}
                            </span>
                          )}
                        </div>

                        <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-2.5">
                          <span className="text-[11px] font-bold text-[#64748B] block mb-1">
                            {t.reports.propertiesSection.areaRange}
                          </span>
                          <span className="font-extrabold text-sm font-mono-num text-[#1F2937]">
                            {row.count <= 1
                              ? row.minArea > 0
                                ? `${row.minArea} ${t.app.sqm}`
                                : '—'
                              : `${row.minArea} – ${row.maxArea} ${t.app.sqm}`}
                          </span>
                        </div>

                        <div className="rounded-xl bg-[#FFF7ED] border border-[#FDBA74] p-2.5">
                          <span className="text-[11px] font-bold text-[#C2410C] block mb-1">
                            {t.reports.propertiesSection.mostRequestedBudget}
                          </span>
                          {row.mostBudget > 0 ? (
                            <span className="font-extrabold text-sm font-mono-num text-[#C2410C]">
                              {formatMAD(row.mostBudget, language)}
                            </span>
                          ) : (
                            <span className="text-[#64748B] font-semibold">
                              {t.reports.propertiesSection.insufficientData}
                            </span>
                          )}
                        </div>

                        <div className="rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] p-2.5">
                          <span className="text-[11px] font-bold text-[#0369A1] block mb-1">
                            {t.reports.propertiesSection.budgetRange}
                          </span>
                          <span className="font-extrabold text-xs font-mono-num text-[#1F2937] break-words">
                            {row.count <= 1
                              ? row.minBudget > 0
                                ? formatMAD(row.minBudget, language)
                                : '—'
                              : `${formatMAD(row.minBudget, language)} – ${formatMAD(row.maxBudget, language)}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= 4. TEAM PERFORMANCE REPORT ================= */}
      {activeTab === 'team' && (
        <div className="space-y-5">
          <div className="bg-amber-50/90 border-2 border-amber-200 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-950">
            <div className="flex items-center gap-2 font-bold">
              <Lock className="h-4 w-4 text-amber-700 shrink-0" />
              <span>{t.reports.teamSection.editMetricsHint}</span>
            </div>
            {hasAnyOverride && (
              <button
                type="button"
                onClick={() => resetTeamPerformance()}
                className="h-8 px-3 rounded-lg bg-white border border-amber-300 text-amber-900 font-bold inline-flex items-center gap-1.5 hover:bg-amber-100"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{t.reports.teamSection.resetOverrides}</span>
              </button>
            )}
          </div>

          {/* Desktop Prominent High-Contrast Table */}
          <div className="hidden md:block bg-white border-2 border-[#CBD5E1] card-surface rounded-2xl overflow-hidden shadow-md">
            <div className="h-1.5 w-full bg-[#EA580C]" />
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="h-3 w-3 rounded-full bg-[#EA580C]" />
                <h3 className="text-[15px] font-extrabold text-[#1F2937]">
                  {t.reports.tabs.team}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-lg bg-[#EA580C] text-white text-xs font-extrabold font-mono-num">
                {teamRows.length}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-start border-collapse">
                <thead>
                  <tr className="bg-[#1E293B] text-white border-b-2 border-[#EA580C] text-[13px] font-extrabold whitespace-nowrap">
                    <th className="py-4 px-4 text-start border-e border-white/15">
                      {t.reports.teamSection.employee}
                    </th>
                    <th className="py-4 px-3.5 text-center border-e border-white/15">
                      {t.reports.teamSection.leadsHandled}
                    </th>
                    <th className="py-4 px-3.5 text-center border-e border-white/15">
                      {t.reports.teamSection.appointments}
                    </th>
                    <th className="py-4 px-3.5 text-center border-e border-white/15">
                      {t.reports.teamSection.visitsCompleted}
                    </th>
                    <th className="py-4 px-3.5 text-center border-e border-white/15">
                      {t.reports.teamSection.successfulDeals}
                    </th>
                    <th className="py-4 px-3.5 text-center border-e border-white/15">
                      {t.reports.teamSection.lostDeals}
                    </th>
                    <th className="py-4 px-3.5 text-center border-e border-white/15">
                      {t.reports.teamSection.conversionRate}
                    </th>
                    <th className="py-4 px-4 text-start border-e border-white/15">
                      {t.reports.teamSection.financialPerformance}
                    </th>
                    <th className="py-4 px-4 text-end">{t.app.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {teamRows.map((row, idx) => {
                    const isEditing = editingEmployeeId === row.id;
                    return (
                      <tr
                        key={row.id}
                        className={idx % 2 === 0 ? 'bg-white hover:bg-[#FFF7ED]' : 'bg-[#F8FAFC] hover:bg-[#FFF7ED]'}
                      >
                        <td className="py-4 px-4 border-e border-[#E2E8F0]">
                          <div className="font-extrabold text-[14px] text-[#1F2937]">{row.name}</div>
                          <div className="text-xs font-semibold text-[#64748B] flex items-center gap-1.5 mt-0.5">
                            <span>{row.role}</span>
                            {row.hasManualFinancial && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold">
                                {t.reports.teamSection.manualOverrideBadge}
                              </span>
                            )}
                          </div>
                        </td>
                        <td
                          className="py-4 px-3.5 text-center font-mono-num text-[15px] font-extrabold text-[#1F2937] border-e border-[#E2E8F0]"
                          title={t.reports.teamSection.autoComputedBadge}
                        >
                          {row.leadsHandled}
                        </td>
                        <td
                          className="py-4 px-3.5 text-center font-mono-num text-[15px] font-bold text-[#1F2937] border-e border-[#E2E8F0]"
                          title={t.reports.teamSection.autoComputedBadge}
                        >
                          {row.appointmentsCount}
                        </td>
                        <td
                          className="py-4 px-3.5 text-center font-mono-num border-e border-[#E2E8F0]"
                          title={t.reports.teamSection.autoComputedBadge}
                        >
                          <span className="inline-flex items-center justify-center min-w-[34px] px-2 py-0.5 rounded-lg bg-sky-50 border border-sky-200 text-[15px] font-extrabold text-sky-900">
                            {row.visitsCompleted}
                          </span>
                        </td>
                        <td
                          className="py-4 px-3.5 text-center font-mono-num border-e border-[#E2E8F0]"
                          title={t.reports.teamSection.autoComputedBadge}
                        >
                          <span className="inline-flex items-center justify-center min-w-[34px] px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-[15px] font-extrabold text-indigo-800">
                            {row.successfulDeals}
                          </span>
                        </td>
                        <td
                          className="py-4 px-3.5 text-center font-mono-num border-e border-[#E2E8F0]"
                          title={t.reports.teamSection.autoComputedBadge}
                        >
                          <span className="inline-flex items-center justify-center min-w-[34px] px-2 py-0.5 rounded-lg bg-rose-50 border border-rose-200 text-[15px] font-extrabold text-rose-800">
                            {row.lostDeals}
                          </span>
                        </td>
                        <td
                          className="py-4 px-3.5 text-center font-mono-num border-e border-[#E2E8F0]"
                          title={t.reports.teamSection.autoComputedBadge}
                        >
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#0284C7] text-white text-xs font-extrabold shadow-2xs">
                            {row.conversionRate}%
                          </span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap border-e border-[#E2E8F0]">
                          {isEditing ? (
                            <input
                              type="number"
                              min={0}
                              step={1000}
                              value={financialInput}
                              onChange={(e) => setFinancialInput(e.target.value)}
                              className="w-40 h-9 px-3 text-sm font-extrabold font-mono-num border-2 border-[#EA580C] rounded-lg bg-white text-[#1F2937] focus:outline-none"
                            />
                          ) : (
                            <div>
                              <div className="font-mono-num text-[15px] font-extrabold text-[#C2410C]">
                                {formatMAD(row.financialPerformance, language)}
                              </div>
                              {row.hasManualFinancial && (
                                <div className="text-[11px] text-[#64748B] font-semibold font-mono-num">
                                  ({formatMAD(row.computedFinancial, language)})
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-end whitespace-nowrap">
                          {isEditing ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => saveEditRow(row.id)}
                                className="h-8 px-3 rounded-lg btn-primary text-xs font-bold inline-flex items-center gap-1"
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span>{t.app.save}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingEmployeeId(null)}
                                className="h-8 px-2.5 rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC]"
                                title={t.app.cancel}
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => startEditRow(row.id, row.financialPerformance)}
                                title={t.reports.teamSection.financialOverrideLabel}
                                className="h-8 px-3 rounded-lg btn-outline text-xs font-bold inline-flex items-center gap-1"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                                <span>{t.app.edit}</span>
                              </button>
                              {row.hasManualFinancial && (
                                <button
                                  type="button"
                                  onClick={() => resetTeamPerformance(row.id)}
                                  title={t.reports.teamSection.resetOverrides}
                                  className="h-8 w-8 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 inline-flex items-center justify-center"
                                >
                                  <RotateCcw className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Responsive Team Cards */}
          <div className="grid grid-cols-1 gap-3.5 md:hidden">
            {teamRows.map((row) => {
              const isEditing = editingEmployeeId === row.id;
              return (
                <div
                  key={row.id}
                  className="bg-white border-2 border-[#E2E8F0] card-surface rounded-2xl overflow-hidden shadow-xs"
                >
                  <div className="h-1.5 w-full bg-[#EA580C]" />
                  <div className="p-4 space-y-3.5">
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-[#64748B] block">
                          {t.reports.teamSection.employee}
                        </span>
                        <div className="text-sm font-extrabold text-[#1F2937] truncate">{row.name}</div>
                        <div className="text-xs font-semibold text-[#64748B] flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span>{row.role}</span>
                          {row.hasManualFinancial && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold">
                              {t.reports.teamSection.manualOverrideBadge}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-end shrink-0">
                        <span className="text-[10px] font-bold text-[#64748B] block mb-0.5">
                          {t.reports.teamSection.conversionRate}
                        </span>
                        <span className="inline-flex px-2.5 py-1 rounded-lg bg-[#0284C7] text-white text-xs font-extrabold font-mono-num">
                          {row.conversionRate}%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2.5">
                        <span className="text-[11px] font-bold text-[#64748B] block">
                          {t.reports.teamSection.leadsHandled}
                        </span>
                        <span className="font-extrabold text-base font-mono-num text-[#1F2937]">
                          {row.leadsHandled}
                        </span>
                      </div>
                      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2.5">
                        <span className="text-[11px] font-bold text-[#64748B] block">
                          {t.reports.teamSection.appointments}
                        </span>
                        <span className="font-extrabold text-base font-mono-num text-[#1F2937]">
                          {row.appointmentsCount}
                        </span>
                      </div>
                      <div className="bg-sky-50 border border-sky-200 rounded-xl p-2.5">
                        <span className="text-[11px] font-bold text-sky-900 block">
                          {t.reports.teamSection.visitsCompleted}
                        </span>
                        <span className="font-extrabold text-base font-mono-num text-sky-950">
                          {row.visitsCompleted}
                        </span>
                      </div>
                      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-2.5">
                        <span className="text-[11px] font-bold text-indigo-900 block">
                          {t.reports.teamSection.successfulDeals}
                        </span>
                        <span className="font-extrabold text-base font-mono-num text-indigo-950">
                          {row.successfulDeals}
                        </span>
                      </div>
                      <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5">
                        <span className="text-[11px] font-bold text-rose-900 block">
                          {t.reports.teamSection.lostDeals}
                        </span>
                        <span className="font-extrabold text-base font-mono-num text-rose-950">
                          {row.lostDeals}
                        </span>
                      </div>
                      <div className="col-span-2 sm:col-span-1 bg-[#FFF7ED] border border-[#FDBA74] rounded-xl p-2.5">
                        <span className="text-[11px] font-bold text-[#C2410C] block">
                          {t.reports.teamSection.financialPerformance}
                        </span>
                        <span className="font-extrabold font-mono-num text-[#C2410C] text-sm block mt-0.5">
                          {formatMAD(row.financialPerformance, language)}
                        </span>
                        {row.hasManualFinancial && (
                          <span className="text-[10px] text-[#64748B] font-semibold font-mono-num block mt-0.5">
                            ({formatMAD(row.computedFinancial, language)})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                      {isEditing ? (
                        <div className="flex items-center gap-2 w-full">
                          <input
                            type="number"
                            min={0}
                            step={1000}
                            value={financialInput}
                            onChange={(e) => setFinancialInput(e.target.value)}
                            className="flex-1 h-9 px-3 text-xs font-bold font-mono-num border-2 border-[#EA580C] rounded-lg text-[#1F2937]"
                          />
                          <button
                            type="button"
                            onClick={() => saveEditRow(row.id)}
                            className="h-9 px-3 rounded-lg btn-primary text-xs font-bold"
                          >
                            {t.app.save}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingEmployeeId(null)}
                            className="h-9 px-2.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#1F2937]"
                          >
                            {t.app.cancel}
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEditRow(row.id, row.financialPerformance)}
                            className="h-8 px-3 rounded-lg btn-outline text-xs font-bold inline-flex items-center gap-1.5"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>{t.reports.teamSection.financialOverrideLabel}</span>
                          </button>
                          {row.hasManualFinancial && (
                            <button
                              type="button"
                              onClick={() => resetTeamPerformance(row.id)}
                              title={t.reports.teamSection.resetOverrides}
                              className="h-8 px-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold inline-flex items-center justify-center"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= 5. SALES REPORTS ================= */}
      {activeTab === 'sales' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="rounded-2xl border-2 border-[#E3EAE5] bg-gradient-to-br from-[#F5F7F5] via-white to-[#ECFDF5] overflow-hidden shadow-xs">
              <div className="h-1.5 w-full bg-[#12352B]" />
              <div className="p-6 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-extrabold text-[#12352B]">
                    {t.reports.salesSection.successfulTransactions}
                  </div>
                  <div className="mt-3 text-4xl font-extrabold font-mono-num text-[#1F2937]">
                    {salesStats.count}
                  </div>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-[#12352B] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-[#A7F3D0] bg-gradient-to-br from-[#ECFDF5] via-white to-emerald-100/80 overflow-hidden shadow-xs">
              <div className="h-1.5 w-full bg-[#16966A]" />
              <div className="p-6 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-extrabold text-[#12352B]">
                    {t.reports.salesSection.conversionRate}
                  </div>
                  <div className="mt-3 text-4xl font-extrabold font-mono-num text-[#16966A]">
                    {salesStats.convRate}%
                  </div>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-[#16966A] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>

          {salesStats.count === 0 && (
            <EmptyState
              icon={<CheckCircle2 className="h-6 w-6" />}
              title={t.reports.salesSection.noClosedDealsInPeriod}
            />
          )}
        </div>
      )}

      {/* ================= 6. AD SPEND & COST PER LEAD REPORTS ================= */}
      {activeTab === 'ads' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title={t.reports.adsSection.totalSpend}
              value={formatMAD(adsStats.totalSpend, language)}
              icon={<DollarSign className="h-4 w-4" />}
              tone="navy"
            />
            <KpiCard
              title={t.reports.adsSection.adLeads}
              value={adsStats.totalAdLeads}
              icon={<Users className="h-4 w-4" />}
              tone="orange"
            />
            <KpiCard
              title={t.reports.adsSection.cpl}
              value={formatMAD(adsStats.avgCpl, language)}
              icon={<Target className="h-4 w-4" />}
              tone="sky"
            />
            <KpiCard
              title={t.reports.adsSection.crmAdLeads}
              value={adsStats.crmAdLeads}
              icon={<Megaphone className="h-4 w-4" />}
              tone="emerald"
            />
          </div>

          {adsStats.cplDeltaVsPrev !== null && (
            <div className="bg-white border-2 border-zinc-200 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-extrabold text-zinc-900">{t.reports.adsSection.vsPreviousLabel}</span>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg font-extrabold font-mono-num border ${
                  adsStats.cplDeltaVsPrev <= 0
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-rose-50 border-rose-300 text-rose-800'
                }`}
              >
                {adsStats.cplDeltaVsPrev <= 0 ? (
                  <TrendingDown className="h-3.5 w-3.5" />
                ) : (
                  <TrendingUp className="h-3.5 w-3.5" />
                )}
                {adsStats.cplDeltaVsPrev > 0 ? '+' : ''}
                {adsStats.cplDeltaVsPrev}%
              </span>
            </div>
          )}

          {adsStats.campaignRows.length === 0 ? (
            <EmptyState
              icon={<Megaphone className="h-6 w-6" />}
              title={t.reports.adsSection.noAdDataInPeriod}
            />
          ) : (
            <div className="bg-white border-2 border-[#CBD5E1] card-surface rounded-2xl overflow-hidden shadow-md">
              <div className="h-1.5 w-full bg-[#0284C7]" />
              <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="h-3 w-3 rounded-full bg-[#0284C7]" />
                  <h3 className="text-[15px] font-extrabold text-[#1F2937]">
                    {t.reports.adsSection.campaignBreakdown}
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-lg bg-[#0284C7] text-white text-xs font-extrabold font-mono-num">
                  {adsStats.campaignRows.length}
                </span>
              </div>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-start border-collapse">
                  <thead>
                    <tr className="bg-[#1E293B] text-white border-b-2 border-[#EA580C] text-[13px] font-extrabold whitespace-nowrap">
                      <th className="py-4 px-5 text-start border-e border-white/15">
                        {t.ads.table.campaignName}
                      </th>
                      <th className="py-4 px-4 text-start border-e border-white/15">
                        {t.ads.table.platform}
                      </th>
                      <th className="py-4 px-4 text-start border-e border-white/15">
                        {t.ads.table.spend}
                      </th>
                      <th className="py-4 px-4 text-center border-e border-white/15">
                        {t.ads.table.leads}
                      </th>
                      <th className="py-4 px-4 text-center border-e border-white/15">
                        {t.ads.table.appointments}
                      </th>
                      <th className="py-4 px-4 text-start border-e border-white/15">
                        {t.ads.table.cpl}
                      </th>
                      <th className="py-4 px-5 text-start">{t.ads.table.status}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {adsStats.campaignRows.map((camp, idx) => (
                      <tr
                        key={camp.id}
                        className={idx % 2 === 0 ? 'bg-white hover:bg-[#FFF7ED]' : 'bg-[#F8FAFC] hover:bg-[#FFF7ED]'}
                      >
                        <td className="py-4 px-5 font-extrabold text-[14px] text-[#1F2937] border-e border-[#E2E8F0]">
                          {localizeCampaignName(camp.name, language)}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap font-bold text-[#1F2937] border-e border-[#E2E8F0]">
                          {t.adPlatforms[camp.platform]}
                        </td>
                        <td className="py-4 px-4 font-mono-num text-[15px] font-extrabold text-[#1F2937] whitespace-nowrap border-e border-[#E2E8F0]">
                          {formatMAD(camp.periodSpend, language)}
                        </td>
                        <td className="py-4 px-4 text-center font-mono-num border-e border-[#E2E8F0]">
                          <span className="inline-flex items-center justify-center min-w-[40px] px-2.5 py-0.5 rounded-lg bg-[#FFF7ED] border border-[#FDBA74] text-[15px] font-extrabold text-[#C2410C]">
                            {camp.periodLeads}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center font-mono-num border-e border-[#E2E8F0]">
                          <span className="inline-flex items-center justify-center min-w-[40px] px-2.5 py-0.5 rounded-lg bg-sky-50 border border-sky-200 text-[15px] font-extrabold text-[#0284C7]">
                            {camp.periodAppointments}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono-num whitespace-nowrap border-e border-[#E2E8F0]">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-[#F0F9FF] border border-[#BAE6FD] text-[15px] font-extrabold text-[#0369A1]">
                            {formatMAD(camp.periodCpl, language)}
                          </span>
                        </td>
                        <td className="py-4 px-5 whitespace-nowrap">
                          <StatusLabel
                            label={t.ads.campaignStatuses[camp.status]}
                            tone={
                              camp.status === 'active'
                                ? 'success'
                                : camp.status === 'paused'
                                  ? 'warning'
                                  : 'neutral'
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Responsive Campaign Cards (No Horizontal Scroll) */}
              <div className="grid grid-cols-1 gap-3 p-4 md:hidden">
                {adsStats.campaignRows.map((camp) => (
                  <div
                    key={camp.id}
                    className="rounded-xl border-2 border-[#E2E8F0] bg-white p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#E2E8F0]">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-[#64748B] block">
                          {t.ads.table.campaignName}
                        </span>
                        <h4 className="text-sm font-extrabold text-[#1F2937]">
                          {localizeCampaignName(camp.name, language)}
                        </h4>
                        <div className="text-xs font-semibold text-[#64748B] mt-0.5">
                          {t.ads.table.platform}: <span className="text-[#1F2937]">{t.adPlatforms[camp.platform]}</span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <StatusLabel
                          label={t.ads.campaignStatuses[camp.status]}
                          tone={
                            camp.status === 'active'
                              ? 'success'
                              : camp.status === 'paused'
                                ? 'warning'
                                : 'neutral'
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-2.5">
                        <span className="text-[11px] font-bold text-[#64748B] block">
                          {t.ads.table.spend}
                        </span>
                        <span className="font-extrabold text-sm font-mono-num text-[#1F2937] mt-0.5 block">
                          {formatMAD(camp.periodSpend, language)}
                        </span>
                      </div>
                      <div className="rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] p-2.5">
                        <span className="text-[11px] font-bold text-[#0369A1] block">
                          {t.ads.table.cpl}
                        </span>
                        <span className="font-extrabold text-sm font-mono-num text-[#0369A1] mt-0.5 block">
                          {formatMAD(camp.periodCpl, language)}
                        </span>
                      </div>
                      <div className="rounded-xl bg-[#FFF7ED] border border-[#FDBA74] p-2.5">
                        <span className="text-[11px] font-bold text-[#C2410C] block">
                          {t.ads.table.leads}
                        </span>
                        <span className="font-extrabold text-base font-mono-num text-[#C2410C] mt-0.5 block">
                          {camp.periodLeads}
                        </span>
                      </div>
                      <div className="rounded-xl bg-sky-50 border border-sky-200 p-2.5">
                        <span className="text-[11px] font-bold text-sky-900 block">
                          {t.ads.table.appointments}
                        </span>
                        <span className="font-extrabold text-base font-mono-num text-[#0284C7] mt-0.5 block">
                          {camp.periodAppointments}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
