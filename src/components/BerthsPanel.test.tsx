import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';
import BerthsPanel from './BerthsPanel';
import type { Berth, StaffRequirements } from '../types/ship';

const makeStaff = (total: number, overrides: Partial<StaffRequirements> = {}): StaffRequirements => ({
  pilot: 1,
  navigator: 1,
  engineers: Math.max(0, total - 2),
  gunners: 0,
  service: 0,
  stewards: 0,
  nurses: 0,
  surgeons: 0,
  techs: 0,
  total,
  ...overrides
});

const stateroomBerth = (quantity: number): Berth => ({
  berth_type: 'staterooms',
  quantity,
  mass: 4,
  cost: 0.5
});

const lowBerth = (quantity: number): Berth => ({
  berth_type: 'low_berths',
  quantity,
  mass: 0.5,
  cost: 0.05
});

describe('BerthsPanel', () => {
  const mockOnUpdate = jest.fn<(berths: Berth[]) => void>();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders total crew count from staffRequirements', () => {
    const staff = makeStaff(3);
    render(<BerthsPanel berths={[stateroomBerth(3)]} staffRequirements={staff} onUpdate={mockOnUpdate} />);
    // Find the "Total Crew:" label (rendered in a <strong> tag)
    const crewLabel = screen.getByText('Total Crew:');
    expect(crewLabel).toBeInTheDocument();
    // The parent <p> should contain the crew count
    const crewParagraph = crewLabel.closest('p');
    expect(crewParagraph).toHaveTextContent('3');
  });

  it('renders total stateroom count', () => {
    const staff = makeStaff(2);
    render(<BerthsPanel berths={[stateroomBerth(2)]} staffRequirements={staff} onUpdate={mockOnUpdate} />);
    expect(screen.getByText(/Total Staterooms:/)).toBeInTheDocument();
  });

  it('shows sufficient message when staterooms >= crew', () => {
    const staff = makeStaff(2);
    render(<BerthsPanel berths={[stateroomBerth(2)]} staffRequirements={staff} onUpdate={mockOnUpdate} />);
    expect(screen.getAllByText(/Sufficient staterooms/).length).toBeGreaterThan(0);
  });

  it('shows insufficient message when staterooms < crew', () => {
    // We need enough staterooms to not trigger auto-add, but still show insufficient
    // This scenario: staff.total=3 but we have 3 staterooms already (so no auto-add),
    // but adjustedCrewCount=5 shows insufficient
    const staff = makeStaff(3);
    render(
      <BerthsPanel
        berths={[stateroomBerth(3)]}
        staffRequirements={staff}
        adjustedCrewCount={5}
        onUpdate={mockOnUpdate}
      />
    );
    expect(screen.getAllByText(/Need more staterooms/).length).toBeGreaterThan(0);
  });

  it('auto-adds staterooms via useEffect when crew > staterooms', () => {
    const staff = makeStaff(3);
    // No berths at all but crew=3 — should call onUpdate with 3 staterooms
    render(<BerthsPanel berths={[]} staffRequirements={staff} onUpdate={mockOnUpdate} />);
    expect(mockOnUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ berth_type: 'staterooms', quantity: 3 })
      ])
    );
  });

  it('does NOT call onUpdate when staterooms already sufficient', () => {
    const staff = makeStaff(2);
    render(<BerthsPanel berths={[stateroomBerth(2)]} staffRequirements={staff} onUpdate={mockOnUpdate} />);
    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it('increments low berths and calls onUpdate', () => {
    const staff = makeStaff(2);
    render(<BerthsPanel berths={[stateroomBerth(2)]} staffRequirements={staff} onUpdate={mockOnUpdate} />);
    // Find all "+" buttons — the low berths "+" button
    const plusButtons = screen.getAllByRole('button', { name: '+' });
    // Low berths is index 2 (0=staterooms, 1=luxury_staterooms, 2=low_berths, 3=emergency_low_berths)
    fireEvent.click(plusButtons[2]);
    expect(mockOnUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ berth_type: 'low_berths', quantity: 1 })
      ])
    );
  });

  it('stateroom minus button is disabled when staterooms equal crew count', () => {
    const staff = makeStaff(2);
    render(<BerthsPanel berths={[stateroomBerth(2)]} staffRequirements={staff} onUpdate={mockOnUpdate} />);
    // The staterooms "-" button should be disabled since reducing below crew
    const minusButtons = screen.getAllByRole('button', { name: '-' });
    // Staterooms is index 0
    expect(minusButtons[0]).toBeDisabled();
  });

  it('stateroom minus button is enabled when staterooms exceed crew count', () => {
    const staff = makeStaff(2);
    render(<BerthsPanel berths={[stateroomBerth(4)]} staffRequirements={staff} onUpdate={mockOnUpdate} />);
    const minusButtons = screen.getAllByRole('button', { name: '-' });
    expect(minusButtons[0]).not.toBeDisabled();
  });

  it('adjustedCrewCount prop overrides staffRequirements.total for threshold', () => {
    // staffRequirements.total=5 but adjustedCrewCount=2
    // With 2 staterooms, should show sufficient (uses adjustedCrewCount=2)
    const staff = makeStaff(5);
    render(
      <BerthsPanel
        berths={[stateroomBerth(2)]}
        staffRequirements={staff}
        adjustedCrewCount={2}
        onUpdate={mockOnUpdate}
      />
    );
    expect(screen.getAllByText(/Sufficient staterooms/).length).toBeGreaterThan(0);
    // onUpdate should NOT have been called (2 staterooms covers adjustedCrewCount=2)
    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it('shows berth summary table with current berths', () => {
    const staff = makeStaff(2);
    const berths: Berth[] = [
      stateroomBerth(2),
      lowBerth(6)
    ];
    render(<BerthsPanel berths={berths} staffRequirements={staff} onUpdate={mockOnUpdate} />);
    expect(screen.getByText('Berth Summary')).toBeInTheDocument();
    // Both "Staterooms" and "Low Berths" appear in both the grid headers and the summary table
    // Use getAllByText to handle multiple matches
    expect(screen.getAllByText('Staterooms').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Low Berths').length).toBeGreaterThan(0);
    // Verify the table has the right quantity cell for low berths
    const qtyCells = screen.getAllByRole('cell');
    const qtyValues = qtyCells.map(c => c.textContent);
    expect(qtyValues).toContain('6');
  });

  it('shows "No berths configured" when berth array is empty and no auto-add fires', () => {
    // crew=0 so no auto-add, no berths
    const staff = makeStaff(0, { total: 0, engineers: 0, pilot: 0, navigator: 0 });
    render(<BerthsPanel berths={[]} staffRequirements={staff} onUpdate={mockOnUpdate} />);
    expect(screen.getByText('No berths configured.')).toBeInTheDocument();
    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it('renders all four berth type controls in the grid', () => {
    const staff = makeStaff(2);
    render(<BerthsPanel berths={[stateroomBerth(2)]} staffRequirements={staff} onUpdate={mockOnUpdate} />);
    expect(screen.getByText('Staterooms (Required)')).toBeInTheDocument();
    expect(screen.getByText('Luxury Staterooms')).toBeInTheDocument();
    expect(screen.getByText('Low Berths')).toBeInTheDocument();
    expect(screen.getByText('Emergency Low')).toBeInTheDocument();
  });
});
