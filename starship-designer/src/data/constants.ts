export const TECH_LEVELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export const HULL_SIZES = [
  { tonnage: 100, code: '1', cost: 2 },
  { tonnage: 200, code: '2', cost: 8 },
  { tonnage: 300, code: '3', cost: 12 },
  { tonnage: 400, code: '4', cost: 16 },
  { tonnage: 500, code: '5', cost: 32 },
  { tonnage: 600, code: '6', cost: 48 },
  { tonnage: 700, code: '7', cost: 64 },
  { tonnage: 800, code: '8', cost: 80 },
  { tonnage: 900, code: '9', cost: 90 },
  { tonnage: 1000, code: 'A', cost: 100 },
  { tonnage: 1200, code: 'C', cost: 120 },
  { tonnage: 1400, code: 'E', cost: 140 },
  { tonnage: 1600, code: 'G', cost: 160 },
  { tonnage: 1800, code: 'J', cost: 180 },
  { tonnage: 2000, code: 'L', cost: 200 }
];

export const ENGINE_DRIVES = {
  A: [
    { hullIndex: 0, performance: 4 },
    { hullIndex: 1, performance: 4 },
    { hullIndex: 2, performance: 2 },
    { hullIndex: 3, performance: 1 },
    { hullIndex: 4, performance: 1 }
  ],
  B: [
    { hullIndex: 0, performance: 6 },
    { hullIndex: 1, performance: 6 },
    { hullIndex: 2, performance: 3 },
    { hullIndex: 3, performance: 1 },
    { hullIndex: 4, performance: 1 },
    { hullIndex: 5, performance: 1 }
  ],
  C: [
    { hullIndex: 2, performance: 4 },
    { hullIndex: 3, performance: 2 },
    { hullIndex: 4, performance: 2 },
    { hullIndex: 5, performance: 1 },
    { hullIndex: 6, performance: 1 },
    { hullIndex: 7, performance: 1 },
    { hullIndex: 8, performance: 1 }
  ],
  D: [
    { hullIndex: 2, performance: 5 },
    { hullIndex: 3, performance: 3 },
    { hullIndex: 4, performance: 2 },
    { hullIndex: 5, performance: 2 },
    { hullIndex: 6, performance: 1 },
    { hullIndex: 7, performance: 1 },
    { hullIndex: 8, performance: 1 },
    { hullIndex: 9, performance: 1 },
    { hullIndex: 10, performance: 1 }
  ],
  E: [
    { hullIndex: 2, performance: 6 },
    { hullIndex: 3, performance: 4 },
    { hullIndex: 4, performance: 3 },
    { hullIndex: 5, performance: 2 },
    { hullIndex: 6, performance: 2 },
    { hullIndex: 7, performance: 1 },
    { hullIndex: 8, performance: 1 },
    { hullIndex: 9, performance: 1 },
    { hullIndex: 10, performance: 1 },
    { hullIndex: 11, performance: 1 },
    { hullIndex: 12, performance: 1 }
  ],
  F: [
    { hullIndex: 3, performance: 4 },
    { hullIndex: 4, performance: 3 },
    { hullIndex: 5, performance: 2 },
    { hullIndex: 6, performance: 2 },
    { hullIndex: 7, performance: 2 },
    { hullIndex: 8, performance: 2 },
    { hullIndex: 9, performance: 1 },
    { hullIndex: 10, performance: 1 },
    { hullIndex: 11, performance: 1 },
    { hullIndex: 12, performance: 1 },
    { hullIndex: 13, performance: 1 },
    { hullIndex: 14, performance: 1 }
  ],
  G: [
    { hullIndex: 3, performance: 5 },
    { hullIndex: 4, performance: 4 },
    { hullIndex: 5, performance: 3 },
    { hullIndex: 6, performance: 2 },
    { hullIndex: 7, performance: 2 },
    { hullIndex: 8, performance: 2 },
    { hullIndex: 9, performance: 2 },
    { hullIndex: 10, performance: 2 },
    { hullIndex: 11, performance: 1 },
    { hullIndex: 12, performance: 1 },
    { hullIndex: 13, performance: 1 },
    { hullIndex: 14, performance: 1 }
  ],
  H: [
    { hullIndex: 3, performance: 6 },
    { hullIndex: 4, performance: 4 },
    { hullIndex: 5, performance: 3 },
    { hullIndex: 6, performance: 3 },
    { hullIndex: 7, performance: 2 },
    { hullIndex: 8, performance: 2 },
    { hullIndex: 9, performance: 2 },
    { hullIndex: 10, performance: 2 },
    { hullIndex: 11, performance: 2 },
    { hullIndex: 12, performance: 2 },
    { hullIndex: 13, performance: 2 },
    { hullIndex: 14, performance: 1 }
  ],
  J: [
    { hullIndex: 4, performance: 5 },
    { hullIndex: 5, performance: 4 },
    { hullIndex: 6, performance: 3 },
    { hullIndex: 7, performance: 3 },
    { hullIndex: 8, performance: 3 },
    { hullIndex: 9, performance: 2 },
    { hullIndex: 10, performance: 2 },
    { hullIndex: 11, performance: 2 },
    { hullIndex: 12, performance: 2 },
    { hullIndex: 13, performance: 2 },
    { hullIndex: 14, performance: 2 }
  ],
  K: [
    { hullIndex: 4, performance: 5 },
    { hullIndex: 5, performance: 4 },
    { hullIndex: 6, performance: 3 },
    { hullIndex: 7, performance: 3 },
    { hullIndex: 8, performance: 3 },
    { hullIndex: 9, performance: 3 },
    { hullIndex: 10, performance: 3 },
    { hullIndex: 11, performance: 3 },
    { hullIndex: 12, performance: 2 },
    { hullIndex: 13, performance: 2 },
    { hullIndex: 14, performance: 2 }
  ],
  L: [
    { hullIndex: 4, performance: 6 },
    { hullIndex: 5, performance: 4 },
    { hullIndex: 6, performance: 4 },
    { hullIndex: 7, performance: 3 },
    { hullIndex: 8, performance: 3 },
    { hullIndex: 9, performance: 3 },
    { hullIndex: 10, performance: 3 },
    { hullIndex: 11, performance: 3 },
    { hullIndex: 12, performance: 3 },
    { hullIndex: 13, performance: 3 },
    { hullIndex: 14, performance: 2 }
  ],
  M: [
    { hullIndex: 4, performance: 6 },
    { hullIndex: 5, performance: 5 },
    { hullIndex: 6, performance: 4 },
    { hullIndex: 7, performance: 4 },
    { hullIndex: 8, performance: 4 },
    { hullIndex: 9, performance: 3 },
    { hullIndex: 10, performance: 3 },
    { hullIndex: 11, performance: 3 },
    { hullIndex: 12, performance: 3 },
    { hullIndex: 13, performance: 3 },
    { hullIndex: 14, performance: 3 }
  ],
  N: [
    { hullIndex: 5, performance: 5 },
    { hullIndex: 6, performance: 4 },
    { hullIndex: 7, performance: 4 },
    { hullIndex: 8, performance: 4 },
    { hullIndex: 9, performance: 4 },
    { hullIndex: 10, performance: 4 },
    { hullIndex: 11, performance: 3 },
    { hullIndex: 12, performance: 3 },
    { hullIndex: 13, performance: 3 },
    { hullIndex: 14, performance: 3 }
  ],
  P: [
    { hullIndex: 5, performance: 6 },
    { hullIndex: 6, performance: 5 },
    { hullIndex: 7, performance: 4 },
    { hullIndex: 8, performance: 4 },
    { hullIndex: 9, performance: 4 },
    { hullIndex: 10, performance: 4 },
    { hullIndex: 11, performance: 4 },
    { hullIndex: 12, performance: 4 },
    { hullIndex: 13, performance: 4 },
    { hullIndex: 14, performance: 3 }
  ],
  Q: [
    { hullIndex: 5, performance: 6 },
    { hullIndex: 6, performance: 5 },
    { hullIndex: 7, performance: 5 },
    { hullIndex: 8, performance: 5 },
    { hullIndex: 9, performance: 4 },
    { hullIndex: 10, performance: 4 },
    { hullIndex: 11, performance: 4 },
    { hullIndex: 12, performance: 4 },
    { hullIndex: 13, performance: 4 },
    { hullIndex: 14, performance: 4 }
  ],
  R: [
    { hullIndex: 5, performance: 6 },
    { hullIndex: 6, performance: 5 },
    { hullIndex: 7, performance: 5 },
    { hullIndex: 8, performance: 5 },
    { hullIndex: 9, performance: 5 },
    { hullIndex: 10, performance: 5 },
    { hullIndex: 11, performance: 5 },
    { hullIndex: 12, performance: 4 },
    { hullIndex: 13, performance: 4 },
    { hullIndex: 14, performance: 4 }
  ],
  S: [
    { hullIndex: 6, performance: 6 },
    { hullIndex: 7, performance: 5 },
    { hullIndex: 8, performance: 5 },
    { hullIndex: 9, performance: 5 },
    { hullIndex: 10, performance: 5 },
    { hullIndex: 11, performance: 5 },
    { hullIndex: 12, performance: 5 },
    { hullIndex: 13, performance: 5 },
    { hullIndex: 14, performance: 4 }
  ],
  T: [
    { hullIndex: 6, performance: 6 },
    { hullIndex: 7, performance: 6 },
    { hullIndex: 8, performance: 5 },
    { hullIndex: 9, performance: 5 },
    { hullIndex: 10, performance: 5 },
    { hullIndex: 11, performance: 5 },
    { hullIndex: 12, performance: 5 },
    { hullIndex: 13, performance: 5 },
    { hullIndex: 14, performance: 4 }
  ],
  U: [
    { hullIndex: 6, performance: 6 },
    { hullIndex: 7, performance: 6 },
    { hullIndex: 8, performance: 6 },
    { hullIndex: 9, performance: 5 },
    { hullIndex: 10, performance: 5 },
    { hullIndex: 11, performance: 5 },
    { hullIndex: 12, performance: 5 },
    { hullIndex: 13, performance: 5 },
    { hullIndex: 14, performance: 5 }
  ],
  V: [
    { hullIndex: 7, performance: 6 },
    { hullIndex: 8, performance: 6 },
    { hullIndex: 9, performance: 6 },
    { hullIndex: 10, performance: 5 },
    { hullIndex: 11, performance: 5 },
    { hullIndex: 12, performance: 5 },
    { hullIndex: 13, performance: 5 },
    { hullIndex: 14, performance: 5 }
  ],
  W: [
    { hullIndex: 7, performance: 6 },
    { hullIndex: 8, performance: 6 },
    { hullIndex: 9, performance: 6 },
    { hullIndex: 10, performance: 6 },
    { hullIndex: 11, performance: 6 },
    { hullIndex: 12, performance: 5 },
    { hullIndex: 13, performance: 5 },
    { hullIndex: 14, performance: 5 }
  ],
  X: [
    { hullIndex: 7, performance: 6 },
    { hullIndex: 8, performance: 6 },
    { hullIndex: 9, performance: 6 },
    { hullIndex: 10, performance: 6 },
    { hullIndex: 11, performance: 6 },
    { hullIndex: 12, performance: 5 },
    { hullIndex: 13, performance: 5 },
    { hullIndex: 14, performance: 5 }
  ],
  Y: [
    { hullIndex: 7, performance: 6 },
    { hullIndex: 8, performance: 6 },
    { hullIndex: 9, performance: 6 },
    { hullIndex: 10, performance: 6 },
    { hullIndex: 11, performance: 6 },
    { hullIndex: 12, performance: 6 },
    { hullIndex: 13, performance: 6 },
    { hullIndex: 14, performance: 5 }
  ]
};

