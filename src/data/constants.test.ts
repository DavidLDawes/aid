import { describe, it, expect } from '@jest/globals';
import {
  getTechLevelIndex,
  isTechLevelAtLeast,
  calculateManeuverFuel,
  calculateEngineMassAndCost,
  getAvailableEngines,
  getMaxPowerPlantByTechLevel,
  hasAntimatterPlant,
  calculateAntimatterAdjustedManeuverFuel,
  getBridgeMassAndCost,
  getWeaponMountLimit,
  convertTechLevelToNumber,
  getAvailableVehicles,
  getMinimumComputer,
} from './constants';

describe('Tech Level Functions', () => {
  describe('getTechLevelIndex', () => {
    it('should return correct index for all tech levels', () => {
      expect(getTechLevelIndex('A')).toBe(0);
      expect(getTechLevelIndex('B')).toBe(1);
      expect(getTechLevelIndex('C')).toBe(2);
      expect(getTechLevelIndex('D')).toBe(3);
      expect(getTechLevelIndex('E')).toBe(4);
      expect(getTechLevelIndex('F')).toBe(5);
      expect(getTechLevelIndex('G')).toBe(6);
      expect(getTechLevelIndex('H')).toBe(7);
    });

    it('should return -1 for invalid tech levels', () => {
      expect(getTechLevelIndex('Z')).toBe(-1);
      expect(getTechLevelIndex('1')).toBe(-1);
      expect(getTechLevelIndex('')).toBe(-1);
    });
  });

  describe('isTechLevelAtLeast', () => {
    it('should return true when current level meets requirement', () => {
      expect(isTechLevelAtLeast('H', 'H')).toBe(true);
      expect(isTechLevelAtLeast('H', 'G')).toBe(true);
      expect(isTechLevelAtLeast('G', 'G')).toBe(true);
      expect(isTechLevelAtLeast('F', 'A')).toBe(true);
    });

    it('should return false when current level is below requirement', () => {
      expect(isTechLevelAtLeast('G', 'H')).toBe(false);
      expect(isTechLevelAtLeast('F', 'G')).toBe(false);
      expect(isTechLevelAtLeast('A', 'H')).toBe(false);
    });

    it('should handle invalid tech levels gracefully', () => {
      expect(isTechLevelAtLeast('Z', 'H')).toBe(false);
      expect(isTechLevelAtLeast('H', 'Z')).toBe(false);
    });

    // Test antimatter specific requirements
    it('should correctly validate antimatter tech level requirement (TL H)', () => {
      expect(isTechLevelAtLeast('H', 'H')).toBe(true); // TL H can use antimatter
      expect(isTechLevelAtLeast('G', 'H')).toBe(false); // TL G cannot use antimatter
      expect(isTechLevelAtLeast('F', 'H')).toBe(false); // TL F cannot use antimatter
      expect(isTechLevelAtLeast('A', 'H')).toBe(false); // TL A cannot use antimatter
    });

  });
});

describe('calculateManeuverFuel', () => {
  it('should return 1% of ship tonnage × performance × (weeks/2)', () => {
    // formula: tonnage * 0.01 * performance * (weeks / 2)
    expect(calculateManeuverFuel(200, 1, 2)).toBe(2);   // 200 * 0.01 * 1 * 1
    expect(calculateManeuverFuel(200, 2, 2)).toBe(4);   // 200 * 0.01 * 2 * 1
    expect(calculateManeuverFuel(100, 1, 4)).toBe(2);   // 100 * 0.01 * 1 * 2
  });

  it('should return 0 for zero performance', () => {
    expect(calculateManeuverFuel(200, 0, 4)).toBe(0);
  });
});

