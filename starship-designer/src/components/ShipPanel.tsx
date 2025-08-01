import React, { useState, useEffect, useCallback } from 'react';
import type { Ship, ShipDesign } from '../types/ship';
import { TECH_LEVELS, HULL_SIZES } from '../data/constants';
import { databaseService } from '../services/database';

interface ShipPanelProps {
  ship: Ship;
  onUpdate: (ship: Ship) => void;
  onLoadExistingShip?: (shipDesign: ShipDesign) => void;
}

const ShipPanel: React.FC<ShipPanelProps> = ({ ship, onUpdate, onLoadExistingShip }) => {
  const [nameCheckState, setNameCheckState] = useState<{
    isChecking: boolean;
    existingShipFound: boolean;
    showConflictDialog: boolean;
    existingShip: ShipDesign | null;
  }>({
    isChecking: false,
    existingShipFound: false,
    showConflictDialog: false,
    existingShip: null
  });

  const checkShipName = useCallback(async (name: string) => {
    if (!name.trim() || name.length < 2) {
      setNameCheckState(prev => ({ ...prev, existingShipFound: false, showConflictDialog: false }));
      return;
    }

    try {
      setNameCheckState(prev => ({ ...prev, isChecking: true }));
      await databaseService.initialize();
      const existingShip = await databaseService.getShipByName(name.trim());
      
      if (existingShip) {
        setNameCheckState({
          isChecking: false,
          existingShipFound: true,
          showConflictDialog: true,
          existingShip: {
            ship: existingShip.ship,
            engines: existingShip.engines,
            fittings: existingShip.fittings,
            weapons: existingShip.weapons,
            defenses: existingShip.defenses,
            berths: existingShip.berths,
            facilities: existingShip.facilities,
            cargo: existingShip.cargo,
            vehicles: existingShip.vehicles,
            drones: existingShip.drones
          }
        });
      } else {
        setNameCheckState({
          isChecking: false,
          existingShipFound: false,
          showConflictDialog: false,
          existingShip: null
        });
      }
    } catch (error) {
      console.error('Error checking ship name:', error);
      setNameCheckState(prev => ({ ...prev, isChecking: false }));
    }
  }, []);

  useEffect(() => {
    // Check immediately when name changes
    if (ship.name.trim() && ship.name.length >= 2) {
      checkShipName(ship.name);
    }
    
    // Also check after a delay for final validation
    const timeoutId = setTimeout(() => {
      checkShipName(ship.name);
    }, 1500); // Debounce for 1500ms

    return () => clearTimeout(timeoutId);
  }, [ship.name, checkShipName]);

  const handleInputChange = (field: keyof Ship, value: string | number) => {
    onUpdate({ ...ship, [field]: value });
  };

  const handleLoadExistingShip = () => {
    if (nameCheckState.existingShip && onLoadExistingShip) {
      onLoadExistingShip(nameCheckState.existingShip);
    }
    setNameCheckState(prev => ({ ...prev, showConflictDialog: false }));
  };

  const handleKeepNewName = () => {
    setNameCheckState(prev => ({ ...prev, showConflictDialog: false, existingShipFound: false }));
  };

  const handleChangeNameFocus = () => {
    // Focus the name input to allow user to change the name
    const nameInput = document.getElementById('ship-name');
    if (nameInput) {
      nameInput.focus();
    }
  };

  return (
    <div className="panel-content">
      <div className="ship-basic-info-row">
        <div className="form-group">
          <label htmlFor="ship-name">Ship Name *</label>
          <div className="ship-name-input-container">
            <input
              id="ship-name"
              type="text"
              maxLength={32}
              value={ship.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter ship name (max 32 characters)"
              className={nameCheckState.existingShipFound ? 'name-conflict' : ''}
            />
            {nameCheckState.isChecking && (
              <span className="name-check-status checking">Checking...</span>
            )}
            {nameCheckState.existingShipFound && !nameCheckState.showConflictDialog && (
              <span className="name-check-status conflict">Ship name already exists</span>
            )}
          </div>
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

      {nameCheckState.showConflictDialog && nameCheckState.existingShip && (
        <div className="ship-name-conflict-dialog">
          <div className="conflict-dialog-content">
            <h3>Ship Name Already Exists</h3>
            <p>A ship named "<strong>{ship.name}</strong>" already exists in your saved designs.</p>
            <div className="existing-ship-info">
              <p><strong>Existing Ship Details:</strong></p>
              <ul>
                <li>Tonnage: {nameCheckState.existingShip.ship.tonnage} tons</li>
                <li>Tech Level: {nameCheckState.existingShip.ship.tech_level}</li>
                <li>Configuration: {nameCheckState.existingShip.ship.configuration}</li>
                {nameCheckState.existingShip.ship.description && (
                  <li>Description: {nameCheckState.existingShip.ship.description}</li>
                )}
              </ul>
            </div>
            <div className="conflict-dialog-actions">
              <button 
                onClick={handleLoadExistingShip}
                className="load-existing-btn"
                disabled={!onLoadExistingShip}
              >
                Load Existing Ship
              </button>
              <button 
                onClick={handleChangeNameFocus}
                className="change-name-btn"
              >
                Choose Different Name
              </button>
              <button 
                onClick={handleKeepNewName}
                className="keep-name-btn"
              >
                Keep This Name (Will Replace)
              </button>
            </div>
          </div>
        </div>
      )}

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