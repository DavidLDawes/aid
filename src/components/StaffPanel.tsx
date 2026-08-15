import React from 'react';
import type { StaffRequirements, Berth } from '../types/ship';

interface StaffPanelProps {
  staffRequirements: StaffRequirements;
  berths: Berth[];
  shipTonnage: number;
  combinePilotNavigator: boolean;
  noStewards: boolean;
  noEngineer: boolean;
  onCombinePilotNavigatorChange: (combine: boolean) => void;
  onNoStewardsChange: (noStewards: boolean) => void;
  onNoEngineerChange: (noEngineer: boolean) => void;
}

const StaffPanel: React.FC<StaffPanelProps> = ({
  staffRequirements,
  berths,
  shipTonnage,
  combinePilotNavigator,
  noStewards,
  noEngineer,
  onCombinePilotNavigatorChange,
  onNoStewardsChange,
  onNoEngineerChange
}) => {
  const isSmallShip = shipTonnage === 100 || shipTonnage === 200;
  const canSkipEngineer = shipTonnage === 100;

  // Calculate if ship has passengers (more staterooms than crew)
  const totalStaterooms = berths
    .filter(berth => berth.berth_type === 'staterooms' || berth.berth_type === 'luxury_staterooms')
    .reduce((sum, berth) => sum + berth.quantity, 0);

  // Calculate if ship has passengers based on ORIGINAL crew count (not adjusted)
  // This ensures checkboxes don't disappear when selected
  const hasPassengers = totalStaterooms > staffRequirements.total;

  // Calculate actual crew count with adjustments
  let actualCrewCount = staffRequirements.total;
  if (combinePilotNavigator) actualCrewCount -= 1;
  if (noStewards) actualCrewCount -= staffRequirements.stewards;
  if (canSkipEngineer && noEngineer) actualCrewCount -= staffRequirements.engineers;

  return (
    <div className="panel-content">
      <h3>Staff Requirements</h3>
      
      {isSmallShip && (
        <div className="small-ship-options">
          <h4>Small Ship Crew Options</h4>
          <div className="crew-option">
            <label>
              <input
                type="checkbox"
                checked={combinePilotNavigator}
                onChange={(e) => onCombinePilotNavigatorChange(e.target.checked)}
              />
              Combine Pilot and Navigator
            </label>
          </div>
          
          {!hasPassengers && (
            <div className="crew-option">
              <label>
                <input
                  type="checkbox"
                  checked={noStewards}
                  onChange={(e) => onNoStewardsChange(e.target.checked)}
                />
                No Stewards
              </label>
            </div>
          )}

          {canSkipEngineer && (
            <div className="crew-option">
              <label>
                <input
                  type="checkbox"
                  checked={noEngineer}
                  onChange={(e) => onNoEngineerChange(e.target.checked)}
                />
                No Engineer (pilot handles engineering)
              </label>
            </div>
          )}
        </div>
      )}

      <div className="staff-breakdown">
        {combinePilotNavigator ? (
          <p>Pilot/Navigator: 1</p>
        ) : (
          <>
            <p>Pilot: {staffRequirements.pilot}</p>
            <p>Navigator: {staffRequirements.navigator}</p>
          </>
        )}
        <p>Engineers: {canSkipEngineer && noEngineer ? 0 : staffRequirements.engineers}</p>
        <p>Gunners: {staffRequirements.gunners}</p>
        <p>Service (Vehicle & Drone Maintenance): {staffRequirements.service}</p>
        <p>Stewards: {noStewards ? 0 : staffRequirements.stewards}</p>
        <p>Nurses: {staffRequirements.nurses}</p>
        <p>Surgeons: {staffRequirements.surgeons}</p>
        <p>Techs: {staffRequirements.techs}</p>
        <p><strong>Total Staff: {actualCrewCount}</strong></p>
      </div>
      
      <p>Staff accommodation validation coming soon...</p>

    </div>
  );
};

export default StaffPanel;