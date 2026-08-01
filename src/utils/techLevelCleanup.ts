import type { Vehicle, Weapon, Defense } from '../types/ship';
import {
  getAvailableVehicles, getAvailableBayWeapons, getMaxScreens, BAY_WEAPON_TYPES
} from '../data/constants';

const SCREEN_TYPES = ['nuclear_damper', 'meson_screen', 'black_globe'] as const;
type ScreenType = typeof SCREEN_TYPES[number];

// VehiclesPanel only ever offers vehicles compatible with the current tech
// level, but a vehicle selected before a tech-level drop stays in the design
// — invisible in the panel (so it can't be edited or removed there) yet
// still silently counted in mass/cost/service-staff. Drop it.
export function cleanupVehiclesForTechLevel(vehicles: Vehicle[], techLevel: string): Vehicle[] {
  const availableTypes = new Set(getAvailableVehicles(techLevel).map(v => v.type));
  return vehicles.filter(v => availableTypes.has(v.vehicle_type));
}

// Same ghost-selection problem for bay weapons (WeaponsPanel only offers
// bay weapons compatible with the current tech level).
export function cleanupBayWeaponsForTechLevel(weapons: Weapon[], techLevel: string): Weapon[] {
  const bayWeaponNames = new Set(BAY_WEAPON_TYPES.map(b => b.name));
  const availableBayNames = new Set(getAvailableBayWeapons(techLevel).map(b => b.name));
  return weapons.filter(w => !bayWeaponNames.has(w.weapon_name) || availableBayNames.has(w.weapon_name));
}

// Same problem for defensive screens, except the tech-level cap is a
// quantity ceiling (getMaxScreens) rather than an on/off switch — clamp
// down to the new ceiling instead of always dropping to zero.
export function cleanupScreensForTechLevel(defenses: Defense[], techLevel: string): Defense[] {
  return defenses
    .map(defense => {
      if (!SCREEN_TYPES.includes(defense.defense_type as ScreenType)) return defense;
      const max = getMaxScreens(defense.defense_type as ScreenType, techLevel);
      return { ...defense, quantity: Math.min(defense.quantity, max) };
    })
    .filter(defense => defense.quantity > 0);
}
