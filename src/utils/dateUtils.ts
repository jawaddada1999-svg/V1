export type GlobalTimePeriod =
  | 'today'
  | 'thisWeek'
  | 'last7'
  | 'thisMonth'
  | 'last30'
  | 'thisYear'
  | 'all'
  | 'custom';

export function getTodayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysIso(isoDate: string, deltaDays: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  const dt = new Date(Date.UTC(y, m - 1, d + deltaDays));
  return dt.toISOString().slice(0, 10);
}

export function getWeekStartMonday(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  const dt = new Date(Date.UTC(y, m - 1, d));
  const day = dt.getUTCDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  const diffToMon = day === 0 ? -6 : 1 - day;
  return addDaysIso(isoDate, diffToMon);
}

export function getWeekDatesFrom(anchorIso: string): string[] {
  const mon = getWeekStartMonday(anchorIso);
  return Array.from({ length: 7 }, (_, i) => addDaysIso(mon, i));
}

export interface MonthCalendarCell {
  isoDate: string;
  dayNum: number;
  inCurrentMonth: boolean;
}

export function getMonthCalendarGrid(year: number, monthIndex0: number): MonthCalendarCell[] {
  const firstDay = new Date(Date.UTC(year, monthIndex0, 1));
  const daysInMonth = new Date(Date.UTC(year, monthIndex0 + 1, 0)).getUTCDate();
  const firstWeekday = firstDay.getUTCDay(); // 0=Sun..6=Sat
  const leadingEmpty = firstWeekday === 0 ? 6 : firstWeekday - 1; // Monday first

  const cells: MonthCalendarCell[] = [];

  for (let i = leadingEmpty; i > 0; i -= 1) {
    const dt = new Date(Date.UTC(year, monthIndex0, 1 - i));
    cells.push({
      isoDate: dt.toISOString().slice(0, 10),
      dayNum: dt.getUTCDate(),
      inCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dt = new Date(Date.UTC(year, monthIndex0, day));
    cells.push({
      isoDate: dt.toISOString().slice(0, 10),
      dayNum: day,
      inCurrentMonth: true,
    });
  }

  const remainder = cells.length % 7;
  if (remainder !== 0) {
    const trailing = 7 - remainder;
    for (let i = 1; i <= trailing; i += 1) {
      const dt = new Date(Date.UTC(year, monthIndex0 + 1, i));
      cells.push({
        isoDate: dt.toISOString().slice(0, 10),
        dayNum: dt.getUTCDate(),
        inCurrentMonth: false,
      });
    }
  }

  return cells;
}

export function getDateRangeBounds(
  period: GlobalTimePeriod,
  customFrom?: string,
  customTo?: string
): { from: string | null; to: string | null } {
  const today = getTodayIso();
  if (period === 'all') {
    return { from: null, to: null };
  }
  if (period === 'today') {
    return { from: today, to: today };
  }
  if (period === 'thisWeek') {
    const weekStart = getWeekStartMonday(today);
    const weekEnd = addDaysIso(weekStart, 6);
    return { from: weekStart, to: weekEnd };
  }
  if (period === 'last7') {
    return { from: addDaysIso(today, -6), to: today };
  }
  if (period === 'thisMonth') {
    const monthStart = `${today.slice(0, 7)}-01`;
    const [y, m] = today.split('-').map(Number);
    const lastDay = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
    return { from: monthStart, to: lastDay };
  }
  if (period === 'last30') {
    return { from: addDaysIso(today, -29), to: today };
  }
  if (period === 'thisYear') {
    const year = today.slice(0, 4);
    return { from: `${year}-01-01`, to: `${year}-12-31` };
  }
  return {
    from: customFrom || null,
    to: customTo || null,
  };
}

export function isIsoDateInRange(
  isoDate: string | null | undefined,
  from: string | null,
  to: string | null
): boolean {
  if (!from && !to) return true;
  if (!isoDate) return false;
  const datePart = isoDate.slice(0, 10);
  if (from && datePart < from) return false;
  if (to && datePart > to) return false;
  return true;
}
