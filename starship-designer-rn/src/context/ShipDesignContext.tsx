// Context for managing ship design state across the app
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ShipDesign, MassCalculation, CostCalculation, StaffRequirements } from '../types/ship';
import { 
  calculateTotalFuelMass, 
  calculateVehicleServiceStaff, 
  calculateDroneServiceStaff, 
  calculateMedicalStaff,
  getEnginePerformance 
} from '../data/constants';

// Helper function to create default engines for a ship
const createDefaultEngines = (shipTonnage: number) => {
  // Use the smallest available engine (A) for the ship tonnage
  const engineId = 'A';
  const performance = getEnginePerformance(engineId, shipTonnage) || 1;
  
  return [
    {
      engine_type: 'power_plant' as const,
      engine_id: engineId,
      performance: performance,
      mass: shipTonnage * performance * 0.02,
      cost: shipTonnage * performance * 0.02
    },
    {
      engine_type: 'jump' as const,
      engine_id: engineId,
      performance: performance,
      mass: shipTonnage * performance * 0.02,
      cost: shipTonnage * performance * 0.02
    },
    {
      engine_type: 'maneuver' as const,
      engine_id: engineId,
      performance: performance,
      mass: shipTonnage * performance * 0.02,
      cost: shipTonnage * performance * 0.01  // Maneuver drives cost half as much
    }
  ];
};

interface ShipDesignContextType {
  shipDesign: ShipDesign;
  updateShipDesign: (updates: Partial<ShipDesign>) => void;
  calculateMass: () => MassCalculation;
  calculateCost: () => CostCalculation;
  calculateStaffRequirements: () => StaffRequirements;
  resetShipDesign: () => void;
  setShipDesign: (design: ShipDesign) => void;
  validateEngineRequirements: () => boolean;
}

const defaultShipDesign: ShipDesign = {
  ship: { 
    name: '', 
    tech_level: 'A', 
    tonnage: 100, 
    configuration: 'standard', 
    fuel_weeks: 2, 
    missile_reloads: 0, 
    sand_reloads: 0, 
    description: '' 
  },
  engines: createDefaultEngines(100),
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
  drones: []
};

const ShipDesignContext = createContext<ShipDesignContextType | undefined>(undefined);

