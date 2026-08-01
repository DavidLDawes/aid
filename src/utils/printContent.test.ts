import { describe, it, expect } from '@jest/globals';
import { generateShipPrintContent } from './printContent';
import type { ShipDesign, MassCalculation, CostCalculation, StaffRequirements } from '../types/ship';

const baseMass: MassCalculation = { total: 1_000_000, used: 120_000, remaining: 880_000, isOverweight: false };
const baseCost: CostCalculation = { total: 45.5 };
const baseStaff: StaffRequirements = {
  pilot: 8, navigator: 0, engineers: 2, gunners: 0,
  service: 0, stewards: 0, nurses: 0, surgeons: 0, techs: 0, total: 10,
};
const baseRules = new Set(['spacecraft_design_srd']);

const baseShip: ShipDesign = {
  ship: {
    name: 'Test Megastructure',
    tech_level: 'B',
    tonnage: 1_000_000,
    configuration: 'standard',
    fuel_weeks: 2,
    missile_reloads: 0,
    sand_reloads: 0,
    sections: 1,
    description: '',
  },
  engines: [
    { engine_type: 'power_plant', drive_code: 'P-1', performance: 1, mass: 2, cost: 4 },
    { engine_type: 'maneuver_drive', drive_code: 'M-1', performance: 1, mass: 2, cost: 8 },
  ],
  fittings: [
    { fitting_type: 'comms_sensors', comms_sensors_type: 'standard', mass: 0, cost: 0 },
    { fitting_type: 'computer', computer_model: 'core_1', mass: 0, cost: 30 },
  ],
  weapons: [],
  defenses: [],
  berths: [],
  facilities: [],
  cargo: [],
  vehicles: [],
  drones: [],
  custom_items: [],
  fuel_systems: [],
  zone_sections: [],
};

