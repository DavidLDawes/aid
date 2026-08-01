import { describe, it, expect } from '@jest/globals';
import { calculatePilotCount, calculateNavigatorCount } from './crewCalculations';

describe('calculatePilotCount', () => {
  it('requires 8 pilots (24x7 coverage with spares) at M-1 or better', () => {
    expect(calculatePilotCount(1)).toBe(8);
    expect(calculatePilotCount(6)).toBe(8);
  });

  it('requires only a skeleton crew of 1 pilot at M-0 (stationary)', () => {
    expect(calculatePilotCount(0)).toBe(1);
  });
});

describe('calculateNavigatorCount', () => {
  it('requires no standing navigator by default', () => {
    expect(calculateNavigatorCount(false)).toBe(0);
    expect(calculateNavigatorCount(undefined)).toBe(0);
  });

  it('requires 4 navigators when atmosphere support is enabled', () => {
    expect(calculateNavigatorCount(true)).toBe(4);
  });
});