export const ShipDesignProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [shipDesign, setShipDesignState] = useState<ShipDesign>(defaultShipDesign);

  const updateShipDesign = useCallback((updates: Partial<ShipDesign>) => {
    setShipDesignState(prev => {
      const newDesign = { ...prev, ...updates };
      
      // If tonnage changed, update engine masses and costs
      if (updates.ship?.tonnage && updates.ship.tonnage !== prev.ship.tonnage) {
        const newTonnage = updates.ship.tonnage;
        const updatedEngines = prev.engines.map(engine => {
          const newPerformance = getEnginePerformance(engine.engine_id, newTonnage) || engine.performance;
          return {
            ...engine,
            performance: newPerformance,
            mass: newTonnage * newPerformance * 0.02,
            cost: newTonnage * newPerformance * (engine.engine_type === 'maneuver' ? 0.01 : 0.02)
          };
        });
        
        // If no engines exist, create default ones
        if (updatedEngines.length === 0) {
          newDesign.engines = createDefaultEngines(newTonnage);
        } else {
          newDesign.engines = updatedEngines;
        }
      }
      
      return newDesign;
    });
  }, []);

  const resetShipDesign = useCallback(() => {
    const resetDesign = {
      ...defaultShipDesign,
      engines: createDefaultEngines(defaultShipDesign.ship.tonnage)
    };
    setShipDesignState(resetDesign);
  }, []);

  const setShipDesign = useCallback((design: ShipDesign) => {
    setShipDesignState(design);
  }, []);

  const calculateMass = useCallback((): MassCalculation => {
    let used = 0;
    
    // Add engine masses (calculated dynamically)
    used += shipDesign.engines.reduce((sum, engine) => {
      const shipTonnage = shipDesign.ship.tonnage;
      const performance = getEnginePerformance(engine.engine_id, shipTonnage) || engine.performance;
      const engineMass = shipTonnage * performance * 0.02;
      return sum + engineMass;
    }, 0);
    
    // Add fitting masses
    used += shipDesign.fittings.reduce((sum, fitting) => sum + fitting.mass, 0);
    
    // Add weapon masses
    used += shipDesign.weapons.reduce((sum, weapon) => sum + (weapon.mass * weapon.quantity), 0);
    
    // Add defense masses
    used += shipDesign.defenses.reduce((sum, defense) => sum + (defense.mass * defense.quantity), 0);
    
    // Add berth masses
    used += shipDesign.berths.reduce((sum, berth) => sum + (berth.mass * berth.quantity), 0);
    
    // Add facility masses
    used += shipDesign.facilities.reduce((sum, facility) => sum + (facility.mass * facility.quantity), 0);
    
    // Add cargo masses
    used += shipDesign.cargo.reduce((sum, cargo) => sum + cargo.tonnage, 0);
    
    // Add vehicle masses
    used += shipDesign.vehicles.reduce((sum, vehicle) => sum + (vehicle.mass * vehicle.quantity), 0);
    
    // Add drone masses
    used += shipDesign.drones.reduce((sum, drone) => sum + (drone.mass * drone.quantity), 0);

    // Add fuel tank mass
    const jumpDrive = shipDesign.engines.find(e => e.engine_type === 'jump');
    const maneuverDrive = shipDesign.engines.find(e => e.engine_type === 'maneuver');
    const jumpPerformance = jumpDrive?.performance || 0;
    const maneuverPerformance = maneuverDrive?.performance || 0;
    const fuelMass = calculateTotalFuelMass(shipDesign.ship.tonnage, jumpPerformance, maneuverPerformance, shipDesign.ship.fuel_weeks);
    used += fuelMass;

    // Add missile reload mass
    used += shipDesign.ship.missile_reloads;

    // Add sand reload mass
    used += shipDesign.ship.sand_reloads;

    const total = shipDesign.ship.tonnage;
    const remaining = total - used;
    
    return {
      total,
      used,
      remaining,
      isOverweight: remaining < 0
    };
  }, [shipDesign]);

  const calculateCost = useCallback((): CostCalculation => {
    let total = 0;
    
    // Add engine costs (calculated dynamically)
    total += shipDesign.engines.reduce((sum, engine) => {
      const shipTonnage = shipDesign.ship.tonnage;
      const performance = getEnginePerformance(engine.engine_id, shipTonnage) || engine.performance;
      if (engine.engine_type === 'jump') {
        return sum + shipTonnage * performance * 0.02;
      } else if (engine.engine_type === 'maneuver') {
        return sum + shipTonnage * performance * 0.01;
      } else if (engine.engine_type === 'power_plant') {
        return sum + shipTonnage * performance * 0.02;
      }
      return sum;
    }, 0);
    
    // Add fitting costs
    total += shipDesign.fittings.reduce((sum, fitting) => sum + fitting.cost, 0);
    
    // Add weapon costs
    total += shipDesign.weapons.reduce((sum, weapon) => sum + (weapon.cost * weapon.quantity), 0);
    
    // Add defense costs
    total += shipDesign.defenses.reduce((sum, defense) => sum + (defense.cost * defense.quantity), 0);
    
    // Add berth costs
    total += shipDesign.berths.reduce((sum, berth) => sum + (berth.cost * berth.quantity), 0);
    
    // Add facility costs
    total += shipDesign.facilities.reduce((sum, facility) => sum + (facility.cost * facility.quantity), 0);
    
    // Add cargo costs
    total += shipDesign.cargo.reduce((sum, cargo) => sum + cargo.cost, 0);
    
    // Add vehicle costs
    total += shipDesign.vehicles.reduce((sum, vehicle) => sum + (vehicle.cost * vehicle.quantity), 0);
    
    // Add drone costs
    total += shipDesign.drones.reduce((sum, drone) => sum + (drone.cost * drone.quantity), 0);

    // Add missile reload costs (1 MCr per ton)
    total += shipDesign.ship.missile_reloads;

    // Add sand reload costs (0.1 MCr per ton)
    total += shipDesign.ship.sand_reloads * 0.1;

    return { total };
  }, [shipDesign]);

  const calculateStaffRequirements = useCallback((): StaffRequirements => {
    const pilot = 1;
    const navigator = 1;
    
    // Engineers: Based on ship tonnage and engine mass
    let engineers = 0;
    const shipTonnage = shipDesign.ship.tonnage;
    
    if (shipTonnage === 100) {
      engineers = 1;
    } else if (shipTonnage === 200 || shipTonnage === 300) {
      engineers = 2;
    } else if (shipTonnage >= 400) {
      // At least one engineer per engine
      const engineCount = shipDesign.engines.length;
      engineers = Math.max(engineCount, 1);
      
      // Additional engineers for engines larger than 100 tons
      for (const engine of shipDesign.engines) {
        const engineMass = shipTonnage * engine.performance * 0.02;
        if (engineMass > 100) {
          engineers += Math.ceil(engineMass / 100) - 1;
        }
      }
    } else {
      // For other ship sizes, use original logic as fallback
      const totalEnginesWeight = shipDesign.engines.reduce((sum, engine) => {
        const engineMass = shipTonnage * engine.performance * 0.02;
        return sum + engineMass;
      }, 0);
      engineers = Math.ceil(totalEnginesWeight / 100);
    }
    
    // Gunners: 1 per weapon/turret mount
    const weaponCount = shipDesign.weapons
      .filter(weapon => weapon.weapon_name !== 'Hard Point')
      .reduce((sum, weapon) => sum + weapon.quantity, 0);
    const defenseCount = shipDesign.defenses.reduce((sum, defense) => sum + defense.quantity, 0);
    const gunners = weaponCount + defenseCount;
    
    // Service staff: for vehicle and drone maintenance
    const vehicleService = calculateVehicleServiceStaff(shipDesign.vehicles);
    const droneService = calculateDroneServiceStaff(shipDesign.drones);
    const service = vehicleService + droneService;
    
    // Stewards: 1 per 8 staterooms, rounded up
    const totalStaterooms = shipDesign.berths
      .filter(berth => berth.berth_type === 'staterooms' || berth.berth_type === 'luxury_staterooms')
      .reduce((sum, berth) => sum + berth.quantity, 0);
    const stewards = Math.ceil(totalStaterooms / 8);
    
    // Medical staff: based on medical facilities
    const medicalStaff = calculateMedicalStaff(shipDesign.facilities);
    const nurses = medicalStaff.nurses;
    const surgeons = medicalStaff.surgeons;
    const techs = medicalStaff.techs;
    
    const total = pilot + navigator + engineers + gunners + service + stewards + nurses + surgeons + techs;
    
    return { pilot, navigator, engineers, gunners, service, stewards, nurses, surgeons, techs, total };
  }, [shipDesign]);

  const validateEngineRequirements = useCallback((): boolean => {
    const powerPlants = shipDesign.engines.filter(e => e.engine_type === 'power_plant');
    const jumpDrives = shipDesign.engines.filter(e => e.engine_type === 'jump');
    
    if (powerPlants.length === 0 || jumpDrives.length === 0) {
      return false;
    }
    
    // Find the highest power plant performance
    const maxPowerPlantPerformance = Math.max(...powerPlants.map(p => p.performance));
    
    // Check all jump drives don't exceed max power plant performance
    for (const jumpDrive of jumpDrives) {
      if (jumpDrive.performance > maxPowerPlantPerformance) {
        return false;
      }
    }
    
    // Check all maneuver drives don't exceed max power plant performance
    const maneuverDrives = shipDesign.engines.filter(e => e.engine_type === 'maneuver');
    for (const maneuver of maneuverDrives) {
      if (maneuver.performance > maxPowerPlantPerformance) {
        return false;
      }
    }
    
    return true;
  }, [shipDesign]);

  const value: ShipDesignContextType = {
    shipDesign,
    updateShipDesign,
    calculateMass,
    calculateCost,
    calculateStaffRequirements,
    resetShipDesign,
    setShipDesign,
    validateEngineRequirements
  };

  return (
    <ShipDesignContext.Provider value={value}>
      {children}
    </ShipDesignContext.Provider>
  );
};

export const useShipDesign = (): ShipDesignContextType => {
  const context = useContext(ShipDesignContext);
  if (context === undefined) {
    throw new Error('useShipDesign must be used within a ShipDesignProvider');
  }
  return context;
};