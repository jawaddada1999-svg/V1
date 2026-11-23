import { AgencySettings, WorkingDayConfig } from '../types/domain';

const JS_DAY_TO_KEY: WorkingDayConfig['day_key'][] = [
  'sun',
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
];

export function getDayKeyFromIsoDate(isoDate: string): WorkingDayConfig['day_key'] {
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return 'mon';
  const dt = new Date(Date.UTC(y, m - 1, d));
  return JS_DAY_TO_KEY[dt.getUTCDay()] ?? 'mon';
}

export function timeToMinutes(hhmm: string): number {
  if (!hhmm || !hhmm.includes(':')) return -1;
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return -1;
  return h * 60 + m;
}

export function generateHourlyRange(startHour = 8, endHour = 20): string[] {
  const slots: string[] = [];
  for (let h = startHour; h <= endHour; h += 1) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
  }
  return slots;
}

export function generateDayWorkingHours(open: string, close: string): string[] {
  const openMin = timeToMinutes(open);
  const closeMin = timeToMinutes(close);
  if (openMin < 0 || closeMin <= openMin) return [];
  const startH = Math.floor(openMin / 60);
  const endH = Math.ceil(closeMin / 60);
  const slots: string[] = [];
  for (let h = startH; h < endH; h += 1) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
  }
  return slots;
}

export type SlotAvailability =
  | { status: 'closed_day' }
  | { status: 'outside_hours' }
  | { status: 'break'; label?: string }
  | { status: 'blocked_recurring' }
  | { status: 'blocked_date' }
  | { status: 'available' };

export function getSlotAvailability(
  dayConfig: WorkingDayConfig | undefined,
  hourSlot: string,
  settings?: AgencySettings,
  isoDate?: string
): SlotAvailability {
  if (!dayConfig || !dayConfig.enabled) {
    return { status: 'closed_day' };
  }

  const slotMin = timeToMinutes(hourSlot);
  const openMin = timeToMinutes(dayConfig.open);
  const closeMin = timeToMinutes(dayConfig.close);

  if (slotMin < openMin || slotMin >= closeMin) {
    return { status: 'outside_hours' };
  }

  if (dayConfig.break_start && dayConfig.break_end) {
    const bStart = timeToMinutes(dayConfig.break_start);
    const bEnd = timeToMinutes(dayConfig.break_end);
    if (bStart >= 0 && bEnd > bStart && slotMin >= bStart && slotMin < bEnd) {
      return { status: 'break' };
    }
  }

  if (dayConfig.excluded_periods && dayConfig.excluded_periods.length > 0) {
    for (const period of dayConfig.excluded_periods) {
      const pStart = timeToMinutes(period.start);
      const pEnd = timeToMinutes(period.end);
      if (pStart >= 0 && pEnd > pStart && slotMin >= pStart && slotMin < pEnd) {
        return { status: 'break', label: period.label };
      }
    }
  }

  if (dayConfig.blocked_slots?.includes(hourSlot)) {
    return { status: 'blocked_recurring' };
  }

  if (isoDate && settings?.blocked_date_slots?.[isoDate]?.includes(hourSlot)) {
    return { status: 'blocked_date' };
  }

  return { status: 'available' };
}

export function computeDayActiveHours(day: WorkingDayConfig): number {
  if (!day.enabled) return 0;
  const slots = generateDayWorkingHours(day.open, day.close);
  let active = 0;
  for (const s of slots) {
    const avail = getSlotAvailability(day, s);
    if (avail.status === 'available') active += 1;
  }
  return active;
}

export function computeWeeklyActiveHours(days: WorkingDayConfig[]): number {
  return days.reduce((sum, d) => sum + computeDayActiveHours(d), 0);
}

export function shiftIsoDate(isoDate: string, deltaDays: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  const dt = new Date(Date.UTC(y, m - 1, d + deltaDays));
  return dt.toISOString().slice(0, 10);
}
