// Core ship types for React Native version
export interface Ship {
  name: string;
  tech_level: string;
  tonnage: number;
  configuration: 'standard' | 'streamlined' | 'distributed' | 'planetoid' | 'buffered_planetoid' | 'sphere' | 'close_structure';
  fuel_weeks: number;
  missile_reloads: number;
  sand_reloads: number;
  description?: string;
}

export interface Engine {
  engine_type: 'power_plant' | 'jump_drive' | 'maneuver_drive';
  drive_code?: string;
  performance: number;
  mass: number;
  cost: number;
}

export interface Fitting {
  fitting_type: 'bridge' | 'half_bridge' | 'launch_tube' | 'comms_sensors';
  comms_sensors_type?: 'standard' | 'improved' | 'advanced' | 'superior';
  launch_vehicle_mass?: number;
  mass: number;
  cost: number;
}

export interface Weapon {
  weapon_name: string;
  quantity: number;
  mass: number;
  cost: number;
}

export interface Defense {
  defense_type: 'sandcaster_turret' | 'dual_sandcaster_turret' | 'triple_sandcaster_turret' | 'point_defense_laser_turret' | 'dual_point_defense_laser_turret';
  quantity: number;
  mass: number;
  cost: number;
}

export interface Berth {
  berth_type: 'staterooms' | 'luxury_staterooms' | 'low_berths' | 'emergency_low_berth';
  quantity: number;
  mass: number;
  cost: number;
}

export interface Facility {
  facility_type: string;
  quantity: number;
  mass: number;
  cost: number;
}

export interface Cargo {
  cargo_type: string;
  tonnage: number;
  cost: number;
}

export interface Vehicle {
  vehicle_type: string;
  quantity: number;
  mass: number;
  cost: number;
}

export interface Drone {
  drone_type: string;
  quantity: number;
  mass: number;
  cost: number;
}

export interface ShipDesign {
  ship: Ship;
  engines: Engine[];
  fittings: Fitting[];
  weapons: Weapon[];
  defenses: Defense[];
  berths: Berth[];
  facilities: Facility[];
  cargo: Cargo[];
  vehicles: Vehicle[];
  drones: Drone[];
}

export interface MassCalculation {
  total: number;
  used: number;
  remaining: number;
  isOverweight: boolean;
}

export interface CostCalculation {
  total: number;
}

export interface StaffRequirements {
  pilot: number;
  navigator: number;
  engineers: number;
  gunners: number;
  service: number;
  stewards: number;
  nurses: number;
  surgeons: number;
  techs: number;
  total: number;
}