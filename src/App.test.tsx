import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';
import App from './App';

// Mock database service
jest.mock('./services/database', () => ({
  databaseService: {
    initialize: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    getAllShips: jest.fn<() => Promise<[]>>().mockResolvedValue([]),
    getShipById: jest.fn<() => Promise<null>>().mockResolvedValue(null),
    getShipByName: jest.fn<() => Promise<null>>().mockResolvedValue(null),
    saveOrUpdateShipByName: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    saveShip: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    deleteShip: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
  }
}));

// Mock initialDataService (used by SelectShipPanel)
jest.mock('./services/initialDataService', () => ({
  initialDataService: {
    loadInitialDataIfNeeded: jest.fn<() => Promise<boolean>>().mockResolvedValue(false)
  }
}));

// Mock print window
const _mockPrintWindow = {
  document: { write: jest.fn(), close: jest.fn() },
  focus: jest.fn(),
  addEventListener: jest.fn(),
  print: jest.fn(),
  close: jest.fn()
};

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows "Select Ship" heading on initial render', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Select Ship' })).toBeInTheDocument();
  });

  it('shows ship dropdown after async load completes', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    // Default ships should be present (Scout, Free Trader, Fat Trader)
    expect(screen.getByText(/Scout/)).toBeInTheDocument();
  });

  it('clicking New Ship shows "Ship" panel heading', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /New Ship/ })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /New Ship/ }));
    expect(screen.getByRole('heading', { level: 2, name: 'Ship' })).toBeInTheDocument();
  });

  it('clicking New Ship shows empty ship name input', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /New Ship/ })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /New Ship/ }));
    const nameInput = screen.getByLabelText(/Ship Name/);
    expect(nameInput).toHaveValue('');
  });

  it('Back to Ship Select returns to Select Ship view', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /New Ship/ })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /New Ship/ }));
    expect(screen.getByRole('heading', { level: 2, name: 'Ship' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Back to Ship Select/ }));
    expect(screen.getByRole('heading', { name: 'Select Ship' })).toBeInTheDocument();
  });

  it('Next button is disabled on panel 0 when ship name is empty', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /New Ship/ })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /New Ship/ }));

    const nextBtn = screen.getByRole('button', { name: 'Next' });
    expect(nextBtn).toBeDisabled();
  });

  it('Next button becomes enabled after entering a ship name', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /New Ship/ })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /New Ship/ }));

    const nameInput = screen.getByLabelText(/Ship Name/);
    fireEvent.change(nameInput, { target: { value: 'Falcon' } });

    const nextBtn = screen.getByRole('button', { name: 'Next' });
    expect(nextBtn).not.toBeDisabled();
  });

  it('Previous button is disabled on panel 0', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /New Ship/ })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /New Ship/ }));

    const prevBtn = screen.getByRole('button', { name: 'Previous' });
    expect(prevBtn).toBeDisabled();
  });

  it('loading a default ship shows its name in the name input', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    // Select the Scout (id=-2)
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '-2' } });
    fireEvent.click(screen.getByRole('button', { name: /Load Selected Ship/ }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: 'Ship' })).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/Ship Name/);
    expect(nameInput).toHaveValue('Scout');
  });

  it('clicking New Ship after loading a ship resets name to empty', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    // Load the Scout
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '-2' } });
    fireEvent.click(screen.getByRole('button', { name: /Load Selected Ship/ }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Ship Name/)).toHaveValue('Scout');
    });

    // Go back to ship select
    fireEvent.click(screen.getByRole('button', { name: /Back to Ship Select/ }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /New Ship/ })).toBeInTheDocument();
    });

    // Click New Ship
    fireEvent.click(screen.getByRole('button', { name: /New Ship/ }));

    const nameInput = screen.getByLabelText(/Ship Name/);
    expect(nameInput).toHaveValue('');
  });

  it('header shows ship name after entering name and advancing beyond panel 0', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /New Ship/ })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /New Ship/ }));

    const nameInput = screen.getByLabelText(/Ship Name/);
    fireEvent.change(nameInput, { target: { value: 'Nightwing' } });

    // Panel 0 is valid now — navigate to panel 1
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    // The header should contain the ship name (it appears when currentPanel > 0)
    await waitFor(() => {
      expect(screen.getByText(/Nightwing/)).toBeInTheDocument();
    });
  });

  it('panel nav buttons appear when in design mode', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /New Ship/ })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /New Ship/ }));

    // Nav buttons for each panel should be visible
    expect(screen.getByRole('button', { name: 'Ship' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Engines' })).toBeInTheDocument();
  });

  // --- handleFileSave ---

  it('handleFileSave alerts when ship name is empty', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<App />);
    await waitFor(() => expect(screen.getByRole('button', { name: /New Ship/ })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /New Ship/ }));

    // Name is empty, fire Ctrl+S on body (not an input element)
    fireEvent.keyDown(document.body, { ctrlKey: true, key: 's', shiftKey: false });

    expect(alertSpy).toHaveBeenCalledWith(expect.stringMatching(/ship name/i));
    alertSpy.mockRestore();
  });

  it('handleFileSave calls DB when ship has a name', async () => {
    const { databaseService } = await import('./services/database');
    render(<App />);
    await waitFor(() => expect(screen.getByRole('button', { name: /New Ship/ })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /New Ship/ }));

    fireEvent.change(screen.getByLabelText(/Ship Name/), { target: { value: 'Falcon' } });
    fireEvent.keyDown(document.body, { ctrlKey: true, key: 's', shiftKey: false });

    await waitFor(() => {
      expect(databaseService.saveOrUpdateShipByName).toHaveBeenCalledWith(
        expect.objectContaining({ ship: expect.objectContaining({ name: 'Falcon' }) })
      );
    });
  });

  it('handleFileSave alerts when DB throws', async () => {
    const { databaseService } = await import('./services/database');
    (databaseService.saveOrUpdateShipByName as ReturnType<typeof jest.fn>)
      .mockRejectedValueOnce(new Error('Duplicate ship name'));
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<App />);
    await waitFor(() => expect(screen.getByRole('button', { name: /New Ship/ })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /New Ship/ }));
    fireEvent.change(screen.getByLabelText(/Ship Name/), { target: { value: 'Falcon' } });
    fireEvent.keyDown(document.body, { ctrlKey: true, key: 's', shiftKey: false });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(expect.stringMatching(/Duplicate ship name/));
    });
    alertSpy.mockRestore();
  });

  // --- handleFileSaveAs ---

  it('handleFileSaveAs prompts for new name and saves', async () => {
    const { databaseService } = await import('./services/database');
    const promptSpy = jest.spyOn(window, 'prompt').mockReturnValue('New Falcon');

    render(<App />);
    await waitFor(() => expect(screen.getByRole('button', { name: /New Ship/ })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /New Ship/ }));
    fireEvent.change(screen.getByLabelText(/Ship Name/), { target: { value: 'Falcon' } });

    // Ctrl+Shift+S triggers Save As
    fireEvent.keyDown(document.body, { ctrlKey: true, shiftKey: true, key: 'S' });

    await waitFor(() => {
      expect(promptSpy).toHaveBeenCalled();
      expect(databaseService.saveShip).toHaveBeenCalledWith(
        expect.objectContaining({ ship: expect.objectContaining({ name: 'New Falcon' }) })
      );
    });
    promptSpy.mockRestore();
  });

  it('handleFileSaveAs does nothing when prompt is cancelled', async () => {
    const { databaseService } = await import('./services/database');
    jest.spyOn(window, 'prompt').mockReturnValue(null);

    render(<App />);
    await waitFor(() => expect(screen.getByRole('button', { name: /New Ship/ })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /New Ship/ }));
    fireEvent.change(screen.getByLabelText(/Ship Name/), { target: { value: 'Falcon' } });

    fireEvent.keyDown(document.body, { ctrlKey: true, shiftKey: true, key: 'S' });

    // saveShip should NOT be called
    expect(databaseService.saveShip).not.toHaveBeenCalled();
  });

  // --- keyboard shortcuts ignored in certain contexts ---

  it('keyboard shortcuts ignored when on Select Ship screen', async () => {
    const { databaseService } = await import('./services/database');
    render(<App />);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Select Ship' })).toBeInTheDocument());

    // Fire Ctrl+S on the Select Ship screen — should be ignored
    fireEvent.keyDown(document.body, { ctrlKey: true, key: 's', shiftKey: false });

    expect(databaseService.saveOrUpdateShipByName).not.toHaveBeenCalled();
  });

  // --- panel navigation and validation ---

  it('Next is disabled on panel 1 (Engines) when no engines configured', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByRole('button', { name: /New Ship/ })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /New Ship/ }));
    fireEvent.change(screen.getByLabelText(/Ship Name/), { target: { value: 'Nighthawk' } });
    fireEvent.click(screen.getByRole('button', { name: 'Next' })); // advance to panel 1

    await waitFor(() => expect(screen.getByRole('heading', { level: 2, name: 'Engines' })).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('clicking a nav button jumps to that panel', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByRole('button', { name: /New Ship/ })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /New Ship/ }));
    fireEvent.change(screen.getByLabelText(/Ship Name/), { target: { value: 'Nighthawk' } });

    // Click the "Engines" nav button directly
    fireEvent.click(screen.getByRole('button', { name: 'Engines' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: 'Engines' })).toBeInTheDocument();
    });
  });

  // --- handleLoadShip weapon cleanup ---

  it('handleLoadShip removes non-standard weapons and re-saves', async () => {
    const { databaseService } = await import('./services/database');
    const shipWithBadWeapon = {
      id: 42,
      createdAt: new Date(),
      updatedAt: new Date(),
      ship: { name: 'Clean Ship', tech_level: 'A', tonnage: 100, configuration: 'standard', fuel_weeks: 2, missile_reloads: 0, sand_reloads: 0, description: '' },
      engines: [],
      fittings: [],
      weapons: [{ weapon_name: 'Legacy Laser', mass: 2, cost: 1, quantity: 1 }],
      defenses: [],
      berths: [],
      facilities: [],
      cargo: [],
      vehicles: [],
      drones: []
    };
    (databaseService.getAllShips as ReturnType<typeof jest.fn>).mockResolvedValueOnce([shipWithBadWeapon]);
    (databaseService.getShipById as ReturnType<typeof jest.fn>).mockResolvedValueOnce(shipWithBadWeapon);

    render(<App />);
    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument());

    // Select the user ship and load it
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '42' } });
    fireEvent.click(screen.getByRole('button', { name: /Load Selected Ship/ }));

    await waitFor(() => {
      expect(databaseService.saveOrUpdateShipByName).toHaveBeenCalledWith(
        expect.objectContaining({ weapons: [] })
      );
    });
  });

  // --- Print keyboard shortcut ---

  it('Ctrl+P opens print window when ship has a name', async () => {
    const mockPrintWin = {
      document: { write: jest.fn(), close: jest.fn() },
      focus: jest.fn(),
      addEventListener: jest.fn(),
      print: jest.fn(),
      close: jest.fn()
    };
    const openSpy = jest.spyOn(window, 'open').mockReturnValue(mockPrintWin as unknown as Window);

    render(<App />);
    await waitFor(() => expect(screen.getByRole('button', { name: /New Ship/ })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /New Ship/ }));
    fireEvent.change(screen.getByLabelText(/Ship Name/), { target: { value: 'Print Ship' } });

    fireEvent.keyDown(document.body, { ctrlKey: true, key: 'p', shiftKey: false });

    expect(openSpy).toHaveBeenCalledWith('', '_blank');
    expect(mockPrintWin.document.write).toHaveBeenCalled();
    expect(mockPrintWin.print).toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it('Ctrl+P alerts when print window is blocked', async () => {
    const openSpy = jest.spyOn(window, 'open').mockReturnValue(null);
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<App />);
    await waitFor(() => expect(screen.getByRole('button', { name: /New Ship/ })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /New Ship/ }));
    fireEvent.change(screen.getByLabelText(/Ship Name/), { target: { value: 'Print Ship' } });

    fireEvent.keyDown(document.body, { ctrlKey: true, key: 'p', shiftKey: false });

    expect(alertSpy).toHaveBeenCalledWith(expect.stringMatching(/pop-ups/i));
    openSpy.mockRestore();
    alertSpy.mockRestore();
  });
});
