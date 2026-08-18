// Sum mass for components that have a quantity property
export const sumMassWithQuantity = <T extends { mass: number; quantity: number }>(
  items: T[]
): number => {
  return items.reduce((sum, item) => sum + (item.mass * item.quantity), 0);
};

// Sum mass for components without a quantity property
export const sumMass = <T extends { mass: number }>(items: T[]): number => {
  return items.reduce((sum, item) => sum + item.mass, 0);
};

// Sum cost for components that have a quantity property
export const sumCostWithQuantity = <T extends { cost: number; quantity: number }>(
  items: T[]
): number => {
  return items.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
};

// Sum cost for components without a quantity property
export const sumCost = <T extends { cost: number }>(items: T[]): number => {
  return items.reduce((sum, item) => sum + item.cost, 0);
};

// Sum cargo tonnage
export const sumCargoTonnage = <T extends { tonnage: number }>(cargo: T[]): number => {
  return cargo.reduce((sum, item) => sum + item.tonnage, 0);
};

// Redundant engines of the same type (e.g. two Power Plants) may be
// installed for reliability. The highest-performing one of a given type is
// what the structure actually runs on — backups sit idle in reserve — so
// gating checks, fuel consumption, and crew sizing all key off this max
// rather than an arbitrary single entry.
export const getMaxEnginePerformance = <T extends { engine_type: string; performance: number }>(
  engines: T[],
  type: T['engine_type']
): number => {
  return engines
    .filter(e => e.engine_type === type)
    .reduce((max, e) => Math.max(max, e.performance), 0);
};
