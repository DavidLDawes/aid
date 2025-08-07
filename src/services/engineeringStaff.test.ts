import { describe, it, expect } from '@jest/globals';

// Mock ship design structure
interface Engine {
  engine_type: 'power_plant' | 'jump_drive' | 'maneuver_drive';
  mass: number;
  cost: number;
  performance: number;
  drive_code?: string;
}


// Engineering staff calculation function (extracted from App.tsx logic)
function calculateEngineers(engines: Engine[], shipTonnage: number): number {
  let engineers = 0;
  
  if (shipTonnage === 100) {
    engineers = 1;
  } else if (shipTonnage === 200 || shipTonnage === 300) {
    engineers = 2;
  } else if (shipTonnage >= 400) {
    // At least one engineer per engine
    const engineCount = engines.length;
    engineers = Math.max(engineCount, 1);
    
    // Additional engineers for engines larger than 100 tons
    for (const engine of engines) {
      if (engine.mass > 100) {
        engineers += Math.ceil(engine.mass / 100) - 1; // -1 because we already counted 1 engineer per engine
      }
    }
  } else {
    // For other ship sizes, use original logic as fallback
    const totalEnginesWeight = engines.reduce((sum, engine) => sum + engine.mass, 0);
    engineers = Math.ceil(totalEnginesWeight / 100);
  }
  
  return engineers;
}

describe('Engineering Staff Calculations', () => {
  describe('400+ ton ships with multiple normal engines', () => {
    it('should require 3 engineers for 3 normal engines (all under 100 tons)', () => {
      const engines: Engine[] = [
        { engine_type: 'power_plant', mass: 50, cost: 10, performance: 2 },
        { engine_type: 'jump_drive', mass: 75, cost: 15, performance: 1 },
        { engine_type: 'maneuver_drive', mass: 60, cost: 8, performance: 3 }
      ];
      const shipTonnage = 400;
      
      const result = calculateEngineers(engines, shipTonnage);
      expect(result).toBe(3); // 1 engineer per engine, none over 100 tons
    });
    
    it('should require 2 engineers for 2 normal engines and no maneuver engine', () => {
      const engines: Engine[] = [
        { engine_type: 'power_plant', mass: 80, cost: 16, performance: 4 },
        { engine_type: 'jump_drive', mass: 90, cost: 18, performance: 2 }
        // No maneuver drive (M-0 performance)
      ];
      const shipTonnage = 500;
      
      const result = calculateEngineers(engines, shipTonnage);
      expect(result).toBe(2); // 1 engineer per engine, none over 100 tons
    });
  });
  
  describe('Large ships with large engines', () => {
    it('should require 4 engineers for largest ship with largest engines including Jump engine over 100 tons', () => {
      const engines: Engine[] = [
        { engine_type: 'power_plant', mass: 80, cost: 16, performance: 4 },   // 80 tons = 1 engineer (base only)
        { engine_type: 'jump_drive', mass: 120, cost: 24, performance: 3 },   // 120 tons = 2 engineers (1 base + 1 additional)  
        { engine_type: 'maneuver_drive', mass: 60, cost: 12, performance: 2 } // 60 tons = 1 engineer (base only)
      ];
      const shipTonnage = 1000; // Large ship
      
      const result = calculateEngineers(engines, shipTonnage);
      // Power Plant: 1 base (under 100 tons) = 1 engineer
      // Jump Drive: 1 base + Math.ceil(120/100) - 1 = 1 + 2 - 1 = 2 engineers  
      // Maneuver Drive: 1 base (under 100 tons) = 1 engineer
      // Total: 1 + 2 + 1 = 4 engineers
      expect(result).toBe(4);
    });
  });
  
  describe('Special tonnage rules', () => {
    it('should require 1 engineer for 100 ton ships regardless of engines', () => {
      const engines: Engine[] = [
        { engine_type: 'power_plant', mass: 20, cost: 4, performance: 1 },
        { engine_type: 'jump_drive', mass: 30, cost: 6, performance: 1 },
        { engine_type: 'maneuver_drive', mass: 25, cost: 5, performance: 1 }
      ];
      const shipTonnage = 100;
      
      const result = calculateEngineers(engines, shipTonnage);
      expect(result).toBe(1); // Fixed 1 engineer for 100 ton ships
    });
    
    it('should require 2 engineers for 200 ton ships regardless of engines', () => {
      const engines: Engine[] = [
        { engine_type: 'power_plant', mass: 40, cost: 8, performance: 2 },
        { engine_type: 'jump_drive', mass: 60, cost: 12, performance: 2 }
      ];
      const shipTonnage = 200;
      
      const result = calculateEngineers(engines, shipTonnage);
      expect(result).toBe(2); // Fixed 2 engineers for 200 ton ships
    });
    
    it('should require 2 engineers for 300 ton ships regardless of engines', () => {
      const engines: Engine[] = [
        { engine_type: 'power_plant', mass: 60, cost: 12, performance: 3 },
        { engine_type: 'jump_drive', mass: 90, cost: 18, performance: 3 },
        { engine_type: 'maneuver_drive', mass: 50, cost: 10, performance: 3 }
      ];
      const shipTonnage = 300;
      
      const result = calculateEngineers(engines, shipTonnage);
      expect(result).toBe(2); // Fixed 2 engineers for 300 ton ships
    });
  });
  
  describe('Edge cases', () => {
    it('should require at least 1 engineer for 400+ ton ships even with no engines', () => {
      const engines: Engine[] = [];
      const shipTonnage = 500;
      
      const result = calculateEngineers(engines, shipTonnage);
      expect(result).toBe(1); // Minimum 1 engineer for 400+ ton ships
    });
    
    it('should handle engines exactly at 100 tons boundary', () => {
      const engines: Engine[] = [
        { engine_type: 'power_plant', mass: 100, cost: 20, performance: 4 }, // Exactly 100 tons = 1 engineer
        { engine_type: 'jump_drive', mass: 101, cost: 20, performance: 2 }   // 101 tons = 2 engineers
      ];
      const shipTonnage = 600;
      
      const result = calculateEngineers(engines, shipTonnage);
      // Power Plant: 1 base (exactly 100 tons, no additional)
      // Jump Drive: 1 base + Math.ceil(101/100) - 1 = 1 + 2 - 1 = 2 engineers
      // Total: 1 + 2 = 3 engineers
      expect(result).toBe(3);
    });
  });
});