import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import type { ShipDesign, MassCalculation, CostCalculation, StaffRequirements } from './types/ship';
import {
  calculateManeuverFuel, calculateVehicleServiceStaff, calculateDroneServiceStaff,
  calculateMedicalStaff, WEAPON_TYPES, BAY_WEAPON_TYPES,
  calculateControlCenterMass, calculateControlCenterCost,
  getMegastructureSections, PLANT_PER_SCOOP
} from './data/constants';
import { databaseService } from './services/database';
import { logger } from './utils/logger';
import { createEmptyShipDesign, createDefaultShip } from './utils/shipDefaults';
import { sumMass, sumMassWithQuantity, sumCost, sumCostWithQuantity, sumCargoTonnage } from './utils/calculations';
import { generateShipPrintContent } from './utils/printContent';
// Eagerly load only the ship selection panel (first screen)
import SelectShipPanel from './components/SelectShipPanel';
// Lazy load all design panels to reduce initial bundle size
const ShipPanel = lazy(() => import('./components/ShipPanel'));
const EnginesPanel = lazy(() => import('./components/EnginesPanel'));
const FittingsPanel = lazy(() => import('./components/FittingsPanel'));
const WeaponsPanel = lazy(() => import('./components/WeaponsPanel'));
const DefensesPanel = lazy(() => import('./components/DefensesPanel'));
const BerthsPanel = lazy(() => import('./components/BerthsPanel'));
const FacilitiesPanel = lazy(() => import('./components/FacilitiesPanel'));
const CargoPanel = lazy(() => import('./components/CargoPanel'));
const VehiclesPanel = lazy(() => import('./components/VehiclesPanel'));
const DronesPanel = lazy(() => import('./components/DronesPanel'));
const CustomPanel = lazy(() => import('./components/CustomPanel'));
const FuelPanel = lazy(() => import('./components/FuelPanel'));
const SectionsPanel = lazy(() => import('./components/SectionsPanel'));
const StaffPanel = lazy(() => import('./components/StaffPanel'));
const SummaryPanel = lazy(() => import('./components/SummaryPanel'));
// Keep UI components eagerly loaded as they're small and always visible
import MassSidebar from './components/MassSidebar';
import FileMenu from './components/FileMenu';
import RulesMenu from './components/RulesMenu';
import './App.css';

const panels = [
  'Megastructure', 'Engines', 'Fittings', 'Weapons', 'Defenses',
  'Rec/Health', 'Cargo', 'Vehicles', 'Drones', 'Custom',
  'Fuel', 'Sections', 'Berths', 'Staff', 'Design Summary'
];

