import { getRoboticsCrewDivisor } from '../data/constants';

// A megastructure under way (M-1+) needs round-the-clock piloting: 24x7
// coverage plus spares works out to 8 pilots. A stationary structure (M-0,
// no maneuver drive) just needs a skeleton crew for station-keeping/docking.
export function calculatePilotCount(maneuverPerformance: number): number {
  return maneuverPerformance >= 1 ? 8 : 1;
}

// A course, once plotted, is followed for decades — no standing navigator
// is needed. The exception is an atmosphere-support (floating city)
// structure, which needs active navigation and carries 4 navigators.
export function calculateNavigatorCount(atmosphereSupport: boolean | undefined): number {
  return atmosphereSupport ? 4 : 0;
}

// Engineer count: 1 per engine (minimum 1 total, even with none configured),
// plus extra engineers for any engine over 100 tons. Robotics (TL-F+,
// toggled via the Rules menu) divides each engine's own crew requirement
// down, rounded up, by a tech-level-scaled factor — see
// getRoboticsCrewDivisor. Applied per engine (not to the summed total) so
// each engine's robot-assisted reduction rounds up independently.
export function calculateEngineerCount(
  engines: { mass: number }[],
  techLevel: string,
  roboticsEnabled: boolean
): number {
  if (engines.length === 0) return 1;

  const divisor = roboticsEnabled ? getRoboticsCrewDivisor(techLevel) : 1;

  return engines.reduce((sum, engine) => {
    const baseCrew = 1 + (engine.mass > 100 ? Math.ceil(engine.mass / 100) - 1 : 0);
    return sum + Math.ceil(baseCrew / divisor);
  }, 0);
}