export const ENGINE_SPECS = {
  A: { jump_drive: { tons: 10, cost: 10 }, maneuver_drive: { tons: 2, cost: 4 }, power_plant: { tons: 4, cost: 8 } },
  B: { jump_drive: { tons: 15, cost: 20 }, maneuver_drive: { tons: 3, cost: 8 }, power_plant: { tons: 7, cost: 16 } },
  C: { jump_drive: { tons: 20, cost: 30 }, maneuver_drive: { tons: 5, cost: 12 }, power_plant: { tons: 10, cost: 24 } },
  D: { jump_drive: { tons: 25, cost: 40 }, maneuver_drive: { tons: 7, cost: 16 }, power_plant: { tons: 13, cost: 32 } },
  E: { jump_drive: { tons: 30, cost: 50 }, maneuver_drive: { tons: 9, cost: 20 }, power_plant: { tons: 16, cost: 40 } },
  F: { jump_drive: { tons: 35, cost: 60 }, maneuver_drive: { tons: 11, cost: 24 }, power_plant: { tons: 19, cost: 48 } },
  G: { jump_drive: { tons: 40, cost: 70 }, maneuver_drive: { tons: 13, cost: 28 }, power_plant: { tons: 22, cost: 56 } },
  H: { jump_drive: { tons: 45, cost: 80 }, maneuver_drive: { tons: 15, cost: 32 }, power_plant: { tons: 25, cost: 64 } },
  J: { jump_drive: { tons: 50, cost: 90 }, maneuver_drive: { tons: 17, cost: 36 }, power_plant: { tons: 28, cost: 72 } },
  K: { jump_drive: { tons: 55, cost: 100 }, maneuver_drive: { tons: 19, cost: 40 }, power_plant: { tons: 31, cost: 80 } },
  L: { jump_drive: { tons: 60, cost: 110 }, maneuver_drive: { tons: 21, cost: 44 }, power_plant: { tons: 34, cost: 88 } },
  M: { jump_drive: { tons: 65, cost: 120 }, maneuver_drive: { tons: 23, cost: 48 }, power_plant: { tons: 37, cost: 96 } },
  N: { jump_drive: { tons: 70, cost: 130 }, maneuver_drive: { tons: 25, cost: 52 }, power_plant: { tons: 40, cost: 104 } },
  P: { jump_drive: { tons: 75, cost: 140 }, maneuver_drive: { tons: 27, cost: 56 }, power_plant: { tons: 43, cost: 112 } },
  Q: { jump_drive: { tons: 80, cost: 150 }, maneuver_drive: { tons: 29, cost: 60 }, power_plant: { tons: 46, cost: 120 } },
  R: { jump_drive: { tons: 85, cost: 160 }, maneuver_drive: { tons: 31, cost: 64 }, power_plant: { tons: 49, cost: 128 } },
  S: { jump_drive: { tons: 90, cost: 170 }, maneuver_drive: { tons: 33, cost: 68 }, power_plant: { tons: 52, cost: 136 } },
  T: { jump_drive: { tons: 95, cost: 180 }, maneuver_drive: { tons: 35, cost: 72 }, power_plant: { tons: 55, cost: 144 } },
  U: { jump_drive: { tons: 100, cost: 190 }, maneuver_drive: { tons: 37, cost: 76 }, power_plant: { tons: 58, cost: 152 } },
  V: { jump_drive: { tons: 105, cost: 200 }, maneuver_drive: { tons: 39, cost: 80 }, power_plant: { tons: 61, cost: 160 } },
  W: { jump_drive: { tons: 110, cost: 210 }, maneuver_drive: { tons: 41, cost: 84 }, power_plant: { tons: 64, cost: 168 } },
  X: { jump_drive: { tons: 115, cost: 220 }, maneuver_drive: { tons: 43, cost: 88 }, power_plant: { tons: 67, cost: 176 } },
  Y: { jump_drive: { tons: 120, cost: 230 }, maneuver_drive: { tons: 45, cost: 92 }, power_plant: { tons: 70, cost: 184 } }
};

