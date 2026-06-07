import { describe, it, expect } from '@jest/globals';
import { generateShipPrintContent } from './printContent';
import type { ShipDesign, MassCalculation, CostCalculation, StaffRequirements } from '../types/ship';

const baseMass: MassCalculation = { total: 200, used: 120, remaining: 80, isOverweight: false };
const baseCost: CostCalculation = { total: 45.5 };
const baseStaff: StaffRequirements = {
  pilot: 1, navigator: 1, engineers: 2, gunners: 0,
  service: 0, stewards: 0, nurses: 0, surgeons: 0, techs: 0, total: 4,
};
const baseRules = new Set(['spacecraft_design_srd']);

const baseShip: ShipDesign = {
  ship: {
    name: 'Test Trader',
    tech_level: 'B',
    tonnage: 200,
    configuration: 'standard',
    fuel_weeks: 2,
    missile_reloads: 0,
    sand_reloads: 0,
    description: '',
  },
  engines: [
    { engine_type: 'power_plant', drive_code: 'A', performance: 1, mass: 2, cost: 4 },
    { engine_type: 'jump_drive', drive_code: 'A', performance: 1, mass: 10, cost: 10 },
    { engine_type: 'maneuver_drive', drive_code: 'A', performance: 1, mass: 2, cost: 8 },
  ],
  fittings: [
    { fitting_type: 'bridge', mass: 10, cost: 5 },
    { fitting_type: 'comms_sensors', comms_sensors_type: 'standard', mass: 0, cost: 0 },
  ],
  weapons: [],
  defenses: [],
  berths: [],
  facilities: [],
  cargo: [],
  vehicles: [],
  drones: [],
  custom_items: [],
};

