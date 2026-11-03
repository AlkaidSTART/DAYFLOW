import dayjs from 'dayjs';

const WEEKDAYS_ZH = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

export type LocalDate = string; // YYYY-MM-DD
export type MonthKey = string; // YYYY-MM

export function getTodayLocalDate(): LocalDate {
  return dayjs().format('YYYY-MM-DD');
}

export function getCurrentMonthKey(): MonthKey {
  return dayjs().format('YYYY-MM');
}

export function formatTodayHeaderDate(dateStr?: LocalDate): string {
  const d = dateStr ? dayjs(dateStr) : dayjs();
  const month = d.month() + 1;
  const day = d.date();
  const weekday = WEEKDAYS_ZH[d.day()];
  return `今天 · ${month}月${day}日 ${weekday}`;
}

export function getGreetingByHour(hour = dayjs().hour()): string {
  if (hour < 12) {
    return '早上好，今天想完成什么？';
  }
  if (hour < 18) {
    return '下午好，继续推进今天最重要的事。';
  }
  return '晚上好，回顾一下今天的收获吧。';
}

export function getRemainingDaysInMonth(monthKey?: MonthKey): number {
  const now = dayjs();
  const target = monthKey ? dayjs(`${monthKey}-01`) : now;
  if (target.format('YYYY-MM') !== now.format('YYYY-MM')) {
    return target.daysInMonth();
  }
  return now.daysInMonth() - now.date() + 1;
}

export function formatBillTime(timestamp: number): string {
  const target = dayjs(timestamp);
  const today = dayjs().startOf('day');
  const yesterday = today.subtract(1, 'day');

  const timePart = target.format('HH:mm');
  if (target.isAfter(today) || target.isSame(today)) {
    return `今天 ${timePart}`;
  }
  if (target.isAfter(yesterday) || target.isSame(yesterday)) {
    return `昨天 ${timePart}`;
  }
  return `${target.month() + 1}月${target.date()}日 ${timePart}`;
}

export function formatMonthLabel(monthKey: MonthKey): string {
  const current = getCurrentMonthKey();
  if (monthKey === current) {
    return '本月';
  }
  const d = dayjs(`${monthKey}-01`);
  return `${d.year()}年${d.month() + 1}月`;
}