export function getAvailableEngines(hullTonnage: number, engineType: string, powerPlantPerformance?: number) {
  const hullIndex = HULL_SIZES.findIndex(hull => hull.tonnage === hullTonnage);
  if (hullIndex === -1) return [];
  
  const availableEngines = [];
  for (const [driveCode, hullCompatibility] of Object.entries(ENGINE_DRIVES)) {
    const compatibility = hullCompatibility.find(h => h.hullIndex === hullIndex);
    if (compatibility) {
      // For Jump and Maneuver drives, check power plant requirement
      if ((engineType === 'jump_drive' || engineType === 'maneuver_drive') && powerPlantPerformance !== undefined) {
        if (compatibility.performance > powerPlantPerformance) {
          continue; // Skip this drive if it requires more power than available
        }
      }
      
      const performanceLabel = engineType === 'jump_drive' ? 'J' : 
                              engineType === 'maneuver_drive' ? 'M' : 'P';
      const specs = ENGINE_SPECS[driveCode as keyof typeof ENGINE_SPECS];
      const engineSpec = specs[engineType as keyof typeof specs];
      
      availableEngines.push({
        code: driveCode,
        performance: compatibility.performance,
        mass: engineSpec.tons,
        cost: engineSpec.cost,
        label: `Drive ${driveCode} (${performanceLabel}-${compatibility.performance}) - ${engineSpec.tons}t, ${engineSpec.cost}MCr`
      });
    }
  }
  return availableEngines;
}

