import type { ShipDesign, Ship } from '../types/ship';
import { getNumberOfSections } from '../data/constants';

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
    sections: getNumberOfSections(tonnage) ?? undefined,
    description: ''
  };
};
