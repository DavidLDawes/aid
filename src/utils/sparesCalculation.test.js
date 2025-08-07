import { describe, it, expect } from '@jest/globals';
import { calculateMonthsBetweenService, getSparesIncrement, getSparesPercentage } from './sparesCalculation';
describe('Spares Calculation Utils', () => {
    describe('calculateMonthsBetweenService', () => {
        it('should return 1 month with no spares', () => {
            expect(calculateMonthsBetweenService(0, 400)).toBe(1);
        });
        it('should return 2 months with 1% spares (4 tons on 400 ton ship)', () => {
            expect(calculateMonthsBetweenService(4, 400)).toBe(2);
        });
        it('should return 3 months with 2% spares (8 tons on 400 ton ship)', () => {
            expect(calculateMonthsBetweenService(8, 400)).toBe(3);
        });
        it('should round down partial percentages', () => {
            expect(calculateMonthsBetweenService(3, 400)).toBe(1); // 0.75% rounds down
        });
        it('should handle larger percentages correctly', () => {
            expect(calculateMonthsBetweenService(40, 400)).toBe(11); // 10% = 1 + 10
        });
        it('should handle different ship sizes', () => {
            expect(calculateMonthsBetweenService(2, 200)).toBe(2); // 1% on 200 ton ship
            expect(calculateMonthsBetweenService(10, 1000)).toBe(2); // 1% on 1000 ton ship
        });
    });
    describe('getSparesIncrement', () => {
        it('should return 4 tons increment from 0 spares on 400 ton ship', () => {
            expect(getSparesIncrement(0, 400)).toBe(4);
        });
        it('should return 4 tons increment from 4 spares on 400 ton ship', () => {
            expect(getSparesIncrement(4, 400)).toBe(4);
        });
        it('should return 1 ton increment from 3 spares on 400 ton ship', () => {
            expect(getSparesIncrement(3, 400)).toBe(1); // Need 4 total, have 3
        });
        it('should handle different ship sizes', () => {
            expect(getSparesIncrement(0, 200)).toBe(2); // 1% of 200 tons
            expect(getSparesIncrement(0, 1000)).toBe(10); // 1% of 1000 tons
        });
        it('should always return at least 1', () => {
            expect(getSparesIncrement(0, 50)).toBe(1); // Even if 1% < 1 ton
        });
    });
    describe('getSparesPercentage', () => {
        it('should calculate correct percentage', () => {
            expect(getSparesPercentage(4, 400)).toBe(1);
            expect(getSparesPercentage(8, 400)).toBe(2);
            expect(getSparesPercentage(40, 400)).toBe(10);
        });
        it('should handle zero spares', () => {
            expect(getSparesPercentage(0, 400)).toBe(0);
        });
        it('should handle fractional percentages', () => {
            expect(getSparesPercentage(3, 400)).toBe(0.75);
        });
    });
    describe('Integration tests', () => {
        it('should maintain consistency between months and increments', () => {
            const shipTonnage = 400;
            let spares = 0;
            // Start with 0 spares (1 month)
            expect(calculateMonthsBetweenService(spares, shipTonnage)).toBe(1);
            // Add increment to get to 2 months
            const increment1 = getSparesIncrement(spares, shipTonnage);
            spares += increment1;
            expect(calculateMonthsBetweenService(spares, shipTonnage)).toBe(2);
            // Add increment to get to 3 months
            const increment2 = getSparesIncrement(spares, shipTonnage);
            spares += increment2;
            expect(calculateMonthsBetweenService(spares, shipTonnage)).toBe(3);
        });
    });
});
