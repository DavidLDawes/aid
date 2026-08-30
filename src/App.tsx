import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Ship, ShipDesign, MassCalculation, CostCalculation, StaffRequirements } from './types/ship';
import { calculateTotalFuelMass, calculateVehicleServiceStaff, calculateVehicleCrewStaff, calculateDroneServiceStaff, calculateMedicalStaff, convertTechLevelToNumber, getBridgeMassAndCost, getEffectiveActiveRules, getHullCost, getMaxJumpByTechLevel, isRuleAvailable, RULE_TECH_REQUIREMENTS, VEHICLE_TYPES, WEAPON_TYPES, getModularCutterCount, calculateModularCutterBayMass, calculateModularCutterModuleCost } from './data/constants';
import { databaseService } from './services/database';
import { generateShipPrintContent } from './utils/printContent';
import { logger } from './utils/logger';
import SelectShipPanel from './components/SelectShipPanel';
import ShipPanel from './components/ShipPanel';
import EnginesPanel from './components/EnginesPanel';
import FittingsPanel from './components/FittingsPanel';
import WeaponsPanel from './components/WeaponsPanel';
import DefensesPanel from './components/DefensesPanel';
import BerthsPanel from './components/BerthsPanel';
import FacilitiesPanel from './components/FacilitiesPanel';
import CargoPanel from './components/CargoPanel';
import VehiclesPanel from './components/VehiclesPanel';
import DronesPanel from './components/DronesPanel';
import StaffPanel from './components/StaffPanel';
import SummaryPanel from './components/SummaryPanel';
import MassSidebar from './components/MassSidebar';
import FileMenu from './components/FileMenu';
import RulesMenu from './components/RulesMenu';
import './App.css';

const PANELS = [
  'Ship', 'Engines', 'Fittings', 'Weapons', 'Defenses',
  'Rec/Health', 'Cargo', 'Vehicles', 'Drones', 'Berths',
  'Staff', 'Ship Design'
];

// Default tech level is C: at TL A the smallest jump drive on a 100-ton hull
// (J-2) already exceeds the tech level's maximum jump of J-1.
const EMPTY_SHIP_DESIGN: ShipDesign = {
  ship: { name: '', tech_level: 'C', tonnage: 100, configuration: 'standard', fuel_weeks: 2, missile_reloads: 0, sand_reloads: 0, external_fuel: false, description: '' },
  engines: [],
  fittings: [],
  weapons: [],
  defenses: [],
  berths: [],
  facilities: [],
  cargo: [],
  vehicles: [],
  modular_cutter_modules: [],
  drones: [],
  active_rules: ['spacecraft_design_srd']
};

