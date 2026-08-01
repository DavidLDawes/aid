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
