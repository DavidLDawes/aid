/**
 * Calculate months between service based on spares tonnage and ship tonnage
 * @param spares - Tonnage of spares carried
 * @param shipTonnage - Total ship tonnage
 * @returns Months between service (minimum 1)
 */
export function calculateMonthsBetweenService(spares, shipTonnage) {
    return 1 + Math.floor((spares / shipTonnage) * 100);
}
/**
 * Calculate the tonnage increment needed for spares to achieve the next service interval
 * @param currentSpares - Current spares tonnage
 * @param shipTonnage - Total ship tonnage
 * @returns Tonnage increment needed
 */
export function getSparesIncrement(currentSpares, shipTonnage) {
    const currentMonths = calculateMonthsBetweenService(currentSpares, shipTonnage);
    const nextMonth = currentMonths + 1;
    const requiredSpares = Math.ceil((nextMonth - 1) * shipTonnage / 100);
    return Math.max(1, requiredSpares - currentSpares);
}
/**
 * Calculate the percentage of ship tonnage that spares represent
 * @param spares - Tonnage of spares carried
 * @param shipTonnage - Total ship tonnage
 * @returns Percentage (0-100)
 */
export function getSparesPercentage(spares, shipTonnage) {
    return (spares / shipTonnage) * 100;
}
