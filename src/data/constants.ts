import type { Cargo, CustomCrew } from '../types/ship';

// Crew categories shown on the Custom panel's crew-tracking section, in
// display order - the same positions shown on the Staff panel, plus four
// (infantry/armor/mp/security) that only exist as custom-crew entries.
export const CUSTOM_CREW_CATEGORIES: { key: keyof CustomCrew; label: string }[] = [
  { key: 'pilot', label: 'Pilot' },
  { key: 'navigator', label: 'Navigator' },
  { key: 'engineers', label: 'Engineers' },
  { key: 'gunners', label: 'Gunners' },
  { key: 'service', label: 'Service' },
  { key: 'stewards', label: 'Stewards' },
  { key: 'nurses', label: 'Nurses' },
  { key: 'surgeons', label: 'Surgeons' },
  { key: 'techs', label: 'Techs' },
  { key: 'infantry', label: 'Infantry' },
  { key: 'armor', label: 'Armor' },
  { key: 'mp', label: 'MP' },
  { key: 'security', label: 'Security' },
];

// TL letters skip 'I' (visual confusion with the digit 1), matching the
// Traveller convention: ...H=17, I skipped, J=18, K=19...
export const TECH_LEVELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J'];

export function getTechLevelIndex(techLevel: string): number {
  return TECH_LEVELS.indexOf(techLevel);
}

export function isTechLevelAtLeast(currentLevel: string, requiredLevel: string): boolean {
  const currentIndex = getTechLevelIndex(currentLevel);
  const requiredIndex = getTechLevelIndex(requiredLevel);

  // If either tech level is invalid, return false
  if (currentIndex === -1 || requiredIndex === -1) {
    return false;
  }

  return currentIndex >= requiredIndex;
}

// Maximum power plant performance by tech level. Megastructures have no
// jump drive, so power plant tiers are gated directly by TL: TL-H unlocks
// the P-10 an Antimatter Plant requires, TL-J extends further to P-12.
export function getMaxPowerPlantByTechLevel(techLevel: string): number {
  if (isTechLevelAtLeast(techLevel, 'J')) return 12;
  if (isTechLevelAtLeast(techLevel, 'H')) return 10;
  if (isTechLevelAtLeast(techLevel, 'G')) return 8;
  if (isTechLevelAtLeast(techLevel, 'F')) return 7;
  return 6;
}

// Robotics (TL-F+, toggled via the Rules menu): robot workers assist each
// engineer, letting them cover more of an engine's own crew requirement as
// tech level improves. Divisor to apply (rounded up) to each engine's crew:
// TL-F=1/2, TL-G=1/4, TL-H=1/6, TL-J=1/8. Below TL-F, no reduction (1).
export function getRoboticsCrewDivisor(techLevel: string): number {
  if (isTechLevelAtLeast(techLevel, 'J')) return 8;
  if (isTechLevelAtLeast(techLevel, 'H')) return 6;
  if (isTechLevelAtLeast(techLevel, 'G')) return 4;
  if (isTechLevelAtLeast(techLevel, 'F')) return 2;
  return 1;
}

// Robotics also automates gunnery support, one tier behind the engineering
// reduction above (starts at TL-G, not TL-F): divisor to apply (rounded up)
// to the ship's total gunner requirement. TL-G=1/2, TL-H=1/3, TL-J=1/4.
// Below TL-G, no reduction (1).
export function getRoboticsGunnerDivisor(techLevel: string): number {
  if (isTechLevelAtLeast(techLevel, 'J')) return 4;
  if (isTechLevelAtLeast(techLevel, 'H')) return 3;
  if (isTechLevelAtLeast(techLevel, 'G')) return 2;
  return 1;
}

// Engine performance percentages as a function of ship displacement.
// Levels 1-6 are from the Traveller SRD. Megastructures have no jump drive,
// so power plant levels 7-12 extend the same +1.0%/step progression from
// levels 7-10, gated by tech level (see getMaxPowerPlantByTechLevel) so
// megastructures can reach the P-10 an Antimatter Plant requires, up to P-12
// at TL-J.
export const ENGINE_PERFORMANCE_PERCENTAGES = {
  power_plant: {
    1: 1.5,
    2: 2.0,
    3: 2.5,
    4: 3.0,
    5: 4.0,
    6: 5.0,
    7: 6.0,
    8: 7.0,
    9: 8.0,
    10: 9.0,
    11: 10.0,
    12: 11.0
  },
  maneuver_drive: {
    1: 1.0,
    2: 1.25,
    3: 1.5,
    4: 1.75,
    5: 2.5,
    6: 3.25,
    7: 4.0,
    8: 4.75,
    9: 5.5,
    10: 6.25
  }
};