describe('getAvailableEngines', () => {
  it('should always return performance ratings 1 through maxPerformance', () => {
    const engines = getAvailableEngines(200, 'power_plant');
    expect(engines.length).toBeGreaterThan(0);
    expect(engines[0].performance).toBe(1);
  });

  it('should return non-empty array for any tonnage', () => {
    const engines = getAvailableEngines(200, 'power_plant');
    expect(engines.length).toBeGreaterThan(0);
  });

  it('should return engines with correct shape', () => {
    const engines = getAvailableEngines(200, 'power_plant');
    const e = engines[0];
    expect(e).toHaveProperty('code');
    expect(e).toHaveProperty('performance');
    expect(e).toHaveProperty('mass');
    expect(e).toHaveProperty('cost');
    expect(e).toHaveProperty('label');
  });

  it('should use P- label for power_plant', () => {
    const engines = getAvailableEngines(200, 'power_plant');
    expect(engines[0].label).toMatch(/^P-/);
  });

  it('should use M- label for maneuver_drive', () => {
    const engines = getAvailableEngines(200, 'maneuver_drive');
    expect(engines[0].label).toMatch(/^M-/);
  });

  it('should filter out maneuver drives exceeding powerPlantPerformance', () => {
    const limited = getAvailableEngines(400, 'maneuver_drive', 2);
    const unlimited = getAvailableEngines(400, 'maneuver_drive');
    expect(limited.length).toBeLessThanOrEqual(unlimited.length);
    limited.forEach(e => expect(e.performance).toBeLessThanOrEqual(2));
  });

  it('should NOT filter power_plant by powerPlantPerformance', () => {
    const filtered = getAvailableEngines(400, 'power_plant', 1);
    const unfiltered = getAvailableEngines(400, 'power_plant');
    expect(filtered.length).toBe(unfiltered.length);
  });

  it('should gate power_plant performance by tech level when techLevel is provided', () => {
    const tlA = getAvailableEngines(1_000_000, 'power_plant', undefined, 'A');
    expect(Math.max(...tlA.map(e => e.performance))).toBe(6);

    const tlF = getAvailableEngines(1_000_000, 'power_plant', undefined, 'F');
    expect(Math.max(...tlF.map(e => e.performance))).toBe(7);

    const tlG = getAvailableEngines(1_000_000, 'power_plant', undefined, 'G');
    expect(Math.max(...tlG.map(e => e.performance))).toBe(8);

    const tlH = getAvailableEngines(1_000_000, 'power_plant', undefined, 'H');
    expect(Math.max(...tlH.map(e => e.performance))).toBe(10);

    const tlJ = getAvailableEngines(1_000_000, 'power_plant', undefined, 'J');
    expect(Math.max(...tlJ.map(e => e.performance))).toBe(12);
  });

  it('should not extend maneuver_drive performance via the power plant TL gate', () => {
    const maneuver = getAvailableEngines(1_000_000, 'maneuver_drive', undefined, 'J');
    expect(Math.max(...maneuver.map(e => e.performance))).toBe(6);
  });
});

describe('getMaxPowerPlantByTechLevel', () => {
  it('caps at P-6 below TL-F', () => {
    expect(getMaxPowerPlantByTechLevel('A')).toBe(6);
    expect(getMaxPowerPlantByTechLevel('E')).toBe(6);
  });

  it('steps up with tech level: F=7, G=8, H=10, J=12', () => {
    expect(getMaxPowerPlantByTechLevel('F')).toBe(7);
    expect(getMaxPowerPlantByTechLevel('G')).toBe(8);
    expect(getMaxPowerPlantByTechLevel('H')).toBe(10);
    expect(getMaxPowerPlantByTechLevel('J')).toBe(12);
  });
});

describe('calculateEngineMassAndCost at extended power plant tiers', () => {
  it('computes mass/cost for P-11 and P-12', () => {
    const p11 = calculateEngineMassAndCost(1_000_000, 'power_plant', 11);
    expect(p11.mass).toBe(100_000); // 10.0% of 1,000,000
    expect(p11.cost).toBe(200_000); // 2.0 MCr/ton

    const p12 = calculateEngineMassAndCost(1_000_000, 'power_plant', 12);
    expect(p12.mass).toBe(110_000); // 11.0% of 1,000,000
  });

  it('returns zero mass/cost above P-12', () => {
    expect(calculateEngineMassAndCost(1_000_000, 'power_plant', 13)).toEqual({ mass: 0, cost: 0 });
  });

  it('returns zero for maneuver_drive at performance 11+ (no table entry)', () => {
    // Unlike power_plant, maneuver_drive has no extended tiers.
    expect(calculateEngineMassAndCost(1_000_000, 'maneuver_drive', 11)).toEqual({ mass: 0, cost: 0 });
  });
});

describe('Antimatter Plant fuel discount', () => {
  it('hasAntimatterPlant detects an installed plant with quantity > 0', () => {
    expect(hasAntimatterPlant([{ system_type: 'antimatter_plant', quantity: 1 }])).toBe(true);
    expect(hasAntimatterPlant([{ system_type: 'antimatter_plant', quantity: 0 }])).toBe(false);
    expect(hasAntimatterPlant([{ system_type: 'fuel_tank', quantity: 5 }])).toBe(false);
    expect(hasAntimatterPlant([])).toBe(false);
  });

  it('calculateAntimatterAdjustedManeuverFuel reduces fuel to 1/10th when an AM plant is present', () => {
    const normal = calculateAntimatterAdjustedManeuverFuel(1_000_000, 2, 4, false);
    const discounted = calculateAntimatterAdjustedManeuverFuel(1_000_000, 2, 4, true);
    expect(normal).toBe(calculateManeuverFuel(1_000_000, 2, 4));
    expect(discounted).toBeCloseTo(normal * 0.1);
  });
});

