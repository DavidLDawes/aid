import React, { useState } from 'react';
import type { CustomItem } from '../types/ship';

interface CustomPanelProps {
  custom_items: CustomItem[];
  onUpdate: (custom_items: CustomItem[]) => void;
}

const CustomPanel: React.FC<CustomPanelProps> = ({ custom_items, onUpdate }) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemMass, setNewItemMass] = useState('');
  const [newItemCost, setNewItemCost] = useState('');

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      alert('Please enter an item name');
      return;
    }
    const mass = parseFloat(newItemMass) || 0;
    const cost = parseFloat(newItemCost) || 0;

    if (mass <= 0) {
      alert('Mass must be greater than 0');
      return;
    }

    const newItem: CustomItem = {
      name: newItemName.trim(),
      mass: mass,
      cost: cost
    };

    onUpdate([...custom_items, newItem]);

    // Reset form
    setNewItemName('');
    setNewItemMass('');
    setNewItemCost('');
  };

  const handleRemoveItem = (index: number) => {
    const newItems = custom_items.filter((_, i) => i !== index);
    onUpdate(newItems);
  };

  const totalMass = custom_items.reduce((sum, item) => sum + item.mass, 0);
  const totalCost = custom_items.reduce((sum, item) => sum + item.cost, 0);

  return (
    <div className="panel-content">
      <p>Add custom components not included in the predefined lists.</p>

      <div className="custom-item-form">
        <h3>Add New Custom Item</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="item-name">Item Name</label>
            <input
              id="item-name"
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="e.g., Sensor Pod, Lab Module"
            />
          </div>
          <div className="form-group">
            <label htmlFor="item-mass">Mass (tons)</label>
            <input
              id="item-mass"
              type="number"
              step="0.1"
              min="0"
              value={newItemMass}
              onChange={(e) => setNewItemMass(e.target.value)}
              placeholder="0.0"
            />
          </div>
          <div className="form-group">
            <label htmlFor="item-cost">Cost (MCr)</label>
            <input
              id="item-cost"
              type="number"
              step="0.1"
              min="0"
              value={newItemCost}
              onChange={(e) => setNewItemCost(e.target.value)}
              placeholder="0.0"
            />
          </div>
        </div>
        <button onClick={handleAddItem} className="add-item-btn">
          Add Item
        </button>
      </div>

      <div className="custom-items-list">
        <h3>Custom Items</h3>
        {custom_items.length === 0 ? (
          <p>No custom items added.</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Mass</th>
                  <th>Cost</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {custom_items.map((item, index) => (
                  <tr key={`${item.name}-${index}`}>
                    <td>{item.name}</td>
                    <td>{item.mass.toFixed(1)} tons</td>
                    <td>{item.cost.toFixed(2)} MCr</td>
                    <td>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="remove-btn"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="custom-items-totals">
              <p><strong>Total:</strong> {totalMass.toFixed(1)} tons, {totalCost.toFixed(2)} MCr</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomPanel;
