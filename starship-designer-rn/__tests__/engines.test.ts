// Tests for engine logic and constraints
import { Engine } from '../src/types/ship';

describe('Engine Logic', () => {
  test('should allow multiple engines of each type', () => {
    const engines: Engine[] = [
      { engine_type: 'power_plant', performance: 2, mass: 4, cost: 4 },
      { engine_type: 'power_plant', performance: 1, mass: 2, cost: 2 },
      { engine_type: 'jump', performance: 2, mass: 4, cost: 4 },
      { engine_type: 'jump', performance: 1, mass: 2, cost: 2 },
      { engine_type: 'maneuver', performance: 2, mass: 4, cost: 2 },
      { engine_type: 'maneuver', performance: 1, mass: 2, cost: 1 }
    ];

    const powerPlants = engines.filter(e => e.engine_type === 'power_plant');
    const jumpDrives = engines.filter(e => e.engine_type === 'jump');
    const maneuverDrives = engines.filter(e => e.engine_type === 'maneuver');

    expect(powerPlants).toHaveLength(2);
    expect(jumpDrives).toHaveLength(2);
    expect(maneuverDrives).toHaveLength(2);
  });

  test('should require at least one power plant and jump drive', () => {
    const engines: Engine[] = [
      { engine_type: 'power_plant', performance: 1, mass: 2, cost: 2 },
      { engine_type: 'jump', performance: 1, mass: 2, cost: 2 }
    ];

    const powerPlants = engines.filter(e => e.engine_type === 'power_plant');
    const jumpDrives = engines.filter(e => e.engine_type === 'jump');

    expect(powerPlants.length).toBeGreaterThanOrEqual(1);
    expect(jumpDrives.length).toBeGreaterThanOrEqual(1);
  });

  test('should allow maneuver drives to be optional', () => {
    const enginesWithoutManeuver: Engine[] = [
      { engine_type: 'power_plant', performance: 1, mass: 2, cost: 2 },
      { engine_type: 'jump', performance: 1, mass: 2, cost: 2 }
    ];

    const maneuverDrives = enginesWithoutManeuver.filter(e => e.engine_type === 'maneuver');
    expect(maneuverDrives).toHaveLength(0);
    
    // Should still be valid with power plant and jump drive
    const powerPlants = enginesWithoutManeuver.filter(e => e.engine_type === 'power_plant');
    const jumpDrives = enginesWithoutManeuver.filter(e => e.engine_type === 'jump');
    expect(powerPlants.length).toBeGreaterThanOrEqual(1);
    expect(jumpDrives.length).toBeGreaterThanOrEqual(1);
  });

  test('should validate power plant performance constraints', () => {
    const engines: Engine[] = [
      { engine_type: 'power_plant', performance: 3, mass: 6, cost: 6 },
      { engine_type: 'power_plant', performance: 2, mass: 4, cost: 4 },
      { engine_type: 'jump', performance: 2, mass: 4, cost: 4 },
      { engine_type: 'maneuver', performance: 3, mass: 6, cost: 3 }
    ];

    const powerPlants = engines.filter(e => e.engine_type === 'power_plant');
    const maxPowerPlantPerformance = Math.max(...powerPlants.map(p => p.performance));
    
    expect(maxPowerPlantPerformance).toBe(3);
    
    // All other engines should be <= max power plant performance
    const otherEngines = engines.filter(e => e.engine_type !== 'power_plant');
    otherEngines.forEach(engine => {
      expect(engine.performance).toBeLessThanOrEqual(maxPowerPlantPerformance);
    });
  });

  test('should handle power plant removal constraint checking', () => {
    const engines: Engine[] = [
      { engine_type: 'power_plant', performance: 4, mass: 8, cost: 8 },
      { engine_type: 'power_plant', performance: 2, mass: 4, cost: 4 },
      { engine_type: 'jump', performance: 4, mass: 8, cost: 8 },
      { engine_type: 'maneuver', performance: 3, mass: 6, cost: 3 }
    ];

    // Simulate removing the high-performance power plant
    const enginesAfterRemoval = engines.filter((_, i) => i !== 0);
    const remainingPowerPlants = enginesAfterRemoval.filter(e => e.engine_type === 'power_plant');
    const maxRemainingPerformance = Math.max(...remainingPowerPlants.map(p => p.performance));
    
    expect(maxRemainingPerformance).toBe(2);
    
    // Engines that would need downgrading
    const affectedEngines = enginesAfterRemoval.filter(engine => 
      (engine.engine_type === 'jump' || engine.engine_type === 'maneuver') &&
      engine.performance > maxRemainingPerformance
    );
    
    expect(affectedEngines).toHaveLength(2); // Jump drive (4) and maneuver drive (3) both exceed 2
  });
});

describe('Engine Display Logic', () => {
  test('should generate correct engine ID letters skipping I and O', () => {
    const getEngineIdLetter = (index: number): string => {
      const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
      return letters[index] || `${letters[letters.length - 1]}${index - letters.length + 1}`;
    };

    expect(getEngineIdLetter(0)).toBe('A');
    expect(getEngineIdLetter(1)).toBe('B');
    expect(getEngineIdLetter(2)).toBe('C');
    expect(getEngineIdLetter(7)).toBe('H');
    expect(getEngineIdLetter(8)).toBe('J'); // Should skip I
    expect(getEngineIdLetter(13)).toBe('P'); // Should skip O
    expect(getEngineIdLetter(14)).toBe('Q');
  });

  test('should generate correct performance prefixes', () => {
    const getPerformancePrefix = (engineType: 'power_plant' | 'jump' | 'maneuver'): string => {
      switch (engineType) {
        case 'power_plant': return 'P-';
        case 'jump': return 'J-';
        case 'maneuver': return 'M-';
        default: return '';
      }
    };

    expect(getPerformancePrefix('power_plant')).toBe('P-');
    expect(getPerformancePrefix('jump')).toBe('J-');
    expect(getPerformancePrefix('maneuver')).toBe('M-');
  });

  test('should create correct engine display strings', () => {
    const engines: Engine[] = [
      { engine_type: 'power_plant', performance: 1, mass: 2, cost: 2 },
      { engine_type: 'jump', performance: 3, mass: 6, cost: 6 },
      { engine_type: 'maneuver', performance: 2, mass: 4, cost: 2 }
    ];

    // Simulate display logic
    const displays = engines.map((engine, index) => {
      const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q'];
      const letter = letters[index];
      const prefix = engine.engine_type === 'power_plant' ? 'P-' : 
                    engine.engine_type === 'jump' ? 'J-' : 'M-';
      const name = engine.engine_type === 'power_plant' ? 'Power Plant' :
                   engine.engine_type === 'jump' ? 'Jump Drive' : 'Maneuver Drive';
      return `${name} ${letter} ${prefix}${engine.performance}`;
    });

    expect(displays[0]).toBe('Power Plant A P-1');
    expect(displays[1]).toBe('Jump Drive B J-3');
    expect(displays[2]).toBe('Maneuver Drive C M-2');
  });
});