export function calculateJumpFuel(shipTonnage: number, jumpPerformance: number): number {
  // Jump fuel: 0.1 * ship mass * jump rating per jump
  return shipTonnage * 0.1 * jumpPerformance;
}

export function calculateManeuverFuel(shipTonnage: number, maneuverPerformance: number, weeks: number): number {
  // Maneuver fuel: 0.01 * ship mass * maneuver rating * (weeks / 2)
  // Base is 2 weeks for M-1 at 1% of ship mass
  return shipTonnage * 0.01 * maneuverPerformance * (weeks / 2);
}

export function calculateTotalFuelMass(shipTonnage: number, jumpPerformance: number, maneuverPerformance: number, weeks: number): number {
  const jumpFuel = calculateJumpFuel(shipTonnage, jumpPerformance);
  const maneuverFuel = calculateManeuverFuel(shipTonnage, maneuverPerformance, weeks);
  return jumpFuel + maneuverFuel;
}

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
  { name: 'Sandcaster Turret', type: 'sandcaster_turret', mass: 1, cost: 1.3 },
  { name: 'Dual Sandcaster Turret', type: 'dual_sandcaster_turret', mass: 1, cost: 1.5 },
  { name: 'Triple Sandcaster Turret', type: 'triple_sandcaster_turret', mass: 1, cost: 1.8 },
  { name: 'Point Defense Laser Turret', type: 'point_defense_laser_turret', mass: 1, cost: 1 },
  { name: 'Dual Point Defense Laser Turret', type: 'dual_point_defense_laser_turret', mass: 1, cost: 1.5 }
];

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
  { name: 'Med Bay', type: 'med_bay', mass: 4, cost: 2 },
  { name: 'Surgical Ward', type: 'surgical_ward', mass: 8, cost: 8 },
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
  { name: 'Honey Badger 4 ton Off-Roader', type: 'honey_badger_off_roader', mass: 4, cost: 0.052436, techLevel: 12, serviceStaff: 1 },
  { name: 'All-Terrain Vehicle tracked', type: 'atv_tracked', mass: 10, cost: 0.195, techLevel: 12, serviceStaff: 1 },
  { name: 'All-Terrain Vehicle wheeled', type: 'atv_wheeled', mass: 10, cost: 0.23, techLevel: 12, serviceStaff: 1 },
  { name: 'Air/Raft Truck', type: 'air_raft_truck', mass: 5, cost: 0.55, techLevel: 12, serviceStaff: 1 },
  { name: 'Open Top Air/Raft', type: 'open_top_air_raft', mass: 4, cost: 0.045, techLevel: 8, serviceStaff: 1 },
  { name: 'Fire Scorpion 65 ton Quad Walker', type: 'fire_scorpion_walker', mass: 65, cost: 18, techLevel: 10, serviceStaff: 3 },
  { name: 'Socrates Field Car', type: 'socrates_field_car', mass: 5, cost: 0.143, techLevel: 9, serviceStaff: 1 },
  { name: '6 ton UFO Floating Home', type: 'ufo_floating_home', mass: 6, cost: 0.05, techLevel: 8, serviceStaff: 1 },
  { name: 'Sealed Air/Raft (4 ton)', type: 'sealed_air_raft_4t', mass: 4, cost: 0.09, techLevel: 12, serviceStaff: 1 },
  { name: 'Iderati Pattern Armored Fighting Vehicle', type: 'iderati_afv', mass: 10, cost: 0.6, techLevel: 12, serviceStaff: 1 },
  { name: '22 ton AAT Infantry Support Vehicle', type: 'aat_infantry_support', mass: 22, cost: 2, techLevel: 14, serviceStaff: 1 },
  { name: 'Sealed Air/Raft (3 ton)', type: 'sealed_air_raft_3t', mass: 3, cost: 0.07, techLevel: 12, serviceStaff: 1 },
  { name: 'Pug 4x4 4 ton Armored Car', type: 'pug_armored_car', mass: 4, cost: 0.025, techLevel: 6, serviceStaff: 1 },
  { name: '1.5 ton Custom Exploration G/Bike', type: 'exploration_gbike', mass: 1.5, cost: 0.08, techLevel: 10, serviceStaff: 1 },
  { name: 'Awesome AWS-8Q 80 ton Walker', type: 'awesome_walker', mass: 80, cost: 22, techLevel: 10, serviceStaff: 4 },
  { name: 'Socrates Field Car (Variant)', type: 'socrates_field_car_variant', mass: 5, cost: 0.168, techLevel: 9, serviceStaff: 1 },
  { name: 'Armored Fighting Vehicle', type: 'armored_fighting_vehicle', mass: 10, cost: 0.198, techLevel: 12, serviceStaff: 1 },
  { name: 'Centurion Security Robot', type: 'centurion_security_robot', mass: 0.5, cost: 0.12, techLevel: 12, serviceStaff: 1 },
  { name: '0.5 ton Robodog Assault Bot', type: 'robodog_assault_bot', mass: 0.5, cost: 0.012, techLevel: 8, serviceStaff: 0.25 },
  { name: 'Fury Helicopter Gunship (Refit)', type: 'fury_helicopter_gunship', mass: 8, cost: 1.2, techLevel: 8, serviceStaff: 1 },
  { name: 'ATLAS Combat Droid 1.0 ton', type: 'atlas_combat_droid', mass: 1, cost: 0.024, techLevel: 8, serviceStaff: 0.5 }
];

