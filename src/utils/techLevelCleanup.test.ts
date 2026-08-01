import { describe, it, expect } from '@jest/globals';
import {
  cleanupVehiclesForTechLevel, cleanupBayWeaponsForTechLevel, cleanupScreensForTechLevel
} from './techLevelCleanup';
import type { Vehicle, Weapon, Defense } from '../types/ship';

describe('cleanupVehiclesForTechLevel', () => {
  it('drops a vehicle that requires a higher tech level than the new one', () => {
    // Pug Armored Car (TL 6) is available at any megastructure TL (min TL-A = 10);
    // AAT Infantry Support Vehicle (TL 14 = TL-E) is not.
    const vehicles: Vehicle[] = [
      { vehicle_type: 'pug_armored_car', quantity: 2, mass: 4, cost: 0.025 },
      { vehicle_type: 'aat_infantry_support', quantity: 1, mass: 22, cost: 2 },
    ];
    const result = cleanupVehiclesForTechLevel(vehicles, 'A');
    expect(result.some(v => v.vehicle_type === 'aat_infantry_support')).toBe(false);
    expect(result.some(v => v.vehicle_type === 'pug_armored_car')).toBe(true);
  });

  it('keeps everything when tech level is high enough for all', () => {
    const vehicles: Vehicle[] = [
      { vehicle_type: 'aat_infantry_support', quantity: 1, mass: 22, cost: 2 },
    ];
    const result = cleanupVehiclesForTechLevel(vehicles, 'H');
    expect(result).toEqual(vehicles);
  });
});

describe('cleanupBayWeaponsForTechLevel', () => {
  it('drops a bay weapon that requires a higher tech level, leaves turret weapons alone', () => {
    const weapons: Weapon[] = [
      { weapon_name: 'Meson Gun Bay', mass: 50, cost: 50, quantity: 1 }, // minTechLevel B
      { weapon_name: 'Missile Bank', mass: 50, cost: 12, quantity: 2 },  // no minTechLevel
      { weapon_name: 'Beam Laser Turret', mass: 1, cost: 1, quantity: 3 }, // not a bay weapon at all
    ];
    const result = cleanupBayWeaponsForTechLevel(weapons, 'A');
    expect(result.some(w => w.weapon_name === 'Meson Gun Bay')).toBe(false);
    expect(result.some(w => w.weapon_name === 'Missile Bank')).toBe(true);
    expect(result.some(w => w.weapon_name === 'Beam Laser Turret')).toBe(true);
  });
});

describe('cleanupScreensForTechLevel', () => {
  it('clamps a screen quantity down to the new tech level ceiling', () => {
    const defenses: Defense[] = [
      { defense_type: 'nuclear_damper', mass: 100, cost: 50, quantity: 4 },
    ];
    // TL-12 (index for nuclear_damper) allows only 1 nuclear damper
    const result = cleanupScreensForTechLevel(defenses, 'C'); // TL-C = 12
    const damper = result.find(d => d.defense_type === 'nuclear_damper');
    expect(damper?.quantity).toBe(1);
  });

  it('drops a screen entirely when the tech level no longer permits any', () => {
    const defenses: Defense[] = [
      { defense_type: 'nuclear_damper', mass: 100, cost: 50, quantity: 2 },
    ];
    const result = cleanupScreensForTechLevel(defenses, 'A'); // below TL-12, 0 allowed
    expect(result.some(d => d.defense_type === 'nuclear_damper')).toBe(false);
  });

  it('leaves non-screen defenses (turrets) untouched', () => {
    const defenses: Defense[] = [
      { defense_type: 'sandcaster_turret', mass: 1, cost: 1.3, quantity: 5 },
    ];
    const result = cleanupScreensForTechLevel(defenses, 'A');
    expect(result).toEqual(defenses);
  });
});
