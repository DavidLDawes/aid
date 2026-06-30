import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';
import DronesPanel from './DronesPanel';
import type { Drone } from '../types/ship';

const noOp = jest.fn();

const renderPanel = (drones: Drone[] = []) =>
  render(<DronesPanel drones={drones} onUpdate={noOp} />);

describe('DronesPanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders drone types', () => {
    renderPanel();
    expect(screen.getByText(/War/)).toBeInTheDocument();
    expect(screen.getByText(/Sensor/)).toBeInTheDocument();
  });

  it('+ button adds a new drone type', () => {
    const onUpdate = jest.fn();
    render(<DronesPanel drones={[]} onUpdate={onUpdate} />);
    const plusButtons = screen.getAllByText('+');
    fireEvent.click(plusButtons[0]); // first drone = War
    expect(onUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ drone_type: 'war', quantity: 1 })])
    );
  });

  it('+ button increments existing drone quantity', () => {
    const onUpdate = jest.fn();
    const drones: Drone[] = [{ drone_type: 'war', quantity: 1, mass: 10, cost: 2 }];
    render(<DronesPanel drones={drones} onUpdate={onUpdate} />);
    const plusButtons = screen.getAllByText('+');
    fireEvent.click(plusButtons[0]);
    expect(onUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ drone_type: 'war', quantity: 2 })])
    );
  });

  it('- button decrements drone quantity and removes at 0', () => {
    const onUpdate = jest.fn();
    const drones: Drone[] = [{ drone_type: 'war', quantity: 1, mass: 10, cost: 2 }];
    render(<DronesPanel drones={drones} onUpdate={onUpdate} />);
    const minusButtons = screen.getAllByText('-');
    const enabledMinus = minusButtons.find(btn => !btn.hasAttribute('disabled'));
    fireEvent.click(enabledMinus!);
    expect(onUpdate).toHaveBeenCalledWith([]);
  });

  it('- button disabled when drone quantity is 0', () => {
    renderPanel([]);
    const minusButtons = screen.getAllByText('-');
    minusButtons.forEach(btn => expect(btn).toBeDisabled());
  });

  it('shows quantity for installed drones in summary table', () => {
    const drones: Drone[] = [{ drone_type: 'war', quantity: 3, mass: 10, cost: 2 }];
    renderPanel(drones);
    // The summary table row for War shows quantity=3
    const rows = screen.getAllByRole('row');
    const warRow = rows.find(r => r.textContent?.includes('War'));
    expect(warRow?.textContent).toContain('3');
  });

  it('renders multiple drone rows (at least one row of 3 drones)', () => {
    renderPanel([]);
    const plusButtons = screen.getAllByText('+');
    expect(plusButtons.length).toBeGreaterThanOrEqual(3);
  });

  it('shows drone mass info for each type', () => {
    renderPanel([]);
    // War drone: 10 tons, 2 MCr — direct <p> text, no strong element
    expect(screen.getByText('10 tons, 2 MCr')).toBeInTheDocument();
  });

  it('shows Drone Summary section', () => {
    const drones: Drone[] = [
      { drone_type: 'war', quantity: 2, mass: 10, cost: 2 },
      { drone_type: 'sensor', quantity: 1, mass: 1, cost: 1 }
    ];
    renderPanel(drones);
    expect(screen.getByText('Drone Summary')).toBeInTheDocument();
    // Both drone types appear in the table
    expect(screen.getAllByText('War').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Sensor').length).toBeGreaterThan(0);
  });
});