describe('getBridgeMassAndCost', () => {
  it('should return 10t mass for ships ≤200 tons', () => {
    expect(getBridgeMassAndCost(200, false)).toEqual({ mass: 10, cost: 5 });
    expect(getBridgeMassAndCost(100, false)).toEqual({ mass: 10, cost: 5 });
  });

  it('should return 20t mass for ships 201–1000 tons', () => {
    expect(getBridgeMassAndCost(1000, false)).toEqual({ mass: 20, cost: 10 });
    expect(getBridgeMassAndCost(500, false)).toEqual({ mass: 20, cost: 10 });
  });

  it('should return 40t mass for ships 1001–2000 tons', () => {
    expect(getBridgeMassAndCost(2000, false)).toEqual({ mass: 40, cost: 20 });
    expect(getBridgeMassAndCost(1500, false)).toEqual({ mass: 40, cost: 20 });
  });

  it('should return 60t mass for ships >2000 tons', () => {
    expect(getBridgeMassAndCost(2001, false)).toEqual({ mass: 60, cost: 30 });
    expect(getBridgeMassAndCost(5000, false)).toEqual({ mass: 60, cost: 30 });
  });

  it('should halve mass and use cost = halvedMass * 1.5 for half bridge', () => {
    expect(getBridgeMassAndCost(200, true)).toEqual({ mass: 5, cost: 7.5 });
    expect(getBridgeMassAndCost(1000, true)).toEqual({ mass: 10, cost: 15 });
  });
});

describe('getWeaponMountLimit', () => {
  it('should return 1 mount per 100 tons (floored)', () => {
    expect(getWeaponMountLimit(100)).toBe(1);
    expect(getWeaponMountLimit(200)).toBe(2);
    expect(getWeaponMountLimit(500)).toBe(5);
    expect(getWeaponMountLimit(150)).toBe(1);
    expect(getWeaponMountLimit(199)).toBe(1);
  });
});

describe('convertTechLevelToNumber', () => {
  it('should convert tech level letters to numbers', () => {
    expect(convertTechLevelToNumber('A')).toBe(10);
    expect(convertTechLevelToNumber('B')).toBe(11);
    expect(convertTechLevelToNumber('C')).toBe(12);
    expect(convertTechLevelToNumber('H')).toBe(17);
  });

  it('should map J to 18, skipping I per the Traveller TL convention', () => {
    expect(convertTechLevelToNumber('J')).toBe(18);
  });

  it('should return 0 for a letter not in TECH_LEVELS', () => {
    // 'Z' is not (yet) a supported tech level, unlike the old charCode-offset
    // formula which treated any single uppercase letter as valid.
    expect(convertTechLevelToNumber('Z')).toBe(0);
  });

  it('should return 0 for empty string', () => {
    expect(convertTechLevelToNumber('')).toBe(0);
  });
});

describe('getAvailableVehicles', () => {
  it('should return an array', () => {
    expect(Array.isArray(getAvailableVehicles('B'))).toBe(true);
  });

  it('should return at least as many vehicles at higher TL', () => {
    const lowTL = getAvailableVehicles('A');
    const highTL = getAvailableVehicles('H');
    expect(highTL.length).toBeGreaterThanOrEqual(lowTL.length);
  });

  it('should only return vehicles within ship tech level', () => {
    const vehicles = getAvailableVehicles('B');
    const shipTLNum = convertTechLevelToNumber('B');
    vehicles.forEach(v => {
      expect(v.techLevel).toBeLessThanOrEqual(shipTLNum);
    });
  });
});
describe('getMinimumComputer', () => {
  it('should require Core/1 minimum for all ships, including those under 3,000 tons', () => {
    // No jump drive — base minimum Core/1
    expect(getMinimumComputer(200, 0).name).toBe('Core/1');
    // Small ship with jump drive — jump floor applies exactly (J-2 → Core/2)
    expect(getMinimumComputer(200, 2).name).toBe('Core/2');
    // Small ship with high jump — jump floor still applies (J-6 → Core/6)
    expect(getMinimumComputer(2999, 6).name).toBe('Core/6');
  });

  it('should apply the size-based minimum for large jump-capable ships', () => {
    // >100,000 tons at J-6 still needs Core/8 (size requirement exceeds jump floor)
    expect(getMinimumComputer(150000, 6).name).toBe('Core/8');
    // >100,000 tons at J-5 needs Core/7
    expect(getMinimumComputer(150000, 5).name).toBe('Core/7');
  });

  it('should enforce a jump-number floor so a large J-4 ship needs at least Core/4', () => {
    expect(getMinimumComputer(150000, 4).name).toBe('Core/4');
  });

  it('should require Core/N for a J-N ship regardless of size', () => {
    // 3,000-5,000 tons at J-4: size needs Core/3, jump floor needs Core/4 → Core/4 wins
    expect(getMinimumComputer(4000, 4).name).toBe('Core/4');
    // 3,000-5,000 tons at J-1: size needs nothing (J<2), jump floor Core/1 → Core/1
    expect(getMinimumComputer(4000, 1).name).toBe('Core/1');
  });

  it('should pick the more capable of the size and jump requirements', () => {
    // 10,001-50,000 tons at J-3: size needs Core/5, jump floor needs Core/3 → Core/5
    expect(getMinimumComputer(20000, 3).name).toBe('Core/5');
  });
});
