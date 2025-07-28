export interface Ship {
  id?: number;
  name: string;
  tech_level: string;
  tonnage: number;
  description?: string;
}

export interface Engine {
  id?: number;
  engine_type: 'power_plant' | 'maneuver_drive' | 'jump_drive';
  performance: number;
  mass: number;
  cost: number;
}

export interface Fitting {
  id?: number;
  fitting_type: 'bridge' | 'half_bridge' | 'launch_tube';
  mass: number;
  cost: number;
  launch_vehicle_mass?: number;
}

export interface Weapon {
  id?: number;
  weapon_name: string;
  mass: number;
  cost: number;
  quantity: number;
}

export interface Defense {
  id?: number;
  defense_type: 'armor' | 'point_defense_laser' | 'sand_caster_single' | 'sand_caster_dual' | 'sand_caster_triple' | 'reflec';
  mass: number;
  cost: number;
  quantity: number;
}

export interface Berth {
  id?: number;
  berth_type: 'crew_berths' | 'crew_double_bunks' | 'crew_luxury_berths' | 'crew_luxury_double_bunks' | 'staterooms' | 'luxury_staterooms' | 'low_berths' | 'emergency_low_berth';
  quantity: number;
  mass: number;
  cost: number;
}

export interface Facility {
  id?: number;
  facility_type: 'gym' | 'spa' | 'garden' | 'commissary' | 'kitchens' | 'officers_mess_bar' | 'medical_bay' | 'surgical_bay' | 'medical_garden' | 'library' | 'range' | 'club' | 'park' | 'shrine';
  quantity: number;
  mass: number;
  cost: number;
}

export interface Cargo {
  id?: number;
  cargo_type: 'supply_bay' | 'cargo_bay' | 'cold_storage' | 'dry_goods' | 'secure_storage' | 'data_storage';
  tonnage: number;
  cost: number;
}

export interface Vehicle {
  id?: number;
  vehicle_type: 'cargo_shuttle' | 'shuttle' | 'ships_boat' | 'light_fighter' | 'medium_fighter' | 'ecm_medium_fighter' | 'heavy_fighter';
  quantity: number;
  mass: number;
  cost: number;
}

export interface Drone {
  id?: number;
  drone_type: 'war' | 'repair' | 'rescue' | 'sensor' | 'comms';
  quantity: number;
  mass: number;
  cost: number;
}

export interface StaffRequirements {
  pilot: number;
  navigator: number;
  engineers: number;
  gunners: number;
  stewards: number;
  total: number;
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