export const DRONE_TYPES = [
  { name: 'War', type: 'war', mass: 10, cost: 2 },
  { name: 'Repair', type: 'repair', mass: 10, cost: 1 },
  { name: 'Rescue', type: 'rescue', mass: 10, cost: 0.5 },
  { name: 'Sensor', type: 'sensor', mass: 1, cost: 1 },
  { name: 'Comms', type: 'comms', mass: 0.1, cost: 0.2 }
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

export const COMMS_SENSORS_TYPES = [
  { name: 'Standard', type: 'standard', mass: 0, cost: 0 },
  { name: 'Basic Civilian', type: 'basic_civilian', mass: 1, cost: 0.05 },
  { name: 'Basic Military', type: 'basic_military', mass: 2, cost: 1 },
  { name: 'Advanced', type: 'advanced', mass: 3, cost: 2 },
  { name: 'Very Advanced', type: 'very_advanced', mass: 5, cost: 4 }
];

export function getWeaponMountLimit(shipTonnage: number): number {
  return Math.floor(shipTonnage / 100);
}

export function convertTechLevelToNumber(techLevel: string): number {
  // Convert A=10, B=11, C=12, etc.
  if (techLevel.length === 1 && techLevel >= 'A' && techLevel <= 'Z') {
    return techLevel.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
  }
  return parseInt(techLevel) || 0;
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
      if (vehicleType.serviceStaff === 0.25) {
        // Robodog: 0.25 per unit, rounded up per 4 units (1-4=1, 5-8=2, etc)
        totalServiceStaff += Math.ceil((vehicle.quantity * vehicleType.serviceStaff));
      } else if (vehicleType.serviceStaff === 0.5) {
        // ATLAS: 0.5 per unit, rounded up per 2 units (1-2=1, 3-4=2, etc)  
        totalServiceStaff += Math.ceil((vehicle.quantity * vehicleType.serviceStaff));
      } else {
        // Standard vehicles: 1 staff per unit (or 3/4 for walkers)
        totalServiceStaff += vehicle.quantity * vehicleType.serviceStaff;
      }
    }
  }
  
  return totalServiceStaff;
}

export function calculateMedicalStaff(facilities: { facility_type: string; quantity: number }[]): { nurses: number; surgeons: number; techs: number } {
  let nurses = 0;
  let surgeons = 0;
  let techs = 0;
  
  for (const facility of facilities) {
    if (facility.facility_type === 'med_bay') {
      nurses += facility.quantity;
    } else if (facility.facility_type === 'surgical_ward') {
      surgeons += facility.quantity;
      techs += facility.quantity;
      nurses += facility.quantity;
    }
  }
  
  return { nurses, surgeons, techs };
}