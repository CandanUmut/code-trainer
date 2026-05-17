export function formatValue(val: unknown): string {
  if (val === null || val === undefined) return String(val);
  if (typeof val === 'string') return `"${val}"`;
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val, null, 2);
    } catch {
      return String(val);
    }
  }
  return String(val);
}

export function computeDiff(
  expected: unknown,
  actual: unknown,
): { expectedStr: string; actualStr: string; isSame: boolean } {
  const expectedStr = formatValue(expected);
  const actualStr = formatValue(actual);
  return { expectedStr, actualStr, isSame: expectedStr === actualStr };
}
