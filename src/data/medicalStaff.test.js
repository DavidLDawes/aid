import { describe, it, expect } from '@jest/globals';
import { calculateMedicalStaff } from './constants';
describe('calculateMedicalStaff', () => {
    it('returns zero staff with no facilities', () => {
        expect(calculateMedicalStaff([])).toEqual({ nurses: 0, surgeons: 0, techs: 0 });
    });
    it('returns zero staff for non-medical facilities', () => {
        const facilities = [
            { facility_type: 'gym', quantity: 1 },
            { facility_type: 'commissary', quantity: 1 },
        ];
        expect(calculateMedicalStaff(facilities)).toEqual({ nurses: 0, surgeons: 0, techs: 0 });
    });
    it('counts one nurse per medical_bay', () => {
        const facilities = [{ facility_type: 'medical_bay', quantity: 1 }];
        expect(calculateMedicalStaff(facilities)).toEqual({ nurses: 1, surgeons: 0, techs: 0 });
    });
    it('counts multiple nurses for multiple medical_bays', () => {
        const facilities = [{ facility_type: 'medical_bay', quantity: 3 }];
        expect(calculateMedicalStaff(facilities)).toEqual({ nurses: 3, surgeons: 0, techs: 0 });
    });
    it('counts surgeon, tech, and nurse per surgical_bay', () => {
        const facilities = [{ facility_type: 'surgical_bay', quantity: 1 }];
        expect(calculateMedicalStaff(facilities)).toEqual({ nurses: 1, surgeons: 1, techs: 1 });
    });
    it('scales all surgical_bay staff with quantity', () => {
        const facilities = [{ facility_type: 'surgical_bay', quantity: 2 }];
        expect(calculateMedicalStaff(facilities)).toEqual({ nurses: 2, surgeons: 2, techs: 2 });
    });
    it('accumulates nurses from both medical_bay and surgical_bay', () => {
        const facilities = [
            { facility_type: 'medical_bay', quantity: 2 },
            { facility_type: 'surgical_bay', quantity: 1 },
        ];
        // 2 nurses from medical_bay + 1 nurse from surgical_bay = 3 nurses
        expect(calculateMedicalStaff(facilities)).toEqual({ nurses: 3, surgeons: 1, techs: 1 });
    });
    it('does not count the old stale type names med_bay or surgical_ward', () => {
        const facilities = [
            { facility_type: 'med_bay', quantity: 1 },
            { facility_type: 'surgical_ward', quantity: 1 },
        ];
        expect(calculateMedicalStaff(facilities)).toEqual({ nurses: 0, surgeons: 0, techs: 0 });
    });
});
