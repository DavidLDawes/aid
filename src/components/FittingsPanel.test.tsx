import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';
import FittingsPanel from './FittingsPanel';
import type { Fitting } from '../types/ship';

const noOp = jest.fn();

const renderPanel = (fittings: Fitting[] = [], shipTonnage = 200) =>
  render(<FittingsPanel fittings={fittings} shipTonnage={shipTonnage} onUpdate={noOp} />);

describe('FittingsPanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders bridge type section', () => {
    renderPanel();
    expect(screen.getByText(/Bridge Type/)).toBeInTheDocument();
  });

  it('shows no bridge selected initially', () => {
    renderPanel();
    const radios = screen.getAllByRole('radio');
    radios.forEach(r => expect(r).not.toBeChecked());
  });

  it('selects Full Bridge radio when bridge fitting present', () => {
    const fittings: Fitting[] = [{ fitting_type: 'bridge', mass: 10, cost: 5 }];
    renderPanel(fittings);
    const [fullBridge] = screen.getAllByRole('radio');
    expect(fullBridge).toBeChecked();
  });

  it('selects Half Bridge radio when half_bridge fitting present', () => {
    const fittings: Fitting[] = [{ fitting_type: 'half_bridge', mass: 5, cost: 7.5 }];
    renderPanel(fittings);
    const [, halfBridge] = screen.getAllByRole('radio');
    expect(halfBridge).toBeChecked();
  });

  it('clicking Full Bridge radio calls onUpdate with bridge fitting', () => {
    const onUpdate = jest.fn();
    render(<FittingsPanel fittings={[]} shipTonnage={200} onUpdate={onUpdate} />);
    const [fullBridgeRadio] = screen.getAllByRole('radio');
    fireEvent.click(fullBridgeRadio);
    expect(onUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ fitting_type: 'bridge', mass: 10, cost: 5 })])
    );
  });

  it('clicking Half Bridge radio calls onUpdate with half_bridge fitting', () => {
    const onUpdate = jest.fn();
    render(<FittingsPanel fittings={[]} shipTonnage={200} onUpdate={onUpdate} />);
    const [, halfBridgeRadio] = screen.getAllByRole('radio');
    fireEvent.click(halfBridgeRadio);
    expect(onUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ fitting_type: 'half_bridge', mass: 5 })])
    );
  });

  it('switching bridge type removes old bridge from fittings', () => {
    const onUpdate = jest.fn();
    const fittings: Fitting[] = [{ fitting_type: 'bridge', mass: 10, cost: 5 }];
    render(<FittingsPanel fittings={fittings} shipTonnage={200} onUpdate={onUpdate} />);
    const [, halfBridgeRadio] = screen.getAllByRole('radio');
    fireEvent.click(halfBridgeRadio);
    const result = onUpdate.mock.calls[0][0] as Fitting[];
    expect(result.some(f => f.fitting_type === 'bridge')).toBe(false);
    expect(result.some(f => f.fitting_type === 'half_bridge')).toBe(true);
  });

  it('shows Add Launch Tube button', () => {
    renderPanel();
    expect(screen.getByText('Add Launch Tube')).toBeInTheDocument();
  });

  it('clicking Add Launch Tube calls onUpdate with launch_tube fitting', () => {
    const onUpdate = jest.fn();
    render(<FittingsPanel fittings={[]} shipTonnage={200} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByText('Add Launch Tube'));
    expect(onUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ fitting_type: 'launch_tube', mass: 25 })])
    );
  });

  it('shows existing launch tubes with Remove buttons', () => {
    const fittings: Fitting[] = [{ fitting_type: 'launch_tube', mass: 25, cost: 0.5, launch_vehicle_mass: 1 }];
    renderPanel(fittings);
    expect(screen.getByText(/Launch Tube 1/)).toBeInTheDocument();
    expect(screen.getByText('Remove')).toBeInTheDocument();
  });

  it('Remove launch tube calls onUpdate without the removed tube', () => {
    const onUpdate = jest.fn();
    const fittings: Fitting[] = [{ fitting_type: 'launch_tube', mass: 25, cost: 0.5, launch_vehicle_mass: 1 }];
    render(<FittingsPanel fittings={fittings} shipTonnage={200} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByText('Remove'));
    expect(onUpdate).toHaveBeenCalledWith([]);
  });

  it('shows comms & sensors select defaulting to standard', () => {
    renderPanel();
    const select = screen.getByLabelText(/Comms & Sensors Type/);
    expect(select).toHaveValue('standard');
  });

  it('changing comms sensors calls onUpdate with new sensor fitting', () => {
    const onUpdate = jest.fn();
    render(<FittingsPanel fittings={[]} shipTonnage={200} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText(/Comms & Sensors Type/), { target: { value: 'basic_civilian' } });
    expect(onUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ fitting_type: 'comms_sensors', comms_sensors_type: 'basic_civilian' })])
    );
  });

  it('shows invalid validation when no bridge selected', () => {
    renderPanel();
    const item = screen.getByText(/Bridge or Half Bridge selected/).closest('li');
    expect(item?.className).toContain('invalid');
  });

  it('shows valid validation when bridge is selected', () => {
    const fittings: Fitting[] = [{ fitting_type: 'bridge', mass: 10, cost: 5 }];
    renderPanel(fittings);
    const item = screen.getByText(/Bridge or Half Bridge selected/).closest('li');
    expect(item?.className).toContain('valid');
  });

  it('bridge mass scales with ship tonnage', () => {
    renderPanel([], 1000);
    // 1000-ton ship → 20-ton full bridge
    expect(screen.getByText(/Full Bridge.*20 tons/)).toBeInTheDocument();
  });
});
