import { useState, useEffect } from 'react';
import { databaseService, type StoredShipDesign } from '../services/database';
import { initialDataService } from '../services/initialDataService';
import type { ShipDesign } from '../types/ship';

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
    // Fallback: create default ships in memory if all loading fails
    const defaultFreeTrader = {
      id: -1, // Temporary ID
      ship: {
        name:'Free Trader',
        tech_level: 'C' as const,
        tonnage: 400,
        configuration: 'standard' as const,
        fuel_weeks: 4,
        missile_reloads: 0,
        sand_reloads: 0,
        description:'Merchant vessel' as const
      },
      engines: [
        {engine_type: 'power_plant' as const, drive_code: 'D', performance: 2, mass: 13, cost: 32},
        {engine_type: 'jump_drive' as const, drive_code: 'D', performance: 2, mass: 25, cost: 40},
        {engine_type: 'maneuver_drive' as const, drive_code: 'D', performance: 2, mass: 7, cost: 16}
      ],
      fittings: [
        {fitting_type: 'bridge' as const, mass: 10, cost: 2},
        {fitting_type:'comms_sensors' as const, comms_sensors_type:'basic_civilian' as const, mass: 1, cost: 0.05}
      ],
      weapons: [
        {weapon_name: 'Hard Point' as const, mass: 1, cost: 1, quantity: 4}
      ],
      defenses: [],
      berths: [
        {berth_type:'staterooms' as const, quantity: 24, mass: 4, cost:0.5},
        {berth_type:'low_berths' as const, quantity:4, mass:0.5, cost:0.05}
      ],
      facilities: [
        {facility_type:'commissary' as const, quantity: 1, mass: 2, cost: 0.2}
      ],
      cargo: [
        {cargo_type: 'cargo_bay' as const, tonnage:132, cost:0},
        {cargo_type: 'spares' as const, tonnage: 4,'cost': 2},
        {cargo_type:'cold_storage_bay' as const, tonnage: 2, cost: 0.4},
        {cargo_type:'secure_storage_bay' as const, tonnage: 1, cost: 0.7}
      ],
      vehicles: [
        {vehicle_type:'air_raft_truck' as const, quantity:1, mass: 5, cost: 0.55}
      ],
      drones: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const defaultScout = {
      id: -2, // Temporary ID
      ship: {
        name: 'Scout',
        tech_level: 'E' as const,
        tonnage: 100,
        configuration: 'standard' as const,
        fuel_weeks: 4,
        missile_reloads: 0,
        sand_reloads: 0,
        description: 'Fast ship long ranged ship, low crew overhead'
      },
      engines: [
        { engine_type: 'power_plant' as const, drive_code: 'B', performance: 4, mass: 7, cost: 16 },
        { engine_type: 'jump_drive' as const, drive_code: 'B', performance: 4, mass: 15, cost: 20 },
        { engine_type: 'maneuver_drive' as const, drive_code: 'B', performance: 4, mass: 3, cost: 8 }
      ],
      fittings: [
        { fitting_type: 'bridge' as const, mass: 10, cost: 2 },
        { fitting_type: 'comms_sensors' as const, comms_sensors_type: 'standard' as const, mass: 0, cost: 0 }
      ],
      weapons: [],
      defenses: [],
      berths: [{ berth_type: 'staterooms' as const, quantity: 2, mass: 4, cost: 0.5 }],
      facilities: [],
      cargo: [{ cargo_type: 'cargo_bay' as const, tonnage: 3, cost: 0 }],
      vehicles: [],
      drones: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const defaultFatTrader = {
      id: -3, // Temporary ID
      ship: {name: 'Fat Trader', tech_level: 'C', tonnage: 600, configuration:'standard' as const, fuel_weeks: 4,
        missile_reloads: 0, sand_reloads: 0, description:'A larger merchant vessel'},
      engines:[
        {engine_type: 'power_plant' as const, drive_code: 'D', performance:2, mass: 13, cost: 32},
        {engine_type: 'jump_drive' as const, drive_code: 'D', performance: 2, mass: 25, cost: 40},
        {engine_type: 'maneuver_drive' as const, drive_code: 'D', performance: 2, mass: 7, cost: 16}
      ],
      fittings: [
        {fitting_type: 'bridge', mass: 10, cost: 2},
        {fitting_type: 'comms_sensors', comms_sensors_type: 'basic_civilian', mass: 1, cost: 0.05}
      ],
      weapons: [
        {weapon_name: 'Hard Point', mass: 1, cost: 1, quantity:6}
      ],
      defenses: [],
      berths: [
        {berth_type: 'staterooms', quantity: 48, mass: 4, cost: 0.5},
        {berth_type: 'low_berths', quantity: 5, mass: 0.5, cost: 0.05}
      ],
      facilities:[
        {facility_type: 'commissary', quantity: 1, mass: 2, cost: 0.2},
        {facility_type: 'gym', quantity: 1, mass: 3, cost: 0.1},
        {facility_type: 'first_aid_station', quantity: 1, mass: 0.5, cost: 0.1},
        {facility_type: 'autodoc', quantity: 1, mass: 1.5, cost: 0.05},
        {facility_type: 'spa', quantity: 1, mass: 1.5, cost: 0.2},
        {facility_type: 'library', quantity: 1, mass:1, cost: 0.1},
        {facility_type: 'shrine', quantity: 1, mass: 1, cost: 1}
      ],
      cargo: [
        {cargo_type: 'cargo_bay', tonnage: 175, cost: 0},
        {cargo_type: 'spares', tonnage: 6, cost: 3},
        {cargo_type: 'cold_storage_bay', tonnage: 2, cost: 0.4},
        {cargo_type: 'secure_storage_bay', tonnage: 1, cost:0.7}
      ],
      vehicles: [
        {vehicle_type: 'air_raft_truck', quantity: 1, mass: 5, cost: 0.55}
      ],
      drones: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    return [defaultScout, defaultFreeTrader, defaultFatTrader];
  };

  const loadShips = async () => {
    try {
      setLoading(true);
      setError(null);
      await databaseService.initialize();
      let savedShips = await databaseService.getAllShips();
      console.log('SelectShipPanel loaded ships from database:', savedShips.length);
      
      // If no ships exist, try to load initial data
      if (savedShips.length === 0) {
        console.log('No ships in database, attempting to load initial ships...');
        const loaded = await initialDataService.loadInitialDataIfNeeded();
        console.log('Initial data loading result:', loaded);
        
        if (loaded) {
          // Try to get ships again after loading
          savedShips = await databaseService.getAllShips();
          console.log('After loading initial data, ships count:', savedShips.length);
        }
        
        // Final fallback: if still no ships, use hardcoded defaults
        if (savedShips.length === 0) {
          console.log('⚠️ All ship loading methods failed, using hardcoded default ships');
          savedShips = createDefaultShips();
        }
      }
      
      setShips(savedShips);
      console.log('Final ships array set:', savedShips.length, savedShips.map(s => s.ship.name));
    } catch (err) {
      console.error('SelectShipPanel error during ship loading:', err);
      // Final emergency fallback
      console.log('🚨 Emergency fallback: using hardcoded ships due to error');
      const defaultShips = createDefaultShips();
      setShips(defaultShips);
      setError(null); // Clear error since we have fallback ships
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSelectedShip = async () => {
    if (!selectedShipId) return;

    try {
      // Check if this is a hardcoded ship (negative ID)
      if (selectedShipId < 0) {
        const ship = ships.find(s => s.id === selectedShipId);
        if (ship) {
          console.log('Loading hardcoded ship:', ship.ship.name);
          // Remove database-specific fields before passing to parent
          const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...shipDesign } = ship;
          onLoadShip(shipDesign);
          return;
        }
      }

      // Regular database ship loading
      const ship = await databaseService.getShipById(selectedShipId);
      if (ship) {
        console.log('Loading database ship:', ship.ship.name);
        // Remove database-specific fields before passing to parent
        const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...shipDesign } = ship;
        onLoadShip(shipDesign);
      }
    } catch (err) {
      setError('Failed to load selected ship');
      console.error('Load ship error:', err);
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
        
        <button onClick={onNewShip} className="new-ship-button">
          New Ship
        </button>
      </div>
    </div>
  );
}