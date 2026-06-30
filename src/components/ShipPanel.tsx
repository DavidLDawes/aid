import React, { useState, useEffect, useCallback } from 'react';
import type { Ship, ShipDesign } from '../types/ship';
import { TECH_LEVELS, MEGASTRUCTURE_HULL_SIZES, getMegastructureSections } from '../data/constants';
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
            drones: existingShip.drones,
            custom_items: existingShip.custom_items || [],
            fuel_systems: (existingShip as unknown as ShipDesign).fuel_systems || [],
            zone_sections: (existingShip as unknown as ShipDesign).zone_sections || []
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
    const timeoutId = setTimeout(() => {
      checkShipName(ship.name);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [ship.name, checkShipName]);

  const handleInputChange = (field: keyof Ship, value: string | number) => {
    onUpdate({ ...ship, [field]: value });
  };

  const handleTonnageChange = (newTonnage: number) => {
    onUpdate({ ...ship, tonnage: newTonnage, sections: getMegastructureSections(newTonnage) });
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
    const nameInput = document.getElementById('ship-name');
    if (nameInput) nameInput.focus();
  };

  const sections = getMegastructureSections(ship.tonnage);

  return (
    <div className="panel-content">
      <p>Megastructures are &gt;1,000,000 tons. Configuration is distributed (multiple million-ton sections).</p>

      <div className="ship-basic-info-row">
        <div className="form-group">
          <label htmlFor="ship-name">Megastructure Name *</label>
          <div className="ship-name-input-container">
            <input
              id="ship-name"
              type="text"
              maxLength={32}
              value={ship.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter megastructure name (max 32 characters)"
              className={nameCheckState.existingShipFound ? 'name-conflict' : ''}
            />
            {nameCheckState.isChecking && (
              <span className="name-check-status checking">Checking...</span>
            )}
            {nameCheckState.existingShipFound && !nameCheckState.showConflictDialog && (
              <span className="name-check-status conflict">Name already exists</span>
            )}
          </div>
          <small>{ship.name.length}/32 characters</small>
        </div>

        <div className="form-group">
          <label htmlFor="tonnage">Total Tonnage *</label>
          <select
            id="tonnage"
            value={ship.tonnage}
            onChange={(e) => handleTonnageChange(parseInt(e.target.value))}
          >
            {MEGASTRUCTURE_HULL_SIZES.map(hull => (
              <option key={hull.tonnage} value={hull.tonnage}>
                {hull.tonnage.toLocaleString()} tons ({hull.tonnage / 1_000_000}M) — {hull.cost.toLocaleString()} MCr hull
              </option>
            ))}
          </select>
          <div className="info-message" style={{ marginTop: '0.5rem' }}>
            <p><strong>Sections:</strong> {sections} × 1,000,000-ton sections</p>
            <p><strong>Control Center:</strong> {(sections * 100).toLocaleString()} tons required</p>
          </div>
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
      </div>

      <div className="ship-description-row">
        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <textarea
            id="description"
            maxLength={250}
            value={ship.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter megastructure description (max 250 characters)"
            rows={4}
          />
          <small>{(ship.description || '').length}/250 characters</small>
        </div>
      </div>

      {nameCheckState.showConflictDialog && nameCheckState.existingShip && (
        <div className="ship-name-conflict-dialog">
          <div className="conflict-dialog-content">
            <h3>Name Already Exists</h3>
            <p>A megastructure named "<strong>{ship.name}</strong>" already exists in your saved designs.</p>
            <div className="existing-ship-info">
              <ul>
                <li>Tonnage: {nameCheckState.existingShip.ship.tonnage.toLocaleString()} tons</li>
                <li>Tech Level: {nameCheckState.existingShip.ship.tech_level}</li>
              </ul>
            </div>
            <div className="conflict-dialog-actions">
              <button onClick={handleLoadExistingShip} className="load-existing-btn" disabled={!onLoadExistingShip}>
                Load Existing
              </button>
              <button onClick={handleChangeNameFocus} className="change-name-btn">
                Choose Different Name
              </button>
              <button onClick={handleKeepNewName} className="keep-name-btn">
                Keep This Name (Will Replace)
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="validation-info">
        <h3>Requirements:</h3>
        <ul>
          <li className={ship.name.trim() ? 'valid' : 'invalid'}>✓ Name is required</li>
          <li className={ship.tech_level ? 'valid' : 'invalid'}>✓ Tech level is required</li>
          <li className={ship.tonnage >= 1_000_000 ? 'valid' : 'invalid'}>✓ Tonnage must be ≥ 1,000,000 tons</li>
        </ul>
      </div>
    </div>
  );
};

export default ShipPanel;
