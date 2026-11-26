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
  scheduled: 'bg-[#F0F9FF] border-[#BAE6FD] border-s-4 border-s-[#2563EB]',
  confirmed: 'bg-[#EEF2FF] border-[#C7D2FE] border-s-4 border-s-[#4F46E5]',
  attended: 'bg-[#F0FDF4] border-[#BBF7D0] border-s-4 border-s-[#15803D]',
  no_show: 'bg-[#FFF1F2] border-[#FECDD3] border-s-4 border-s-[#E11D48]',
  cancelled: 'bg-[#F8FAFC] border-[#E7EEF8] border-s-4 border-s-[#94A3B8] opacity-80',
  rescheduled: 'bg-[#FFFBEB] border-[#FDE68A] border-s-4 border-s-[#D97706]',
};

const monthChipTone: Record<AppointmentStatus, string> = {
  scheduled: 'bg-[#F0F9FF] text-[#0369A1] border-[#BAE6FD]',
  confirmed: 'bg-[#EEF2FF] text-[#3730A3] border-[#C7D2FE]',
  attended: 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]',
  no_show: 'bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]',
  cancelled: 'bg-[#F8FAFC] text-[#647B96] border-[#E7EEF8] line-through',
  rescheduled: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
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
    // Only count appointments scheduled for today or a future date as upcoming.
    // Historical appointments that were never marked attended/no-show must not inflate this KPI.
    const upcoming = appointments.filter(
      (a) =>
        (a.status === 'scheduled' || a.status === 'confirmed') &&
        a.date >= todayIso
    ).length;
    const attended = appointments.filter((a) => a.status === 'attended').length;
    const noShow = appointments.filter((a) => a.status === 'no_show').length;
    return { total, upcoming, completed: attended + noShow, attended, noShow };
  }, [appointments, todayIso]);

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

  const nearestBookedDay = useMemo(() => {
    const activeDates = Array.from(
      new Set(filteredAppointments.filter((a) => a.status !== 'cancelled').map((a) => a.date))
    ).sort();
    if (activeDates.length === 0) return null;
    const upcoming = activeDates.find((d) => d > selectedDay);
    if (upcoming) return upcoming;
    const earlier = [...activeDates].reverse().find((d) => d < selectedDay);
    return earlier ?? null;
  }, [filteredAppointments, selectedDay]);

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
    <div className="space-y-6 appointments-workspace">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-[19px] font-bold text-[#1B3554]">{t.appointments.title}</h2>
          <p className="text-xs text-[#647B96] font-medium mt-0.5">{t.appointments.subtitle}</p>
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
      <div className="bg-white border border-[#DBEAFE] shadow-sm rounded-2xl p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 w-full xl:w-auto p-1.5 bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl gap-1.5">
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
              className={`min-h-10 px-3 py-2 rounded-xl text-xs sm:text-[13px] font-bold inline-flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
                viewTab === id ? 'btn-primary' : 'text-zinc-900 hover:bg-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
          <div className="relative flex-1 min-w-[180px] xl:flex-none">
            <Search className="h-3.5 w-3.5 text-zinc-400 absolute top-1/2 -translate-y-1/2 start-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.app.search}
              className="h-10 w-full xl:w-52 ps-9 pe-3 text-[13px] font-medium border border-[#DCE5E1] rounded-xl bg-[#F8FBFF] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#DBEAFE]"
            />
          </div>
          {viewTab === 'table' && (
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-9 px-3 text-xs border border-[#D8E5F5] rounded-xl focus:outline-none focus:border-[#60A5FA] focus:ring-2 focus:ring-[#DBEAFE] font-mono-num"
            />
          )}
          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="h-9 px-3 text-xs font-semibold text-[#1B3554] border border-[#D8E5F5] rounded-xl focus:outline-none focus:border-[#60A5FA] focus:ring-2 focus:ring-[#DBEAFE] bg-white"
          >
            <option value="all">{t.leads.filters.allEmployees}</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{localizePersonName(e.name, language)}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 text-xs font-semibold border border-[#D8E5F5] rounded-xl focus:outline-none focus:border-[#60A5FA] focus:ring-2 focus:ring-[#DBEAFE] bg-white"
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
              className="h-9 px-3 rounded-xl border border-[#D8E5F5] text-xs font-bold text-[#647B96] hover:text-slate-950 hover:bg-[#F8FBFF]"
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
          <div className="bg-white border border-[#D8E5F5] card-surface rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start border-collapse">
                <thead>
                  <tr className="bg-[#1E293B] text-white border-b-2 border-[#2563EB] font-bold whitespace-nowrap">
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
                <tbody className="divide-y divide-[#E2E8F0]">
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
                        className={isToday ? 'bg-[#EFF6FF] hover:bg-[#DBEAFE]/75' : 'hover:bg-[#EFF6FF]'}
                      >
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          <span className="font-bold text-[#1B3554]">{t.days[dayKey]}</span>
                          {isToday && (
                            <span className="ms-1.5 px-1.5 py-0.5 rounded bg-[#2563EB] text-white text-[10px] font-bold">
                              {t.appointments.agenda.today}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3.5 font-mono-num font-semibold text-[#1B3554] whitespace-nowrap">
                          {formatShortDate(apt.date, language)}
                        </td>
                        <td className="py-3.5 px-3.5 font-mono-num font-extrabold text-[#1B3554] whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md bg-[#F8FBFF] border border-[#D8E5F5]">
                            {apt.time}
                          </span>
                        </td>
                        <td className="py-3.5 px-3.5 min-w-[170px]">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => lead && openLeadProfile(lead.id)}
                              className="font-bold text-[#1B3554] hover:underline text-start truncate"
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
                        <td className="py-3.5 px-3.5 whitespace-nowrap font-semibold text-[#1B3554]">
                          {emp ? localizePersonName(emp.name, language) : '—'}
                        </td>
                        <td className="py-3.5 px-3.5 max-w-[200px]">
                          <div className="font-bold text-[#1B3554] truncate">
                            {prop ? localizePropertyTitle(prop.title, language) : '—'}
                          </div>
                          <div className="text-[11px] text-[#647B96]">
                            {t.appointmentTypes[apt.type]}
                            {prop ? ` · ${prop.ref}` : ''}
                          </div>
                        </td>
                        <td className="py-3.5 px-3.5 font-mono-num font-semibold text-[#1B3554] whitespace-nowrap">
                          {resolvedArea ? `${resolvedArea} ${t.app.sqm}` : '—'}
                        </td>
                        <td className="py-3.5 px-3.5 whitespace-nowrap font-semibold text-[#1B3554]">
                          {resolvedCity ? localizeCity(resolvedCity, language) : '—'}
                        </td>
                        <td className="py-3.5 px-3.5 font-mono-num font-bold text-[#C2410C] whitespace-nowrap">
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
        <div className="bg-white border border-[#DCE5E1] card-surface rounded-2xl overflow-hidden">
          {/* Top Agenda Controls */}
          <div className="px-5 py-4 bg-[#F8FAFC] border-b border-[#E7EEF8] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedDay((d) => shiftIsoDate(d, -1))}
                  className="h-9 w-9 rounded-xl border border-[#E7EEF8] bg-white hover:bg-[#EFF6FF] hover:border-[#FDBA74] inline-flex items-center justify-center text-[#1B3554] transition-colors"
                >
                  {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDay(todayIso)}
                  className={`h-9 px-3.5 rounded-xl text-xs font-bold border transition-colors ${
                    selectedDay === todayIso
                      ? 'btn-primary border-transparent'
                      : 'bg-white border-[#E7EEF8] text-[#1B3554] hover:bg-[#EFF6FF] hover:border-[#FDBA74]'
                  }`}
                >
                  {t.appointments.agenda.today}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDay((d) => shiftIsoDate(d, 1))}
                  className="h-9 w-9 rounded-xl border border-[#E7EEF8] bg-white hover:bg-[#EFF6FF] hover:border-[#FDBA74] inline-flex items-center justify-center text-[#1B3554] transition-colors"
                >
                  {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              </div>

              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-[#1B3554]">
                  {t.days[selectedDayKey]} — {formatShortDate(selectedDay, language)}
                </h3>
                <div className="text-xs text-[#647B96] flex flex-wrap items-center gap-2 mt-1">
                  {selectedDayConfig?.enabled && !settings.blocked_dates?.includes(selectedDay) ? (
                    <>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white border border-[#E7EEF8] text-[#1E293B] font-semibold">
                        <Clock className="h-3 w-3 text-[#2563EB]" />
                        <span>{t.appointments.agenda.workingHoursLabel}:</span>
                        <span className="font-mono-num font-bold" dir="ltr">
                          {selectedDayConfig.open} – {selectedDayConfig.close}
                        </span>
                      </span>
                      {selectedDayConfig.break_start && selectedDayConfig.break_end && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] font-semibold">
                          <Coffee className="h-3 w-3 text-[#D97706]" />
                          <span className="font-mono-num font-bold" dir="ltr">
                            {selectedDayConfig.break_start} – {selectedDayConfig.break_end}
                          </span>
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#FFF1F2] border border-[#FECDD3] text-[#BE123C] font-bold">
                      {t.appointments.agenda.closedDayBanner}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="px-2.5 py-1 rounded-lg bg-[#F0F9FF] border border-[#BAE6FD] text-[#0369A1] font-bold tabular-nums">
                  {dailySummary.openSlots} {t.appointments.agenda.openSlotsCount}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#EFF6FF] border border-[#FED7AA] text-[#C2410C] font-bold tabular-nums">
                  {dailySummary.bookedSlots} {t.appointments.agenda.bookedCount}
                </span>
                {dailySummary.blockedSlots > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-[#FFF1F2] border border-[#FECDD3] text-[#BE123C] font-bold tabular-nums">
                    {dailySummary.blockedSlots} {t.appointments.agenda.blockedCount}
                  </span>
                )}
              </div>

              {selectedDayAppointments.length === 0 && nearestBookedDay && (
                <button
                  type="button"
                  onClick={() => setSelectedDay(nearestBookedDay)}
                  className="h-8 px-3 rounded-xl bg-white border border-[#BAE6FD] text-[#0369A1] hover:bg-[#F0F9FF] text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors"
                >
                  <CalendarClock className="h-3.5 w-3.5" />
                  <span>{t.appointments.agenda.jumpToNearestApt}</span>
                  <span className="font-mono-num" dir="ltr">({nearestBookedDay.slice(5)})</span>
                </button>
              )}

              <input
                type="date"
                value={selectedDay}
                onChange={(e) => e.target.value && setSelectedDay(e.target.value)}
                className="h-8 px-2.5 text-xs font-bold border border-[#D8E5F5] rounded-xl focus:outline-none focus:border-[#60A5FA] focus:ring-2 focus:ring-[#DBEAFE] bg-white font-mono-num text-[#1B3554]"
              />
            </div>
          </div>

          {/* 7-Day Horizontal Quick Date Strip */}
          <div className="px-4 py-3 bg-white border-b border-[#E7EEF8] overflow-x-auto">
            <div className="grid grid-cols-7 gap-2 min-w-[630px]">
              {agendaStripDays.map((dayStr) => {
                const dKey = getDayKeyFromIsoDate(dayStr);
                const dCfg = settings.working_days.find((d) => d.day_key === dKey);
                const count = filteredAppointments.filter((a) => a.date === dayStr).length;
                const isSelected = dayStr === selectedDay;
                const isTodayCell = dayStr === todayIso;
                return (
                  <button
                    key={dayStr}
                    type="button"
                    onClick={() => setSelectedDay(dayStr)}
                    className={`px-2.5 py-2 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-[#2563EB] text-white border-[#C2410C] shadow-sm'
                        : !dCfg?.enabled
                          ? 'bg-[#F8FAFC] border-[#E7EEF8] text-[#647B96] hover:bg-[#F1F5F9]'
                          : 'bg-white border-[#E7EEF8] text-[#1B3554] hover:bg-[#EFF6FF] hover:border-[#FDBA74]'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className={`text-[11px] font-bold ${isSelected ? 'text-white/95' : 'text-[#475569]'}`}>
                        {t.days[dKey]}
                      </span>
                      {isTodayCell && !isSelected && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
                      )}
                    </div>
                    <div className="text-xs font-mono-num font-extrabold mt-0.5" dir="ltr">
                      {dayStr.slice(5)}
                    </div>
                    <div className="mt-1.5 flex items-center justify-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono-num font-bold ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : count > 0
                              ? 'bg-[#F0F9FF] text-[#0369A1] border border-[#BAE6FD]'
                              : 'bg-[#F8FAFC] text-[#647B96]'
                        }`}
                      >
                        {count}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Eye-Friendly Color Legend Bar */}
          <div className="px-5 py-2.5 bg-[#F8FAFC]/70 border-b border-[#E7EEF8] flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex flex-wrap items-center gap-3 font-semibold text-[#475569]">
              <span className="font-bold text-[#1E293B]">{t.appointments.agenda.legendLabel}</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" />
                {t.appointments.agenda.availableSlot}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#4F46E5]" />
                {t.appointmentStatuses.confirmed}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#15803D]" />
                {t.appointmentStatuses.attended}
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
            {selectedDayConfig?.enabled && selectedDayAppointments.length === 0 && (
              <span className="text-[11px] font-medium text-[#647B96]">
                {t.appointments.agenda.noAptsTodayHint}
              </span>
            )}
          </div>

          {/* Closed Day Banner */}
          {!selectedDayConfig?.enabled && (
            <div className="mx-5 mt-4 p-4 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-extrabold text-[#9F1239]">{t.appointments.agenda.closedDayBanner}</div>
                <div className="text-[11px] text-[#BE123C] mt-0.5">{t.appointments.agenda.closedDayHint}</div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSection('settings')}
                className="h-8 px-3 rounded-xl bg-white border border-[#FECDD3] text-[#9F1239] text-xs font-bold inline-flex items-center gap-1.5 hover:bg-[#FFE4E6]"
              >
                <Settings className="h-3.5 w-3.5" />
                <span>{t.appointments.agenda.configureHoursBtn}</span>
              </button>
            </div>
          )}

          {/* Hourly Day Timeline (08:00 - 20:00) */}
          <div className="p-4 sm:p-5 space-y-2">
            {hourlyRange.map((hour) => {
              const hourNum = Number(hour.slice(0, 2));
              const nextHourLabel = `${String(hourNum + 1).padStart(2, '0')}:00`;
              const hourPrefix = hour.slice(0, 2);
              const hourApts = selectedDayAppointments.filter(
                (a) => a.time.slice(0, 2) === hourPrefix
              );
              const avail = getSlotAvailability(selectedDayConfig, hour, settings, selectedDay);
              const isOutside = avail.status === 'outside_hours' || avail.status === 'closed_day';

              const periodLabel =
                hour === '08:00'
                  ? t.appointments.agenda.morningPeriod
                  : hour === '13:00'
                    ? t.appointments.agenda.afternoonPeriod
                    : hour === '18:00'
                      ? t.appointments.agenda.eveningPeriod
                      : null;

              const timeRailTone =
                hourApts.length > 0
                  ? 'bg-[#EEF2FF] border-[#C7D2FE] text-[#312E81]'
                  : avail.status === 'available'
                    ? 'bg-[#F0F9FF] border-[#BAE6FD] text-[#0369A1]'
                    : avail.status === 'break'
                      ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
                      : avail.status === 'blocked_date' || avail.status === 'blocked_recurring'
                        ? 'bg-[#FFF1F2] border-[#FECDD3] text-[#BE123C]'
                        : 'bg-[#F8FAFC] border-[#E7EEF8] text-[#94A3B8]';

              return (
                <React.Fragment key={hour}>
                  {periodLabel && (
                    <div className="pt-2 pb-1 first:pt-0 flex items-center gap-2">
                      <span className="text-[11px] font-extrabold text-[#475569] uppercase tracking-wide">
                        {periodLabel}
                      </span>
                      <div className="h-px flex-1 bg-[#E2E8F0]" />
                    </div>
                  )}

                  <div className={`flex items-stretch gap-3 sm:gap-4 ${isOutside && hourApts.length === 0 ? 'opacity-80' : ''}`}>
                    {/* Clear Time Rail */}
                    <div className="w-20 sm:w-24 shrink-0 flex flex-col justify-center">
                      <div
                        className={`px-2.5 py-2 rounded-xl border text-center transition-colors ${timeRailTone}`}
                        dir="ltr"
                      >
                        <div className="text-xs sm:text-[13px] font-mono-num font-extrabold leading-tight">
                          {hour}
                        </div>
                        <div className="text-[10px] font-mono-num opacity-75 leading-tight mt-0.5">
                          → {nextHourLabel}
                        </div>
                      </div>
                    </div>

                    {/* Hour Slot Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      {hourApts.length > 0 ? (
                        <div className="space-y-2">
                          {hourApts.map((apt) => {
                            const lead = leads.find((l) => l.id === apt.lead_id);
                            const prop = properties.find((p) => p.id === apt.property_id);
                            const emp = employees.find((e) => e.id === apt.employee_id);
                            return (
                              <div
                                key={apt.id}
                                className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 border rounded-xl transition-shadow hover:shadow-xs ${aptCardTone[apt.status]}`}
                              >
                                <div className="space-y-1.5 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-md bg-white border border-[#E7EEF8] text-xs font-mono-num font-extrabold text-[#1B3554]">
                                      {apt.time}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => lead && openLeadProfile(lead.id)}
                                      className="text-xs sm:text-[13px] font-extrabold text-[#1B3554] hover:underline"
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

                                  <div className="text-xs text-[#1B3554] font-bold truncate">
                                    {prop ? localizePropertyTitle(prop.title, language) : '—'}{' '}
                                    {prop ? `(${localizeCity(prop.city, language)})` : ''}
                                  </div>

                                  <div className="text-[11px] text-[#475569] flex flex-wrap items-center gap-x-2 gap-y-0.5 font-medium">
                                    {lead?.phone && (
                                      <a
                                        href={buildTelHref(lead.phone)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="font-mono-num text-[#0369A1] font-bold hover:underline"
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
                                        <span className="font-mono-num font-extrabold text-[#C2410C]">
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
                                  <div className="inline-flex items-center gap-1 bg-white border border-[#E7EEF8] rounded-xl p-1">
                                    {apt.status === 'scheduled' && (
                                      <button
                                        type="button"
                                        onClick={() => updateAppointment(apt.id, { status: 'confirmed' })}
                                        title={t.appointments.quickActions.confirm}
                                        className="p-1.5 rounded-lg text-[#2563EB] hover:bg-[#F0F9FF]"
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
                                          className="p-1.5 rounded-lg text-[#15803D] hover:bg-[#F0FDF4]"
                                        >
                                          <UserCheck className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => updateAppointment(apt.id, { status: 'no_show' })}
                                          title={t.appointments.quickActions.markNoShow}
                                          className="p-1.5 rounded-lg text-[#E11D48] hover:bg-[#FFF1F2]"
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
                                      className="p-1.5 rounded-lg text-[#475569] hover:bg-[#F8FAFC]"
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
                                      className="p-1.5 rounded-lg text-[#475569] hover:bg-[#F8FAFC]"
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
                              className="text-[11px] font-bold text-[#0369A1] hover:text-[#2563EB] inline-flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-[#F0F9FF]"
                            >
                              <Plus className="h-3 w-3" />
                              <span>{t.appointments.agenda.bookAtTime}</span>
                            </button>
                          )}
                        </div>
                      ) : avail.status === 'available' ? (
                        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-[#BAE6FD] bg-[#F0F9FF]/55 hover:bg-[#E0F2FE]/60 transition-colors">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#0369A1]">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" />
                            <span>{t.appointments.agenda.availableSlot}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openBookingModal(selectedDay, hour)}
                              className="h-8 px-3 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 btn-accent"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>{t.appointments.agenda.bookAtTime}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDisableHour(selectedDay, hour)}
                              className="h-8 px-2.5 rounded-xl bg-white border border-[#E7EEF8] text-[#647B96] hover:text-[#BE123C] hover:border-[#FECDD3] hover:bg-[#FFF1F2] text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                            >
                              <Ban className="h-3 w-3" />
                              <span>{t.appointments.agenda.disableHour}</span>
                            </button>
                          </div>
                        </div>
                      ) : avail.status === 'blocked_date' || avail.status === 'blocked_recurring' ? (
                        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#FECDD3] bg-[#FFF1F2]/70">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#9F1239]">
                            <Ban className="h-3.5 w-3.5 text-[#E11D48]" />
                            <span>{t.appointments.agenda.blockedSlot}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleEnableHour(selectedDay, hour, avail.status)}
                            className="h-8 px-3 rounded-xl bg-white border border-[#FECDD3] text-[#9F1239] hover:bg-[#FFE4E6] text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>{t.appointments.agenda.enableHour}</span>
                          </button>
                        </div>
                      ) : avail.status === 'break' ? (
                        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-[#FDE68A] bg-[#FFFBEB]/80 text-xs font-bold text-[#92400E]">
                          <Coffee className="h-4 w-4 text-[#D97706] shrink-0" />
                          <span>
                            {t.appointments.agenda.breakPeriod}
                            {avail.label ? ` — ${avail.label}` : ''}
                          </span>
                        </div>
                      ) : (
                        <div className="px-3.5 py-2 rounded-xl bg-[#F8FAFC] border border-[#E7EEF8]/70 text-[11px] font-medium text-[#94A3B8]">
                          {avail.status === 'closed_day'
                            ? t.appointments.agenda.closedDayBanner
                            : t.appointments.agenda.outsideHours}
                        </div>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Redesigned Weekly Calendar View */}
      {viewTab === 'weekly' && (
        <div className="space-y-3">
          <div className="bg-white border border-[#E7EEF8] card-surface rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setWeekAnchor((d) => addDaysIso(d, -7))}
                className="h-8 w-8 rounded-lg border border-[#E7EEF8] bg-white hover:bg-[#EFF6FF] hover:border-[#FDBA74] inline-flex items-center justify-center text-[#1B3554]"
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
                className="h-8 w-8 rounded-lg border border-[#E7EEF8] bg-white hover:bg-[#EFF6FF] hover:border-[#FDBA74] inline-flex items-center justify-center text-[#1B3554]"
              >
                {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              <span className="text-xs font-extrabold font-mono-num text-[#1B3554] ms-1">
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
              const isDateClosed = settings.blocked_dates?.includes(day) ?? false;
              return (
                <div
                  key={day}
                  className={`bg-white border card-surface rounded-2xl overflow-hidden flex flex-col min-h-[260px] ${
                    isDateClosed
                      ? 'border-rose-200 bg-rose-50/50'
                      : isToday
                        ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20'
                        : isSelected
                        ? 'border-[#2563EB] ring-1 ring-[#2563EB]/20'
                        : 'border-[#E7EEF8]'
                  }`}
                >
                  <div
                    className={`px-3 py-2.5 border-b space-y-1 ${
                      isToday
                        ? 'bg-[#EFF6FF] border-[#FED7AA]'
                        : isSelected
                          ? 'bg-[#F0F9FF] border-[#BAE6FD]'
                          : 'bg-[#F8FAFC] border-[#E7EEF8]'
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
                        <div className="text-xs font-extrabold text-[#1B3554] flex items-center gap-1.5">
                          <span>{t.days[dKey]}</span>
                          {isToday && (
                            <span className="px-1.5 py-0.5 rounded bg-[#2563EB] text-white text-[9px] font-bold">
                              {t.appointments.agenda.today}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono-num text-[#647B96] font-semibold">
                          {formatShortDate(day, language)}
                        </div>
                      </button>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold tabular-nums ${
                          dayApts.length > 0
                            ? 'bg-[#2563EB] text-white'
                            : 'bg-[#E2E8F0] text-[#647B96]'
                        }`}
                      >
                        {dayApts.length}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono-num text-[#475569] font-semibold" dir="ltr">
                      {dCfg?.enabled ? (
                        <span>
                          {dCfg.open}–{dCfg.close}
                          {dCfg.break_start && dCfg.break_end
                            ? ` (☕ ${dCfg.break_start}–${dCfg.break_end})`
                            : ''}
                        </span>
                      ) : (
                        <span className="text-[#BE123C]">{t.settings.hoursForm.closedLabel}</span>
                      )}
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
                            <div className="text-[11px] font-extrabold font-mono-num text-[#1B3554]">
                              {apt.time}
                            </div>
                            <div className="text-xs font-bold text-[#1B3554] truncate">
                              {lead ? localizePersonName(lead.name, language) : '—'}
                            </div>
                          </button>
                          {lead && (
                            <div className="flex items-center justify-between gap-1 mt-1">
                              <a
                                href={buildTelHref(lead.phone)}
                                className="text-[10px] font-mono-num text-[#0369A1] font-semibold hover:underline truncate"
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
                          <div className="text-[10px] font-bold text-[#475569] mt-1">
                            {t.appointmentStatuses[apt.status]}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {dCfg?.enabled && (
                    <div className="p-2 border-t border-[#E7EEF8]">
                      <button
                        type="button"
                        onClick={() => openBookingModal(day, '10:00')}
                        className="w-full h-8 rounded-xl text-[11px] font-bold text-[#0369A1] hover:bg-[#F0F9FF] inline-flex items-center justify-center gap-1 transition-colors"
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

      {/* Monthly Calendar */}
      {viewTab === 'monthly' && (
        <section className="rounded-2xl border border-[#D8E5F5] bg-white shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-5 border-b border-[#E7EEF8] bg-gradient-to-r from-[#F8FBFF] to-white">
            <div>
              <h3 className="text-base font-extrabold text-[#142B4A]">{monthHeading}</h3>
              <p className="mt-1 text-xs text-[#718096]">{t.appointments.subtitle}</p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => shiftCalendarMonth(-1)}
                aria-label={isRtl ? 'الشهر السابق' : 'Previous month'}
                className="h-9 w-9 rounded-xl border border-[#D8E5F5] bg-white hover:bg-[#EFF6FF] text-[#24476F] inline-flex items-center justify-center transition-colors"
              >
                {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCalendarYear(todayYear);
                  setCalendarMonth(todayMonth - 1);
                  setSelectedDay(todayIso);
                }}
                className="h-9 px-4 rounded-xl text-xs font-bold btn-secondary"
              >
                {t.appointments.agenda.today}
              </button>
              <button
                type="button"
                onClick={() => shiftCalendarMonth(1)}
                aria-label={isRtl ? 'الشهر التالي' : 'Next month'}
                className="h-9 w-9 rounded-xl border border-[#D8E5F5] bg-white hover:bg-[#EFF6FF] text-[#24476F] inline-flex items-center justify-center transition-colors"
              >
                {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="p-2 sm:p-4">
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2">
              {(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const).map((dayKey) => (
                <div
                  key={dayKey}
                  className="py-2 px-0.5 sm:px-2 rounded-lg bg-[#17365D] text-center text-[10px] sm:text-xs font-extrabold text-white"
                >
                  {t.days[dayKey]}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {monthCells.map((cell) => {
                const dayApts = filteredAppointments.filter((a) => a.date === cell.isoDate);
                const dKey = getDayKeyFromIsoDate(cell.isoDate);
                const dCfg = settings.working_days.find((d) => d.day_key === dKey);
                const isToday = cell.isoDate === todayIso;
                const isSelected = cell.isoDate === selectedDay;
                const isDateClosed = settings.blocked_dates?.includes(cell.isoDate) ?? false;
                const isWeeklyClosed = !dCfg?.enabled;
                const isClosed = isDateClosed || isWeeklyClosed;

                return (
                  <button
                    key={cell.isoDate}
                    type="button"
                    onClick={() => {
                      setSelectedDay(cell.isoDate);
                      setViewTab('daily');
                    }}
                    aria-label={`${cell.isoDate} — ${dayApts.length} appointments`}
                    className={`min-w-0 min-h-[76px] sm:min-h-[116px] p-1.5 sm:p-2 rounded-lg sm:rounded-xl border text-start flex flex-col gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-[#3B82F6] ${
                      !cell.inCurrentMonth
                        ? 'border-[#EDF1F7] bg-[#FAFBFD] text-[#A0AEC0] opacity-70'
                        : isSelected
                          ? 'border-[#2563EB] bg-[#EFF6FF] ring-2 ring-[#2563EB]/15'
                          : isToday
                            ? 'border-[#60A5FA] bg-[#F4F8FF]'
                            : isClosed
                              ? 'border-rose-100 bg-rose-50/60 hover:bg-rose-50'
                              : 'border-[#E5ECF5] bg-white hover:border-[#93BCEB] hover:bg-[#F8FBFF]'
                    }`}
                  >
                    <div className="w-full flex items-center justify-between gap-1">
                      <span className={`inline-flex items-center justify-center min-w-6 h-6 px-1 rounded-lg text-[10px] sm:text-xs font-extrabold tabular-nums ${
                        isToday ? 'bg-[#2563EB] text-white' : isClosed && cell.inCurrentMonth ? 'text-rose-600' : 'text-[#294766]'
                      }`}>
                        {cell.dayNum}
                      </span>
                      {dayApts.length > 0 && (
                        <span className="shrink-0 rounded-full bg-[#DBEAFE] text-[#1D4ED8] px-1.5 py-0.5 text-[9px] sm:text-[10px] font-extrabold tabular-nums">
                          {dayApts.length}
                        </span>
                      )}
                    </div>

                    <div className="w-full min-w-0 space-y-1">
                      {dayApts.slice(0, 2).map((a) => {
                        const lead = leads.find((l) => l.id === a.lead_id);
                        return (
                          <div
                            key={a.id}
                            className={`w-full min-w-0 text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-1 rounded-md border truncate font-semibold ${monthChipTone[a.status]}`}
                            title={`${a.time} — ${lead ? localizePersonName(lead.name, language) : ''}`}
                          >
                            <span className="font-bold tabular-nums">{a.time}</span>
                            <span className="hidden sm:inline"> · {lead ? localizePersonName(lead.name, language).split(' ')[0] : ''}</span>
                          </div>
                        );
                      })}
                      {dayApts.length > 2 && (
                        <div className="text-[9px] sm:text-[10px] text-[#1D4ED8] font-extrabold px-1">
                          +{dayApts.length - 2}
                        </div>
                      )}
                      {isClosed && cell.inCurrentMonth && dayApts.length === 0 && (
                        <div className="hidden sm:block text-[9px] text-rose-500 font-bold truncate">
                          {isDateClosed ? (language === 'ar' ? 'عطلة' : language === 'fr' ? 'Fermé' : 'Closed') : (language === 'ar' ? 'مغلق' : language === 'fr' ? 'Fermé' : 'Closed')}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="px-4 pb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] sm:text-xs text-[#647B96]">
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#EFF6FF] border border-[#93C5FD]" />{t.appointments.agenda.today}</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-rose-50 border border-rose-200" />{language === 'ar' ? 'يوم مغلق' : language === 'fr' ? 'Jour fermé' : 'Closed day'}</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#DBEAFE] border border-[#BFDBFE]" />{language === 'ar' ? 'عدد المواعيد' : language === 'fr' ? 'Rendez-vous' : 'Appointments'}</span>
          </div>
        </section>
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
              <label className="block text-xs font-bold text-[#1B3554] mb-1">{t.appointments.form.date}</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-[#D8E5F5] rounded-lg font-mono-num text-[#1B3554]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1B3554] mb-1">{t.appointments.form.time}</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-[#D8E5F5] rounded-lg font-mono-num text-[#1B3554]"
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
