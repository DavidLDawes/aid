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
const mockPrintWindow = {
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
});
