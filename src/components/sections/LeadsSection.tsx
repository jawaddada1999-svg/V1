import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  BedDouble,
  CalendarPlus,
  CreditCard,
  Download,
  Edit3,
  Eye,
  Maximize2,
  MessageCircle,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
  Wallet,
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { MOROCCAN_CITIES } from '../../data/demoData';
import {
  localizeCity,
  localizeDistrict,
  localizePersonName,
  localizePropertyTitle,
  localizeRelativeTime,
  matchesLocalizedQuery,
} from '../../i18n/localizeData';
import { formatMAD, formatShortDate } from '../../i18n/translations';
import { Lead, LeadClassification, LeadSource, LeadStatus } from '../../types/domain';
import { buildTelHref, buildWhatsAppHref } from '../../utils/contactLinks';

import {
  computeLeadScore,
  LeadScoreResult,
  LeadScoreTier,
} from '../../utils/leadScoring';
import { LeadFormModal } from '../modals/QuickModals';
import {
  Avatar,
  ClassificationBadge,
  ConfirmDialog,
  ContactMethodBadge,
  Drawer,
  EmptyState,
  LeadScoreBadge,
  PaginationBar,
  StatusLabel,
} from '../ui/DataPrimitives';

type SortField = 'name' | 'budget' | 'score' | 'created_at' | 'last_interaction';
type TxTab = 'all' | 'sale' | 'rent' | 'sell' | 'rent_out';

