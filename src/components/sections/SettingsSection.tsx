import React, { useEffect, useState } from 'react';
import {
  Ban,
  Bell,
  Building2,
  CalendarClock,
  Check,
  Clock,
  Coffee,
  Copy,
  Globe,
  Plus,
  Shield,
  Trash2,
  Users,
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { localizePersonName, localizeRelativeTime } from '../../i18n/localizeData';
import { EmployeePermissions, Language, WorkingDayConfig } from '../../types/domain';
import {
  computeDayActiveHours,
  computeWeeklyActiveHours,
  generateDayWorkingHours,
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

          {/* B. Working Hours — Practical Midday Break & Removable Slots */}
          {activeTab === 'hours' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-200">
                <div>
                  <h3 className="text-sm font-bold text-zinc-950">{t.settings.tabs.hours}</h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{t.settings.hoursForm.hourlySlotsHint}</p>
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
                  className="h-8 px-3 rounded-lg text-[11px] font-semibold btn-outline inline-flex items-center gap-1.5"
                >
                  <Copy className="h-3.5 w-3.5 text-zinc-700" />
                  <span>{t.settings.hoursForm.copyMonToAll}</span>
                </button>
              </div>

              {/* Weekly Summary Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="px-4 py-3 rounded-xl bg-[#F5F7F5] border border-[#E3EAE5] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#1F2937]">{t.settings.hoursForm.activeDaysCount}</span>
                  <span className="text-sm font-bold font-mono-num text-[#1F2937]">
                    {formState.working_days.filter((d) => d.enabled).length} / 7
                  </span>
                </div>
                <div className="px-4 py-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#1F2937]">{t.settings.hoursForm.weeklyHoursTotal}</span>
                  <span className="text-sm font-bold font-mono-num text-[#16966A]">
                    {computeWeeklyActiveHours(formState.working_days)} {t.settings.hoursForm.hoursUnit}
                  </span>
                </div>
              </div>

              {/* Per-day Cards */}
              <div className="space-y-2.5">
                {formState.working_days.map((day, idx) => {
                  const daySlots = day.enabled ? generateDayWorkingHours(day.open, day.close) : [];
                  const hasBreak = Boolean(day.break_start && day.break_end);
                  const activeHours = computeDayActiveHours(day);
                  const isExpanded = expandedDayKey === day.day_key && day.enabled;

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
                      className={`border rounded-xl overflow-hidden transition-colors ${
                        day.enabled
                          ? isExpanded
                            ? 'border-[#16966A]/50 bg-white shadow-2xs'
                            : 'border-[#E3EAE5] bg-white'
                          : 'border-[#E3EAE5]/80 bg-[#F5F7F5]/70'
                      }`}
                    >
                      {/* Main Day Row */}
                      <div className="p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3 min-w-[160px]">
                          <label className="flex items-center gap-2.5 font-semibold text-[#1F2937] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={day.enabled}
                              onChange={(e) => {
                                updateDay({ enabled: e.target.checked });
                                if (e.target.checked) setExpandedDayKey(day.day_key);
                              }}
                              className="h-4 w-4 accent-[#16966A]"
                            />
                            <span>{t.days[day.day_key]}</span>
                          </label>
                          {day.enabled && (
                            <span className="text-[11px] font-mono-num font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                              {activeHours} {t.settings.hoursForm.hoursUnit}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                          {/* Open - Close */}
                          <div className="flex items-center gap-1.5 font-mono-num">
                            <input
                              type="time"
                              disabled={!day.enabled}
                              value={day.open}
                              onChange={(e) => updateDay({ open: e.target.value })}
                              className="h-8 px-2 border border-zinc-200 rounded-lg text-xs disabled:opacity-40 bg-white"
                            />
                            <span className="text-zinc-400">–</span>
                            <input
                              type="time"
                              disabled={!day.enabled}
                              value={day.close}
                              onChange={(e) => updateDay({ close: e.target.value })}
                              className="h-8 px-2 border border-zinc-200 rounded-lg text-xs disabled:opacity-40 bg-white"
                            />
                          </div>

                          {/* Break toggle + times */}
                          {day.enabled && (
                            <button
                              type="button"
                              onClick={() =>
                                updateDay(
                                  hasBreak
                                    ? { break_start: '', break_end: '' }
                                    : { break_start: '13:00', break_end: '14:30' }
                                )
                              }
                              className={`h-8 px-2.5 rounded-lg text-[11px] font-medium border inline-flex items-center gap-1.5 transition-colors ${
                                hasBreak
                                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                                  : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                              }`}
                            >
                              <Coffee className="h-3.5 w-3.5" />
                              <span>{hasBreak ? t.settings.hoursForm.hasBreak : t.settings.hoursForm.noBreak}</span>
                            </button>
                          )}

                          {day.enabled && hasBreak && (
                            <div className="flex items-center gap-1 font-mono-num">
                              <input
                                type="time"
                                value={day.break_start}
                                onChange={(e) => updateDay({ break_start: e.target.value })}
                                className="h-8 px-2 border border-amber-200 bg-amber-50/40 rounded-lg text-xs"
                              />
                              <span className="text-zinc-400">–</span>
                              <input
                                type="time"
                                value={day.break_end}
                                onChange={(e) => updateDay({ break_end: e.target.value })}
                                className="h-8 px-2 border border-amber-200 bg-amber-50/40 rounded-lg text-xs"
                              />
                            </div>
                          )}

                          {day.enabled && (
                            <button
                              type="button"
                              onClick={() => setExpandedDayKey(isExpanded ? ('' as WorkingDayConfig['day_key']) : day.day_key)}
                              className={`h-8 px-2.5 rounded-lg text-[11px] font-semibold border transition-colors ${
                                isExpanded
                                  ? 'bg-[#16966A] text-white border-[#117A57]'
                                  : 'bg-white text-[#1F2937] border-[#E3EAE5] hover:bg-[#ECFDF5]'
                              }`}
                            >
                              {t.settings.hoursForm.hourlySlotsTitle.split('(')[0].trim()}
                              {((day.blocked_slots?.length ?? 0) + (day.excluded_periods?.length ?? 0)) > 0 && (
                                <span className="ms-1.5 px-1.5 py-0.2 rounded bg-rose-500 text-white text-[10px] font-mono-num">
                                  {(day.blocked_slots?.length ?? 0) + (day.excluded_periods?.length ?? 0)}
                                </span>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded Interactive Midday Slots & Custom Excluded Periods */}
                      {isExpanded && (
                        <div className="px-4 py-3.5 bg-[#F8FAFC] border-t border-zinc-200/80 space-y-3.5">
                          <div>
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                              <span className="text-[11px] font-bold text-zinc-900">
                                {t.settings.hoursForm.hourlySlotsTitle}
                              </span>
                              <div className="flex items-center gap-3 text-[10px] text-zinc-600">
                                <span className="inline-flex items-center gap-1">
                                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                                  {t.settings.hoursForm.slotOpen}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                                  {t.settings.hoursForm.slotBreak}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                                  {t.settings.hoursForm.slotRemoved}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
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
                                    className={`h-8 px-2.5 rounded-lg text-[11px] font-mono-num font-semibold border inline-flex items-center gap-1 transition-all ${
                                      isBreakSlot
                                        ? 'bg-amber-50 border-amber-200 text-amber-800 cursor-not-allowed'
                                        : isBlocked
                                          ? 'bg-rose-50 border-rose-200 text-rose-700 line-through hover:bg-rose-100'
                                          : 'bg-white border-emerald-300 text-zinc-950 hover:bg-emerald-50 hover:border-emerald-500 shadow-2xs'
                                    }`}
                                  >
                                    {isBreakSlot ? (
                                      <Coffee className="h-3 w-3 text-amber-600" />
                                    ) : isBlocked ? (
                                      <Ban className="h-3 w-3 text-rose-500" />
                                    ) : (
                                      <Check className="h-3 w-3 text-emerald-600" />
                                    )}
                                    <span>{slot}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Custom Excluded Periods inside this day */}
                          <div className="pt-3 border-t border-zinc-200/80 space-y-2.5">
                            <div className="text-[11px] font-bold text-zinc-900">
                              {t.settings.hoursForm.excludedPeriodsTitle}
                            </div>

                            {(day.excluded_periods ?? []).length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {(day.excluded_periods ?? []).map((p) => (
                                  <div
                                    key={p.id}
                                    className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-zinc-900"
                                  >
                                    <span className="font-mono-num font-semibold" dir="ltr">
                                      {p.start} – {p.end}
                                    </span>
                                    {p.label && <span className="text-zinc-600">· {p.label}</span>}
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
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="text-[11px] text-zinc-600">{t.settings.hoursForm.periodStart}</span>
                              <input
                                type="time"
                                value={newPeriodStart}
                                onChange={(e) => setNewPeriodStart(e.target.value)}
                                className="h-8 px-2 border border-zinc-200 rounded-lg bg-white font-mono-num text-xs"
                              />
                              <span className="text-[11px] text-zinc-600">{t.settings.hoursForm.periodEnd}</span>
                              <input
                                type="time"
                                value={newPeriodEnd}
                                onChange={(e) => setNewPeriodEnd(e.target.value)}
                                className="h-8 px-2 border border-zinc-200 rounded-lg bg-white font-mono-num text-xs"
                              />
                              <input
                                type="text"
                                value={newPeriodReason}
                                onChange={(e) => setNewPeriodReason(e.target.value)}
                                placeholder={t.settings.hoursForm.periodReasonPlaceholder}
                                className="h-8 px-2.5 border border-zinc-200 rounded-lg bg-white text-xs min-w-[180px] flex-1"
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
                                className="h-8 px-3 rounded-lg text-[11px] font-semibold btn-outline inline-flex items-center gap-1"
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

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.settings.hoursForm.holidays}
                </label>
                <input
                  type="text"
                  value={formState.holidays}
                  onChange={(e) => setFormState({ ...formState, holidays: e.target.value })}
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg"
                />
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

          {/* D. Appointment Settings */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-zinc-950 pb-3 border-b border-zinc-200">
                {t.settings.tabs.appointments}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {t.settings.appointmentsForm.duration} ({t.settings.appointmentsForm.minutes})
                  </label>
                  <select
                    value={formState.appointment_duration_minutes}
                    onChange={(e) =>
                      setFormState({ ...formState, appointment_duration_minutes: Number(e.target.value) })
                    }
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg bg-white font-mono-num"
                  >
                    {[30, 45, 60, 90].map((m) => (
                      <option key={m} value={m}>{m} {t.settings.appointmentsForm.minutes}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {t.settings.appointmentsForm.rescheduleLimit}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formState.allow_reschedule_hours}
                    onChange={(e) =>
                      setFormState({ ...formState, allow_reschedule_hours: Number(e.target.value) })
                    }
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg font-mono-num"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {t.settings.appointmentsForm.bookingWindowStart}
                  </label>
                  <input
                    type="time"
                    value={formState.booking_window_start}
                    onChange={(e) =>
                      setFormState({ ...formState, booking_window_start: e.target.value })
                    }
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg font-mono-num"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {t.settings.appointmentsForm.bookingWindowEnd}
                  </label>
                  <input
                    type="time"
                    value={formState.booking_window_end}
                    onChange={(e) =>
                      setFormState({ ...formState, booking_window_end: e.target.value })
                    }
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg font-mono-num"
                  />
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.auto_confirm_appointments}
                    onChange={(e) =>
                      setFormState({ ...formState, auto_confirm_appointments: e.target.checked })
                    }
                    className="h-4 w-4 accent-[#16966A]"
                  />
                  <span>{t.settings.appointmentsForm.autoConfirm}</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.send_visit_reminders}
                    onChange={(e) =>
                      setFormState({ ...formState, send_visit_reminders: e.target.checked })
                    }
                    className="h-4 w-4 accent-[#16966A]"
                  />
                  <span>{t.settings.appointmentsForm.visitReminders}</span>
                </label>
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
                    <tr className="bg-[#F5F7F5] text-[#1F2937] border-b-2 border-[#E3EAE5] font-bold whitespace-nowrap">
                      <th className="py-3 px-3.5 text-start">{t.reports.teamSection.employee}</th>
                      {(Object.keys(t.team.permissionsLabels) as (keyof EmployeePermissions)[]).map((pk) => (
                        <th key={pk} className="py-3 px-2.5 text-center whitespace-nowrap">
                          {t.team.permissionsLabels[pk]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3EAE5]">
                    {employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-[#F5F7F5]">
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
