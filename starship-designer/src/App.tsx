import React, { useState } from 'react';
import type { ShipDesign, Ship, Engine, Fitting, Weapon, Defense, Berth, Facility, Cargo, Vehicle, Drone, MassCalculation, CostCalculation, StaffRequirements } from './types/ship';
import { calculateTotalFuelMass } from './data/constants';
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
import './App.css';

function App() {
  const [currentPanel, setCurrentPanel] = useState(0);
  const [shipDesign, setShipDesign] = useState<ShipDesign>({
    ship: { name: '', tech_level: 'A', tonnage: 100, configuration: 'standard', fuel_weeks: 2, missile_reloads: 0, sand_reloads: 0, description: '' },
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
    'Berths', 'Rec/Health', 'Cargo', 'Vehicles', 'Drones', 
    'Staff', 'Ship Design'
  ];

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
    
    // Engineers: 1 per 100 tons of engines, rounded up
    const totalEnginesWeight = shipDesign.engines.reduce((sum, engine) => sum + engine.mass, 0);
    const engineers = Math.ceil(totalEnginesWeight / 100);
    
    // Gunners: 1 per weapon/turret mount
    const weaponCount = shipDesign.weapons
      .filter(weapon => weapon.weapon_name !== 'Hard Point')
      .reduce((sum, weapon) => sum + weapon.quantity, 0);
    const defenseCount = shipDesign.defenses.reduce((sum, defense) => sum + defense.quantity, 0);
    const gunners = weaponCount + defenseCount;
    
    const subtotal = pilot + navigator + engineers + gunners;
    
    // Stewards: 1 per 8 crew, rounded up
    const stewards = Math.ceil(subtotal / 8);
    
    const total = subtotal + stewards;
    
    return { pilot, navigator, engineers, gunners, stewards, total };
  };

  const isCurrentPanelValid = (): boolean => {
    switch (currentPanel) {
      case 0: // Ship
        return shipDesign.ship.name.trim() !== '' && 
               shipDesign.ship.tech_level !== '' && 
               shipDesign.ship.tonnage >= 100;
      
      case 1: // Engines
        return shipDesign.engines.length === 3; // Power plant, maneuver, jump
      
      case 2: // Fittings
        return shipDesign.fittings.some(f => f.fitting_type === 'bridge' || f.fitting_type === 'half_bridge');
      
      case 6: // Rec/Health
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

  const renderCurrentPanel = () => {
    const mass = calculateMass();
    const cost = calculateCost();
    const staff = calculateStaffRequirements();

    switch (currentPanel) {
      case 0:
        return <ShipPanel ship={shipDesign.ship} onUpdate={(ship) => updateShipDesign({ ship })} />;
      case 1:
        return <EnginesPanel 
          engines={shipDesign.engines} 
          shipTonnage={shipDesign.ship.tonnage} 
          fuelWeeks={shipDesign.ship.fuel_weeks}
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
        return <BerthsPanel berths={shipDesign.berths} staffRequirements={staff} onUpdate={(berths) => updateShipDesign({ berths })} />;
      case 6:
        return <FacilitiesPanel facilities={shipDesign.facilities} onUpdate={(facilities) => updateShipDesign({ facilities })} />;
      case 7:
        return <CargoPanel cargo={shipDesign.cargo} remainingMass={mass.remaining} onUpdate={(cargo) => updateShipDesign({ cargo })} />;
      case 8:
        return <VehiclesPanel vehicles={shipDesign.vehicles} onUpdate={(vehicles) => updateShipDesign({ vehicles })} />;
      case 9:
        return <DronesPanel drones={shipDesign.drones} onUpdate={(drones) => updateShipDesign({ drones })} />;
      case 10:
        return <StaffPanel staffRequirements={staff} berths={shipDesign.berths} />;
      case 11:
        return <SummaryPanel shipDesign={shipDesign} mass={mass} cost={cost} staff={staff} />;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Starship Designer</h1>
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
      </header>

      <div className="app-content">
        <main className="main-panel">
          <h2>{panels[currentPanel]}</h2>
          {renderCurrentPanel()}
          
          <div className="panel-controls">
            <button onClick={prevPanel} disabled={currentPanel === 0}>
              Previous
            </button>
            <button onClick={nextPanel} disabled={currentPanel === panels.length - 1 || !canAdvance()}>
              Next
            </button>
          </div>
        </main>

        {currentPanel >= 1 && (
          <MassSidebar mass={calculateMass()} cost={calculateCost()} />
        )}
      </div>
    </div>
  );
}

export default App;