// Cost per ton for each engine type (in MCr per ton)
export const ENGINE_COST_PER_TON = {
  power_plant: 2.0,
  maneuver_drive: 2.0
};

// Fractional (sub-1-gee) maneuver drives, megastructure branch only. Mass and
// cost are each a percentage of the M-1 drive's mass/cost - not a straight
// percentage of ship tonnage - and the two percentages diverge (e.g. M-.5 is
// 40% of M-1's tons but only 33% of M-1's cost), so these can't be folded
// into ENGINE_PERFORMANCE_PERCENTAGES/ENGINE_COST_PER_TON's uniform
// percentage-of-tonnage/cost-per-ton model.
export const FRACTIONAL_MANEUVER_DRIVE_LEVELS: {
  performance: number;
  suffix: string;
  tonsPercentOfM1: number;
  costPercentOfM1: number;
}[] = [
  { performance: 0.01, suffix: '.01', tonsPercentOfM1: 0.1, costPercentOfM1: 0.05 },
  { performance: 0.05, suffix: '.05', tonsPercentOfM1: 5, costPercentOfM1: 2 },
  { performance: 0.1, suffix: '.1', tonsPercentOfM1: 10, costPercentOfM1: 5 },
  { performance: 0.2, suffix: '.2', tonsPercentOfM1: 10, costPercentOfM1: 8 },
  { performance: 0.3, suffix: '.3', tonsPercentOfM1: 25, costPercentOfM1: 20 },
  { performance: 0.4, suffix: '.4', tonsPercentOfM1: 33, costPercentOfM1: 25 },
  { performance: 0.5, suffix: '.5', tonsPercentOfM1: 40, costPercentOfM1: 33 },
];

function getFractionalManeuverDriveLevel(performance: number) {
  return FRACTIONAL_MANEUVER_DRIVE_LEVELS.find(
    level => Math.abs(level.performance - performance) < 1e-9
  );
}

// Calculate engine mass and cost based on performance and ship tonnage
export function calculateEngineMassAndCost(
  shipTonnage: number,
  engineType: 'power_plant' | 'maneuver_drive',
  performance: number
): { mass: number; cost: number } {
  if (engineType === 'maneuver_drive' && performance > 0 && performance < 1) {
    const level = getFractionalManeuverDriveLevel(performance);
    if (!level) {
      return { mass: 0, cost: 0 };
    }
    const m1 = calculateEngineMassAndCost(shipTonnage, 'maneuver_drive', 1);
    return {
      mass: (m1.mass * level.tonsPercentOfM1) / 100,
      cost: (m1.cost * level.costPercentOfM1) / 100
    };
  }

  if (performance < 1 || performance > 12) {
    return { mass: 0, cost: 0 };
  }

  // Only power_plant defines levels 11-12; maneuver_drive tops out at 10, so
  // an out-of-range lookup here correctly yields undefined.
  const table = ENGINE_PERFORMANCE_PERCENTAGES[engineType] as Record<number, number | undefined>;
  const percentage = table[performance];
  if (percentage === undefined) {
    return { mass: 0, cost: 0 };
  }
  const mass = (shipTonnage * percentage) / 100;
  const costPerTon = ENGINE_COST_PER_TON[engineType];
  const cost = mass * costPerTon;

  return { mass, cost };
}

