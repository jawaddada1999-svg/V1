import React, { useMemo, useState } from 'react';
import {
  Ban,
  Calendar,
  CalendarCheck2,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Edit3,
  MessageCircle,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Table2,
  UserCheck,
  UserX,
  X,
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import {
  localizeCity,
  localizePersonName,
  localizePropertyTitle,
  matchesLocalizedQuery,
} from '../../i18n/localizeData';
import { formatMAD, formatShortDate } from '../../i18n/translations';
import { Appointment, AppointmentStatus } from '../../types/domain';
import { buildTelHref, buildWhatsAppHref } from '../../utils/contactLinks';
import {
  addDaysIso,
  getMonthCalendarGrid,
  getTodayIso,
  getWeekDatesFrom,
} from '../../utils/dateUtils';
import {
  generateHourlyRange,
  getDayKeyFromIsoDate,
  getSlotAvailability,
  shiftIsoDate,
} from '../../utils/scheduleUtils';
import { AppointmentFormModal } from '../modals/QuickModals';
import {
  ClassificationBadge,
  ConfirmDialog,
  ContactMethodBadge,
  EmptyState,
  KpiCard,
  Modal,
  StatusLabel,
} from '../ui/DataPrimitives';

type ViewTab = 'table' | 'daily' | 'weekly' | 'monthly';

const aptCardTone: Record<AppointmentStatus, string> = {
  scheduled: 'bg-[#F0F9FF] border-[#BAE6FD] border-s-4 border-s-[#0EA5E9]',
  confirmed: 'bg-[#ECFDF5] border-[#A7F3D0] border-s-4 border-s-[#16966A]',
  attended: 'bg-[#ECFDF5] border-[#A7F3D0] border-s-4 border-s-[#10B981]',
  no_show: 'bg-[#FEF2F2] border-[#FECACA] border-s-4 border-s-[#EF4444]',
  cancelled: 'bg-[#F5F7F5] border-[#E3EAE5] border-s-4 border-s-[#64748B]',
  rescheduled: 'bg-[#FFFBEB] border-[#FDE68A] border-s-4 border-s-[#F59E0B]',
};

const monthChipTone: Record<AppointmentStatus, string> = {
  scheduled: 'bg-sky-50 text-sky-900 border-sky-200',
  confirmed: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  attended: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  no_show: 'bg-rose-50 text-rose-900 border-rose-200',
  cancelled: 'bg-zinc-100 text-zinc-600 border-zinc-200 line-through',
  rescheduled: 'bg-amber-50 text-amber-900 border-amber-200',
};

export const AppointmentsSection: React.FC = () => {
  const {
    t,
    language,
    appointments,
    leads,
    properties,
    employees,
    settings,
    updateSettings,
    updateAppointment,
    openLeadProfile,
    setActiveSection,
    pushToast,
  } = useAgency();

  const todayIso = getTodayIso();
  const [todayYear, todayMonth] = todayIso.split('-').map(Number);

  const [viewTab, setViewTab] = useState<ViewTab>('daily');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedDay, setSelectedDay] = useState(todayIso);
  const [weekAnchor, setWeekAnchor] = useState(todayIso);
  const [calendarYear, setCalendarYear] = useState(todayYear);
  const [calendarMonth, setCalendarMonth] = useState(todayMonth - 1);
  const [searchQuery, setSearchQuery] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [aptModalOpen, setAptModalOpen] = useState(false);
  const [editingApt, setEditingApt] = useState<Appointment | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string>(todayIso);
  const [modalDefaultTime, setModalDefaultTime] = useState<string>('11:00');
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState(todayIso);
  const [newTime, setNewTime] = useState('11:00');

  const isRtl = t.app.dir === 'rtl';

  const filteredAppointments = useMemo(() => {
    const q = searchQuery.trim();
    return appointments
      .filter((a) => {
        if (dateFilter && a.date !== dateFilter) return false;
        if (employeeFilter !== 'all' && a.employee_id !== employeeFilter) return false;
        if (statusFilter !== 'all' && a.status !== statusFilter) return false;
        if (q) {
          const lead = leads.find((l) => l.id === a.lead_id);
          const prop = properties.find((p) => p.id === a.property_id);
          const emp = employees.find((e) => e.id === a.employee_id);
          if (
            !matchesLocalizedQuery(q, language, [
              lead?.name,
              lead?.phone,
              lead?.city,
              prop?.title,
              prop?.city,
              emp?.name,
            ])
          ) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  }, [appointments, language, dateFilter, employeeFilter, statusFilter, searchQuery, leads, properties, employees]);

  const stats = useMemo(() => {
    const total = appointments.length;
    const upcoming = appointments.filter((a) => a.status === 'scheduled' || a.status === 'confirmed').length;
    const attended = appointments.filter((a) => a.status === 'attended').length;
    const noShow = appointments.filter((a) => a.status === 'no_show').length;
    return { total, upcoming, completed: attended + noShow, attended, noShow };
  }, [appointments]);

  const weekDays = useMemo(() => getWeekDatesFrom(weekAnchor), [weekAnchor]);

  const monthCells = useMemo(
    () => getMonthCalendarGrid(calendarYear, calendarMonth),
    [calendarYear, calendarMonth]
  );

  const monthHeading = useMemo(() => {
    const dt = new Date(Date.UTC(calendarYear, calendarMonth, 15));
    const locale = language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US';
    return dt.toLocaleDateString(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' });
  }, [calendarYear, calendarMonth, language]);

  const shiftCalendarMonth = (delta: number) => {
    const dt = new Date(Date.UTC(calendarYear, calendarMonth + delta, 15));
    setCalendarYear(dt.getUTCFullYear());
    setCalendarMonth(dt.getUTCMonth());
  };

  // Daily agenda strip centered around selectedDay (-3 to +3)
  const agendaStripDays = useMemo(
    () => [-3, -2, -1, 0, 1, 2, 3].map((delta) => shiftIsoDate(selectedDay, delta)),
    [selectedDay]
  );

  const hourlyRange = useMemo(() => generateHourlyRange(8, 20), []);
  const selectedDayKey = getDayKeyFromIsoDate(selectedDay);
  const selectedDayConfig = settings.working_days.find((d) => d.day_key === selectedDayKey);

  const selectedDayAppointments = useMemo(
    () => filteredAppointments.filter((a) => a.date === selectedDay),
    [filteredAppointments, selectedDay]
  );

  const dailySummary = useMemo(() => {
    let openSlots = 0;
    let blockedSlots = 0;
    let bookedSlots = 0;

    hourlyRange.forEach((hour) => {
      const hourPrefix = hour.slice(0, 2);
      const hasApt = selectedDayAppointments.some(
        (a) => a.time.slice(0, 2) === hourPrefix && a.status !== 'cancelled'
      );
      if (hasApt) {
        bookedSlots += 1;
        return;
      }
      const avail = getSlotAvailability(selectedDayConfig, hour, settings, selectedDay);
      if (avail.status === 'available') {
        openSlots += 1;
      } else if (avail.status === 'blocked_date' || avail.status === 'blocked_recurring') {
        blockedSlots += 1;
      }
    });

    return {
      openSlots,
      blockedSlots,
      bookedSlots,
    };
  }, [hourlyRange, selectedDayAppointments, selectedDayConfig, settings, selectedDay]);

  const openBookingModal = (dateStr?: string, timeStr?: string) => {
    setEditingApt(null);
    setModalDefaultDate(dateStr || selectedDay);
    setModalDefaultTime(timeStr || '11:00');
    setAptModalOpen(true);
  };

  const handleDisableHour = (dateStr: string, hourSlot: string) => {
    const current = settings.blocked_date_slots?.[dateStr] ?? [];
    if (current.includes(hourSlot)) return;
    updateSettings({
      blocked_date_slots: {
        ...(settings.blocked_date_slots ?? {}),
        [dateStr]: [...current, hourSlot],
      },
    });
    pushToast({ type: 'info', title: `${hourSlot} — ${t.appointments.agenda.blockedSlot}` });
  };

  const handleEnableHour = (
    dateStr: string,
    hourSlot: string,
    status: 'blocked_date' | 'blocked_recurring'
  ) => {
    if (status === 'blocked_date') {
      const current = settings.blocked_date_slots?.[dateStr] ?? [];
      updateSettings({
        blocked_date_slots: {
          ...(settings.blocked_date_slots ?? {}),
          [dateStr]: current.filter((s) => s !== hourSlot),
        },
      });
    } else {
      const dayKey = getDayKeyFromIsoDate(dateStr);
      updateSettings({
        working_days: settings.working_days.map((d) =>
          d.day_key === dayKey
            ? { ...d, blocked_slots: (d.blocked_slots ?? []).filter((s) => s !== hourSlot) }
            : d
        ),
      });
    }
    pushToast({ type: 'success', title: `${hourSlot} — ${t.appointments.agenda.availableSlot}` });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-[19px] font-bold text-[#1F2937]">{t.appointments.title}</h2>
          <p className="text-xs text-[#64748B] font-medium mt-0.5">{t.appointments.subtitle}</p>
        </div>

        <button
          type="button"
          onClick={() => openBookingModal(selectedDay, '11:00')}
          className="h-9 px-4 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 self-start sm:self-auto btn-primary"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{t.appointments.newAppointment}</span>
        </button>
      </div>

      {/* Harmonious Attendance Statistics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <KpiCard
          title={t.appointments.stats.total}
          value={stats.total}
          icon={<Calendar className="h-4 w-4" />}
          tone="navy"
        />
        <KpiCard
          title={t.appointments.stats.upcoming}
          value={stats.upcoming}
          icon={<CalendarClock className="h-4 w-4" />}
          tone="orange"
        />
        <KpiCard
          title={t.appointments.stats.completed}
          value={stats.completed}
          icon={<CalendarCheck2 className="h-4 w-4" />}
          tone="sky"
        />
        <KpiCard
          title={t.appointments.stats.attended}
          value={stats.attended}
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="emerald"
        />
        <KpiCard
          title={t.appointments.stats.noShow}
          value={stats.noShow}
          icon={<UserX className="h-4 w-4" />}
          tone="rose"
        />
      </div>

      {/* View Switcher & Filters */}
      <div className="bg-white border border-zinc-200 card-surface rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex flex-wrap p-1 bg-zinc-100 border border-zinc-200 rounded-xl gap-1">
          {(
            [
              { id: 'daily', icon: Clock, label: t.appointments.views.daily },
              { id: 'weekly', icon: CalendarClock, label: t.appointments.views.weekly },
              { id: 'monthly', icon: Calendar, label: t.appointments.views.monthly },
              { id: 'table', icon: Table2, label: t.appointments.views.table },
            ] as const
          ).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setViewTab(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all whitespace-nowrap ${
                viewTab === id ? 'btn-primary' : 'text-zinc-900 hover:bg-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-zinc-400 absolute top-1/2 -translate-y-1/2 start-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.app.search}
              className="h-9 w-44 sm:w-52 ps-8 pe-3 text-xs font-medium border border-[#E3EAE5] rounded-xl bg-white focus:outline-none focus:border-[#16966A]"
            />
          </div>
          {viewTab === 'table' && (
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-9 px-3 text-xs border border-[#E3EAE5] rounded-xl font-mono-num"
            />
          )}
          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="h-9 px-3 text-xs font-semibold text-[#1F2937] border border-[#E3EAE5] rounded-xl bg-white"
          >
            <option value="all">{t.leads.filters.allEmployees}</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{localizePersonName(e.name, language)}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 text-xs font-semibold border border-slate-200 rounded-xl bg-white"
          >
            <option value="all">{t.leads.filters.allStatuses}</option>
            {(Object.keys(t.appointmentStatuses) as AppointmentStatus[]).map((st) => (
              <option key={st} value={st}>{t.appointmentStatuses[st]}</option>
            ))}
          </select>
          {(searchQuery || dateFilter || employeeFilter !== 'all' || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setDateFilter('');
                setEmployeeFilter('all');
                setStatusFilter('all');
              }}
              className="h-9 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:text-slate-950 hover:bg-slate-50"
            >
              {t.app.reset}
            </button>
          )}
        </div>
      </div>

      {/* Redesigned 10-Column Appointments Table View */}
      {viewTab === 'table' && (
        filteredAppointments.length === 0 ? (
          <EmptyState icon={<CalendarClock className="h-6 w-6" />} title={t.app.noData} />
        ) : (
          <div className="bg-white border border-[#E3EAE5] card-surface rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start border-collapse">
                <thead>
                  <tr className="bg-[#F5F7F5] text-[#1F2937] border-b-2 border-[#E3EAE5] font-bold whitespace-nowrap">
                    <th className="py-3.5 px-3.5 text-start">{t.appointments.columns.day}</th>
                    <th className="py-3.5 px-3.5 text-start">{t.appointments.columns.date}</th>
                    <th className="py-3.5 px-3.5 text-start">{t.appointments.columns.time}</th>
                    <th className="py-3.5 px-3.5 text-start">{t.appointments.columns.client}</th>
                    <th className="py-3.5 px-3.5 text-start">{t.appointments.columns.employee}</th>
                    <th className="py-3.5 px-3.5 text-start">{t.appointments.columns.property}</th>
                    <th className="py-3.5 px-3.5 text-start">{t.appointments.columns.area}</th>
                    <th className="py-3.5 px-3.5 text-start">{t.appointments.columns.city}</th>
                    <th className="py-3.5 px-3.5 text-start">{t.appointments.columns.budget}</th>
                    <th className="py-3.5 px-3.5 text-start">{t.appointments.columns.status}</th>
                    <th className="py-3.5 px-3.5 text-end">{t.app.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3EAE5]">
                  {filteredAppointments.map((apt) => {
                    const lead = leads.find((l) => l.id === apt.lead_id);
                    const prop = properties.find((p) => p.id === apt.property_id);
                    const emp = employees.find((e) => e.id === apt.employee_id);
                    const dayKey = getDayKeyFromIsoDate(apt.date);
                    const isToday = apt.date === todayIso;
                    const resolvedArea = prop?.area ?? lead?.desired_area;
                    const resolvedCity = prop?.city ?? lead?.city ?? '';
                    const resolvedBudget = lead?.budget ?? prop?.price ?? 0;

                    return (
                      <tr
                        key={apt.id}
                        className={isToday ? 'bg-[#ECFDF5]/75 hover:bg-[#ECFDF5]' : 'hover:bg-[#F5F7F5]'}
                      >
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          <span className="font-bold text-[#1F2937]">{t.days[dayKey]}</span>
                          {isToday && (
                            <span className="ms-1.5 px-1.5 py-0.5 rounded bg-[#16966A] text-white text-[10px] font-bold">
                              {t.appointments.agenda.today}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3.5 font-mono-num font-semibold text-[#1F2937] whitespace-nowrap">
                          {formatShortDate(apt.date, language)}
                        </td>
                        <td className="py-3.5 px-3.5 font-mono-num font-extrabold text-[#1F2937] whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md bg-[#F5F7F5] border border-[#E3EAE5]">
                            {apt.time}
                          </span>
                        </td>
                        <td className="py-3.5 px-3.5 min-w-[170px]">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => lead && openLeadProfile(lead.id)}
                              className="font-bold text-[#1F2937] hover:underline text-start truncate"
                            >
                              {lead ? localizePersonName(lead.name, language) : '—'}
                            </button>
                            {lead && (
                              <ClassificationBadge
                                classification={lead.classification}
                                label={t.leadClassifications[lead.classification]}
                              />
                            )}
                          </div>
                          {lead?.phone && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <a
                                href={buildTelHref(lead.phone)}
                                onClick={(e) => e.stopPropagation()}
                                className="text-[11px] font-mono-num text-[#0EA5E9] hover:underline"
                                dir="ltr"
                              >
                                {lead.phone}
                              </a>
                              <ContactMethodBadge
                                method={lead.contact_method}
                                label={t.contactMethods[lead.contact_method]}
                                phone={lead.phone}
                              />
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-3.5 whitespace-nowrap font-semibold text-[#1F2937]">
                          {emp ? localizePersonName(emp.name, language) : '—'}
                        </td>
                        <td className="py-3.5 px-3.5 max-w-[200px]">
                          <div className="font-bold text-[#1F2937] truncate">
                            {prop ? localizePropertyTitle(prop.title, language) : '—'}
                          </div>
                          <div className="text-[11px] text-[#64748B]">
                            {t.appointmentTypes[apt.type]}
                            {prop ? ` · ${prop.ref}` : ''}
                          </div>
                        </td>
                        <td className="py-3.5 px-3.5 font-mono-num font-semibold text-[#1F2937] whitespace-nowrap">
                          {resolvedArea ? `${resolvedArea} ${t.app.sqm}` : '—'}
                        </td>
                        <td className="py-3.5 px-3.5 whitespace-nowrap font-semibold text-[#1F2937]">
                          {resolvedCity ? localizeCity(resolvedCity, language) : '—'}
                        </td>
                        <td className="py-3.5 px-3.5 font-mono-num font-bold text-[#16966A] whitespace-nowrap">
                          {resolvedBudget > 0 ? formatMAD(resolvedBudget, language) : '—'}
                        </td>
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          <StatusLabel
                            label={t.appointmentStatuses[apt.status]}
                            appointmentStatus={apt.status}
                          />
                        </td>
                        <td className="py-3 px-4 text-end whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            {apt.status === 'scheduled' && (
                              <button
                                type="button"
                                onClick={() => updateAppointment(apt.id, { status: 'confirmed' })}
                                title={t.appointments.quickActions.confirm}
                                className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {(apt.status === 'scheduled' || apt.status === 'confirmed') && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => updateAppointment(apt.id, { status: 'attended' })}
                                  title={t.appointments.quickActions.markAttended}
                                  className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50"
                                >
                                  <UserCheck className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateAppointment(apt.id, { status: 'no_show' })}
                                  title={t.appointments.quickActions.markNoShow}
                                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                                >
                                  <UserX className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setRescheduleTarget(apt);
                                setNewDate(apt.date);
                                setNewTime(apt.time);
                              }}
                              title={t.appointments.quickActions.reschedule}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            >
                              <CalendarClock className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingApt(apt);
                                setAptModalOpen(true);
                              }}
                              title={t.app.edit}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            {apt.status !== 'cancelled' && (
                              <button
                                type="button"
                                onClick={() => setCancelTargetId(apt.id)}
                                title={t.appointments.quickActions.cancel}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Daily Hourly Agenda View */}
      {viewTab === 'daily' && (
        <div className="bg-white border border-[#E3EAE5] card-surface rounded-2xl overflow-hidden">
          {/* Top Agenda Controls */}
          <div className="px-5 py-3.5 bg-[#F5F7F5] border-b border-[#E3EAE5] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedDay((d) => shiftIsoDate(d, -1))}
                  className="h-8 w-8 rounded-lg border border-[#E3EAE5] bg-white hover:bg-[#F5F7F5] inline-flex items-center justify-center text-[#1F2937]"
                >
                  {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDay(todayIso)}
                  className={`h-8 px-3 rounded-lg text-xs font-bold border transition-colors ${
                    selectedDay === todayIso
                      ? 'btn-primary border-transparent'
                      : 'bg-white border-[#E3EAE5] text-[#1F2937] hover:bg-[#F5F7F5]'
                  }`}
                >
                  {t.appointments.agenda.today}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDay((d) => shiftIsoDate(d, 1))}
                  className="h-8 w-8 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 inline-flex items-center justify-center text-zinc-800"
                >
                  {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-950">
                  {t.days[selectedDayKey]} — {formatShortDate(selectedDay, language)}
                </h3>
                <div className="text-[11px] text-zinc-600 flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="font-semibold text-zinc-800">{t.appointments.agenda.workingHoursLabel}:</span>
                  {selectedDayConfig?.enabled ? (
                    <span className="font-mono-num text-zinc-900 font-semibold">
                      {selectedDayConfig.open} – {selectedDayConfig.close}
                      {selectedDayConfig.break_start && selectedDayConfig.break_end
                        ? ` (${t.settings.hoursForm.breakTime}: ${selectedDayConfig.break_start}–${selectedDayConfig.break_end})`
                        : ''}
                    </span>
                  ) : (
                    <span className="text-rose-700 font-semibold">{t.appointments.agenda.closedDayBanner}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold tabular-nums">
                  {dailySummary.openSlots} {t.appointments.agenda.openSlotsCount}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 font-semibold tabular-nums">
                  {dailySummary.bookedSlots} {t.appointments.agenda.bookedCount}
                </span>
                {dailySummary.blockedSlots > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-semibold tabular-nums">
                    {dailySummary.blockedSlots} {t.appointments.agenda.blockedCount}
                  </span>
                )}
              </div>

              <input
                type="date"
                value={selectedDay}
                onChange={(e) => e.target.value && setSelectedDay(e.target.value)}
                className="h-8 px-2.5 text-xs font-semibold border border-zinc-200 rounded-lg bg-white font-mono-num text-zinc-950"
              />
            </div>
          </div>

          {/* 7-Day Horizontal Quick Date Strip */}
          <div className="px-4 py-2.5 bg-white border-b border-zinc-200 grid grid-cols-7 gap-1.5 overflow-x-auto">
            {agendaStripDays.map((dayStr) => {
              const dKey = getDayKeyFromIsoDate(dayStr);
              const dCfg = settings.working_days.find((d) => d.day_key === dKey);
              const count = filteredAppointments.filter((a) => a.date === dayStr).length;
              const isSelected = dayStr === selectedDay;
              return (
                <button
                  key={dayStr}
                  type="button"
                  onClick={() => setSelectedDay(dayStr)}
                  className={`px-2 py-2 rounded-xl border text-center transition-all min-w-[78px] ${
                    isSelected
                      ? 'bg-[#12352B] text-white border-[#12352B] shadow-sm'
                      : !dCfg?.enabled
                        ? 'bg-[#F5F7F5] border-[#E3EAE5] text-[#64748B] hover:bg-[#E3EAE5]/50'
                        : 'bg-white border-[#E3EAE5] text-[#1F2937] hover:bg-[#F5F7F5]'
                  }`}
                >
                  <div className={`text-[11px] font-bold ${isSelected ? 'text-white/90' : 'text-[#64748B]'}`}>
                    {t.days[dKey]}
                  </div>
                  <div className="text-xs font-mono-num font-bold mt-0.5">{dayStr.slice(5)}</div>
                  <div className="mt-1 flex items-center justify-center">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono-num font-bold ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : count > 0
                            ? 'bg-[#ECFDF5] text-[#117A57]'
                            : 'bg-[#F5F7F5] text-[#64748B]'
                      }`}
                    >
                      {count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Closed Day Banner */}
          {!selectedDayConfig?.enabled && (
            <div className="mx-5 mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-rose-900">{t.appointments.agenda.closedDayBanner}</div>
                <div className="text-[11px] text-rose-700 mt-0.5">{t.appointments.agenda.closedDayHint}</div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSection('settings')}
                className="h-8 px-3 rounded-lg bg-white border border-rose-200 text-rose-800 text-xs font-bold inline-flex items-center gap-1.5 hover:bg-rose-100"
              >
                <Settings className="h-3.5 w-3.5" />
                <span>{t.appointments.agenda.configureHoursBtn}</span>
              </button>
            </div>
          )}

          {/* Hourly Day Timeline (08:00 - 20:00) */}
          <div className="p-4 sm:p-5 divide-y divide-zinc-100">
            {hourlyRange.map((hour) => {
              const hourPrefix = hour.slice(0, 2);
              const hourApts = selectedDayAppointments.filter(
                (a) => a.time.slice(0, 2) === hourPrefix
              );
              const avail = getSlotAvailability(selectedDayConfig, hour, settings, selectedDay);

              return (
                <div key={hour} className="py-2.5 first:pt-0 last:pb-0 flex items-stretch gap-3 sm:gap-4">
                  {/* Hour Label */}
                  <div className="w-16 shrink-0 pt-2 text-start">
                    <span className="inline-flex items-center justify-center px-2 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-xs font-mono-num font-bold text-zinc-950">
                      {hour}
                    </span>
                  </div>

                  {/* Hour Slot Content */}
                  <div className="flex-1 min-w-0">
                    {hourApts.length > 0 ? (
                      <div className="space-y-2">
                        {hourApts.map((apt) => {
                          const lead = leads.find((l) => l.id === apt.lead_id);
                          const prop = properties.find((p) => p.id === apt.property_id);
                          const emp = employees.find((e) => e.id === apt.employee_id);
                          return (
                            <div
                              key={apt.id}
                              className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 border rounded-xl ${aptCardTone[apt.status]}`}
                            >
                              <div className="space-y-1.5 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="px-2 py-0.5 rounded-md bg-white border border-zinc-200 text-xs font-mono-num font-bold text-zinc-950">
                                    {apt.time}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => lead && openLeadProfile(lead.id)}
                                    className="text-xs font-bold text-[#1F2937] hover:underline"
                                  >
                                    {lead ? localizePersonName(lead.name, language) : '—'}
                                  </button>
                                  {lead && (
                                    <>
                                      <ClassificationBadge
                                        classification={lead.classification}
                                        label={t.leadClassifications[lead.classification]}
                                      />
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
                                      {lead.contact_method === 'whatsapp' ? (
                                        <a
                                          href={buildTelHref(lead.phone)}
                                          onClick={(e) => e.stopPropagation()}
                                          title={t.appointments.agenda.directCall}
                                          className="h-6 w-6 rounded-md bg-white border border-sky-200 text-sky-700 hover:bg-sky-50 inline-flex items-center justify-center"
                                        >
                                          <Phone className="h-3 w-3" />
                                        </a>
                                      ) : (
                                        <a
                                          href={buildWhatsAppHref(lead.phone)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          title={t.appointments.agenda.directWhatsapp}
                                          className="h-6 w-6 rounded-md bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 inline-flex items-center justify-center"
                                        >
                                          <MessageCircle className="h-3 w-3" />
                                        </a>
                                      )}
                                    </>
                                  )}
                                </div>

                                <div className="text-xs text-[#1F2937] font-semibold truncate">
                                  {prop ? localizePropertyTitle(prop.title, language) : '—'}{' '}
                                  {prop ? `(${localizeCity(prop.city, language)})` : ''}
                                </div>

                                <div className="text-[11px] text-zinc-700 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                  {lead?.phone && (
                                    <a
                                      href={buildTelHref(lead.phone)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="font-mono-num text-sky-700 hover:underline"
                                      dir="ltr"
                                    >
                                      {lead.phone}
                                    </a>
                                  )}
                                  <span>·</span>
                                  <span>{emp ? localizePersonName(emp.name, language) : '—'}</span>
                                  <span>·</span>
                                  <span>{t.appointmentTypes[apt.type]}</span>
                                  {lead && (
                                    <>
                                      <span>·</span>
                                      <span className="font-mono-num font-bold text-[#1F2937]">
                                        {formatMAD(lead.budget, language)}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 shrink-0">
                                <StatusLabel
                                  label={t.appointmentStatuses[apt.status]}
                                  appointmentStatus={apt.status}
                                />
                                <div className="inline-flex items-center gap-1 bg-white/80 border border-zinc-200 rounded-lg p-0.5">
                                  {apt.status === 'scheduled' && (
                                    <button
                                      type="button"
                                      onClick={() => updateAppointment(apt.id, { status: 'confirmed' })}
                                      title={t.appointments.quickActions.confirm}
                                      className="p-1.5 rounded-md text-sky-600 hover:bg-sky-50"
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                  {(apt.status === 'scheduled' || apt.status === 'confirmed') && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => updateAppointment(apt.id, { status: 'attended' })}
                                        title={t.appointments.quickActions.markAttended}
                                        className="p-1.5 rounded-md text-emerald-700 hover:bg-emerald-50"
                                      >
                                        <UserCheck className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => updateAppointment(apt.id, { status: 'no_show' })}
                                        title={t.appointments.quickActions.markNoShow}
                                        className="p-1.5 rounded-md text-rose-600 hover:bg-rose-50"
                                      >
                                        <UserX className="h-3.5 w-3.5" />
                                      </button>
                                    </>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRescheduleTarget(apt);
                                      setNewDate(apt.date);
                                      setNewTime(apt.time);
                                    }}
                                    title={t.appointments.quickActions.reschedule}
                                    className="p-1.5 rounded-md text-zinc-600 hover:bg-zinc-100"
                                  >
                                    <CalendarClock className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingApt(apt);
                                      setAptModalOpen(true);
                                    }}
                                    title={t.app.edit}
                                    className="p-1.5 rounded-md text-zinc-600 hover:bg-zinc-100"
                                  >
                                    <Edit3 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {avail.status === 'available' && (
                          <button
                            type="button"
                            onClick={() => openBookingModal(selectedDay, hour)}
                            className="text-[11px] font-semibold text-zinc-600 hover:text-zinc-950 inline-flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-zinc-100"
                          >
                            <Plus className="h-3 w-3" />
                            <span>{t.appointments.agenda.bookAtTime}</span>
                          </button>
                        )}
                      </div>
                    ) : avail.status === 'available' ? (
                      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/70 transition-colors">
                        <div className="flex items-center gap-2 text-xs font-medium text-emerald-900">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span>{t.appointments.agenda.availableSlot}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openBookingModal(selectedDay, hour)}
                            className="h-7 px-3 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 btn-primary"
                          >
                            <Plus className="h-3 w-3" />
                            <span>{t.appointments.agenda.bookAtTime}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDisableHour(selectedDay, hour)}
                            className="h-7 px-2.5 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:text-rose-700 hover:border-rose-200 text-[11px] font-semibold inline-flex items-center gap-1"
                          >
                            <Ban className="h-3 w-3" />
                            <span>{t.appointments.agenda.disableHour}</span>
                          </button>
                        </div>
                      </div>
                    ) : avail.status === 'blocked_date' || avail.status === 'blocked_recurring' ? (
                      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl border border-dashed border-rose-200 bg-rose-50/50">
                        <div className="flex items-center gap-2 text-xs font-medium text-rose-800">
                          <Ban className="h-3.5 w-3.5 text-rose-600" />
                          <span>{t.appointments.agenda.blockedSlot}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleEnableHour(selectedDay, hour, avail.status)}
                          className="h-7 px-2.5 rounded-lg bg-white border border-rose-200 text-rose-800 hover:bg-rose-100 text-[11px] font-semibold inline-flex items-center gap-1"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>{t.appointments.agenda.enableHour}</span>
                        </button>
                      </div>
                    ) : avail.status === 'break' ? (
                      <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-amber-200 bg-amber-50/70 text-xs font-medium text-amber-900">
                        <Coffee className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        <span>
                          {t.appointments.agenda.breakPeriod}
                          {avail.label ? ` — ${avail.label}` : ''}
                        </span>
                      </div>
                    ) : (
                      <div className="px-3.5 py-1.5 rounded-xl bg-zinc-50 border border-zinc-100 text-[11px] text-zinc-400">
                        {avail.status === 'closed_day'
                          ? t.appointments.agenda.closedDayBanner
                          : t.appointments.agenda.outsideHours}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Redesigned Weekly Calendar View */}
      {viewTab === 'weekly' && (
        <div className="space-y-3">
          <div className="bg-white border border-zinc-200 card-surface rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setWeekAnchor((d) => addDaysIso(d, -7))}
                className="h-8 w-8 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 inline-flex items-center justify-center text-zinc-800"
              >
                {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => setWeekAnchor(todayIso)}
                className="h-8 px-3 rounded-lg text-xs font-bold btn-secondary"
              >
                {t.appointments.agenda.today}
              </button>
              <button
                type="button"
                onClick={() => setWeekAnchor((d) => addDaysIso(d, 7))}
                className="h-8 w-8 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 inline-flex items-center justify-center text-zinc-800"
              >
                {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              <span className="text-xs font-bold font-mono-num text-zinc-900 ms-1">
                {formatShortDate(weekDays[0], language)} — {formatShortDate(weekDays[6], language)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3">
            {weekDays.map((day) => {
              const dayApts = filteredAppointments.filter((a) => a.date === day);
              const dKey = getDayKeyFromIsoDate(day);
              const dCfg = settings.working_days.find((d) => d.day_key === dKey);
              const isToday = day === todayIso;
              const isSelected = day === selectedDay;
              return (
                <div
                  key={day}
                  className={`bg-white border card-surface rounded-2xl overflow-hidden flex flex-col min-h-[260px] ${
                    isToday
                      ? 'border-[#16966A] ring-2 ring-[#16966A]/20'
                      : isSelected
                        ? 'border-[#10B981]'
                        : 'border-[#E3EAE5]'
                  }`}
                >
                  <div
                    className={`px-3 py-2.5 border-b space-y-1 ${
                      isToday ? 'bg-[#ECFDF5] border-[#A7F3D0]' : 'bg-[#F5F7F5] border-[#E3EAE5]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDay(day);
                          setViewTab('daily');
                        }}
                        className="text-start hover:underline"
                      >
                        <div className="text-xs font-extrabold text-[#1F2937] flex items-center gap-1.5">
                          <span>{t.days[dKey]}</span>
                          {isToday && (
                            <span className="px-1.5 py-0.5 rounded bg-[#12352B] text-white text-[9px] font-bold">
                              {t.appointments.agenda.today}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono-num text-[#64748B] font-semibold">
                          {formatShortDate(day, language)}
                        </div>
                      </button>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold tabular-nums ${
                          dayApts.length > 0
                            ? 'bg-[#16966A] text-white'
                            : 'bg-[#E3EAE5] text-[#64748B]'
                        }`}
                      >
                        {dayApts.length}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono-num text-zinc-500">
                      {dCfg?.enabled
                        ? `${dCfg.open}–${dCfg.close}`
                        : t.appointments.agenda.closedDayBanner}
                    </div>
                  </div>

                  <div className="p-2.5 space-y-2 flex-1">
                    {dayApts.map((apt) => {
                      const lead = leads.find((l) => l.id === apt.lead_id);
                      return (
                        <div
                          key={apt.id}
                          className={`w-full text-start p-2.5 rounded-xl border transition-colors ${aptCardTone[apt.status]}`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setEditingApt(apt);
                              setAptModalOpen(true);
                            }}
                            className="w-full text-start"
                          >
                            <div className="text-[11px] font-extrabold font-mono-num text-[#1F2937]">
                              {apt.time}
                            </div>
                            <div className="text-xs font-bold text-[#1F2937] truncate">
                              {lead ? localizePersonName(lead.name, language) : '—'}
                            </div>
                          </button>
                          {lead && (
                            <div className="flex items-center justify-between gap-1 mt-1">
                              <a
                                href={buildTelHref(lead.phone)}
                                className="text-[10px] font-mono-num text-sky-700 hover:underline truncate"
                                dir="ltr"
                              >
                                {lead.phone}
                              </a>
                              <a
                                href={buildWhatsAppHref(lead.phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={t.appointments.agenda.directWhatsapp}
                                className="text-emerald-700 hover:text-emerald-900 shrink-0"
                              >
                                <MessageCircle className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                          <div className="text-[10px] font-bold text-zinc-700 mt-1">
                            {t.appointmentStatuses[apt.status]}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {dCfg?.enabled && (
                    <div className="p-2 border-t border-zinc-100">
                      <button
                        type="button"
                        onClick={() => openBookingModal(day, '10:00')}
                        className="w-full h-8 rounded-xl text-[11px] font-bold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 inline-flex items-center justify-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>{t.appointments.agenda.addForDay}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Redesigned Monthly Calendar View */}
      {viewTab === 'monthly' && (
        <div className="bg-white border border-zinc-200 card-surface rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm sm:text-base font-extrabold text-zinc-950">{monthHeading}</h3>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => shiftCalendarMonth(-1)}
                className="h-8 w-8 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 inline-flex items-center justify-center text-zinc-800"
              >
                {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCalendarYear(todayYear);
                  setCalendarMonth(todayMonth - 1);
                }}
                className="h-8 px-3 rounded-lg text-xs font-bold btn-secondary"
              >
                {t.appointments.agenda.today}
              </button>
              <button
                type="button"
                onClick={() => shiftCalendarMonth(1)}
                className="h-8 w-8 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 inline-flex items-center justify-center text-zinc-800"
              >
                {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[640px] space-y-2">
              {/* Aligned 7 Weekday Column Headers (Mon -> Sun) */}
              <div className="grid grid-cols-7 gap-2">
                {(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const).map((dayKey) => (
                  <div
                    key={dayKey}
                    className="py-2 px-2 rounded-lg bg-[#F5F7F5] border border-[#E3EAE5] text-center text-xs font-extrabold text-[#12352B]"
                  >
                    {t.days[dayKey]}
                  </div>
                ))}
              </div>

              {/* Calendar Grid Cells */}
              <div className="grid grid-cols-7 gap-2">
                {monthCells.map((cell) => {
                  const dayApts = filteredAppointments.filter((a) => a.date === cell.isoDate);
                  const dKey = getDayKeyFromIsoDate(cell.isoDate);
                  const dCfg = settings.working_days.find((d) => d.day_key === dKey);
                  const isToday = cell.isoDate === todayIso;

                  return (
                    <button
                      key={cell.isoDate}
                      type="button"
                      onClick={() => {
                        setSelectedDay(cell.isoDate);
                        setViewTab('daily');
                      }}
                      className={`min-h-[96px] p-2 rounded-xl border text-start flex flex-col justify-between transition-all ${
                        isToday
                          ? 'border-[#16966A] bg-[#ECFDF5]/60 ring-2 ring-[#16966A]/25'
                          : !cell.inCurrentMonth
                            ? 'border-[#E3EAE5]/60 bg-[#F5F7F5]/60 text-[#64748B] opacity-65'
                            : !dCfg?.enabled
                              ? 'border-[#E3EAE5] bg-[#F5F7F5] text-[#64748B] hover:bg-[#E3EAE5]/50'
                              : dayApts.length > 0
                                ? 'border-[#E3EAE5] bg-white hover:border-[#16966A]'
                                : 'border-[#E3EAE5] bg-white hover:bg-[#F5F7F5]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={`text-xs font-extrabold font-mono-num px-1.5 py-0.5 rounded-md ${
                            isToday ? 'bg-[#12352B] text-white' : 'text-[#1F2937]'
                          }`}
                        >
                          {cell.dayNum}
                        </span>
                        {dayApts.length > 0 && (
                          <span className="text-[10px] font-extrabold font-mono-num text-[#16966A]">
                            {dayApts.length}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 w-full mt-1">
                        {dayApts.slice(0, 2).map((a) => {
                          const lead = leads.find((l) => l.id === a.lead_id);
                          return (
                            <div
                              key={a.id}
                              className={`text-[10px] px-1.5 py-0.5 rounded border truncate font-semibold font-mono-num ${
                                monthChipTone[a.status]
                              }`}
                            >
                              {a.time} · {lead ? localizePersonName(lead.name, language).split(' ')[0] : ''}
                            </div>
                          );
                        })}
                        {dayApts.length > 2 && (
                          <div className="text-[10px] text-[#16966A] font-extrabold px-1">
                            +{dayApts.length - 2}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <AppointmentFormModal
        open={aptModalOpen}
        onClose={() => setAptModalOpen(false)}
        editingAppointment={editingApt}
        defaultDate={modalDefaultDate}
        defaultTime={modalDefaultTime}
      />

      {/* Reschedule Modal */}
      <Modal
        open={Boolean(rescheduleTarget)}
        onClose={() => setRescheduleTarget(null)}
        title={t.appointments.rescheduleAppointment}
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1">{t.appointments.form.date}</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg font-mono-num text-[#1F2937]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1">{t.appointments.form.time}</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg font-mono-num text-[#1F2937]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRescheduleTarget(null)}
              className="px-4 py-2 text-xs font-bold rounded-xl btn-outline"
            >
              {t.app.cancel}
            </button>
            <button
              type="button"
              onClick={() => {
                if (rescheduleTarget) {
                  updateAppointment(rescheduleTarget.id, {
                    date: newDate,
                    time: newTime,
                    status: 'rescheduled',
                  });
                }
                setRescheduleTarget(null);
              }}
              className="px-4 py-2 text-xs font-bold rounded-xl btn-primary"
            >
              {t.app.save}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(cancelTargetId)}
        title={t.appointments.cancelAppointment}
        description={t.appointments.cancelConfirm}
        confirmLabel={t.app.confirm}
        cancelLabel={t.app.cancel}
        onConfirm={() => {
          if (cancelTargetId) updateAppointment(cancelTargetId, { status: 'cancelled' });
          setCancelTargetId(null);
        }}
        onCancel={() => setCancelTargetId(null)}
      />
    </div>
  );
};
