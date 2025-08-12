import { describe, it, expect } from '@jest/globals';
import { 
  getTechLevelIndex, 
  isTechLevelAtLeast, 
  calculateTotalFuelMass,
  calculateJumpFuel,
  calculateManeuverFuel
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