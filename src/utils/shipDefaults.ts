import type { ShipDesign, Ship } from '../types/ship';

/**
 * Creates an empty ShipDesign object with all required fields initialized.
 * Use this to ensure consistency when creating new ship designs.
 *
 * @param shipInfo - Basic ship information (name, tech_level, tonnage, etc.)
 * @returns A complete ShipDesign object with empty component arrays
 */
export const createEmptyShipDesign = (shipInfo: Ship): ShipDesign => {
  return {
    ship: shipInfo,
    engines: [],
    fittings: [
      {
        fitting_type: 'comms_sensors',
        comms_sensors_type: 'standard',
        mass: 0,
        cost: 0
      }
    ],
    weapons: [],
    defenses: [],
    berths: [],
    facilities: [],
    cargo: [],
    vehicles: [],
    drones: [],
    custom_items: []
  };
};

/**
 * Creates a minimal Ship object with default values.
 *
 * @param name - Ship name
 * @param techLevel - Tech level (default: 'A')
 * @param tonnage - Ship tonnage (default: 5000)
 * @param configuration - Hull configuration (default: 'standard')
 * @returns A Ship object with all required fields
 */
export const createDefaultShip = (
  name: string,
  techLevel: string = 'A',
  tonnage: number = 5000,
  configuration: 'standard' | 'streamlined' | 'distributed' = 'standard'
): Ship => {
  return {
    name,
    tech_level: techLevel,
    tonnage,
    configuration,
    fuel_weeks: 2,
    missile_reloads: 0,
    sand_reloads: 0,
    sections: tonnage >= 3000 ? 2 : undefined,
    description: ''
  };
};
