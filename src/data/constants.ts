export const TECH_LEVELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

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

// Calculate maximum jump performance based on tech level
// TL A (10) = J-1, TL B (11) = J-2, TL C (12) = J-3, TL D (13) = J-4, TL E (14) = J-5, TL F+ (15+) = J-6
export function getMaxJumpByTechLevel(techLevel: string): number {
  const tlIndex = getTechLevelIndex(techLevel);

  // Tech level A (index 0) = TL 10 = J-1
  // Tech level B (index 1) = TL 11 = J-2
  // etc.
  const maxJump = tlIndex + 1;

  // Cap at J-6 (for TL F and above)
  return Math.min(maxJump, 6);
}

// Tonnage code table for capital ships (3,000+ tons)
export const TONNAGE_CODES = [
  { minTonnage: 3000, code: 'CA' },
  { minTonnage: 4000, code: 'CB' },
  { minTonnage: 5000, code: 'CC' },
  { minTonnage: 6000, code: 'CD' },
  { minTonnage: 7500, code: 'CE' },
  { minTonnage: 10000, code: 'CF' },
  { minTonnage: 15000, code: 'CG' },
  { minTonnage: 20000, code: 'CH' },
  { minTonnage: 25000, code: 'CJ' },
  { minTonnage: 30000, code: 'CK' },
  { minTonnage: 40000, code: 'CL' },
  { minTonnage: 50000, code: 'CM' },
  { minTonnage: 60000, code: 'CN' },
  { minTonnage: 75000, code: 'CP' },
  { minTonnage: 100000, code: 'CQ' },
  { minTonnage: 200000, code: 'CR' },
  { minTonnage: 300000, code: 'CS' },
  { minTonnage: 400000, code: 'CT' },
  { minTonnage: 500000, code: 'CU' },
  { minTonnage: 600000, code: 'CV' },
  { minTonnage: 700000, code: 'CW' },
  { minTonnage: 800000, code: 'CX' },
  { minTonnage: 900000, code: 'CY' },
  { minTonnage: 1000000, code: 'CZ' }
];

// Get tonnage code based on ship tonnage
export function getTonnageCode(tonnage: number): string | null {
  // Ships under 3,000 tons don't have a tonnage code
  if (tonnage < 3000) {
    return null;
  }

  // Find the highest threshold that the ship meets
  // Iterate in reverse to find the largest matching code
  for (let i = TONNAGE_CODES.length - 1; i >= 0; i--) {
    if (tonnage >= TONNAGE_CODES[i].minTonnage) {
      return TONNAGE_CODES[i].code;
    }
  }

  return null;
}

// Get number of sections based on hull code
export function getNumberOfSections(tonnage: number): number | null {
  const hullCode = getTonnageCode(tonnage);

  if (!hullCode) {
    return null; // Ships under 3,000 tons don't have sections
  }

  // Determine sections based on hull code ranges
  // CA-CE: 2 sections
  if (hullCode >= 'CA' && hullCode <= 'CE') return 2;
  // CF-CK: 3 sections
  if (hullCode >= 'CF' && hullCode <= 'CK') return 3;
  // CL-CQ: 4 sections
  if (hullCode >= 'CL' && hullCode <= 'CQ') return 4;
  // CR-CV: 5 sections
  if (hullCode >= 'CR' && hullCode <= 'CV') return 5;
  // CW-CZ: 6 sections
  if (hullCode >= 'CW' && hullCode <= 'CZ') return 6;

  return null;
}

// Generate hull sizes as multiples of 100 from 100 to 1,000,000
export const HULL_SIZES = Array.from({ length: 10000 }, (_, i) => {
  const tonnage = (i + 1) * 100;
  // Hull cost is tonnage / 10 MCr (simplified formula)
  const cost = tonnage / 10;
  // Generate hull code (simplified: just use tonnage value)
  const code = tonnage.toString();
  return { tonnage, code, cost };
});

// Engine performance percentages as a function of ship displacement
export const ENGINE_PERFORMANCE_PERCENTAGES = {
  power_plant: {
    1: 1.5,
    2: 2.0,
    3: 2.5,
    4: 3.0,
    5: 4.0,
    6: 5.0
  },
  maneuver_drive: {
    1: 1.0,
    2: 1.25,
    3: 1.5,
    4: 1.75,
    5: 2.5,
    6: 3.25
  },
  jump_drive: {
    1: 2.0,
    2: 3.0,
    3: 4.0,
    4: 5.0,
    5: 6.0,
    6: 7.0
  }
};