function App() {
  const [showSelectShip, setShowSelectShip] = useState(true);
  const [currentPanel, setCurrentPanel] = useState(0);
  const [combinePilotNavigator, setCombinePilotNavigator] = useState(false);
  const [noStewards, setNoStewards] = useState(false);
  const [noEngineer, setNoEngineer] = useState(false);
  const [shipDesign, setShipDesign] = useState<ShipDesign>(EMPTY_SHIP_DESIGN);
  // Derived (not stored) from shipDesign.active_rules so a save/load round
  // trip can't desync "what the Rules Menu shows" from "what calculations
  // apply" - see getEffectiveActiveRules.
  const activeRules = useMemo(
    () => getEffectiveActiveRules(shipDesign.active_rules ?? ['spacecraft_design_srd'], shipDesign.ship.tech_level),
    [shipDesign.active_rules, shipDesign.ship.tech_level]
  );

  const checkExistingShips = async () => {
    logger.info('Initializing database');
    try {
      await databaseService.initialize();
    } catch (error) {
      logger.error('Error initializing database', error);
    }
  };

  useEffect(() => {
    checkExistingShips();
  }, []);

  const handleFileSave = useCallback(async () => {
    if (!shipDesign.ship.name.trim()) {
      alert('Please enter a ship name before saving.');
      return;
    }

    logger.info(`Saving ship "${shipDesign.ship.name}" (${shipDesign.ship.tonnage} tons)`);
    try {
      await databaseService.saveOrUpdateShipByName(shipDesign);
      logger.info(`Ship "${shipDesign.ship.name}" saved successfully`);
    } catch (error) {
      logger.error(`Failed to save ship "${shipDesign.ship.name}"`, error);
      alert(error instanceof Error ? error.message : 'Failed to save ship design. Please try again.');
    }
  }, [shipDesign]);

  const handleFileSaveWithName = useCallback(async (newName: string) => {
    logger.info(`Saving ship as "${newName}"`);
    try {
      const modifiedShipDesign = {
        ...shipDesign,
        ship: { ...shipDesign.ship, name: newName }
      };
      await databaseService.saveShip(modifiedShipDesign);
      setShipDesign(modifiedShipDesign);
      logger.info(`Ship saved as "${newName}"`);
    } catch (error) {
      logger.error(`Failed to save ship as "${newName}"`, error);
      alert(error instanceof Error ? error.message : 'Failed to save ship design. Please try again.');
    }
  }, [shipDesign]);

  const handleFileSaveAs = useCallback(() => {
    const newName = prompt('Enter new ship name:', shipDesign.ship.name);
    if (newName && newName.trim() !== '') {
      handleFileSaveWithName(newName.trim());
    }
  }, [shipDesign.ship.name, handleFileSaveWithName]);

  const calculateMass = useCallback((): MassCalculation => {
    let used = 0;
    used += shipDesign.engines.reduce((sum, engine) => sum + engine.mass, 0);
    used += shipDesign.fittings.reduce((sum, fitting) => sum + fitting.mass, 0);
    used += shipDesign.weapons.reduce((sum, weapon) => sum + (weapon.mass * weapon.quantity), 0);
    used += shipDesign.defenses.reduce((sum, defense) => sum + (defense.mass * defense.quantity), 0);
    used += shipDesign.berths.reduce((sum, berth) => sum + (berth.mass * berth.quantity), 0);
    used += shipDesign.facilities.reduce((sum, facility) => sum + (facility.mass * facility.quantity), 0);
    used += shipDesign.cargo.reduce((sum, cargo) => sum + cargo.tonnage, 0);
    used += shipDesign.vehicles.reduce((sum, vehicle) => sum + (vehicle.mass * vehicle.quantity), 0);
    // Modular Cutter spare-module reload bays (see calculateModularCutterBayMass)
    const modularCutterCount = getModularCutterCount(shipDesign.vehicles);
    const spareModuleCount = (shipDesign.modular_cutter_modules || []).reduce((sum, m) => sum + m.quantity, 0);
    used += calculateModularCutterBayMass(modularCutterCount, spareModuleCount);
    used += shipDesign.drones.reduce((sum, drone) => sum + (drone.mass * drone.quantity), 0);
    const jumpDrive = shipDesign.engines.find(e => e.engine_type === 'jump_drive');
    const maneuverDrive = shipDesign.engines.find(e => e.engine_type === 'maneuver_drive');
    const jumpPerformance = jumpDrive?.performance || 0;
    const maneuverPerformance = maneuverDrive?.performance || 0;
    const useAntimatter = activeRules.has('antimatter');
    const fuelMass = calculateTotalFuelMass(shipDesign.ship.tonnage, jumpPerformance, maneuverPerformance, shipDesign.ship.fuel_weeks, useAntimatter, shipDesign.ship.external_fuel ?? false);
    used += fuelMass;
    used += shipDesign.ship.missile_reloads;
    used += shipDesign.ship.sand_reloads;
    const total = shipDesign.ship.tonnage;
    const remaining = total - used;
    return { total, used, remaining, isOverweight: remaining < 0, fuelMass };
  }, [shipDesign, activeRules]);

  const calculateCost = useCallback((): CostCalculation => {
    let total = getHullCost(shipDesign.ship.tonnage);
    total += shipDesign.engines.reduce((sum, engine) => sum + engine.cost, 0);
    total += shipDesign.fittings.reduce((sum, fitting) => sum + fitting.cost, 0);
    total += shipDesign.weapons.reduce((sum, weapon) => sum + (weapon.cost * weapon.quantity), 0);
    total += shipDesign.defenses.reduce((sum, defense) => sum + (defense.cost * defense.quantity), 0);
    total += shipDesign.berths.reduce((sum, berth) => sum + (berth.cost * berth.quantity), 0);
    total += shipDesign.facilities.reduce((sum, facility) => sum + (facility.cost * facility.quantity), 0);
    total += shipDesign.cargo.reduce((sum, cargo) => sum + cargo.cost, 0);
    total += shipDesign.vehicles.reduce((sum, vehicle) => sum + (vehicle.cost * vehicle.quantity), 0);
    // Modular Cutter spare modules (the reload bay itself is structural, no MCr cost)
    total += calculateModularCutterModuleCost(shipDesign.modular_cutter_modules || []);
    total += shipDesign.drones.reduce((sum, drone) => sum + (drone.cost * drone.quantity), 0);
    total += shipDesign.ship.missile_reloads;
    total += shipDesign.ship.sand_reloads * 0.1;
    return { total };
  }, [shipDesign]);

  const calculateStaffRequirements = useCallback((): StaffRequirements => {
    let engineers: number;
    const shipTonnage = shipDesign.ship.tonnage;
    if (shipTonnage === 100) {
      engineers = 1;
    } else if (shipTonnage === 200 || shipTonnage === 300) {
      engineers = 2;
    } else {
      const engineCount = shipDesign.engines.length;
      engineers = Math.max(engineCount, 1);
      for (const engine of shipDesign.engines) {
        if (engine.mass > 100) {
          engineers += Math.ceil(engine.mass / 100) - 1;
        }
      }
    }
    // 1 gunner per 10 turrets of a given type, rounded up per type
    const gunners = shipDesign.weapons
      .filter(weapon => weapon.weapon_name !== 'Hard Point' && weapon.quantity > 0)
      .reduce((sum, weapon) => sum + Math.ceil(weapon.quantity / 10), 0) +
      shipDesign.defenses
        .filter(defense => defense.quantity > 0)
        .reduce((sum, defense) => sum + Math.ceil(defense.quantity / 10), 0);
    const vehicleService = calculateVehicleServiceStaff(shipDesign.vehicles, shipTonnage);
    const droneService = calculateDroneServiceStaff(shipDesign.drones);
    const service = vehicleService + droneService;
    const totalStaterooms = shipDesign.berths
      .filter(berth => berth.berth_type === 'staterooms' || berth.berth_type === 'luxury_staterooms')
      .reduce((sum, berth) => sum + berth.quantity, 0);
    const stewards = Math.ceil(totalStaterooms / 8);
    const medicalStaff = calculateMedicalStaff(shipDesign.facilities);
    const nurses = medicalStaff.nurses;
    const surgeons = medicalStaff.surgeons;
    const techs = medicalStaff.techs;

    // Crew that rides along with fighters/shuttles/military vehicles
    // (pilots, gunners, engineers) — separate from the maintenance-focused
    // vehicleService above.
    const vehicleCrew = calculateVehicleCrewStaff(shipDesign.vehicles);
    const pilot = 1 + vehicleCrew.pilot;
    const navigator = 1;
    const gunnersTotal = gunners + vehicleCrew.gunner;
    const engineersTotal = engineers + vehicleCrew.engineer;

    const total = pilot + navigator + engineersTotal + gunnersTotal + service + stewards + nurses + surgeons + techs;
    return { pilot, navigator, engineers: engineersTotal, gunners: gunnersTotal, service, stewards, nurses, surgeons, techs, total };
  }, [shipDesign]);

  const handleFilePrint = useCallback(() => {
    logger.info(`Opening print window for ship "${shipDesign.ship.name}"`);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      logger.error('Print window blocked by browser');
      alert('Unable to open the print window. Please allow pop-ups for this site and try again.');
      return;
    }

    const mass = calculateMass();
    const cost = calculateCost();
    const staff = calculateStaffRequirements();
    const html = generateShipPrintContent(shipDesign, mass, cost, staff, combinePilotNavigator, noStewards, noEngineer);

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.addEventListener('afterprint', () => {
      logger.info(`Print dialog closed for "${shipDesign.ship.name}"`);
      printWindow.close();
    });
    printWindow.print();
    logger.info(`Print dialog opened for "${shipDesign.ship.name}"`);
  }, [shipDesign, combinePilotNavigator, noStewards, noEngineer, calculateMass, calculateCost, calculateStaffRequirements]);

  // Global keyboard shortcuts for file operations
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not in ship select mode and when not focused on an input
      if (showSelectShip || (event.target as HTMLElement)?.tagName === 'INPUT' || (event.target as HTMLElement)?.tagName === 'TEXTAREA') {
        return;
      }

      if (event.ctrlKey && !event.shiftKey && event.key === 's') {
        event.preventDefault();
        handleFileSave();
      } else if (event.ctrlKey && event.shiftKey && event.key === 'S') {
        event.preventDefault();
        handleFileSaveAs();
      } else if (event.ctrlKey && event.key === 'p') {
        event.preventDefault();
        handleFilePrint();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSelectShip, handleFileSave, handleFileSaveAs, handleFilePrint]);

  const handleRuleChange = useCallback((ruleId: string, enabled: boolean) => {
    logger.info(`Rule "${ruleId}" ${enabled ? 'enabled' : 'disabled'}`);
    setShipDesign(prev => {
      const requestedRules = new Set(prev.active_rules ?? ['spacecraft_design_srd']);
      if (enabled) {
        requestedRules.add(ruleId);
      } else {
        requestedRules.delete(ruleId);
      }
      return { ...prev, active_rules: Array.from(requestedRules) };
    });

    // Disabling Longer Jumps invalidates jump drives above the base tech level cap
    if (ruleId === 'longer_jumps' && !enabled) {
      setShipDesign(prev => {
        const maxJump = getMaxJumpByTechLevel(prev.ship.tech_level, false);
        if (!prev.engines.some(e => e.engine_type === 'jump_drive' && e.performance > maxJump)) {
          return prev;
        }
        logger.info(`Removing jump drive above J-${maxJump} after disabling Longer Jumps`);
        return {
          ...prev,
          engines: prev.engines.filter(e => !(e.engine_type === 'jump_drive' && e.performance > maxJump))
        };
      });
    }
  }, []);

  // Hull size changes invalidate engine and fuel selections (drive tables are
  // per-hull) and re-tier the bridge. Tech level changes drop now-illegal jump
  // drives and too-advanced vehicles.
  const handleShipInfoUpdate = useCallback((newShip: Ship) => {
    setShipDesign(prev => {
      let next: ShipDesign = { ...prev, ship: newShip };

      if (newShip.tonnage !== prev.ship.tonnage) {
        logger.info(`Hull size changed to ${newShip.tonnage} tons: clearing engine and fuel selections`);
        next = {
          ...next,
          ship: { ...newShip, fuel_weeks: 2, external_fuel: false },
          engines: [],
          fittings: next.fittings.map(fitting =>
            (fitting.fitting_type === 'bridge' || fitting.fitting_type === 'half_bridge')
              ? { ...fitting, ...getBridgeMassAndCost(newShip.tonnage, fitting.fitting_type === 'half_bridge') }
              : fitting
          )
        };
      }

      if (newShip.tech_level !== prev.ship.tech_level) {
        const maxJump = getMaxJumpByTechLevel(newShip.tech_level, activeRules.has('longer_jumps'));
        const shipTL = convertTechLevelToNumber(newShip.tech_level);
        const engines = next.engines.filter(e => !(e.engine_type === 'jump_drive' && e.performance > maxJump));
        const vehicles = next.vehicles.filter(vehicle => {
          const vehicleType = VEHICLE_TYPES.find(vt => vt.type === vehicle.vehicle_type);
          return vehicleType !== undefined && vehicleType.techLevel <= shipTL;
        });
        if (engines.length !== next.engines.length) {
          logger.info(`Tech level changed to ${newShip.tech_level}: removed jump drive above J-${maxJump}`);
        }
        if (vehicles.length !== next.vehicles.length) {
          logger.info(`Tech level changed to ${newShip.tech_level}: removed vehicles above TL ${shipTL}`);
        }
        next = { ...next, engines, vehicles };
      }

      return next;
    });
  }, [activeRules]);

  const calculateAdjustedCrewCount = (staffRequirements: StaffRequirements): number => {
    const isSmallShip = shipDesign.ship.tonnage >= 100 && shipDesign.ship.tonnage <= 200;
    if (!isSmallShip) return staffRequirements.total;

    let adjusted = staffRequirements.total;
    if (combinePilotNavigator) adjusted -= 1;
    if (noStewards) adjusted -= staffRequirements.stewards;
    if (noEngineer && shipDesign.ship.tonnage === 100) adjusted -= staffRequirements.engineers;
    return adjusted;
  };

  const isCurrentPanelValid = (): boolean => {
    switch (currentPanel) {
      case 0: // Ship
        return shipDesign.ship.name.trim() !== '' && 
               shipDesign.ship.tech_level !== '' && 
               shipDesign.ship.tonnage >= 100;
      
      case 1: // Engines
        return shipDesign.engines.some(e => e.engine_type === 'power_plant' && e.drive_code && e.performance >= 1) &&
               shipDesign.engines.some(e => e.engine_type === 'jump_drive' && e.drive_code && e.performance >= 1);
        // Maneuver drive is optional (defaults to M-0)
      
      case 2: // Fittings
        return shipDesign.fittings.some(f => f.fitting_type === 'bridge' || f.fitting_type === 'half_bridge');
      
      case 5: // Rec/Health
        return shipDesign.facilities.some(f => f.facility_type === 'commissary');
      
      default:
        return true;
    }
  };

  const canAdvance = (mass: MassCalculation): boolean => {
    if (!isCurrentPanelValid()) return false;
    if (currentPanel >= 1 && mass.isOverweight) return false;
    return true;
  };

  const nextPanel = (mass: MassCalculation) => {
    if (canAdvance(mass) && currentPanel < PANELS.length - 1) {
      logger.info(`Advancing to panel ${currentPanel + 1}: ${PANELS[currentPanel + 1]}`);
      setCurrentPanel(currentPanel + 1);
    }
  };

  const prevPanel = () => {
    if (currentPanel > 0) {
      logger.info(`Returning to panel ${currentPanel - 1}: ${PANELS[currentPanel - 1]}`);
      setCurrentPanel(currentPanel - 1);
    }
  };

  const updateShipDesign = (updates: Partial<ShipDesign>) => {
    setShipDesign(prev => ({ ...prev, ...updates }));
  };

  const handleNewShip = () => {
    logger.info('Starting new ship design');
    setShipDesign(EMPTY_SHIP_DESIGN);
    setCombinePilotNavigator(false);
    setNoStewards(false);
    setShowSelectShip(false);
    setCurrentPanel(0);
  };

  const handleLoadShip = async (loadedShipDesign: ShipDesign) => {
    logger.info(`Loading ship "${loadedShipDesign.ship.name}"`);

    // Clean up non-standard weapons
    const knownWeaponNames = WEAPON_TYPES.map(wt => wt.name);
    const standardWeapons = loadedShipDesign.weapons.filter(weapon =>
      knownWeaponNames.includes(weapon.weapon_name)
    );

    // Check if any weapons were removed
    const removedWeapons = loadedShipDesign.weapons.filter(weapon =>
      !knownWeaponNames.includes(weapon.weapon_name)
    );

    // One-time migration for ships saved before active_rules existed: assume
    // any TL-gated rule the ship's tech level could support was in effect
    // when it was designed. Antimatter/Longer Jumps only ever reduce
    // calculated mass or raise a cap, so defaulting them off instead would
    // risk making an old, previously-valid design look overweight or newly
    // invalid purely from this data migration - defaulting to "on wherever
    // eligible" can't do that.
    const needsRulesMigration = loadedShipDesign.active_rules === undefined;
    const migratedActiveRules: string[] = needsRulesMigration
      ? ['spacecraft_design_srd', ...Object.keys(RULE_TECH_REQUIREMENTS).filter(
          ruleId => isRuleAvailable(ruleId, loadedShipDesign.ship.tech_level)
        )]
      : loadedShipDesign.active_rules ?? ['spacecraft_design_srd'];

    let cleanedShipDesign: ShipDesign = {
      ...loadedShipDesign,
      active_rules: migratedActiveRules
    };

    if (removedWeapons.length > 0) {
      logger.info(`Removed ${removedWeapons.length} non-standard weapon(s) from "${loadedShipDesign.ship.name}"`);
      cleanedShipDesign = { ...cleanedShipDesign, weapons: standardWeapons };
    }

    if (needsRulesMigration) {
      logger.info(`Migrated "${loadedShipDesign.ship.name}" to persisted Rules Menu selections: [${migratedActiveRules.join(', ')}]`);
    }

    if (removedWeapons.length > 0 || needsRulesMigration) {
      try {
        await databaseService.saveOrUpdateShipByName(cleanedShipDesign);
      } catch (error) {
        logger.error(`Failed to save cleaned/migrated ship design for "${loadedShipDesign.ship.name}"`, error);
      }
    }

    setShipDesign(cleanedShipDesign);
    setShowSelectShip(false);
    setCurrentPanel(0);
    logger.info(`Ship "${loadedShipDesign.ship.name}" loaded, entering Ship panel`);
  };

  const handleBackToShipSelect = () => {
    logger.info('Returning to ship select');
    setShowSelectShip(true);
    setCurrentPanel(0);
  };

  const renderCurrentPanel = (mass: MassCalculation, cost: CostCalculation, staff: StaffRequirements) => {
    if (showSelectShip) {
      return <SelectShipPanel onNewShip={handleNewShip} onLoadShip={handleLoadShip} />;
    }

    switch (currentPanel) {
      case 0:
        return <ShipPanel
          ship={shipDesign.ship}
          onUpdate={handleShipInfoUpdate}
          onLoadExistingShip={(loadedShipDesign) => setShipDesign(loadedShipDesign)}
        />;
      case 1:
        return <EnginesPanel
          engines={shipDesign.engines}
          shipTonnage={shipDesign.ship.tonnage}
          techLevel={shipDesign.ship.tech_level}
          fuelWeeks={shipDesign.ship.fuel_weeks}
          externalFuel={shipDesign.ship.external_fuel ?? false}
          activeRules={activeRules}
          onUpdate={(engines) => updateShipDesign({ engines })}
          onFuelWeeksUpdate={(fuel_weeks) => updateShipDesign({ ship: { ...shipDesign.ship, fuel_weeks } })}
          onExternalFuelUpdate={(external_fuel) => updateShipDesign({ ship: { ...shipDesign.ship, external_fuel } })}
        />;
      case 2:
        return <FittingsPanel fittings={shipDesign.fittings} shipTonnage={shipDesign.ship.tonnage} onUpdate={(fittings) => updateShipDesign({ fittings })} />;
      case 3:
        return <WeaponsPanel
          weapons={shipDesign.weapons}
          shipTonnage={shipDesign.ship.tonnage}
          defensesCount={shipDesign.defenses.reduce((sum, defense) => sum + defense.quantity, 0)}
          missileReloads={shipDesign.ship.missile_reloads}
          remainingMass={mass.remaining + shipDesign.ship.missile_reloads}
          onUpdate={(weapons) => updateShipDesign({ weapons })}
          onMissileReloadsUpdate={(missile_reloads) => updateShipDesign({ ship: { ...shipDesign.ship, missile_reloads } })}
        />;
      case 4:
        return <DefensesPanel
          defenses={shipDesign.defenses}
          shipTonnage={shipDesign.ship.tonnage}
          weaponsCount={shipDesign.weapons.reduce((sum, weapon) => sum + weapon.quantity, 0)}
          sandReloads={shipDesign.ship.sand_reloads}
          remainingMass={mass.remaining + shipDesign.ship.sand_reloads}
          onUpdate={(defenses) => updateShipDesign({ defenses })}
          onSandReloadsUpdate={(sand_reloads) => updateShipDesign({ ship: { ...shipDesign.ship, sand_reloads } })}
        />;
      case 5:
        return <FacilitiesPanel facilities={shipDesign.facilities} onUpdate={(facilities) => updateShipDesign({ facilities })} />;
      case 6:
        return <CargoPanel cargo={shipDesign.cargo} remainingMass={mass.remaining} shipTonnage={shipDesign.ship.tonnage} onUpdate={(cargo) => updateShipDesign({ cargo })} />;
      case 7:
        return <VehiclesPanel
          vehicles={shipDesign.vehicles}
          shipTechLevel={shipDesign.ship.tech_level}
          shipTonnage={shipDesign.ship.tonnage}
          modularCutterModules={shipDesign.modular_cutter_modules || []}
          onUpdate={(vehicles) => updateShipDesign({ vehicles })}
          onModulesUpdate={(modular_cutter_modules) => updateShipDesign({ modular_cutter_modules })}
        />;
      case 8:
        return <DronesPanel drones={shipDesign.drones} onUpdate={(drones) => updateShipDesign({ drones })} />;
      case 9:
        return <BerthsPanel
          berths={shipDesign.berths}
          staffRequirements={staff}
          adjustedCrewCount={calculateAdjustedCrewCount(staff)}
          onUpdate={(berths) => updateShipDesign({ berths })}
        />;
      case 10:
        return <StaffPanel
          staffRequirements={staff}
          berths={shipDesign.berths}
          shipTonnage={shipDesign.ship.tonnage}
          combinePilotNavigator={combinePilotNavigator}
          noStewards={noStewards}
          noEngineer={noEngineer}
          onCombinePilotNavigatorChange={setCombinePilotNavigator}
          onNoStewardsChange={setNoStewards}
          onNoEngineerChange={setNoEngineer}
        />;
      case 11:
        return <SummaryPanel
          shipDesign={shipDesign}
          mass={mass}
          cost={cost}
          staff={staff}
          combinePilotNavigator={combinePilotNavigator}
          noStewards={noStewards}
          noEngineer={noEngineer}
          onBackToShipSelect={handleBackToShipSelect}
        />;
      default:
        return null;
    }
  };

  // Compute derived values once per render
  const mass = calculateMass();
  const cost = calculateCost();
  const staff = calculateStaffRequirements();

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          {!showSelectShip && (
            <>
              <FileMenu
                shipDesign={shipDesign}
                mass={mass}
                cost={cost}
                staff={staff}
                combinePilotNavigator={combinePilotNavigator}
                noStewards={noStewards}
                onPrint={handleFilePrint}
                onSave={handleFileSave}
                onSaveAs={handleFileSaveWithName}
              />
              <RulesMenu shipDesign={shipDesign} onRuleChange={handleRuleChange} />
            </>
          )}
          <h1>
            Starship Designer
            {!showSelectShip && currentPanel > 0 && shipDesign.ship.name.trim() &&
              `: ${shipDesign.ship.name}`
            }
          </h1>
        </div>
        {!showSelectShip && (
          <nav className="panel-nav">
            {PANELS.map((panel, index) => (
              <button
                key={panel}
                className={`nav-button ${index === currentPanel ? 'active' : ''} ${index < currentPanel ? 'completed' : ''}`}
                onClick={() => setCurrentPanel(index)}
                disabled={index > currentPanel + 1 || (index === currentPanel + 1 && !canAdvance(mass))}
              >
                {panel}
              </button>
            ))}
          </nav>
        )}
      </header>

      <div className="app-content">
        <main className="main-panel">
          <h2>{showSelectShip ? 'Select Ship' : PANELS[currentPanel]}</h2>
          {renderCurrentPanel(mass, cost, staff)}

          {!showSelectShip && (
            <>
              <div className="panel-controls">
                <button onClick={prevPanel} disabled={currentPanel === 0}>
                  Previous
                </button>
                <button onClick={() => nextPanel(mass)} disabled={currentPanel === PANELS.length - 1 || !canAdvance(mass)}>
                  Next
                </button>
                <button onClick={handleBackToShipSelect} className="back-to-select">
                  Back to Ship Select
                </button>
              </div>

              <div className="panel-attribution">
                <p>
                  <a
                    href="https://www.traveller-srd.com/core-rules/spacecraft-design/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Based on the Traveller SRD Spacecraft Design page, as best as I can.
                  </a>
                </p>
              </div>
            </>
          )}
        </main>

        {!showSelectShip && currentPanel >= 1 && (
          <MassSidebar mass={mass} cost={cost} shipDesign={shipDesign} activeRules={activeRules} />
        )}
      </div>
    </div>
  );
}

export default App;