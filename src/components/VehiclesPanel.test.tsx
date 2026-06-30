import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';
import VehiclesPanel from './VehiclesPanel';
import type { Vehicle } from '../types/ship';

const noOp = jest.fn();

const renderPanel = (vehicles: Vehicle[] = [], shipTechLevel = 'A') =>
  render(<VehiclesPanel vehicles={vehicles} shipTechLevel={shipTechLevel} onUpdate={noOp} />);

describe('VehiclesPanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders panel heading', () => {
    renderPanel();
    expect(screen.getByText(/Vehicles/)).toBeInTheDocument();
  });

  it('shows vehicles available at TL A (10)', () => {
    renderPanel([], 'A');
    // Open Top Air/Raft has techLevel 8 → available at TL A
    expect(screen.getByText(/Open Top Air\/Raft/)).toBeInTheDocument();
  });

  it('shows high-TL vehicles only at appropriate tech level', () => {
    // Air/Raft Truck has techLevel 12 → not available at TL A (10)
    renderPanel([], 'A');
    expect(screen.queryByText(/Air\/Raft Truck/)).not.toBeInTheDocument();
  });

  it('shows Air/Raft Truck at TL C (12)', () => {
    renderPanel([], 'C');
    expect(screen.getByText(/Air\/Raft Truck/)).toBeInTheDocument();
  });

  it('+ button adds a vehicle', () => {
    const onUpdate = jest.fn();
    render(<VehiclesPanel vehicles={[]} shipTechLevel="A" onUpdate={onUpdate} />);
    const plusButtons = screen.getAllByText('+');
    fireEvent.click(plusButtons[0]); // first available vehicle at TL A
    expect(onUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ quantity: 1 })])
    );
  });

  it('+ button increments existing vehicle quantity', () => {
    const onUpdate = jest.fn();
    const vehicles: Vehicle[] = [{ vehicle_type: 'open_top_air_raft', quantity: 1, mass: 4, cost: 0.045 }];
    render(<VehiclesPanel vehicles={vehicles} shipTechLevel="A" onUpdate={onUpdate} />);
    const plusButtons = screen.getAllByText('+');
    // Find + for open_top_air_raft (which is first available at TL A)
    fireEvent.click(plusButtons[0]);
    expect(onUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ vehicle_type: 'open_top_air_raft', quantity: 2 })])
    );
  });

  it('- button decrements vehicle and removes at 0', () => {
    const onUpdate = jest.fn();
    const vehicles: Vehicle[] = [{ vehicle_type: 'open_top_air_raft', quantity: 1, mass: 4, cost: 0.045 }];
    render(<VehiclesPanel vehicles={vehicles} shipTechLevel="A" onUpdate={onUpdate} />);
    const minusButtons = screen.getAllByText('-');
    const enabledMinus = minusButtons.find(btn => !btn.hasAttribute('disabled'));
    fireEvent.click(enabledMinus!);
    const result = onUpdate.mock.calls[0][0] as Vehicle[];
    expect(result.some(v => v.vehicle_type === 'open_top_air_raft')).toBe(false);
  });

  it('- button disabled when vehicle quantity is 0', () => {
    renderPanel([]);
    const minusButtons = screen.getAllByText('-');
    minusButtons.forEach(btn => expect(btn).toBeDisabled());
  });

  it('shows service staff count when vehicles with serviceStaff > 0 are present', () => {
    // Air/Raft Truck has serviceStaff: 1, available at TL C
    const vehicles: Vehicle[] = [{ vehicle_type: 'air_raft_truck', quantity: 1, mass: 5, cost: 0.55 }];
    const { container } = render(<VehiclesPanel vehicles={vehicles} shipTechLevel="C" onUpdate={noOp} />);
    // <p><strong>Total Service Staff Required:</strong> 1</p>
    expect(container.textContent).toMatch(/Total Service Staff Required:.*1/);
  });

  it('shows 0 service staff when no vehicles present', () => {
    const { container } = renderPanel([]);
    expect(container.textContent).toMatch(/Total Service Staff Required:.*0/);
  });
});
