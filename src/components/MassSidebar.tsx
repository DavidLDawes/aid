import React, { useState } from 'react';
import type { MassCalculation, CostCalculation, ShipDesign } from '../types/ship';
import { calculateTotalFuelMass } from '../data/constants';

interface MassSidebarProps {
  mass: MassCalculation;
  cost: CostCalculation;
  shipDesign: ShipDesign;
  activeRules: Set<string>;
}

const MassSidebar: React.FC<MassSidebarProps> = ({ mass, cost, shipDesign, activeRules }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionName: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName);
    } else {
      newExpanded.add(sectionName);
    }
    setExpandedSections(newExpanded);
  };

  // Calculate masses for each category
  const enginesMass = shipDesign.engines.reduce((sum, engine) => sum + engine.mass, 0);
  const fittingsMass = shipDesign.fittings.reduce((sum, fitting) => sum + fitting.mass, 0);
  const weaponsMass = shipDesign.weapons.reduce((sum, weapon) => sum + (weapon.mass * weapon.quantity), 0);
  const defensesMass = shipDesign.defenses.reduce((sum, defense) => sum + (defense.mass * defense.quantity), 0);
  const facilitiesMass = shipDesign.facilities.reduce((sum, facility) => sum + (facility.mass * facility.quantity), 0);
  const cargoMass = shipDesign.cargo.reduce((sum, cargo) => sum + cargo.tonnage, 0);
  const vehiclesMass = shipDesign.vehicles.reduce((sum, vehicle) => sum + (vehicle.mass * vehicle.quantity), 0);
  const dronesMass = shipDesign.drones.reduce((sum, drone) => sum + (drone.mass * drone.quantity), 0);
  const berthsMass = shipDesign.berths.reduce((sum, berth) => sum + (berth.mass * berth.quantity), 0);

  // Calculate fuel mass
  const jumpDrive = shipDesign.engines.find(e => e.engine_type === 'jump_drive');
  const maneuverDrive = shipDesign.engines.find(e => e.engine_type === 'maneuver_drive');
  const jumpPerformance = jumpDrive?.performance || 0;
  const maneuverPerformance = maneuverDrive?.performance || 0;
  const useAntimatter = activeRules.has('antimatter');
  const fuelMass = calculateTotalFuelMass(shipDesign.ship.tonnage, jumpPerformance, maneuverPerformance, shipDesign.ship.fuel_weeks, useAntimatter);

  // Calculate reload masses
  const missileReloadMass = shipDesign.ship.missile_reloads;
  const sandReloadMass = shipDesign.ship.sand_reloads;

  // Categories with their masses and visibility logic
  const categories = [
    {
      name: 'Engines',
      mass: enginesMass,
      alwaysVisible: true,
      items: shipDesign.engines.map(engine => ({
        name: `${engine.drive_code} ${engine.engine_type.replace('_', ' ')}`,
        mass: engine.mass
      }))
    },
    {
      name: 'Fittings',
      mass: fittingsMass,
      alwaysVisible: true,
      items: shipDesign.fittings.map(fitting => ({
        name: fitting.fitting_type.replace('_', ' '),
        mass: fitting.mass
      }))
    },
    {
      name: 'Weapons',
      mass: weaponsMass,
      alwaysVisible: false,
      items: shipDesign.weapons.filter(w => w.quantity > 0).map(weapon => ({
        name: `${weapon.weapon_name} (${weapon.quantity})`,
        mass: weapon.mass * weapon.quantity
      }))
    },
    {
      name: 'Defenses',
      mass: defensesMass,
      alwaysVisible: false,
      items: shipDesign.defenses.filter(d => d.quantity > 0).map(defense => ({
        name: `${defense.defense_type.replace('_', ' ')} (${defense.quantity})`,
        mass: defense.mass * defense.quantity
      }))
    },
    {
      name: 'Rec/Health',
      mass: facilitiesMass,
      alwaysVisible: false,
      items: shipDesign.facilities.filter(f => f.quantity > 0).map(facility => ({
        name: `${facility.facility_type.replace('_', ' ')} (${facility.quantity})`,
        mass: facility.mass * facility.quantity
      }))
    },
    {
      name: 'Cargo',
      mass: cargoMass,
      alwaysVisible: false,
      items: shipDesign.cargo.map(cargo => ({
        name: cargo.cargo_type.replace('_', ' '),
        mass: cargo.tonnage
      }))
    },
    {
      name: 'Vehicles',
      mass: vehiclesMass,
      alwaysVisible: false,
      items: shipDesign.vehicles.filter(v => v.quantity > 0).map(vehicle => ({
        name: `${vehicle.vehicle_type.replace('_', ' ')} (${vehicle.quantity})`,
        mass: vehicle.mass * vehicle.quantity
      }))
    },
    {
      name: 'Drones',
      mass: dronesMass,
      alwaysVisible: false,
      items: shipDesign.drones.filter(d => d.quantity > 0).map(drone => ({
        name: `${drone.drone_type.replace('_', ' ')} (${drone.quantity})`,
        mass: drone.mass * drone.quantity
      }))
    },
    {
      name: 'Berths',
      mass: berthsMass,
      alwaysVisible: true,
      items: shipDesign.berths.filter(b => b.quantity > 0).map(berth => ({
        name: `${berth.berth_type.replace('_', ' ')} (${berth.quantity})`,
        mass: berth.mass * berth.quantity
      }))
    }
  ];

  // Add fuel and reload categories if they have mass
  if (fuelMass > 0) {
    categories.push({
      name: 'Fuel',
      mass: fuelMass,
      alwaysVisible: false,
      items: [
        {
          name: `Jump & Maneuver Fuel${useAntimatter ? ' (Antimatter)' : ''} (${shipDesign.ship.fuel_weeks} weeks)`,
          mass: fuelMass
        }
      ]
    });
  }

  if (missileReloadMass > 0) {
    categories.push({
      name: 'Missile Reloads',
      mass: missileReloadMass,
      alwaysVisible: false,
      items: [
        {
          name: 'Missile Reloads',
          mass: missileReloadMass
        }
      ]
    });
  }

  if (sandReloadMass > 0) {
    categories.push({
      name: 'Sand Reloads',
      mass: sandReloadMass,
      alwaysVisible: false,
      items: [
        {
          name: 'Sand Reloads',
          mass: sandReloadMass
        }
      ]
    });
  }

  return (
    <aside className="mass-sidebar">
      <div className="mass-tracker">
        <h3>Mass Tracker</h3>
        
        {/* Category breakdowns */}
        {categories.map(category => {
          const shouldShow = category.alwaysVisible || category.mass > 0;
          if (!shouldShow) return null;
          
          const isExpanded = expandedSections.has(category.name);
          
          return (
            <div key={category.name} className="mass-category">
              <div 
                className="mass-category-header"
                onClick={() => toggleSection(category.name)}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <span style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                  ▶
                </span>
                <span>{category.name}:</span>
                <span>{category.mass.toFixed(1)} tons</span>
              </div>
              
              {isExpanded && category.items.length > 0 && (
                <div className="mass-category-details" style={{ marginLeft: '20px', fontSize: '0.9em' }}>
                  {category.items.map((item, index) => (
                    <div key={index} className="mass-item-detail">
                      <span>{item.name}:</span>
                      <span>{item.mass.toFixed(1)} tons</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Total section */}
        <div className="mass-totals" style={{ borderTop: '1px solid #ccc', paddingTop: '10px', marginTop: '10px' }}>
          <div className="mass-item">
            <span>Total:</span>
            <span>{mass.total.toFixed(1)} tons</span>
          </div>
          <div className="mass-item">
            <span>Used:</span>
            <span>{mass.used.toFixed(1)} tons</span>
          </div>
          <div className={`mass-item ${mass.isOverweight ? 'overweight' : ''}`}>
            <span>Remaining:</span>
            <span>{mass.remaining.toFixed(1)} tons</span>
          </div>
        </div>
        
        {mass.isOverweight && (
          <div className="warning">
            ⚠️ Ship is overweight! Remove components.
          </div>
        )}
      </div>

      <div className="cost-tracker">
        <h3>Cost Tracker</h3>
        <div className="cost-item">
          <span>Total Cost:</span>
          <span>{Math.round(cost.total)} MCr</span>
        </div>
      </div>
    </aside>
  );
};

export default MassSidebar;