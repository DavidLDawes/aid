import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';
import RulesMenu from './RulesMenu';
// Mock ship design factory
const createMockShipDesign = (techLevel) => ({
    ship: {
        name: 'Test Ship',
        tech_level: techLevel,
        tonnage: 200,
        configuration: 'standard',
        fuel_weeks: 2,
        missile_reloads: 0,
        sand_reloads: 0,
        description: 'Test ship'
    },
    engines: [],
    fittings: [],
    weapons: [],
    defenses: [],
    berths: [],
    facilities: [],
    cargo: [],
    vehicles: [],
    drones: []
});
describe('RulesMenu Tech Level Restrictions', () => {
    const mockOnRuleChange = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('Tech Level A-F Ships', () => {
        it('should disable both Antimatter and Longer Jumps for TL A ship', () => {
            const shipDesign = createMockShipDesign('A');
            render(_jsx(RulesMenu, { shipDesign: shipDesign, onRuleChange: mockOnRuleChange }));
            // Click to open menu
            fireEvent.click(screen.getByText('Rules'));
            // Check that both rules are disabled
            const antimatterItem = screen.getByText('Antimatter').closest('button');
            const longerJumpsItem = screen.getByText('Longer Jumps').closest('button');
            expect(antimatterItem?.classList.contains('disabled')).toBe(true);
            expect(longerJumpsItem?.classList.contains('disabled')).toBe(true);
        });
        it('should disable both Antimatter and Longer Jumps for TL F ship', () => {
            const shipDesign = createMockShipDesign('F');
            render(_jsx(RulesMenu, { shipDesign: shipDesign, onRuleChange: mockOnRuleChange }));
            fireEvent.click(screen.getByText('Rules'));
            const antimatterItem = screen.getByText('Antimatter').closest('button');
            const longerJumpsItem = screen.getByText('Longer Jumps').closest('button');
            expect(antimatterItem?.classList.contains('disabled')).toBe(true);
            expect(longerJumpsItem?.classList.contains('disabled')).toBe(true);
        });
        it('should not allow clicking disabled Antimatter rule for TL F ship', () => {
            const shipDesign = createMockShipDesign('F');
            render(_jsx(RulesMenu, { shipDesign: shipDesign, onRuleChange: mockOnRuleChange }));
            fireEvent.click(screen.getByText('Rules'));
            const antimatterItem = screen.getByText('Antimatter').closest('button');
            fireEvent.click(antimatterItem);
            // Should not call onRuleChange for disabled rule
            expect(mockOnRuleChange).not.toHaveBeenCalled();
        });
    });
    describe('Tech Level G Ships', () => {
        it('should enable Longer Jumps but disable Antimatter for TL G ship', () => {
            const shipDesign = createMockShipDesign('G');
            render(_jsx(RulesMenu, { shipDesign: shipDesign, onRuleChange: mockOnRuleChange }));
            fireEvent.click(screen.getByText('Rules'));
            const antimatterItem = screen.getByText('Antimatter').closest('button');
            const longerJumpsItem = screen.getByText('Longer Jumps').closest('button');
            expect(antimatterItem?.classList.contains('disabled')).toBe(true);
            expect(longerJumpsItem?.classList.contains('disabled')).toBe(false);
        });
        it('should allow toggling Longer Jumps for TL G ship', () => {
            const shipDesign = createMockShipDesign('G');
            render(_jsx(RulesMenu, { shipDesign: shipDesign, onRuleChange: mockOnRuleChange }));
            fireEvent.click(screen.getByText('Rules'));
            const longerJumpsItem = screen.getByText('Longer Jumps').closest('button');
            fireEvent.click(longerJumpsItem);
            expect(mockOnRuleChange).toHaveBeenCalledWith('longer_jumps', true);
        });
        it('should not allow toggling Antimatter for TL G ship', () => {
            const shipDesign = createMockShipDesign('G');
            render(_jsx(RulesMenu, { shipDesign: shipDesign, onRuleChange: mockOnRuleChange }));
            fireEvent.click(screen.getByText('Rules'));
            const antimatterItem = screen.getByText('Antimatter').closest('button');
            fireEvent.click(antimatterItem);
            expect(mockOnRuleChange).not.toHaveBeenCalled();
        });
    });
    describe('Tech Level H Ships', () => {
        it('should enable both Antimatter and Longer Jumps for TL H ship', () => {
            const shipDesign = createMockShipDesign('H');
            render(_jsx(RulesMenu, { shipDesign: shipDesign, onRuleChange: mockOnRuleChange }));
            fireEvent.click(screen.getByText('Rules'));
            const antimatterItem = screen.getByText('Antimatter').closest('button');
            const longerJumpsItem = screen.getByText('Longer Jumps').closest('button');
            expect(antimatterItem?.classList.contains('disabled')).toBe(false);
            expect(longerJumpsItem?.classList.contains('disabled')).toBe(false);
        });
        it('should allow toggling Antimatter for TL H ship', () => {
            const shipDesign = createMockShipDesign('H');
            render(_jsx(RulesMenu, { shipDesign: shipDesign, onRuleChange: mockOnRuleChange }));
            fireEvent.click(screen.getByText('Rules'));
            const antimatterItem = screen.getByText('Antimatter').closest('button');
            fireEvent.click(antimatterItem);
            expect(mockOnRuleChange).toHaveBeenCalledWith('antimatter', true);
        });
        it('should allow toggling Longer Jumps for TL H ship', () => {
            const shipDesign = createMockShipDesign('H');
            render(_jsx(RulesMenu, { shipDesign: shipDesign, onRuleChange: mockOnRuleChange }));
            fireEvent.click(screen.getByText('Rules'));
            const longerJumpsItem = screen.getByText('Longer Jumps').closest('button');
            fireEvent.click(longerJumpsItem);
            expect(mockOnRuleChange).toHaveBeenCalledWith('longer_jumps', true);
        });
    });
    describe('Always Available Rules', () => {
        it('should always show Spacecraft Design SRD as enabled', () => {
            const shipDesign = createMockShipDesign('A');
            render(_jsx(RulesMenu, { shipDesign: shipDesign, onRuleChange: mockOnRuleChange }));
            fireEvent.click(screen.getByText('Rules'));
            const srdItem = screen.getByText('Spacecraft Design SRD').closest('button');
            expect(srdItem?.classList.contains('disabled')).toBe(false);
            // Should show green checkmark
            const statusIcon = srdItem?.querySelector('.rule-status.enabled');
            expect(statusIcon).toBeTruthy();
        });
        it('should not allow disabling Spacecraft Design SRD', () => {
            const shipDesign = createMockShipDesign('H');
            render(_jsx(RulesMenu, { shipDesign: shipDesign, onRuleChange: mockOnRuleChange }));
            fireEvent.click(screen.getByText('Rules'));
            const srdItem = screen.getByText('Spacecraft Design SRD').closest('button');
            fireEvent.click(srdItem);
            // Should not call onRuleChange for always-enabled rule
            expect(mockOnRuleChange).not.toHaveBeenCalled();
        });
        it('should always show High Guard Capital Ships as disabled', () => {
            const shipDesign = createMockShipDesign('H');
            render(_jsx(RulesMenu, { shipDesign: shipDesign, onRuleChange: mockOnRuleChange }));
            fireEvent.click(screen.getByText('Rules'));
            const capitalShipsItem = screen.getByText('High Guard Capital Ship Design SRD').closest('button');
            expect(capitalShipsItem?.classList.contains('disabled')).toBe(true);
        });
    });
    describe('Tech Level Change Behavior', () => {
        it('should update rule availability when tech level changes', () => {
            const shipDesign = createMockShipDesign('G');
            const { rerender } = render(_jsx(RulesMenu, { shipDesign: shipDesign, onRuleChange: mockOnRuleChange }));
            fireEvent.click(screen.getByText('Rules'));
            // Initially, Antimatter should be disabled for TL G
            let antimatterItem = screen.getByText('Antimatter').closest('button');
            expect(antimatterItem?.classList.contains('disabled')).toBe(true);
            // Change to TL H
            const newShipDesign = createMockShipDesign('H');
            rerender(_jsx(RulesMenu, { shipDesign: newShipDesign, onRuleChange: mockOnRuleChange }));
            // Now Antimatter should be enabled
            antimatterItem = screen.getByText('Antimatter').closest('button');
            expect(antimatterItem?.classList.contains('disabled')).toBe(false);
        });
        it('should disable rules when tech level drops below requirement', () => {
            const shipDesign = createMockShipDesign('H');
            const { rerender } = render(_jsx(RulesMenu, { shipDesign: shipDesign, onRuleChange: mockOnRuleChange }));
            fireEvent.click(screen.getByText('Rules'));
            // Initially, both should be enabled for TL H
            let antimatterItem = screen.getByText('Antimatter').closest('button');
            let longerJumpsItem = screen.getByText('Longer Jumps').closest('button');
            expect(antimatterItem?.classList.contains('disabled')).toBe(false);
            expect(longerJumpsItem?.classList.contains('disabled')).toBe(false);
            // Change to TL F
            const newShipDesign = createMockShipDesign('F');
            rerender(_jsx(RulesMenu, { shipDesign: newShipDesign, onRuleChange: mockOnRuleChange }));
            // Now both should be disabled
            antimatterItem = screen.getByText('Antimatter').closest('button');
            longerJumpsItem = screen.getByText('Longer Jumps').closest('button');
            expect(antimatterItem?.classList.contains('disabled')).toBe(true);
            expect(longerJumpsItem?.classList.contains('disabled')).toBe(true);
        });
    });
    describe('Visual Indicators', () => {
        it('should show correct status icons for enabled/disabled rules', () => {
            const shipDesign = createMockShipDesign('H');
            render(_jsx(RulesMenu, { shipDesign: shipDesign, onRuleChange: mockOnRuleChange }));
            fireEvent.click(screen.getByText('Rules'));
            // Check Spacecraft Design SRD (always enabled)
            const srdIcon = screen.getByText('Spacecraft Design SRD').closest('button')?.querySelector('.rule-status.enabled');
            expect(srdIcon?.textContent).toBe('✓');
            // Check Antimatter (enabled but not selected)
            const antimatterIcon = screen.getByText('Antimatter').closest('button')?.querySelector('.rule-status.disabled');
            expect(antimatterIcon?.textContent).toBe('✗');
            // Check High Guard Capital Ships (always disabled)
            const capitalShipsIcon = screen.getByText('High Guard Capital Ship Design SRD').closest('button')?.querySelector('.rule-status.disabled');
            expect(capitalShipsIcon?.textContent).toBe('—');
        });
        it('should show tooltip for tech level restricted rules', () => {
            const shipDesign = createMockShipDesign('G');
            render(_jsx(RulesMenu, { shipDesign: shipDesign, onRuleChange: mockOnRuleChange }));
            fireEvent.click(screen.getByText('Rules'));
            // Check that Antimatter has tooltip showing requirement
            const antimatterIcon = screen.getByText('Antimatter').closest('button')?.querySelector('.rule-status.disabled');
            expect(antimatterIcon?.getAttribute('title')).toBe('Requires Tech Level H (current: G)');
        });
    });
});
