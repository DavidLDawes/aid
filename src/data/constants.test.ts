import { describe, it, expect } from '@jest/globals';
import {
  getTechLevelIndex,
  isTechLevelAtLeast,
  calculateTotalFuelMass,
  calculateJumpFuel,
  calculateManeuverFuel,
  getAvailableEngines,
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

    // Test longer jumps specific requirements
    it('should correctly validate longer jumps tech level requirement (TL G+)', () => {
      expect(isTechLevelAtLeast('H', 'G')).toBe(true); // TL H can use longer jumps
      expect(isTechLevelAtLeast('G', 'G')).toBe(true); // TL G can use longer jumps
      expect(isTechLevelAtLeast('F', 'G')).toBe(false); // TL F cannot use longer jumps
      expect(isTechLevelAtLeast('A', 'G')).toBe(false); // TL A cannot use longer jumps
    });
  });
});

describe('Fuel Calculation Functions', () => {
  describe('calculateTotalFuelMass without antimatter', () => {
    it('should calculate normal fuel mass correctly', () => {
      const shipTonnage = 200;
      const jumpPerformance = 1;
      const maneuverPerformance = 1;
      const weeks = 2;
      
      const result = calculateTotalFuelMass(shipTonnage, jumpPerformance, maneuverPerformance, weeks, false);
      
      // Expected: Jump fuel (10% of 200 for jump-1) + Maneuver fuel (1% of 200 for M-1, 2 weeks)
      const expectedJumpFuel = calculateJumpFuel(shipTonnage, jumpPerformance); // 20 tons
      const expectedManeuverFuel = calculateManeuverFuel(shipTonnage, maneuverPerformance, weeks); // 4 tons
      const expected = expectedJumpFuel + expectedManeuverFuel; // 24 tons
      
      expect(result).toBe(expected);
    });

    it('should handle zero performance values', () => {
      const shipTonnage = 200;
      const jumpPerformance = 0;
      const maneuverPerformance = 0;
      const weeks = 2;
      
      const result = calculateTotalFuelMass(shipTonnage, jumpPerformance, maneuverPerformance, weeks, false);
      expect(result).toBe(0);
    });
  });

  describe('calculateTotalFuelMass with antimatter', () => {
    it('should reduce fuel mass to 10% when antimatter is enabled', () => {
      const shipTonnage = 200;
      const jumpPerformance = 1;
      const maneuverPerformance = 1;
      const weeks = 2;
      
      const normalFuel = calculateTotalFuelMass(shipTonnage, jumpPerformance, maneuverPerformance, weeks, false);
      const antimatterFuel = calculateTotalFuelMass(shipTonnage, jumpPerformance, maneuverPerformance, weeks, true);
      
      expect(antimatterFuel).toBe(normalFuel * 0.1);
    });

    it('should provide 90% fuel savings with antimatter', () => {
      const shipTonnage = 400;
      const jumpPerformance = 2;
      const maneuverPerformance = 2;
      const weeks = 4;
      
      const normalFuel = calculateTotalFuelMass(shipTonnage, jumpPerformance, maneuverPerformance, weeks, false);
      const antimatterFuel = calculateTotalFuelMass(shipTonnage, jumpPerformance, maneuverPerformance, weeks, true);
      
      const fuelSavings = normalFuel - antimatterFuel;
      const savingsPercentage = fuelSavings / normalFuel;
      
      expect(savingsPercentage).toBeCloseTo(0.9, 2); // 90% savings
    });

    it('should handle edge cases with antimatter', () => {
      // Test with zero fuel requirements
      expect(calculateTotalFuelMass(200, 0, 0, 2, true)).toBe(0);
      
      // Test with minimal fuel requirements
      const minimalFuel = calculateTotalFuelMass(100, 1, 1, 1, true);
      expect(minimalFuel).toBeGreaterThan(0);
      expect(minimalFuel).toBeLessThan(calculateTotalFuelMass(100, 1, 1, 1, false));
    });
  });

  describe('real-world antimatter scenarios', () => {
    it('should correctly calculate fuel for a Scout with antimatter', () => {
      // Scout: 100 tons, Jump-2, Maneuver-2, 2 weeks fuel
      const shipTonnage = 100;
      const jumpPerformance = 2;
      const maneuverPerformance = 2;
      const weeks = 2;
      
      const normalFuel = calculateTotalFuelMass(shipTonnage, jumpPerformance, maneuverPerformance, weeks, false);
      const antimatterFuel = calculateTotalFuelMass(shipTonnage, jumpPerformance, maneuverPerformance, weeks, true);
      
      // Normal fuel should be: Jump-2 (20 tons) + Maneuver-2 (2 tons for 2 weeks) = 22 tons
      expect(normalFuel).toBe(22);
      // Antimatter fuel should be 10% of normal = 2.2 tons
      expect(antimatterFuel).toBe(2.2);
    });

    it('should correctly calculate fuel for a Free Trader with antimatter', () => {
      // Free Trader: 200 tons, Jump-1, Maneuver-1, 2 weeks fuel
      const shipTonnage = 200;
      const jumpPerformance = 1;
      const maneuverPerformance = 1;
      const weeks = 2;
      
      const normalFuel = calculateTotalFuelMass(shipTonnage, jumpPerformance, maneuverPerformance, weeks, false);
      const antimatterFuel = calculateTotalFuelMass(shipTonnage, jumpPerformance, maneuverPerformance, weeks, true);
      
      // Normal fuel should be: Jump-1 (20 tons) + Maneuver-1 (2 tons for 2 weeks) = 22 tons
      expect(normalFuel).toBe(22);
      // Antimatter fuel should be 10% of normal = 2.2 tons
      expect(antimatterFuel).toBe(2.2);
    });

    it('should correctly calculate fuel for high-performance ships with antimatter', () => {
      // High-performance ship: 1000 tons, Jump-6, Maneuver-6, 4 weeks fuel
      const shipTonnage = 1000;
      const jumpPerformance = 6;
      const maneuverPerformance = 6;
      const weeks = 4;
      
      const normalFuel = calculateTotalFuelMass(shipTonnage, jumpPerformance, maneuverPerformance, weeks, false);
      const antimatterFuel = calculateTotalFuelMass(shipTonnage, jumpPerformance, maneuverPerformance, weeks, true);
      
      // Normal fuel should be: Jump-6 (600 tons) + Maneuver-6 (120 tons for 4 weeks) = 720 tons
      expect(normalFuel).toBe(720);
      // Antimatter fuel should be 10% of normal = 72 tons
      expect(antimatterFuel).toBe(72);
      
      // Verify the massive fuel savings
      const savings = normalFuel - antimatterFuel;
      expect(savings).toBe(648); // 648 tons saved!
    });
  });

  describe('antimatter fuel calculation edge cases', () => {
    it('should handle large ships with antimatter correctly', () => {
      const shipTonnage = 2000;
      const jumpPerformance = 4;
      const maneuverPerformance = 4;
      const weeks = 6;
      
      const normalFuel = calculateTotalFuelMass(shipTonnage, jumpPerformance, maneuverPerformance, weeks, false);
      const antimatterFuel = calculateTotalFuelMass(shipTonnage, jumpPerformance, maneuverPerformance, weeks, true);
      
      expect(antimatterFuel).toBe(normalFuel * 0.1);
      expect(antimatterFuel).toBeGreaterThan(0);
    });

    it('should maintain precision with antimatter calculations', () => {
      const shipTonnage = 150;
      const jumpPerformance = 3;
      const maneuverPerformance = 3;
      const weeks = 3;
      
      const normalFuel = calculateTotalFuelMass(shipTonnage, jumpPerformance, maneuverPerformance, weeks, false);
      const antimatterFuel = calculateTotalFuelMass(shipTonnage, jumpPerformance, maneuverPerformance, weeks, true);
      
      // Check that precision is maintained (no rounding errors)
      expect(antimatterFuel).toBe(normalFuel * 0.1);
    });
  });
});

