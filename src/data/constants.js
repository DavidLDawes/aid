export const TECH_LEVELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
export function getTechLevelIndex(techLevel) {
    return TECH_LEVELS.indexOf(techLevel);
}
export function isTechLevelAtLeast(currentLevel, requiredLevel) {
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
export function getMaxJumpByTechLevel(techLevel) {
    const tlIndex = getTechLevelIndex(techLevel);
    // Tech level A (index 0) = TL 10 = J-1
    // Tech level B (index 1) = TL 11 = J-2
    // etc.
    const maxJump = tlIndex + 1;
    // Cap at J-6 (for TL F and above)
    return Math.min(maxJump, 6);
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
export function calculateEngineMassAndCost(shipTonnage, engineType, performance) {
    if (performance < 1 || performance > 6) {
        return { mass: 0, cost: 0 };
    }
    const percentage = ENGINE_PERFORMANCE_PERCENTAGES[engineType][performance];
    const mass = (shipTonnage * percentage) / 100;
    const costPerTon = ENGINE_COST_PER_TON[engineType];
    const cost = mass * costPerTon;
    return { mass, cost };
}
export function getAvailableEngines(hullTonnage, engineType, powerPlantPerformance, techLevel) {
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
        const { mass, cost } = calculateEngineMassAndCost(hullTonnage, engineType, performance);
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
export function calculateJumpFuel(shipTonnage, jumpPerformance) {
    // Jump fuel: 0.1 * ship mass * jump rating per jump
    return shipTonnage * 0.1 * jumpPerformance;
}
export function calculateManeuverFuel(shipTonnage, maneuverPerformance, weeks) {
    // Maneuver fuel: 0.01 * ship mass * maneuver rating * (weeks / 2)
    // Base is 2 weeks for M-1 at 1% of ship mass
    return shipTonnage * 0.01 * maneuverPerformance * (weeks / 2);
}
export function calculateTotalFuelMass(shipTonnage, jumpPerformance, maneuverPerformance, weeks, useAntimatter = false) {
    const jumpFuel = calculateJumpFuel(shipTonnage, jumpPerformance);
    const maneuverFuel = calculateManeuverFuel(shipTonnage, maneuverPerformance, weeks);
    const totalFuel = jumpFuel + maneuverFuel;
    // If antimatter is enabled, fuel takes only 10% of normal values
    return useAntimatter ? totalFuel * 0.1 : totalFuel;
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
export function cleanInvalidCargo(cargo) {
    return cargo.filter(cargoItem => {
        // Remove cargo entries with invalid types (e.g., old "standard" type)
        return VALID_CARGO_TYPES.has(cargoItem.cargo_type) && cargoItem.tonnage > 0;
    });
}
export function getBridgeMassAndCost(shipTonnage, isHalfBridge) {
    let bridgeMass;
    if (shipTonnage <= 200) {
        bridgeMass = 10;
    }
    else if (shipTonnage <= 1000) {
        bridgeMass = 20;
    }
    else if (shipTonnage <= 2000) {
        bridgeMass = 40;
    }
    else {
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
export function getWeaponMountLimit(shipTonnage) {
    return Math.floor(shipTonnage / 100);
}
export function convertTechLevelToNumber(techLevel) {
    // Convert A=10, B=11, C=12, etc.
    if (techLevel.length === 1 && techLevel >= 'A' && techLevel <= 'Z') {
        return techLevel.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
    }
    return parseInt(techLevel) || 0;
}
export function getAvailableVehicles(shipTechLevel) {
    const shipTL = convertTechLevelToNumber(shipTechLevel);
    return VEHICLE_TYPES.filter(vehicle => vehicle.techLevel <= shipTL);
}
export function calculateVehicleServiceStaff(vehicles) {
    let totalServiceStaff = 0;
    for (const vehicle of vehicles) {
        const vehicleType = VEHICLE_TYPES.find(vt => vt.type === vehicle.vehicle_type);
        if (vehicleType) {
            if (vehicleType.serviceStaff === 0.25) {
                // Robodog: 0.25 per unit, rounded up per 4 units (1-4=1, 5-8=2, etc)
                totalServiceStaff += Math.ceil((vehicle.quantity * vehicleType.serviceStaff));
            }
            else if (vehicleType.serviceStaff === 0.5) {
                // ATLAS: 0.5 per unit, rounded up per 2 units (1-2=1, 3-4=2, etc)  
                totalServiceStaff += Math.ceil((vehicle.quantity * vehicleType.serviceStaff));
            }
            else {
                // Standard vehicles: 1 staff per unit (or 3/4 for walkers)
                totalServiceStaff += vehicle.quantity * vehicleType.serviceStaff;
            }
        }
    }
    return totalServiceStaff;
}
export function calculateDroneServiceStaff(drones) {
    let heavyDroneTonnage = 0; // 10 ton drones
    let lightDroneTonnage = 0; // less than 10 ton drones
    for (const drone of drones) {
        const droneType = DRONE_TYPES.find(dt => dt.type === drone.drone_type);
        if (droneType) {
            const droneTonnage = droneType.mass * drone.quantity;
            if (droneType.mass >= 10) {
                heavyDroneTonnage += droneTonnage;
            }
            else {
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
export function calculateMedicalStaff(facilities) {
    let nurses = 0;
    let surgeons = 0;
    let techs = 0;
    for (const facility of facilities) {
        if (facility.facility_type === 'med_bay') {
            nurses += facility.quantity;
        }
        else if (facility.facility_type === 'surgical_ward') {
            surgeons += facility.quantity;
            techs += facility.quantity;
            nurses += facility.quantity;
        }
    }
    return { nurses, surgeons, techs };
}