export function getAvailableEngines(hullTonnage: number, engineType: string, powerPlantPerformance?: number, techLevel?: string) {
  const availableEngines = [];

  const performanceLabel = engineType === 'maneuver_drive' ? 'M' : 'P';

  // Fractional (sub-1-gee) maneuver drives, listed ascending before M-1.
  // Always available alongside the M-1..M-6 range: they require less than
  // 1 gee of power plant performance, so the powerPlantPerformance gating
  // below (which only excludes drives exceeding the power plant's rating)
  // never filters them out.
  if (engineType === 'maneuver_drive') {
    for (const level of FRACTIONAL_MANEUVER_DRIVE_LEVELS) {
      const { mass, cost } = calculateEngineMassAndCost(hullTonnage, 'maneuver_drive', level.performance);
      const code = `M-${level.suffix}`;
      availableEngines.push({
        code,
        performance: level.performance,
        mass,
        cost,
        label: `${code} (${mass.toFixed(1)}t, ${cost.toFixed(2)} MCr)`
      });
    }
  }

  // Maneuver drives cap at 6. Power plants are instead gated directly by tech
  // level via getMaxPowerPlantByTechLevel, up to P-12 at TL-J (needed to
  // support the P-10 an Antimatter Plant requires).
  let maxPerformance = 6;
  if (engineType === 'power_plant' && techLevel) {
    maxPerformance = getMaxPowerPlantByTechLevel(techLevel);
  }

  // Generate engines for performance ratings 1 up to max allowed
  for (let performance = 1; performance <= maxPerformance; performance++) {
    // Maneuver drives can't exceed the power plant's performance
    if (engineType === 'maneuver_drive' && powerPlantPerformance !== undefined) {
      if (performance > powerPlantPerformance) {
        continue; // Skip this drive if it requires more power than available
      }
    }

    const { mass, cost } = calculateEngineMassAndCost(
      hullTonnage,
      engineType as 'power_plant' | 'maneuver_drive',
      performance
    );

    availableEngines.push({
      code: `${performanceLabel}-${performance}`,
      performance: performance,
      mass: mass,
      cost: cost,
      label: `${performanceLabel}-${performance} (${mass.toFixed(1)}t, ${cost.toFixed(2)} MCr)`
    });
  }

  return availableEngines;
}

export function calculateManeuverFuel(shipTonnage: number, maneuverPerformance: number, weeks: number): number {
  // Maneuver fuel: 0.01 * ship mass * maneuver rating * (weeks / 2)
  // Base is 2 weeks for M-1 at 1% of ship mass
  return shipTonnage * 0.01 * maneuverPerformance * (weeks / 2);
}

// Armor calculations based on tech level
// TL A-D (10-13): Crystaliron, AF-4 per 5% of ship tonnage
// TL E+ (14+): Advanced armor, AF-6 per 5% of ship tonnage
export function getArmorFactorPerIncrement(techLevel: string): number {
  const tlIndex = getTechLevelIndex(techLevel);
  // TL A-D (indices 0-3) = AF-4 per 5%
  // TL E+ (indices 4+) = AF-6 per 5%
  return tlIndex >= 4 ? 6 : 4;
}

export function getMaxArmorFactor(techLevel: string): number {
  // Max armor factor equals the tech level number
  // TL A (10) = max AF 10, TL B (11) = max AF 11, etc.
  const tlIndex = getTechLevelIndex(techLevel);
  return tlIndex + 10; // A=10, B=11, C=12, D=13, E=14, F=15, G=16, H=17
}

export function getAvailableArmorOptions(techLevel: string): Array<{ percentage: number; armorFactor: number; label: string }> {
  const afPerIncrement = getArmorFactorPerIncrement(techLevel);
  const maxAF = getMaxArmorFactor(techLevel);
  const options = [];

  // Each 5% increment provides AF based on tech level
  for (let percentage = 5; percentage <= 100; percentage += 5) {
    const armorFactor = Math.floor(percentage / 5) * afPerIncrement;

    // Stop if we exceed max armor factor for this tech level
    if (armorFactor > maxAF) break;

    const armorType = afPerIncrement === 4 ? 'Crystaliron' : 'Advanced';
    options.push({
      percentage,
      armorFactor,
      label: `${percentage}% (AF-${armorFactor}, ${armorType})`
    });
  }

  return options;
}

export function calculateArmorMass(shipTonnage: number, armorPercentage: number): number {
  return (shipTonnage * armorPercentage) / 100;
}

