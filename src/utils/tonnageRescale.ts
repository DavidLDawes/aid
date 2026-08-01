import type { Engine, Fitting } from '../types/ship';
import {
  calculateEngineMassAndCost, getMegastructureSensorMassAndCost, getMegastructureComputerCost,
  COMMS_SENSORS_TYPES, COMPUTER_TYPES
} from '../data/constants';

// Engine mass/cost is a percentage of ship tonnage, computed once at
// selection time and stored on the engine. Rescale it from the tonnage the
// user already has, keeping the chosen performance rating.
export function rescaleEnginesForTonnage(engines: Engine[], tonnage: number): Engine[] {
  return engines.map(engine => {
    if (engine.performance <= 0) return engine;
    const { mass, cost } = calculateEngineMassAndCost(tonnage, engine.engine_type, engine.performance);
    return { ...engine, mass, cost };
  });
}

// Comms/sensors and computer fittings are per-section (10x/4x per
// million-ton section) formulas, also computed once at selection time.
// Rescale them from the tonnage the user already has, keeping the chosen
// sensor type / computer model.
export function rescaleFittingsForTonnage(fittings: Fitting[], tonnage: number): Fitting[] {
  return fittings.map(fitting => {
    if (fitting.fitting_type === 'comms_sensors') {
      const sensorType = COMMS_SENSORS_TYPES.find(t => t.type === fitting.comms_sensors_type);
      if (!sensorType) return fitting;
      const { mass, cost } = getMegastructureSensorMassAndCost(sensorType.mass, sensorType.cost, tonnage);
      return { ...fitting, mass, cost };
    }
    if (fitting.fitting_type === 'computer') {
      const computerType = COMPUTER_TYPES.find(c => c.model === fitting.computer_model);
      if (!computerType) return fitting;
      return { ...fitting, cost: getMegastructureComputerCost(computerType.cost, tonnage) };
    }
    return fitting;
  });
}
