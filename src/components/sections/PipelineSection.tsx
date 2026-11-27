import React, { useMemo, useState } from 'react';
import {
  Building2,
  CalendarPlus,
  Coins,
  CreditCard,
  Eye,
  Handshake,
  MapPin,
  MessageSquarePlus,
  Phone,
  Search,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  UserCheck,
  Wallet,
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { MOROCCAN_CITIES } from '../../data/demoData';
import {
  localizeCity,
  localizePersonName,
  localizePropertyTitle,
  matchesLocalizedQuery,
} from '../../i18n/localizeData';
import { formatMAD, formatShortDate } from '../../i18n/translations';
import { Lead, LeadClassification, LeadStatus } from '../../types/domain';
import { getTodayIso } from '../../utils/dateUtils';
import {
  computeLeadScore,
  isLeadNeedingFollowup,
  LeadScoreResult,
  LeadScoreTier,
} from '../../utils/leadScoring';
import {
  ClassificationBadge,
  ContactMethodBadge,
  KpiCard,
  LeadScoreBadge,
  Modal,
} from '../ui/DataPrimitives';

type PipelineTab = 'all' | 'sale' | 'rent' | 'sell' | 'rent_out';
type SmartPreset =
  | 'all'
  | 'high_score'
  | 'hot_vip'
  | 'cash_buyers'
  | 'needs_followup'
  | 'closing_soon';
type PipelineSortBy = 'default' | 'score_desc' | 'budget_desc' | 'recent';

const PIPELINE_STAGES: {
  status: LeadStatus;
  key: keyof typeof stageStyles;
}[] = [
  { status: 'new', key: 'new' },
  { status: 'visit_scheduled', key: 'visit_scheduled' },
  { status: 'visited', key: 'visited' },
  { status: 'no_show', key: 'no_show' },
  { status: 'follow_up', key: 'follow_up' },
  { status: 'closed_won', key: 'closed_won' },
  { status: 'closed_lost', key: 'closed_lost' },
];

const stageStyles = {
  new: {
    column: 'bg-[#F0F9FF] border-[#BAE6FD]',
    headerBg: 'bg-[#E0F2FE] border-[#BAE6FD]',
    topBar: 'bg-[#0EA5E9]',
    dot: 'bg-[#0EA5E9]',
    badge: 'bg-[#0EA5E9] text-white',
    cardHover: 'hover:border-[#0EA5E9]/60',
  },
  visit_scheduled: {
    column: 'bg-[#F0FDF7] border-[#A7F3D0]',
    headerBg: 'bg-[#ECFDF5] border-[#A7F3D0]',
    topBar: 'bg-[#16966A]',
    dot: 'bg-[#16966A]',
    badge: 'bg-[#16966A] text-white',
    cardHover: 'hover:border-[#16966A]/60',
  },
  visited: {
    column: 'bg-[#F2FBFB] border-[#B4E0DE]',
    headerBg: 'bg-[#E1F5F4] border-[#B4E0DE]',
    topBar: 'bg-[#117A57]',
    dot: 'bg-[#117A57]',
    badge: 'bg-[#117A57] text-white',
    cardHover: 'hover:border-[#117A57]/60',
  },
  no_show: {
    column: 'bg-[#FEF2F2] border-[#FECACA]',
    headerBg: 'bg-[#FEE2E2] border-[#FECACA]',
    topBar: 'bg-[#EF4444]',
    dot: 'bg-[#EF4444]',
    badge: 'bg-[#EF4444] text-white',
    cardHover: 'hover:border-[#EF4444]/60',
  },
  follow_up: {
    column: 'bg-[#FFFBEB] border-[#FDE68A]',
    headerBg: 'bg-[#FEF3C7]/85 border-[#FDE68A]',
    topBar: 'bg-[#F59E0B]',
    dot: 'bg-[#F59E0B]',
    badge: 'bg-[#F59E0B] text-white',
    cardHover: 'hover:border-[#F59E0B]/60',
  },
  closed_won: {
    column: 'bg-[#ECFDF5] border-[#A7F3D0]',
    headerBg: 'bg-[#D1FAE5] border-[#A7F3D0]',
    topBar: 'bg-[#10B981]',
    dot: 'bg-[#10B981]',
    badge: 'bg-[#10B981] text-white',
    cardHover: 'hover:border-[#10B981]/60',
  },
  closed_lost: {
    column: 'bg-[#F5F7F5] border-[#E3EAE5]',
    headerBg: 'bg-[#EDF1EE] border-[#E3EAE5]',
    topBar: 'bg-[#64748B]',
    dot: 'bg-[#64748B]',
    badge: 'bg-[#64748B] text-white',
    cardHover: 'hover:border-[#64748B]/60',
  },
};

export const PipelineSection: React.FC = () => {
  const {
    t,
    language,
    leads,
    properties,
    employees,
    appointments,
    conversations,
    updateLead,
    addLeadNote,
    openLeadProfile,
    setPreselectedLeadForApt,
    setQuickModal,
  } = useAgency();

  const todayIso = getTodayIso();
  const [pipelineTab, setPipelineTab] = useState<PipelineTab>('all');
  const [smartPreset, setSmartPreset] = useState<SmartPreset>('all');
  const [search, setSearch] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState<PipelineSortBy>('default');
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<LeadStatus | null>(null);
  const [noteTargetLead, setNoteTargetLead] = useState<Lead | null>(null);
  const [quickNoteText, setQuickNoteText] = useState('');

  const saleCount = useMemo(() => leads.filter((l) => l.transaction_type === 'sale').length, [leads]);
  const rentCount = useMemo(() => leads.filter((l) => l.transaction_type === 'rent').length, [leads]);
  const sellCount = useMemo(() => leads.filter((l) => l.transaction_type === 'sell').length, [leads]);
  const rentOutCount = useMemo(() => leads.filter((l) => l.transaction_type === 'rent_out').length, [leads]);

  const leadScoresMap = useMemo(() => {
    const map: Record<string, LeadScoreResult> = {};
    leads.forEach((l) => {
      map[l.id] = computeLeadScore(l, appointments, conversations);
    });
    return map;
  }, [leads, appointments, conversations]);

  const matchesSmartPreset = (lead: Lead, preset: SmartPreset): boolean => {
    const score = leadScoresMap[lead.id]?.score ?? 0;
    switch (preset) {
      case 'high_score':
        return score >= 80;
      case 'hot_vip':
        return lead.classification === 'vip' || lead.classification === 'hot';
      case 'cash_buyers':
        return (
          lead.payment_method === 'cash' &&
          (lead.transaction_type === 'sale' || lead.transaction_type === 'rent')
        );
      case 'needs_followup':
        return isLeadNeedingFollowup(lead, todayIso);
      case 'closing_soon':
        return (
          !['closed_won', 'closed_lost', 'not_interested'].includes(lead.status) &&
          (lead.status === 'visited' || lead.status === 'follow_up') &&
          (score >= 65 || lead.purchase_timing === 'immediate')
        );
      case 'all':
      default:
        return true;
    }
  };

  const tabScopedLeads = useMemo(
    () => (pipelineTab === 'all' ? leads : leads.filter((l) => l.transaction_type === pipelineTab)),
    [leads, pipelineTab]
  );

  const presetCounts = useMemo(() => {
    const presets: SmartPreset[] = [
      'all',
      'high_score',
      'hot_vip',
      'cash_buyers',
      'needs_followup',
      'closing_soon',
    ];
    const counts: Record<SmartPreset, number> = {
      all: 0,
      high_score: 0,
      hot_vip: 0,
      cash_buyers: 0,
      needs_followup: 0,
      closing_soon: 0,
    };
    presets.forEach((p) => {
      counts[p] = tabScopedLeads.filter((l) => matchesSmartPreset(l, p)).length;
    });
    return counts;
  }, [tabScopedLeads, leadScoresMap, todayIso]);

  const filteredLeads = useMemo(() => {
    const q = search.trim();
    return tabScopedLeads.filter((l) => {
      if (!matchesSmartPreset(l, smartPreset)) return false;
      if (employeeFilter !== 'all' && l.assigned_employee_id !== employeeFilter) return false;
      if (cityFilter !== 'all' && l.city !== cityFilter) return false;
      if (classFilter !== 'all' && l.classification !== classFilter) return false;
      if (scoreFilter !== 'all' && leadScoresMap[l.id]?.tier !== scoreFilter) return false;
      if (dateFilter && l.created_at < dateFilter) return false;
      if (q) {
        const prop = properties.find((p) => p.id === l.interested_property_id);
        if (!matchesLocalizedQuery(q, language, [l.name, l.phone, l.city, l.district, prop?.title])) {
          return false;
        }
      }
      return true;
    });
  }, [
    tabScopedLeads,
    properties,
    language,
    smartPreset,
    search,
    employeeFilter,
    cityFilter,
    classFilter,
    scoreFilter,
    dateFilter,
    leadScoresMap,
    todayIso,
  ]);

  const hasActiveSmartFilters = Boolean(
    smartPreset !== 'all' ||
      search.trim() ||
      employeeFilter !== 'all' ||
      cityFilter !== 'all' ||
      classFilter !== 'all' ||
      scoreFilter !== 'all' ||
      dateFilter ||
      sortBy !== 'default'
  );

  const resetSmartFilters = () => {
    setSmartPreset('all');
    setSearch('');
    setEmployeeFilter('all');
    setCityFilter('all');
    setClassFilter('all');
    setScoreFilter('all');
    setDateFilter('');
    setSortBy('default');
  };

  const conversionRate = useMemo(() => {
    if (!filteredLeads.length) return 0;
    const won = filteredLeads.filter((l) => l.status === 'closed_won').length;
    return Math.round((won / filteredLeads.length) * 100);
  }, [filteredLeads]);

  const attendanceRate = useMemo(() => {
    const visited = filteredLeads.filter((l) => ['visited', 'follow_up', 'closed_won'].includes(l.status)).length;
    const noShow = filteredLeads.filter((l) => l.status === 'no_show').length;
    if (visited + noShow === 0) return 100;
    return Math.round((visited / (visited + noShow)) * 100);
  }, [filteredLeads]);

  const avgBudget = useMemo(() => {
    if (!filteredLeads.length) return 0;
    return Math.round(filteredLeads.reduce((s, l) => s + l.budget, 0) / filteredLeads.length);
  }, [filteredLeads]);

  const handleDrop = (stageStatus: LeadStatus) => {
    if (draggedLeadId) {
      const target = leads.find((l) => l.id === draggedLeadId);
      if (target && target.status !== stageStatus) {
        updateLead(draggedLeadId, { status: stageStatus });
      }
    }
    setDraggedLeadId(null);
    setDragOverStage(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-[19px] font-bold text-[#1F2937]">{t.pipeline.title}</h2>
          <p className="text-xs text-zinc-700 font-medium mt-0.5">{t.pipeline.subtitle}</p>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-[11px] font-bold text-[#1F2937] card-surface self-start sm:self-auto">
          {t.pipeline.dragHint}
        </span>
      </div>

      {/* 4 Lead Categories Pipeline Tabs */}
      <div className="flex flex-wrap items-center gap-2.5">
        {(
          [
            { id: 'all', label: t.pipeline.tabs.all, count: leads.length, activeClass: 'btn-primary' },
            { id: 'sale', label: t.pipeline.tabs.sale, count: saleCount, activeClass: 'btn-accent' },
            { id: 'rent', label: t.pipeline.tabs.rent, count: rentCount, activeClass: 'bg-[#7C3AED] text-white border-[#6D28D9] shadow-sm' },
            { id: 'sell', label: t.leads.tabs.sellers, count: sellCount, activeClass: 'bg-[#D97706] text-white border-[#B45309] shadow-sm' },
            { id: 'rent_out', label: t.leads.tabs.landlordsRent, count: rentOutCount, activeClass: 'bg-[#1E293B] text-white border-[#0F172A] shadow-sm' },
          ] as const
        ).map((tab) => {
          const isActive = pipelineTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPipelineTab(tab.id)}
              className={`h-10 px-4 rounded-xl text-xs font-bold inline-flex items-center gap-2.5 border transition-all ${
                isActive ? tab.activeClass : 'btn-outline'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-mono-num font-bold ${
                  isActive ? 'bg-white/25 text-white' : 'bg-zinc-100 text-zinc-950 border border-zinc-200'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Pipeline Performance Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <KpiCard
          title={t.pipeline.indicators.conversionRate}
          value={`${conversionRate}%`}
          icon={<Handshake className="h-4 w-4" />}
          tone="emerald"
        />
        <KpiCard
          title={t.pipeline.indicators.visitAttendanceRate}
          value={`${attendanceRate}%`}
          icon={<UserCheck className="h-4 w-4" />}
          tone="sky"
        />
      </div>

      {/* Smart Pipeline Filter */}
      <div className="bg-white border border-[#E3EAE5] card-surface rounded-2xl p-4 space-y-3.5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#16966A] inline-flex items-center justify-center shrink-0">
              <SlidersHorizontal className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-xs sm:text-[13px] font-extrabold text-[#1F2937]">
                {t.pipeline.smartFilter.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-[#12352B] text-xs font-extrabold font-mono-num">
              <span>{filteredLeads.length}</span>
              <span className="font-sans font-bold">{t.pipeline.smartFilter.matchingCount}</span>
            </span>
            {hasActiveSmartFilters && (
              <button
                type="button"
                onClick={resetSmartFilters}
                className="h-8 px-3 rounded-lg text-xs font-bold btn-secondary"
              >
                {t.app.reset}
              </button>
            )}
          </div>
        </div>

        {/* One-Click Smart Preset Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              'all',
              'high_score',
              'hot_vip',
              'cash_buyers',
              'needs_followup',
              'closing_soon',
            ] as SmartPreset[]
          ).map((preset) => {
            const active = smartPreset === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => setSmartPreset(preset)}
                className={`h-8 px-3 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border transition-all ${
                  active
                    ? 'bg-[#EA580C] text-white border-[#C2410C] shadow-xs'
                    : 'bg-[#F8FAFC] text-[#1F2937] border-[#E2E8F0] hover:border-[#EA580C]/60 hover:bg-[#FFF7ED]'
                }`}
              >
                {preset !== 'all' && <Sparkles className="h-3 w-3 shrink-0" />}
                <span>{t.pipeline.smartFilter.presets[preset]}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono-num font-extrabold ${
                    active
                      ? 'bg-white/25 text-white'
                      : 'bg-white border border-[#E3EAE5] text-[#1F2937]'
                  }`}
                >
                  {presetCounts[preset]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Multi-Criteria Controls & Smart Card Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="h-3.5 w-3.5 text-[#64748B] absolute top-1/2 -translate-y-1/2 start-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.app.search}
              className="w-full h-9 ps-8 pe-3 text-xs border border-[#E3EAE5] rounded-xl bg-[#F5F7F5] text-[#1F2937] focus:bg-white focus:border-[#16966A] focus:outline-none"
            />
          </div>

          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="h-9 px-3 text-xs font-semibold border border-[#E3EAE5] rounded-xl bg-white text-[#1F2937]"
          >
            <option value="all">{t.leads.filters.allEmployees}</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {localizePersonName(e.name, language)}
              </option>
            ))}
          </select>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="h-9 px-3 text-xs font-semibold border border-[#E3EAE5] rounded-xl bg-white text-[#1F2937]"
          >
            <option value="all">{t.leads.filters.allCities}</option>
            {MOROCCAN_CITIES.map((c) => (
              <option key={c} value={c}>
                {localizeCity(c, language)}
              </option>
            ))}
          </select>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="h-9 px-3 text-xs font-semibold border border-[#E3EAE5] rounded-xl bg-white text-[#1F2937]"
          >
            <option value="all">{t.leads.filters.allClassifications}</option>
            {(Object.keys(t.leadClassifications) as LeadClassification[]).map((cl) => (
              <option key={cl} value={cl}>
                {t.leadClassifications[cl]}
              </option>
            ))}
          </select>

          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="h-9 px-3 text-xs font-semibold border border-[#E3EAE5] rounded-xl bg-white text-[#1F2937]"
          >
            <option value="all">{t.leads.filters.allScores}</option>
            {(['high', 'medium', 'low'] as LeadScoreTier[]).map((tier) => (
              <option key={tier} value={tier}>
                {t.leads.scoring.tiers[tier]}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-9 px-3 text-xs font-semibold border border-[#E3EAE5] rounded-xl bg-white text-[#1F2937] font-mono-num"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as PipelineSortBy)}
            aria-label={t.pipeline.smartFilter.sortLabel}
            className="h-9 px-3 text-xs font-bold border border-[#FDBA74] rounded-xl bg-[#FFF7ED] text-[#C2410C]"
          >
            {(
              ['default', 'score_desc', 'budget_desc', 'recent'] as PipelineSortBy[]
            ).map((opt) => (
              <option key={opt} value={opt}>
                {t.pipeline.smartFilter.sortOptions[opt]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* All Stages Visible Grid with Clients Listed Directly Underneath Each Status */}
      <div className="w-full overflow-x-auto pb-3 overscroll-x-contain snap-x snap-mandatory"><div className="grid grid-flow-col auto-cols-[190px] sm:auto-cols-[220px] xl:auto-cols-[240px] gap-2.5 sm:gap-3 items-start w-max">
        {PIPELINE_STAGES.map(({ status, key }) => {
          const stageLeads = filteredLeads
            .filter((l) =>
              status === 'closed_lost'
                ? l.status === 'closed_lost' || l.status === 'not_interested'
                : l.status === status
            )
            .sort((a, b) => {
              if (sortBy === 'score_desc') {
                return (leadScoresMap[b.id]?.score ?? 0) - (leadScoresMap[a.id]?.score ?? 0);
              }
              if (sortBy === 'budget_desc') {
                return b.budget - a.budget;
              }
              if (sortBy === 'recent') {
                return String(b.last_interaction).localeCompare(String(a.last_interaction));
              }
              return 0;
            });
          const stageTotal = stageLeads.reduce((s, l) => s + l.budget, 0);
          const isOver = dragOverStage === status;
          const stStyle = stageStyles[key];

          return (
            <div
              key={status}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverStage(status);
              }}
              onDragLeave={() => setDragOverStage(null)}
              onDrop={() => handleDrop(status)}
              className={`rounded-xl sm:rounded-2xl border overflow-hidden card-surface transition-all flex flex-col snap-start ${
                isOver
                  ? 'bg-[#ECFDF5]/80 border-[#16966A] ring-2 ring-[#16966A]/25'
                  : stStyle.column
              }`}
            >
              {/* Sleek Top Status Indicator */}
              <div className={`h-1 w-full ${stStyle.topBar}`} />

              {/* Harmonious Stage Header with Crisp Black Title */}
              <div className={`px-2.5 sm:px-3 py-2.5 border-b ${stStyle.headerBg}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`h-2 w-2 rounded-full shrink-0 ${stStyle.dot}`} />
                    <h3 className="text-sm font-extrabold truncate text-zinc-950">
                      {t.pipeline.stages[key]}
                    </h3>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-extrabold rounded-md tabular-nums shrink-0 ${stStyle.badge}`}>
                    {stageLeads.length}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px]">
                  <span className="font-medium text-zinc-600">{t.leads.columns.budget}</span>
                  <span className="font-extrabold font-mono-num text-zinc-950">
                    {formatMAD(stageTotal, language)}
                  </span>
                </div>
              </div>

              {/* Stage Clients List */}
              <div className="p-2 sm:p-2.5 space-y-2 max-h-[540px] overflow-y-auto">
                {stageLeads.length === 0 ? (
                  <div className="py-8 px-3 rounded-xl border border-dashed border-zinc-300 bg-white text-center text-xs font-medium text-zinc-500">
                    {t.pipeline.emptyStage}
                  </div>
                ) : (
                  stageLeads.map((lead) => {
                    const prop = properties.find((p) => p.id === lead.interested_property_id);
                    const emp = employees.find((e) => e.id === lead.assigned_employee_id);
                    const isSale = lead.transaction_type === 'sale';
                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={() => setDraggedLeadId(lead.id)}
                        onDragEnd={() => {
                          setDraggedLeadId(null);
                          setDragOverStage(null);
                        }}
                        className={`bg-white border border-zinc-200 rounded-lg sm:rounded-xl p-2.5 space-y-2 cursor-grab active:cursor-grabbing shadow-2xs transition-all hover:shadow-md ${stStyle.cardHover}`}
                      >
                        {/* Client Name, Phone & Budget */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => openLeadProfile(lead.id)}
                              className="font-display text-[13px] font-extrabold text-[#1F2937] hover:text-[#16966A] hover:underline text-start block truncate"
                            >
                              {localizePersonName(lead.name, language)}
                            </button>
                            <div className="flex items-center gap-1 text-[11px] font-mono-num text-zinc-600 mt-0.5" dir="ltr">
                              <Phone className="h-3 w-3 text-zinc-500 shrink-0" />
                              <span>{lead.phone}</span>
                            </div>
                          </div>
                          <span className="px-2 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-[11px] font-extrabold font-mono-num text-[#1F2937] shrink-0">
                            {formatMAD(lead.budget, language)}
                          </span>
                        </div>

                        {/* Badges Row */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <ClassificationBadge
                            classification={lead.classification}
                            label={t.leadClassifications[lead.classification]}
                          />
                          {(() => {
                            const scoreInfo = leadScoresMap[lead.id];
                            if (!scoreInfo) return null;
                            return (
                              <LeadScoreBadge
                                score={scoreInfo.score}
                                tier={scoreInfo.tier}
                                tierLabel={t.leads.scoring.tiers[scoreInfo.tier]}
                                compact
                              />
                            );
                          })()}
                          <ContactMethodBadge
                            method={lead.contact_method}
                            label={t.contactMethods[lead.contact_method]}
                            phone={lead.phone}
                          />
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              isSale
                                ? 'bg-sky-50 text-sky-900 border-sky-200'
                                : lead.transaction_type === 'sell'
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                                  : lead.transaction_type === 'rent_out'
                                    ? 'bg-teal-50 text-teal-900 border-teal-200'
                                    : 'bg-orange-50 text-orange-900 border-orange-200'
                            }`}
                          >
                            {lead.transaction_type === 'sale' ? (language === 'ar' ? 'شراء' : language === 'fr' ? 'Acquisition' : 'Buy') : t.transactionTypes[lead.transaction_type]}
                          </span>
                        </div>

                        {/* Property & Location / Payment Summary */}
                        <div className="bg-zinc-50 border border-zinc-200/80 rounded-lg px-2.5 py-2 space-y-1 text-[11px]">
                          {prop && (
                            <div className="flex items-center gap-1.5 font-bold text-[#1F2937] truncate">
                              <Building2 className="h-3.5 w-3.5 text-zinc-700 shrink-0" />
                              <span className="truncate">{localizePropertyTitle(prop.title, language)}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between gap-2 text-zinc-700">
                            <span className="inline-flex items-center gap-1 truncate font-semibold text-[#1F2937]">
                              <MapPin className="h-3 w-3 text-zinc-500 shrink-0" />
                              {localizeCity(lead.city, language)}
                            </span>
                            <span className="inline-flex items-center gap-1 font-semibold text-[#1F2937] shrink-0">
                              {lead.payment_method === 'cash' ? (
                                <Wallet className="h-3 w-3 text-emerald-700" />
                              ) : (
                                <CreditCard className="h-3 w-3 text-indigo-700" />
                              )}
                              {t.paymentMethods[lead.payment_method]}
                            </span>
                          </div>
                        </div>

                        {/* Advisor & Follow-up Date */}
                        <div className="flex items-center justify-between text-[11px] text-zinc-600">
                          <span className="font-bold text-[#1F2937] truncate">
                            {emp ? localizePersonName(emp.name, language) : '—'}
                          </span>
                          <span className="font-mono-num text-zinc-600">
                            {lead.next_followup
                              ? formatShortDate(lead.next_followup, language)
                              : formatShortDate(lead.last_interaction, language)}
                          </span>
                        </div>

                        {/* Stage Move & Decorated Action Buttons */}
                        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-1.5">
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              updateLead(lead.id, { status: e.target.value as LeadStatus })
                            }
                            aria-label={t.pipeline.moveToStage}
                            className="h-8 px-2 text-[11px] font-bold border border-zinc-200 rounded-lg bg-zinc-50 text-zinc-950 max-w-[135px] focus:outline-none focus:border-zinc-900"
                          >
                            {(Object.keys(t.leadStatuses) as LeadStatus[]).map((st) => (
                              <option key={st} value={st}>{t.leadStatuses[st]}</option>
                            ))}
                          </select>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setNoteTargetLead(lead);
                                setQuickNoteText('');
                              }}
                              title={t.pipeline.quickNote}
                              className="h-8 w-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 inline-flex items-center justify-center transition-colors"
                            >
                              <MessageSquarePlus className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPreselectedLeadForApt(lead.id);
                                setQuickModal('appointment');
                              }}
                              title={t.pipeline.bookVisit}
                              className="h-8 w-8 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-[#16966A] hover:bg-[#D1FAE5] inline-flex items-center justify-center transition-colors"
                            >
                              <CalendarPlus className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openLeadProfile(lead.id)}
                              title={t.pipeline.openProfile}
                              className="h-8 w-8 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-950 hover:bg-zinc-200 inline-flex items-center justify-center transition-colors"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
      </div>

      {/* Quick Note Modal */}
      <Modal
        open={Boolean(noteTargetLead)}
        onClose={() => setNoteTargetLead(null)}
        title={`${t.pipeline.quickNote} — ${noteTargetLead ? localizePersonName(noteTargetLead.name, language) : ''}`}
        size="md"
      >
        <div className="space-y-3">
          <textarea
            rows={4}
            value={quickNoteText}
            onChange={(e) => setQuickNoteText(e.target.value)}
            placeholder={t.leads.profile.addNotePlaceholder}
            className="w-full p-3 text-xs border border-[#E3EAE5] rounded-xl focus:border-[#16966A] focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setNoteTargetLead(null)}
              className="px-4 py-2 text-xs rounded-xl btn-outline"
            >
              {t.app.cancel}
            </button>
            <button
              type="button"
              onClick={() => {
                if (noteTargetLead && quickNoteText.trim()) {
                  addLeadNote(noteTargetLead.id, quickNoteText);
                }
                setNoteTargetLead(null);
              }}
              className="px-4 py-2 text-xs font-bold rounded-xl btn-primary"
            >
              {t.app.save}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};