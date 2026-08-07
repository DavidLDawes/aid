import { describe, it, expect } from '@jest/globals';
import {
  getTechLevelIndex,
  isTechLevelAtLeast,
  calculateManeuverFuel,
  calculateEngineMassAndCost,
  getAvailableEngines,
  getMaxPowerPlantByTechLevel,
  getRoboticsCrewDivisor,
  getRoboticsSupportDivisor,
  hasAntimatterPlant,
  calculateAntimatterAdjustedManeuverFuel,
  getWeaponMountLimit,
  convertTechLevelToNumber,
  getAvailableVehicles,
  getScreenSpecs,
  getMaxScreens,
  getMinPowerPlantForFuelEquipment,
  formatPowerPlantCode,
  FRACTIONAL_POWER_PLANT_LEVELS,
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
    // Fractional (sub-1-gee) power plants are listed first; P-1 follows them.
    const engines = getAvailableEngines(200, 'power_plant');
    expect(engines.length).toBeGreaterThan(0);
    expect(engines.some(e => e.performance === 1)).toBe(true);
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

describe('getRoboticsCrewDivisor', () => {
  it('applies no reduction below TL-F', () => {
    expect(getRoboticsCrewDivisor('A')).toBe(1);
    expect(getRoboticsCrewDivisor('E')).toBe(1);
  });

  it('steps up with tech level: F=2, G=4, H=6, J=8', () => {
    expect(getRoboticsCrewDivisor('F')).toBe(2);
    expect(getRoboticsCrewDivisor('G')).toBe(4);
    expect(getRoboticsCrewDivisor('H')).toBe(6);
    expect(getRoboticsCrewDivisor('J')).toBe(8);
  });
});

describe('getRoboticsSupportDivisor', () => {
  it('applies no reduction below TL-G (including TL-F)', () => {
    expect(getRoboticsSupportDivisor('A')).toBe(1);
    expect(getRoboticsSupportDivisor('F')).toBe(1);
  });

  it('steps up with tech level: G=2, H=3, J=4', () => {
    expect(getRoboticsSupportDivisor('G')).toBe(2);
    expect(getRoboticsSupportDivisor('H')).toBe(3);
    expect(getRoboticsSupportDivisor('J')).toBe(4);
  });
});

describe('getMaxScreens', () => {
  it('should return 0 below TL-C for nuclear dampers and meson screens', () => {
    expect(getMaxScreens('nuclear_damper', 'B')).toBe(0);
    expect(getMaxScreens('meson_screen', 'B')).toBe(0);
  });

  it('should scale nuclear dampers and meson screens from TL-C through TL-J', () => {
    expect(getMaxScreens('nuclear_damper', 'C')).toBe(1);
    expect(getMaxScreens('nuclear_damper', 'D')).toBe(2);
    expect(getMaxScreens('nuclear_damper', 'E')).toBe(4);
    expect(getMaxScreens('nuclear_damper', 'F')).toBe(6);
    expect(getMaxScreens('nuclear_damper', 'G')).toBe(8);
    expect(getMaxScreens('nuclear_damper', 'H')).toBe(10);
    expect(getMaxScreens('nuclear_damper', 'J')).toBe(12);

    expect(getMaxScreens('meson_screen', 'C')).toBe(1);
    expect(getMaxScreens('meson_screen', 'D')).toBe(2);
    expect(getMaxScreens('meson_screen', 'E')).toBe(4);
    expect(getMaxScreens('meson_screen', 'F')).toBe(6);
    expect(getMaxScreens('meson_screen', 'G')).toBe(8);
    expect(getMaxScreens('meson_screen', 'H')).toBe(9);
    expect(getMaxScreens('meson_screen', 'J')).toBe(10);
  });

  it('should return 0 for black globes below TL-F', () => {
    expect(getMaxScreens('black_globe', 'E')).toBe(0);
  });

  it('should scale black globes from TL-F through TL-J', () => {
    expect(getMaxScreens('black_globe', 'F')).toBe(3);
    expect(getMaxScreens('black_globe', 'G')).toBe(4);
    expect(getMaxScreens('black_globe', 'H')).toBe(6);
    expect(getMaxScreens('black_globe', 'J')).toBe(7);
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

describe('Fractional maneuver drives (sub-1-gee, megastructure branch only)', () => {
  // M-1 at 1,000,000 tons: 1.0% tons -> 10,000t, 2.0 MCr/ton -> 20,000 MCr.
  // Fractional drives are a percentage of those M-1 figures, not of tonnage.
  it('computes M-.5 as 40% of M-1 tons and 33% of M-1 cost', () => {
    expect(calculateEngineMassAndCost(1_000_000, 'maneuver_drive', 0.5)).toEqual({ mass: 4_000, cost: 6_600 });
  });

  it('computes M-.4 as 33% of M-1 tons and 25% of M-1 cost', () => {
    expect(calculateEngineMassAndCost(1_000_000, 'maneuver_drive', 0.4)).toEqual({ mass: 3_300, cost: 5_000 });
  });

  it('computes M-.3 as 25% of M-1 tons and 20% of M-1 cost', () => {
    expect(calculateEngineMassAndCost(1_000_000, 'maneuver_drive', 0.3)).toEqual({ mass: 2_500, cost: 4_000 });
  });

  it('computes M-.2 as 10% of M-1 tons and 8% of M-1 cost', () => {
    expect(calculateEngineMassAndCost(1_000_000, 'maneuver_drive', 0.2)).toEqual({ mass: 1_000, cost: 1_600 });
  });

  it('computes M-.1 as 10% of M-1 tons and 5% of M-1 cost', () => {
    expect(calculateEngineMassAndCost(1_000_000, 'maneuver_drive', 0.1)).toEqual({ mass: 1_000, cost: 1_000 });
  });

  it('computes M-.05 as 5% of M-1 tons and 2% of M-1 cost', () => {
    expect(calculateEngineMassAndCost(1_000_000, 'maneuver_drive', 0.05)).toEqual({ mass: 500, cost: 400 });
  });

  it('computes M-.01 as 0.1% of M-1 tons and 0.05% of M-1 cost, floored to the 100-ton minimum', () => {
    // Unfloored this would be 10 tons (0.1% of M-1's 10,000t) - below the
    // 100-ton minimum a maneuver drive can be installed at, so it's clamped
    // up. Cost is unaffected by the floor (it's an independent percentage
    // of M-1's cost, not derived from mass).
    expect(calculateEngineMassAndCost(1_000_000, 'maneuver_drive', 0.01)).toEqual({ mass: 100, cost: 10 });
  });

  it('does not floor M-.01 once the unfloored mass already exceeds 100 tons', () => {
    // M-1 at 20,000,000 tons: 1.0% -> 200,000t. M-.01 = 0.1% of that = 200t,
    // already above the 100-ton floor, so the raw percentage math stands.
    expect(calculateEngineMassAndCost(20_000_000, 'maneuver_drive', 0.01)).toEqual({ mass: 200, cost: 200 });
  });

  it('never floors power plants, only maneuver drives', () => {
    // 1,000 tons is below any real megastructure's minimum tonnage - used
    // here purely to force a sub-100-ton result and prove the 100-ton
    // floor is maneuver-drive-specific; power plants are unaffected.
    const p01 = calculateEngineMassAndCost(1_000, 'power_plant', 0.01);
    expect(p01.mass).toBeLessThan(100);
  });

  it('lists all seven fractional drives ahead of M-1 in getAvailableEngines', () => {
    const engines = getAvailableEngines(1_000_000, 'maneuver_drive');
    const codes = engines.map(e => e.code);
    expect(codes.slice(0, 7)).toEqual(['M-.01', 'M-.05', 'M-.1', 'M-.2', 'M-.3', 'M-.4', 'M-.5']);
    expect(codes[7]).toBe('M-1');
  });

  it('never filters fractional drives out via powerPlantPerformance gating', () => {
    const engines = getAvailableEngines(1_000_000, 'maneuver_drive', 1);
    const fractional = engines.filter(e => e.performance < 1);
    expect(fractional).toHaveLength(7);
  });
});

describe('Fractional power plants (sub-1-gee, megastructure branch only)', () => {
  // P-1 at 1,000,000 tons: 1.5% tons -> 15,000t, 2.0 MCr/ton -> 30,000 MCr.
  // Fractional power plants are a percentage of P-1's tons - cost always
  // matches P-1's cost exactly, unlike fractional maneuver drives.
  it('computes P-.5 as 70% of P-1 tons, same cost as P-1', () => {
    expect(calculateEngineMassAndCost(1_000_000, 'power_plant', 0.5)).toEqual({ mass: 10_500, cost: 30_000 });
  });

  it('computes P-.1 as 30% of P-1 tons, same cost as P-1', () => {
    expect(calculateEngineMassAndCost(1_000_000, 'power_plant', 0.1)).toEqual({ mass: 4_500, cost: 30_000 });
  });

  it('computes P-.05 as 22% of P-1 tons, same cost as P-1', () => {
    expect(calculateEngineMassAndCost(1_000_000, 'power_plant', 0.05)).toEqual({ mass: 3_300, cost: 30_000 });
  });

  it('computes P-.01 as 10% of P-1 tons, same cost as P-1', () => {
    expect(calculateEngineMassAndCost(1_000_000, 'power_plant', 0.01)).toEqual({ mass: 1_500, cost: 30_000 });
  });

  it('returns zero for a fractional performance with no table entry', () => {
    expect(calculateEngineMassAndCost(1_000_000, 'power_plant', 0.3)).toEqual({ mass: 0, cost: 0 });
  });

  it('lists all four fractional power plants ahead of P-1 in getAvailableEngines', () => {
    const engines = getAvailableEngines(1_000_000, 'power_plant', undefined, 'A');
    const codes = engines.map(e => e.code);
    expect(codes.slice(0, 4)).toEqual(['P-.01', 'P-.05', 'P-.1', 'P-.5']);
    expect(codes[4]).toBe('P-1');
  });

  it('formatPowerPlantCode formats fractional and integer performance', () => {
    expect(formatPowerPlantCode(0.01)).toBe('P-.01');
    expect(formatPowerPlantCode(0.05)).toBe('P-.05');
    expect(formatPowerPlantCode(0.1)).toBe('P-.1');
    expect(formatPowerPlantCode(0.5)).toBe('P-.5');
    expect(formatPowerPlantCode(1)).toBe('P-1');
    expect(formatPowerPlantCode(10)).toBe('P-10');
  });

  it('FRACTIONAL_POWER_PLANT_LEVELS all cost 100% of P-1 (mass-only reduction)', () => {
    FRACTIONAL_POWER_PLANT_LEVELS.forEach(level => {
      const p1 = calculateEngineMassAndCost(1_000_000, 'power_plant', 1);
      const fractional = calculateEngineMassAndCost(1_000_000, 'power_plant', level.performance);
      expect(fractional.cost).toBe(p1.cost);
    });
  });
});

describe('getMinPowerPlantForFuelEquipment', () => {
  it('requires P-1 below 10,000,000 tons', () => {
    expect(getMinPowerPlantForFuelEquipment(1_000_000)).toBe(1);
    expect(getMinPowerPlantForFuelEquipment(9_999_999)).toBe(1);
  });

  it('requires only P-.1 at 10,000,000+ tons', () => {
    expect(getMinPowerPlantForFuelEquipment(10_000_000)).toBe(0.1);
    expect(getMinPowerPlantForFuelEquipment(99_999_999)).toBe(0.1);
  });

  it('requires only P-.01 (any level) at 100,000,000+ tons', () => {
    expect(getMinPowerPlantForFuelEquipment(100_000_000)).toBe(0.01);
    expect(getMinPowerPlantForFuelEquipment(1_000_000_000)).toBe(0.01);
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

describe('getScreenSpecs', () => {
  it('returns the base spec for the 1,000,000-4,999,999 ton tier', () => {
    expect(getScreenSpecs('nuclear_damper', 1_000_000)).toEqual({ mass: 80, cost: 80 });
    expect(getScreenSpecs('meson_screen', 1_000_000)).toEqual({ mass: 100, cost: 120 });
    expect(getScreenSpecs('black_globe', 1_000_000)).toEqual({ mass: 35, cost: 350 });

    // Still base tier just under the next threshold
    expect(getScreenSpecs('nuclear_damper', 4_999_999)).toEqual({ mass: 80, cost: 80 });
  });

  it('adds one tier increment for the 5,000,000-24,999,999 ton tier', () => {
    expect(getScreenSpecs('nuclear_damper', 5_000_000)).toEqual({ mass: 100, cost: 90 });
    expect(getScreenSpecs('meson_screen', 5_000_000)).toEqual({ mass: 110, cost: 130 });
    expect(getScreenSpecs('black_globe', 5_000_000)).toEqual({ mass: 40, cost: 400 });

    expect(getScreenSpecs('nuclear_damper', 24_999_999)).toEqual({ mass: 100, cost: 90 });
  });

  it('adds two tier increments for the 25,000,000-124,999,999 ton tier', () => {
    expect(getScreenSpecs('nuclear_damper', 25_000_000)).toEqual({ mass: 120, cost: 100 });
    expect(getScreenSpecs('meson_screen', 25_000_000)).toEqual({ mass: 120, cost: 140 });
    expect(getScreenSpecs('black_globe', 25_000_000)).toEqual({ mass: 45, cost: 450 });

    expect(getScreenSpecs('nuclear_damper', 124_999_999)).toEqual({ mass: 120, cost: 100 });
  });

  it('adds three tier increments for the 125,000,000-624,999,999 ton tier', () => {
    expect(getScreenSpecs('nuclear_damper', 125_000_000)).toEqual({ mass: 140, cost: 110 });
    expect(getScreenSpecs('meson_screen', 125_000_000)).toEqual({ mass: 130, cost: 150 });
    expect(getScreenSpecs('black_globe', 125_000_000)).toEqual({ mass: 50, cost: 500 });

    expect(getScreenSpecs('nuclear_damper', 624_999_999)).toEqual({ mass: 140, cost: 110 });
  });

  it('adds four tier increments for the 625,000,000+ ton tier (covers the 1B max)', () => {
    expect(getScreenSpecs('nuclear_damper', 625_000_000)).toEqual({ mass: 160, cost: 120 });
    expect(getScreenSpecs('meson_screen', 625_000_000)).toEqual({ mass: 140, cost: 160 });
    expect(getScreenSpecs('black_globe', 625_000_000)).toEqual({ mass: 55, cost: 550 });

    // Max megastructure tonnage (1,000,000,000) is still within this tier
    expect(getScreenSpecs('nuclear_damper', 1_000_000_000)).toEqual({ mass: 160, cost: 120 });
  });

  it('returns null below the minimum megastructure tonnage', () => {
    expect(getScreenSpecs('nuclear_damper', 999_999)).toBeNull();
  });
});
