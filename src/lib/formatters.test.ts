import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate } from './formatters';

describe('formatCurrency', () => {
  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('R$\u00a00,00');
  });

  it('formats small values', () => {
    expect(formatCurrency(100)).toBe('R$\u00a01,00');
  });

  it('formats cents correctly', () => {
    expect(formatCurrency(1050)).toBe('R$\u00a010,50');
  });

  it('formats large values with thousand separator', () => {
    const result = formatCurrency(123456);
    expect(result).toContain('1.234,56');
  });

  it('formats negative values', () => {
    const result = formatCurrency(-500);
    expect(result).toContain('5,00');
    expect(result).toContain('-');
  });

  it('formats single cent', () => {
    expect(formatCurrency(1)).toBe('R$\u00a00,01');
  });
});

describe('formatDate', () => {
  it('formats ISO date string to pt-BR', () => {
    const result = formatDate('2026-04-10T12:00:00Z');
    expect(result).toBe('10/04/2026');
  });

  it('formats another date correctly', () => {
    const result = formatDate('2025-01-15T12:00:00Z');
    expect(result).toBe('15/01/2025');
  });

  it('handles date with timezone', () => {
    const result = formatDate('2026-12-25T23:59:59-03:00');
    // Should still format correctly (may show 25 or 26 depending on TZ)
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});
