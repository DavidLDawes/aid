// Core constants and calculations for Starship Designer React Native

export const TECH_LEVELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export const HULL_SIZES = [
  { tonnage: 100, code: 'A', cost: 2 },
  { tonnage: 200, code: 'B', cost: 8 },
  { tonnage: 300, code: 'C', cost: 12 },
  { tonnage: 400, code: 'D', cost: 16 },
  { tonnage: 500, code: 'E', cost: 32 },
  { tonnage: 600, code: 'F', cost: 48 },
  { tonnage: 700, code: 'G', cost: 64 },
  { tonnage: 800, code: 'H', cost: 80 },
  { tonnage: 900, code: 'J', cost: 90 },
  { tonnage: 1000, code: 'K', cost: 100 },
  { tonnage: 1200, code: 'L', cost: 120 },
  { tonnage: 1400, code: 'M', cost: 140 },
  { tonnage: 1600, code: 'N', cost: 160 },
  { tonnage: 1800, code: 'P', cost: 180 },
  { tonnage: 2000, code: 'Q', cost: 200 }
];

export const WEAPON_TYPES = [
  { name: 'Hard Point', mass: 1, cost: 1 },
  { name: 'Single Turret', mass: 1, cost: 0.5 },
  { name: 'Double Turret', mass: 1, cost: 1 },
  { name: 'Triple Turret', mass: 1, cost: 2 },
  { name: 'Beam Laser', mass: 1, cost: 1 },
  { name: 'Pulse Laser', mass: 1, cost: 2 },
  { name: 'Particle Beam', mass: 1, cost: 4 },
  { name: 'Fusion Gun', mass: 1, cost: 8 },
  { name: 'Meson Gun', mass: 5, cost: 50 },
  { name: 'Missile Rack', mass: 0.5, cost: 0.75 },
  { name: 'Torpedo Tube', mass: 1, cost: 1.5 }
];

export const DEFENSE_TYPES = [
  { name: 'Sandcaster Turret', type: 'sandcaster_turret', mass: 1, cost: 1.3 },
  { name: 'Dual Sandcaster Turret', type: 'dual_sandcaster_turret', mass: 1, cost: 1.5 },
  { name: 'Triple Sandcaster Turret', type: 'triple_sandcaster_turret', mass: 1, cost: 1.8 },
  { name: 'Point Defense Laser Turret', type: 'point_defense_laser_turret', mass: 1, cost: 1 },
  { name: 'Dual Point Defense Laser Turret', type: 'dual_point_defense_laser_turret', mass: 1, cost: 1.5 }
];

// Mount limit calculation - weapons and defenses share turret mounts
export function getWeaponMountLimit(shipTonnage: number): number {
  return Math.floor(shipTonnage / 100);
}

