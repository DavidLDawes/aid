import { useState, useEffect } from 'react';
import { databaseService, type StoredShipDesign } from '../services/database';
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

  const loadShips = async () => {
    try {
      setLoading(true);
      setError(null);
      await databaseService.initialize();
      const savedShips = await databaseService.getAllShips();
      setShips(savedShips);
    } catch (err) {
      setError('Failed to load ships from database');
      console.error('Database error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSelectedShip = async () => {
    if (!selectedShipId) return;

    try {
      const ship = await databaseService.getShipById(selectedShipId);
      if (ship) {
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