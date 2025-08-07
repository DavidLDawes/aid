import { describe, it, expect } from '@jest/globals';
import { cleanInvalidCargo } from './constants';
describe('Cargo Cleanup', () => {
    describe('cleanInvalidCargo', () => {
        it('should remove cargo entries with invalid types', () => {
            const cargo = [
                { cargo_type: 'cargo_bay', tonnage: 50, cost: 0 },
                { cargo_type: 'standard', tonnage: 20, cost: 0 }, // Invalid type
                { cargo_type: 'spares', tonnage: 5, cost: 2.5 },
            ];
            const result = cleanInvalidCargo(cargo);
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({ cargo_type: 'cargo_bay', tonnage: 50, cost: 0 });
            expect(result[1]).toEqual({ cargo_type: 'spares', tonnage: 5, cost: 2.5 });
        });
        it('should remove cargo entries with zero tonnage', () => {
            const cargo = [
                { cargo_type: 'cargo_bay', tonnage: 50, cost: 0 },
                { cargo_type: 'spares', tonnage: 0, cost: 0 }, // Zero tonnage
                { cargo_type: 'cold_storage_bay', tonnage: 10, cost: 2 },
            ];
            const result = cleanInvalidCargo(cargo);
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({ cargo_type: 'cargo_bay', tonnage: 50, cost: 0 });
            expect(result[1]).toEqual({ cargo_type: 'cold_storage_bay', tonnage: 10, cost: 2 });
        });
        it('should handle empty cargo array', () => {
            const cargo = [];
            const result = cleanInvalidCargo(cargo);
            expect(result).toEqual([]);
        });
        it('should keep all valid cargo entries with positive tonnage', () => {
            const cargo = [
                { cargo_type: 'cargo_bay', tonnage: 100, cost: 0 },
                { cargo_type: 'spares', tonnage: 2, cost: 1 },
                { cargo_type: 'cold_storage_bay', tonnage: 10, cost: 2 },
                { cargo_type: 'data_storage_bay', tonnage: 5, cost: 1.5 },
                { cargo_type: 'secure_storage_bay', tonnage: 8, cost: 5.6 },
                { cargo_type: 'vacuum_bay', tonnage: 3, cost: 0.6 },
                { cargo_type: 'livestock_bay', tonnage: 15, cost: 30 },
                { cargo_type: 'live_plant_bay', tonnage: 12, cost: 12 },
            ];
            const result = cleanInvalidCargo(cargo);
            expect(result).toEqual(cargo); // Should return unchanged
            expect(result).toHaveLength(8);
        });
        it('should filter out mix of invalid types and zero tonnages', () => {
            const cargo = [
                { cargo_type: 'cargo_bay', tonnage: 44, cost: 0 }, // Valid
                { cargo_type: 'standard', tonnage: 20, cost: 0 }, // Invalid type
                { cargo_type: 'spares', tonnage: 0, cost: 0 }, // Zero tonnage
                { cargo_type: 'invalid_type', tonnage: 10, cost: 1 }, // Invalid type
                { cargo_type: 'cold_storage_bay', tonnage: 5, cost: 1 }, // Valid
            ];
            const result = cleanInvalidCargo(cargo);
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({ cargo_type: 'cargo_bay', tonnage: 44, cost: 0 });
            expect(result[1]).toEqual({ cargo_type: 'cold_storage_bay', tonnage: 5, cost: 1 });
        });
        it('should handle negative tonnage (treat as invalid)', () => {
            const cargo = [
                { cargo_type: 'cargo_bay', tonnage: 50, cost: 0 },
                { cargo_type: 'spares', tonnage: -5, cost: 0 }, // Negative tonnage
            ];
            const result = cleanInvalidCargo(cargo);
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({ cargo_type: 'cargo_bay', tonnage: 50, cost: 0 });
        });
    });
});