describe('generateShipPrintContent', () => {
  it('should return a valid HTML document', () => {
    const html = generateShipPrintContent(baseShip, baseMass, baseCost, baseStaff, false, false, baseRules);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html>');
    expect(html).toContain('</html>');
    expect(html).toContain('<table>');
    expect(html).toContain('</table>');
  });

  it('should include the ship name in the title and header', () => {
    const html = generateShipPrintContent(baseShip, baseMass, baseCost, baseStaff, false, false, baseRules);
    expect(html).toContain('Test Trader');
  });

  it('should include tonnage and tech level in the title', () => {
    const html = generateShipPrintContent(baseShip, baseMass, baseCost, baseStaff, false, false, baseRules);
    expect(html).toContain('200 tons');
    expect(html).toContain('Tech Level B');
  });

  it('should escape HTML special characters in ship name', () => {
    const xssShip = {
      ...baseShip,
      ship: { ...baseShip.ship, name: '<script>alert("xss")</script>' },
    };
    const html = generateShipPrintContent(xssShip, baseMass, baseCost, baseStaff, false, false, baseRules);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('should escape ampersands and quotes in ship name', () => {
    const ship = { ...baseShip, ship: { ...baseShip.ship, name: 'A & B "Trader"' } };
    const html = generateShipPrintContent(ship, baseMass, baseCost, baseStaff, false, false, baseRules);
    expect(html).toContain('A &amp; B &quot;Trader&quot;');
  });

  it('should include engine rows', () => {
    const html = generateShipPrintContent(baseShip, baseMass, baseCost, baseStaff, false, false, baseRules);
    expect(html).toContain('Power Plant');
    expect(html).toContain('Jump Drive');
    expect(html).toContain('Maneuver Drive');
    expect(html).toContain('Engines');
  });

  it('should omit M-0 maneuver drive', () => {
    const ship = {
      ...baseShip,
      engines: [
        { engine_type: 'power_plant' as const, drive_code: 'A', performance: 1, mass: 2, cost: 4 },
        { engine_type: 'jump_drive' as const, drive_code: 'A', performance: 1, mass: 10, cost: 10 },
        { engine_type: 'maneuver_drive' as const, drive_code: 'A', performance: 0, mass: 0, cost: 0 },
      ],
    };
    const html = generateShipPrintContent(ship, baseMass, baseCost, baseStaff, false, false, baseRules);
    expect(html).not.toContain('M-0');
  });

  it('should include fittings section', () => {
    const html = generateShipPrintContent(baseShip, baseMass, baseCost, baseStaff, false, false, baseRules);
    expect(html).toContain('Bridge');
    expect(html).toContain('Fittings');
  });

  it('should include half bridge label when applicable', () => {
    const ship = {
      ...baseShip,
      fittings: [{ fitting_type: 'half_bridge' as const, mass: 5, cost: 7.5 }],
    };
    const html = generateShipPrintContent(ship, baseMass, baseCost, baseStaff, false, false, baseRules);
    expect(html).toContain('Half Bridge');
  });

  it('should include weapons when present', () => {
    const ship = {
      ...baseShip,
      weapons: [{ weapon_name: 'Laser Turret', mass: 1, cost: 0.5, quantity: 2 }],
    };
    const html = generateShipPrintContent(ship, baseMass, baseCost, baseStaff, false, false, baseRules);
    expect(html).toContain('Weapons');
    expect(html).toContain('Laser Turret');
    expect(html).toContain('x2');
  });

  it('should include defenses when present', () => {
    const ship = {
      ...baseShip,
      defenses: [{ defense_type: 'sandcaster_turret' as const, mass: 1, cost: 0.5, quantity: 1 }],
    };
    const html = generateShipPrintContent(ship, baseMass, baseCost, baseStaff, false, false, baseRules);
    expect(html).toContain('Defenses');
    expect(html).toContain('Sandcaster');
  });

  it('should include sand reloads in defenses', () => {
    const ship = { ...baseShip, ship: { ...baseShip.ship, sand_reloads: 5 } };
    const html = generateShipPrintContent(ship, baseMass, baseCost, baseStaff, false, false, baseRules);
    expect(html).toContain('Sand');
  });

  it('should include berths when present', () => {
    const ship = {
      ...baseShip,
      berths: [{ berth_type: 'staterooms' as const, quantity: 4, mass: 16, cost: 2 }],
    };
    const html = generateShipPrintContent(ship, baseMass, baseCost, baseStaff, false, false, baseRules);
    expect(html).toContain('Berths');
    expect(html).toContain('x4');
  });

  it('should include facilities when present', () => {
    const ship = {
      ...baseShip,
      facilities: [{ facility_type: 'commissary' as const, quantity: 1, mass: 2, cost: 0.5 }],
    };
    const html = generateShipPrintContent(ship, baseMass, baseCost, baseStaff, false, false, baseRules);
    expect(html).toContain('Rec/Health');
    expect(html).toContain('Commissary');
  });

  it('should include cargo when present', () => {
    const ship = {
      ...baseShip,
      cargo: [{ cargo_type: 'cargo_bay' as const, tonnage: 40, cost: 0 }],
    };
    const html = generateShipPrintContent(ship, baseMass, baseCost, baseStaff, false, false, baseRules);
    expect(html).toContain('Cargo');
    expect(html).toContain('Cargo Bay');
  });

  it('should include vehicles when present', () => {
    const ship = {
      ...baseShip,
      vehicles: [{ vehicle_type: 'atv_wheeled' as const, quantity: 1, mass: 10, cost: 0.05 }],
    };
    const html = generateShipPrintContent(ship, baseMass, baseCost, baseStaff, false, false, baseRules);
    expect(html).toContain('Vehicles');
  });

  it('should include drones when present', () => {
    const ship = {
      ...baseShip,
      drones: [{ drone_type: 'repair' as const, quantity: 2, mass: 2, cost: 0.5 }],
    };
    const html = generateShipPrintContent(ship, baseMass, baseCost, baseStaff, false, false, baseRules);
    expect(html).toContain('Drones');
  });

  it('should include totals row', () => {
    const html = generateShipPrintContent(baseShip, baseMass, baseCost, baseStaff, false, false, baseRules);
    expect(html).toContain('Total');
    expect(html).toContain('120.0 tons');
    expect(html).toContain('45.50 MCr');
  });

  it('should show separate Pilot and Navigator by default', () => {
    const html = generateShipPrintContent(baseShip, baseMass, baseCost, baseStaff, false, false, baseRules);
    expect(html).toContain('<strong>Pilot:</strong>');
    expect(html).toContain('<strong>Navigator:</strong>');
    expect(html).not.toContain('Pilot/Navigator');
  });

  it('should combine Pilot/Navigator when combinePilotNavigator is true', () => {
    const html = generateShipPrintContent(baseShip, baseMass, baseCost, baseStaff, true, false, baseRules);
    expect(html).toContain('<strong>Pilot/Navigator:</strong>');
    expect(html).not.toContain('<strong>Pilot:</strong>');
  });

  it('should reduce total crew by 1 when combinePilotNavigator is true', () => {
    const htmlCombined = generateShipPrintContent(baseShip, baseMass, baseCost, baseStaff, true, false, baseRules);
    const htmlSeparate = generateShipPrintContent(baseShip, baseMass, baseCost, baseStaff, false, false, baseRules);
    expect(htmlCombined).toContain(`Total Crew:</strong> ${baseStaff.total - 1}`);
    expect(htmlSeparate).toContain(`Total Crew:</strong> ${baseStaff.total}`);
  });

  it('should show stewards count as 0 when noStewards is true', () => {
    const staffWithStewards = { ...baseStaff, stewards: 2, total: 6 };
    const htmlWithStewards = generateShipPrintContent(baseShip, baseMass, baseCost, staffWithStewards, false, false, baseRules);
    const htmlNoStewards = generateShipPrintContent(baseShip, baseMass, baseCost, staffWithStewards, false, true, baseRules);
    expect(htmlWithStewards).toContain('<strong>Stewards:</strong> 2');
    expect(htmlNoStewards).toContain('<strong>Stewards:</strong> 0');
  });

  it('should show gunners row only when gunners > 0', () => {
    const staffNoGunners = { ...baseStaff, gunners: 0 };
    const staffWithGunners = { ...baseStaff, gunners: 3, total: 7 };
    expect(generateShipPrintContent(baseShip, baseMass, baseCost, staffNoGunners, false, false, baseRules)).not.toContain('Gunners');
    expect(generateShipPrintContent(baseShip, baseMass, baseCost, staffWithGunners, false, false, baseRules)).toContain('Gunners');
  });

  it('should show medical staff rows only when present', () => {
    const staffWithMedical = { ...baseStaff, nurses: 1, surgeons: 1, techs: 1, total: 7 };
    const html = generateShipPrintContent(baseShip, baseMass, baseCost, staffWithMedical, false, false, baseRules);
    expect(html).toContain('Nurses');
    expect(html).toContain('Surgeons');
    expect(html).toContain('Medical Techs');
  });
});
