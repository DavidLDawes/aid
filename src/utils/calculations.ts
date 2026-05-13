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
