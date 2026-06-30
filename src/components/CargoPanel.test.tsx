import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';
import CargoPanel from './CargoPanel';
import type { Cargo } from '../types/ship';

const noOp = jest.fn();

const renderPanel = (cargo: Cargo[] = [], remainingMass = 200, shipTonnage = 400) =>
  render(<CargoPanel cargo={cargo} remainingMass={remainingMass} shipTonnage={shipTonnage} onUpdate={noOp} />);

describe('CargoPanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows remaining mass', () => {
    renderPanel([], 150);
    expect(screen.getByText(/Remaining mass: 150.0 tons/)).toBeInTheDocument();
  });

  it('shows total cargo tonnage', () => {
    const cargo: Cargo[] = [{ cargo_type: 'cargo_bay', tonnage: 30, cost: 0 }];
    renderPanel(cargo);
    expect(screen.getByText(/Total cargo: 30 tons/)).toBeInTheDocument();
  });

  it('renders Cargo Bay tonnage input defaulting to 0', () => {
    renderPanel([]);
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs[0]).toHaveValue(0); // first tonnage input = Cargo Bay
  });

  it('changing Cargo Bay tonnage input calls onUpdate', () => {
    const onUpdate = jest.fn();
    render(<CargoPanel cargo={[]} remainingMass={200} shipTonnage={400} onUpdate={onUpdate} />);
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '50' } });
    expect(onUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ cargo_type: 'cargo_bay', tonnage: 50 })])
    );
  });

  it('shows existing cargo bay tonnage in input', () => {
    const cargo: Cargo[] = [{ cargo_type: 'cargo_bay', tonnage: 40, cost: 0 }];
    renderPanel(cargo);
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs[0]).toHaveValue(40);
  });

  it('shows Spares with +/- buttons', () => {
    renderPanel([]);
    expect(screen.getByText('Spares')).toBeInTheDocument();
    const plusButtons = screen.getAllByText('+');
    expect(plusButtons.length).toBeGreaterThan(0);
  });

  it('+ button on Spares increases tonnage by increment', () => {
    const onUpdate = jest.fn();
    render(<CargoPanel cargo={[]} remainingMass={200} shipTonnage={400} onUpdate={onUpdate} />);
    // Spares increment for 0 tons on 400-ton ship → should be some positive increment
    const plusButtons = screen.getAllByText('+');
    // Find the enabled one
    const enabledPlus = plusButtons.find(btn => !btn.hasAttribute('disabled'));
    fireEvent.click(enabledPlus!);
    expect(onUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ cargo_type: 'spares' })])
    );
  });

  it('- button on Spares disabled when tonnage is 0', () => {
    renderPanel([]);
    const minusButtons = screen.getAllByText('-');
    // All minus buttons should be disabled (no spares)
    const disabledMinus = minusButtons.filter(btn => btn.hasAttribute('disabled'));
    expect(disabledMinus.length).toBeGreaterThan(0);
  });

  it('- button on Spares decreases tonnage', () => {
    const onUpdate = jest.fn();
    const cargo: Cargo[] = [{ cargo_type: 'spares', tonnage: 10, cost: 5 }];
    render(<CargoPanel cargo={cargo} remainingMass={200} shipTonnage={400} onUpdate={onUpdate} />);
    const minusButtons = screen.getAllByText('-');
    const enabledMinus = minusButtons.find(btn => !btn.hasAttribute('disabled'));
    fireEvent.click(enabledMinus!);
    expect(onUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ cargo_type: 'spares' })])
    );
  });

  it('setting cargo tonnage to 0 removes it from cargo array', () => {
    const onUpdate = jest.fn();
    const cargo: Cargo[] = [{ cargo_type: 'cargo_bay', tonnage: 40, cost: 0 }];
    render(<CargoPanel cargo={cargo} remainingMass={200} shipTonnage={400} onUpdate={onUpdate} />);
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '0' } });
    const result = onUpdate.mock.calls[0][0] as Cargo[];
    expect(result.some(c => c.cargo_type === 'cargo_bay')).toBe(false);
  });

  it('shows Total line for cargo types with tonnage > 0', () => {
    const cargo: Cargo[] = [{ cargo_type: 'cargo_bay', tonnage: 30, cost: 0 }];
    const { container } = renderPanel(cargo);
    // <p><strong>Total:</strong> 30 tons, 0.00 MCr</p>
    expect(container.textContent).toMatch(/Total:.*30 tons, 0\.00 MCr/);
  });
});
