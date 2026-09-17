export function formatInr(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export function formatQty(value: number, unit: string): string {
  const trimmed = Number.isInteger(value) ? value.toString() : value.toFixed(1);
  return `${trimmed} ${unit}`;
}
