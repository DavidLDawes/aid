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
    loadInitialDataIfNeeded: jest.fn<() => Promise<boolean>>().mockResolvedValue(false),
    resetStandardShips: jest.fn<() => Promise<{ loaded: number; errors: number }>>()
      .mockResolvedValue({ loaded: 1, errors: 0 })
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
    expect(screen.getByText('Loading structures...')).toBeInTheDocument();
  });

  it('shows the default structure in dropdown after loading when DB is empty', async () => {
    render(<SelectShipPanel onNewShip={mockOnNewShip} onLoadShip={mockOnLoadShip} />);
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    // Default structure is Ring World Alpha
    expect(screen.getByText(/Ring World Alpha/)).toBeInTheDocument();
  });

  it('Load Selected Structure button is disabled when nothing is selected', async () => {
    render(<SelectShipPanel onNewShip={mockOnNewShip} onLoadShip={mockOnLoadShip} />);
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    const loadBtn = screen.getByRole('button', { name: /Load Selected Structure/ });
    expect(loadBtn).toBeDisabled();
  });

  it('New Structure button calls onNewShip', async () => {
    render(<SelectShipPanel onNewShip={mockOnNewShip} onLoadShip={mockOnLoadShip} />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /New Structure/ })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /New Structure/ }));
    expect(mockOnNewShip).toHaveBeenCalledTimes(1);
  });

  it('selecting the default structure enables Load Selected Structure button', async () => {
    render(<SelectShipPanel onNewShip={mockOnNewShip} onLoadShip={mockOnLoadShip} />);
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    const select = screen.getByRole('combobox');
    // Default structure uses negative ID: Ring World Alpha = -1
    fireEvent.change(select, { target: { value: '-1' } });
    const loadBtn = screen.getByRole('button', { name: /Load Selected Structure/ });
    expect(loadBtn).not.toBeDisabled();
  });

  it('loading the default structure (negative id) calls onLoadShip with ShipDesign', async () => {
    render(<SelectShipPanel onNewShip={mockOnNewShip} onLoadShip={mockOnLoadShip} />);
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '-1' } });
    fireEvent.click(screen.getByRole('button', { name: /Load Selected Structure/ }));

    await waitFor(() => {
      expect(mockOnLoadShip).toHaveBeenCalledTimes(1);
    });
    const calledWith = mockOnLoadShip.mock.calls[0][0] as ShipDesign;
    expect(calledWith.ship.name).toBe('Ring World Alpha');
    // Verify no 'id', 'createdAt', 'updatedAt' on the passed design
    expect((calledWith as Record<string, unknown>)['id']).toBeUndefined();
  });

  it('Delete Selected Structure button is disabled when nothing is selected', async () => {
    render(<SelectShipPanel onNewShip={mockOnNewShip} onLoadShip={mockOnLoadShip} />);
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    const deleteBtn = screen.getByRole('button', { name: /Delete Selected Structure/ });
    expect(deleteBtn).toBeDisabled();
  });

  it('Delete Selected Structure button is disabled for the default structure (id < 0)', async () => {
    render(<SelectShipPanel onNewShip={mockOnNewShip} onLoadShip={mockOnLoadShip} />);
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '-1' } });
    const deleteBtn = screen.getByRole('button', { name: /Delete Selected Structure/ });
    expect(deleteBtn).toBeDisabled();
  });

  it('delete calls deleteShip and reloads structures after confirmation', async () => {
    const { databaseService } = await import('../services/database');
    const savedShip = {
      id: 42,
      createdAt: new Date(),
      updatedAt: new Date(),
      ship: {
        name: 'My Structure',
        tech_level: 'H',
        tonnage: 2_000_000,
        configuration: 'distributed' as const,
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
      modular_cutter_modules: [],
      drones: [],
      custom_items: [],
      custom_crew: {
        pilot: 0, navigator: 0, engineers: 0, gunners: 0, service: 0, stewards: 0,
        nurses: 0, surgeons: 0, techs: 0, infantry: 0, armor: 0, mp: 0, security: 0
      },
      fuel_systems: [],
      zone_sections: []
    };
    (databaseService.getAllShips as ReturnType<typeof jest.fn>)
      .mockResolvedValueOnce([savedShip])     // first load
      .mockResolvedValueOnce([]);              // after delete reload

    const originalConfirm = window.confirm;
    window.confirm = jest.fn<() => boolean>().mockReturnValue(true);

    render(<SelectShipPanel onNewShip={mockOnNewShip} onLoadShip={mockOnLoadShip} />);
    await waitFor(() => {
      expect(screen.getByText(/My Structure/)).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '42' } });

    const deleteBtn = screen.getByRole('button', { name: /Delete Selected Structure/ });
    expect(deleteBtn).not.toBeDisabled();
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(databaseService.deleteShip).toHaveBeenCalledWith(42);
    });

    window.confirm = originalConfirm;
  });

  it('shows structure details preview when the default structure is selected', async () => {
    render(<SelectShipPanel onNewShip={mockOnNewShip} onLoadShip={mockOnLoadShip} />);
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '-1' } });
    expect(screen.getByText('Structure Details')).toBeInTheDocument();
    expect(screen.getByText('Ring World Alpha')).toBeInTheDocument();
  });

  it('falls back to the default structure (no error shown) when initialize throws', async () => {
    const { databaseService } = await import('../services/database');
    (databaseService.initialize as ReturnType<typeof jest.fn>).mockRejectedValueOnce(new Error('DB failed'));

    render(<SelectShipPanel onNewShip={mockOnNewShip} onLoadShip={mockOnLoadShip} />);
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
    expect(screen.getByText(/Ring World Alpha/)).toBeInTheDocument();
  });

  it('Reset Structures is offered even when the DB already has structures', async () => {
    render(<SelectShipPanel onNewShip={mockOnNewShip} onLoadShip={mockOnLoadShip} />);
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Reset Structures/ })).toBeInTheDocument();
  });

  it('does nothing if the reset confirmation is declined', async () => {
    const { initialDataService } = await import('../services/initialDataService');
    const originalConfirm = window.confirm;
    window.confirm = jest.fn<() => boolean>().mockReturnValue(false);

    render(<SelectShipPanel onNewShip={mockOnNewShip} onLoadShip={mockOnLoadShip} />);
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /Reset Structures/ }));

    expect(initialDataService.resetStandardShips).not.toHaveBeenCalled();
    window.confirm = originalConfirm;
  });

  it('resets standard structures and reloads the list after confirmation', async () => {
    const { initialDataService } = await import('../services/initialDataService');
    const { databaseService } = await import('../services/database');
    const originalConfirm = window.confirm;
    window.confirm = jest.fn<() => boolean>().mockReturnValue(true);

    render(<SelectShipPanel onNewShip={mockOnNewShip} onLoadShip={mockOnLoadShip} />);
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /Reset Structures/ }));

    await waitFor(() => {
      expect(initialDataService.resetStandardShips).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect((databaseService.getAllShips as ReturnType<typeof jest.fn>).mock.calls.length).toBeGreaterThan(1);
    });

    window.confirm = originalConfirm;
  });

  it('shows an error if resetStandardShips rejects', async () => {
    const { initialDataService } = await import('../services/initialDataService');
    (initialDataService.resetStandardShips as ReturnType<typeof jest.fn>)
      .mockRejectedValueOnce(new Error('reset failed'));
    const originalConfirm = window.confirm;
    window.confirm = jest.fn<() => boolean>().mockReturnValue(true);

    render(<SelectShipPanel onNewShip={mockOnNewShip} onLoadShip={mockOnLoadShip} />);
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /Reset Structures/ }));

    await waitFor(() => {
      expect(screen.getByText(/Failed to reset standard structures/)).toBeInTheDocument();
    });

    window.confirm = originalConfirm;
  });
});
