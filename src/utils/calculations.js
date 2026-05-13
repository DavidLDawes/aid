// Sum mass for components that have a quantity property
export const sumMassWithQuantity = (items) => {
    return items.reduce((sum, item) => sum + (item.mass * item.quantity), 0);
};
// Sum mass for components without a quantity property
export const sumMass = (items) => {
    return items.reduce((sum, item) => sum + item.mass, 0);
};
// Sum cost for components that have a quantity property
export const sumCostWithQuantity = (items) => {
    return items.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
};
// Sum cost for components without a quantity property
export const sumCost = (items) => {
    return items.reduce((sum, item) => sum + item.cost, 0);
};
// Sum cargo tonnage
export const sumCargoTonnage = (cargo) => {
    return cargo.reduce((sum, item) => sum + item.tonnage, 0);
};
