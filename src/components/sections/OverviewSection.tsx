import React, { useMemo, useState } from 'react';
import {
  Building2,
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  FileBarChart2,
  Handshake,
  House,
  KeyRound,
  Plus,
  UserCheck,
  UserPlus,
  Users,
  UserX,
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import {
  localizeActivityAction,
  localizeActivityTarget,
  localizeCity,
  localizeNotification,
  localizePersonName,
  localizePropertyTitle,
  localizeRelativeTime,
} from '../../i18n/localizeData';
import { formatMAD, formatNumber } from '../../i18n/translations';
import { LeadSource } from '../../types/domain';
import { getDateRangeBounds, getTodayIso, isIsoDateInRange } from '../../utils/dateUtils';
import { computeLeadScore } from '../../utils/leadScoring';
import {
  AreaTrendChart,
  BarComparisonChart,
  ConversionFunnelChart,
  DonutDistributionChart,
} from '../ui/Charts';
import { Avatar, KpiCard, LeadScoreBadge, SafeImage, StatusLabel } from '../ui/DataPrimitives';

type DatePreset = 'today' | 'last7' | 'last30' | 'thisMonth' | 'custom';

export const OverviewSection: React.FC = () => {
  const {
    t,
    language,
    leads,
    properties,
    appointments,
    conversations,
    employees,
    notifications,
    setActiveSection,
    openLeadProfile,
    openPropertyDetails,
    setQuickModal,
    markNotificationRead,
  } = useAgency();

  const todayIso = getTodayIso();
  const [datePreset, setDatePreset] = useState<DatePreset>('last30');
  const [customFrom, setCustomFrom] = useState('2026-10-23');
  const [customTo, setCustomTo] = useState(todayIso);

  const bounds = useMemo(
    () => getDateRangeBounds(datePreset, customFrom, customTo),
    [datePreset, customFrom, customTo]
  );

  const filteredLeads = useMemo(
    () => leads.filter((l) => isIsoDateInRange(l.created_at, bounds.from, bounds.to)),
    [leads, bounds]
  );

  const filteredAppointments = useMemo(
    () => appointments.filter((a) => isIsoDateInRange(a.date, bounds.from, bounds.to)),
    [appointments, bounds]
  );

  const activePropertiesCount = properties.filter(
    (p) => p.status === 'available' || p.status === 'reserved'
  ).length;
  const rentInterestedCount = filteredLeads.filter((l) => l.transaction_type === 'rent').length;
  const buyInterestedCount = filteredLeads.filter((l) => l.transaction_type === 'sale').length;
  const sellerLeadsCount = filteredLeads.filter((l) => l.transaction_type === 'sell').length;
  const ownersRentingOutCount = filteredLeads.filter(
    (l) => l.transaction_type === 'rent_out'
  ).length;

  const newLeadsCount = filteredLeads.filter((l) => l.status === 'new').length;
  const totalLeadsDisplay = filteredLeads.length;
  const scheduledVisitsCount = filteredAppointments.filter(
    (a) => a.status === 'scheduled' || a.status === 'confirmed'
  ).length;
  const attendedCount = filteredAppointments.filter((a) => a.status === 'attended').length;
  const noShowCount = filteredAppointments.filter((a) => a.status === 'no_show').length;
  const completedVisitsCount = attendedCount + noShowCount;
  const dealsWonCount = leads.filter(
    (l) =>
      l.status === 'closed_won' &&
      isIsoDateInRange(l.closed_date ?? l.last_interaction ?? l.created_at, bounds.from, bounds.to)
  ).length;

  // Real acquisition trend grouped by date across filtered leads (or recent buckets)
  const acquisitionSeries = useMemo(() => {
    const countsByDate: Record<string, number> = {};
    filteredLeads.forEach((l) => {
      countsByDate[l.created_at] = (countsByDate[l.created_at] ?? 0) + 1;
    });
    const sortedDates = Object.keys(countsByDate).sort();
    if (!sortedDates.length) {
      return [{ label: todayIso.slice(5), value: 0 }];
    }
    const recent = sortedDates.slice(-8);
    const locale = language === 'ar' ? 'ar-MA-u-nu-latn' : language === 'fr' ? 'fr-MA' : 'en-GB';
    return recent.map((iso) => {
      const d = new Date(`${iso}T12:00:00`);
      const label = new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short' }).format(d);
      return { label, value: countsByDate[iso] };
    });
  }, [filteredLeads, language, todayIso]);

  // Real weekly breakdown of scheduled vs completed visits from filteredAppointments
  const visitsWeeklySeries = useMemo(() => {
    const labels =
      language === 'ar'
        ? ['الأسبوع 1', 'الأسبوع 2', 'الأسبوع 3', 'الأسبوع 4']
        : language === 'fr'
          ? ['Sem. 1', 'Sem. 2', 'Sem. 3', 'Sem. 4']
          : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const buckets = [
      { scheduled: 0, completed: 0 },
      { scheduled: 0, completed: 0 },
      { scheduled: 0, completed: 0 },
      { scheduled: 0, completed: 0 },
    ];
    filteredAppointments.forEach((a) => {
      const dayOfMonth = Number(a.date.slice(8, 10)) || 1;
      const idx = Math.min(3, Math.floor((dayOfMonth - 1) / 8));
      if (a.status === 'scheduled' || a.status === 'confirmed' || a.status === 'rescheduled') {
        buckets[idx].scheduled += 1;
      } else if (a.status === 'attended' || a.status === 'no_show') {
        buckets[idx].completed += 1;
      }
    });
    return labels.map((label, i) => ({
      label,
      value: buckets[i].scheduled,
      secondaryValue: buckets[i].completed,
    }));
  }, [filteredAppointments, language]);

  // Real monthly comparison (last 3 months from CRM leads)
  const monthlySeries = useMemo(() => {
    const monthKeys = ['2026-09', '2026-10', '2026-11'];
    const labels =
      language === 'ar'
        ? ['شتنبر 2026', 'أكتوبر 2026', 'نوفمبر 2026']
        : language === 'fr'
          ? ['Sept 2026', 'Oct 2026', 'Nov 2026']
          : ['Sep 2026', 'Oct 2026', 'Nov 2026'];

    return monthKeys.map((ym, i) => {
      const monthLeads = leads.filter((l) => l.created_at.startsWith(ym)).length;
      const monthDeals = leads.filter(
        (l) =>
          l.status === 'closed_won' &&
          (l.closed_date ?? l.last_interaction ?? l.created_at).startsWith(ym)
      ).length;
      return {
        label: labels[i],
        value: monthLeads,
        secondaryValue: monthDeals,
      };
    });
  }, [leads, language]);

  const sourceCounts = useMemo(() => {
    const palette: Record<LeadSource, string> = {
      facebook_ads: '#12352B',
      instagram_ads: '#16966A',
      google_ads: '#0EA5E9',
      whatsapp: '#10B981',
      website: '#64748B',
      referral: '#F59E0B',
      walk_in: '#1B4335',
    };
    const grouped: Partial<Record<LeadSource, number>> = {};
    filteredLeads.forEach((l) => {
      grouped[l.source] = (grouped[l.source] ?? 0) + 1;
    });
    return (Object.keys(grouped) as LeadSource[]).map((src) => ({
      label: t.leadSources[src],
      value: grouped[src] ?? 0,
      color: palette[src],
    }));
  }, [filteredLeads, t.leadSources]);

  const funnelStages = useMemo(
    () => [
      { label: t.leadStatuses.new, count: filteredLeads.length, color: '#12352B' },
      {
        label: t.leadStatuses.visit_scheduled,
        count: filteredLeads.filter(
          (l) => !['new', 'not_interested', 'closed_lost'].includes(l.status)
        ).length,
        color: '#1B4335',
      },
      {
        label: t.leadStatuses.visited,
        count: filteredLeads.filter((l) =>
          ['visited', 'follow_up', 'closed_won'].includes(l.status)
        ).length,
        color: '#16966A',
      },
      {
        label: t.leadStatuses.follow_up,
        count: filteredLeads.filter((l) => ['follow_up', 'closed_won'].includes(l.status)).length,
        color: '#F59E0B',
      },
      {
        label: t.leadStatuses.closed_won,
        count: filteredLeads.filter((l) => l.status === 'closed_won').length,
        color: '#10B981',
      },
    ],
    [filteredLeads, t.leadStatuses]
  );

  const upcomingAppointments = useMemo(
    () =>
      appointments
        .filter((a) => (a.status === 'scheduled' || a.status === 'confirmed') && a.date >= todayIso)
        .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
        .slice(0, 4),
    [appointments, todayIso]
  );

  const topProperties = useMemo(
    () => [...properties].sort((a, b) => b.views - a.views).slice(0, 4),
    [properties]
  );

  const recentActivities = useMemo(
    () =>
      employees
        .flatMap((e) =>
          e.recent_activities.map((act) => ({
            ...act,
            employeeName: e.name,
            employeeAvatar: e.avatar,
          }))
        )
        .slice(0, 5),
    [employees]
  );

  const attendancePct =
    completedVisitsCount > 0 ? Math.round((attendedCount / completedVisitsCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header & Date Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-[20px] font-extrabold text-[#1F2937]">{t.overview.title}</h2>
          <p className="text-xs text-[#64748B] font-semibold mt-0.5">{t.overview.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-white border border-[#E3EAE5] rounded-2xl card-surface">
            {(['today', 'last7', 'last30', 'thisMonth', 'custom'] as DatePreset[]).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setDatePreset(preset)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  datePreset === preset ? 'btn-primary' : 'text-[#1F2937] hover:bg-[#F5F7F5]'
                }`}
              >
                {t.overview.dateFilters[preset]}
              </button>
            ))}
          </div>

          {datePreset === 'custom' && (
            <div className="flex items-center gap-2 bg-white border border-[#E3EAE5] rounded-xl px-2.5 py-1.5 text-xs card-surface">
              <span className="text-[#64748B] font-semibold">{t.overview.fromDate}</span>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="font-mono-num font-bold text-[#1F2937] focus:outline-none"
              />
              <span className="text-[#64748B]">–</span>
              <span className="text-[#64748B] font-semibold">{t.overview.toDate}</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="font-mono-num font-bold text-[#1F2937] focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Executive KPI Cards (12 Cards including distinct 4 lead categories) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <KpiCard
          title={t.overview.kpis.totalLeads}
          value={formatNumber(totalLeadsDisplay, language)}
          icon={<Users className="h-4 w-4" />}
          tone="navy"
        />
        <KpiCard
          title={t.overview.kpis.newLeads}
          value={formatNumber(newLeadsCount, language)}
          icon={<UserPlus className="h-4 w-4" />}
          tone="orange"
        />
        <KpiCard
          title={t.overview.kpis.scheduledVisits}
          value={formatNumber(scheduledVisitsCount, language)}
          icon={<CalendarClock className="h-4 w-4" />}
          tone="sky"
        />
        <KpiCard
          title={t.overview.kpis.completedVisits}
          value={formatNumber(completedVisitsCount, language)}
          icon={<CalendarCheck2 className="h-4 w-4" />}
          tone="teal"
        />
        <KpiCard
          title={t.overview.kpis.attendedClients}
          value={formatNumber(attendedCount, language)}
          icon={<UserCheck className="h-4 w-4" />}
          tone="emerald"
        />
        <KpiCard
          title={t.overview.kpis.noShowClients}
          value={formatNumber(noShowCount, language)}
          icon={<UserX className="h-4 w-4" />}
          tone="rose"
        />
        <KpiCard
          title={t.overview.kpis.successfulDeals}
          value={formatNumber(dealsWonCount, language)}
          icon={<Handshake className="h-4 w-4" />}
          tone="amber"
        />
        <KpiCard
          title={t.overview.kpis.activeProperties}
          value={formatNumber(activePropertiesCount, language)}
          icon={<Building2 className="h-4 w-4" />}
          tone="indigo"
        />
        <KpiCard
          title={
            language === 'ar'
              ? 'الراغبون في الشراء'
              : language === 'fr'
                ? 'Candidats à l’achat'
                : 'Prospective Buyers'
          }
          value={formatNumber(buyInterestedCount, language)}
          icon={<House className="h-4 w-4" />}
          tone="sky"
        />
        <KpiCard
          title={
            language === 'ar'
              ? 'الراغبون في الكراء'
              : language === 'fr'
                ? 'Candidats à la location'
                : 'Prospective Tenants'
          }
          value={formatNumber(rentInterestedCount, language)}
          icon={<KeyRound className="h-4 w-4" />}
          tone="orange"
        />
        <KpiCard
          title={
            language === 'ar'
              ? 'ملاك يرغبون في البيع'
              : language === 'fr'
                ? 'Propriétaires vendeurs'
                : 'Owners Selling'
          }
          value={formatNumber(sellerLeadsCount, language)}
          icon={<Building2 className="h-4 w-4" />}
          tone="emerald"
        />
        <KpiCard
          title={t.overview.kpis.ownersRentingOut}
          value={formatNumber(ownersRentingOutCount, language)}
          icon={<KeyRound className="h-4 w-4" />}
          tone="teal"
        />
      </div>

      {/* Quick Actions Strip */}
      <div className="bg-white border border-[#E3EAE5] card-surface rounded-[20px] p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="font-display text-sm font-extrabold text-[#1F2937]">
          {t.overview.widgets.quickActions}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setQuickModal('lead')}
            className="h-9 px-4 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 btn-primary"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{t.overview.widgets.newLeadBtn}</span>
          </button>
          <button
            type="button"
            onClick={() => setQuickModal('property')}
            className="h-9 px-4 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 btn-accent"
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>{t.overview.widgets.newPropertyBtn}</span>
          </button>
          <button
            type="button"
            onClick={() => setQuickModal('appointment')}
            className="h-9 px-4 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 btn-secondary"
          >
            <CalendarClock className="h-3.5 w-3.5" />
            <span>{t.overview.widgets.newAppointmentBtn}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('reports')}
            className="h-9 px-4 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 btn-outline"
          >
            <FileBarChart2 className="h-3.5 w-3.5 text-[#16966A]" />
            <span>{t.overview.widgets.openReportsBtn}</span>
          </button>
        </div>
      </div>

      {/* 6 Charts & Analytics Driven by Real CRM Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Customer Acquisition Over Time */}
        <div className="bg-white border border-[#E3EAE5] card-surface rounded-[20px] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E3EAE5]">
            <h3 className="text-[15px] font-extrabold text-[#1F2937]">
              {t.overview.charts.acquisitionTitle}
            </h3>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">{t.overview.charts.acquisitionSub}</p>
          </div>
          <div className="p-6">
            <AreaTrendChart data={acquisitionSeries} primaryLabel={t.overview.charts.leadsLabel} />
          </div>
        </div>

        {/* 2. Appointments & Property Visits */}
        <div className="bg-white border border-[#E3EAE5] card-surface rounded-[20px] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E3EAE5]">
            <h3 className="text-[15px] font-extrabold text-[#1F2937]">
              {t.overview.charts.visitsTitle}
            </h3>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">{t.overview.charts.visitsSub}</p>
          </div>
          <div className="p-6">
            <BarComparisonChart
              data={visitsWeeklySeries}
              primaryLabel={t.overview.charts.scheduled}
              secondaryLabel={t.overview.charts.completed}
            />
          </div>
        </div>

        {/* 3. Attendance vs Absence */}
        <div className="bg-white border border-[#E3EAE5] card-surface rounded-[20px] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E3EAE5]">
            <h3 className="text-[15px] font-extrabold text-[#1F2937]">
              {t.overview.charts.attendanceTitle}
            </h3>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">{t.overview.charts.attendanceSub}</p>
          </div>
          <div className="p-6">
            <DonutDistributionChart
              slices={[
                { label: t.overview.charts.attended, value: attendedCount, color: '#10B981' },
                { label: t.overview.charts.absent, value: noShowCount, color: '#EF4444' },
              ]}
              centerValue={`${attendancePct}%`}
              centerLabel={t.overview.charts.attended}
            />
          </div>
        </div>

        {/* 4. Sales Conversion Funnel */}
        <div className="bg-white border border-[#E3EAE5] card-surface rounded-[20px] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E3EAE5]">
            <h3 className="text-[15px] font-extrabold text-[#1F2937]">
              {t.overview.charts.funnelTitle}
            </h3>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">{t.overview.charts.funnelSub}</p>
          </div>
          <div className="p-6">
            <ConversionFunnelChart stages={funnelStages} />
          </div>
        </div>

        {/* 5. Lead Sources Distribution */}
        <div className="bg-white border border-[#E3EAE5] card-surface rounded-[20px] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E3EAE5]">
            <h3 className="text-[15px] font-extrabold text-[#1F2937]">
              {t.overview.charts.sourcesTitle}
            </h3>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">{t.overview.charts.sourcesSub}</p>
          </div>
          <div className="p-6">
            {sourceCounts.length > 0 ? (
              <DonutDistributionChart
                slices={sourceCounts}
                centerValue={filteredLeads.length}
                centerLabel={t.overview.charts.leadsLabel}
              />
            ) : (
              <div className="py-10 text-center text-xs font-semibold text-[#64748B]">
                {t.app.noData}
              </div>
            )}
          </div>
        </div>

        {/* 6. Monthly Performance Overview */}
        <div className="bg-white border border-[#E3EAE5] card-surface rounded-[20px] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E3EAE5]">
            <h3 className="text-[15px] font-extrabold text-[#1F2937]">
              {t.overview.charts.monthlyTitle}
            </h3>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">{t.overview.charts.monthlySub}</p>
          </div>
          <div className="p-6">
            <BarComparisonChart
              data={monthlySeries}
              primaryLabel={t.overview.charts.leadsLabel}
              secondaryLabel={t.overview.charts.dealsLabel}
            />
          </div>
        </div>
      </div>

      {/* Operational Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Upcoming Appointments */}
        <div className="bg-white border border-[#E3EAE5] card-surface rounded-[20px] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3EAE5]">
            <h3 className="text-[15px] font-extrabold text-[#1F2937]">
              {t.overview.widgets.upcomingAppointments}
            </h3>
            <button
              type="button"
              onClick={() => setActiveSection('appointments')}
              className="px-3 py-1 rounded-lg text-[11px] font-bold btn-outline"
            >
              {t.app.viewAll}
            </button>
          </div>
          <div className="divide-y divide-[#E3EAE5]">
            {upcomingAppointments.map((apt) => {
              const lead = leads.find((l) => l.id === apt.lead_id);
              const prop = properties.find((p) => p.id === apt.property_id);
              return (
                <div
                  key={apt.id}
                  className="px-6 py-3.5 flex items-center justify-between gap-3 hover:bg-[#F5F7F5] transition-colors"
                >
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => lead && openLeadProfile(lead.id)}
                      className="text-xs font-bold text-[#1F2937] hover:underline truncate block"
                    >
                      {lead ? localizePersonName(lead.name, language) : '—'}
                    </button>
                    <div className="text-[11px] text-[#64748B] font-medium mt-0.5 truncate">
                      {prop ? localizePropertyTitle(prop.title, language) : '—'} ·{' '}
                      <span className="font-mono-num font-bold text-[#1F2937]">
                        {apt.date} {apt.time}
                      </span>
                    </div>
                  </div>
                  <StatusLabel
                    label={t.appointmentStatuses[apt.status]}
                    appointmentStatus={apt.status}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Latest Leads */}
        <div className="bg-white border border-[#E3EAE5] card-surface rounded-[20px] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3EAE5]">
            <h3 className="text-[15px] font-extrabold text-[#1F2937]">
              {t.overview.widgets.latestLeads}
            </h3>
            <button
              type="button"
              onClick={() => setActiveSection('leads')}
              className="px-3 py-1 rounded-lg text-[11px] font-bold btn-outline"
            >
              {t.app.viewAll}
            </button>
          </div>
          <div className="divide-y divide-[#E3EAE5]">
            {leads.slice(0, 4).map((lead) => {
              const scoreInfo = computeLeadScore(lead, appointments, conversations);
              return (
                <button
                  key={lead.id}
                  type="button"
                  onClick={() => openLeadProfile(lead.id)}
                  className="w-full text-start px-6 py-3.5 flex items-center justify-between gap-3 hover:bg-[#F5F7F5] transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#1F2937] truncate">
                      {localizePersonName(lead.name, language)}
                    </div>
                    <div className="text-[11px] text-[#64748B] font-medium mt-0.5">
                      {localizeCity(lead.city, language)} · {t.propertyTypes[lead.property_type]} ·{' '}
                      <span className="font-mono-num font-bold text-[#1F2937]">
                        {formatMAD(lead.budget, language)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <LeadScoreBadge
                      score={scoreInfo.score}
                      tier={scoreInfo.tier}
                      tierLabel={t.leads.scoring.tiers[scoreInfo.tier]}
                      compact
                    />
                    <StatusLabel label={t.leadStatuses[lead.status]} leadStatus={lead.status} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Best-Performing Properties */}
        <div className="bg-white border border-[#E3EAE5] card-surface rounded-[20px] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3EAE5]">
            <h3 className="text-[15px] font-extrabold text-[#1F2937]">
              {t.overview.widgets.topProperties}
            </h3>
            <button
              type="button"
              onClick={() => setActiveSection('properties')}
              className="px-3 py-1 rounded-lg text-[11px] font-bold btn-outline"
            >
              {t.app.viewAll}
            </button>
          </div>
          <div className="divide-y divide-[#E3EAE5]">
            {topProperties.map((prop) => {
              const inquiries = leads.filter((l) => l.interested_property_id === prop.id).length;
              return (
                <button
                  key={prop.id}
                  type="button"
                  onClick={() => openPropertyDetails(prop.id)}
                  className="w-full text-start px-6 py-3.5 flex items-center gap-3 hover:bg-[#F5F7F5] transition-colors"
                >
                  <SafeImage
                    src={prop.images[0]}
                    alt={localizePropertyTitle(prop.title, language)}
                    className="h-12 w-16 rounded-xl object-cover shrink-0 border border-[#E3EAE5]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[#1F2937] truncate">
                      {localizePropertyTitle(prop.title, language)}
                    </div>
                    <div className="text-[11px] text-[#64748B] font-medium mt-0.5 tabular-nums">
                      {localizeCity(prop.city, language)} · {prop.views} {t.overview.widgets.viewsCount} ·{' '}
                      {inquiries} {t.overview.widgets.inquiriesCount}
                    </div>
                  </div>
                  <div className="text-xs font-extrabold text-[#16966A] font-mono-num shrink-0">
                    {formatMAD(prop.price, language)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Team Activity & Important Notifications */}
        <div className="bg-white border border-[#E3EAE5] card-surface rounded-[20px] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3EAE5]">
            <h3 className="text-[15px] font-extrabold text-[#1F2937]">
              {t.overview.widgets.recentActivity}
            </h3>
            <button
              type="button"
              onClick={() => setActiveSection('team')}
              className="px-3 py-1 rounded-lg text-[11px] font-bold btn-outline"
            >
              {t.app.viewAll}
            </button>
          </div>
          <div className="divide-y divide-[#E3EAE5]">
            {recentActivities.slice(0, 3).map((act) => (
              <div key={act.id} className="px-6 py-3 flex items-center gap-3">
                <Avatar
                  name={localizePersonName(act.employeeName, language)}
                  src={act.employeeAvatar}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-[#1F2937] truncate">
                    <span className="font-bold">{localizePersonName(act.employeeName, language)}</span> —{' '}
                    {localizeActivityAction(act.action, language)}
                  </div>
                  <div className="text-[11px] text-[#64748B] font-medium truncate">
                    {localizeActivityTarget(act.target, language)} ·{' '}
                    {localizeRelativeTime(act.timestamp, language)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between px-6 py-3 border-y border-[#E3EAE5] bg-[#F5F7F5]">
            <span className="font-display text-xs font-extrabold text-[#1F2937]">
              {t.overview.widgets.importantNotifications}
            </span>
            <button
              type="button"
              onClick={() => setActiveSection('notifications')}
              className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold btn-outline"
            >
              {t.app.viewAll}
            </button>
          </div>
          <div className="divide-y divide-[#E3EAE5]">
            {notifications.slice(0, 2).map((n) => {
              const loc = localizeNotification(n.id, n.title, n.message, language);
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    markNotificationRead(n.id);
                    setActiveSection(n.related_section);
                  }}
                  className="w-full text-start px-6 py-3 flex items-center justify-between gap-2 hover:bg-[#F5F7F5] transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                    <span className="text-xs font-semibold text-[#1F2937] truncate">{loc.message}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-[#64748B] shrink-0">
                    {localizeRelativeTime(n.timestamp, language)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
