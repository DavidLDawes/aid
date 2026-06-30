import React from 'react';
import type { ZoneSection } from '../types/ship';
import { ZONE_SECTION_TYPES } from '../data/constants';

interface SectionsPanelProps {
  zoneSections: ZoneSection[];
  shipTonnage: number;
  onUpdate: (zoneSections: ZoneSection[]) => void;
}

const SectionsPanel: React.FC<SectionsPanelProps> = ({ zoneSections, shipTonnage, onUpdate }) => {
  const getUnits = (type: ZoneSection['zone_type']): number =>
    zoneSections.find(z => z.zone_type === type)?.units ?? 0;

  const setUnits = (type: ZoneSection['zone_type'], rawUnits: number) => {
    const zoneSpec = ZONE_SECTION_TYPES.find(z => z.type === type)!;
    const units = Math.max(0, rawUnits);
    const mass = units * 1000;
    const cost = units * zoneSpec.costPerUnit;

    const newSections = zoneSections.filter(z => z.zone_type !== type);
    if (units > 0) {
      newSections.push({ zone_type: type, units, mass, cost });
    }
    onUpdate(newSections);
  };

  const totalZoneUnits = zoneSections.reduce((sum, z) => sum + z.units, 0);
  const totalZoneMass = totalZoneUnits * 1000;
  const totalZoneCost = zoneSections.reduce((sum, z) => sum + z.cost, 0);

  return (
    <div className="panel-content">
      <p>
        Allocate interior sections of the megastructure in 1,000-ton increments.
        Total tonnage: {shipTonnage.toLocaleString()} tons.
        Allocated: {totalZoneMass.toLocaleString()} tons ({((totalZoneMass / shipTonnage) * 100).toFixed(1)}%).
      </p>

      <div className="zone-grid">
        {ZONE_SECTION_TYPES.map(zoneSpec => {
          const units = getUnits(zoneSpec.type as ZoneSection['zone_type']);
          const zoneCost = units * zoneSpec.costPerUnit;
          return (
            <div key={zoneSpec.type} className="zone-item">
              <div className="zone-header">
                <h4>{zoneSpec.name}</h4>
                <small className="zone-cost-rate">{zoneSpec.costPerUnit} MCr/unit</small>
              </div>
              {zoneSpec.note && <p className="zone-note">{zoneSpec.note}</p>}
              <div className="zone-controls">
                <label>
                  Units (×1,000 tons):
                  <input
                    type="number"
                    min="0"
                    value={units}
                    onChange={(e) => setUnits(zoneSpec.type as ZoneSection['zone_type'], parseInt(e.target.value) || 0)}
                    style={{ width: '80px', marginLeft: '0.5rem' }}
                  />
                </label>
              </div>
              {units > 0 && (
                <div className="zone-totals">
                  <small>{(units * 1000).toLocaleString()} tons — {zoneCost.toLocaleString()} MCr</small>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="zone-summary">
        <h3>Section Allocation Summary</h3>
        <table>
          <thead>
            <tr>
              <th>Zone Type</th>
              <th>Units</th>
              <th>Mass (tons)</th>
              <th>Cost (MCr)</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {zoneSections.filter(z => z.units > 0).map(zone => {
              const spec = ZONE_SECTION_TYPES.find(z => z.type === zone.zone_type);
              return (
                <tr key={zone.zone_type}>
                  <td>{spec?.name ?? zone.zone_type}</td>
                  <td>{zone.units.toLocaleString()}</td>
                  <td>{zone.mass.toLocaleString()}</td>
                  <td>{zone.cost.toLocaleString()}</td>
                  <td><small>{spec?.note ?? ''}</small></td>
                </tr>
              );
            })}
            <tr className="total-row">
              <td><strong>Total</strong></td>
              <td><strong>{totalZoneUnits.toLocaleString()}</strong></td>
              <td><strong>{totalZoneMass.toLocaleString()}</strong></td>
              <td><strong>{totalZoneCost.toLocaleString()}</strong></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SectionsPanel;
