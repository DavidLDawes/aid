export interface Ship {
  id?: number;
  name: string;
  tech_level: string;
  tonnage: number;
  configuration: 'standard' | 'streamlined' | 'distributed';
  fuel_weeks: number;
  missile_reloads: number;
  sand_reloads: number;
  armor_percentage?: number;
  spinal_weapon?: string; // Name of the spinal weapon (e.g., "Particle Spinal Mount A")
  sections?: number; // Number of sections for capital ships (2-6 based on hull code)
  description?: string;
}

export interface Engine {
  id?: number;
  engine_type: 'power_plant' | 'maneuver_drive' | 'jump_drive';
  drive_code: string;
  performance: number;
  mass: number;
  cost: number;
}

export interface Fitting {
  id?: number;
  fitting_type: 'bridge' | 'half_bridge' | 'launch_tube' | 'comms_sensors' | 'computer';
  mass: number;
  cost: number;
  launch_vehicle_mass?: number;
  comms_sensors_type?: 'standard' | 'basic_civilian' | 'basic_military' | 'advanced' | 'very_advanced';
  computer_model?: 'core_3' | 'core_4' | 'core_5' | 'core_6' | 'core_7' | 'core_8' | 'core_9';
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
  defense_type: 'sandcaster_turret' | 'dual_sandcaster_turret' | 'triple_sandcaster_turret' | 'point_defense_laser_turret' | 'dual_point_defense_laser_turret';
  mass: number;
  cost: number;
  quantity: number;
}

export interface Berth {
  id?: number;
  berth_type: 'staterooms' | 'luxury_staterooms' | 'low_berths' | 'emergency_low_berths';
  quantity: number;
  mass: number;
  cost: number;
}

export interface Facility {
  id?: number;
  facility_type: 'gym' | 'spa' | 'garden' | 'commissary' | 'kitchens' | 'officers_mess_bar' | 'first_aid_station' | 'autodoc' | 'med_bay' | 'surgical_ward' | 'medical_bay' | 'surgical_bay' | 'medical_garden' | 'library' | 'range' | 'club' | 'park' | 'shrine';
  quantity: number;
  mass: number;
  cost: number;
}

export interface Cargo {
  id?: number;
  cargo_type: 'cargo_bay' | 'spares' | 'cold_storage_bay' | 'data_storage_bay' | 'secure_storage_bay' | 'vacuum_bay' | 'livestock_bay' | 'live_plant_bay';
  tonnage: number;
  cost: number;
}

export interface Vehicle {
  id?: number;
  vehicle_type: 'honey_badger_off_roader' | 'atv_tracked' | 'atv_wheeled' | 'air_raft_truck' | 'open_top_air_raft' | 'fire_scorpion_walker' | 'socrates_field_car' | 'ufo_floating_home' | 'sealed_air_raft_4t' | 'iderati_afv' | 'aat_infantry_support' | 'sealed_air_raft_3t' | 'pug_armored_car' | 'exploration_gbike' | 'awesome_walker' | 'socrates_field_car_variant' | 'armored_fighting_vehicle' | 'centurion_security_robot' | 'robodog_assault_bot' | 'fury_helicopter_gunship' | 'atlas_combat_droid';
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
  service: number;
  stewards: number;
  nurses: number;
  surgeons: number;
  techs: number;
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
