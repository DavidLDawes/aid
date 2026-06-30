import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';
import StaffPanel from './StaffPanel';
import type { StaffRequirements, Berth } from '../types/ship';

const makeStaff = (overrides: Partial<StaffRequirements> = {}): StaffRequirements => ({
  pilot: 1, navigator: 1, engineers: 1, gunners: 0, service: 0,
  stewards: 0, nurses: 0, surgeons: 0, techs: 0, total: 3,
  ...overrides
});

const renderPanel = (
  staffRequirements: StaffRequirements = makeStaff(),
  berths: Berth[] = [],
  shipTonnage = 400,
  combinePilotNavigator = false,
  noStewards = false
) =>
  render(
    <StaffPanel
      staffRequirements={staffRequirements}
      berths={berths}
      shipTonnage={shipTonnage}
      combinePilotNavigator={combinePilotNavigator}
      noStewards={noStewards}
      onCombinePilotNavigatorChange={jest.fn()}
      onNoStewardsChange={jest.fn()}
    />
  );

describe('StaffPanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders staff requirements heading', () => {
    renderPanel();
    expect(screen.getByText('Staff Requirements')).toBeInTheDocument();
  });

  it('shows pilot and navigator separately by default', () => {
    renderPanel(makeStaff({ pilot: 1, navigator: 1, total: 3 }));
    expect(screen.getByText(/Pilot: 1/)).toBeInTheDocument();
    expect(screen.getByText(/Navigator: 1/)).toBeInTheDocument();
  });

  it('shows Pilot/Navigator combined when combinePilotNavigator is true', () => {
    renderPanel(makeStaff({ pilot: 1, navigator: 1, total: 3 }), [], 400, true);
    expect(screen.getByText(/Pilot\/Navigator: 1/)).toBeInTheDocument();
    expect(screen.queryByText(/^Pilot:/)).not.toBeInTheDocument();
  });

  it('shows engineers count', () => {
    renderPanel(makeStaff({ engineers: 3, total: 5 }));
    expect(screen.getByText(/Engineers: 3/)).toBeInTheDocument();
  });

  it('shows gunners count', () => {
    renderPanel(makeStaff({ gunners: 2, total: 5 }));
    expect(screen.getByText(/Gunners: 2/)).toBeInTheDocument();
  });

  it('shows total staff count', () => {
    renderPanel(makeStaff({ total: 6 }));
    expect(screen.getByText(/Total Staff: 6/)).toBeInTheDocument();
  });

  it('does not show small ship options for large ships', () => {
    renderPanel(makeStaff(), [], 400);
    expect(screen.queryByText(/Small Ship Crew Options/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Combine Pilot and Navigator/)).not.toBeInTheDocument();
  });

  it('shows small ship crew options for 100-ton ships', () => {
    renderPanel(makeStaff(), [], 100);
    expect(screen.getByText(/Small Ship Crew Options/)).toBeInTheDocument();
    expect(screen.getByText(/Combine Pilot and Navigator/)).toBeInTheDocument();
  });

  it('shows small ship crew options for 200-ton ships', () => {
    renderPanel(makeStaff(), [], 200);
    expect(screen.getByText(/Combine Pilot and Navigator/)).toBeInTheDocument();
  });

  it('shows No Stewards checkbox for small ship without passengers', () => {
    // No berths → no passengers → noStewards checkbox visible
    renderPanel(makeStaff({ stewards: 1, total: 4 }), [], 100);
    expect(screen.getByText(/No Stewards/)).toBeInTheDocument();
  });

  it('hides No Stewards checkbox when ship has passengers', () => {
    // crew=3, staterooms=5 → hasPassengers=true
    const berths: Berth[] = [{ berth_type: 'staterooms', quantity: 5, mass: 20, cost: 1 }];
    renderPanel(makeStaff({ total: 3 }), berths, 100);
    expect(screen.queryByText(/No Stewards/)).not.toBeInTheDocument();
  });

  it('calls onCombinePilotNavigatorChange when checkbox clicked', () => {
    const onCombinePilotNavigatorChange = jest.fn();
    render(
      <StaffPanel
        staffRequirements={makeStaff()}
        berths={[]}
        shipTonnage={100}
        combinePilotNavigator={false}
        noStewards={false}
        onCombinePilotNavigatorChange={onCombinePilotNavigatorChange}
        onNoStewardsChange={jest.fn()}
      />
    );
    fireEvent.click(screen.getByLabelText(/Combine Pilot and Navigator/));
    expect(onCombinePilotNavigatorChange).toHaveBeenCalledWith(true);
  });

  it('calls onNoStewardsChange when No Stewards checkbox clicked', () => {
    const onNoStewardsChange = jest.fn();
    render(
      <StaffPanel
        staffRequirements={makeStaff({ stewards: 1, total: 4 })}
        berths={[]}
        shipTonnage={100}
        combinePilotNavigator={false}
        noStewards={false}
        onCombinePilotNavigatorChange={jest.fn()}
        onNoStewardsChange={onNoStewardsChange}
      />
    );
    fireEvent.click(screen.getByLabelText(/No Stewards/));
    expect(onNoStewardsChange).toHaveBeenCalledWith(true);
  });

  it('shows stewards as 0 when noStewards is true', () => {
    renderPanel(makeStaff({ stewards: 2, total: 5 }), [], 400, false, true);
    expect(screen.getByText(/Stewards: 0/)).toBeInTheDocument();
  });

  it('shows stewards count when noStewards is false', () => {
    renderPanel(makeStaff({ stewards: 2, total: 5 }));
    expect(screen.getByText(/Stewards: 2/)).toBeInTheDocument();
  });

  it('adjusts total when combinePilotNavigator is true', () => {
    renderPanel(makeStaff({ pilot: 1, navigator: 1, total: 4 }), [], 100, true, false);
    // total - 1 = 3
    expect(screen.getByText(/Total Staff: 3/)).toBeInTheDocument();
  });

  it('adjusts total when noStewards is true', () => {
    renderPanel(makeStaff({ stewards: 1, total: 4 }), [], 400, false, true);
    // total - stewards = 3
    expect(screen.getByText(/Total Staff: 3/)).toBeInTheDocument();
  });
});
