import { describe, it, expect } from '@jest/globals';
import { calculatePilotCount, calculateNavigatorCount, calculateEngineerCount } from './crewCalculations';

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

describe('calculateEngineerCount', () => {
  it('requires a minimum of 1 engineer even with no engines configured', () => {
    expect(calculateEngineerCount([], 'A', false)).toBe(1);
  });

  it('requires 1 engineer per engine when none exceed 100 tons', () => {
    const engines = [{ mass: 50 }, { mass: 80 }, { mass: 99 }];
    expect(calculateEngineerCount(engines, 'A', false)).toBe(3);
  });

  it('adds extra engineers for engines over 100 tons', () => {
    // 250t: 1 + ceil(250/100) - 1 = 3
    expect(calculateEngineerCount([{ mass: 250 }], 'A', false)).toBe(3);
  });

  it('ignores robotics when disabled, regardless of tech level', () => {
    expect(calculateEngineerCount([{ mass: 1300 }], 'J', false)).toBe(13);
  });

  it('applies the TL-F robotics divisor (1/2, rounded up) per engine', () => {
    // baseCrew 13 -> ceil(13/2) = 7
    expect(calculateEngineerCount([{ mass: 1300 }], 'F', true)).toBe(7);
  });

  it('applies the TL-G robotics divisor (1/4, rounded up) per engine', () => {
    // baseCrew 13 -> ceil(13/4) = 4
    expect(calculateEngineerCount([{ mass: 1300 }], 'G', true)).toBe(4);
  });

  it('applies the TL-H robotics divisor (1/6, rounded up) per engine', () => {
    // baseCrew 13 -> ceil(13/6) = 3
    expect(calculateEngineerCount([{ mass: 1300 }], 'H', true)).toBe(3);
  });

  it('applies the TL-J robotics divisor (1/8, rounded up) per engine', () => {
    // baseCrew 13 -> ceil(13/8) = 2
    expect(calculateEngineerCount([{ mass: 1300 }], 'J', true)).toBe(2);
  });

  it('reduces below TL-F to no effect (divisor 1) even if somehow enabled', () => {
    expect(calculateEngineerCount([{ mass: 1300 }], 'E', true)).toBe(13);
  });

  it('applies the per-engine reduction independently before summing', () => {
    // Two 150t engines: baseCrew 2 each -> ceil(2/2) = 1 each -> total 2
    const engines = [{ mass: 150 }, { mass: 150 }];
    expect(calculateEngineerCount(engines, 'F', true)).toBe(2);
  });
});