// Cost per ton for each engine type (in MCr per ton)
export const ENGINE_COST_PER_TON = {
  power_plant: 2.0,
  maneuver_drive: 2.0,
  jump_drive: 1.0
};

// Calculate engine mass and cost based on performance and ship tonnage
export function calculateEngineMassAndCost(
  shipTonnage: number,
  engineType: 'power_plant' | 'maneuver_drive' | 'jump_drive',
  performance: number
): { mass: number; cost: number } {
  if (performance < 1 || performance > 6) {
    return { mass: 0, cost: 0 };
  }

  const percentage = ENGINE_PERFORMANCE_PERCENTAGES[engineType][performance as 1 | 2 | 3 | 4 | 5 | 6];
  const mass = (shipTonnage * percentage) / 100;
  const costPerTon = ENGINE_COST_PER_TON[engineType];
  const cost = mass * costPerTon;

  return { mass, cost };
}

export function getAvailableEngines(hullTonnage: number, engineType: string, powerPlantPerformance?: number, techLevel?: string) {
  const availableEngines = [];

  const performanceLabel = engineType === 'jump_drive' ? 'J' :
                          engineType === 'maneuver_drive' ? 'M' : 'P';

  // For jump drives, determine max performance based on tech level
  let maxPerformance = 6;
  if (engineType === 'jump_drive' && techLevel) {
    maxPerformance = getMaxJumpByTechLevel(techLevel);
  }

  // Generate engines for performance ratings 1 up to max allowed
  for (let performance = 1; performance <= maxPerformance; performance++) {
    // For Jump and Maneuver drives, check power plant requirement
    if ((engineType === 'jump_drive' || engineType === 'maneuver_drive') && powerPlantPerformance !== undefined) {
      if (performance > powerPlantPerformance) {
        continue; // Skip this drive if it requires more power than available
      }
    }

    const { mass, cost } = calculateEngineMassAndCost(
      hullTonnage,
      engineType as 'power_plant' | 'maneuver_drive' | 'jump_drive',
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

export function calculateJumpFuel(shipTonnage: number, jumpPerformance: number): number {
  // Jump fuel: 0.1 * ship mass * jump rating per jump
  return shipTonnage * 0.1 * jumpPerformance;
}

export function calculateManeuverFuel(shipTonnage: number, maneuverPerformance: number, weeks: number): number {
  // Maneuver fuel: 0.01 * ship mass * maneuver rating * (weeks / 2)
  // Base is 2 weeks for M-1 at 1% of ship mass
  return shipTonnage * 0.01 * maneuverPerformance * (weeks / 2);
}

export function calculateTotalFuelMass(shipTonnage: number, jumpPerformance: number, maneuverPerformance: number, weeks: number, useAntimatter: boolean = false): number {
  const jumpFuel = calculateJumpFuel(shipTonnage, jumpPerformance);
  const maneuverFuel = calculateManeuverFuel(shipTonnage, maneuverPerformance, weeks);
  const totalFuel = jumpFuel + maneuverFuel;

  // If antimatter is enabled, fuel takes only 10% of normal values
  return useAntimatter ? totalFuel * 0.1 : totalFuel;
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

// Spinal weapon types - requires P-2+ power plant
export const SPINAL_WEAPON_TYPES = [
  // Particle weapons
  { name: 'Particle Spinal Mount A', type: 'particle', code: 'A', baseTL: 8, baseMass: 5000, baseDamage: 200, baseCost: 3500 },
  { name: 'Particle Spinal Mount B', type: 'particle', code: 'B', baseTL: 12, baseMass: 3000, baseDamage: 300, baseCost: 2100 },
  { name: 'Particle Spinal Mount C', type: 'particle', code: 'C', baseTL: 10, baseMass: 5000, baseDamage: 300, baseCost: 3500 },
  { name: 'Particle Spinal Mount D', type: 'particle', code: 'D', baseTL: 14, baseMass: 3500, baseDamage: 400, baseCost: 2500 },
  { name: 'Particle Spinal Mount E', type: 'particle', code: 'E', baseTL: 12, baseMass: 4000, baseDamage: 400, baseCost: 2800 },
  // Meson weapons
  { name: 'Meson Spinal Mount A', type: 'meson', code: 'A', baseTL: 11, baseMass: 5000, baseDamage: 200, baseCost: 5000 },
  { name: 'Meson Spinal Mount B', type: 'meson', code: 'B', baseTL: 11, baseMass: 8000, baseDamage: 250, baseCost: 8000 },
  { name: 'Meson Spinal Mount C', type: 'meson', code: 'C', baseTL: 12, baseMass: 10000, baseDamage: 350, baseCost: 10000 },
  { name: 'Meson Spinal Mount D', type: 'meson', code: 'D', baseTL: 13, baseMass: 14000, baseDamage: 450, baseCost: 14000 }
];

// Calculate TL bonus modifiers for spinal weapons
function calculateSpinalWeaponTLBonus(weaponType: 'particle' | 'meson', tlDifference: number): { sizeModifier: number; damageModifier: number } {
  if (tlDifference <= 0) {
    return { sizeModifier: 1.0, damageModifier: 1.0 };
  }

  // Cap at TL+4
  const cappedTLDiff = Math.min(tlDifference, 4);

  if (weaponType === 'particle') {
    // Particle: Size/Cost -10% per TL, Damage +5% per TL
    const sizeModifier = 1.0 - (cappedTLDiff * 0.10);
    const damageModifier = 1.0 + (cappedTLDiff * 0.05);
    return { sizeModifier, damageModifier };
  } else {
    // Meson: Size/Cost -20% per TL, Damage +10% per TL
    const sizeModifier = 1.0 - (cappedTLDiff * 0.20);
    const damageModifier = 1.0 + (cappedTLDiff * 0.10);
    return { sizeModifier, damageModifier };
  }
}

// Get available spinal weapons based on tech level and power plant performance
// Returns weapons with TL-adjusted mass, damage, and cost
export function getAvailableSpinalWeapons(techLevel: string, powerPlantPerformance: number) {
  // Spinal weapons require P-2 or higher
  if (powerPlantPerformance < 2) {
    return [];
  }

  const techLevelNum = convertTechLevelToNumber(techLevel);

  return SPINAL_WEAPON_TYPES
    .filter(weapon => techLevelNum >= weapon.baseTL)
    .map(weapon => {
      const tlDifference = techLevelNum - weapon.baseTL;
      const { sizeModifier, damageModifier } = calculateSpinalWeaponTLBonus(weapon.type as 'particle' | 'meson', tlDifference);

      return {
        ...weapon,
        mass: Math.round(weapon.baseMass * sizeModifier),
        cost: Math.round(weapon.baseCost * sizeModifier),
        damage: Math.round(weapon.baseDamage * damageModifier),
        tlBonus: tlDifference > 0 ? `TL+${tlDifference}` : undefined
      };
    });
}

export function getSpinalWeaponMass(spinalWeaponName: string, techLevel: string): number {
  const techLevelNum = convertTechLevelToNumber(techLevel);
  const baseWeapon = SPINAL_WEAPON_TYPES.find(w => w.name === spinalWeaponName);

  if (!baseWeapon) return 0;

  const tlDifference = techLevelNum - baseWeapon.baseTL;
  const { sizeModifier } = calculateSpinalWeaponTLBonus(baseWeapon.type as 'particle' | 'meson', tlDifference);

  return Math.round(baseWeapon.baseMass * sizeModifier);
}

export function getSpinalWeaponMountUsage(spinalWeaponName: string | undefined, techLevel: string): number {
  if (!spinalWeaponName) return 0;

  const mass = getSpinalWeaponMass(spinalWeaponName, techLevel);
  return Math.floor(mass / 100);
}

export const DEFENSE_TYPES = [
  { name: 'Sandcaster Turret', type: 'sandcaster_turret', mass: 1, cost: 1.3 },
  { name: 'Dual Sandcaster Turret', type: 'dual_sandcaster_turret', mass: 1, cost: 1.5 },
  { name: 'Triple Sandcaster Turret', type: 'triple_sandcaster_turret', mass: 1, cost: 1.8 },
  { name: 'Point Defense Laser Turret', type: 'point_defense_laser_turret', mass: 1, cost: 1 },
  { name: 'Dual Point Defense Laser Turret', type: 'dual_point_defense_laser_turret', mass: 1, cost: 1.5 }
];

// Screen types with TL-based quantity limits
export const SCREEN_TL_LIMITS = {
  nuclear_damper: { 12: 1, 13: 2, 14: 4, 15: 6 },
  meson_screen: { 12: 1, 13: 2, 14: 4, 15: 6 },
  black_globe: { 15: 3 }
};

// Screen specs by hull code
const SCREEN_SPECS_BY_HULL: Record<string, Record<string, { mass: number; cost: number }>> = {
  'CA-CE': { nuclear_damper: { mass: 20, cost: 30 }, meson_screen: { mass: 50, cost: 70 }, black_globe: { mass: 10, cost: 100 } },
  'CF-CK': { nuclear_damper: { mass: 30, cost: 40 }, meson_screen: { mass: 60, cost: 80 }, black_globe: { mass: 15, cost: 150 } },
  'CL-CQ': { nuclear_damper: { mass: 40, cost: 50 }, meson_screen: { mass: 70, cost: 90 }, black_globe: { mass: 20, cost: 200 } },
  'CR-CV': { nuclear_damper: { mass: 50, cost: 60 }, meson_screen: { mass: 80, cost: 100 }, black_globe: { mass: 25, cost: 250 } },
  'CW-CZ': { nuclear_damper: { mass: 60, cost: 70 }, meson_screen: { mass: 90, cost: 110 }, black_globe: { mass: 30, cost: 300 } }
};

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
  const hullCode = getTonnageCode(shipTonnage);
  if (!hullCode) return null;

  // Determine hull code range
  let hullRange: string;
  if (hullCode >= 'CA' && hullCode <= 'CE') hullRange = 'CA-CE';
  else if (hullCode >= 'CF' && hullCode <= 'CK') hullRange = 'CF-CK';
  else if (hullCode >= 'CL' && hullCode <= 'CQ') hullRange = 'CL-CQ';
  else if (hullCode >= 'CR' && hullCode <= 'CV') hullRange = 'CR-CV';
  else if (hullCode >= 'CW' && hullCode <= 'CZ') hullRange = 'CW-CZ';
  else return null;

  return SCREEN_SPECS_BY_HULL[hullRange][screenType];
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

export function cleanInvalidCargo(cargo: any[]): any[] {
  return cargo.filter(cargoItem => {
    // Remove cargo entries with invalid types (e.g., old "standard" type)
    return VALID_CARGO_TYPES.has(cargoItem.cargo_type) && cargoItem.tonnage > 0;
  });
}

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

// Computer types - no tonnage, only cost
export const COMPUTER_TYPES = [
  { name: 'Core/3', model: 'core_3', techLevel: 9, rating: 40, cost: 12 },
  { name: 'Core/4', model: 'core_4', techLevel: 10, rating: 50, cost: 20 },
  { name: 'Core/5', model: 'core_5', techLevel: 11, rating: 60, cost: 30 },
  { name: 'Core/6', model: 'core_6', techLevel: 12, rating: 70, cost: 50 },
  { name: 'Core/7', model: 'core_7', techLevel: 13, rating: 80, cost: 70 },
  { name: 'Core/8', model: 'core_8', techLevel: 14, rating: 90, cost: 100 },
  { name: 'Core/9', model: 'core_9', techLevel: 15, rating: 100, cost: 130 }
];

// Get minimum required computer based on ship size and jump performance
export function getMinimumComputer(shipTonnage: number, jumpPerformance: number): typeof COMPUTER_TYPES[0] | null {
  // No computer required for ships under 3,000 tons
  if (shipTonnage < 3000) {
    return null;
  }

  // Determine minimum computer based on ship size and jump
  if (shipTonnage >= 3000 && shipTonnage <= 5000) {
    return jumpPerformance >= 2 ? COMPUTER_TYPES[0] : null; // Core/3
  } else if (shipTonnage >= 5001 && shipTonnage <= 10000) {
    return jumpPerformance >= 2 ? COMPUTER_TYPES[1] : null; // Core/4
  } else if (shipTonnage >= 10001 && shipTonnage <= 50000) {
    return jumpPerformance >= 3 ? COMPUTER_TYPES[2] : null; // Core/5
  } else if (shipTonnage >= 50001 && shipTonnage <= 100000) {
    return jumpPerformance >= 4 ? COMPUTER_TYPES[3] : null; // Core/6
  } else if (shipTonnage >= 100001) {
    if (jumpPerformance >= 6) {
      return COMPUTER_TYPES[5]; // Core/8 for J-6+
    } else if (jumpPerformance >= 5) {
      return COMPUTER_TYPES[4]; // Core/7 for J-5
    } else {
      return null;
    }
  }

  return null;
}

// Get available computers based on ship requirements and tech level
export function getAvailableComputers(shipTonnage: number, jumpPerformance: number, shipTechLevel: string) {
  const minimumComputer = getMinimumComputer(shipTonnage, jumpPerformance);

  if (!minimumComputer) {
    return [];
  }

  const shipTL = convertTechLevelToNumber(shipTechLevel);
  const minIndex = COMPUTER_TYPES.findIndex(c => c.name === minimumComputer.name);

  // Return all computers from minimum required and up that meet TL requirements
  return COMPUTER_TYPES.filter((computer, index) =>
    index >= minIndex && computer.techLevel <= shipTL
  );
}

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