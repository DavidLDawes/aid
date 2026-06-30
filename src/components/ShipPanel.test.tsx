import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';
import ShipPanel from './ShipPanel';
import type { Ship, ShipDesign } from '../types/ship';

// Mock the database service
jest.mock('../services/database', () => ({
  databaseService: {
    initialize: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    getShipByName: jest.fn<() => Promise<null>>().mockResolvedValue(null),
    getAllShips: jest.fn<() => Promise<[]>>().mockResolvedValue([]),
    getShipById: jest.fn<() => Promise<null>>().mockResolvedValue(null),
    saveOrUpdateShipByName: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    deleteShip: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
  }
}));

const createMockShip = (overrides: Partial<Ship> = {}): Ship => ({
  name: 'Test Ship',
  tech_level: 'A',
  tonnage: 100,
  configuration: 'standard',
  fuel_weeks: 2,
  missile_reloads: 0,
  sand_reloads: 0,
  description: '',
  ...overrides
});

const createMockShipDesign = (ship: Ship): ShipDesign => ({
  ship,
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

describe('ShipPanel', () => {
  const mockOnUpdate = jest.fn<(ship: Ship) => void>();
  const mockOnLoadExistingShip = jest.fn<(design: ShipDesign) => void>();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders ship name in input', () => {
    const ship = createMockShip({ name: 'My Vessel' });
    render(<ShipPanel ship={ship} onUpdate={mockOnUpdate} />);
    const input = screen.getByLabelText(/Ship Name/);
    expect(input).toHaveValue('My Vessel');
  });

  it('renders empty name input for new ship', () => {
    const ship = createMockShip({ name: '' });
    render(<ShipPanel ship={ship} onUpdate={mockOnUpdate} />);
    const input = screen.getByLabelText(/Ship Name/);
    expect(input).toHaveValue('');
  });

  it('calls onUpdate with new name when name changes', () => {
    const ship = createMockShip({ name: 'Old Name' });
    render(<ShipPanel ship={ship} onUpdate={mockOnUpdate} />);
    const input = screen.getByLabelText(/Ship Name/);
    fireEvent.change(input, { target: { value: 'New Name' } });
    expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Name' }));
  });

  it('shows current tonnage in hull size select', () => {
    const ship = createMockShip({ tonnage: 200 });
    render(<ShipPanel ship={ship} onUpdate={mockOnUpdate} />);
    const select = screen.getByLabelText(/Hull Size/);
    expect(select).toHaveValue('200');
  });

  it('calls onUpdate with new tonnage when hull size changes', () => {
    const ship = createMockShip({ tonnage: 100 });
    render(<ShipPanel ship={ship} onUpdate={mockOnUpdate} />);
    const select = screen.getByLabelText(/Hull Size/);
    fireEvent.change(select, { target: { value: '200' } });
    expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({ tonnage: 200 }));
  });

  it('shows current tech level in select', () => {
    const ship = createMockShip({ tech_level: 'C' });
    render(<ShipPanel ship={ship} onUpdate={mockOnUpdate} />);
    const select = screen.getByLabelText(/Tech Level/);
    expect(select).toHaveValue('C');
  });

  it('calls onUpdate with new tech level when tech level changes', () => {
    const ship = createMockShip({ tech_level: 'A' });
    render(<ShipPanel ship={ship} onUpdate={mockOnUpdate} />);
    const select = screen.getByLabelText(/Tech Level/);
    fireEvent.change(select, { target: { value: 'E' } });
    expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({ tech_level: 'E' }));
  });

  it('shows current configuration in select', () => {
    const ship = createMockShip({ configuration: 'streamlined' });
    render(<ShipPanel ship={ship} onUpdate={mockOnUpdate} />);
    const select = screen.getByLabelText(/Configuration/);
    expect(select).toHaveValue('streamlined');
  });

  it('calls onUpdate when configuration changes', () => {
    const ship = createMockShip({ configuration: 'standard' });
    render(<ShipPanel ship={ship} onUpdate={mockOnUpdate} />);
    const select = screen.getByLabelText(/Configuration/);
    fireEvent.change(select, { target: { value: 'distributed' } });
    expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({ configuration: 'distributed' }));
  });

  it('shows description in textarea', () => {
    const ship = createMockShip({ description: 'A fast ship' });
    render(<ShipPanel ship={ship} onUpdate={mockOnUpdate} />);
    const textarea = screen.getByLabelText(/Description/);
    expect(textarea).toHaveValue('A fast ship');
  });

  it('calls onUpdate when description changes', () => {
    const ship = createMockShip({ description: '' });
    render(<ShipPanel ship={ship} onUpdate={mockOnUpdate} />);
    const textarea = screen.getByLabelText(/Description/);
    fireEvent.change(textarea, { target: { value: 'New description' } });
    expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({ description: 'New description' }));
  });

  it('shows conflict dialog when an existing ship name is found', async () => {
    const { databaseService } = await import('../services/database');
    (databaseService.getShipByName as ReturnType<typeof jest.fn>).mockResolvedValue({
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      ship: createMockShip({ name: 'Scout', tonnage: 100, tech_level: 'E' }),
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

    const ship = createMockShip({ name: 'Scout' });
    render(<ShipPanel ship={ship} onUpdate={mockOnUpdate} onLoadExistingShip={mockOnLoadExistingShip} />);

    await waitFor(() => {
      expect(screen.queryByText(/Ship Name Already Exists/)).toBeInTheDocument();
    });
  });

  it('shows character count for ship name', () => {
    const ship = createMockShip({ name: 'Hi' });
    render(<ShipPanel ship={ship} onUpdate={mockOnUpdate} />);
    expect(screen.getByText('2/32 characters')).toBeInTheDocument();
  });
});
