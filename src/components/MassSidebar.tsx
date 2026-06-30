import React, { useState } from 'react';
import type { MassCalculation, CostCalculation, ShipDesign } from '../types/ship';
import {
  calculateManeuverFuel, calculateControlCenterMass, PLANT_PER_SCOOP
} from '../data/constants';
import { sumMass, sumMassWithQuantity, sumCargoTonnage } from '../utils/calculations';

interface MassSidebarProps {
  mass: MassCalculation;
  cost: CostCalculation;
  shipDesign: ShipDesign;
  activeRules: Set<string>;
}

const MassSidebar: React.FC<MassSidebarProps> = ({ mass, cost, shipDesign }) => {
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

  const enginesMass = sumMass(shipDesign.engines);
  const fittingsMass = sumMass(shipDesign.fittings);
  const weaponsMass = sumMassWithQuantity(shipDesign.weapons);
  const defensesMass = sumMassWithQuantity(shipDesign.defenses);
  const facilitiesMass = sumMassWithQuantity(shipDesign.facilities);
  const cargoMass = sumCargoTonnage(shipDesign.cargo);
  const vehiclesMass = sumMassWithQuantity(shipDesign.vehicles);
  const dronesMass = sumMassWithQuantity(shipDesign.drones);
  const customItemsMass = sumMass(shipDesign.custom_items);
  const berthsMass = sumMassWithQuantity(shipDesign.berths);

  // Control center: auto-calculated, not stored in fittings
  const controlCenterMass = calculateControlCenterMass(shipDesign.ship.tonnage);

  // Maneuver fuel only — no jump drives on megastructures
  const maneuverDrive = shipDesign.engines.find(e => e.engine_type === 'maneuver_drive');
  const maneuverPerformance = maneuverDrive?.performance || 0;
  const maneuverFuelMass = maneuverPerformance > 0
    ? calculateManeuverFuel(shipDesign.ship.tonnage, maneuverPerformance, shipDesign.ship.fuel_weeks)
    : 0;

  // Fuel systems mass (scoops=0 tons, plant from scoops, processors, tanks, am plant)
  const fuelSystems = shipDesign.fuel_systems || [];
  const scoopQty = fuelSystems.find(f => f.system_type === 'fuel_scoop')?.quantity ?? 0;
  const plantMass = scoopQty * PLANT_PER_SCOOP.mass;
  const fuelSystemsMass = fuelSystems.reduce((sum, f) => sum + f.mass, 0) + plantMass;

  // Zone sections mass
  const zoneSections = shipDesign.zone_sections || [];
  const zoneSectionsMass = zoneSections.reduce((sum, z) => sum + z.mass, 0);

  const missileReloadMass = shipDesign.ship.missile_reloads;
  const sandReloadMass = shipDesign.ship.sand_reloads;

  const categories = [
    {
      name: 'Control Center',
      mass: controlCenterMass,
      alwaysVisible: true,
      items: [{ name: `${shipDesign.ship.sections ?? 1} section(s) × 100 tons`, mass: controlCenterMass }]
    },
    {
      name: 'Engines',
      mass: enginesMass,
      alwaysVisible: true,
      items: shipDesign.engines.map(engine => ({
        name: `${engine.drive_code} ${engine.engine_type.replace(/_/g, ' ')}`,
        mass: engine.mass
      }))
    },
    {
      name: 'Fittings',
      mass: fittingsMass,
      alwaysVisible: true,
      items: shipDesign.fittings.map(fitting => ({
        name: fitting.fitting_type.replace(/_/g, ' '),
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
        name: `${defense.defense_type.replace(/_/g, ' ')} (${defense.quantity})`,
        mass: defense.mass * defense.quantity
      }))
    },
    {
      name: 'Rec/Health',
      mass: facilitiesMass,
      alwaysVisible: false,
      items: shipDesign.facilities.filter(f => f.quantity > 0).map(facility => ({
        name: `${facility.facility_type.replace(/_/g, ' ')} (${facility.quantity})`,
        mass: facility.mass * facility.quantity
      }))
    },
    {
      name: 'Cargo',
      mass: cargoMass,
      alwaysVisible: false,
      items: shipDesign.cargo.map(cargo => ({
        name: cargo.cargo_type.replace(/_/g, ' '),
        mass: cargo.tonnage
      }))
    },
    {
      name: 'Vehicles',
      mass: vehiclesMass,
      alwaysVisible: false,
      items: shipDesign.vehicles.filter(v => v.quantity > 0).map(vehicle => ({
        name: `${vehicle.vehicle_type.replace(/_/g, ' ')} (${vehicle.quantity})`,
        mass: vehicle.mass * vehicle.quantity
      }))
    },
    {
      name: 'Drones',
      mass: dronesMass,
      alwaysVisible: false,
      items: shipDesign.drones.filter(d => d.quantity > 0).map(drone => ({
        name: `${drone.drone_type.replace(/_/g, ' ')} (${drone.quantity})`,
        mass: drone.mass * drone.quantity
      }))
    },
    {
      name: 'Berths',
      mass: berthsMass,
      alwaysVisible: false,
      items: shipDesign.berths.filter(b => b.quantity > 0).map(berth => ({
        name: `${berth.berth_type.replace(/_/g, ' ')} (${berth.quantity})`,
        mass: berth.mass * berth.quantity
      }))
    },
    {
      name: 'Custom',
      mass: customItemsMass,
      alwaysVisible: false,
      items: shipDesign.custom_items.map(item => ({ name: item.name, mass: item.mass }))
    }
  ];

  if (maneuverFuelMass > 0) {
    categories.push({
      name: 'Maneuver Fuel',
      mass: maneuverFuelMass,
      alwaysVisible: false,
      items: [{ name: `M-${maneuverPerformance} (${shipDesign.ship.fuel_weeks} weeks)`, mass: maneuverFuelMass }]
    });
  }

  if (fuelSystemsMass > 0) {
    const fuelItems = fuelSystems
      .filter(f => f.system_type !== 'fuel_scoop')
      .map(f => ({ name: f.system_type.replace(/_/g, ' '), mass: f.mass }));
    if (plantMass > 0) {
      fuelItems.push({ name: `Plant (${scoopQty} scoops × 100 tons)`, mass: plantMass });
    }
    categories.push({
      name: 'Fuel Systems',
      mass: fuelSystemsMass,
      alwaysVisible: false,
      items: fuelItems
    });
  }

  if (zoneSectionsMass > 0) {
    categories.push({
      name: 'Zone Sections',
      mass: zoneSectionsMass,
      alwaysVisible: false,
      items: zoneSections.filter(z => z.units > 0).map(zone => ({
        name: `${zone.zone_type.replace(/_/g, ' ')} (${zone.units} units)`,
        mass: zone.mass
      }))
    });
  }

  if (missileReloadMass > 0) {
    categories.push({
      name: 'Missile Reloads',
      mass: missileReloadMass,
      alwaysVisible: false,
      items: [{ name: 'Missile Reloads', mass: missileReloadMass }]
    });
  }

  if (sandReloadMass > 0) {
    categories.push({
      name: 'Sand Reloads',
      mass: sandReloadMass,
      alwaysVisible: false,
      items: [{ name: 'Sand Reloads', mass: sandReloadMass }]
    });
  }

  return (
    <aside className="mass-sidebar">
      <div className="mass-tracker">
        <h3>Mass Tracker</h3>

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

        <div className="mass-totals" style={{ borderTop: '1px solid #ccc', paddingTop: '10px', marginTop: '10px' }}>
          <div className="mass-item">
            <span>Total:</span>
            <span>{mass.total.toLocaleString()} tons</span>
          </div>
          <div className="mass-item">
            <span>Used:</span>
            <span>{mass.used.toLocaleString()} tons</span>
          </div>
          <div className={`mass-item ${mass.isOverweight ? 'overweight' : ''}`}>
            <span>Remaining:</span>
            <span>{mass.remaining.toLocaleString()} tons</span>
          </div>
        </div>

        {mass.isOverweight && (
          <div className="warning">
            ⚠ Megastructure is overweight! Remove components.
          </div>
        )}
      </div>

      <div className="cost-tracker">
        <h3>Cost Tracker</h3>
        <div className="cost-item">
          <span>Total Cost:</span>
          <span>{Math.round(cost.total).toLocaleString()} MCr</span>
        </div>
      </div>
    </aside>
  );
};

export default MassSidebar;