// Engine performance table - maps engine ID to performance by ship tonnage
export const ENGINE_PERFORMANCE_TABLE: Record<string, Record<number, number | null>> = {
  'A': { 100: 2, 200: 1, 300: null, 400: null, 500: null, 600: null, 700: null, 800: null, 900: null, 1000: null, 1200: null, 1400: null, 1600: null, 1800: null, 2000: null },
  'B': { 100: 4, 200: 2, 300: 1, 400: 1, 500: null, 600: null, 700: null, 800: null, 900: null, 1000: null, 1200: null, 1400: null, 1600: null, 1800: null, 2000: null },
  'C': { 100: 6, 200: 3, 300: 2, 400: 1, 500: 1, 600: 1, 700: null, 800: null, 900: null, 1000: null, 1200: null, 1400: null, 1600: null, 1800: null, 2000: null },
  'D': { 100: null, 200: 4, 300: 2, 400: 2, 500: 1, 600: 1, 700: 1, 800: 1, 900: null, 1000: null, 1200: null, 1400: null, 1600: null, 1800: null, 2000: null },
  'E': { 100: null, 200: 5, 300: 3, 400: 2, 500: 2, 600: 1, 700: 1, 800: 1, 900: 1, 1000: 1, 1200: null, 1400: null, 1600: null, 1800: null, 2000: null },
  'F': { 100: null, 200: 6, 300: 4, 400: 3, 500: 2, 600: 2, 700: 1, 800: 1, 900: 1, 1000: 1, 1200: 1, 1400: null, 1600: null, 1800: null, 2000: null },
  'G': { 100: null, 200: null, 300: 4, 400: 3, 500: 2, 600: 2, 700: 2, 800: 2, 900: 1, 1000: 1, 1200: 1, 1400: 1, 1600: null, 1800: null, 2000: null },
  'H': { 100: null, 200: null, 300: 5, 400: 4, 500: 3, 600: 2, 700: 2, 800: 2, 900: 2, 1000: 2, 1200: 1, 1400: 1, 1600: 1, 1800: null, 2000: null },
  'J': { 100: null, 200: null, 300: 6, 400: 4, 500: 3, 600: 3, 700: 2, 800: 2, 900: 2, 1000: 2, 1200: 2, 1400: 1, 1600: 1, 1800: 1, 2000: null },
  'K': { 100: null, 200: null, 300: null, 400: 5, 500: 4, 600: 3, 700: 3, 800: 3, 900: 2, 1000: 2, 1200: 2, 1400: 2, 1600: 1, 1800: 1, 2000: 1 },
  'L': { 100: null, 200: null, 300: null, 400: 5, 500: 4, 600: 3, 700: 3, 800: 3, 900: 3, 1000: 3, 1200: 2, 1400: 2, 1600: 2, 1800: 1, 2000: 1 },
  'M': { 100: null, 200: null, 300: null, 400: 6, 500: 4, 600: 4, 700: 3, 800: 3, 900: 3, 1000: 3, 1200: 3, 1400: 2, 1600: 2, 1800: 2, 2000: 1 },
  'N': { 100: null, 200: null, 300: null, 400: 6, 500: 5, 600: 4, 700: 4, 800: 4, 900: 3, 1000: 3, 1200: 3, 1400: 3, 1600: 2, 1800: 2, 2000: 2 },
  'P': { 100: null, 200: null, 300: null, 400: null, 500: 5, 600: 4, 700: 4, 800: 4, 900: 4, 1000: 4, 1200: 3, 1400: 3, 1600: 3, 1800: 2, 2000: 2 },
  'Q': { 100: null, 200: null, 300: null, 400: null, 500: 6, 600: 5, 700: 4, 800: 4, 900: 4, 1000: 4, 1200: 4, 1400: 3, 1600: 3, 1800: 3, 2000: 2 },
  'R': { 100: null, 200: null, 300: null, 400: null, 500: 6, 600: 5, 700: 5, 800: 5, 900: 4, 1000: 4, 1200: 4, 1400: 4, 1600: 3, 1800: 3, 2000: 3 },
  'S': { 100: null, 200: null, 300: null, 400: null, 500: 6, 600: 5, 700: 5, 800: 5, 900: 5, 1000: 5, 1200: 4, 1400: 4, 1600: 4, 1800: 3, 2000: 3 },
  'T': { 100: null, 200: null, 300: null, 400: null, 500: null, 600: 6, 700: 5, 800: 5, 900: 5, 1000: 5, 1200: 5, 1400: 4, 1600: 4, 1800: 4, 2000: 3 },
  'U': { 100: null, 200: null, 300: null, 400: null, 500: null, 600: 6, 700: 6, 800: 5, 900: 5, 1000: 5, 1200: 5, 1400: 4, 1600: 4, 1800: 4, 2000: 4 },
  'V': { 100: null, 200: null, 300: null, 400: null, 500: null, 600: 6, 700: 6, 800: 6, 900: 5, 1000: 5, 1200: 5, 1400: 5, 1600: 4, 1800: 4, 2000: 4 },
  'W': { 100: null, 200: null, 300: null, 400: null, 500: null, 600: null, 700: 6, 800: 6, 900: 6, 1000: 5, 1200: 5, 1400: 5, 1600: 4, 1800: 4, 2000: 4 },
  'X': { 100: null, 200: null, 300: null, 400: null, 500: null, 600: null, 700: 6, 800: 6, 900: 6, 1000: 6, 1200: 5, 1400: 5, 1600: 5, 1800: 4, 2000: 4 },
  'Y': { 100: null, 200: null, 300: null, 400: null, 500: null, 600: null, 700: 6, 800: 6, 900: 6, 1000: 6, 1200: 5, 1400: 5, 1600: 5, 1800: 4, 2000: 4 },
  'Z': { 100: null, 200: null, 300: null, 400: null, 500: null, 600: null, 700: 6, 800: 6, 900: 6, 1000: 6, 1200: 6, 1400: 5, 1600: 5, 1800: 5, 2000: 4 }
};

// Get available engine IDs for a given ship tonnage
export function getAvailableEngineIds(shipTonnage: number): string[] {
  const availableIds: string[] = [];
  for (const [engineId, performances] of Object.entries(ENGINE_PERFORMANCE_TABLE)) {
    if (performances[shipTonnage] !== null) {
      availableIds.push(engineId);
    }
  }
  return availableIds;
}

