import { describe, it, expect } from '@jest/globals';
import { calculateTotalFuelMass } from '../data/constants';
import type { ShipDesign } from '../types/ship';

describe('Antimatter Integration Tests', () => {
  // Helper function to simulate mass calculation as done in App.tsx
  const simulateAppMassCalculation = (shipDesign: ShipDesign, activeRules: Set<string>): number => {
    let used = 0;
    
    // Add engine masses
    used += shipDesign.engines.reduce((sum, engine) => sum + engine.mass, 0);
    
    // Add fitting masses
    used += shipDesign.fittings.reduce((sum, fitting) => sum + fitting.mass, 0);
    
    // Add weapon masses
    used += shipDesign.weapons.reduce((sum, weapon) => sum + (weapon.mass * weapon.quantity), 0);
    
    // Add defense masses
    used += shipDesign.defenses.reduce((sum, defense) => sum + (defense.mass * defense.quantity), 0);
    
    // Add berth masses
    used += shipDesign.berths.reduce((sum, berth) => sum + (berth.mass * berth.quantity), 0);
    
    // Add facility masses
    used += shipDesign.facilities.reduce((sum, facility) => sum + (facility.mass * facility.quantity), 0);
    
    // Add cargo masses
    used += shipDesign.cargo.reduce((sum, cargo) => sum + cargo.tonnage, 0);
    
    // Add vehicle masses
    used += shipDesign.vehicles.reduce((sum, vehicle) => sum + (vehicle.mass * vehicle.quantity), 0);
    
    // Add drone masses
    used += shipDesign.drones.reduce((sum, drone) => sum + (drone.mass * drone.quantity), 0);

    // Add fuel tank mass with antimatter consideration
    const jumpDrive = shipDesign.engines.find(e => e.engine_type === 'jump_drive');
    const maneuverDrive = shipDesign.engines.find(e => e.engine_type === 'maneuver_drive');
    const jumpPerformance = jumpDrive?.performance || 0;
    const maneuverPerformance = maneuverDrive?.performance || 0;
    const useAntimatter = activeRules.has('antimatter');
    const fuelMass = calculateTotalFuelMass(shipDesign.ship.tonnage, jumpPerformance, maneuverPerformance, shipDesign.ship.fuel_weeks, useAntimatter);
    used += fuelMass;

    // Add missile reload mass
    used += shipDesign.ship.missile_reloads;

    // Add sand reload mass
    used += shipDesign.ship.sand_reloads;

    return used;
  };

  const createTestShip = (tonnage: number, techLevel: string, jumpPerf: number, maneuverPerf: number, weeks: number): ShipDesign => ({
    ship: {
      name: 'Test Ship',
      tech_level: techLevel,
      tonnage,
      configuration: 'standard',
      fuel_weeks: weeks,
      missile_reloads: 0,
      sand_reloads: 0,
      description: 'Test ship for antimatter testing'
    },
    engines: [
      {
        engine_type: 'jump_drive',
        drive_code: 'A',
        performance: jumpPerf,
        mass: 10,
        cost: 10
      },
      {
        engine_type: 'maneuver_drive', 
        drive_code: 'A',
        performance: maneuverPerf,
        mass: 5,
        cost: 5
      },
      {
        engine_type: 'power_plant',
        drive_code: 'A', 
        performance: Math.max(jumpPerf, maneuverPerf),
        mass: 8,
        cost: 8
      }
    ],
    fittings: [{
      fitting_type: 'bridge',
      mass: 10,
      cost: 2
    }],
    weapons: [],
    defenses: [],
    berths: [{
      berth_type: 'staterooms',
      quantity: 2,
      mass: 8,
      cost: 1
    }],
    facilities: [],
    cargo: [],
    vehicles: [],
    drones: []
  });

  describe('Complete Ship Mass Calculations', () => {
    it('should calculate correct total mass without antimatter', () => {
      const ship = createTestShip(200, 'A', 1, 1, 2);
      const activeRules = new Set<string>(['spacecraft_design_srd']);
      
      const totalUsedMass = simulateAppMassCalculation(ship, activeRules);
      
      // Expected components:
      // Engines: 10 + 5 + 8 = 23 tons
      // Fittings: 10 tons (bridge)  
      // Berths: 16 tons (2 staterooms at 8 tons each)
      // Fuel: 22 tons (Jump-1: 20 tons + Maneuver-1: 2 tons for 2 weeks)
      // Total: 23 + 10 + 16 + 22 = 71 tons
      expect(totalUsedMass).toBe(71);
    });

    it('should calculate correct total mass with antimatter enabled', () => {
      const ship = createTestShip(200, 'H', 1, 1, 2); // TL H can use antimatter
      const activeRules = new Set<string>(['spacecraft_design_srd', 'antimatter']);
      
      const totalUsedMass = simulateAppMassCalculation(ship, activeRules);
      
      // Expected components:
      // Engines: 10 + 5 + 8 = 23 tons
      // Fittings: 10 tons (bridge)
      // Berths: 16 tons (2 staterooms at 8 tons each)  
      // Fuel with antimatter: 2.2 tons (10% of 22 tons)
      // Total: 23 + 10 + 16 + 2.2 = 51.2 tons
      expect(totalUsedMass).toBe(51.2);
    });

    it('should show significant mass savings with antimatter for high-performance ships', () => {
      const highPerfShip = createTestShip(1000, 'H', 4, 4, 4); // High-performance ship
      const rulesWithoutAntimatter = new Set<string>(['spacecraft_design_srd']);
      const rulesWithAntimatter = new Set<string>(['spacecraft_design_srd', 'antimatter']);
      
      const massWithoutAntimatter = simulateAppMassCalculation(highPerfShip, rulesWithoutAntimatter);
      const massWithAntimatter = simulateAppMassCalculation(highPerfShip, rulesWithAntimatter);
      
      const massSavings = massWithoutAntimatter - massWithAntimatter;
      
      // High-performance ship should have significant fuel mass
      // Jump-4 (400 tons) + Maneuver-4 (80 tons for 4 weeks) = 480 tons fuel normally
      // With antimatter: 48 tons fuel, saving 432 tons
      expect(massSavings).toBe(432);
    });

    it('should handle edge case of no drive performance with antimatter', () => {
      const noDriveShip = createTestShip(200, 'H', 0, 0, 2);
      const activeRules = new Set<string>(['spacecraft_design_srd', 'antimatter']);
      
      const totalUsedMass = simulateAppMassCalculation(noDriveShip, activeRules);
      
      // No fuel needed if no drives, antimatter shouldn't affect anything
      // Engines: 23 tons, Fittings: 10 tons, Berths: 16 tons, Fuel: 0 tons
      expect(totalUsedMass).toBe(49);
    });
  });

  describe('Realistic Ship Scenarios', () => {
    it('should correctly calculate Scout mass with and without antimatter', () => {
      // Scout: 100 tons, Jump-2, Maneuver-2, 2 weeks
      const scout = createTestShip(100, 'H', 2, 2, 2);
      
      const withoutAntimatter = simulateAppMassCalculation(scout, new Set(['spacecraft_design_srd']));
      const withAntimatter = simulateAppMassCalculation(scout, new Set(['spacecraft_design_srd', 'antimatter']));
      
      // Normal fuel: Jump-2 (20 tons) + Maneuver-2 (2 tons for 2 weeks) = 22 tons
      // Antimatter fuel: 2.2 tons
      // Mass difference should be 19.8 tons
      const fuelSavings = withoutAntimatter - withAntimatter;
      expect(fuelSavings).toBeCloseTo(19.8, 1);
    });

    it('should correctly calculate Free Trader mass with and without antimatter', () => {
      // Free Trader: 200 tons, Jump-1, Maneuver-1, 2 weeks  
      const trader = createTestShip(200, 'H', 1, 1, 2);
      
      const withoutAntimatter = simulateAppMassCalculation(trader, new Set(['spacecraft_design_srd']));
      const withAntimatter = simulateAppMassCalculation(trader, new Set(['spacecraft_design_srd', 'antimatter']));
      
      // Normal fuel: Jump-1 (20 tons) + Maneuver-1 (2 tons for 2 weeks) = 22 tons
      // Antimatter fuel: 2.2 tons
      // Mass difference should be 19.8 tons
      const fuelSavings = withoutAntimatter - withAntimatter;
      expect(fuelSavings).toBeCloseTo(19.8, 1);
    });

    it('should handle massive ships with extreme fuel requirements', () => {
      // Massive warship: 2000 tons, Jump-6, Maneuver-6, 6 weeks
      const warship = createTestShip(2000, 'H', 6, 6, 6);
      
      const withoutAntimatter = simulateAppMassCalculation(warship, new Set(['spacecraft_design_srd']));
      const withAntimatter = simulateAppMassCalculation(warship, new Set(['spacecraft_design_srd', 'antimatter']));
      
      // Normal fuel: Jump-6 (1200 tons) + Maneuver-6 (360 tons for 6 weeks) = 1560 tons
      // Antimatter fuel: 156 tons
      // Mass difference should be 1404 tons
      const fuelSavings = withoutAntimatter - withAntimatter;
      expect(fuelSavings).toBe(1404);
      
      // Verify the antimatter ship is much more viable
      expect(withAntimatter).toBeLessThan(withoutAntimatter);
    });
  });

  describe('Rule Integration Scenarios', () => {
    it('should properly handle multiple active rules including antimatter', () => {
      const ship = createTestShip(400, 'H', 2, 2, 3);
      const multipleRules = new Set(['spacecraft_design_srd', 'antimatter', 'longer_jumps']);
      
      const totalMass = simulateAppMassCalculation(ship, multipleRules);
      
      // Should still apply antimatter fuel reduction regardless of other rules
      expect(totalMass).toBeGreaterThan(0);
      
      // Compare with non-antimatter version
      const withoutAntimatter = simulateAppMassCalculation(ship, new Set(['spacecraft_design_srd', 'longer_jumps']));
      expect(totalMass).toBeLessThan(withoutAntimatter);
    });

    it('should not apply antimatter benefits when rule is not active', () => {
      const ship = createTestShip(200, 'H', 1, 1, 2);
      const rulesWithoutAntimatter = new Set(['spacecraft_design_srd', 'longer_jumps']);
      
      const totalMass = simulateAppMassCalculation(ship, rulesWithoutAntimatter);
      
      // Should calculate normal fuel mass even for TL H ship if antimatter rule is not active
      expect(totalMass).toBe(71); // Same as non-antimatter calculation
    });
  });

  describe('Mass Budget Impact Analysis', () => {
    it('should demonstrate how antimatter affects ship design viability', () => {
      // Test a ship that would be overweight without antimatter
      const tightBudgetShip = createTestShip(300, 'H', 3, 3, 4);
      
      const withoutAntimatter = simulateAppMassCalculation(tightBudgetShip, new Set(['spacecraft_design_srd']));
      const withAntimatter = simulateAppMassCalculation(tightBudgetShip, new Set(['spacecraft_design_srd', 'antimatter']));
      
      // Ship mass budget
      const totalTonnage = tightBudgetShip.ship.tonnage; // 300 tons
      
      const remainingWithoutAntimatter = totalTonnage - withoutAntimatter;
      const remainingWithAntimatter = totalTonnage - withAntimatter;
      
      // Antimatter should free up significant tonnage for other components
      const additionalTonnageFromAntimatter = remainingWithAntimatter - remainingWithoutAntimatter;
      
      // Should save significant tonnage
      expect(additionalTonnageFromAntimatter).toBeGreaterThan(95);
      expect(remainingWithAntimatter).toBeGreaterThan(remainingWithoutAntimatter);
    });

    it('should show percentage impact of antimatter on different ship sizes', () => {
      const testCases = [
        { tonnage: 100, jump: 2, maneuver: 2, weeks: 2 },
        { tonnage: 400, jump: 3, maneuver: 3, weeks: 3 },
        { tonnage: 1000, jump: 4, maneuver: 4, weeks: 4 },
        { tonnage: 2000, jump: 5, maneuver: 5, weeks: 5 }
      ];

      testCases.forEach(({ tonnage, jump, maneuver, weeks }) => {
        const ship = createTestShip(tonnage, 'H', jump, maneuver, weeks);
        
        const withoutAntimatter = simulateAppMassCalculation(ship, new Set(['spacecraft_design_srd']));
        const withAntimatter = simulateAppMassCalculation(ship, new Set(['spacecraft_design_srd', 'antimatter']));
        
        const massSavings = withoutAntimatter - withAntimatter;
        const savingsPercentage = massSavings / tonnage;
        
        // All ships should see significant mass savings as a percentage of total tonnage
        expect(savingsPercentage).toBeGreaterThan(0.1); // At least 10% savings
        expect(massSavings).toBeGreaterThan(0);
      });
    });
  });
});