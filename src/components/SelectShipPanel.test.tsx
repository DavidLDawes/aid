import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';
import SelectShipPanel from './SelectShipPanel';
import type { ShipDesign } from '../types/ship';

// Mock database and initialDataService
jest.mock('../services/database', () => ({
  databaseService: {
    initialize: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    getAllShips: jest.fn<() => Promise<[]>>().mockResolvedValue([]),
    getShipById: jest.fn<() => Promise<null>>().mockResolvedValue(null),
    getShipByName: jest.fn<() => Promise<null>>().mockResolvedValue(null),
    saveOrUpdateShipByName: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    deleteShip: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
  }
}));

jest.mock('../services/initialDataService', () => ({
  initialDataService: {
    loadInitialDataIfNeeded: jest.fn<() => Promise<boolean>>().mockResolvedValue(false)
  }
}));

describe('SelectShipPanel', () => {
  const mockOnNewShip = jest.fn<() => void>();
  const mockOnLoadShip = jest.fn<(design: ShipDesign) => void>();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state immediately on render', () => {
    render(<SelectShipPanel onNewShip={mockOnNewShip} onLoadShip={mockOnLoadShip} />);
    expect(screen.getByText('Loading ships...')).toBeInTheDocument();
  });

  it('shows default ships in dropdown after loading when DB is empty', async () => {
    render(<SelectShipPanel onNewShip={mockOnNewShip} onLoadShip={mockOnLoadShip} />);
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    // Default ships include Scout, Free Trader, Fat Trader
    expect(screen.getByText(/Scout/)).toBeInTheDocument();
  });

  it('Load Selected Ship button is disabled when nothing is selected', async () => {
    render(<SelectShipPanel onNewShip={mockOnNewShip} onLoadShip={mockOnLoadShip} />);
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    const loadBtn = screen.getByRole('button', { name: /Load Selected Ship/ });
    expect(loadBtn).toBeDisabled();
  });

  it('New Ship button calls onNewShip', async () => {
    render(<SelectShipPanel onNewShip={mockOnNewShip} onLoadShip={mockOnLoadShip} />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /New Ship/ })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /New Ship/ }));
    expect(mockOnNewShip).toHaveBeenCalledTimes(1);
  });

  it('selecting a ship enables Load Selected Ship button', async () => {
    render(<SelectShipPanel onNewShip={mockOnNewShip} onLoadShip={mockOnLoadShip} />);
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    const select = screen.getByRole('combobox');
    // Default ships use negative IDs: Scout = -2
    fireEvent.change(select, { target: { value: '-2' } });
    const loadBtn = screen.getByRole('button', { name: /Load Selected Ship/ });
    expect(loadBtn).not.toBeDisabled();
  });

  it('loading a default ship (negative id) calls onLoadShip with ShipDesign', async () => {
    render(<SelectShipPanel onNewShip={mockOnNewShip} onLoadShip={mockOnLoadShip} />);
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    const select = screen.getByRole('combobox');
    // Select Scout (id=-2)
    fireEvent.change(select, { target: { value: '-2' } });
    fireEvent.click(screen.getByRole('button', { name: /Load Selected Ship/ }));

    await waitFor(() => {
      expect(mockOnLoadShip).toHaveBeenCalledTimes(1);
    });
    const calledWith = mockOnLoadShip.mock.calls[0][0] as ShipDesign;
    expect(calledWith.ship.name).toBe('Scout');
    // Verify no 'id', 'createdAt', 'updatedAt' on the passed design
    expect((calledWith as Record<string, unknown>)['id']).toBeUndefined();
  });

  it('Delete Selected Ship button is disabled when nothing is selected', async () => {
    render(<SelectShipPanel onNewShip={mockOnNewShip} onLoadShip={mockOnLoadShip} />);
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    const deleteBtn = screen.getByRole('button', { name: /Delete Selected Ship/ });
    expect(deleteBtn).toBeDisabled();
  });

  it('Delete Selected Ship button is disabled for default ships (id < 0)', async () => {
    render(<SelectShipPanel onNewShip={mockOnNewShip} onLoadShip={mockOnLoadShip} />);
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '-2' } });
    const deleteBtn = screen.getByRole('button', { name: /Delete Selected Ship/ });
    expect(deleteBtn).toBeDisabled();
  });

  it('delete calls deleteShip and reloads ships after confirmation', async () => {
    // Mock with a real saved ship (positive id)
    const { databaseService } = await import('../services/database');
    const savedShip = {
      id: 42,
      createdAt: new Date(),
      updatedAt: new Date(),
      ship: {
        name: 'My Ship',
        tech_level: 'B',
        tonnage: 200,
        configuration: 'standard' as const,
        fuel_weeks: 2,
        missile_reloads: 0,
        sand_reloads: 0,
        description: ''
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
    };
    (databaseService.getAllShips as ReturnType<typeof jest.fn>)
      .mockResolvedValueOnce([savedShip])     // first load
      .mockResolvedValueOnce([]);              // after delete reload

    const originalConfirm = window.confirm;
    window.confirm = jest.fn<() => boolean>().mockReturnValue(true);

    render(<SelectShipPanel onNewShip={mockOnNewShip} onLoadShip={mockOnLoadShip} />);
    await waitFor(() => {
      expect(screen.getByText(/My Ship/)).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '42' } });

    const deleteBtn = screen.getByRole('button', { name: /Delete Selected Ship/ });
    expect(deleteBtn).not.toBeDisabled();
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(databaseService.deleteShip).toHaveBeenCalledWith(42);
    });

    window.confirm = originalConfirm;
  });

  it('shows ship details preview when a ship is selected', async () => {
    render(<SelectShipPanel onNewShip={mockOnNewShip} onLoadShip={mockOnLoadShip} />);
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '-2' } });
    expect(screen.getByText('Ship Details')).toBeInTheDocument();
    expect(screen.getByText('Scout')).toBeInTheDocument();
  });

  it('falls back to default ships (no error shown) when initialize throws', async () => {
    const { databaseService } = await import('../services/database');
    (databaseService.initialize as ReturnType<typeof jest.fn>).mockRejectedValueOnce(new Error('DB failed'));

    render(<SelectShipPanel onNewShip={mockOnNewShip} onLoadShip={mockOnLoadShip} />);
    // Wait for loading to finish (combobox appears when loading completes)
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    // Should NOT show an error state — falls back to default ships
    expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
    // Default ships should be available
    expect(screen.getByText(/Scout/)).toBeInTheDocument();
  });
});
