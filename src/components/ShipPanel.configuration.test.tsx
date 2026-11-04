import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';
import ShipPanel from './ShipPanel';
import type { Ship } from '../types/ship';

jest.mock('../services/database', () => ({
  databaseService: {
    initialize: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    getShipByName: jest.fn<() => Promise<null>>().mockResolvedValue(null)
  }
}));

const createShip = (overrides: Partial<Ship> = {}): Ship => ({
  name: 'Test Ship',
  tech_level: 'C',
  tonnage: 5000,
  configuration: 'standard',
  configuration_shape: 'wedge',
  fuel_weeks: 2,
  missile_reloads: 0,
  sand_reloads: 0,
  description: '',
  ...overrides
});

const optionLabels = (select: HTMLElement) =>
  Array.from(select.querySelectorAll('option')).map(option => option.textContent);

describe('ShipPanel configuration shape', () => {
  const onUpdate = jest.fn<(ship: Ship) => void>();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('offers wedge, cone, sphere and cylinder for a standard hull', () => {
    render(<ShipPanel ship={createShip()} onUpdate={onUpdate} />);
    const select = screen.getByLabelText(/Shape/);
    expect(select).toHaveValue('wedge');
    expect(optionLabels(select)).toEqual(['Wedge', 'Cone', 'Sphere', 'Cylinder']);
  });

  it('offers wing, disk and lifting body for a streamlined hull', () => {
    render(<ShipPanel ship={createShip({ configuration: 'streamlined', configuration_shape: 'disk' })} onUpdate={onUpdate} />);
    const select = screen.getByLabelText(/Shape/);
    expect(select).toHaveValue('disk');
    expect(optionLabels(select)).toEqual(['Wing', 'Disk', 'Lifting Body']);
  });

  it('offers no shape for a distributed hull', () => {
    render(<ShipPanel ship={createShip({ configuration: 'distributed', configuration_shape: undefined })} onUpdate={onUpdate} />);
    expect(screen.queryByLabelText(/Shape/)).not.toBeInTheDocument();
  });

  it('updates the ship when a shape is chosen', () => {
    render(<ShipPanel ship={createShip()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText(/Shape/), { target: { value: 'sphere' } });
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ configuration: 'standard', configuration_shape: 'sphere' }));
  });

  it('switches to lifting body when the configuration changes to streamlined', () => {
    render(<ShipPanel ship={createShip()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText(/Configuration/), { target: { value: 'streamlined' } });
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ configuration: 'streamlined', configuration_shape: 'lifting_body' }));
  });

  it('switches to wedge when the configuration changes to standard', () => {
    render(<ShipPanel ship={createShip({ configuration: 'streamlined', configuration_shape: 'disk' })} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText(/Configuration/), { target: { value: 'standard' } });
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ configuration: 'standard', configuration_shape: 'wedge' }));
  });

  it('clears the shape when the configuration changes to distributed', () => {
    render(<ShipPanel ship={createShip()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText(/Configuration/), { target: { value: 'distributed' } });
    expect(onUpdate.mock.calls[0][0].configuration).toBe('distributed');
    expect(onUpdate.mock.calls[0][0].configuration_shape).toBeUndefined();
  });

  it('shows wedge on a standard design saved before shapes existed', () => {
    render(<ShipPanel ship={createShip({ configuration_shape: undefined })} onUpdate={onUpdate} />);
    expect(screen.getByLabelText(/Shape/)).toHaveValue('wedge');
  });

  it('shows lifting body on a streamlined design saved before shapes existed', () => {
    render(<ShipPanel ship={createShip({ configuration: 'streamlined', configuration_shape: undefined })} onUpdate={onUpdate} />);
    expect(screen.getByLabelText(/Shape/)).toHaveValue('lifting_body');
  });

  it('describes the floor profile for a wedge only', () => {
    const { rerender } = render(<ShipPanel ship={createShip()} onUpdate={onUpdate} />);
    expect(screen.getByText(/Top and bottom floors are 75% as long/)).toBeInTheDocument();
    rerender(<ShipPanel ship={createShip({ configuration_shape: 'cone' })} onUpdate={onUpdate} />);
    expect(screen.queryByText(/Top and bottom floors/)).not.toBeInTheDocument();
  });
});