function App() {
  const [showSelectShip, setShowSelectShip] = useState(true);
  const [currentPanel, setCurrentPanel] = useState(0);
  const [combinePilotNavigator, setCombinePilotNavigator] = useState(false);
  const [noStewards, setNoStewards] = useState(false);
  const [activeRules, setActiveRules] = useState<Set<string>>(new Set(['spacecraft_design_srd']));
  const [shipDesign, setShipDesign] = useState<ShipDesign>(
    createEmptyShipDesign(createDefaultShip('', 'A', 1_000_000, 'standard'))
  );

  useEffect(() => {
    logger.info('Initializing database');
    databaseService.initialize().catch(err => logger.error('Error initializing database', err));
  }, []);

  const handleFileSave = useCallback(async () => {
    if (!shipDesign.ship.name.trim()) {
      alert('Please enter a megastructure name before saving.');
      return;
    }
    logger.info(`Saving megastructure "${shipDesign.ship.name}"`);
    try {
      await databaseService.saveOrUpdateShipByName(shipDesign);
      logger.info('Megastructure saved');
    } catch (error) {
      logger.error('Error saving megastructure', error);
      alert(error instanceof Error ? error.message : 'Failed to save. Please try again.');
    }
  }, [shipDesign]);

  const handleFileSaveWithName = useCallback(async (newName: string) => {
    logger.info(`Saving megastructure as "${newName}"`);
    try {
      const modifiedShipDesign = { ...shipDesign, ship: { ...shipDesign.ship, name: newName } };
      await databaseService.saveShip(modifiedShipDesign);
      setShipDesign(modifiedShipDesign);
      logger.info('Megastructure saved');
    } catch (error) {
      logger.error('Error saving megastructure', error);
      alert(error instanceof Error ? error.message : 'Failed to save. Please try again.');
    }
  }, [shipDesign]);

  const handleFileSaveAs = useCallback(() => {
    const newName = prompt('Enter new megastructure name:', shipDesign.ship.name);
    if (newName && newName.trim() !== '') {
      handleFileSaveWithName(newName.trim());
    }
  }, [shipDesign.ship.name, handleFileSaveWithName]);

  const handleFilePrint = useCallback(() => {
    logger.info(`Printing megastructure "${shipDesign.ship.name}"`);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      logger.error('Print window was blocked by the browser');
      alert('Unable to open the print window. Please allow pop-ups for this site and try again.');
      return;
    }
    const mass = calculateMass();
    const cost = calculateCost();
    const staff = calculateStaffRequirements();
    const printContent = generateShipPrintContent(shipDesign, mass, cost, staff, combinePilotNavigator, noStewards, activeRules);
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.addEventListener('afterprint', () => printWindow.close());
    printWindow.print();
  }, [shipDesign, combinePilotNavigator, noStewards, activeRules]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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
    return () => { document.removeEventListener('keydown', handleKeyDown); };
  }, [showSelectShip, handleFileSave, handleFileSaveAs, handleFilePrint]);

  const handleRuleChange = useCallback((ruleId: string, enabled: boolean) => {
    logger.info(`Rule "${ruleId}" ${enabled ? 'enabled' : 'disabled'}`);
    setActiveRules(prevRules => {
      const newRules = new Set(prevRules);
      if (enabled) { newRules.add(ruleId); } else { newRules.delete(ruleId); }
      return newRules;
    });
  }, []);

  function calculateMass(): MassCalculation {
    let used = 0;

    // Control center: auto-calculated from tonnage, not stored in fittings
    used += calculateControlCenterMass(shipDesign.ship.tonnage);

    used += sumMass(shipDesign.engines);
    // Fittings: skip control_center type if present (shouldn't be, but guard)
    used += sumMass(shipDesign.fittings.filter(f => f.fitting_type !== 'control_center'));
    used += sumMassWithQuantity(shipDesign.weapons);
    used += sumMassWithQuantity(shipDesign.defenses);
    used += sumMassWithQuantity(shipDesign.berths);
    used += sumMassWithQuantity(shipDesign.facilities);
    used += sumCargoTonnage(shipDesign.cargo);
    used += sumMassWithQuantity(shipDesign.vehicles);
    used += sumMassWithQuantity(shipDesign.drones);
    used += sumMass(shipDesign.custom_items);

    // Maneuver fuel only — no jump drives on megastructures
    const maneuverDrive = shipDesign.engines.find(e => e.engine_type === 'maneuver_drive');
    const maneuverPerformance = maneuverDrive?.performance || 0;
    if (maneuverPerformance > 0) {
      used += calculateManeuverFuel(shipDesign.ship.tonnage, maneuverPerformance, shipDesign.ship.fuel_weeks);
    }

    used += shipDesign.ship.missile_reloads;
    used += shipDesign.ship.sand_reloads;

    // Fuel systems: scoops have 0 mass, plant is derived from scoop count
    const fuelSystems = shipDesign.fuel_systems || [];
    used += fuelSystems.reduce((sum, f) => sum + f.mass, 0);
    const scoopQty = fuelSystems.find(f => f.system_type === 'fuel_scoop')?.quantity ?? 0;
    used += scoopQty * PLANT_PER_SCOOP.mass;

    // Zone sections
    const zoneSections = shipDesign.zone_sections || [];
    used += zoneSections.reduce((sum, z) => sum + z.mass, 0);

    const total = shipDesign.ship.tonnage;
    return { total, used, remaining: total - used, isOverweight: used > total };
  }

  function calculateCost(): CostCalculation {
    let total = 0;

    // Hull cost: tonnage / 10 MCr (from MEGASTRUCTURE_HULL_SIZES formula)
    total += shipDesign.ship.tonnage / 10;

    // Control center cost
    total += calculateControlCenterCost(shipDesign.ship.tonnage);

    total += sumCost(shipDesign.engines);
    total += sumCost(shipDesign.fittings.filter(f => f.fitting_type !== 'control_center'));
    total += sumCostWithQuantity(shipDesign.weapons);
    total += sumCostWithQuantity(shipDesign.defenses);
    total += sumCostWithQuantity(shipDesign.berths);
    total += sumCostWithQuantity(shipDesign.facilities);
    total += sumCost(shipDesign.cargo);
    total += sumCostWithQuantity(shipDesign.vehicles);
    total += sumCostWithQuantity(shipDesign.drones);
    total += sumCost(shipDesign.custom_items);

    total += shipDesign.ship.missile_reloads;
    total += shipDesign.ship.sand_reloads * 0.1;

    // Fuel systems: scoops=1MCr each, plant=1MCr per scoop
    const fuelSystems = shipDesign.fuel_systems || [];
    total += fuelSystems.reduce((sum, f) => sum + f.cost, 0);
    const scoopQty = fuelSystems.find(f => f.system_type === 'fuel_scoop')?.quantity ?? 0;
    total += scoopQty * PLANT_PER_SCOOP.cost;

    // Zone sections
    const zoneSections = shipDesign.zone_sections || [];
    total += zoneSections.reduce((sum, z) => sum + z.cost, 0);

    return { total };
  }

  function calculateStaffRequirements(): StaffRequirements {
    const pilot = 1;
    const navigator = 1;

    // Engineer count based on engine mass (megastructures are large ships)
    const engineCount = shipDesign.engines.length;
    let engineers = Math.max(engineCount, 1);
    for (const engine of shipDesign.engines) {
      if (engine.mass > 100) {
        engineers += Math.ceil(engine.mass / 100) - 1;
      }
    }

    const bayWeaponNames = BAY_WEAPON_TYPES.map(b => b.name);
    let turretsAndBarbettesGunners = 0;
    shipDesign.weapons
      .filter(weapon => weapon.weapon_name !== 'Hard Point' && !bayWeaponNames.includes(weapon.weapon_name))
      .forEach(weapon => { turretsAndBarbettesGunners += Math.ceil(weapon.quantity / 10); });

    let defenseTurretGunners = 0;
    shipDesign.defenses
      .filter(defense => !['nuclear_damper', 'meson_screen', 'black_globe'].includes(defense.defense_type))
      .forEach(defense => { defenseTurretGunners += Math.ceil(defense.quantity / 10); });

    let screenGunners = 0;
    const screenTypes = ['nuclear_damper', 'meson_screen', 'black_globe'] as const;
    screenTypes.forEach(screenType => {
      const screen = shipDesign.defenses.find(d => d.defense_type === screenType);
      if (screen && screen.quantity > 0) {
        const totalTons = screen.mass * screen.quantity;
        screenGunners += totalTons > 400 ? Math.ceil(totalTons / 100) : 4;
      }
    });

    const bayWeapons = shipDesign.weapons.filter(w => bayWeaponNames.includes(w.weapon_name));
    const bayWeaponGunners = bayWeapons.reduce((sum, weapon) => sum + (weapon.quantity * 2), 0);

    // No spinal weapon gunners — megastructures have no spinal mounts
    const gunners = turretsAndBarbettesGunners + defenseTurretGunners + screenGunners + bayWeaponGunners;

    const vehicleService = calculateVehicleServiceStaff(shipDesign.vehicles);
    const droneService = calculateDroneServiceStaff(shipDesign.drones);
    const service = vehicleService + droneService;

    const totalStaterooms = shipDesign.berths
      .filter(berth => berth.berth_type === 'staterooms' || berth.berth_type === 'luxury_staterooms')
      .reduce((sum, berth) => sum + berth.quantity, 0);
    const stewards = Math.ceil(totalStaterooms / 8);

    const medicalStaff = calculateMedicalStaff(shipDesign.facilities);
    const { nurses, surgeons, techs } = medicalStaff;

    const total = pilot + navigator + engineers + gunners + service + stewards + nurses + surgeons + techs;

    return { pilot, navigator, engineers, gunners, service, stewards, nurses, surgeons, techs, total };
  }

  const isCurrentPanelValid = (): boolean => {
    switch (currentPanel) {
      case 0: // Megastructure info
        return shipDesign.ship.name.trim() !== '' &&
               shipDesign.ship.tech_level !== '' &&
               shipDesign.ship.tonnage >= 1_000_000;

      case 1: // Engines — power plant required, no jump drive
        return shipDesign.engines.some(e => e.engine_type === 'power_plant' && e.drive_code && e.performance >= 1);

      case 2: { // Fittings — computer required
        return shipDesign.fittings.some(f => f.fitting_type === 'computer');
      }

      case 5: // Rec/Health
        return shipDesign.facilities.some(f => f.facility_type === 'commissary');

      default:
        return true;
    }
  };

  const canAdvance = (precomputedMass?: MassCalculation): boolean => {
    if (!isCurrentPanelValid()) return false;
    if (currentPanel >= 1) {
      const m = precomputedMass ?? calculateMass();
      if (m.isOverweight) return false;
    }
    return true;
  };

  const nextPanel = () => {
    if (canAdvance() && currentPanel < panels.length - 1) {
      logger.info(`Advancing to panel ${currentPanel + 1}: ${panels[currentPanel + 1]}`);
      setCurrentPanel(currentPanel + 1);
    }
  };

  const prevPanel = () => {
    if (currentPanel > 0) {
      logger.info(`Returning to panel ${currentPanel - 1}: ${panels[currentPanel - 1]}`);
      setCurrentPanel(currentPanel - 1);
    }
  };

  const updateShipDesign = (updates: Partial<ShipDesign>) => {
    setShipDesign(prev => {
      const newDesign = { ...prev, ...updates };
      if (updates.ship?.tonnage !== undefined) {
        const sections = getMegastructureSections(updates.ship.tonnage);
        newDesign.ship = { ...newDesign.ship, sections };
      }
      return newDesign;
    });
  };

  const handleNewShip = () => {
    logger.info('Starting new megastructure design');
    setShipDesign(createEmptyShipDesign(createDefaultShip('', 'A', 1_000_000, 'standard')));
    setShowSelectShip(false);
    setCurrentPanel(0);
  };

  const handleLoadShip = async (loadedShipDesign: ShipDesign) => {
    logger.info(`Loading megastructure "${loadedShipDesign.ship.name}"`);
    const knownWeaponNames = new Set([
      ...WEAPON_TYPES.map(wt => wt.name),
      ...BAY_WEAPON_TYPES.map(bw => bw.name)
    ]);
    const standardWeapons = loadedShipDesign.weapons.filter(weapon =>
      knownWeaponNames.has(weapon.weapon_name)
    );
    const removedWeapons = loadedShipDesign.weapons.filter(weapon =>
      !knownWeaponNames.has(weapon.weapon_name)
    );

    let cleanedShipDesign: ShipDesign = {
      ...loadedShipDesign,
      fuel_systems: loadedShipDesign.fuel_systems || [],
      zone_sections: loadedShipDesign.zone_sections || []
    };

    if (removedWeapons.length > 0) {
      logger.info(`Cleaned ${removedWeapons.length} non-standard weapons`);
      cleanedShipDesign = { ...cleanedShipDesign, weapons: standardWeapons };
      try {
        await databaseService.saveOrUpdateShipByName(cleanedShipDesign);
      } catch (error) {
        logger.error('Error saving cleaned design', error);
      }
    }

    setShipDesign(cleanedShipDesign);
    setShowSelectShip(false);
    setCurrentPanel(0);
    logger.info(`Megastructure "${loadedShipDesign.ship.name}" loaded`);
  };

  const handleBackToShipSelect = () => {
    logger.info('Returning to megastructure select');
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
          onUpdate={(ship) => updateShipDesign({ ship })}
          onLoadExistingShip={(loadedShipDesign) => setShipDesign({
            ...loadedShipDesign,
            fuel_systems: loadedShipDesign.fuel_systems || [],
            zone_sections: loadedShipDesign.zone_sections || []
          })}
        />;
      case 1:
        return <EnginesPanel
          engines={shipDesign.engines}
          shipTonnage={shipDesign.ship.tonnage}
          shipTechLevel={shipDesign.ship.tech_level}
          fuelWeeks={shipDesign.ship.fuel_weeks}
          activeRules={activeRules}
          onUpdate={(engines) => updateShipDesign({ engines })}
          onFuelWeeksUpdate={(fuel_weeks) => updateShipDesign({ ship: { ...shipDesign.ship, fuel_weeks } })}
        />;
      case 2:
        return <FittingsPanel
          fittings={shipDesign.fittings}
          shipTonnage={shipDesign.ship.tonnage}
          shipTechLevel={shipDesign.ship.tech_level}
          engines={shipDesign.engines}
          onUpdate={(fittings) => updateShipDesign({ fittings })}
        />;
      case 3:
        return <WeaponsPanel
          weapons={shipDesign.weapons}
          shipTonnage={shipDesign.ship.tonnage}
          shipTechLevel={shipDesign.ship.tech_level}
          engines={shipDesign.engines}
          missileReloads={shipDesign.ship.missile_reloads}
          remainingMass={mass.remaining + shipDesign.ship.missile_reloads}
          defenseTurretsCount={shipDesign.defenses.filter(d => !['nuclear_damper', 'meson_screen', 'black_globe'].includes(d.defense_type)).reduce((sum, d) => sum + d.quantity, 0)}
          onUpdate={(weapons) => updateShipDesign({ weapons })}
          onMissileReloadsUpdate={(missile_reloads) => updateShipDesign({ ship: { ...shipDesign.ship, missile_reloads } })}
        />;
      case 4:
        return <DefensesPanel
          defenses={shipDesign.defenses}
          shipTonnage={shipDesign.ship.tonnage}
          shipTechLevel={shipDesign.ship.tech_level}
          weaponsCount={shipDesign.weapons.reduce((sum, weapon) => sum + weapon.quantity, 0)}
          sandReloads={shipDesign.ship.sand_reloads}
          armorPercentage={shipDesign.ship.armor_percentage || 0}
          remainingMass={mass.remaining + shipDesign.ship.sand_reloads}
          onUpdate={(defenses) => updateShipDesign({ defenses })}
          onSandReloadsUpdate={(sand_reloads) => updateShipDesign({ ship: { ...shipDesign.ship, sand_reloads } })}
          onArmorUpdate={(armor_percentage) => updateShipDesign({ ship: { ...shipDesign.ship, armor_percentage } })}
        />;
      case 5:
        return <FacilitiesPanel facilities={shipDesign.facilities} onUpdate={(facilities) => updateShipDesign({ facilities })} />;
      case 6:
        return <CargoPanel cargo={shipDesign.cargo} remainingMass={mass.remaining} shipTonnage={shipDesign.ship.tonnage} onUpdate={(cargo) => updateShipDesign({ cargo })} />;
      case 7:
        return <VehiclesPanel vehicles={shipDesign.vehicles} shipTechLevel={shipDesign.ship.tech_level} onUpdate={(vehicles) => updateShipDesign({ vehicles })} />;
      case 8:
        return <DronesPanel drones={shipDesign.drones} onUpdate={(drones) => updateShipDesign({ drones })} />;
      case 9:
        return <CustomPanel custom_items={shipDesign.custom_items} onUpdate={(custom_items) => updateShipDesign({ custom_items })} />;
      case 10:
        return <FuelPanel
          fuelSystems={shipDesign.fuel_systems || []}
          engines={shipDesign.engines}
          shipTonnage={shipDesign.ship.tonnage}
          onUpdate={(fuel_systems) => updateShipDesign({ fuel_systems })}
        />;
      case 11:
        return <SectionsPanel
          zoneSections={shipDesign.zone_sections || []}
          shipTonnage={shipDesign.ship.tonnage}
          onUpdate={(zone_sections) => updateShipDesign({ zone_sections })}
        />;
      case 12:
        return <BerthsPanel
          berths={shipDesign.berths}
          staffRequirements={staff}
          adjustedCrewCount={staff.total}
          onUpdate={(berths) => updateShipDesign({ berths })}
        />;
      case 13:
        return <StaffPanel
          staffRequirements={staff}
          berths={shipDesign.berths}
          shipTonnage={shipDesign.ship.tonnage}
          combinePilotNavigator={combinePilotNavigator}
          noStewards={noStewards}
          onCombinePilotNavigatorChange={setCombinePilotNavigator}
          onNoStewardsChange={setNoStewards}
        />;
      case 14:
        return <SummaryPanel
          shipDesign={shipDesign}
          mass={mass}
          cost={cost}
          staff={staff}
          combinePilotNavigator={combinePilotNavigator}
          noStewards={noStewards}
          activeRules={activeRules}
          onBackToShipSelect={handleBackToShipSelect}
        />;
      default:
        return null;
    }
  };

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
            Traveller Megastructure Designer
            {!showSelectShip && currentPanel > 0 && shipDesign.ship.name.trim() &&
              `: ${shipDesign.ship.name}`
            }
          </h1>
        </div>
        {!showSelectShip && (
          <nav className="panel-nav">
            {panels.map((panel, index) => (
              <button
                key={panel}
                className={`nav-button ${index === currentPanel ? 'active' : ''} ${index < currentPanel ? 'completed' : ''}`}
                onClick={() => {
                  if (index <= currentPanel || (index === currentPanel + 1 && canAdvance(mass))) {
                    setCurrentPanel(index);
                  }
                }}
                disabled={index > currentPanel + 1}
              >
                {panel}
              </button>
            ))}
          </nav>
        )}
      </header>

      <div className="app-content">
        <main className="main-panel">
          <h2>{showSelectShip ? 'Select Megastructure' : panels[currentPanel]}</h2>
          <Suspense fallback={<div className="loading-panel">Loading panel...</div>}>
            {renderCurrentPanel(mass, cost, staff)}
          </Suspense>

          {!showSelectShip && (
            <>
              <div className="panel-controls">
                <button onClick={prevPanel} disabled={currentPanel === 0}>
                  Previous
                </button>
                <button onClick={nextPanel} disabled={currentPanel === panels.length - 1 || !canAdvance(mass)}>
                  Next
                </button>
                <button onClick={handleBackToShipSelect} className="back-to-select">
                  Back to Select
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