// Get engine performance for a specific engine ID and ship tonnage
export function getEnginePerformance(engineId: string, shipTonnage: number): number | null {
  return ENGINE_PERFORMANCE_TABLE[engineId]?.[shipTonnage] ?? null;
}



export const BERTH_TYPES = [
  { name: 'Staterooms', type: 'staterooms', mass: 4, cost: 0.5, required: true },
  { name: 'Luxury Staterooms', type: 'luxury_staterooms', mass: 5, cost: 0.6, required: false },
  { name: 'Low Berths', type: 'low_berths', mass: 0.5, cost: 0.05, required: false },
  { name: 'Emergency Low', type: 'emergency_low_berth', mass: 1, cost: 1, required: false }
];

export const FACILITY_TYPES = [
  { name: 'Gym', type: 'gym', mass: 3, cost: 0.1 },
  { name: 'Spa', type: 'spa', mass: 1.5, cost: 0.2 },
  { name: 'Garden', type: 'garden', mass: 4, cost: 0.05 },
  { name: 'Commissary', type: 'commissary', mass: 2, cost: 0.2, required: true },
  { name: 'Kitchens', type: 'kitchens', mass: 3, cost: 0.4 },
  { name: 'Officers Mess & Bar', type: 'officers_mess_bar', mass: 4, cost: 0.3 },
  { name: 'First Aid Station', type: 'first_aid_station', mass: 0.5, cost: 0.1 },
  { name: 'Autodoc', type: 'autodoc', mass: 1.5, cost: 0.05 },
  { name: 'Medical Bay', type: 'medical_bay', mass: 4, cost: 2 },
  { name: 'Surgical Bay', type: 'surgical_bay', mass: 5, cost: 8 },
  { name: 'Medical Garden', type: 'medical_garden', mass: 4, cost: 1 },
  { name: 'Library', type: 'library', mass: 1, cost: 0.1 },
  { name: 'Range', type: 'range', mass: 2, cost: 2 },
  { name: 'Club', type: 'club', mass: 3, cost: 0.1 },
  { name: 'Park', type: 'park', mass: 6, cost: 1 }
];

export const CARGO_TYPES = [
  { name: 'Cargo Bay', type: 'cargo_bay', costPerTon: 0 },
  { name: 'Spares', type: 'spares', costPerTon: 0.5 },
  { name: 'Cold Storage Bay', type: 'cold_storage_bay', costPerTon: 0.2 },
  { name: 'Data Storage Bay', type: 'data_storage_bay', costPerTon: 0.3 },
  { name: 'Secure Storage Bay', type: 'secure_storage_bay', costPerTon: 0.7 },
  { name: 'Vacuum Bay', type: 'vacuum_bay', costPerTon: 0.2 },
  { name: 'Livestock Bay', type: 'livestock_bay', costPerTon: 2 },
  { name: 'Live Plant Bay', type: 'live_plant_bay', costPerTon: 1 }
];

export const VEHICLE_TYPES = [
  { name: 'Honey Badger Off-Roader', type: 'honey_badger_off_roader', mass: 4, cost: 0.052436, techLevel: 12, serviceStaff: 1 },
  { name: 'All-Terrain Vehicle tracked', type: 'atv_tracked', mass: 10, cost: 0.195, techLevel: 12, serviceStaff: 1 },
  { name: 'All-Terrain Vehicle wheeled', type: 'atv_wheeled', mass: 10, cost: 0.23, techLevel: 12, serviceStaff: 1 },
  { name: 'Air/Raft Truck', type: 'air_raft_truck', mass: 5, cost: 0.55, techLevel: 12, serviceStaff: 1 },
  { name: 'Open Top Air/Raft', type: 'open_top_air_raft', mass: 4, cost: 0.045, techLevel: 8, serviceStaff: 1 }
];

export const DRONE_TYPES = [
  { name: 'War', type: 'war', mass: 10, cost: 2 },
  { name: 'Repair', type: 'repair', mass: 10, cost: 1 },
  { name: 'Rescue', type: 'rescue', mass: 10, cost: 0.5 },
  { name: 'Sensor', type: 'sensor', mass: 1, cost: 1 },
  { name: 'Comms', type: 'comms', mass: 0.1, cost: 0.2 },
  { name: 'Centurion Security Robot', type: 'centurion_security_robot', mass: 0.5, cost: 0.12 },
  { name: 'Robodog Assault Bot', type: 'robodog_assault_bot', mass: 0.5, cost: 0.012 },
  { name: 'ATLAS Combat Droid', type: 'atlas_combat_droid', mass: 1, cost: 0.024 }
];

