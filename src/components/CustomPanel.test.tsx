import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';
import CustomPanel from './CustomPanel';
import type { CustomItem, CustomCrew } from '../types/ship';

const emptyCrew: CustomCrew = {
  pilot: 0, navigator: 0, engineers: 0, gunners: 0, service: 0, stewards: 0,
  nurses: 0, surgeons: 0, techs: 0, infantry: 0, armor: 0, mp: 0, security: 0,
};

describe('CustomPanel custom crew section', () => {
  const mockOnUpdate = jest.fn();
  const mockOnCrewUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('hides the custom crew section when there are no custom items', () => {
    render(<CustomPanel custom_items={[]} custom_crew={emptyCrew} onUpdate={mockOnUpdate} onCrewUpdate={mockOnCrewUpdate} />);
    expect(screen.queryByText('Custom Crew')).not.toBeInTheDocument();
  });

  it('shows the custom crew section once a custom item has been added', () => {
    const items: CustomItem[] = [{ name: 'Sensor Pod', mass: 5, cost: 2 }];
    render(<CustomPanel custom_items={items} custom_crew={emptyCrew} onUpdate={mockOnUpdate} onCrewUpdate={mockOnCrewUpdate} />);
    expect(screen.getByText('Custom Crew')).toBeInTheDocument();
  });

  it('shows a number entry for every crew category', () => {
    const items: CustomItem[] = [{ name: 'Sensor Pod', mass: 5, cost: 2 }];
    render(<CustomPanel custom_items={items} custom_crew={emptyCrew} onUpdate={mockOnUpdate} onCrewUpdate={mockOnCrewUpdate} />);
    ['Pilot', 'Navigator', 'Engineers', 'Gunners', 'Service', 'Stewards', 'Nurses', 'Surgeons', 'Techs',
      'Infantry', 'Armor', 'MP', 'Security'].forEach(label => {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    });
  });

  it('calls onCrewUpdate with the changed category when a crew count is edited', () => {
    const items: CustomItem[] = [{ name: 'Sensor Pod', mass: 5, cost: 2 }];
    render(<CustomPanel custom_items={items} custom_crew={emptyCrew} onUpdate={mockOnUpdate} onCrewUpdate={mockOnCrewUpdate} />);

    fireEvent.change(screen.getByLabelText('Infantry'), { target: { value: '4' } });

    expect(mockOnCrewUpdate).toHaveBeenCalledWith({ ...emptyCrew, infantry: 4 });
  });

  it('preserves other category counts when one is changed', () => {
    const items: CustomItem[] = [{ name: 'Sensor Pod', mass: 5, cost: 2 }];
    const crew: CustomCrew = { ...emptyCrew, security: 2 };
    render(<CustomPanel custom_items={items} custom_crew={crew} onUpdate={mockOnUpdate} onCrewUpdate={mockOnCrewUpdate} />);

    fireEvent.change(screen.getByLabelText('MP'), { target: { value: '3' } });

    expect(mockOnCrewUpdate).toHaveBeenCalledWith({ ...crew, mp: 3 });
  });

  it('treats a negative or invalid entry as zero', () => {
    const items: CustomItem[] = [{ name: 'Sensor Pod', mass: 5, cost: 2 }];
    render(<CustomPanel custom_items={items} custom_crew={emptyCrew} onUpdate={mockOnUpdate} onCrewUpdate={mockOnCrewUpdate} />);

    fireEvent.change(screen.getByLabelText('Armor'), { target: { value: '-5' } });

    expect(mockOnCrewUpdate).toHaveBeenCalledWith({ ...emptyCrew, armor: 0 });
  });
});
