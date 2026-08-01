import { describe, it, expect } from '@jest/globals';
import { escapeCsvField } from './csv';

describe('escapeCsvField', () => {
  it('leaves a plain field unchanged', () => {
    expect(escapeCsvField('Power Plant P-6')).toBe('Power Plant P-6');
    expect(escapeCsvField(42)).toBe('42');
  });

  it('quotes a field containing a comma', () => {
    expect(escapeCsvField('M-2, 4 weeks, Antimatter')).toBe('"M-2, 4 weeks, Antimatter"');
  });

  it('quotes and doubles embedded quotes', () => {
    expect(escapeCsvField('Ring "World" Alpha')).toBe('"Ring ""World"" Alpha"');
  });

  it('quotes a field containing a newline', () => {
    expect(escapeCsvField('line one\nline two')).toBe('"line one\nline two"');
  });
});
