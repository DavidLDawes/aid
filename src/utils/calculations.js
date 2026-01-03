/**
 * Utility functions for calculating totals from ship component arrays
 */
/**
 * Sum mass for components that have a quantity property
 * @param items Array of components with mass and quantity properties
 * @returns Total mass
 */
export const sumMassWithQuantity = (items) => {
    return items.reduce((sum, item) => sum + (item.mass * item.quantity), 0);
};
/**
 * Sum mass for components without a quantity property
 * @param items Array of components with only a mass property
 * @returns Total mass
 */
export const sumMass = (items) => {
    return items.reduce((sum, item) => sum + item.mass, 0);
};
/**
 * Sum cost for components that have a quantity property
 * @param items Array of components with cost and quantity properties
 * @returns Total cost
 */
export const sumCostWithQuantity = (items) => {
    return items.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
};
/**
 * Sum cost for components without a quantity property
 * @param items Array of components with only a cost property
 * @returns Total cost
 */
export const sumCost = (items) => {
    return items.reduce((sum, item) => sum + item.cost, 0);
};
/**
 * Sum cargo tonnage
 * @param cargo Array of cargo items with tonnage property
 * @returns Total tonnage
 */
export const sumCargoTonnage = (cargo) => {
    return cargo.reduce((sum, item) => sum + item.tonnage, 0);
};
