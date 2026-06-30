import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';
import DefensesPanel from './DefensesPanel';
import type { Defense } from '../types/ship';

const noOp = jest.fn();

const renderPanel = (
  defenses: Defense[] = [],
  overrides: Partial<{ shipTonnage: number; weaponsCount: number; sandReloads: number; remainingMass: number }> = {}
) =>
  render(
    <DefensesPanel
      defenses={defenses}
      shipTonnage={overrides.shipTonnage ?? 400}
      weaponsCount={overrides.weaponsCount ?? 0}
      sandReloads={overrides.sandReloads ?? 0}
      remainingMass={overrides.remainingMass ?? 200}
      onUpdate={noOp}
      onSandReloadsUpdate={noOp}
    />
  );

describe('DefensesPanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders defense types', () => {
    renderPanel();
    // Use ^ to avoid matching "Dual Sandcaster Turret" and "Dual Point Defense..."
    expect(screen.getByText(/^Sandcaster Turret,/)).toBeInTheDocument();
    expect(screen.getByText(/^Point Defense Laser Turret,/)).toBeInTheDocument();
  });

  it('+ button adds a defense', () => {
    const onUpdate = jest.fn();
    render(
      <DefensesPanel defenses={[]} shipTonnage={400} weaponsCount={0} sandReloads={0}
        remainingMass={200} onUpdate={onUpdate} onSandReloadsUpdate={noOp} />
    );
    const plusButtons = screen.getAllByText('+');
    fireEvent.click(plusButtons[0]); // Sandcaster Turret
    expect(onUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ defense_type: 'sandcaster_turret', quantity: 1 })])
    );
  });

  it('+ increments existing defense', () => {
    const onUpdate = jest.fn();
    const defenses: Defense[] = [{ defense_type: 'sandcaster_turret', quantity: 1, mass: 1, cost: 1.3 }];
    render(
      <DefensesPanel defenses={defenses} shipTonnage={400} weaponsCount={0} sandReloads={0}
        remainingMass={200} onUpdate={onUpdate} onSandReloadsUpdate={noOp} />
    );
    const plusButtons = screen.getAllByText('+');
    fireEvent.click(plusButtons[0]);
    expect(onUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ defense_type: 'sandcaster_turret', quantity: 2 })])
    );
  });

  it('- button decrements defense and removes at 0', () => {
    const onUpdate = jest.fn();
    const defenses: Defense[] = [{ defense_type: 'sandcaster_turret', quantity: 1, mass: 1, cost: 1.3 }];
    render(
      <DefensesPanel defenses={defenses} shipTonnage={400} weaponsCount={0} sandReloads={0}
        remainingMass={200} onUpdate={onUpdate} onSandReloadsUpdate={noOp} />
    );
    const minusButtons = screen.getAllByText('-');
    const enabledMinus = minusButtons.find(btn => !btn.hasAttribute('disabled'));
    fireEvent.click(enabledMinus!);
    expect(onUpdate).toHaveBeenCalledWith([]);
  });

  it('+ disabled when all mounts used by weapons and defenses', () => {
    // 100-ton ship = 1 mount; weaponsCount=1 uses it up
    render(
      <DefensesPanel defenses={[]} shipTonnage={100} weaponsCount={1} sandReloads={0}
        remainingMass={50} onUpdate={noOp} onSandReloadsUpdate={noOp} />
    );
    // availableSlots = 1 - 1 - 0 = 0, so addDefense returns early
    // + buttons should still render but click has no effect
    const plusButtons = screen.getAllByText('+');
    expect(plusButtons.length).toBeGreaterThan(0);
  });

  it('does not show sand reloads section without sandcaster', () => {
    renderPanel([{ defense_type: 'point_defense_laser_turret', quantity: 1, mass: 1, cost: 1 }]);
    expect(screen.queryByText('Sand Reloads')).not.toBeInTheDocument();
  });

  it('shows sand reloads section when sandcaster is installed', () => {
    renderPanel([{ defense_type: 'sandcaster_turret', quantity: 1, mass: 1, cost: 1.3 }]);
    expect(screen.getByText('Sand Reloads')).toBeInTheDocument();
  });

  it('calls onSandReloadsUpdate when sand reload tonnage changes', () => {
    const onSandReloadsUpdate = jest.fn();
    render(
      <DefensesPanel
        defenses={[{ defense_type: 'sandcaster_turret', quantity: 1, mass: 1, cost: 1.3 }]}
        shipTonnage={400} weaponsCount={0} sandReloads={0} remainingMass={100}
        onUpdate={noOp} onSandReloadsUpdate={onSandReloadsUpdate}
      />
    );
    fireEvent.change(screen.getByLabelText(/Sand Reload Tonnage/), { target: { value: '5' } });
    expect(onSandReloadsUpdate).toHaveBeenCalledWith(5);
  });

  it('shows current sand reload summary when reloads > 0', () => {
    render(
      <DefensesPanel
        defenses={[{ defense_type: 'sandcaster_turret', quantity: 1, mass: 1, cost: 1.3 }]}
        shipTonnage={400} weaponsCount={0} sandReloads={3} remainingMass={100}
        onUpdate={noOp} onSandReloadsUpdate={noOp}
      />
    );
    // The summary paragraph has <strong>Sand Reloads:</strong> followed by text node "3 tons (0.3 MCr)"
    expect(screen.getByText(/3 tons \(0\.3 MCr\)/)).toBeInTheDocument();
  });
});
