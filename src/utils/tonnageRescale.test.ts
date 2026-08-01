import { describe, it, expect } from '@jest/globals';
import { rescaleEnginesForTonnage, rescaleFittingsForTonnage } from './tonnageRescale';
import type { Engine, Fitting } from '../types/ship';

describe('rescaleEnginesForTonnage', () => {
  it('recomputes mass/cost from the stored performance at the new tonnage', () => {
    const engines: Engine[] = [
      { engine_type: 'power_plant', drive_code: 'P-1', performance: 1, mass: 15_000, cost: 30_000 }, // 1.5% of 1,000,000
    ];
    const rescaled = rescaleEnginesForTonnage(engines, 2_000_000);
    expect(rescaled[0].mass).toBe(30_000); // 1.5% of 2,000,000
    expect(rescaled[0].cost).toBe(60_000);
    expect(rescaled[0].performance).toBe(1); // selection preserved
  });

  it('leaves an unselected (performance 0) engine untouched', () => {
    const engines: Engine[] = [
      { engine_type: 'maneuver_drive', drive_code: 'M-0', performance: 0, mass: 0, cost: 0 },
    ];
    const rescaled = rescaleEnginesForTonnage(engines, 5_000_000);
    expect(rescaled[0]).toEqual(engines[0]);
  });

  it('does not mutate the input array', () => {
    const engines: Engine[] = [
      { engine_type: 'power_plant', drive_code: 'P-2', performance: 2, mass: 20_000, cost: 40_000 },
    ];
    rescaleEnginesForTonnage(engines, 3_000_000);
    expect(engines[0].mass).toBe(20_000);
  });
});

describe('rescaleFittingsForTonnage', () => {
  it('recomputes comms_sensors mass/cost from the stored sensor type', () => {
    const fittings: Fitting[] = [
      { fitting_type: 'comms_sensors', comms_sensors_type: 'advanced', mass: 30, cost: 20 }, // base 3t/2MCr x10 x1 section
    ];
    const rescaled = rescaleFittingsForTonnage(fittings, 2_000_000); // 2 sections
    expect(rescaled[0].mass).toBe(60); // 3 * 10 * 2
    expect(rescaled[0].cost).toBe(40); // 2 * 10 * 2
  });

  it('recomputes computer cost (not mass) from the stored computer model', () => {
    const fittings: Fitting[] = [
      { fitting_type: 'computer', computer_model: 'core_1', mass: 0, cost: 16 }, // base 4 MCr x4 x1 section
    ];
    const rescaled = rescaleFittingsForTonnage(fittings, 3_000_000); // 3 sections
    expect(rescaled[0].cost).toBe(48); // 4 * 4 * 3
    expect(rescaled[0].mass).toBe(0);
  });

  it('leaves launch_tube fittings untouched (not tonnage-dependent)', () => {
    const fittings: Fitting[] = [
      { fitting_type: 'launch_tube', launch_vehicle_mass: 2, mass: 50, cost: 1 },
    ];
    const rescaled = rescaleFittingsForTonnage(fittings, 5_000_000);
    expect(rescaled[0]).toEqual(fittings[0]);
  });

  it('does not mutate the input array', () => {
    const fittings: Fitting[] = [
      { fitting_type: 'comms_sensors', comms_sensors_type: 'basic_military', mass: 20, cost: 10 },
    ];
    rescaleFittingsForTonnage(fittings, 4_000_000);
    expect(fittings[0].mass).toBe(20);
  });
});
