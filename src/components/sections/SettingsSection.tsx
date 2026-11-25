import React, { useEffect, useState } from 'react';
import {
  Ban,
  Bell,
  Building2,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Coffee,
  Copy,
  Globe,
  Plus,
  Shield,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { localizePersonName, localizeRelativeTime } from '../../i18n/localizeData';
import { EmployeePermissions, Language, WorkingDayConfig } from '../../types/domain';
import {
  computeDayActiveHours,
  computeWeeklyActiveHours,
  ensureTimeOption,
  generateDayWorkingHours,
  generateHalfHourOptions,
  generateHourlyRange,
  getSlotAvailability,
} from '../../utils/scheduleUtils';

type SettingsTab =
  | 'agency'
  | 'hours'
  | 'appointments'
  | 'notifications'
  | 'localization'
  | 'permissions'
  | 'security';

export const SettingsSection: React.FC = () => {
  const {
    t,
    language,
    setLanguage,
    settings,
    updateSettings,
    employees,
    updateEmployee,
    currentUser,
    pushToast,
  } = useAgency();

  const [activeTab, setActiveTab] = useState<SettingsTab>('agency');
  const [formState, setFormState] = useState(settings);
  const [expandedDayKey, setExpandedDayKey] = useState<WorkingDayConfig['day_key']>('mon');
  const [newPeriodStart, setNewPeriodStart] = useState('11:30');
  const [newPeriodEnd, setNewPeriodEnd] = useState('12:30');
  const [newPeriodReason, setNewPeriodReason] = useState('');

  useEffect(() => {
    setFormState(settings);
  }, [settings]);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const tabs: { id: SettingsTab; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
    { id: 'agency', icon: Building2, label: t.settings.tabs.agency },
    { id: 'hours', icon: Clock, label: t.settings.tabs.hours },
    { id: 'appointments', icon: CalendarClock, label: t.settings.tabs.appointments },
    { id: 'notifications', icon: Bell, label: t.settings.tabs.notifications },
    { id: 'localization', icon: Globe, label: t.settings.tabs.localization },
    { id: 'permissions', icon: Users, label: t.settings.tabs.permissions },
    { id: 'security', icon: Shield, label: t.settings.tabs.security },
  ];

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateSettings(formState);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPw || !newPw || newPw !== confirmPw) {
      pushToast({ type: 'warning', title: t.settings.securityForm.passwordMismatch });
      return;
    }
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    pushToast({ type: 'success', title: t.settings.securityForm.passwordUpdated });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg sm:text-[19px] font-extrabold text-[#1F2937]">{t.settings.title}</h2>
        <p className="text-xs text-[#64748B] font-medium mt-0.5">{t.settings.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Settings Sub-navigation */}
        <div className="lg:col-span-3 bg-white border border-[#E3EAE5] card-surface rounded-2xl p-2.5 space-y-1">
          {tabs.map(({ id, icon: Icon, label }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-start ${
                  isActive ? 'btn-primary' : 'text-[#1F2937] hover:bg-[#F5F7F5]'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Panel */}
        <div className="lg:col-span-9 bg-white border border-[#E3EAE5] card-surface rounded-2xl p-5 sm:p-6">
          {/* A. Agency Info */}
          {activeTab === 'agency' && (
            <form onSubmit={handleSave} className="space-y-4">
              <h3 className="text-sm font-extrabold text-[#1F2937] pb-3 border-b border-[#E3EAE5]">
                {t.settings.tabs.agency}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {t.settings.agencyForm.name}
                  </label>
                  <input
                    type="text"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {t.settings.agencyForm.tagline}
                  </label>
                  <input
                    type="text"
                    value={formState.tagline}
                    onChange={(e) => setFormState({ ...formState, tagline: e.target.value })}
                    className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {t.settings.agencyForm.phone}
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={formState.phone}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {t.settings.agencyForm.email}
                  </label>
                  <input
                    type="email"
                    dir="ltr"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {t.settings.agencyForm.city}
                  </label>
                  <input
                    type="text"
                    value={formState.city}
                    onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                    className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {t.settings.agencyForm.website}
                  </label>
                  <input
                    type="url"
                    dir="ltr"
                    value={formState.website}
                    onChange={(e) => setFormState({ ...formState, website: e.target.value })}
                    className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.settings.agencyForm.address}
                </label>
                <input
                  type="text"
                  value={formState.address}
                  onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.settings.agencyForm.description}
                </label>
                <textarea
                  rows={3}
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  className="w-full p-3 text-xs border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold rounded-xl btn-primary"
                >
                  {t.app.save}
                </button>
              </div>
            </form>
          )}

          {/* B. Working Hours — Clear, Smooth, Visual Schedule Selector */}
          {activeTab === 'hours' && (() => {
            const halfHourOptions = generateHalfHourOptions(7, 22);
            const timelineHours = generateHourlyRange(8, 20);
            const enabledDaysCount = formState.working_days.filter((d) => d.enabled).length;
            const totalWeeklyHours = computeWeeklyActiveHours(formState.working_days);

            const applyPreset = (preset: 'standard' | 'continuous' | 'weekdays_only') => {
              const updated = formState.working_days.map((d) => {
                if (preset === 'weekdays_only') {
                  const isWeekday = !['sat', 'sun'].includes(d.day_key);
                  return { ...d, enabled: isWeekday };
                }
                if (preset === 'standard') {
                  if (d.day_key === 'sun') {
                    return { ...d, enabled: false };
                  }
                  if (d.day_key === 'sat') {
                    return {
                      ...d,
                      enabled: true,
                      open: '09:30',
                      close: '14:00',
                      break_start: '',
                      break_end: '',
                    };
                  }
                  return {
                    ...d,
                    enabled: true,
                    open: '09:00',
                    close: '18:30',
                    break_start: '13:00',
                    break_end: '14:30',
                  };
                }
                // continuous
                if (d.day_key === 'sun') {
                  return { ...d, enabled: false };
                }
                if (d.day_key === 'sat') {
                  return {
                    ...d,
                    enabled: true,
                    open: '09:00',
                    close: '13:00',
                    break_start: '',
                    break_end: '',
                  };
                }
                return {
                  ...d,
                  enabled: true,
                  open: '08:30',
                  close: '17:00',
                  break_start: '',
                  break_end: '',
                };
              });
              setFormState({ ...formState, working_days: updated });
              pushToast({ type: 'info', title: t.settings.hoursForm.presetAppliedToast });
            };

            return (
              <div className="space-y-6 working-hours-workspace">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-[#1F2937]">
                      {t.settings.tabs.hours}
                    </h3>
                    <p className="text-[13px] leading-6 text-[#64748B] mt-1 max-w-2xl">{t.settings.hoursForm.hourlySlotsHint}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const mon = formState.working_days.find((d) => d.day_key === 'mon');
                      if (!mon) return;
                      const updated = formState.working_days.map((d) =>
                        d.enabled && d.day_key !== 'mon'
                          ? {
                              ...d,
                              open: mon.open,
                              close: mon.close,
                              break_start: mon.break_start,
                              break_end: mon.break_end,
                              blocked_slots: [...(mon.blocked_slots ?? [])],
                              excluded_periods: (mon.excluded_periods ?? []).map((p) => ({ ...p })),
                            }
                          : d
                      );
                      setFormState({ ...formState, working_days: updated });
                      pushToast({ type: 'info', title: t.settings.hoursForm.copiedToast });
                    }}
                    className="h-9 px-3.5 rounded-xl text-xs font-bold btn-outline inline-flex items-center gap-1.5"
                  >
                    <Copy className="h-3.5 w-3.5 text-[#0284C7]" />
                    <span>{t.settings.hoursForm.copyMonToAll}</span>
                  </button>
                </div>

                {/* Weekly Summary + Quick Schedule Presets */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
                  <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                    <div className="px-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between">
                      <span className="text-[11px] font-bold text-[#64748B]">
                        {t.settings.hoursForm.activeDaysCount}
                      </span>
                      <span className="text-lg font-extrabold font-mono-num text-[#1E293B] mt-1">
                        {enabledDaysCount} / 7
                      </span>
                    </div>
                    <div className="px-4 py-3 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] flex flex-col justify-between">
                      <span className="text-[11px] font-bold text-[#0369A1]">
                        {t.settings.hoursForm.weeklyHoursTotal}
                      </span>
                      <span className="text-lg font-extrabold font-mono-num text-[#0284C7] mt-1">
                        {totalWeeklyHours} {t.settings.hoursForm.hoursUnit}
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-7 px-4 py-3 rounded-xl bg-[#FFF7ED]/70 border border-[#FED7AA] flex flex-col justify-center gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#C2410C]">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{t.settings.hoursForm.quickTemplatesLabel}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => applyPreset('standard')}
                        className="h-8 px-3 rounded-lg bg-white border border-[#FDBA74] text-[#9A3412] hover:bg-[#FFEDD5] text-[11px] font-bold transition-colors"
                      >
                        {t.settings.hoursForm.presetStandard}
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset('continuous')}
                        className="h-8 px-3 rounded-lg bg-white border border-[#BAE6FD] text-[#0369A1] hover:bg-[#F0F9FF] text-[11px] font-bold transition-colors"
                      >
                        {t.settings.hoursForm.presetContinuous}
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset('weekdays_only')}
                        className="h-8 px-3 rounded-lg bg-white border border-[#E2E8F0] text-[#1F2937] hover:bg-[#F8FAFC] text-[11px] font-bold transition-colors"
                      >
                        {t.settings.hoursForm.presetWeekdays}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Per-day Clear Structured Cards */}
                <div className="space-y-3.5">
                  {formState.working_days.map((day, idx) => {
                    const daySlots = day.enabled ? generateDayWorkingHours(day.open, day.close) : [];
                    const hasBreak = Boolean(day.break_start && day.break_end);
                    const activeHours = computeDayActiveHours(day);
                    const isExpanded = expandedDayKey === day.day_key && day.enabled;
                    const customBlocksCount =
                      (day.blocked_slots?.length ?? 0) + (day.excluded_periods?.length ?? 0);

                    const openOptions = ensureTimeOption(halfHourOptions, day.open);
                    const closeOptions = ensureTimeOption(halfHourOptions, day.close);
                    const breakStartOptions = ensureTimeOption(halfHourOptions, day.break_start);
                    const breakEndOptions = ensureTimeOption(halfHourOptions, day.break_end);

                    const updateDay = (patch: Partial<WorkingDayConfig>) => {
                      const updated = [...formState.working_days];
                      updated[idx] = { ...day, ...patch };
                      setFormState({ ...formState, working_days: updated });
                    };

                    const toggleDaySlot = (slot: string) => {
                      const current = day.blocked_slots ?? [];
                      const next = current.includes(slot)
                        ? current.filter((s) => s !== slot)
                        : [...current, slot];
                      updateDay({ blocked_slots: next });
                    };

                    return (
                      <div
                        key={day.day_key}
                        className={`border rounded-2xl overflow-hidden transition-all shadow-[0_2px_10px_rgba(18,53,43,0.035)] ${
                          day.enabled
                            ? isExpanded
                              ? 'border-[#EA580C]/60 bg-white shadow-sm'
                              : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                            : 'border-[#E2E8F0] bg-[#F8FAFC]/85'
                        }`}
                      >
                        {/* Main Day Row */}
                        <div className="p-4 sm:p-5 space-y-4">
                          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
                            {/* Day Name & Switch */}
                            <div className="flex items-center justify-between sm:justify-start gap-3 min-w-[205px]">
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={day.enabled}
                                  aria-label={t.days[day.day_key]}
                                  onClick={() => {
                                    const nextEnabled = !day.enabled;
                                    updateDay({ enabled: nextEnabled });
                                    if (nextEnabled) setExpandedDayKey(day.day_key);
                                  }}
                                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${
                                    day.enabled ? 'bg-[#EA580C]' : 'bg-slate-300'
                                  }`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                                      day.enabled
                                        ? 'ltr:translate-x-5 rtl:-translate-x-5'
                                        : 'translate-x-0'
                                    }`}
                                  />
                                </button>

                                <div>
                                  <div className="text-[15px] font-extrabold text-[#1F2937]">
                                    {t.days[day.day_key]}
                                  </div>
                                  <span
                                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mt-0.5 ${
                                      day.enabled
                                        ? 'bg-[#F0F9FF] text-[#0369A1] border border-[#BAE6FD]'
                                        : 'bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]'
                                    }`}
                                  >
                                    {day.enabled
                                      ? `${t.settings.hoursForm.openLabel} · ${activeHours} ${t.settings.hoursForm.hoursUnit}`
                                      : t.settings.hoursForm.closedLabel}
                                  </span>
                                </div>
                              </div>

                              {day.enabled && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedDayKey(
                                      isExpanded ? ('' as WorkingDayConfig['day_key']) : day.day_key
                                    )
                                  }
                                  className={`xl:hidden h-9 px-3 rounded-xl text-xs font-bold border inline-flex items-center gap-1.5 transition-colors ${
                                    isExpanded
                                      ? 'bg-[#EA580C] text-white border-[#C2410C]'
                                      : 'bg-white text-[#1F2937] border-[#E2E8F0] hover:bg-[#FFF7ED] hover:border-[#EA580C]'
                                  }`}
                                >
                                  <span>
                                    {isExpanded
                                      ? t.settings.hoursForm.hideSlotsBtn
                                      : t.settings.hoursForm.manageSlotsBtn}
                                  </span>
                                  {customBlocksCount > 0 && (
                                    <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] font-mono-num">
                                      {customBlocksCount}
                                    </span>
                                  )}
                                  {isExpanded ? (
                                    <ChevronUp className="h-3.5 w-3.5" />
                                  ) : (
                                    <ChevronDown className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              )}
                            </div>

                            {/* Structured Labeled Time Controls */}
                            {day.enabled ? (
                              <div className="flex flex-wrap items-end gap-2.5 flex-1">
                                {/* Open Time */}
                                <div className="min-w-[104px]">
                                  <label className="block text-[10px] font-bold text-[#64748B] mb-1">
                                    {t.settings.hoursForm.open}
                                  </label>
                                  <select
                                    value={day.open}
                                    onChange={(e) => updateDay({ open: e.target.value })}
                                    dir="ltr"
                                    className="w-full h-9 px-2.5 border border-[#CBD5E1] rounded-xl text-xs font-mono-num font-bold text-[#1F2937] bg-white"
                                  >
                                    {openOptions.map((opt) => (
                                      <option key={opt} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Close Time */}
                                <div className="min-w-[104px]">
                                  <label className="block text-[10px] font-bold text-[#64748B] mb-1">
                                    {t.settings.hoursForm.close}
                                  </label>
                                  <select
                                    value={day.close}
                                    onChange={(e) => updateDay({ close: e.target.value })}
                                    dir="ltr"
                                    className="w-full h-9 px-2.5 border border-[#CBD5E1] rounded-xl text-xs font-mono-num font-bold text-[#1F2937] bg-white"
                                  >
                                    {closeOptions.map((opt) => (
                                      <option key={opt} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Break Toggle */}
                                <div>
                                  <label className="block text-[10px] font-bold text-[#64748B] mb-1">
                                    {t.settings.hoursForm.breakTime}
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateDay(
                                        hasBreak
                                          ? { break_start: '', break_end: '' }
                                          : { break_start: '13:00', break_end: '14:30' }
                                      )
                                    }
                                    className={`h-9 px-3 rounded-xl text-xs font-bold border inline-flex items-center gap-1.5 transition-colors ${
                                      hasBreak
                                        ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
                                        : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]'
                                    }`}
                                  >
                                    <Coffee className="h-3.5 w-3.5 shrink-0" />
                                    <span>
                                      {hasBreak
                                        ? t.settings.hoursForm.hasBreak
                                        : t.settings.hoursForm.noBreak}
                                    </span>
                                  </button>
                                </div>

                                {/* Break Start & End */}
                                {hasBreak && (
                                  <div className="flex items-end gap-1.5 bg-[#FFFBEB]/65 border border-[#FDE68A] rounded-xl px-2.5 py-1.5">
                                    <div>
                                      <span className="block text-[10px] font-bold text-[#92400E] mb-0.5">
                                        {t.settings.hoursForm.periodStart}
                                      </span>
                                      <select
                                        value={day.break_start}
                                        onChange={(e) => updateDay({ break_start: e.target.value })}
                                        dir="ltr"
                                        className="h-7 px-2 border border-[#FCD34D] bg-white rounded-lg text-xs font-mono-num font-bold text-[#78350F]"
                                      >
                                        {breakStartOptions.map((opt) => (
                                          <option key={opt} value={opt}>
                                            {opt}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <span className="text-[#B45309] pb-1 font-bold">–</span>
                                    <div>
                                      <span className="block text-[10px] font-bold text-[#92400E] mb-0.5">
                                        {t.settings.hoursForm.periodEnd}
                                      </span>
                                      <select
                                        value={day.break_end}
                                        onChange={(e) => updateDay({ break_end: e.target.value })}
                                        dir="ltr"
                                        className="h-7 px-2 border border-[#FCD34D] bg-white rounded-lg text-xs font-mono-num font-bold text-[#78350F]"
                                      >
                                        {breakEndOptions.map((opt) => (
                                          <option key={opt} value={opt}>
                                            {opt}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex-1 text-xs font-medium text-[#64748B]">
                                {t.settings.hoursForm.closedDayHint}
                              </div>
                            )}

                            {/* Desktop Expand Button */}
                            {day.enabled && (
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedDayKey(
                                    isExpanded ? ('' as WorkingDayConfig['day_key']) : day.day_key
                                  )
                                }
                                className={`hidden xl:inline-flex h-9 px-3.5 rounded-xl text-xs font-bold border items-center gap-1.5 shrink-0 transition-colors ${
                                  isExpanded
                                    ? 'bg-[#EA580C] text-white border-[#C2410C]'
                                    : 'bg-white text-[#1F2937] border-[#E2E8F0] hover:bg-[#FFF7ED] hover:border-[#EA580C]'
                                }`}
                              >
                                <span>
                                  {isExpanded
                                    ? t.settings.hoursForm.hideSlotsBtn
                                    : t.settings.hoursForm.manageSlotsBtn}
                                </span>
                                {customBlocksCount > 0 && (
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono-num ${
                                      isExpanded
                                        ? 'bg-white/25 text-white'
                                        : 'bg-rose-600 text-white'
                                    }`}
                                  >
                                    {customBlocksCount}
                                  </span>
                                )}
                                {isExpanded ? (
                                  <ChevronUp className="h-3.5 w-3.5" />
                                ) : (
                                  <ChevronDown className="h-3.5 w-3.5" />
                                )}
                              </button>
                            )}
                          </div>

                          {/* Instant Visual Hourly Bar (08:00 -> 20:00) */}
                          {day.enabled && (
                            <div className="pt-1">
                              <div className="grid grid-cols-13 gap-1" dir="ltr">
                                {timelineHours.map((slot) => {
                                  const avail = getSlotAvailability(day, slot);
                                  const barTone =
                                    avail.status === 'available'
                                      ? 'bg-[#0284C7]'
                                      : avail.status === 'break'
                                        ? 'bg-[#F59E0B]'
                                        : avail.status === 'blocked_recurring'
                                          ? 'bg-[#FB7185]'
                                          : 'bg-[#E2E8F0]';
                                  return (
                                    <div key={slot} className="space-y-1">
                                      <div
                                        title={`${slot} — ${
                                          avail.status === 'available'
                                            ? t.settings.hoursForm.slotOpen
                                            : avail.status === 'break'
                                              ? t.settings.hoursForm.slotBreak
                                              : avail.status === 'blocked_recurring'
                                                ? t.settings.hoursForm.slotRemoved
                                                : t.appointments.agenda.outsideHours
                                        }`}
                                        className={`h-2 rounded-full transition-colors ${barTone}`}
                                      />
                                      <div className="hidden sm:block text-[9px] font-mono-num text-[#64748B] text-center">
                                        {slot.slice(0, 2)}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Expanded Interactive Hourly Slots & Custom Excluded Periods */}
                        {isExpanded && (
                          <div className="px-4 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] space-y-4">
                            <div>
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                                <span className="text-xs font-extrabold text-[#1F2937]">
                                  {t.settings.hoursForm.hourlySlotsTitle}
                                </span>
                                <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-[#475569]">
                                  <span className="inline-flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#0284C7]" />
                                    {t.settings.hoursForm.slotOpen}
                                  </span>
                                  <span className="inline-flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
                                    {t.settings.hoursForm.slotBreak}
                                  </span>
                                  <span className="inline-flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#E11D48]" />
                                    {t.settings.hoursForm.slotRemoved}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2.5">
                                {daySlots.map((slot) => {
                                  const avail = getSlotAvailability(day, slot);
                                  const isBreakSlot = avail.status === 'break';
                                  const isBlocked = avail.status === 'blocked_recurring';
                                  return (
                                    <button
                                      key={slot}
                                      type="button"
                                      disabled={isBreakSlot}
                                      onClick={() => toggleDaySlot(slot)}
                                      className={`min-h-10 px-3 rounded-xl text-[13px] font-mono-num font-bold border inline-flex items-center justify-center gap-2 transition-all ${
                                        isBreakSlot
                                          ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E] cursor-not-allowed'
                                          : isBlocked
                                            ? 'bg-[#FFF1F2] border-[#FECDD3] text-[#BE123C] line-through hover:bg-[#FFE4E6]'
                                            : 'bg-white border-[#BAE6FD] text-[#0369A1] hover:bg-[#F0F9FF] hover:border-[#0284C7] shadow-2xs'
                                      }`}
                                    >
                                      {isBreakSlot ? (
                                        <Coffee className="h-3.5 w-3.5 text-[#D97706] shrink-0" />
                                      ) : isBlocked ? (
                                        <Ban className="h-3.5 w-3.5 text-[#E11D48] shrink-0" />
                                      ) : (
                                        <Check className="h-3.5 w-3.5 text-[#0284C7] shrink-0" />
                                      )}
                                      <span>{slot}</span>
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Quick break presets */}
                              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                                <span className="font-bold text-[#64748B]">
                                  {t.settings.hoursForm.quickBreakPreset}
                                </span>
                                {[
                                  { start: '12:30', end: '14:00' },
                                  { start: '13:00', end: '14:30' },
                                  { start: '13:00', end: '14:00' },
                                ].map((preset) => (
                                  <button
                                    key={`${preset.start}-${preset.end}`}
                                    type="button"
                                    onClick={() =>
                                      updateDay({ break_start: preset.start, break_end: preset.end })
                                    }
                                    className="px-2.5 py-1 rounded-lg bg-white border border-[#FDE68A] text-[#92400E] hover:bg-[#FFFBEB] font-mono-num font-bold"
                                  >
                                    {preset.start}–{preset.end}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Custom Excluded Periods inside this day */}
                            <div className="pt-3.5 border-t border-[#E2E8F0] space-y-2.5">
                              <div className="text-xs font-extrabold text-[#1F2937]">
                                {t.settings.hoursForm.excludedPeriodsTitle}
                              </div>

                              {(day.excluded_periods ?? []).length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {(day.excluded_periods ?? []).map((p) => (
                                    <div
                                      key={p.id}
                                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#78350F]"
                                    >
                                      <span className="font-mono-num font-bold" dir="ltr">
                                        {p.start} – {p.end}
                                      </span>
                                      {p.label && <span className="font-medium">· {p.label}</span>}
                                      <button
                                        type="button"
                                        title={t.settings.hoursForm.removePeriod}
                                        onClick={() =>
                                          updateDay({
                                            excluded_periods: (day.excluded_periods ?? []).filter(
                                              (item) => item.id !== p.id
                                            ),
                                          })
                                        }
                                        className="text-rose-600 hover:text-rose-800"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="text-[11px] font-bold text-[#64748B]">
                                  {t.settings.hoursForm.periodStart}
                                </span>
                                <select
                                  value={newPeriodStart}
                                  onChange={(e) => setNewPeriodStart(e.target.value)}
                                  dir="ltr"
                                  className="h-9 px-2.5 border border-[#CBD5E1] rounded-xl bg-white font-mono-num text-xs font-bold"
                                >
                                  {ensureTimeOption(halfHourOptions, newPeriodStart).map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                                <span className="text-[11px] font-bold text-[#64748B]">
                                  {t.settings.hoursForm.periodEnd}
                                </span>
                                <select
                                  value={newPeriodEnd}
                                  onChange={(e) => setNewPeriodEnd(e.target.value)}
                                  dir="ltr"
                                  className="h-9 px-2.5 border border-[#CBD5E1] rounded-xl bg-white font-mono-num text-xs font-bold"
                                >
                                  {ensureTimeOption(halfHourOptions, newPeriodEnd).map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  value={newPeriodReason}
                                  onChange={(e) => setNewPeriodReason(e.target.value)}
                                  placeholder={t.settings.hoursForm.periodReasonPlaceholder}
                                  className="h-9 px-3 border border-[#CBD5E1] rounded-xl bg-white text-xs min-w-[180px] flex-1"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!newPeriodStart || !newPeriodEnd || newPeriodEnd <= newPeriodStart) return;
                                    updateDay({
                                      excluded_periods: [
                                        ...(day.excluded_periods ?? []),
                                        {
                                          id: `ep_${Date.now()}`,
                                          start: newPeriodStart,
                                          end: newPeriodEnd,
                                          label: newPeriodReason.trim() || undefined,
                                        },
                                      ],
                                    });
                                    setNewPeriodReason('');
                                  }}
                                  className="h-9 px-3.5 rounded-xl text-xs font-bold btn-outline inline-flex items-center gap-1.5"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                  <span>{t.settings.hoursForm.addExcludedPeriod}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:p-5">
                  <label className="block text-sm font-extrabold text-[#1F2937] mb-1.5">
                    {t.settings.hoursForm.holidays}
                  </label>
                  <input
                    type="text"
                    value={formState.holidays}
                    onChange={(e) => setFormState({ ...formState, holidays: e.target.value })}
                    className="w-full h-11 px-3.5 text-[13px] border border-[#CBD5E1] rounded-xl bg-white"
                  />
                  <p className="mt-2 text-xs leading-5 text-[#64748B]">استعمل هذا الحقل لتوضيح أيام العطل الرسمية أو الاستثنائية للفريق. أما إيقاف الحجوزات في يوم محدد أو فترة محددة، فاستعمل إدارة الفترات داخل اليوم المناسب.</p>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleSave()}
                    className="px-6 py-2.5 text-xs font-bold rounded-xl btn-primary"
                  >
                    {t.app.save}
                  </button>
                </div>
              </div>
            );
          })()}

          {/* D. Appointment Settings */}
          {activeTab === 'appointments' && (() => {
            const halfHourOptions = generateHalfHourOptions(7, 22);
            return (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-[#1F2937] pb-3 border-b border-[#E2E8F0]">
                  {t.settings.tabs.appointments}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-[#1F2937] mb-1.5">
                      {t.settings.appointmentsForm.duration} ({t.settings.appointmentsForm.minutes})
                    </label>
                    <select
                      value={formState.appointment_duration_minutes}
                      onChange={(e) =>
                        setFormState({ ...formState, appointment_duration_minutes: Number(e.target.value) })
                      }
                      className="w-full h-10 px-3 border border-[#CBD5E1] rounded-xl bg-white font-mono-num font-semibold"
                    >
                      {[30, 45, 60, 90].map((m) => (
                        <option key={m} value={m}>{m} {t.settings.appointmentsForm.minutes}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#1F2937] mb-1.5">
                      {t.settings.appointmentsForm.rescheduleLimit}
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formState.allow_reschedule_hours}
                      onChange={(e) =>
                        setFormState({ ...formState, allow_reschedule_hours: Number(e.target.value) })
                      }
                      className="w-full h-10 px-3 border border-[#CBD5E1] rounded-xl font-mono-num font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1F2937] mb-1.5">
                      {t.settings.appointmentsForm.bookingWindowStart}
                    </label>
                    <select
                      value={formState.booking_window_start}
                      onChange={(e) =>
                        setFormState({ ...formState, booking_window_start: e.target.value })
                      }
                      dir="ltr"
                      className="w-full h-10 px-3 border border-[#CBD5E1] rounded-xl bg-white font-mono-num font-bold"
                    >
                      {ensureTimeOption(halfHourOptions, formState.booking_window_start).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#1F2937] mb-1.5">
                      {t.settings.appointmentsForm.bookingWindowEnd}
                    </label>
                    <select
                      value={formState.booking_window_end}
                      onChange={(e) =>
                        setFormState({ ...formState, booking_window_end: e.target.value })
                      }
                      dir="ltr"
                      className="w-full h-10 px-3 border border-[#CBD5E1] rounded-xl bg-white font-mono-num font-bold"
                    >
                      {ensureTimeOption(halfHourOptions, formState.booking_window_end).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-[#1F2937] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formState.auto_confirm_appointments}
                      onChange={(e) =>
                        setFormState({ ...formState, auto_confirm_appointments: e.target.checked })
                      }
                      className="h-4 w-4 accent-[#EA580C]"
                    />
                    <span>{t.settings.appointmentsForm.autoConfirm}</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs font-semibold text-[#1F2937] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formState.send_visit_reminders}
                      onChange={(e) =>
                        setFormState({ ...formState, send_visit_reminders: e.target.checked })
                      }
                      className="h-4 w-4 accent-[#EA580C]"
                    />
                    <span>{t.settings.appointmentsForm.visitReminders}</span>
                  </label>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleSave()}
                    className="px-6 py-2.5 text-xs font-bold rounded-xl btn-primary"
                  >
                    {t.app.save}
                  </button>
                </div>
              </div>
            );
          })()}

          {/* E. Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-zinc-950 pb-3 border-b border-zinc-200">
                {t.settings.tabs.notifications}
              </h3>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl">
                {(
                  [
                    ['notify_new_lead', t.settings.notificationsForm.newLead],
                    ['notify_appointments', t.settings.notificationsForm.appointments],
                    ['notify_attendance', t.settings.notificationsForm.attendance],
                    ['notify_team_activity', t.settings.notificationsForm.teamActivity],
                    ['notify_email_digest', t.settings.notificationsForm.emailDigest],
                  ] as const
                ).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center justify-between px-4 py-3 text-xs cursor-pointer hover:bg-slate-50"
                  >
                    <span className="text-slate-800 font-medium">{label}</span>
                    <input
                      type="checkbox"
                      checked={formState[key]}
                      onChange={(e) => setFormState({ ...formState, [key]: e.target.checked })}
                      className="h-4 w-4 accent-[#16966A]"
                    />
                  </label>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSave()}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl btn-primary"
                >
                  {t.app.save}
                </button>
              </div>
            </div>
          )}

          {/* F. Language & Region */}
          {activeTab === 'localization' && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-zinc-950 pb-3 border-b border-zinc-200">
                {t.settings.tabs.localization}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {t.settings.localizationForm.language}
                  </label>
                  <select
                    value={language}
                    onChange={(e) => {
                      const lang = e.target.value as Language;
                      setLanguage(lang);
                      setFormState({ ...formState, default_language: lang });
                    }}
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="ar">العربية (RTL)</option>
                    <option value="en">English (LTR)</option>
                    <option value="fr">Français (LTR)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {t.settings.localizationForm.timezone}
                  </label>
                  <select
                    value={formState.timezone}
                    onChange={(e) => setFormState({ ...formState, timezone: e.target.value })}
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg bg-white font-mono-num"
                  >
                    <option value="Africa/Casablanca">Africa/Casablanca (GMT+1)</option>
                    <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {t.settings.localizationForm.dateFormat}
                  </label>
                  <select
                    value={formState.date_format}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        date_format: e.target.value as 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY',
                      })
                    }
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg bg-white font-mono-num"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {t.settings.localizationForm.currency}
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={
                      language === 'ar'
                        ? 'MAD (الدرهم المغربي)'
                        : language === 'fr'
                          ? 'MAD (Dirham marocain)'
                          : 'MAD (Moroccan Dirham)'
                    }
                    className="w-full h-9 px-3 border border-[#E3EAE5] rounded-lg bg-[#F5F7F5] text-[#1F2937] font-semibold font-mono-num"
                  />
                </div>
              </div>

              <p className="text-xs text-zinc-600">{t.settings.localizationForm.currencyNote}</p>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSave()}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl btn-primary"
                >
                  {t.app.save}
                </button>
              </div>
            </div>
          )}

          {/* G. Team Permissions Matrix */}
          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-zinc-950 pb-3 border-b border-zinc-200">
                {t.settings.tabs.permissions}
              </h3>

              <div className="overflow-x-auto border border-[#E3EAE5] rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-start border-collapse">
                  <thead>
                    <tr className="bg-[#1E293B] text-white border-b-2 border-[#EA580C] font-bold whitespace-nowrap">
                      <th className="py-3 px-3.5 text-start">{t.reports.teamSection.employee}</th>
                      {(Object.keys(t.team.permissionsLabels) as (keyof EmployeePermissions)[]).map((pk) => (
                        <th key={pk} className="py-3 px-2.5 text-center whitespace-nowrap">
                          {t.team.permissionsLabels[pk]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-[#FFF7ED]">
                        <td className="py-3 px-3.5 font-bold text-[#1F2937] whitespace-nowrap">
                          <div>{localizePersonName(emp.name, language)}</div>
                          <div className="text-[11px] text-[#64748B] font-medium">
                            {t.employeeRoles[emp.role]}
                          </div>
                        </td>
                        {(Object.keys(t.team.permissionsLabels) as (keyof EmployeePermissions)[]).map((pk) => (
                          <td key={pk} className="py-3 px-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={emp.permissions[pk]}
                              onChange={() =>
                                updateEmployee(emp.id, {
                                  permissions: { ...emp.permissions, [pk]: !emp.permissions[pk] },
                                })
                              }
                              className="h-4 w-4 accent-[#16966A]"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* H. Account & Security */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-sm font-extrabold text-[#1F2937] pb-3 border-b border-[#E3EAE5]">
                {t.settings.tabs.security}
              </h3>

              <div className="bg-[#F5F7F5] border border-[#E3EAE5] rounded-xl p-4 text-xs space-y-1">
                <div className="font-bold text-[#1F2937]">{t.settings.securityForm.accountInfo}</div>
                <div className="text-[#1F2937] font-semibold">
                  {localizePersonName(currentUser.name, language)} · {t.employeeRoles[currentUser.role]}
                </div>
                <div className="text-[#64748B] font-mono-num" dir="ltr">{currentUser.email}</div>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-3 max-w-md">
                <div className="text-xs font-bold text-[#1F2937]">
                  {t.settings.securityForm.changePassword}
                </div>
                <input
                  type="password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder={t.settings.securityForm.currentPassword}
                  className="w-full h-9 px-3 text-xs border border-[#E3EAE5] rounded-lg"
                />
                <input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder={t.settings.securityForm.newPassword}
                  className="w-full h-9 px-3 text-xs border border-[#E3EAE5] rounded-lg"
                />
                <input
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder={t.settings.securityForm.confirmPassword}
                  className="w-full h-9 px-3 text-xs border border-[#E3EAE5] rounded-lg"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold rounded-xl btn-primary"
                >
                  {t.settings.securityForm.updatePassword}
                </button>
              </form>

              <label className="flex items-center gap-2.5 text-xs text-[#1F2937] font-semibold cursor-pointer pt-2 border-t border-[#E3EAE5]">
                <input
                  type="checkbox"
                  checked={formState.two_factor_enabled}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setFormState({ ...formState, two_factor_enabled: val });
                    updateSettings({ two_factor_enabled: val });
                  }}
                  className="h-4 w-4 accent-[#16966A]"
                />
                <span>{t.settings.securityForm.twoFactor}</span>
              </label>

              <div className="space-y-2.5">
                <div className="text-xs font-bold text-[#1F2937]">
                  {t.settings.securityForm.activeSessions}
                </div>
                <div className="divide-y divide-[#E3EAE5] border border-[#E3EAE5] rounded-xl">
                  {formState.active_sessions.map((sess) => (
                    <div key={sess.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-semibold text-[#1F2937]">{sess.device}</div>
                        <div className="text-[11px] text-[#64748B] font-medium">
                          {sess.location} · {localizeRelativeTime(sess.last_active, language)}
                        </div>
                      </div>
                      {sess.current ? (
                        <span className="text-[11px] font-semibold text-emerald-700">
                          {t.settings.securityForm.currentSessionBadge}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const remaining = formState.active_sessions.filter((s) => s.id !== sess.id);
                            setFormState({ ...formState, active_sessions: remaining });
                            updateSettings({ active_sessions: remaining });
                          }}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] text-rose-600 hover:bg-rose-50"
                        >
                          {t.settings.securityForm.terminateSession}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
