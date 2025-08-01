import React from 'react';
import type { Ship } from '../types/ship';
import { TECH_LEVELS, HULL_SIZES } from '../data/constants';

interface ShipPanelProps {
  ship: Ship;
  onUpdate: (ship: Ship) => void;
}

const ShipPanel: React.FC<ShipPanelProps> = ({ ship, onUpdate }) => {
  const handleInputChange = (field: keyof Ship, value: string | number) => {
    onUpdate({ ...ship, [field]: value });
  };

  return (
    <div className="panel-content">
      <div className="ship-basic-info-row">
        <div className="form-group">
          <label htmlFor="ship-name">Ship Name *</label>
          <input
            id="ship-name"
            type="text"
            maxLength={32}
            value={ship.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter ship name (max 32 characters)"
          />
          <small>{ship.name.length}/32 characters</small>
        </div>

        <div className="form-group">
          <label htmlFor="tonnage">Hull Size *</label>
          <select
            id="tonnage"
            value={ship.tonnage}
            onChange={(e) => handleInputChange('tonnage', parseInt(e.target.value))}
          >
            {HULL_SIZES.map(hull => (
              <option key={hull.tonnage} value={hull.tonnage}>
                {hull.tonnage} tons (Hull {hull.code}) - {hull.cost} MCr
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="tech-level">Tech Level *</label>
          <select
            id="tech-level"
            value={ship.tech_level}
            onChange={(e) => handleInputChange('tech_level', e.target.value)}
          >
            {TECH_LEVELS.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="configuration">Configuration *</label>
          <select
            id="configuration"
            value={ship.configuration}
            onChange={(e) => handleInputChange('configuration', e.target.value)}
          >
            <option value="standard">Standard (wedge, cone, sphere or cylinder)</option>
            <option value="streamlined">Streamlined (wing, disc or lifting body for atmospheric entry)</option>
            <option value="distributed">Distributed (multiple sections, atmosphere/gravity incompatible)</option>
          </select>
        </div>
      </div>

      <div className="ship-description-row">
        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <textarea
            id="description"
            maxLength={250}
            value={ship.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter ship description (max 250 characters)"
            rows={4}
          />
          <small>{(ship.description || '').length}/250 characters</small>
        </div>
      </div>

      <div className="validation-info">
        <h3>Requirements:</h3>
        <ul>
          <li className={ship.name.trim() ? 'valid' : 'invalid'}>
            ✓ Ship name is required
          </li>
          <li className={ship.tech_level ? 'valid' : 'invalid'}>
            ✓ Tech level is required
          </li>
          <li className={ship.tonnage >= 100 ? 'valid' : 'invalid'}>
            ✓ Hull size is required
          </li>
          <li className={ship.configuration ? 'valid' : 'invalid'}>
            ✓ Configuration is required
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ShipPanel;