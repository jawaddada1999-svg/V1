import React, { useMemo, useState } from 'react';
import {
  Bath,
  BedDouble,
  Building2,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  Handshake,
  Home,
  KeyRound,
  LayoutGrid,
  List,
  MapPin,
  Maximize2,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { MOROCCAN_CITIES } from '../../data/demoData';
import {
  localizeCity,
  localizeDistrict,
  localizePersonName,
  localizePropertyTitle,
  matchesLocalizedQuery,
} from '../../i18n/localizeData';
import { formatMAD, formatNumber } from '../../i18n/translations';
import { Property, PropertyStatus, PropertyType } from '../../types/domain';
import { PropertyFormModal } from '../modals/QuickModals';
import {
  ConfirmDialog,
  Drawer,
  EmptyState,
  KpiCard,
  SafeImage,
  StatusLabel,
} from '../ui/DataPrimitives';

type TxTab = 'all' | 'sale' | 'rent';

export const PropertiesSection: React.FC = () => {
  const {
    t,
    language,
    properties,
    leads,
    appointments,
    employees,
    owners,
    updateProperty,
    deleteProperty,
    addPropertyNote,
    selectedPropertyId,
    setSelectedPropertyId,
    openLeadProfile,
    setActiveSection,
    setSelectedOwnerId,
  } = useAgency();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [txTab, setTxTab] = useState<TxTab>('all');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');

  const [propModalOpen, setPropModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [noteInput, setNoteInput] = useState('');

  const counts = useMemo(() => {
    const total = properties.length;
    const available = properties.filter((p) => p.status === 'available').length;
    const forSale = properties.filter((p) => p.transaction_type === 'sale').length;
    const forRent = properties.filter((p) => p.transaction_type === 'rent').length;
    const reserved = properties.filter((p) => p.status === 'reserved').length;
    const closed = properties.filter((p) => p.status === 'sold' || p.status === 'rented').length;
    return { total, available, forSale, forRent, reserved, closed };
  }, [properties]);

  const filteredProperties = useMemo(() => {
    const q = search.trim();
    return properties.filter((p) => {
      if (txTab !== 'all' && p.transaction_type !== txTab) return false;
      if (typeFilter !== 'all' && p.type !== typeFilter) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (cityFilter !== 'all' && p.city !== cityFilter) return false;
      if (
        q &&
        !matchesLocalizedQuery(q, language, [p.title, p.ref, p.city, p.district, p.owner_name])
      ) {
        return false;
      }
      return true;
    });
  }, [properties, language, txTab, search, typeFilter, statusFilter, cityFilter]);

  const activeProperty = useMemo(
    () => properties.find((p) => p.id === selectedPropertyId) ?? null,
    [properties, selectedPropertyId]
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-[19px] font-bold text-[#1F2937]">{t.properties.title}</h2>
          <p className="text-xs text-[#64748B] font-medium mt-0.5">{t.properties.subtitle}</p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="inline-flex p-1 bg-white border border-[#E3EAE5] rounded-xl card-surface">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all ${
                viewMode === 'grid' ? 'btn-primary' : 'text-[#1F2937] hover:bg-[#F5F7F5]'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>{t.properties.gridView}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all ${
                viewMode === 'table' ? 'btn-primary' : 'text-[#1F2937] hover:bg-[#F5F7F5]'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>{t.properties.tableView}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingProperty(null);
              setPropModalOpen(true);
            }}
            className="h-9 px-4 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 btn-primary"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{t.properties.addProperty}</span>
          </button>
        </div>
      </div>

      {/* Prominent Property Counts KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <KpiCard
          title={t.properties.stats.total}
          value={formatNumber(counts.total, language)}
          icon={<Building2 className="h-4 w-4" />}
          tone="navy"
        />
        <KpiCard
          title={t.properties.stats.available}
          value={formatNumber(counts.available, language)}
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="emerald"
        />
        <KpiCard
          title={t.properties.stats.forSale}
          value={formatNumber(counts.forSale, language)}
          icon={<Home className="h-4 w-4" />}
          tone="sky"
        />
        <KpiCard
          title={t.properties.stats.forRent}
          value={formatNumber(counts.forRent, language)}
          icon={<KeyRound className="h-4 w-4" />}
          tone="orange"
        />
        <KpiCard
          title={t.properties.stats.reserved}
          value={formatNumber(counts.reserved, language)}
          icon={<Clock className="h-4 w-4" />}
          tone="amber"
        />
        <KpiCard
          title={t.properties.stats.closed}
          value={formatNumber(counts.closed, language)}
          icon={<Handshake className="h-4 w-4" />}
          tone="indigo"
        />
      </div>

      {/* Sale vs Rent Segmented Tabs */}
      <div className="flex flex-wrap items-center gap-2.5">
        {(
          [
            { id: 'all', label: t.properties.tabs.all, count: counts.total, activeClass: 'btn-primary' },
            { id: 'sale', label: t.properties.tabs.sale, count: counts.forSale, activeClass: 'bg-[#0EA5E9] text-white border-[#0EA5E9] shadow-sm shadow-[#0EA5E9]/25' },
            { id: 'rent', label: t.properties.tabs.rent, count: counts.forRent, activeClass: 'btn-accent' },
          ] as const
        ).map((tab) => {
          const isActive = txTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTxTab(tab.id)}
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

      {/* Filters */}
      <div className="bg-white border border-zinc-200 card-surface rounded-2xl p-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.app.search}
            className="w-full h-9 ps-8 pe-3 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-9 px-3 text-xs border border-slate-200 rounded-lg bg-white"
        >
          <option value="all">{t.properties.filters.allTypes}</option>
          {(Object.keys(t.propertyTypes) as PropertyType[]).map((pt) => (
            <option key={pt} value={pt}>{t.propertyTypes[pt]}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 text-xs border border-slate-200 rounded-lg bg-white"
        >
          <option value="all">{t.properties.filters.allStatuses}</option>
          {(Object.keys(t.propertyStatuses) as PropertyStatus[]).map((ps) => (
            <option key={ps} value={ps}>{t.propertyStatuses[ps]}</option>
          ))}
        </select>
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="h-9 px-3 text-xs font-semibold text-[#1F2937] border border-slate-200 rounded-lg bg-white"
        >
          <option value="all">{t.properties.filters.allCities}</option>
          {MOROCCAN_CITIES.map((c) => (
            <option key={c} value={c}>{localizeCity(c, language)}</option>
          ))}
        </select>
      </div>

      {/* Empty State or Content */}
      {filteredProperties.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-6 w-6" />}
          title={t.app.noData}
          action={
            <button
              type="button"
              onClick={() => {
                setEditingProperty(null);
                setPropModalOpen(true);
              }}
              className="px-4 py-2 text-xs font-bold rounded-xl btn-primary"
            >
              {t.properties.addProperty}
            </button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredProperties.map((prop) => (
            <div
              key={prop.id}
              className={`border card-surface rounded-2xl overflow-hidden flex flex-col transition-all hover:-translate-y-0.5 hover:shadow-md ${
                prop.transaction_type === 'sale'
                  ? 'bg-gradient-to-b from-white to-[#F0F9FF] border-[#BAE6FD]'
                  : 'bg-gradient-to-b from-white to-[#ECFDF5] border-[#A7F3D0]'
              }`}
            >
              <div
                className={`h-1 w-full ${
                  prop.transaction_type === 'sale' ? 'bg-[#0EA5E9]' : 'bg-[#16966A]'
                }`}
              />
              <div
                onClick={() => {
                  setActiveImageIdx(0);
                  setSelectedPropertyId(prop.id);
                }}
                className="relative aspect-[4/3] bg-[#F5F7F5] cursor-pointer overflow-hidden group"
              >
                <SafeImage
                  src={prop.images[0]}
                  alt={prop.title}
                  className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute top-3 start-3 flex items-center gap-1.5">
                  <StatusLabel
                    label={t.propertyStatuses[prop.status]}
                    propertyStatus={prop.status}
                  />
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold text-white ${
                      prop.transaction_type === 'sale' ? 'bg-[#0EA5E9]' : 'bg-[#16966A]'
                    }`}
                  >
                    {t.transactionTypes[prop.transaction_type]}
                  </span>
                </div>
                <div className="absolute bottom-3 start-3 end-3 flex items-end justify-between text-white">
                  <span className="text-xs font-mono-num opacity-90">
                    {t.properties.refPrefix}: {prop.ref}
                  </span>
                  <span className="text-sm font-extrabold font-mono-num">
                    {formatMAD(prop.price, language)}
                    {prop.transaction_type === 'rent' ? ` ${t.app.perMonth}` : ''}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <div className="text-[11px] font-medium text-zinc-600">
                    {t.propertyTypes[prop.type]} · {localizePersonName(prop.owner_name, language)}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveImageIdx(0);
                      setSelectedPropertyId(prop.id);
                    }}
                    className="mt-1 text-sm font-bold text-[#1F2937] hover:underline text-start line-clamp-1"
                  >
                    {localizePropertyTitle(prop.title, language)}
                  </button>
                  <div className="mt-1 flex items-center gap-1 text-xs text-zinc-600">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {localizeCity(prop.city, language)} — {localizeDistrict(prop.district, language)}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-600 tabular-nums">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1">
                      <Maximize2 className="h-3.5 w-3.5 text-zinc-400" />
                      {prop.area} {t.app.sqm}
                    </span>
                    {prop.bedrooms > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <BedDouble className="h-3.5 w-3.5 text-zinc-400" />
                        {prop.bedrooms}
                      </span>
                    )}
                    {prop.bathrooms > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Bath className="h-3.5 w-3.5 text-zinc-400" />
                        {prop.bathrooms}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveImageIdx(0);
                        setSelectedPropertyId(prop.id);
                      }}
                      className="h-7 w-7 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-900 hover:bg-zinc-200 inline-flex items-center justify-center transition-colors"
                      title={t.properties.details.title}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProperty(prop);
                        setPropModalOpen(true);
                      }}
                      className="h-7 w-7 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 inline-flex items-center justify-center transition-colors"
                      title={t.app.edit}
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(prop.id)}
                      className="h-7 w-7 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 inline-flex items-center justify-center transition-colors"
                      title={t.app.delete}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#E3EAE5] card-surface rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start border-collapse">
              <thead>
                <tr className="bg-[#F5F7F5] text-[#1F2937] border-b-2 border-[#E3EAE5] font-bold whitespace-nowrap">
                  <th className="py-3.5 px-4 text-start">{t.properties.form.ref}</th>
                  <th className="py-3.5 px-4 text-start">{t.properties.form.title}</th>
                  <th className="py-3.5 px-4 text-start">{t.properties.form.type}</th>
                  <th className="py-3.5 px-4 text-start">{t.properties.form.transactionType}</th>
                  <th className="py-3.5 px-4 text-start">{t.properties.form.price}</th>
                  <th className="py-3.5 px-4 text-start">{t.properties.form.city}</th>
                  <th className="py-3.5 px-4 text-start">{t.properties.area}</th>
                  <th className="py-3.5 px-4 text-start">{t.properties.details.ownerInfo}</th>
                  <th className="py-3.5 px-4 text-start">{t.properties.form.assignedEmployee}</th>
                  <th className="py-3.5 px-4 text-start">{t.properties.form.status}</th>
                  <th className="py-3.5 px-4 text-end">{t.app.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3EAE5]">
                {filteredProperties.map((prop) => {
                  const emp = employees.find((e) => e.id === prop.assigned_employee_id);
                  return (
                    <tr key={prop.id} className="hover:bg-[#F5F7F5]">
                      <td className="py-3 px-4 font-mono-num font-bold text-[#1F2937] whitespace-nowrap">
                        {prop.ref}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveImageIdx(0);
                            setSelectedPropertyId(prop.id);
                          }}
                          className="font-bold text-[#1F2937] hover:underline text-start"
                        >
                          {localizePropertyTitle(prop.title, language)}
                        </button>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-[#1F2937]">
                        {t.propertyTypes[prop.type]}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                            prop.transaction_type === 'sale'
                              ? 'bg-[#F0F9FF] text-[#0369A1] border-[#BAE6FD]'
                              : 'bg-[#ECFDF5] text-[#117A57] border-[#A7F3D0]'
                          }`}
                        >
                          {t.transactionTypes[prop.transaction_type]}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono-num font-extrabold text-[#1F2937] whitespace-nowrap">
                        {formatMAD(prop.price, language)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-semibold text-[#1F2937]">
                        {localizeCity(prop.city, language)}
                      </td>
                      <td className="py-3 px-4 font-mono-num font-semibold text-[#1F2937] whitespace-nowrap">
                        {prop.area} {t.app.sqm}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-[#1F2937]">
                        {localizePersonName(prop.owner_name, language)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-[#1F2937]">
                        {emp ? localizePersonName(emp.name, language) : '—'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusLabel label={t.propertyStatuses[prop.status]} propertyStatus={prop.status} />
                      </td>
                      <td className="py-3 px-4 text-end whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProperty(prop);
                              setPropModalOpen(true);
                            }}
                            className="h-7 w-7 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 inline-flex items-center justify-center transition-colors"
                            title={t.app.edit}
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTargetId(prop.id)}
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
        </div>
      )}

      {/* Property Details Drawer */}
      <Drawer
        open={Boolean(activeProperty)}
        onClose={() => setSelectedPropertyId(null)}
        title={activeProperty ? localizePropertyTitle(activeProperty.title, language) : ''}
        subtitle={`${t.properties.refPrefix}: ${activeProperty?.ref ?? ''}`}
        dir={t.app.dir}
      >
        {activeProperty && (
          <div className="space-y-6">
            {/* Image Gallery */}
            <div className="space-y-2.5">
              <div className="aspect-[16/10] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <SafeImage
                  src={activeProperty.images[activeImageIdx] ?? activeProperty.images[0]}
                  alt={localizePropertyTitle(activeProperty.title, language)}
                  className="h-full w-full object-cover"
                />
              </div>
              {activeProperty.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto">
                  {activeProperty.images.map((img, idx) => (
                    <button
                      key={img + idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`h-14 w-20 rounded-lg overflow-hidden border-2 shrink-0 ${
                        idx === activeImageIdx ? 'border-emerald-600' : 'border-transparent opacity-70'
                      }`}
                    >
                      <SafeImage src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price & Status Quick Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <div className="text-xl font-extrabold text-[#1F2937] font-mono-num">
                  {formatMAD(activeProperty.price, language)}
                  {activeProperty.transaction_type === 'rent' ? ` ${t.app.perMonth}` : ''}
                </div>
                <div className="text-xs text-zinc-600 font-medium mt-0.5">
                  {`${localizeCity(activeProperty.city, language)} — ${localizeDistrict(activeProperty.district, language)}`}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={activeProperty.status}
                  onChange={(e) =>
                    updateProperty(activeProperty.id, { status: e.target.value as PropertyStatus })
                  }
                  className="h-9 px-3 text-xs border border-zinc-200 rounded-lg bg-white text-zinc-950"
                >
                  {(Object.keys(t.propertyStatuses) as PropertyStatus[]).map((ps) => (
                    <option key={ps} value={ps}>{t.propertyStatuses[ps]}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProperty(activeProperty);
                    setPropModalOpen(true);
                  }}
                  className="h-9 px-3 text-xs font-bold rounded-lg btn-outline"
                >
                  {t.app.edit}
                </button>
              </div>
            </div>

            {/* Specifications */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                <span className="text-zinc-500 block">{t.properties.area}</span>
                <span className="font-bold text-zinc-950 font-mono-num">
                  {activeProperty.area} {t.app.sqm}
                </span>
              </div>
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                <span className="text-zinc-500 block">{t.properties.bedrooms}</span>
                <span className="font-bold text-zinc-950 font-mono-num">{activeProperty.bedrooms}</span>
              </div>
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                <span className="text-zinc-500 block">{t.properties.bathrooms}</span>
                <span className="font-bold text-zinc-950 font-mono-num">{activeProperty.bathrooms}</span>
              </div>
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                <span className="text-zinc-500 block">{t.properties.views}</span>
                <span className="font-bold text-zinc-950 font-mono-num">{activeProperty.views}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-1.5">{t.properties.details.description}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{activeProperty.description}</p>
            </div>

            {/* Owner & Assigned Employee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="border border-slate-200 rounded-xl p-3.5">
                <div className="font-bold text-[#1F2937] mb-1">{t.properties.details.ownerInfo}</div>
                {(() => {
                  const matchedOwner = owners.find(
                    (o) => o.id === activeProperty.owner_id || o.name === activeProperty.owner_name
                  );
                  return matchedOwner ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPropertyId(null);
                        setSelectedOwnerId(matchedOwner.id);
                        setActiveSection('owners');
                      }}
                      className="font-bold text-[#16966A] hover:underline text-start"
                    >
                      {localizePersonName(matchedOwner.name, language)}
                    </button>
                  ) : (
                    <div className="font-semibold text-[#1F2937]">
                      {localizePersonName(activeProperty.owner_name, language)}
                    </div>
                  );
                })()}
                <div className="text-[#64748B] font-mono-num mt-0.5" dir="ltr">
                  {activeProperty.owner_phone}
                </div>
              </div>
              <div className="border border-[#E3EAE5] rounded-xl p-3.5">
                <div className="font-bold text-[#1F2937] mb-1">{t.properties.details.assignedEmployee}</div>
                <select
                  value={activeProperty.assigned_employee_id}
                  onChange={(e) =>
                    updateProperty(activeProperty.id, { assigned_employee_id: e.target.value })
                  }
                  className="w-full h-8 px-2 text-xs font-semibold text-[#1F2937] border border-[#E3EAE5] rounded-lg bg-white mt-1"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {localizePersonName(emp.name, language)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Interested Leads & Related Appointments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-[#E3EAE5] rounded-xl p-3.5 space-y-2">
                <h4 className="text-xs font-bold text-[#1F2937]">{t.properties.details.interestedLeads}</h4>
                {leads.filter((l) => l.interested_property_id === activeProperty.id).length === 0 ? (
                  <p className="text-xs text-[#64748B]">{t.properties.details.noInterestedLeads}</p>
                ) : (
                  leads
                    .filter((l) => l.interested_property_id === activeProperty.id)
                    .map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => openLeadProfile(l.id)}
                        className="w-full text-start border-t border-[#E3EAE5] pt-2 flex items-center justify-between text-xs hover:text-[#16966A]"
                      >
                        <span className="font-bold text-[#1F2937]">
                          {localizePersonName(l.name, language)}
                        </span>
                        <span className="text-[#64748B]">{t.leadStatuses[l.status]}</span>
                      </button>
                    ))
                )}
              </div>

              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                <h4 className="text-xs font-bold text-[#1F2937]">{t.properties.details.relatedAppointments}</h4>
                {appointments.filter((a) => a.property_id === activeProperty.id).length === 0 ? (
                  <p className="text-xs text-zinc-500">{t.properties.details.noAppointments}</p>
                ) : (
                  appointments
                    .filter((a) => a.property_id === activeProperty.id)
                    .map((a) => (
                      <div key={a.id} className="border-t border-slate-100 pt-2 text-xs">
                        <div className="font-mono-num font-bold text-[#1F2937]">{a.date} · {a.time}</div>
                        <div className="text-[11px] text-zinc-600">{t.appointmentStatuses[a.status]}</div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Internal Notes */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-[#1F2937]">{t.properties.details.internalNotes}</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder={t.properties.details.addNotePlaceholder}
                  className="flex-1 h-9 px-3 text-xs border border-slate-200 rounded-lg text-[#1F2937]"
                />
                <button
                  type="button"
                  onClick={() => {
                    addPropertyNote(activeProperty.id, noteInput);
                    setNoteInput('');
                  }}
                  className="h-9 px-4 text-xs font-bold rounded-xl btn-primary"
                >
                  {t.app.add}
                </button>
              </div>
              {activeProperty.notes.map((n) => (
                <div key={n.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
                  <div className="flex justify-between text-[11px] text-zinc-600 mb-1">
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
        )}
      </Drawer>

      <PropertyFormModal
        open={propModalOpen}
        onClose={() => setPropModalOpen(false)}
        editingProperty={editingProperty}
      />

      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        title={t.properties.deleteProperty}
        description={t.properties.deleteConfirm}
        confirmLabel={t.app.delete}
        cancelLabel={t.app.cancel}
        onConfirm={() => {
          if (deleteTargetId) deleteProperty(deleteTargetId);
          setDeleteTargetId(null);
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
