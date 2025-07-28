export const TECH_LEVELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export const WEAPON_TYPES = [
  { name: 'Pulse Laser Turret', mass: 2, cost: 1.5 },
  { name: 'Dual Pulse Laser Turret', mass: 2, cost: 2 },
  { name: 'Triple Pulse Laser Turret', mass: 2, cost: 2.5 },
  { name: 'Beam Laser Turret', mass: 2, cost: 2 },
  { name: 'Dual Beam Laser Turret', mass: 2, cost: 3 },
  { name: 'Triple Beam Laser Turret', mass: 2, cost: 4 },
  { name: 'Plasma Beam Barbette', mass: 10, cost: 6 },
  { name: 'Dual Plasma Beam Barbette', mass: 10, cost: 7 },
  { name: 'Fusion Gun Barbette', mass: 10, cost: 10 },
  { name: 'Dual Fusion Gun Barbette', mass: 10, cost: 16 },
  { name: 'Particle Beam Barbette', mass: 10, cost: 14 },
  { name: 'Missile Launcher Turret', mass: 1, cost: 1.8 },
  { name: 'Dual Missile Launcher Turret', mass: 1, cost: 2.5 },
  { name: 'Triple Missile Launcher Turret', mass: 1, cost: 3.3 },
  { name: 'Hard Point', mass: 1, cost: 1 }
];

export const DEFENSE_TYPES = [
  { name: 'Point Defense Laser Turret', type: 'point_defense_laser', mass: 1, cost: 1 },
  { name: 'Sand Caster Turret', type: 'sand_caster_single', mass: 1, cost: 1.3 },
  { name: 'Dual Sand Caster Turret', type: 'sand_caster_dual', mass: 1, cost: 1.5 },
  { name: 'Triple Sand Caster Turret', type: 'sand_caster_triple', mass: 1, cost: 1.8 }
];

export const BERTH_TYPES = [
  { name: 'Crew Berths', type: 'crew_berths', mass: 4, cost: 0.5 },
  { name: 'Crew Double Bunks', type: 'crew_double_bunks', mass: 4.5, cost: 0.6 },
  { name: 'Crew Luxury Berths', type: 'crew_luxury_berths', mass: 5, cost: 0.6 },
  { name: 'Crew Luxury Double Bunks', type: 'crew_luxury_double_bunks', mass: 5.5, cost: 0.7 },
  { name: 'Staterooms', type: 'staterooms', mass: 4, cost: 0.5 },
  { name: 'Luxury Staterooms', type: 'luxury_staterooms', mass: 5, cost: 0.6 },
  { name: 'Low Berths', type: 'low_berths', mass: 0.5, cost: 0.05 },
  { name: 'Emergency Low Berth', type: 'emergency_low_berth', mass: 1, cost: 0.1 }
];

export const FACILITY_TYPES = [
  { name: 'Gym', type: 'gym', mass: 3, cost: 0.1 },
  { name: 'Spa', type: 'spa', mass: 1.5, cost: 0.2 },
  { name: 'Garden', type: 'garden', mass: 4, cost: 0.05 },
  { name: 'Commissary', type: 'commissary', mass: 2, cost: 0.2, required: true },
  { name: 'Kitchens', type: 'kitchens', mass: 3, cost: 0.4 },
  { name: 'Officers Mess & Bar', type: 'officers_mess_bar', mass: 4, cost: 0.3 },
  { name: 'Medical Bay', type: 'medical_bay', mass: 4, cost: 2 },
  { name: 'Surgical Bay', type: 'surgical_bay', mass: 5, cost: 8 },
  { name: 'Medical Garden', type: 'medical_garden', mass: 4, cost: 1 },
  { name: 'Library', type: 'library', mass: 1, cost: 0.1 },
  { name: 'Range', type: 'range', mass: 2, cost: 2 },
  { name: 'Club', type: 'club', mass: 3, cost: 0.1 },
  { name: 'Park', type: 'park', mass: 6, cost: 1 },
  { name: 'Shrine', type: 'shrine', mass: 1, cost: 1 }
];

export const VEHICLE_TYPES = [
  { name: 'Cargo Shuttle', type: 'cargo_shuttle', mass: 110, cost: 8 },
  { name: 'Shuttle', type: 'shuttle', mass: 110, cost: 10 },
  { name: 'Ships Boat', type: 'ships_boat', mass: 46, cost: 6 },
  { name: 'Light Fighter', type: 'light_fighter', mass: 27, cost: 24 },
  { name: 'Medium Fighter', type: 'medium_fighter', mass: 64, cost: 38 },
  { name: 'ECM Medium Fighter', type: 'ecm_medium_fighter', mass: 64, cost: 48 },
  { name: 'Heavy Fighter', type: 'heavy_fighter', mass: 110, cost: 64 }
];

export const DRONE_TYPES = [
  { name: 'War', type: 'war', mass: 10, cost: 2 },
  { name: 'Repair', type: 'repair', mass: 10, cost: 1 },
  { name: 'Rescue', type: 'rescue', mass: 10, cost: 0.5 },
  { name: 'Sensor', type: 'sensor', mass: 1, cost: 1 },
  { name: 'Comms', type: 'comms', mass: 0.1, cost: 0.2 }
];

export const CARGO_TYPES = [
  { name: 'Supply Bay', type: 'supply_bay', costPerTon: 0, flatCost: 0.5 },
  { name: 'Cargo Bay', type: 'cargo_bay', costPerTon: 0, flatCost: 0 },
  { name: 'Cold Storage', type: 'cold_storage', costPerTon: 0.01, flatCost: 0 },
  { name: 'Dry Goods', type: 'dry_goods', costPerTon: 0, flatCost: 0 },
  { name: 'Secure Storage', type: 'secure_storage', costPerTon: 0, flatCost: 2 },
  { name: 'Data Storage', type: 'data_storage', costPerTon: 1, flatCost: 0 }
];

export function getBridgeMassAndCost(shipTonnage: number, isHalfBridge: boolean) {
  let bridgeMass: number;
  
  if (shipTonnage <= 200) {
    bridgeMass = 10;
  } else if (shipTonnage <= 1000) {
    bridgeMass = 20;
  } else if (shipTonnage <= 2000) {
    bridgeMass = 40;
  } else {
    bridgeMass = 60;
  }
  
  if (isHalfBridge) {
    bridgeMass = bridgeMass / 2;
    return { mass: bridgeMass, cost: bridgeMass * 1.5 };
  }
  
  return { mass: bridgeMass, cost: bridgeMass * 0.5 };
}

export function getWeaponMountLimit(shipTonnage: number): number {
  return Math.floor(shipTonnage / 100);
}