import { describe, it, expect } from '@jest/globals';
import type { StaffRequirements } from '../types/ship';

// Helper function to calculate adjusted crew count (extracted from App.tsx logic)
function calculateAdjustedCrewCount(
  staffRequirements: StaffRequirements, 
  shipTonnage: number,
  combinePilotNavigator: boolean,
  noStewards: boolean
): number {
  const isSmallShip = shipTonnage === 100 || shipTonnage === 200;
  if (!isSmallShip) return staffRequirements.total;
  
  return combinePilotNavigator && noStewards
    ? staffRequirements.total - 1 - staffRequirements.stewards
    : combinePilotNavigator 
      ? staffRequirements.total - 1 
      : noStewards 
        ? staffRequirements.total - staffRequirements.stewards
        : staffRequirements.total;
}

describe('Crew Adjustments for Small Ships', () => {
  const mockStaffRequirements: StaffRequirements = {
    pilot: 1,
    navigator: 1,
    engineers: 1,
    gunners: 0,
    service: 0,
    stewards: 1,
    nurses: 0,
    surgeons: 0,
    techs: 0,
    total: 4
  };

  describe('100 ton ships', () => {
    it('should return original crew count with no adjustments', () => {
      const result = calculateAdjustedCrewCount(mockStaffRequirements, 100, false, false);
      expect(result).toBe(4);
    });

    it('should reduce crew by 1 when combining pilot and navigator', () => {
      const result = calculateAdjustedCrewCount(mockStaffRequirements, 100, true, false);
      expect(result).toBe(3);
    });

    it('should reduce crew by steward count when no stewards', () => {
      const result = calculateAdjustedCrewCount(mockStaffRequirements, 100, false, true);
      expect(result).toBe(3);
    });

    it('should reduce crew by both adjustments when both options selected', () => {
      const result = calculateAdjustedCrewCount(mockStaffRequirements, 100, true, true);
      expect(result).toBe(2);
    });
  });

  describe('200 ton ships', () => {
    it('should return original crew count with no adjustments', () => {
      const result = calculateAdjustedCrewCount(mockStaffRequirements, 200, false, false);
      expect(result).toBe(4);
    });

    it('should reduce crew by 1 when combining pilot and navigator', () => {
      const result = calculateAdjustedCrewCount(mockStaffRequirements, 200, true, false);
      expect(result).toBe(3);
    });

    it('should reduce crew by steward count when no stewards', () => {
      const result = calculateAdjustedCrewCount(mockStaffRequirements, 200, false, true);
      expect(result).toBe(3);
    });

    it('should reduce crew by both adjustments when both options selected', () => {
      const result = calculateAdjustedCrewCount(mockStaffRequirements, 200, true, true);
      expect(result).toBe(2);
    });
  });

  describe('larger ships', () => {
    it('should ignore adjustments for 300 ton ships', () => {
      const result = calculateAdjustedCrewCount(mockStaffRequirements, 300, true, true);
      expect(result).toBe(4);
    });

    it('should ignore adjustments for 400 ton ships', () => {
      const result = calculateAdjustedCrewCount(mockStaffRequirements, 400, true, true);
      expect(result).toBe(4);
    });

    it('should ignore adjustments for 1000 ton ships', () => {
      const result = calculateAdjustedCrewCount(mockStaffRequirements, 1000, true, true);
      expect(result).toBe(4);
    });
  });

  describe('edge cases', () => {
    it('should handle crew with no stewards', () => {
      const noStewardStaff: StaffRequirements = {
        ...mockStaffRequirements,
        stewards: 0,
        total: 3
      };
      const result = calculateAdjustedCrewCount(noStewardStaff, 100, false, true);
      expect(result).toBe(3); // No change since no stewards to remove
    });

    it('should handle crew with multiple stewards', () => {
      const multiStewardStaff: StaffRequirements = {
        ...mockStaffRequirements,
        stewards: 3,
        total: 6
      };
      const result = calculateAdjustedCrewCount(multiStewardStaff, 100, false, true);
      expect(result).toBe(3); // Remove all 3 stewards
    });

    it('should handle both adjustments with multiple stewards', () => {
      const multiStewardStaff: StaffRequirements = {
        ...mockStaffRequirements,
        stewards: 2,
        total: 5
      };
      const result = calculateAdjustedCrewCount(multiStewardStaff, 100, true, true);
      expect(result).toBe(2); // Remove 1 pilot/navigator + 2 stewards
    });
  });
});