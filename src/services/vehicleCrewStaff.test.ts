import { describe, it, expect } from '@jest/globals';
import { calculateVehicleCrewStaff } from '../data/constants';

describe('Vehicle Crew Staff Calculations', () => {
  it('should require no crew for 0 vehicles', () => {
    const vehicles: { vehicle_type: string; quantity: number }[] = [];
    expect(calculateVehicleCrewStaff(vehicles)).toEqual({ pilot: 0, gunner: 0, engineer: 0 });
  });

  it('should require no crew add-on for a non-combat vehicle', () => {
    const vehicles = [{ vehicle_type: 'honey_badger_off_roader', quantity: 3 }];
    expect(calculateVehicleCrewStaff(vehicles)).toEqual({ pilot: 0, gunner: 0, engineer: 0 });
  });

  describe('Fighters', () => {
    it('Light Fighter: 1 pilot per unit, no gunner or engineer', () => {
      const vehicles = [{ vehicle_type: 'light_fighter', quantity: 2 }];
      expect(calculateVehicleCrewStaff(vehicles)).toEqual({ pilot: 2, gunner: 0, engineer: 0 });
    });

    it('Medium Fighter: 1 pilot and 1 gunner per unit, no engineer', () => {
      const vehicles = [{ vehicle_type: 'medium_fighter', quantity: 3 }];
      expect(calculateVehicleCrewStaff(vehicles)).toEqual({ pilot: 3, gunner: 3, engineer: 0 });
    });

    it('Heavy Fighter: 1 pilot, 1 gunner, and 1 engineer per unit', () => {
      const vehicles = [{ vehicle_type: 'heavy_fighter', quantity: 2 }];
      expect(calculateVehicleCrewStaff(vehicles)).toEqual({ pilot: 2, gunner: 2, engineer: 2 });
    });

    it('mixed fighter squadron sums correctly', () => {
      const vehicles = [
        { vehicle_type: 'light_fighter', quantity: 2 },
        { vehicle_type: 'medium_fighter', quantity: 1 },
        { vehicle_type: 'heavy_fighter', quantity: 1 }
      ];
      // pilots: 2 + 1 + 1 = 4; gunners: 1 (medium) + 1 (heavy) = 2; engineers: 1 (heavy)
      expect(calculateVehicleCrewStaff(vehicles)).toEqual({ pilot: 4, gunner: 2, engineer: 1 });
    });
  });

  describe('Shuttles', () => {
    it('1 pilot per shuttle, no gunner or engineer', () => {
      const vehicles = [{ vehicle_type: 'shuttle', quantity: 4 }];
      expect(calculateVehicleCrewStaff(vehicles)).toEqual({ pilot: 4, gunner: 0, engineer: 0 });
    });

    it('Modular Cutter is not a shuttle and gets no crew add-on', () => {
      const vehicles = [{ vehicle_type: 'modular_cutter', quantity: 2 }];
      expect(calculateVehicleCrewStaff(vehicles)).toEqual({ pilot: 0, gunner: 0, engineer: 0 });
    });
  });

  describe('Military vehicles', () => {
    it('Iderati AFV (10 tons): 1 pilot + 1 gunner per unit (>5, not >30)', () => {
      const vehicles = [{ vehicle_type: 'iderati_afv', quantity: 2 }];
      expect(calculateVehicleCrewStaff(vehicles)).toEqual({ pilot: 2, gunner: 2, engineer: 0 });
    });

    it('Armored Fighting Vehicle (10 tons): 1 pilot + 1 gunner per unit', () => {
      const vehicles = [{ vehicle_type: 'armored_fighting_vehicle', quantity: 1 }];
      expect(calculateVehicleCrewStaff(vehicles)).toEqual({ pilot: 1, gunner: 1, engineer: 0 });
    });

    it('Fire Scorpion Quad Walker (65 tons): 1 pilot + 2 gunners per unit (>30)', () => {
      const vehicles = [{ vehicle_type: 'fire_scorpion_walker', quantity: 1 }];
      expect(calculateVehicleCrewStaff(vehicles)).toEqual({ pilot: 1, gunner: 2, engineer: 0 });
    });

    it('Awesome AWS-8Q Walker (80 tons): 1 pilot + 2 gunners per unit (>30)', () => {
      const vehicles = [{ vehicle_type: 'awesome_walker', quantity: 1 }];
      expect(calculateVehicleCrewStaff(vehicles)).toEqual({ pilot: 1, gunner: 2, engineer: 0 });
    });

    it('Fury Helicopter Gunship (8 tons): 1 pilot + 1 gunner per unit (>5, not >30)', () => {
      const vehicles = [{ vehicle_type: 'fury_helicopter_gunship', quantity: 1 }];
      expect(calculateVehicleCrewStaff(vehicles)).toEqual({ pilot: 1, gunner: 1, engineer: 0 });
    });

    it('22 ton AAT Infantry Support Vehicle (22 tons): 1 pilot + 1 gunner per unit', () => {
      const vehicles = [{ vehicle_type: 'aat_infantry_support', quantity: 1 }];
      expect(calculateVehicleCrewStaff(vehicles)).toEqual({ pilot: 1, gunner: 1, engineer: 0 });
    });

    it('quantities multiply through correctly', () => {
      const vehicles = [{ vehicle_type: 'fire_scorpion_walker', quantity: 3 }];
      expect(calculateVehicleCrewStaff(vehicles)).toEqual({ pilot: 3, gunner: 6, engineer: 0 });
    });
  });

  it('mixed scenario across fighters, shuttles, and military vehicles', () => {
    const vehicles = [
      { vehicle_type: 'heavy_fighter', quantity: 1 },       // pilot 1, gunner 1, engineer 1
      { vehicle_type: 'shuttle', quantity: 2 },              // pilot 2
      { vehicle_type: 'iderati_afv', quantity: 1 },           // pilot 1, gunner 1
      { vehicle_type: 'fire_scorpion_walker', quantity: 1 },  // pilot 1, gunner 2
      { vehicle_type: 'honey_badger_off_roader', quantity: 5 } // nothing
    ];
    expect(calculateVehicleCrewStaff(vehicles)).toEqual({ pilot: 5, gunner: 4, engineer: 1 });
  });
});
