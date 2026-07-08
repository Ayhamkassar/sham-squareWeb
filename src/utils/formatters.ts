/** Formats a number as Saudi Riyal currency, e.g. formatCurrency(1250) -> "1,250 ر.س" */
export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('en-US')} ر.س`;
}

/** Clamp helper used by stock/percentage bars. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
