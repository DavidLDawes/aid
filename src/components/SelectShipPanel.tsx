import { useState, useEffect, useCallback } from 'react';
import { databaseService, type StoredShipDesign } from '../services/database';
import { initialDataService } from '../services/initialDataService';
import type { ShipDesign } from '../types/ship';
import { logger } from '../utils/logger';

interface SelectShipPanelProps {
  onNewShip: () => void;
  onLoadShip: (shipDesign: ShipDesign) => void;
}

function createDefaultShips(): StoredShipDesign[] {
  const defaultFreeTrader: StoredShipDesign = {
    id: -1,
    ship: {
      name: 'Free Trader',
      tech_level: 'C',
      tonnage: 400,
      configuration: 'standard',
      fuel_weeks: 4,
      missile_reloads: 0,
      sand_reloads: 0,
      description: 'Merchant vessel'
    },
    engines: [
      { engine_type: 'power_plant', drive_code: 'D', performance: 2, mass: 13, cost: 32 },
      { engine_type: 'jump_drive', drive_code: 'D', performance: 2, mass: 25, cost: 40 },
      { engine_type: 'maneuver_drive', drive_code: 'D', performance: 2, mass: 7, cost: 16 }
    ],
    fittings: [
      { fitting_type: 'bridge', mass: 10, cost: 2 },
      { fitting_type: 'comms_sensors', comms_sensors_type: 'standard', mass: 0, cost: 0 }
    ],
    weapons: [{ weapon_name: 'Hard Point', mass: 1, cost: 1, quantity: 4 }],
    defenses: [],
    berths: [],
    facilities: [{ facility_type: 'commissary', quantity: 1, mass: 2, cost: 0.2 }],
    cargo: [
      { cargo_type: 'cargo_bay', tonnage: 132, cost: 0 },
      { cargo_type: 'spares', tonnage: 4, cost: 2 },
      { cargo_type: 'cold_storage_bay', tonnage: 2, cost: 0.4 },
      { cargo_type: 'secure_storage_bay', tonnage: 1, cost: 0.7 }
    ],
    vehicles: [{ vehicle_type: 'air_raft_truck', quantity: 1, mass: 5, cost: 0.55 }],
    drones: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const defaultScout: StoredShipDesign = {
    id: -2,
    ship: {
      name: 'Scout',
      tech_level: 'E',
      tonnage: 100,
      configuration: 'standard',
      fuel_weeks: 4,
      missile_reloads: 0,
      sand_reloads: 0,
      description: 'Fast long ranged ship, low crew overhead'
    },
    engines: [
      { engine_type: 'power_plant', drive_code: 'B', performance: 4, mass: 7, cost: 16 },
      { engine_type: 'jump_drive', drive_code: 'B', performance: 4, mass: 15, cost: 20 },
      { engine_type: 'maneuver_drive', drive_code: 'B', performance: 4, mass: 3, cost: 8 }
    ],
    fittings: [
      { fitting_type: 'bridge', mass: 10, cost: 2 },
      { fitting_type: 'comms_sensors', comms_sensors_type: 'standard', mass: 0, cost: 0 }
    ],
    weapons: [],
    defenses: [],
    berths: [],
    facilities: [],
    cargo: [{ cargo_type: 'cargo_bay', tonnage: 3, cost: 0 }],
    vehicles: [],
    drones: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const defaultFatTrader: StoredShipDesign = {
    id: -3,
    ship: {
      name: 'Fat Trader',
      tech_level: 'C',
      tonnage: 600,
      configuration: 'standard',
      fuel_weeks: 4,
      missile_reloads: 0,
      sand_reloads: 0,
      description: 'A larger merchant vessel'
    },
    engines: [
      { engine_type: 'power_plant', drive_code: 'D', performance: 2, mass: 13, cost: 32 },
      { engine_type: 'jump_drive', drive_code: 'D', performance: 2, mass: 25, cost: 40 },
      { engine_type: 'maneuver_drive', drive_code: 'D', performance: 2, mass: 7, cost: 16 }
    ],
    fittings: [
      { fitting_type: 'bridge', mass: 10, cost: 2 },
      { fitting_type: 'comms_sensors', comms_sensors_type: 'standard', mass: 0, cost: 0 }
    ],
    weapons: [{ weapon_name: 'Hard Point', mass: 1, cost: 1, quantity: 6 }],
    defenses: [],
    berths: [],
    facilities: [],
    cargo: [],
    vehicles: [],
    drones: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return [defaultScout, defaultFreeTrader, defaultFatTrader];
}

export default function SelectShipPanel({ onNewShip, onLoadShip }: SelectShipPanelProps) {
  const [ships, setShips] = useState<StoredShipDesign[]>([]);
  const [selectedShipId, setSelectedShipId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadShips = useCallback(async () => {
    logger.info('Loading ships from database');
    try {
      setLoading(true);
      setError(null);
      await databaseService.initialize();
      let savedShips = await databaseService.getAllShips();
      logger.info(`Loaded ${savedShips.length} ship(s) from database`);

      if (savedShips.length === 0) {
        logger.info('No ships found, attempting to load initial data');
        const loaded = await initialDataService.loadInitialDataIfNeeded();
        logger.info(`Initial data load result: ${loaded}`);

        if (loaded) {
          savedShips = await databaseService.getAllShips();
          logger.info(`After initial load: ${savedShips.length} ship(s) available`);
        }

        if (savedShips.length === 0) {
          logger.info('All load methods failed, using hardcoded default ships');
          savedShips = createDefaultShips();
        }
      }

      setShips(savedShips);
      logger.info(`Ship list ready: ${savedShips.map(s => s.ship.name).join(', ')}`);
    } catch (err) {
      logger.error('Error during ship loading, falling back to hardcoded defaults', err);
      const defaultShips = createDefaultShips();
      setShips(defaultShips);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShips();
  }, [loadShips]);

  const handleDeleteSelectedShip = async () => {
    if (!selectedShipId || selectedShipId < 0) return;
    const ship = ships.find(s => s.id === selectedShipId);
    if (!ship) return;
    if (!window.confirm(`Delete "${ship.ship.name}"? This cannot be undone.`)) return;
    try {
      await databaseService.deleteShip(selectedShipId);
      logger.info(`Deleted ship "${ship.ship.name}"`);
      setSelectedShipId(null);
      await loadShips();
    } catch (err) {
      logger.error(`Failed to delete ship id=${selectedShipId}`, err);
      setError('Failed to delete ship');
    }
  };

  const handleLoadSelectedShip = async () => {
    if (!selectedShipId) return;

    logger.info(`Loading ship id=${selectedShipId}`);
    try {
      if (selectedShipId < 0) {
        const ship = ships.find(s => s.id === selectedShipId);
        if (ship) {
          logger.info(`Loading hardcoded default ship "${ship.ship.name}"`);
          const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...shipDesign } = ship;
          onLoadShip(shipDesign);
          return;
        }
      }

      const ship = await databaseService.getShipById(selectedShipId);
      if (ship) {
        logger.info(`Loading database ship "${ship.ship.name}" (${ship.ship.tonnage} tons, TL${ship.ship.tech_level})`);
        const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...shipDesign } = ship;
        onLoadShip(shipDesign);
      } else {
        logger.error(`Ship id=${selectedShipId} not found in database`);
        setError('Selected ship not found');
      }
    } catch (err) {
      logger.error(`Failed to load ship id=${selectedShipId}`, err);
      setError('Failed to load selected ship');
    }
  };

  if (loading) {
    return (
      <div className="select-ship-panel">
        <p>Loading ships...</p>
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
            New Ship
          </button>
        </div>
      </div>
    );
  }

  if (ships.length === 0) {
    return (
      <div className="select-ship-panel">
        <p>No saved ships found. Create your first ship design!</p>
        <div className="panel-actions">
          <button onClick={onNewShip} className="new-ship-button">
            New Ship
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="select-ship-panel">
      <div className="ship-selection">
        <label htmlFor="ship-select">Select a ship to load:</label>
        <select
          id="ship-select"
          value={selectedShipId || ''}
          onChange={(e) => setSelectedShipId(e.target.value ? Number(e.target.value) : null)}
          className="ship-dropdown"
        >
          <option value="">-- Select a ship --</option>
          {ships.map((ship) => (
            <option key={ship.id} value={ship.id}>
              {ship.ship.name} ({ship.ship.tonnage} tons, TL{ship.ship.tech_level})
            </option>
          ))}
        </select>
      </div>

      {selectedShipId && (
        <div className="ship-preview">
          <h3>Ship Details</h3>
          {(() => {
            const selectedShip = ships.find(s => s.id === selectedShipId);
            if (!selectedShip) return null;

            return (
              <div className="ship-details">
                <p><strong>Name:</strong> {selectedShip.ship.name}</p>
                <p><strong>Tech Level:</strong> {selectedShip.ship.tech_level}</p>
                <p><strong>Tonnage:</strong> {selectedShip.ship.tonnage}</p>
                <p><strong>Configuration:</strong> {selectedShip.ship.configuration}</p>
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
          Load Selected Ship
        </button>

        <button
          onClick={handleDeleteSelectedShip}
          disabled={!selectedShipId || (selectedShipId !== null && selectedShipId < 0)}
          className="delete-ship-button"
        >
          Delete Selected Ship
        </button>

        <button onClick={onNewShip} className="new-ship-button">
          New Ship
        </button>
      </div>
    </div>
  );
}