describe('calculateJumpFuel', () => {
  it('should return 10% of ship tonnage per jump performance', () => {
    expect(calculateJumpFuel(200, 1)).toBe(20);
    expect(calculateJumpFuel(200, 2)).toBe(40);
    expect(calculateJumpFuel(400, 3)).toBe(120);
  });

  it('should return 0 for zero jump performance', () => {
    expect(calculateJumpFuel(200, 0)).toBe(0);
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

  it('should use J- label for jump_drive', () => {
    const engines = getAvailableEngines(200, 'jump_drive');
    expect(engines[0].label).toMatch(/^J-/);
  });

  it('should use M- label for maneuver_drive', () => {
    const engines = getAvailableEngines(200, 'maneuver_drive');
    expect(engines[0].label).toMatch(/^M-/);
  });

  it('should filter out drives exceeding powerPlantPerformance for jump/maneuver', () => {
    const limited = getAvailableEngines(400, 'jump_drive', 2);
    const unlimited = getAvailableEngines(400, 'jump_drive');
    expect(limited.length).toBeLessThanOrEqual(unlimited.length);
    limited.forEach(e => expect(e.performance).toBeLessThanOrEqual(2));
  });

  it('should NOT filter power_plant by powerPlantPerformance', () => {
    const filtered = getAvailableEngines(400, 'power_plant', 1);
    const unfiltered = getAvailableEngines(400, 'power_plant');
    expect(filtered.length).toBe(unfiltered.length);
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

  it('should map any A-Z letter to charCode offset + 10', () => {
    // 'Z' is a valid single uppercase letter so returns 35, not 0
    expect(convertTechLevelToNumber('Z')).toBe(35);
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
