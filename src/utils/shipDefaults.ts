import type { ShipDesign, Ship, CustomCrew } from '../types/ship';
import { getNumberOfSections } from '../data/constants';

export const createEmptyCustomCrew = (): CustomCrew => ({
  pilot: 0,
  navigator: 0,
  engineers: 0,
  gunners: 0,
  service: 0,
  stewards: 0,
  nurses: 0,
  surgeons: 0,
  techs: 0,
  infantry: 0,
  armor: 0,
  mp: 0,
  security: 0
});

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
    custom_items: [],
    custom_crew: createEmptyCustomCrew()
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