describe('generateShipPrintContent', () => {
  it('should return a valid HTML document', () => {
    const html = generateShipPrintContent(baseShip, baseMass, baseCost, baseStaff, baseRules);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html>');
    expect(html).toContain('</html>');
    expect(html).toContain('<table>');
    expect(html).toContain('</table>');
  });

  it('should include the ship name in the title and header', () => {
    const html = generateShipPrintContent(baseShip, baseMass, baseCost, baseStaff, baseRules);
    expect(html).toContain('Test Megastructure');
  });

  it('should include tonnage and tech level in the title', () => {
    const html = generateShipPrintContent(baseShip, baseMass, baseCost, baseStaff, baseRules);
    expect(html).toContain('1,000,000 tons');
    expect(html).toContain('Tech Level B');
  });

  it('should escape HTML special characters in ship name', () => {
    const xssShip = {
      ...baseShip,
      ship: { ...baseShip.ship, name: '<script>alert("xss")</script>' },
    };
    const html = generateShipPrintContent(xssShip, baseMass, baseCost, baseStaff, baseRules);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('should escape ampersands and quotes in ship name', () => {
    const ship = { ...baseShip, ship: { ...baseShip.ship, name: 'A & B "Megastructure"' } };
    const html = generateShipPrintContent(ship, baseMass, baseCost, baseStaff, baseRules);
    expect(html).toContain('A &amp; B &quot;Megastructure&quot;');
  });

  it('should include engine rows', () => {
    const html = generateShipPrintContent(baseShip, baseMass, baseCost, baseStaff, baseRules);
    expect(html).toContain('Power Plant');
    expect(html).toContain('Maneuver Drive');
    expect(html).toContain('Engines');
  });

  it('should not include Jump Drive (megastructures have no jump drives)', () => {
    const html = generateShipPrintContent(baseShip, baseMass, baseCost, baseStaff, baseRules);
    expect(html).not.toContain('Jump Drive');
  });

  it('should omit M-0 maneuver drive', () => {
    const ship = {
      ...baseShip,
      engines: [
        { engine_type: 'power_plant' as const, drive_code: 'P-1', performance: 1, mass: 2, cost: 4 },
        { engine_type: 'maneuver_drive' as const, drive_code: 'M-0', performance: 0, mass: 0, cost: 0 },
      ],
    };
    const html = generateShipPrintContent(ship, baseMass, baseCost, baseStaff, baseRules);
    expect(html).not.toContain('M-0');
  });

  it('should include a Hull cost row', () => {
    const html = generateShipPrintContent(baseShip, baseMass, baseCost, baseStaff, baseRules);
    expect(html).toContain('Hull');
    expect(html).toContain('100000.00 MCr'); // 1,000,000 tons / 10
  });

  it('should include control center section', () => {
    const html = generateShipPrintContent(baseShip, baseMass, baseCost, baseStaff, baseRules);
    expect(html).toContain('Control Center');
    expect(html).toContain('100 tons');
  });

  it('should not include Bridge (megastructures have no bridge)', () => {
    const html = generateShipPrintContent(baseShip, baseMass, baseCost, baseStaff, baseRules);
    expect(html).not.toContain('>Bridge<');
    expect(html).not.toContain('>Half Bridge<');
  });

  it('should include fittings section with sensors and computer', () => {
    const html = generateShipPrintContent(baseShip, baseMass, baseCost, baseStaff, baseRules);
    expect(html).toContain('Fittings');
    expect(html).toContain('Sensors');
    expect(html).toContain('Computer');
  });

  it('should include weapons when present', () => {
    const ship = {
      ...baseShip,
      weapons: [{ weapon_name: 'Laser Turret', mass: 1, cost: 0.5, quantity: 2 }],
    };
    const html = generateShipPrintContent(ship, baseMass, baseCost, baseStaff, baseRules);
    expect(html).toContain('Weapons');
    expect(html).toContain('Laser Turret');
    expect(html).toContain('x2');
  });

  it('should include defenses when present', () => {
    const ship = {
      ...baseShip,
      defenses: [{ defense_type: 'sandcaster_turret' as const, mass: 1, cost: 0.5, quantity: 1 }],
    };
    const html = generateShipPrintContent(ship, baseMass, baseCost, baseStaff, baseRules);
    expect(html).toContain('Defenses');
    expect(html).toContain('Sandcaster');
  });

  it('should include sand reloads in defenses with cost', () => {
    const ship = { ...baseShip, ship: { ...baseShip.ship, sand_reloads: 5 } };
    const html = generateShipPrintContent(ship, baseMass, baseCost, baseStaff, baseRules);
    expect(html).toContain('Sand');
    expect(html).toContain('0.50 MCr'); // 5 tons * 0.1 MCr/ton
  });

  it('should include missile reloads in weapons with cost', () => {
    const ship = { ...baseShip, ship: { ...baseShip.ship, missile_reloads: 10 } };
    const html = generateShipPrintContent(ship, baseMass, baseCost, baseStaff, baseRules);
    expect(html).toContain('Missile Reloads');
    expect(html).toContain('10.00 MCr'); // 10 tons * 1 MCr/ton
  });

  it('should include berths when present', () => {
    const ship = {
      ...baseShip,
      berths: [{ berth_type: 'staterooms' as const, quantity: 4, mass: 16, cost: 2 }],
    };
    const html = generateShipPrintContent(ship, baseMass, baseCost, baseStaff, baseRules);
    expect(html).toContain('Berths');
    expect(html).toContain('x4');
  });

  it('should include facilities when present', () => {
    const ship = {
      ...baseShip,
      facilities: [{ facility_type: 'commissary' as const, quantity: 1, mass: 2, cost: 0.5 }],
    };
    const html = generateShipPrintContent(ship, baseMass, baseCost, baseStaff, baseRules);
    expect(html).toContain('Rec/Health');
    expect(html).toContain('Commissary');
  });

  it('should include cargo when present', () => {
    const ship = {
      ...baseShip,
      cargo: [{ cargo_type: 'cargo_bay' as const, tonnage: 40, cost: 0 }],
    };
    const html = generateShipPrintContent(ship, baseMass, baseCost, baseStaff, baseRules);
    expect(html).toContain('Cargo');
    expect(html).toContain('Cargo Bay');
  });

  it('should include vehicles when present', () => {
    const ship = {
      ...baseShip,
      vehicles: [{ vehicle_type: 'atv_wheeled' as const, quantity: 1, mass: 10, cost: 0.05 }],
    };
    const html = generateShipPrintContent(ship, baseMass, baseCost, baseStaff, baseRules);
    expect(html).toContain('Vehicles');
  });

  it('should include drones when present', () => {
    const ship = {
      ...baseShip,
      drones: [{ drone_type: 'repair' as const, quantity: 2, mass: 2, cost: 0.5 }],
    };
    const html = generateShipPrintContent(ship, baseMass, baseCost, baseStaff, baseRules);
    expect(html).toContain('Drones');
  });

  it('should include fuel systems when present', () => {
    const ship = {
      ...baseShip,
      fuel_systems: [
        { system_type: 'fuel_scoop' as const, quantity: 100, mass: 0, cost: 100 },
        { system_type: 'fuel_tank' as const, quantity: 10, mass: 10000, cost: 10 },
      ],
    };
    const html = generateShipPrintContent(ship, baseMass, baseCost, baseStaff, baseRules);
    expect(html).toContain('Fuel Systems');
    expect(html).toContain('Fuel Scoops');
    expect(html).toContain('fuel tank');
  });

  it('should include zone sections when present', () => {
    const ship = {
      ...baseShip,
      zone_sections: [
        { zone_type: 'residential' as const, units: 100, mass: 100000, cost: 4000 },
      ],
    };
    const html = generateShipPrintContent(ship, baseMass, baseCost, baseStaff, baseRules);
    expect(html).toContain('Zone Sections');
    expect(html).toContain('Residential');
  });

  it('should include totals row', () => {
    const html = generateShipPrintContent(baseShip, baseMass, baseCost, baseStaff, baseRules);
    expect(html).toContain('Total');
    expect(html).toContain('120,000 tons');
    expect(html).toContain('46 MCr');
  });

  it('should show 8 pilots and 0 navigators for an underway (M-1+) structure with no atmosphere support', () => {
    const html = generateShipPrintContent(baseShip, baseMass, baseCost, baseStaff, baseRules);
    expect(html).toContain('<strong>Pilot:</strong> 8');
    expect(html).toContain('<strong>Navigator:</strong> 0');
  });

  it('should show 4 navigators for an atmosphere-support structure', () => {
    const staffWithNavigators = { ...baseStaff, navigator: 4, total: 14 };
    const html = generateShipPrintContent(baseShip, baseMass, baseCost, staffWithNavigators, baseRules);
    expect(html).toContain('<strong>Navigator:</strong> 4');
  });

  it('should show the crew total unmodified', () => {
    const html = generateShipPrintContent(baseShip, baseMass, baseCost, baseStaff, baseRules);
    expect(html).toContain(`Total Crew:</strong> ${baseStaff.total}`);
  });

  it('should show stewards count as-is', () => {
    const staffWithStewards = { ...baseStaff, stewards: 2, total: 12 };
    const html = generateShipPrintContent(baseShip, baseMass, baseCost, staffWithStewards, baseRules);
    expect(html).toContain('<strong>Stewards:</strong> 2');
  });

  it('should show gunners row only when gunners > 0', () => {
    const staffNoGunners = { ...baseStaff, gunners: 0 };
    const staffWithGunners = { ...baseStaff, gunners: 3, total: 13 };
    expect(generateShipPrintContent(baseShip, baseMass, baseCost, staffNoGunners, baseRules)).not.toContain('Gunners');
    expect(generateShipPrintContent(baseShip, baseMass, baseCost, staffWithGunners, baseRules)).toContain('Gunners');
  });

  it('should show medical staff rows only when present', () => {
    const staffWithMedical = { ...baseStaff, nurses: 1, surgeons: 1, techs: 1, total: 13 };
    const html = generateShipPrintContent(baseShip, baseMass, baseCost, staffWithMedical, baseRules);
    expect(html).toContain('Nurses');
    expect(html).toContain('Surgeons');
    expect(html).toContain('Medical Techs');
  });
});
