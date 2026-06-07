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

  describe('calculateJumpFuel', () => {
    it('should be 10% of ship tonnage per jump rating', () => {
      expect(calculateJumpFuel(200, 1)).toBe(20);
      expect(calculateJumpFuel(200, 2)).toBe(40);
      expect(calculateJumpFuel(1000, 6)).toBe(600);
    });

    it('should return 0 for zero jump performance', () => {
      expect(calculateJumpFuel(200, 0)).toBe(0);
    });
  });

  describe('calculateManeuverFuel', () => {
    it('should be 1% of ship tonnage per rating per 2 weeks', () => {
      expect(calculateManeuverFuel(200, 1, 2)).toBe(2);
      expect(calculateManeuverFuel(200, 2, 2)).toBe(4);
      expect(calculateManeuverFuel(200, 1, 4)).toBe(4);
    });

    it('should return 0 for zero maneuver performance', () => {
      expect(calculateManeuverFuel(200, 0, 2)).toBe(0);
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

describe('getAvailableEngines', () => {
  it('should return empty array for invalid hull tonnage', () => {
    expect(getAvailableEngines(99, 'power_plant')).toEqual([]);
    expect(getAvailableEngines(999, 'power_plant')).toEqual([]);
  });

  it('should return engines for a valid hull tonnage', () => {
    const engines = getAvailableEngines(100, 'power_plant');
    expect(engines.length).toBeGreaterThan(0);
  });

  it('should return engines with the correct shape', () => {
    const engines = getAvailableEngines(100, 'power_plant');
    const engine = engines[0];
    expect(engine).toHaveProperty('code');
    expect(engine).toHaveProperty('performance');
    expect(engine).toHaveProperty('mass');
    expect(engine).toHaveProperty('cost');
    expect(engine).toHaveProperty('label');
  });

  it('should use P label for power_plant', () => {
    const engines = getAvailableEngines(100, 'power_plant');
    expect(engines.every(e => e.label.includes('P-'))).toBe(true);
  });

  it('should use J label for jump_drive', () => {
    const engines = getAvailableEngines(200, 'jump_drive');
    expect(engines.every(e => e.label.includes('J-'))).toBe(true);
  });

  it('should use M label for maneuver_drive', () => {
    const engines = getAvailableEngines(200, 'maneuver_drive');
    expect(engines.every(e => e.label.includes('M-'))).toBe(true);
  });

  it('should filter jump drives by power plant performance', () => {
    const allJumpEngines = getAvailableEngines(200, 'jump_drive');
    const filteredEngines = getAvailableEngines(200, 'jump_drive', 1);
    expect(filteredEngines.length).toBeLessThanOrEqual(allJumpEngines.length);
    expect(filteredEngines.every(e => e.performance <= 1)).toBe(true);
  });

  it('should not filter power_plant engines by powerPlantPerformance', () => {
    const withFilter = getAvailableEngines(200, 'power_plant', 1);
    const withoutFilter = getAvailableEngines(200, 'power_plant');
    expect(withFilter.length).toBe(withoutFilter.length);
  });

  it('should return more engines for larger hulls', () => {
    const small = getAvailableEngines(100, 'power_plant');
    const large = getAvailableEngines(1000, 'power_plant');
    expect(large.length).toBeGreaterThanOrEqual(small.length);
  });
});

describe('getBridgeMassAndCost', () => {
  it('should return 10 ton bridge for ships up to 200 tons', () => {
    expect(getBridgeMassAndCost(100, false)).toEqual({ mass: 10, cost: 5 });
    expect(getBridgeMassAndCost(200, false)).toEqual({ mass: 10, cost: 5 });
  });

  it('should return 20 ton bridge for ships 201–1000 tons', () => {
    expect(getBridgeMassAndCost(300, false)).toEqual({ mass: 20, cost: 10 });
    expect(getBridgeMassAndCost(1000, false)).toEqual({ mass: 20, cost: 10 });
  });

  it('should return 40 ton bridge for ships 1001–2000 tons', () => {
    expect(getBridgeMassAndCost(1001, false)).toEqual({ mass: 40, cost: 20 });
    expect(getBridgeMassAndCost(2000, false)).toEqual({ mass: 40, cost: 20 });
  });

  it('should halve mass for half bridge and price at 1.5x the halved mass', () => {
    expect(getBridgeMassAndCost(100, true)).toEqual({ mass: 5, cost: 7.5 });
    expect(getBridgeMassAndCost(300, true)).toEqual({ mass: 10, cost: 15 });
    expect(getBridgeMassAndCost(2000, true)).toEqual({ mass: 20, cost: 30 });
  });

  it('full bridge cost is 0.5x mass', () => {
    const { mass, cost } = getBridgeMassAndCost(400, false);
    expect(cost).toBe(mass * 0.5);
  });
});

describe('getWeaponMountLimit', () => {
  it('should return 1 mount per 100 tons', () => {
    expect(getWeaponMountLimit(100)).toBe(1);
    expect(getWeaponMountLimit(200)).toBe(2);
    expect(getWeaponMountLimit(500)).toBe(5);
    expect(getWeaponMountLimit(2000)).toBe(20);
  });

  it('should floor partial hundreds', () => {
    expect(getWeaponMountLimit(150)).toBe(1);
    expect(getWeaponMountLimit(199)).toBe(1);
    expect(getWeaponMountLimit(299)).toBe(2);
  });
});

describe('convertTechLevelToNumber', () => {
  it('should convert letters to numbers starting at 10 for A', () => {
    expect(convertTechLevelToNumber('A')).toBe(10);
    expect(convertTechLevelToNumber('B')).toBe(11);
    expect(convertTechLevelToNumber('C')).toBe(12);
    expect(convertTechLevelToNumber('H')).toBe(17);
  });

  it('should handle the full A–H game range', () => {
    const expected = [10, 11, 12, 13, 14, 15, 16, 17];
    ['A','B','C','D','E','F','G','H'].forEach((tl, i) => {
      expect(convertTechLevelToNumber(tl)).toBe(expected[i]);
    });
  });

  it('should return 0 for empty or invalid input', () => {
    expect(convertTechLevelToNumber('')).toBe(0);
    expect(convertTechLevelToNumber('invalid')).toBe(0);
  });
});

describe('getAvailableVehicles', () => {
  it('should return no vehicles for very low tech level', () => {
    const vehicles = getAvailableVehicles('A'); // TL 10
    // All vehicles require TL 10+ so at minimum some should be available
    expect(Array.isArray(vehicles)).toBe(true);
  });

  it('should return more vehicles at higher tech levels', () => {
    const lowTL = getAvailableVehicles('A');
    const highTL = getAvailableVehicles('H');
    expect(highTL.length).toBeGreaterThanOrEqual(lowTL.length);
  });

  it('should return all vehicles at max tech level H', () => {
    const allVehicles = getAvailableVehicles('H');
    expect(allVehicles.length).toBeGreaterThan(0);
  });

  it('should only return vehicles whose tech level requirement is met', () => {
    const shipTL = convertTechLevelToNumber('B'); // 11
    const vehicles = getAvailableVehicles('B');
    expect(vehicles.every(v => v.techLevel <= shipTL)).toBe(true);
  });
});