export const LeadsSection: React.FC = () => {
  const {
    t,
    language,
    leads,
    properties,
    employees,
    appointments,
    conversations,
    updateLead,
    deleteLead,
    addLeadNote,
    selectedLeadId,
    setSelectedLeadId,
    openPropertyDetails,
    openLeadConversation,
    setQuickModal,
    setPreselectedLeadForApt,
    pushToast,
  } = useAgency();

  const [txTab, setTxTab] = useState<TxTab>('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [followupInput, setFollowupInput] = useState('');

  const buyersCount = useMemo(() => leads.filter((l) => l.transaction_type === 'sale').length, [leads]);
  const rentersCount = useMemo(() => leads.filter((l) => l.transaction_type === 'rent').length, [leads]);
  const sellersCount = useMemo(() => leads.filter((l) => l.transaction_type === 'sell').length, [leads]);
  const landlordsRentCount = useMemo(() => leads.filter((l) => l.transaction_type === 'rent_out').length, [leads]);

  const leadScoresMap = useMemo(() => {
    const map: Record<string, LeadScoreResult> = {};
    leads.forEach((l) => {
      map[l.id] = computeLeadScore(l, appointments, conversations);
    });
    return map;
  }, [leads, appointments, conversations]);

  const filteredLeads = useMemo(() => {
    const q = search.trim();
    return leads
      .filter((l) => {
        if (txTab !== 'all' && l.transaction_type !== txTab) return false;
        if (statusFilter !== 'all' && l.status !== statusFilter) return false;
        if (sourceFilter !== 'all' && l.source !== sourceFilter) return false;
        if (employeeFilter !== 'all' && l.assigned_employee_id !== employeeFilter) return false;
        if (cityFilter !== 'all' && l.city !== cityFilter) return false;
        if (classFilter !== 'all' && l.classification !== classFilter) return false;
        if (scoreFilter !== 'all' && leadScoresMap[l.id]?.tier !== scoreFilter) return false;
        if (q) {
          const prop = properties.find((p) => p.id === l.interested_property_id);
          if (
            !matchesLocalizedQuery(q, language, [
              l.name,
              l.phone,
              l.email,
              l.city,
              l.district,
              prop?.title,
            ])
          ) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === 'budget') cmp = a.budget - b.budget;
        else if (sortField === 'score') {
          cmp = (leadScoresMap[a.id]?.score ?? 0) - (leadScoresMap[b.id]?.score ?? 0);
        } else {
          cmp = String(a[sortField]).localeCompare(String(b[sortField]));
        }
        return sortAsc ? cmp : -cmp;
      });
  }, [
    leads,
    properties,
    language,
    txTab,
    search,
    statusFilter,
    sourceFilter,
    employeeFilter,
    cityFilter,
    classFilter,
    scoreFilter,
    leadScoresMap,
    sortField,
    sortAsc,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const pagedLeads = filteredLeads.slice((page - 1) * pageSize, page * pageSize);

  const activeLead = useMemo(
    () => leads.find((l) => l.id === selectedLeadId) ?? null,
    [leads, selectedLeadId]
  );

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === pagedLeads.length) setSelectedIds([]);
    else setSelectedIds(pagedLeads.map((l) => l.id));
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExport = (targetLeads: Lead[]) => {
    const headers = [
      t.leads.columns.name, t.leads.columns.phone, t.leads.columns.contactMethod,
      t.leads.columns.classification, t.leads.columns.score, t.leads.form.transactionType,
      t.leads.columns.propertyType, t.leads.columns.bedrooms, t.leads.columns.deliveryStatus,
      t.leads.columns.desiredArea, t.leads.columns.paymentMethod, t.leads.columns.budget,
      t.leads.columns.city, t.leads.columns.source, t.leads.columns.employee,
      t.leads.columns.status, 'Property condition', 'Mandate status', 'Viewing availability',
    ];
    const rows = targetLeads.map((l) => [
      localizePersonName(l.name, language), l.phone, t.contactMethods[l.contact_method],
      t.leadClassifications[l.classification], leadScoresMap[l.id]?.score ?? 0,
      t.transactionTypes[l.transaction_type], t.propertyTypes[l.property_type], l.bedrooms,
      t.deliveryStatuses[l.delivery_status], `${l.desired_area} ${t.app.sqm}`,
      t.paymentMethods[l.payment_method], formatMAD(l.budget, language), localizeCity(l.city, language),
      t.leadSources[l.source],
      employees.find((e) => e.id === l.assigned_employee_id)?.name ?? '-',
      t.leadStatuses[l.status], l.property_condition ?? '', l.mandate_status ?? '',
      l.viewing_availability ?? '',
    ]);
    const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch] as string));
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      pushToast({ type: 'error', title: language === 'ar' ? 'سمح للمتصفح بفتح نافذة الطباعة' : 'Please allow the print window to open' });
      return;
    }
    printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>IBONDA — Leads</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#17211d}h1{margin:0 0 16px;font-size:22px}table{width:100%;border-collapse:collapse;font-size:10px}th,td{border:1px solid #d8e0dc;padding:7px;text-align:start}th{background:#edf3ef;font-weight:700}tr{break-inside:avoid}@media print{body{padding:0}}</style></head><body><h1>IBONDA — ${escapeHtml(t.leads.title)}</h1><table><thead><tr>${headers.map(h=>`<th>${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(v=>`<td>${escapeHtml(v)}</td>`).join('')}</tr>`).join('')}</tbody></table><script>window.onload=()=>window.print()<\/script></body></html>`);
    printWindow.document.close();
    pushToast({ type: 'success', title: language === 'ar' ? 'ملف الطباعة جاهز — اختار Save as PDF' : 'Print view ready — choose Save as PDF' });
  };

  const handleBulkAssign = (empId: string) => {
    if (!empId) return;
    selectedIds.forEach((id) => updateLead(id, { assigned_employee_id: empId }));
    setSelectedIds([]);
  };

  const handleBulkStatus = (status: LeadStatus) => {
    selectedIds.forEach((id) => updateLead(id, { status }));
    setSelectedIds([]);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-[19px] font-bold text-[#1F2937]">{t.leads.title}</h2>
          <p className="text-xs text-[#64748B] font-medium mt-0.5">{t.leads.subtitle}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleExport(filteredLeads)}
            className="h-9 px-4 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 btn-secondary"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{t.app.exportPdf}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingLead(null);
              setLeadModalOpen(true);
            }}
            className="h-9 px-4 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 btn-primary"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{t.leads.addLead}</span>
          </button>
        </div>
      </div>

      {/* 4 Lead Categories Segmented Tabs */}
      <div className="flex flex-wrap items-center gap-2.5">
        {(
          [
            { id: 'all', label: t.leads.tabs.all, count: leads.length, activeClass: 'btn-primary' },
            { id: 'sale', label: t.leads.tabs.buyers, count: buyersCount, activeClass: 'bg-[#0284C7] text-white border-[#0284C7] shadow-sm shadow-[#0284C7]/25' },
            { id: 'rent', label: t.leads.tabs.renters, count: rentersCount, activeClass: 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-sm shadow-[#8B5CF6]/25' },
            { id: 'sell', label: t.leads.tabs.sellers, count: sellersCount, activeClass: 'bg-[#D97706] text-white border-[#D97706] shadow-sm shadow-[#D97706]/25' },
            { id: 'rent_out', label: t.leads.tabs.landlordsRent, count: landlordsRentCount, activeClass: 'bg-[#1E293B] text-white border-[#1E293B] shadow-sm' },
          ] as const
        ).map((tab) => {
          const isActive = txTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setTxTab(tab.id);
                setPage(1);
                setSelectedIds([]);
              }}
              className={`h-10 px-4 rounded-xl text-xs font-bold inline-flex items-center gap-2.5 border transition-all ${
                isActive ? tab.activeClass : 'btn-outline'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-mono-num font-bold ${
                  isActive ? 'bg-white/25 text-white' : 'bg-[#F5F7F5] text-[#1F2937] border border-[#E3EAE5]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white border border-[#E3EAE5] card-surface rounded-2xl p-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        <div className="relative">
          <Search className="h-3.5 w-3.5 text-[#64748B] absolute top-1/2 -translate-y-1/2 start-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t.app.search}
            className="w-full h-9 ps-8 pe-3 text-xs border border-[#E3EAE5] rounded-lg bg-[#F5F7F5] focus:bg-white focus:outline-none"
          />
        </div>

        <select
          value={classFilter}
          onChange={(e) => {
            setClassFilter(e.target.value);
            setPage(1);
          }}
          className="h-9 px-3 text-xs font-semibold text-[#1F2937] border border-[#E3EAE5] rounded-lg bg-white"
        >
          <option value="all">{t.leads.filters.allClassifications}</option>
          {(Object.keys(t.leadClassifications) as LeadClassification[]).map((cl) => (
            <option key={cl} value={cl}>{t.leadClassifications[cl]}</option>
          ))}
        </select>

        <select
          value={scoreFilter}
          onChange={(e) => {
            setScoreFilter(e.target.value);
            setPage(1);
          }}
          className="h-9 px-3 text-xs font-semibold text-[#1F2937] border border-[#E3EAE5] rounded-lg bg-white"
        >
          <option value="all">{t.leads.filters.allScores}</option>
          {(['high', 'medium', 'low'] as LeadScoreTier[]).map((tier) => (
            <option key={tier} value={tier}>{t.leads.scoring.tiers[tier]}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="h-9 px-3 text-xs font-semibold text-[#1F2937] border border-[#E3EAE5] rounded-lg bg-white"
        >
          <option value="all">{t.leads.filters.allStatuses}</option>
          {(Object.keys(t.leadStatuses) as LeadStatus[]).map((st) => (
            <option key={st} value={st}>{t.leadStatuses[st]}</option>
          ))}
        </select>

        <select
          value={cityFilter}
          onChange={(e) => {
            setCityFilter(e.target.value);
            setPage(1);
          }}
          className="h-9 px-3 text-xs font-semibold text-[#1F2937] border border-[#E3EAE5] rounded-lg bg-white"
        >
          <option value="all">{t.leads.filters.allCities}</option>
          {MOROCCAN_CITIES.map((c) => (
            <option key={c} value={c}>{localizeCity(c, language)}</option>
          ))}
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => {
            setSourceFilter(e.target.value);
            setPage(1);
          }}
          className="h-9 px-3 text-xs font-semibold text-[#1F2937] border border-[#E3EAE5] rounded-lg bg-white"
        >
          <option value="all">{t.leads.filters.allSources}</option>
          {(Object.keys(t.leadSources) as LeadSource[]).map((src) => (
            <option key={src} value={src}>{t.leadSources[src]}</option>
          ))}
        </select>

        <select
          value={employeeFilter}
          onChange={(e) => {
            setEmployeeFilter(e.target.value);
            setPage(1);
          }}
          className="h-9 px-3 text-xs font-semibold text-[#1F2937] border border-[#E3EAE5] rounded-lg bg-white"
        >
          <option value="all">{t.leads.filters.allEmployees}</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>{localizePersonName(emp.name, language)}</option>
          ))}
        </select>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-[#12352B] border border-[#16966A]/40 text-white rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="text-xs font-medium">
            {t.app.selectedCount}: <span className="font-bold tabular-nums">{selectedIds.length}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) handleBulkAssign(e.target.value);
                e.target.value = '';
              }}
              className="h-8 px-2.5 text-xs bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="" className="text-slate-900">{t.leads.bulk.assignEmployee}</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id} className="text-slate-900">
                  {localizePersonName(emp.name, language)}
                </option>
              ))}
            </select>

            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) handleBulkStatus(e.target.value as LeadStatus);
                e.target.value = '';
              }}
              className="h-8 px-2.5 text-xs bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="" className="text-slate-900">{t.leads.bulk.changeStatus}</option>
              {(Object.keys(t.leadStatuses) as LeadStatus[]).map((st) => (
                <option key={st} value={st} className="text-slate-900">{t.leadStatuses[st]}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => handleExport(leads.filter((l) => selectedIds.includes(l.id)))}
              className="h-8 px-3 text-xs font-bold bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-lg"
            >
              {t.leads.bulk.exportSelected}
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="h-8 px-2.5 text-xs text-slate-200 hover:text-white"
            >
              {t.app.clearSelection}
            </button>
          </div>
        </div>
      )}

      {/* Leads Table */}
      {filteredLeads.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title={t.leads.emptyTitle}
          description={t.leads.emptyDesc}
          action={
            <button
              type="button"
              onClick={() => {
                setEditingLead(null);
                setLeadModalOpen(true);
              }}
              className="px-4 py-2 text-xs font-bold rounded-xl btn-primary"
            >
              {t.leads.addLead}
            </button>
          }
        />
      ) : (
        <div className="bg-white border border-[#E3EAE5] card-surface rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#1E293B] text-white border-b-2 border-[#EA580C] font-bold whitespace-nowrap">
                  <th className="py-3.5 px-3 w-9">
                    <input
                      type="checkbox"
                      checked={pagedLeads.length > 0 && selectedIds.length === pagedLeads.length}
                      onChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </th>
                  <th className="py-3.5 px-3 text-start">
                    <button
                      type="button"
                      onClick={() => toggleSort('name')}
                      className="inline-flex items-center gap-1 text-white hover:text-[#FDBA74]"
                    >
                      <span>{t.leads.columns.name}</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="py-3.5 px-3 text-start">{t.leads.columns.classification}</th>
                  <th className="py-3.5 px-3 text-start">
                    <button
                      type="button"
                      onClick={() => toggleSort('score')}
                      className="inline-flex items-center gap-1 text-white hover:text-[#FDBA74]"
                    >
                      <span>{t.leads.columns.score}</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="py-3.5 px-3 text-start">{t.leads.columns.contactMethod}</th>
                  <th className="py-3.5 px-3 text-start">{txTab === 'sell' ? (language === 'ar' ? 'العقار المعروض للبيع' : language === 'fr' ? 'Bien à la vente' : 'Property for Sale') : txTab === 'rent_out' ? (language === 'ar' ? 'العقار المعروض للكراء' : language === 'fr' ? 'Bien à louer' : 'Property to Let') : txTab === 'all' ? (language === 'ar' ? 'نوع الطلب / العقار' : language === 'fr' ? 'Projet / Bien' : 'Intent / Property') : t.leads.columns.propertyType}</th>
                  <th className="py-3.5 px-3 text-start">{txTab === 'sell' || txTab === 'rent_out' ? (language === 'ar' ? 'الغرف' : language === 'fr' ? 'Pièces' : 'Rooms') : t.leads.columns.bedrooms}</th>
                  <th className="py-3.5 px-3 text-start">{txTab === 'sell' || txTab === 'rent_out' ? (language === 'ar' ? 'حالة العقار' : language === 'fr' ? 'État du bien' : 'Condition') : txTab === 'rent' ? (language === 'ar' ? 'التأثيث' : language === 'fr' ? 'Ameublement' : 'Furnishing') : txTab === 'all' ? (language === 'ar' ? 'حالة العقار / التأثيث' : language === 'fr' ? 'État / Meublé' : 'Condition / Status') : t.leads.columns.deliveryStatus}</th>
                  <th className="py-3.5 px-3 text-start">{txTab === 'sell' || txTab === 'rent_out' ? (language === 'ar' ? 'المساحة' : language === 'fr' ? 'Surface' : 'Area') : t.leads.columns.desiredArea}</th>
                  <th className="py-3.5 px-3 text-start">{txTab === 'sell' || txTab === 'rent_out' ? (language === 'ar' ? 'التفويض' : language === 'fr' ? 'Mandat' : 'Mandate') : txTab === 'rent' ? (language === 'ar' ? 'مدة الكراء' : language === 'fr' ? 'Durée du bail' : 'Lease Term') : txTab === 'all' ? (language === 'ar' ? 'الدفع / المدة / التفويض' : language === 'fr' ? 'Financement / Bail / Mandat' : 'Financing / Term / Mandate') : t.leads.columns.paymentMethod}</th>
                  <th className="py-3.5 px-3 text-start">
                    <button
                      type="button"
                      onClick={() => toggleSort('budget')}
                      className="inline-flex items-center gap-1 text-white hover:text-[#FDBA74]"
                    >
                      <span>{txTab === 'sell' ? (language === 'ar' ? 'الثمن المطلوب' : language === 'fr' ? 'Prix demandé' : 'Asking Price') : txTab === 'rent_out' ? (language === 'ar' ? 'سومة الكراء المطلوبة' : language === 'fr' ? 'Loyer demandé' : 'Asking Rent') : txTab === 'rent' ? (language === 'ar' ? 'ميزانية الكراء / الشهر' : language === 'fr' ? 'Loyer mensuel max' : 'Monthly Rent Budget') : txTab === 'all' ? (language === 'ar' ? 'الميزانية / الثمن' : language === 'fr' ? 'Budget / Prix' : 'Budget / Asking Price') : t.leads.columns.budget}</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  {txTab === 'rent' && <th className="py-3.5 px-3 text-start">{language === 'ar' ? 'تاريخ الدخول' : language === 'fr' ? 'Entrée souhaitée' : 'Move-in Date'}</th>}
                  <th className="py-3.5 px-3 text-start">{t.leads.columns.city}</th>
                  <th className="py-3.5 px-3 text-start">{t.leads.columns.employee}</th>
                  <th className="py-3.5 px-3 text-start">{t.leads.columns.status}</th>
                  <th className="py-3.5 px-3 text-end">{t.app.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {pagedLeads.map((lead) => {
                  const emp = employees.find((e) => e.id === lead.assigned_employee_id);
                  const isSale = lead.transaction_type === 'sale';
                  const isSeller = lead.transaction_type === 'sell' || lead.transaction_type === 'rent_out';
                  return (
                    <tr
                      key={lead.id}
                      className="transition-colors hover:bg-[#FFF7ED]"
                    >
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(lead.id)}
                          onChange={() => toggleSelectOne(lead.id)}
                          aria-label={lead.name}
                        />
                      </td>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => setSelectedLeadId(lead.id)}
                          className="font-bold text-[#1F2937] hover:underline text-start block whitespace-nowrap"
                        >
                          {localizePersonName(lead.name, language)}
                        </button>
                        <a
                          href={buildTelHref(lead.phone)}
                          onClick={(e) => e.stopPropagation()}
                          title={t.appointments.agenda.directCall}
                          className="text-[11px] text-zinc-600 hover:text-sky-700 hover:underline font-mono-num inline-block mt-0.5"
                          dir="ltr"
                        >
                          {lead.phone}
                        </a>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <ClassificationBadge
                          classification={lead.classification}
                          label={t.leadClassifications[lead.classification]}
                        />
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {(() => {
                          const scoreInfo = leadScoresMap[lead.id];
                          if (!scoreInfo) return null;
                          return (
                            <LeadScoreBadge
                              score={scoreInfo.score}
                              tier={scoreInfo.tier}
                              tierLabel={t.leads.scoring.tiers[scoreInfo.tier]}
                            />
                          );
                        })()}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <ContactMethodBadge
                            method={lead.contact_method}
                            label={t.contactMethods[lead.contact_method]}
                            phone={lead.phone}
                            title={
                              lead.contact_method === 'whatsapp'
                                ? t.appointments.agenda.directWhatsapp
                                : t.appointments.agenda.directCall
                            }
                          />
                          <a
                              href={buildTelHref(lead.phone)}
                              onClick={(e) => e.stopPropagation()}
                              title={t.appointments.agenda.directCall}
                              className="h-6 w-6 rounded-md bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 hover:border-sky-400 inline-flex items-center justify-center transition-colors"
                            >
                              <Phone className="h-3 w-3" />
                            </a>
                            <a
                              href={buildWhatsAppHref(lead.phone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title={t.appointments.agenda.directWhatsapp}
                              className="h-6 w-6 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400 inline-flex items-center justify-center transition-colors"
                            >
                              <MessageCircle className="h-3 w-3" />
                            </a>
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                              isSale
                                ? 'bg-sky-50 text-sky-800 border-sky-200'
                                : lead.transaction_type === 'sell'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : lead.transaction_type === 'rent_out'
                                    ? 'bg-teal-50 text-teal-800 border-teal-200'
                                    : 'bg-orange-50 text-orange-800 border-orange-200'
                            }`}
                          >
                            {lead.transaction_type === 'sale' ? (language === 'ar' ? 'شراء' : language === 'fr' ? 'Acquisition' : 'Buy') : t.transactionTypes[lead.transaction_type]}
                          </span>
                          <span className="font-bold text-[#1F2937]">
                            {t.propertyTypes[lead.property_type]}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono-num">
                        {lead.bedrooms > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[#1F2937] font-bold">
                            <BedDouble className="h-3 w-3 text-zinc-600" />
                            {lead.bedrooms}
                          </span>
                        ) : (
                          <span className="text-zinc-500">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {isSeller ? (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold border bg-emerald-50 text-emerald-900 border-emerald-200">
                            {lead.property_condition ? ({ new: language === 'ar' ? 'جديد' : language === 'fr' ? 'Neuf' : 'New', excellent: language === 'ar' ? 'ممتاز' : 'Excellent', good: language === 'ar' ? 'جيد' : language === 'fr' ? 'Bon état' : 'Good', needs_renovation: language === 'ar' ? 'يحتاج إصلاح' : language === 'fr' ? 'À rénover' : 'Needs Renovation' } as Record<string, string>)[lead.property_condition] : '—'}
                          </span>
                        ) : lead.transaction_type === 'rent' ? (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold border bg-violet-50 text-violet-900 border-violet-200">
                            {lead.furnished === 'furnished' ? (language === 'ar' ? 'مفروش' : language === 'fr' ? 'Meublé' : 'Furnished') : lead.furnished === 'unfurnished' ? (language === 'ar' ? 'غير مفروش' : language === 'fr' ? 'Non meublé' : 'Unfurnished') : '—'}
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${lead.delivery_status === 'ready' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-amber-50 text-amber-900 border-amber-200'}`}>
                            {t.deliveryStatuses[lead.delivery_status]}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono-num font-bold text-[#1F2937]">
                        <span className="inline-flex items-center gap-1">
                          <Maximize2 className="h-3 w-3 text-zinc-500" />
                          {lead.desired_area} {t.app.sqm}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {isSeller ? (
                          <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold border bg-sky-50 text-sky-900 border-sky-200">
                            {lead.mandate_status ? ({ exclusive: language === 'ar' ? 'حصري' : language === 'fr' ? 'Mandat exclusif' : 'Exclusive Mandate', non_exclusive: language === 'ar' ? 'غير حصري' : language === 'fr' ? 'Mandat simple' : 'Open Mandate', not_signed: language === 'ar' ? 'غير موقع' : language === 'fr' ? 'À signer' : 'Pending Mandate' } as Record<string, string>)[lead.mandate_status] : '—'}
                          </span>
                        ) : lead.transaction_type === 'rent' ? (
                          <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold border bg-violet-50 text-violet-900 border-violet-200">
                            {lead.rental_duration === 'short_term' ? (language === 'ar' ? 'قصير المدى' : language === 'fr' ? 'Court terme' : 'Short-Term') : lead.rental_duration === 'long_term' ? (language === 'ar' ? 'طويل المدى' : language === 'fr' ? 'Longue durée' : 'Long-Term') : '—'}
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${lead.payment_method === 'cash' ? 'bg-teal-50 text-teal-900 border-teal-200' : 'bg-indigo-50 text-indigo-900 border-indigo-200'}`}>
                            {lead.payment_method === 'cash' ? <Wallet className="h-3 w-3" /> : <CreditCard className="h-3 w-3" />}
                            {t.paymentMethods[lead.payment_method]}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono-num font-extrabold text-[#1F2937] whitespace-nowrap">
                        {formatMAD(lead.budget, language)}
                        {lead.transaction_type === 'rent' || lead.transaction_type === 'rent_out' ? ` ${t.app.perMonth}` : ''}
                      </td>
                      {txTab === 'rent' && <td className="py-3 px-3 font-medium text-[#1F2937] whitespace-nowrap">{lead.move_in_date || '—'}</td>}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-bold text-[#1F2937]">{localizeCity(lead.city, language)}</div>
                        {lead.district && (
                          <div className="text-[11px] text-zinc-600">{localizeDistrict(lead.district, language)}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-semibold text-[#1F2937]">
                        {emp ? localizePersonName(emp.name, language) : '—'}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusLabel label={t.leadStatuses[lead.status]} leadStatus={lead.status} />
                      </td>
                      <td className="py-3 px-3 text-end whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedLeadId(lead.id)}
                            className="h-7 w-7 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-900 hover:bg-zinc-200 inline-flex items-center justify-center transition-colors"
                            title={t.leads.profile.title}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingLead(lead);
                              setLeadModalOpen(true);
                            }}
                            className="h-7 w-7 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 inline-flex items-center justify-center transition-colors"
                            title={t.app.edit}
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTargetId(lead.id)}
                            className="h-7 w-7 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 inline-flex items-center justify-center transition-colors"
                            title={t.app.delete}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <PaginationBar
            page={page}
            totalPages={totalPages}
            totalItems={filteredLeads.length}
            pageSize={pageSize}
            showingLabel={t.app.showing}
            ofLabel={t.app.of}
            itemsLabel={t.app.items}
            prevLabel={t.app.previous}
            nextLabel={t.app.next}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Detailed Lead Profile Drawer */}
      <Drawer
        open={Boolean(activeLead)}
        onClose={() => setSelectedLeadId(null)}
        title={activeLead ? localizePersonName(activeLead.name, language) : ''}
        subtitle={t.leads.profile.title}
        dir={t.app.dir}
      >
        {activeLead && (
          <div className="space-y-6">
            {/* Top Status & Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <Avatar name={localizePersonName(activeLead.name, language)} size="md" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#1F2937]">
                      {localizePersonName(activeLead.name, language)}
                    </span>
                    <ClassificationBadge
                      classification={activeLead.classification}
                      label={t.leadClassifications[activeLead.classification]}
                    />
                  </div>
                  <div className="text-xs text-zinc-600 font-mono-num mt-0.5" dir="ltr">
                    {activeLead.phone} · {activeLead.email}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPreselectedLeadForApt(activeLead.id);
                    setQuickModal('appointment');
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 btn-primary"
                >
                  <CalendarPlus className="h-3.5 w-3.5" />
                  <span>{t.leads.profile.bookVisitBtn}</span>
                </button>
                <button
                  type="button"
                  onClick={() => openLeadConversation(activeLead.id)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 btn-outline"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{t.leads.profile.openChatBtn}</span>
                </button>
              </div>
            </div>

            {/* Status & Advisor Assignment Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                  {t.leads.columns.status}
                </label>
                <select
                  value={activeLead.status}
                  onChange={(e) =>
                    updateLead(activeLead.id, { status: e.target.value as LeadStatus })
                  }
                  className="w-full h-9 px-3 text-xs font-semibold text-[#1F2937] border border-slate-200 rounded-lg bg-white"
                >
                  {(Object.keys(t.leadStatuses) as LeadStatus[]).map((st) => (
                    <option key={st} value={st}>{t.leadStatuses[st]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                  {t.leads.profile.assignedEmployee}
                </label>
                <select
                  value={activeLead.assigned_employee_id}
                  onChange={(e) =>
                    updateLead(activeLead.id, { assigned_employee_id: e.target.value })
                  }
                  className="w-full h-9 px-3 text-xs font-semibold text-[#1F2937] border border-slate-200 rounded-lg bg-white"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {localizePersonName(emp.name, language)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lead Readiness Score Breakdown */}
            {(() => {
              const scoreInfo = leadScoresMap[activeLead.id];
              if (!scoreInfo) return null;
              const barColor =
                scoreInfo.tier === 'high'
                  ? 'bg-[#10B981]'
                  : scoreInfo.tier === 'medium'
                    ? 'bg-[#0EA5E9]'
                    : 'bg-[#64748B]';
              return (
                <div className="bg-white border-2 border-[#E3EAE5] rounded-xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-extrabold text-[#1F2937]">
                        {t.leads.scoring.title}
                      </div>
                      <div className="text-[11px] font-semibold text-[#64748B] font-mono-num">
                        {scoreInfo.score} / 100 · {t.leads.scoring.tiers[scoreInfo.tier]}
                      </div>
                    </div>
                    <LeadScoreBadge
                      score={scoreInfo.score}
                      tier={scoreInfo.tier}
                      tierLabel={t.leads.scoring.tiers[scoreInfo.tier]}
                    />
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#F5F7F5] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${barColor}`}
                      style={{ width: `${scoreInfo.score}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {scoreInfo.factors.map((f) => {
                      const pct = Math.round((f.points / f.max) * 100);
                      return (
                        <div key={f.key} className="bg-[#F5F7F5] border border-[#E3EAE5] rounded-lg px-2.5 py-2 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-[#1F2937]">
                              {t.leads.scoring.factors[f.key]}
                            </span>
                            <span className="font-mono-num font-extrabold text-[#1F2937]">
                              {f.points}/{f.max}
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-[#E3EAE5] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#16966A]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Preferences & Budget Summary */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3 text-xs">
              {(() => {
                const isOwnerListing =
                  activeLead.transaction_type === 'sell' || activeLead.transaction_type === 'rent_out';
                const priceLabel =
                  activeLead.transaction_type === 'sell'
                    ? language === 'ar'
                      ? 'الثمن المطلوب'
                      : language === 'fr'
                        ? 'Prix demandé'
                        : 'Asking price'
                    : activeLead.transaction_type === 'rent_out'
                      ? language === 'ar'
                        ? 'سومة الكراء المطلوبة'
                        : language === 'fr'
                          ? 'Loyer souhaité'
                          : 'Asking rent'
                      : t.leads.columns.budget;
                const showPerMonth =
                  activeLead.transaction_type === 'rent' || activeLead.transaction_type === 'rent_out';
                const mandateLabel = activeLead.mandate_status
                  ? ({
                      exclusive: language === 'ar' ? 'حصري' : language === 'fr' ? 'Exclusif' : 'Exclusive',
                      non_exclusive:
                        language === 'ar' ? 'غير حصري' : language === 'fr' ? 'Non exclusif' : 'Non-exclusive',
                      not_signed: language === 'ar' ? 'غير موقع' : language === 'fr' ? 'Non signé' : 'Not signed',
                    } as Record<string, string>)[activeLead.mandate_status]
                  : '—';
                const conditionLabel = activeLead.property_condition
                  ? ({
                      new: language === 'ar' ? 'جديد' : language === 'fr' ? 'Neuf' : 'New',
                      excellent: language === 'ar' ? 'ممتاز' : 'Excellent',
                      good: language === 'ar' ? 'جيد' : language === 'fr' ? 'Bon' : 'Good',
                      needs_renovation:
                        language === 'ar'
                          ? 'يحتاج إصلاح'
                          : language === 'fr'
                            ? 'À rénover'
                            : 'Needs renovation',
                    } as Record<string, string>)[activeLead.property_condition]
                  : '—';

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-zinc-500 block">{priceLabel}</span>
                      <span className="font-bold text-zinc-950 font-mono-num">
                        {formatMAD(activeLead.budget, language)}
                        {showPerMonth ? ` ${t.app.perMonth}` : ''}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">{t.leads.columns.contactMethod}</span>
                      <div className="mt-0.5">
                        <ContactMethodBadge
                          method={activeLead.contact_method}
                          label={t.contactMethods[activeLead.contact_method]}
                          phone={activeLead.phone}
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">
                        {isOwnerListing
                          ? language === 'ar'
                            ? 'حالة التفويض'
                            : language === 'fr'
                              ? 'Mandat'
                              : 'Mandate'
                          : t.leads.columns.paymentMethod}
                      </span>
                      <span className="font-semibold text-zinc-950">
                        {isOwnerListing ? mandateLabel : t.paymentMethods[activeLead.payment_method]}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">{t.leads.columns.propertyType}</span>
                      <span className="font-semibold text-zinc-950">
                        {t.propertyTypes[activeLead.property_type]} ({t.transactionTypes[activeLead.transaction_type]})
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">
                        {t.leads.columns.bedrooms} / {t.leads.columns.desiredArea}
                      </span>
                      <span className="font-semibold text-zinc-950 font-mono-num">
                        {activeLead.bedrooms > 0 ? `${activeLead.bedrooms} · ` : ''}
                        {activeLead.desired_area} {t.app.sqm}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">
                        {isOwnerListing
                          ? language === 'ar'
                            ? 'حالة العقار'
                            : language === 'fr'
                              ? 'État du bien'
                              : 'Property condition'
                          : t.leads.columns.deliveryStatus}
                      </span>
                      <span className="font-semibold text-zinc-950">
                        {isOwnerListing ? conditionLabel : t.deliveryStatuses[activeLead.delivery_status]}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-600 block">{t.leads.columns.city}</span>
                      <span className="font-bold text-[#1F2937]">
                        {localizeCity(activeLead.city, language)}
                        {activeLead.district ? ` — ${localizeDistrict(activeLead.district, language)}` : ''}
                      </span>
                    </div>
                    {isOwnerListing && (
                      <div>
                        <span className="text-zinc-600 block">
                          {language === 'ar'
                            ? 'أوقات المعاينة المتاحة'
                            : language === 'fr'
                              ? 'Disponibilités de visite'
                              : 'Viewing Availability'}
                        </span>
                        <span className="font-semibold text-[#1F2937]">
                          {activeLead.viewing_availability || '—'}
                        </span>
                      </div>
                    )}
                <div>
                  <span className="text-zinc-600 block">{t.leads.columns.source}</span>
                  <span className="font-semibold text-[#1F2937]">{t.leadSources[activeLead.source]}</span>
                </div>
                <div>
                  <span className="text-zinc-600 block">{t.leads.columns.createdAt}</span>
                  <span className="font-mono-num font-semibold text-[#1F2937]">{formatShortDate(activeLead.created_at, language)}</span>
                </div>
              </div>
                );
              })()}
              <div className="pt-2 border-t border-zinc-200">
                <span className="text-zinc-600 block mb-1">{t.leads.profile.preferences}</span>
                <p className="text-[#1F2937] leading-relaxed">{activeLead.preferences || '—'}</p>
              </div>
              {activeLead.interested_property_id && (
                <div className="pt-2 border-t border-zinc-200 flex items-center justify-between">
                  <span className="text-zinc-600">{t.leads.profile.interestedProperty}:</span>
                  <button
                    type="button"
                    onClick={() => openPropertyDetails(activeLead.interested_property_id!)}
                    className="font-bold text-[#16966A] hover:underline"
                  >
                    {(() => {
                      const prop = properties.find((p) => p.id === activeLead.interested_property_id);
                      return prop ? localizePropertyTitle(prop.title, language) : '';
                    })()}
                  </button>
                </div>
              )}
            </div>

            {/* Schedule Follow-up */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-2.5">
              <div className="text-xs font-bold text-[#1F2937]">{t.leads.profile.scheduleFollowup}</div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={followupInput || activeLead.next_followup || '2026-11-22'}
                  onChange={(e) => setFollowupInput(e.target.value)}
                  className="h-9 px-3 text-xs border border-slate-200 rounded-lg font-mono-num text-[#1F2937]"
                />
                <button
                  type="button"
                  onClick={() => {
                    updateLead(activeLead.id, {
                      next_followup: followupInput || activeLead.next_followup || '2026-11-22',
                    });
                  }}
                  className="h-9 px-4 text-xs font-bold rounded-xl btn-primary"
                >
                  {t.leads.profile.saveFollowup}
                </button>
              </div>
            </div>

            {/* Internal Notes */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#1F2937]">{t.leads.profile.internalNotes}</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder={t.leads.profile.addNotePlaceholder}
                  className="flex-1 h-9 px-3 text-xs border border-slate-200 rounded-lg text-[#1F2937]"
                />
                <button
                  type="button"
                  onClick={() => {
                    addLeadNote(activeLead.id, noteInput);
                    setNoteInput('');
                  }}
                  className="h-9 px-4 text-xs font-bold rounded-xl btn-primary shrink-0"
                >
                  {t.leads.profile.addNoteBtn}
                </button>
              </div>
              <div className="space-y-2">
                {activeLead.notes.map((n) => (
                  <div key={n.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-zinc-600 mb-1">
                      <span className="font-bold text-[#1F2937]">
                        {localizePersonName(n.author_name, language)}
                      </span>
                      <span className="font-mono-num">{n.created_at}</span>
                    </div>
                    <p className="text-[#1F2937]">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Appointment History & Conversation History */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                <h4 className="text-xs font-bold text-[#1F2937]">{t.leads.profile.appointmentHistory}</h4>
                {appointments.filter((a) => a.lead_id === activeLead.id).length === 0 ? (
                  <p className="text-xs text-zinc-500">{t.app.noData}</p>
                ) : (
                  appointments
                    .filter((a) => a.lead_id === activeLead.id)
                    .map((a) => (
                      <div key={a.id} className="text-xs border-t border-slate-100 pt-2">
                        <div className="font-bold text-[#1F2937] font-mono-num">
                          {a.date} · {a.time}
                        </div>
                        <div className="text-[11px] text-zinc-600">{t.appointmentStatuses[a.status]}</div>
                      </div>
                    ))
                )}
              </div>

              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                <h4 className="text-xs font-bold text-[#1F2937]">{t.leads.profile.conversationHistory}</h4>
                {conversations
                  .filter((c) => c.lead_id === activeLead.id)
                  .flatMap((c) => c.messages)
                  .slice(-3)
                  .map((m) => (
                    <div key={m.id} className="text-xs border-t border-slate-100 pt-2">
                      <span className="font-bold text-[#1F2937]">
                        {localizePersonName(m.sender_name, language)}:{' '}
                      </span>
                      <span className="text-zinc-700">{m.text}</span>
                    </div>
                  ))}
                {conversations.filter((c) => c.lead_id === activeLead.id).length === 0 && (
                  <p className="text-xs text-zinc-500">{t.app.noData}</p>
                )}
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-[#1F2937]">{t.leads.profile.activityTimeline}</h4>
              <div className="space-y-2">
                {activeLead.timeline.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3 text-xs border-b border-slate-100 pb-2">
                    <div>
                      <div className="font-bold text-[#1F2937]">{item.title}</div>
                      <div className="text-zinc-700">{item.description}</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        {localizePersonName(item.actor, language)}
                      </div>
                    </div>
                    <span className="text-[11px] text-zinc-500 font-mono-num shrink-0">
                      {localizeRelativeTime(item.timestamp, language)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      <LeadFormModal
        open={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        editingLead={editingLead}
      />

      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        title={t.leads.deleteLead}
        description={t.leads.deleteConfirm}
        confirmLabel={t.app.delete}
        cancelLabel={t.app.cancel}
        onConfirm={() => {
          if (deleteTargetId) deleteLead(deleteTargetId);
          setDeleteTargetId(null);
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