export const COMMS_SENSORS_TYPES = [
  { name: 'Standard', type: 'standard', mass: 0, cost: 0 },
  { name: 'Improved', type: 'improved', mass: 1, cost: 2 },
  { name: 'Advanced', type: 'advanced', mass: 2, cost: 3 },
  { name: 'Superior', type: 'superior', mass: 3, cost: 4 }
];

// Calculation functions
export function calculateJumpFuel(shipTonnage: number, jumpPerformance: number): number {
  return shipTonnage * jumpPerformance * 0.1;
}

export function calculateManeuverFuel(shipTonnage: number, maneuverPerformance: number, weeks: number): number {
  return (shipTonnage * maneuverPerformance * 0.01) * weeks;
}

export function calculateTotalFuelMass(shipTonnage: number, jumpPerformance: number, maneuverPerformance: number, weeks: number): number {
  const jumpFuel = calculateJumpFuel(shipTonnage, jumpPerformance);
  const maneuverFuel = calculateManeuverFuel(shipTonnage, maneuverPerformance, weeks);
  return jumpFuel + maneuverFuel;
}

export function getBridgeMassAndCost(shipTonnage: number, isHalfBridge: boolean) {
  let mass: number;
  let cost: number;

  if (shipTonnage <= 200) {
    mass = isHalfBridge ? 10 : 20;
    cost = isHalfBridge ? 0.25 : 0.5;
  } else if (shipTonnage <= 1000) {
    mass = isHalfBridge ? 10 : 20;
    cost = isHalfBridge ? 0.5 : 1;
  } else {
    mass = isHalfBridge ? 20 : 40;
    cost = isHalfBridge ? 1 : 2;
  }

  return { mass, cost };
}

export function convertTechLevelToNumber(techLevel: string): number {
  const techLevelMap: { [key: string]: number } = {
    'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15, 'G': 16, 'H': 17
  };
  return techLevelMap[techLevel] || 10;
}

export function getAvailableVehicles(shipTechLevel: string): typeof VEHICLE_TYPES {
  const shipTL = convertTechLevelToNumber(shipTechLevel);
  return VEHICLE_TYPES.filter(vehicle => vehicle.techLevel <= shipTL);
}

export function calculateVehicleServiceStaff(vehicles: { vehicle_type: string; quantity: number }[]): number {
  let totalServiceStaff = 0;
  
  for (const vehicle of vehicles) {
    const vehicleType = VEHICLE_TYPES.find(vt => vt.type === vehicle.vehicle_type);
    if (vehicleType) {
      totalServiceStaff += vehicle.quantity * vehicleType.serviceStaff;
    }
  }
  
  return totalServiceStaff;
}

export function calculateDroneServiceStaff(drones: { drone_type: string; quantity: number }[]): number {
  let heavyDroneTonnage = 0; // 10 ton drones
  let lightDroneTonnage = 0; // less than 10 ton drones
  
  for (const drone of drones) {
    const droneType = DRONE_TYPES.find(dt => dt.type === drone.drone_type);
    if (droneType) {
      const droneTonnage = droneType.mass * drone.quantity;
      if (droneType.mass >= 10) {
        heavyDroneTonnage += droneTonnage;
      } else {
        lightDroneTonnage += droneTonnage;
      }
    }
  }
  
  // Heavy drones (10+ tons): 1 staff per 100 tons
  const heavyDroneStaff = Math.ceil(heavyDroneTonnage / 100);
  
  // Light drones (<10 tons): 1 staff per 20 tons
  const lightDroneStaff = Math.ceil(lightDroneTonnage / 20);
  
  return heavyDroneStaff + lightDroneStaff;
}

export function calculateMedicalStaff(facilities: { facility_type: string; quantity: number }[]): { nurses: number; surgeons: number; techs: number } {
  let nurses = 0;
  let surgeons = 0;
  let techs = 0;

  for (const facility of facilities) {
    switch (facility.facility_type) {
      case 'first_aid_station':
        // First aid stations don't require staff
        break;
      case 'autodoc':
        techs += facility.quantity;
        break;
      case 'medical_bay':
        nurses += facility.quantity;
        break;
      case 'surgical_bay':
        surgeons += facility.quantity;
        nurses += facility.quantity; // Surgical bays also need nurses
        break;
      case 'medical_garden':
        // Medical gardens don't require dedicated staff
        break;
    }
  }

  return { nurses, surgeons, techs };
}