/**
 * Section 4.3.2 & 11:
 * 所有金额以「分」为单位计算与存储，界面展示保留两位小数，禁止使用浮点数累加。
 * 数字与单位之间留半角空格：¥ 1,280.00
 */

export function parseAmountToCents(raw: string): number | null {
  const trimmed = raw.trim().replace(/,/g, '');
  if (!trimmed) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return null;
  }
  const [intPart, decPart = ''] = trimmed.split('.');
  const paddedDec = (decPart + '00').slice(0, 2);
  const cents = parseInt(intPart, 10) * 100 + parseInt(paddedDec, 10);
  if (!Number.isSafeInteger(cents) || cents <= 0 || cents > 999999999) {
    return null;
  }
  return cents;
}

export function formatCentsNumber(cents: number): string {
  const abs = Math.abs(Math.trunc(cents));
  const yuan = Math.floor(abs / 100);
  const fen = abs % 100;
  const yuanFormatted = yuan.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const fenFormatted = fen.toString().padStart(2, '0');
  const sign = cents < 0 ? '-' : '';
  return `${sign}${yuanFormatted}.${fenFormatted}`;
}

export function formatCurrency(cents: number): string {
  if (cents < 0) {
    return `-¥ ${formatCentsNumber(Math.abs(cents))}`;
  }
  return `¥ ${formatCentsNumber(cents)}`;
}

export function formatBillAmount(cents: number, type: 'expense' | 'income'): string {
  const formatted = formatCentsNumber(Math.abs(cents));
  return type === 'expense' ? `-¥ ${formatted}` : `+¥ ${formatted}`;
}
