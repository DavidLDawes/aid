import { useState } from 'react';
import type { ShipDesign, MassCalculation, CostCalculation, StaffRequirements } from '../types/ship';
import { calculateTotalFuelMass } from '../data/constants';
import { databaseService } from '../services/database';

interface SummaryPanelProps {
  shipDesign: ShipDesign;
  mass: MassCalculation;
  cost: CostCalculation;
  staff: StaffRequirements;
  onBackToShipSelect?: () => void;
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({ shipDesign, mass, cost, staff, onBackToShipSelect }) => {
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Calculate fuel breakdown for display
  const jumpDrive = shipDesign.engines.find(e => e.engine_type === 'jump_drive');
  const maneuverDrive = shipDesign.engines.find(e => e.engine_type === 'maneuver_drive');
  const jumpPerformance = jumpDrive?.performance || 0;
  const maneuverPerformance = maneuverDrive?.performance || 0;
  const totalFuelMass = calculateTotalFuelMass(shipDesign.ship.tonnage, jumpPerformance, maneuverPerformance, shipDesign.ship.fuel_weeks);

  const handleSaveDesign = async () => {
    if (!shipDesign.ship.name.trim()) {
      setSaveMessage('Please enter a ship name before saving.');
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    try {
      setSaving(true);
      setSaveMessage(null);
      await databaseService.initialize();
      await databaseService.saveShip(shipDesign);
      setSaveMessage('Ship design saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving ship:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save ship design. Please try again.';
      setSaveMessage(errorMessage);
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="panel-content">
      <h3>Ship Design Summary</h3>
      
      <div className="summary-section">
        <h4>Basic Information</h4>
        <p><strong>Name:</strong> {shipDesign.ship.name}</p>
        <p><strong>Tech Level:</strong> {shipDesign.ship.tech_level}</p>
        <p><strong>Tonnage:</strong> {shipDesign.ship.tonnage} tons</p>
        <p><strong>Configuration:</strong> {shipDesign.ship.configuration}</p>
        <p><strong>Fuel Duration:</strong> {shipDesign.ship.fuel_weeks} weeks</p>
        {shipDesign.ship.description && (
          <p><strong>Description:</strong> {shipDesign.ship.description}</p>
        )}
      </div>

      <div className="summary-section">
        <h4>Mass & Cost</h4>
        <p><strong>Total Mass:</strong> {mass.total} tons</p>
        <p><strong>Used Mass:</strong> {mass.used.toFixed(1)} tons</p>
        <p><strong>Fuel Tank:</strong> {totalFuelMass.toFixed(1)} tons ({((totalFuelMass / mass.total) * 100).toFixed(1)}%)</p>
        <p><strong>Remaining Mass:</strong> {mass.remaining.toFixed(1)} tons</p>
        <p><strong>Total Cost:</strong> {Math.round(cost.total)} MCr</p>
        
        {mass.isOverweight && (
          <div className="warning">
            ⚠️ WARNING: Ship design exceeds tonnage limit!
          </div>
        )}
      </div>

      <div className="summary-section">
        <h4>Staff Requirements</h4>
        <p><strong>Total Staff:</strong> {staff.total}</p>
      </div>

      {saveMessage && (
        <div className={`save-message ${saveMessage.includes('successfully') ? 'success' : 'error'}`}>
          {saveMessage}
        </div>
      )}

      <div className="summary-actions">
        <button 
          className="save-btn" 
          onClick={handleSaveDesign} 
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Design'}
        </button>
        {onBackToShipSelect && (
          <button className="load-btn" onClick={onBackToShipSelect}>
            Load Different Ship
          </button>
        )}
      </div>

    </div>
  );
};

export default SummaryPanel;