import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';
import FacilitiesPanel from './FacilitiesPanel';
import type { Facility } from '../types/ship';

const noOp = jest.fn();

describe('FacilitiesPanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the panel description', () => {
    const onUpdate = jest.fn();
    render(<FacilitiesPanel facilities={[{ facility_type: 'commissary', quantity: 1, mass: 2, cost: 0.2 }]} onUpdate={onUpdate} />);
    expect(screen.getByText(/Recreation and health facilities/)).toBeInTheDocument();
  });

  it('auto-adds commissary when not present', () => {
    const onUpdate = jest.fn();
    render(<FacilitiesPanel facilities={[]} onUpdate={onUpdate} />);
    expect(onUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ facility_type: 'commissary', quantity: 1 })])
    );
  });

  it('does not add commissary when already present', () => {
    const onUpdate = jest.fn();
    const facilities: Facility[] = [{ facility_type: 'commissary', quantity: 1, mass: 2, cost: 0.2 }];
    render(<FacilitiesPanel facilities={facilities} onUpdate={onUpdate} />);
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('typing a quantity adds a new facility', () => {
    const onUpdate = jest.fn();
    const facilities: Facility[] = [{ facility_type: 'commissary', quantity: 1, mass: 2, cost: 0.2 }];
    render(<FacilitiesPanel facilities={facilities} onUpdate={onUpdate} />);
    // Gym is the first facility shown (Row 1)
    const quantityInputs = screen.getAllByLabelText('Quantity:');
    fireEvent.change(quantityInputs[0], { target: { value: '1' } });
    expect(onUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ facility_type: 'gym', quantity: 1 })])
    );
  });

  it('typing a large quantity updates an existing facility directly, without one click per unit', () => {
    const onUpdate = jest.fn();
    const facilities: Facility[] = [
      { facility_type: 'commissary', quantity: 1, mass: 2, cost: 0.2 },
      { facility_type: 'gym', quantity: 1, mass: 3, cost: 0.1 }
    ];
    render(<FacilitiesPanel facilities={facilities} onUpdate={onUpdate} />);
    const quantityInputs = screen.getAllByLabelText('Quantity:'); // Gym is first in row 1
    fireEvent.change(quantityInputs[0], { target: { value: '250' } });
    expect(onUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ facility_type: 'gym', quantity: 250 })])
    );
  });

  it('typing 0 removes a facility', () => {
    const onUpdate = jest.fn();
    const facilities: Facility[] = [
      { facility_type: 'commissary', quantity: 1, mass: 2, cost: 0.2 },
      { facility_type: 'gym', quantity: 1, mass: 3, cost: 0.1 }
    ];
    render(<FacilitiesPanel facilities={facilities} onUpdate={onUpdate} />);
    const quantityInputs = screen.getAllByLabelText('Quantity:');
    fireEvent.change(quantityInputs[0], { target: { value: '0' } });
    const result = (onUpdate.mock.calls[0][0] as Facility[]);
    expect(result.some(f => f.facility_type === 'gym')).toBe(false);
  });

  it('treats a negative entry as zero', () => {
    const onUpdate = jest.fn();
    const facilities: Facility[] = [
      { facility_type: 'commissary', quantity: 1, mass: 2, cost: 0.2 },
      { facility_type: 'gym', quantity: 1, mass: 3, cost: 0.1 }
    ];
    render(<FacilitiesPanel facilities={facilities} onUpdate={onUpdate} />);
    const quantityInputs = screen.getAllByLabelText('Quantity:');
    fireEvent.change(quantityInputs[0], { target: { value: '-5' } });
    const result = (onUpdate.mock.calls[0][0] as Facility[]);
    expect(result.some(f => f.facility_type === 'gym')).toBe(false);
  });

  it('quantity inputs allow direct entry and have a minimum of 0', () => {
    const facilities: Facility[] = [{ facility_type: 'commissary', quantity: 1, mass: 2, cost: 0.2 }];
    render(<FacilitiesPanel facilities={facilities} onUpdate={noOp} />);
    const quantityInputs = screen.getAllByLabelText('Quantity:');
    expect(quantityInputs.length).toBeGreaterThan(0);
    quantityInputs.forEach(input => {
      expect(input).toHaveAttribute('type', 'number');
      expect(input).toHaveAttribute('min', '0');
    });
  });

  it('shows valid commissary requirement when commissary present', () => {
    const facilities: Facility[] = [{ facility_type: 'commissary', quantity: 1, mass: 2, cost: 0.2 }];
    const { container } = render(<FacilitiesPanel facilities={facilities} onUpdate={noOp} />);
    // Scope to validation section to avoid matching the description paragraph
    const validationLi = container.querySelector('.validation-info li');
    expect(validationLi?.className).toContain('valid');
  });

  it('shows invalid commissary requirement when commissary absent', () => {
    const onUpdate = jest.fn();
    const { container } = render(<FacilitiesPanel facilities={[]} onUpdate={onUpdate} />);
    // On initial render before useEffect fires, commissary is absent
    const validationLi = container.querySelector('.validation-info li');
    expect(validationLi?.className).toContain('invalid');
  });

  it('renders all four facility groups', () => {
    const facilities: Facility[] = [{ facility_type: 'commissary', quantity: 1, mass: 2, cost: 0.2 }];
    render(<FacilitiesPanel facilities={facilities} onUpdate={noOp} />);
    // Verify key facilities from each group (each renders as "Name, X tons, Y MCr")
    expect(screen.getByText(/^Gym,/)).toBeInTheDocument();
    expect(screen.getByText(/^Commissary,/)).toBeInTheDocument();
    expect(screen.getByText(/^First Aid Station,/)).toBeInTheDocument();
    expect(screen.getByText(/^Library,/)).toBeInTheDocument();
  });
});
