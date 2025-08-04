// Tests for constants and hull code functionality
import { HULL_SIZES } from '../src/data/constants';

describe('Hull Sizes', () => {
  test('100 ton hull should have code A', () => {
    const hull100 = HULL_SIZES.find(hull => hull.tonnage === 100);
    expect(hull100).toBeDefined();
    expect(hull100?.code).toBe('A');
  });

  test('500 ton hull should have code E', () => {
    const hull500 = HULL_SIZES.find(hull => hull.tonnage === 500);
    expect(hull500).toBeDefined();
    expect(hull500?.code).toBe('E');
  });

  test('hull codes should skip I and O', () => {
    const allCodes = HULL_SIZES.map(hull => hull.code);
    expect(allCodes).not.toContain('I');
    expect(allCodes).not.toContain('O');
  });

  test('hull codes should be in correct alphabetical sequence', () => {
    const expectedSequence = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q'];
    const actualCodes = HULL_SIZES.map(hull => hull.code);
    expect(actualCodes).toEqual(expectedSequence);
  });

  test('hull sizes should be properly mapped to codes', () => {
    const expectedMappings = [
      { tonnage: 100, code: 'A' },
      { tonnage: 200, code: 'B' },
      { tonnage: 300, code: 'C' },
      { tonnage: 400, code: 'D' },
      { tonnage: 500, code: 'E' },
      { tonnage: 600, code: 'F' },
      { tonnage: 700, code: 'G' },
      { tonnage: 800, code: 'H' },
      { tonnage: 900, code: 'J' },
      { tonnage: 1000, code: 'K' },
      { tonnage: 1200, code: 'L' },
      { tonnage: 1400, code: 'M' },
      { tonnage: 1600, code: 'N' },
      { tonnage: 1800, code: 'P' },
      { tonnage: 2000, code: 'Q' }
    ];

    expectedMappings.forEach(({ tonnage, code }) => {
      const hull = HULL_SIZES.find(h => h.tonnage === tonnage);
      expect(hull?.code).toBe(code);
    });
  });
});