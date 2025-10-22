import { useState, useEffect, useCallback } from 'react';
import type { ShipDesign, MassCalculation, CostCalculation, StaffRequirements } from './types/ship';
import { calculateTotalFuelMass, calculateVehicleServiceStaff, calculateDroneServiceStaff, calculateMedicalStaff, WEAPON_TYPES } from './data/constants';
import { databaseService } from './services/database';
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

function App() {
  const [showSelectShip, setShowSelectShip] = useState(true);
  const [currentPanel, setCurrentPanel] = useState(0);
  const [combinePilotNavigator, setCombinePilotNavigator] = useState(false);
  const [noStewards, setNoStewards] = useState(false);
  const [activeRules, setActiveRules] = useState<Set<string>>(new Set(['spacecraft_design_srd']));
  const [shipDesign, setShipDesign] = useState<ShipDesign>({
    ship: { name: '', tech_level: 'A', tonnage: 5000, configuration: 'standard', fuel_weeks: 2, missile_reloads: 0, sand_reloads: 0, description: '' },
    engines: [],
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
  });

  const panels = [
    'Ship', 'Engines', 'Fittings', 'Weapons', 'Defenses', 
    'Rec/Health', 'Cargo', 'Vehicles', 'Drones', 'Berths',
    'Staff', 'Ship Design'
  ];

  useEffect(() => {
    checkExistingShips();
  }, []);

  const checkExistingShips = async () => {
    try {
      await databaseService.initialize();
      const hasShips = await databaseService.hasAnyShips();
      console.log('App.tsx initial database check - has ships:', hasShips);
      
      // Always show SelectShipPanel - it will handle loading initial data if needed
      setShowSelectShip(true);
    } catch (error) {
      console.error('Error checking existing ships:', error);
      // If there's an error, still show SelectShipPanel and let it handle the loading
      setShowSelectShip(true);
    }
  };

  const handleFileSave = useCallback(async () => {
    if (!shipDesign.ship.name.trim()) {
      alert('Please enter a ship name before saving.');
      return;
    }

    try {
      await databaseService.initialize();
      await databaseService.saveShip(shipDesign);
      // Could add a toast notification here
    } catch (error) {
      console.error('Error saving ship:', error);
      alert(error instanceof Error ? error.message : 'Failed to save ship design. Please try again.');
    }
  }, [shipDesign]);

  const handleFileSaveWithName = useCallback(async (newName: string) => {
    try {
      const modifiedShipDesign = {
        ...shipDesign,
        ship: { ...shipDesign.ship, name: newName }
      };
      await databaseService.initialize();
      await databaseService.saveShip(modifiedShipDesign);
      setShipDesign(modifiedShipDesign);
      // Could add a toast notification here
    } catch (error) {
      console.error('Error saving ship:', error);
      alert(error instanceof Error ? error.message : 'Failed to save ship design. Please try again.');
    }
  }, [shipDesign]);

  const handleFileSaveAs = useCallback(() => {
    const newName = prompt('Enter new ship name:', shipDesign.ship.name);
    if (newName && newName.trim() !== '') {
      handleFileSaveWithName(newName.trim());
    }
  }, [shipDesign.ship.name, handleFileSaveWithName]);

  const handleFilePrint = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const mass = calculateMass();
    const cost = calculateCost();
    const staff = calculateStaffRequirements();
    const shipTitle = `${shipDesign.ship.name}, ${shipDesign.ship.configuration} configuration, ${shipDesign.ship.tonnage} tons, Tech Level ${shipDesign.ship.tech_level}`;
    
    // Generate print content using similar logic to SummaryPanel
    const printContent = generatePrintContent(shipTitle, mass, cost, staff);
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }, [shipDesign]);

  const generatePrintContent = (shipTitle: string, mass: MassCalculation, cost: CostCalculation, staff: StaffRequirements): string => {
    // Simplified print content generation - would need full implementation
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ship Design - ${shipDesign.ship.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .ship-title { font-size: 18px; font-weight: bold; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { padding: 8px 12px; border: 1px solid #ccc; text-align: left; }
            th { background-color: #f0f0f0; font-weight: bold; }
            .category-cell { font-weight: bold; }
            .totals-row { border-top: 2px solid #000; font-weight: bold; }
            .totals-row td { background-color: #f8f8f8; }
            @media print {
              body { margin: 0; }
              .ship-title { page-break-after: avoid; }
              table { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="ship-title">${shipTitle}</div>
          <p>Print functionality available from File menu on all screens.</p>
          <p>Mass: ${mass.used.toFixed(1)} / ${mass.total} tons</p>
          <p>Cost: ${cost.total.toFixed(2)} MCr</p>
          <p>Total Crew: ${staff.total}</p>
        </body>
      </html>
    `;
  };

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
    setActiveRules(prevRules => {
      const newRules = new Set(prevRules);
      if (enabled) {
        newRules.add(ruleId);
      } else {
        newRules.delete(ruleId);
      }
      console.log('Active rules:', Array.from(newRules));
      return newRules;
    });
  }, []);

  // For development - log active rules when they change
  useEffect(() => {
    console.log('Current active rules:', Array.from(activeRules));
  }, [activeRules]);

  const calculateMass = (): MassCalculation => {
    let used = 0;
    
    // Add engine masses
    used += shipDesign.engines.reduce((sum, engine) => sum + engine.mass, 0);
    
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
    const jumpDrive = shipDesign.engines.find(e => e.engine_type === 'jump_drive');
    const maneuverDrive = shipDesign.engines.find(e => e.engine_type === 'maneuver_drive');
    const jumpPerformance = jumpDrive?.performance || 0;
    const maneuverPerformance = maneuverDrive?.performance || 0;
    const useAntimatter = activeRules.has('antimatter');
    const fuelMass = calculateTotalFuelMass(shipDesign.ship.tonnage, jumpPerformance, maneuverPerformance, shipDesign.ship.fuel_weeks, useAntimatter);
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
  };

  const calculateCost = (): CostCalculation => {
    let total = 0;
    
    // Add engine costs
    total += shipDesign.engines.reduce((sum, engine) => sum + engine.cost, 0);
    
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
  };

  const calculateStaffRequirements = (): StaffRequirements => {
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
        if (engine.mass > 100) {
          engineers += Math.ceil(engine.mass / 100) - 1; // -1 because we already counted 1 engineer per engine
        }
      }
    } else {
      // For other ship sizes, use original logic as fallback
      const totalEnginesWeight = shipDesign.engines.reduce((sum, engine) => sum + engine.mass, 0);
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
    
    // Stewards: 1 per 8 staterooms (staterooms + luxury staterooms), rounded up
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
  };

  const calculateAdjustedCrewCount = (staffRequirements: StaffRequirements): number => {
    const isSmallShip = shipDesign.ship.tonnage === 100 || shipDesign.ship.tonnage === 200;
    if (!isSmallShip) return staffRequirements.total;
    
    return combinePilotNavigator && noStewards
      ? staffRequirements.total - 1 - staffRequirements.stewards
      : combinePilotNavigator 
        ? staffRequirements.total - 1 
        : noStewards 
          ? staffRequirements.total - staffRequirements.stewards
          : staffRequirements.total;
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

  const canAdvance = (): boolean => {
    if (!isCurrentPanelValid()) return false;
    if (currentPanel >= 1) { // After ship panel, check mass
      const mass = calculateMass();
      if (mass.isOverweight) return false;
    }
    return true;
  };

  const nextPanel = () => {
    if (canAdvance() && currentPanel < panels.length - 1) {
      setCurrentPanel(currentPanel + 1);
    }
  };

  const prevPanel = () => {
    if (currentPanel > 0) {
      setCurrentPanel(currentPanel - 1);
    }
  };

  const updateShipDesign = (updates: Partial<ShipDesign>) => {
    setShipDesign(prev => ({ ...prev, ...updates }));
  };

  const handleNewShip = () => {
    setShowSelectShip(false);
    setCurrentPanel(0);
  };

  const handleLoadShip = async (loadedShipDesign: ShipDesign) => {
    // Clean up non-standard weapons
    const knownWeaponNames = WEAPON_TYPES.map(wt => wt.name);
    const standardWeapons = loadedShipDesign.weapons.filter(weapon =>
      knownWeaponNames.includes(weapon.weapon_name)
    );
    
    // Check if any weapons were removed
    const removedWeapons = loadedShipDesign.weapons.filter(weapon =>
      !knownWeaponNames.includes(weapon.weapon_name)
    );
    
    let cleanedShipDesign = loadedShipDesign;
    
    if (removedWeapons.length > 0) {
      // Create cleaned ship design
      cleanedShipDesign = {
        ...loadedShipDesign,
        weapons: standardWeapons
      };
      
      // Save the cleaned ship back to the database
      try {
        await databaseService.initialize();
        await databaseService.saveOrUpdateShipByName(cleanedShipDesign);
        console.log(`Removed ${removedWeapons.length} non-standard weapons from ship "${cleanedShipDesign.ship.name}" and saved to database:`, removedWeapons.map(w => w.weapon_name));
      } catch (error) {
        console.error('Error saving cleaned ship design:', error);
      }
    }
    
    setShipDesign(cleanedShipDesign);
    setShowSelectShip(false);
    setCurrentPanel(0);
  };

  const handleBackToShipSelect = () => {
    setShowSelectShip(true);
    setCurrentPanel(0);
  };

  const renderCurrentPanel = () => {
    if (showSelectShip) {
      return <SelectShipPanel onNewShip={handleNewShip} onLoadShip={handleLoadShip} />;
    }

    const mass = calculateMass();
    const cost = calculateCost();
    const staff = calculateStaffRequirements();

    switch (currentPanel) {
      case 0:
        return <ShipPanel 
          ship={shipDesign.ship} 
          onUpdate={(ship) => updateShipDesign({ ship })} 
          onLoadExistingShip={(loadedShipDesign) => setShipDesign(loadedShipDesign)}
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
        return <FittingsPanel fittings={shipDesign.fittings} shipTonnage={shipDesign.ship.tonnage} onUpdate={(fittings) => updateShipDesign({ fittings })} />;
      case 3:
        return <WeaponsPanel 
          weapons={shipDesign.weapons} 
          shipTonnage={shipDesign.ship.tonnage} 
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
        return <VehiclesPanel vehicles={shipDesign.vehicles} shipTechLevel={shipDesign.ship.tech_level} onUpdate={(vehicles) => updateShipDesign({ vehicles })} />;
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
          onCombinePilotNavigatorChange={setCombinePilotNavigator}
          onNoStewardsChange={setNoStewards}
        />;
      case 11:
        return <SummaryPanel 
          shipDesign={shipDesign} 
          mass={mass} 
          cost={cost} 
          staff={staff} 
          combinePilotNavigator={combinePilotNavigator}
          noStewards={noStewards}
          onBackToShipSelect={handleBackToShipSelect} 
        />;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          {!showSelectShip && (
            <>
              <FileMenu
                shipDesign={shipDesign}
                mass={calculateMass()}
                cost={calculateCost()}
                staff={calculateStaffRequirements()}
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
            {panels.map((panel, index) => (
              <button
                key={panel}
                className={`nav-button ${index === currentPanel ? 'active' : ''} ${index < currentPanel ? 'completed' : ''}`}
                onClick={() => setCurrentPanel(index)}
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
          <h2>{showSelectShip ? 'Select Ship' : panels[currentPanel]}</h2>
          {renderCurrentPanel()}
          
          {!showSelectShip && (
            <>
              <div className="panel-controls">
                <button onClick={prevPanel} disabled={currentPanel === 0}>
                  Previous
                </button>
                <button onClick={nextPanel} disabled={currentPanel === panels.length - 1 || !canAdvance()}>
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
          <MassSidebar mass={calculateMass()} cost={calculateCost()} shipDesign={shipDesign} activeRules={activeRules} />
        )}
      </div>
    </div>
  );
}

export default App;