export function calculateArmorCost(armorMass: number): number {
  // Armor costs 0.1 MCr per ton
  return armorMass * 0.1;
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

// Bay weapon types - 50 tons each, 2 gunners each
// Available based on power plant performance and ship tonnage
export const BAY_WEAPON_TYPES = [
  { name: 'Missile Bank', mass: 50, cost: 12, minTechLevel: null },
  { name: 'Particle Beam Bay', mass: 50, cost: 20, minTechLevel: null },
  { name: 'Fusion Gun Bay', mass: 50, cost: 8, minTechLevel: 'C' }, // TL-C = 12
  { name: 'Meson Gun Bay', mass: 50, cost: 50, minTechLevel: 'B' } // TL-B = 11
];

// Calculate max bay weapons based on power plant and tonnage
// Formula: powerPlantPerformance × (shipTonnage / 1000)
export function getMaxBayWeapons(powerPlantPerformance: number, shipTonnage: number): number {
  if (powerPlantPerformance < 1) return 0;
  const baysPerThousandTons = powerPlantPerformance; // P-1=1, P-2=2, etc.
  return Math.floor((shipTonnage / 1000) * baysPerThousandTons);
}

// Get available bay weapons for current tech level
export function getAvailableBayWeapons(techLevel: string): typeof BAY_WEAPON_TYPES {
  return BAY_WEAPON_TYPES.filter(bay => {
    if (!bay.minTechLevel) return true;
    const bayTechLevelIndex = TECH_LEVELS.indexOf(bay.minTechLevel);
    const shipTechLevelIndex = TECH_LEVELS.indexOf(techLevel);
    return shipTechLevelIndex >= bayTechLevelIndex;
  });
}

export const DEFENSE_TYPES = [
  { name: 'Sandcaster Turret', type: 'sandcaster_turret', mass: 1, cost: 1.3 },
  { name: 'Dual Sandcaster Turret', type: 'dual_sandcaster_turret', mass: 1, cost: 1.5 },
  { name: 'Triple Sandcaster Turret', type: 'triple_sandcaster_turret', mass: 1, cost: 1.8 },
  { name: 'Point Defense Laser Turret', type: 'point_defense_laser_turret', mass: 1, cost: 1 },
  { name: 'Dual Point Defense Laser Turret', type: 'dual_point_defense_laser_turret', mass: 1, cost: 1.5 }
];

// Screen types with TL-based quantity limits. TL 16/17/18 = G/H/J.
export const SCREEN_TL_LIMITS = {
  nuclear_damper: { 12: 1, 13: 2, 14: 4, 15: 6, 16: 8, 17: 10, 18: 12 },
  meson_screen: { 12: 1, 13: 2, 14: 4, 15: 6, 16: 8, 17: 9, 18: 10 },
  black_globe: { 15: 3, 16: 4, 17: 6, 18: 7 }
};

// Screen specs by hull code
// Screen spec at the base tonnage tier (1,000,000 - 4,999,999 tons), and the
// per-tier increment added for each 5x step up in tonnage bracket beyond
// that (5,000,000-24,999,999 tons = tier 1, 25,000,000-124,999,999 = tier 2,
// and so on). See getScreenTonnageTier.
const SCREEN_BASE_SPECS: Record<string, { mass: number; cost: number }> = {
  nuclear_damper: { mass: 80, cost: 80 },
  meson_screen: { mass: 100, cost: 120 },
  black_globe: { mass: 35, cost: 350 }
};

const SCREEN_TIER_INCREMENT: Record<string, { mass: number; cost: number }> = {
  nuclear_damper: { mass: 20, cost: 10 },
  meson_screen: { mass: 10, cost: 10 },
  black_globe: { mass: 5, cost: 50 }
};

// Tonnage brackets are 1,000,000 * 5^tier .. (1,000,000 * 5^(tier+1)) - 1.
// Uses repeated multiplication rather than a log() so tier boundaries
// (e.g. exactly 5,000,000) aren't at risk of floating-point drift.
function getScreenTonnageTier(tonnage: number): number {
  let threshold = 1_000_000;
  let tier = 0;
  while (tonnage >= threshold * 5) {
    threshold *= 5;
    tier++;
  }
  return tier;
}

// Get maximum screens allowed based on TL
export function getMaxScreens(screenType: 'nuclear_damper' | 'meson_screen' | 'black_globe', techLevel: string): number {
  const tlNum = convertTechLevelToNumber(techLevel);
  const limits = SCREEN_TL_LIMITS[screenType];

  // Find the highest TL we meet or exceed
  let maxScreens = 0;
  Object.entries(limits).forEach(([tl, count]) => {
    if (tlNum >= parseInt(tl)) {
      maxScreens = count;
    }
  });

  return maxScreens;
}

// Get screen specs based on hull code
export function getScreenSpecs(screenType: 'nuclear_damper' | 'meson_screen' | 'black_globe', shipTonnage: number): { mass: number; cost: number } | null {
  if (shipTonnage < 1_000_000) return null;

  const tier = getScreenTonnageTier(shipTonnage);
  const base = SCREEN_BASE_SPECS[screenType];
  const increment = SCREEN_TIER_INCREMENT[screenType];

  return { mass: base.mass + tier * increment.mass, cost: base.cost + tier * increment.cost };
}

export const BERTH_TYPES = [
  { name: 'Staterooms', type: 'staterooms', mass: 4, cost: 0.5, required: true },
  { name: 'Luxury Staterooms', type: 'luxury_staterooms', mass: 5, cost: 0.6, required: false },
  { name: 'Low Berths', type: 'low_berths', mass: 0.5, cost: 0.05, required: false },
  { name: 'Emergency Low', type: 'emergency_low_berths', mass: 1, cost: 1, required: false }
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
  { name: 'Fury Helicopter Gunship (Refit)', type: 'fury_helicopter_gunship', mass: 8, cost: 1.2, techLevel: 8, serviceStaff: 1 }
];

export const DRONE_TYPES = [
  { name: 'War', type: 'war', mass: 10, cost: 2 },
  { name: 'Repair', type: 'repair', mass: 10, cost: 1 },
  { name: 'Rescue', type: 'rescue', mass: 10, cost: 0.5 },
  { name: 'Sensor', type: 'sensor', mass: 1, cost: 1 },
  { name: 'Comms', type: 'comms', mass: 0.1, cost: 0.2 },
  { name: 'Centurion Security Robot', type: 'centurion_security_robot', mass: 0.5, cost: 0.12 },
  { name: '0.5 ton Robodog Assault Bot', type: 'robodog_assault_bot', mass: 0.5, cost: 0.012 },
  { name: 'ATLAS Combat Droid 1.0 ton', type: 'atlas_combat_droid', mass: 1, cost: 0.024 }
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

const VALID_CARGO_TYPES = new Set(CARGO_TYPES.map(ct => ct.type));

export function cleanInvalidCargo(cargo: Cargo[]): Cargo[] {
  return cargo.filter(cargoItem => {
    // Remove cargo entries with invalid types (e.g., old "standard" type)
    return VALID_CARGO_TYPES.has(cargoItem.cargo_type) && cargoItem.tonnage > 0;
  });
}

export const COMMS_SENSORS_TYPES = [
  { name: 'Standard', type: 'standard', mass: 0, cost: 0 },
  { name: 'Basic Civilian', type: 'basic_civilian', mass: 1, cost: 0.05 },
  { name: 'Basic Military', type: 'basic_military', mass: 2, cost: 1 },
  { name: 'Advanced', type: 'advanced', mass: 3, cost: 2 },
  { name: 'Very Advanced', type: 'very_advanced', mass: 5, cost: 4 }
];

// Computer types - no tonnage, only cost
export const COMPUTER_TYPES = [
  { name: 'Core/1', model: 'core_1', techLevel: 7, rating: 20, cost: 4 },
  { name: 'Core/2', model: 'core_2', techLevel: 8, rating: 30, cost: 8 },
  { name: 'Core/3', model: 'core_3', techLevel: 9, rating: 40, cost: 12 },
  { name: 'Core/4', model: 'core_4', techLevel: 10, rating: 50, cost: 20 },
  { name: 'Core/5', model: 'core_5', techLevel: 11, rating: 60, cost: 30 },
  { name: 'Core/6', model: 'core_6', techLevel: 12, rating: 70, cost: 50 },
  { name: 'Core/7', model: 'core_7', techLevel: 13, rating: 80, cost: 70 },
  { name: 'Core/8', model: 'core_8', techLevel: 14, rating: 90, cost: 100 },
  { name: 'Core/9', model: 'core_9', techLevel: 15, rating: 100, cost: 130 }
];

export function getWeaponMountLimit(shipTonnage: number): number {
  return Math.floor(shipTonnage / 100);
}

export function convertTechLevelToNumber(techLevel: string): number {
  // Derive from TECH_LEVELS position (not raw char code) so the numbering
  // stays correct now that 'I' is skipped: H=17, J=18, K=19, ...
  const index = getTechLevelIndex(techLevel);
  if (index !== -1) {
    return index + 10;
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

// ── Megastructure helpers ────────────────────────────────────────────────────

// Hull sizes for megastructures: 1M–1B tons in 1M-ton steps
export const MEGASTRUCTURE_HULL_SIZES = Array.from({ length: 1000 }, (_, i) => {
  const tonnage = (i + 1) * 1_000_000;
  return { tonnage, code: `${i + 1}M`, cost: tonnage / 10 };
});

export function getMegastructureSections(tonnage: number): number {
  return Math.ceil(tonnage / 1_000_000);
}

// Control center: 100 tons per million-ton section, 0.5 MCr/ton
export function calculateControlCenterMass(tonnage: number): number {
  return getMegastructureSections(tonnage) * 100;
}

export function calculateControlCenterCost(tonnage: number): number {
  return calculateControlCenterMass(tonnage) * 0.5;
}

// Sensors: 10× base mass and cost per million-ton section
export function getMegastructureSensorMassAndCost(
  baseMass: number,
  baseCost: number,
  tonnage: number
): { mass: number; cost: number } {
  const sections = getMegastructureSections(tonnage);
  return { mass: baseMass * 10 * sections, cost: baseCost * 10 * sections };
}

// Computers: 4× base cost per million-ton section (redundant computers)
export function getMegastructureComputerCost(baseCost: number, tonnage: number): number {
  return baseCost * 4 * getMegastructureSections(tonnage);
}

// Fuel system specs
export const FUEL_SYSTEM_TYPES = [
  { type: 'fuel_scoop',       name: 'Fuel Scoop',         massPerUnit: 0,       costPerUnit: 1,    unit: 'scoop',              note: 'Max 1,000 per million-ton section' },
  { type: 'fuel_processor',   name: 'Fuel Processor',     massPerUnit: 1000,    costPerUnit: 50,   unit: '1,000-ton unit',     note: '20,000 tons/day of fuel processing' },
  { type: 'fuel_tank',        name: 'Fuel Tank',          massPerUnit: 1000,    costPerUnit: 1,    unit: '1,000-ton unit',     note: 'Stores refined fuel' },
  { type: 'antimatter_plant', name: 'Antimatter Plant',   massPerUnit: 100000,  costPerUnit: 1000, unit: '100,000-ton unit',   note: '1,200 tons AM fuel/day; requires P-10 power plant' },
] as const;

// Plant support infrastructure auto-calculated from scoop count: 100 tons, 1 MCr per scoop
export const PLANT_PER_SCOOP = { mass: 100, cost: 1 };

// An installed Antimatter Plant (any quantity > 0) supplies antimatter fuel,
// which requires 1/10th the mass of a regular power plant's maneuver fuel.
export function hasAntimatterPlant(fuelSystems: { system_type: string; quantity: number }[]): boolean {
  return fuelSystems.some(f => f.system_type === 'antimatter_plant' && f.quantity > 0);
}

export function calculateAntimatterAdjustedManeuverFuel(
  shipTonnage: number,
  maneuverPerformance: number,
  weeks: number,
  hasAmPlant: boolean
): number {
  const baseFuel = calculateManeuverFuel(shipTonnage, maneuverPerformance, weeks);
  return hasAmPlant ? baseFuel * 0.1 : baseFuel;
}

// Zone section types: 1,000-ton increments
export const ZONE_SECTION_TYPES = [
  { type: 'residential',        name: 'Residential',              costPerUnit: 40,   note: '8,000 homes per 1,000 tons' },
  { type: 'commercial',         name: 'Commercial',               costPerUnit: 200,  note: '' },
  { type: 'industrial',         name: 'Industrial',               costPerUnit: 80,   note: '' },
  { type: 'heavy_industrial',   name: 'Heavy Industrial',         costPerUnit: 120,  note: '' },
  { type: 'farm',               name: 'Farm',                     costPerUnit: 30,   note: '' },
  { type: 'research_university',name: 'Research Center/University', costPerUnit: 150, note: '' },
  { type: 'park',               name: 'Park',                     costPerUnit: 60,   note: '' },
  { type: 'lake',               name: 'Lake',                     costPerUnit: 50,   note: '' },
  { type: 'cargo',              name: 'Cargo',                    costPerUnit: 0.1,  note: '' },
  { type: 'secure_storage',     name: 'Secure Storage',           costPerUnit: 90,   note: '' },
  { type: 'cold_storage',       name: 'Cold Storage',             costPerUnit: 10,   note: '' },
  { type: 'garden',             name: 'Garden',                   costPerUnit: 5,    note: '' },
  { type: 'livestock',          name: 'Livestock',                costPerUnit: 25,   note: '' },
] as const;

// ── End megastructure helpers ─────────────────────────────────────────────────

export function calculateMedicalStaff(facilities: { facility_type: string; quantity: number }[]): { nurses: number; surgeons: number; techs: number } {
  let nurses = 0;
  let surgeons = 0;
  let techs = 0;
  
  for (const facility of facilities) {
    if (facility.facility_type === 'medical_bay') {
      nurses += facility.quantity;
    } else if (facility.facility_type === 'surgical_bay') {
      surgeons += facility.quantity;
      techs += facility.quantity;
      nurses += facility.quantity;
    }
  }
  
  return { nurses, surgeons, techs };
}