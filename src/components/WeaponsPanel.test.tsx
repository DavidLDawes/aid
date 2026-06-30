import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';
import WeaponsPanel from './WeaponsPanel';
import type { Weapon } from '../types/ship';

const noOp = jest.fn();

const renderPanel = (
  weapons: Weapon[] = [],
  overrides: Partial<{ shipTonnage: number; missileReloads: number; remainingMass: number }> = {}
) =>
  render(
    <WeaponsPanel
      weapons={weapons}
      shipTonnage={overrides.shipTonnage ?? 400}
      missileReloads={overrides.missileReloads ?? 0}
      remainingMass={overrides.remainingMass ?? 200}
      onUpdate={noOp}
      onMissileReloadsUpdate={noOp}
    />
  );

describe('WeaponsPanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows mount limit info', () => {
    renderPanel([], { shipTonnage: 400 });
    // 400-ton ship → 4 mounts
    expect(screen.getByText(/Available weapon mounts: 4/)).toBeInTheDocument();
  });

  it('shows correct used/remaining mounts', () => {
    const weapons: Weapon[] = [{ weapon_name: 'Pulse Laser Turret', mass: 2, cost: 1.5, quantity: 2 }];
    renderPanel(weapons, { shipTonnage: 400 });
    expect(screen.getByText(/Used: 2.*Remaining: 2/)).toBeInTheDocument();
  });

  it('adds a new weapon type on + click', () => {
    const onUpdate = jest.fn();
    render(
      <WeaponsPanel weapons={[]} shipTonnage={400} missileReloads={0} remainingMass={200}
        onUpdate={onUpdate} onMissileReloadsUpdate={noOp} />
    );
    const plusButtons = screen.getAllByText('+');
    fireEvent.click(plusButtons[0]); // first weapon type (Pulse Laser Turret)
    expect(onUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ weapon_name: 'Pulse Laser Turret', quantity: 1 })])
    );
  });

  it('increments quantity when adding an existing weapon type', () => {
    const onUpdate = jest.fn();
    const weapons: Weapon[] = [{ weapon_name: 'Pulse Laser Turret', mass: 2, cost: 1.5, quantity: 1 }];
    render(
      <WeaponsPanel weapons={weapons} shipTonnage={400} missileReloads={0} remainingMass={200}
        onUpdate={onUpdate} onMissileReloadsUpdate={noOp} />
    );
    const plusButtons = screen.getAllByText('+');
    fireEvent.click(plusButtons[0]);
    expect(onUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ weapon_name: 'Pulse Laser Turret', quantity: 2 })])
    );
  });

  it('decrements weapon quantity on - click and removes at 0', () => {
    const onUpdate = jest.fn();
    const weapons: Weapon[] = [{ weapon_name: 'Pulse Laser Turret', mass: 2, cost: 1.5, quantity: 1 }];
    render(
      <WeaponsPanel weapons={weapons} shipTonnage={400} missileReloads={0} remainingMass={200}
        onUpdate={onUpdate} onMissileReloadsUpdate={noOp} />
    );
    const minusButtons = screen.getAllByText('-');
    fireEvent.click(minusButtons[0]);
    // quantity goes to 0, filter removes it
    expect(onUpdate).toHaveBeenCalledWith([]);
  });

  it('disables + when mount limit reached', () => {
    // 100-ton ship = 1 mount; already 1 used
    const weapons: Weapon[] = [{ weapon_name: 'Pulse Laser Turret', mass: 2, cost: 1.5, quantity: 1 }];
    renderPanel(weapons, { shipTonnage: 100 });
    const plusButtons = screen.getAllByText('+');
    plusButtons.forEach(btn => expect(btn).toBeDisabled());
  });

  it('does not show missile reloads section without missile launcher', () => {
    renderPanel([]);
    expect(screen.queryByText('Missile Reloads')).not.toBeInTheDocument();
  });

  it('shows missile reloads section when missile launcher is installed', () => {
    const weapons: Weapon[] = [{ weapon_name: 'Missile Launcher Turret', mass: 1, cost: 1.8, quantity: 1 }];
    renderPanel(weapons);
    expect(screen.getByText('Missile Reloads')).toBeInTheDocument();
    expect(screen.getByLabelText('Missile Reload Tonnage')).toBeInTheDocument();
  });

  it('calls onMissileReloadsUpdate when reload tonnage changes', () => {
    const onMissileReloadsUpdate = jest.fn();
    const weapons: Weapon[] = [{ weapon_name: 'Missile Launcher Turret', mass: 1, cost: 1.8, quantity: 1 }];
    render(
      <WeaponsPanel weapons={weapons} shipTonnage={400} missileReloads={0} remainingMass={200}
        onUpdate={noOp} onMissileReloadsUpdate={onMissileReloadsUpdate} />
    );
    fireEvent.change(screen.getByLabelText('Missile Reload Tonnage'), { target: { value: '5' } });
    expect(onMissileReloadsUpdate).toHaveBeenCalledWith(5);
  });

  it('shows current missile reload tonnage and cost summary', () => {
    const weapons: Weapon[] = [{ weapon_name: 'Missile Launcher Turret', mass: 1, cost: 1.8, quantity: 1 }];
    renderPanel(weapons, { missileReloads: 3 });
    // The summary paragraph combines strong + text nodes; match on the text node content
    expect(screen.getByText(/3 tons \(3 MCr\)/)).toBeInTheDocument();
  });

  it('- button is disabled when weapon quantity is 0', () => {
    renderPanel([]); // no weapons, all quantities = 0
    const minusButtons = screen.getAllByText('-');
    minusButtons.forEach(btn => expect(btn).toBeDisabled());
  });
});
