import { useState, useEffect } from 'react';
import { databaseService, type StoredShipDesign } from '../services/database';
import type { ShipDesign } from '../types/ship';
import { logger } from '../utils/logger';

interface SelectShipPanelProps {
  onNewShip: () => void;
  onLoadShip: (shipDesign: ShipDesign) => void;
}

export default function SelectShipPanel({ onNewShip, onLoadShip }: SelectShipPanelProps) {
  const [ships, setShips] = useState<StoredShipDesign[]>([]);
  const [selectedShipId, setSelectedShipId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadShips();
  }, []);

  const createDefaultShips = () => {
    // Fallback: create default megastructure in memory if all loading fails
    const ringWorld = {
      id: -1,
      ship: {
        name: 'Ring World Alpha',
        tech_level: 'H' as const,
        tonnage: 5_000_000,
        configuration: 'distributed' as const,
        fuel_weeks: 4,
        missile_reloads: 0,
        sand_reloads: 0,
        sections: 5,
        description: 'Five-section ring world habitat'
      },
      engines: [
        { engine_type: 'power_plant' as const, drive_code: 'P-6', performance: 6, mass: 50000, cost: 100000 },
        { engine_type: 'maneuver_drive' as const, drive_code: 'M-1', performance: 1, mass: 25000, cost: 50000 }
      ],
      fittings: [
        { fitting_type: 'comms_sensors' as const, comms_sensors_type: 'very_advanced' as const, mass: 500, cost: 200 },
        { fitting_type: 'computer' as const, computer_model: 'core_9' as const, mass: 0, cost: 36000 }
      ],
      weapons: [],
      defenses: [],
      berths: [
        { berth_type: 'staterooms' as const, quantity: 10000, mass: 4, cost: 0.5 }
      ],
      facilities: [
        { facility_type: 'commissary' as const, quantity: 20, mass: 2, cost: 0.2 }
      ],
      cargo: [],
      vehicles: [],
      drones: [],
      custom_items: [],
      fuel_systems: [
        { system_type: 'fuel_scoop' as const, quantity: 1000, mass: 0, cost: 1000 },
        { system_type: 'fuel_processor' as const, quantity: 10, mass: 10000, cost: 500 },
        { system_type: 'fuel_tank' as const, quantity: 500, mass: 500000, cost: 500 }
      ],
      zone_sections: [
        { zone_type: 'residential' as const, units: 500, mass: 500000, cost: 20000 },
        { zone_type: 'farm' as const, units: 200, mass: 200000, cost: 6000 },
        { zone_type: 'park' as const, units: 100, mass: 100000, cost: 6000 }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return [ringWorld];
  };

  async function loadShips() {
    try {
      setLoading(true);
      setError(null);
      await databaseService.initialize();
      let savedShips = await databaseService.getAllShips();
      logger.info(`SelectShipPanel loaded ${savedShips.length} ships from database`);

      // If no ships exist, use hardcoded defaults
      if (savedShips.length === 0) {
        logger.info('No ships in database, using hardcoded default ships');
        savedShips = createDefaultShips();
      }

      setShips(savedShips);
      logger.info(`Final ships array set: ${savedShips.length} (${savedShips.map(s => s.ship.name).join(', ')})`);
    } catch (err) {
      logger.error('SelectShipPanel error during ship loading', err);
      // Emergency fallback
      logger.info('Emergency fallback: using hardcoded ships due to error');
      const defaultShips = createDefaultShips();
      setShips(defaultShips);
      setError(null); // Clear error since we have fallback ships
    } finally {
      setLoading(false);
    }
  }

  const handleLoadSelectedShip = async () => {
    if (!selectedShipId) return;

    try {
      // Check if this is a hardcoded ship (negative ID)
      if (selectedShipId < 0) {
        const ship = ships.find(s => s.id === selectedShipId);
        if (ship) {
          logger.info(`Loading hardcoded ship: ${ship.ship.name}`);
          // Remove database-specific fields before passing to parent
          const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...shipDesign } = ship;
          onLoadShip(shipDesign);
          return;
        }
      }

      // Regular database ship loading
      const ship = await databaseService.getShipById(selectedShipId);
      if (ship) {
        logger.info(`Loading database ship: ${ship.ship.name}`);
        // Remove database-specific fields before passing to parent
        const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...shipDesign } = ship;
        onLoadShip(shipDesign);
      }
    } catch (err) {
      setError('Failed to load selected ship');
      logger.error('Load ship error', err);
    }
  };

  if (loading) {
    return (
      <div className="select-ship-panel">
        <p>Loading structures...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="select-ship-panel">
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={loadShips}>Retry</button>
        </div>
        <div className="panel-actions">
          <button onClick={onNewShip} className="new-ship-button">
            New Structure
          </button>
        </div>
      </div>
    );
  }

  if (ships.length === 0) {
    return (
      <div className="select-ship-panel">
        <p>No saved structures found. Create your first megastructure design!</p>
        <div className="panel-actions">
          <button onClick={onNewShip} className="new-ship-button">
            New Structure
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="select-ship-panel">
      <div className="ship-selection">
        <label htmlFor="ship-select">Select a structure to load:</label>
        <select
          id="ship-select"
          value={selectedShipId || ''}
          onChange={(e) => setSelectedShipId(e.target.value ? Number(e.target.value) : null)}
          className="ship-dropdown"
        >
          <option value="">-- Select a structure --</option>
          {ships.map((ship) => (
            <option key={ship.id} value={ship.id}>
              {ship.ship.name} ({ship.ship.tonnage.toLocaleString()} tons, TL{ship.ship.tech_level})
            </option>
          ))}
        </select>
      </div>

      {selectedShipId && (
        <div className="ship-preview">
          <h3>Structure Details</h3>
          {(() => {
            const selectedShip = ships.find(s => s.id === selectedShipId);
            if (!selectedShip) return null;

            return (
              <div className="ship-details">
                <p><strong>Name:</strong> {selectedShip.ship.name}</p>
                <p><strong>Tech Level:</strong> {selectedShip.ship.tech_level}</p>
                <p><strong>Tonnage:</strong> {selectedShip.ship.tonnage.toLocaleString()}</p>
                <p><strong>Created:</strong> {selectedShip.createdAt.toLocaleDateString()}</p>
                <p><strong>Last Modified:</strong> {selectedShip.updatedAt.toLocaleDateString()}</p>
                {selectedShip.ship.description && (
                  <p><strong>Description:</strong> {selectedShip.ship.description}</p>
                )}
              </div>
            );
          })()}
        </div>
      )}

      <div className="panel-actions">
        <button
          onClick={handleLoadSelectedShip}
          disabled={!selectedShipId}
          className="load-ship-button"
        >
          Load Selected Structure
        </button>

        <button onClick={onNewShip} className="new-ship-button">
          New Structure
        </button>
      </div>
    </div>
  );
}