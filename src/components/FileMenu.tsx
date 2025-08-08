import React, { useState, useRef, useEffect } from 'react';
import type { ShipDesign, MassCalculation, CostCalculation, StaffRequirements } from '../types/ship';
import { databaseService } from '../services/database';
import './FileMenu.css';

interface FileMenuProps {
  shipDesign: ShipDesign;
  mass?: MassCalculation;
  cost?: CostCalculation;
  staff?: StaffRequirements;
  combinePilotNavigator?: boolean;
  noStewards?: boolean;
  onPrint: () => void;
  onSave?: () => void;
  onSaveAs?: (newName: string) => void;
}

const FileMenu: React.FC<FileMenuProps> = ({
  shipDesign,
  onPrint,
  onSave,
  onSaveAs
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
  const [saveAsName, setSaveAsName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle Save functionality
  const handleSave = async () => {
    if (onSave) {
      onSave();
    } else {
      // Fallback implementation
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
    }
    setIsOpen(false);
  };

  // Handle Save As functionality
  const handleSaveAs = () => {
    setSaveAsName(shipDesign.ship.name);
    setShowSaveAsDialog(true);
    setIsOpen(false);
  };

  const handleSaveAsConfirm = async () => {
    if (!saveAsName.trim()) {
      setSaveMessage('Please enter a ship name.');
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    if (onSaveAs) {
      onSaveAs(saveAsName);
    } else {
      // Fallback implementation
      try {
        setSaving(true);
        setSaveMessage(null);
        const modifiedShipDesign = {
          ...shipDesign,
          ship: { ...shipDesign.ship, name: saveAsName }
        };
        await databaseService.initialize();
        await databaseService.saveShip(modifiedShipDesign);
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
    }
    setShowSaveAsDialog(false);
    setSaveAsName('');
  };

  // Handle Print functionality
  const handlePrint = () => {
    onPrint();
    setIsOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <div className="file-menu" ref={menuRef}>
        <button 
          className="file-menu-button"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          File
        </button>
        
        {isOpen && (
          <div className="file-menu-dropdown">
            <button 
              className="file-menu-item" 
              onClick={handleSave}
              disabled={saving}
            >
              <span className="menu-item-text">Save</span>
              <span className="menu-item-shortcut">Ctrl+S</span>
            </button>
            <button 
              className="file-menu-item" 
              onClick={handleSaveAs}
              disabled={saving}
            >
              <span className="menu-item-text">Save As...</span>
              <span className="menu-item-shortcut">Ctrl+Shift+S</span>
            </button>
            <div className="file-menu-separator"></div>
            <button 
              className="file-menu-item" 
              onClick={handlePrint}
            >
              <span className="menu-item-text">Print</span>
              <span className="menu-item-shortcut">Ctrl+P</span>
            </button>
          </div>
        )}
      </div>

      {/* Save As Dialog */}
      {showSaveAsDialog && (
        <div className="file-menu-dialog-overlay">
          <div className="file-menu-dialog">
            <h3>Save Ship As</h3>
            <div className="form-group">
              <label htmlFor="saveAsName">Ship Name:</label>
              <input
                id="saveAsName"
                type="text"
                value={saveAsName}
                onChange={(e) => setSaveAsName(e.target.value)}
                placeholder="Enter ship name"
                maxLength={32}
                autoFocus
              />
            </div>
            <div className="file-menu-dialog-actions">
              <button 
                className="save-btn"
                onClick={handleSaveAsConfirm}
                disabled={saving || !saveAsName.trim()}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button 
                className="cancel-btn"
                onClick={() => {
                  setShowSaveAsDialog(false);
                  setSaveAsName('');
                }}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Message */}
      {saveMessage && (
        <div className={`file-menu-message ${saveMessage.includes('successfully') ? 'success' : 'error'}`}>
          {saveMessage}
        </div>
      )}
    </>
  );
};

export default FileMenu;