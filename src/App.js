import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { calculateTotalFuelMass, calculateVehicleServiceStaff, calculateDroneServiceStaff, calculateMedicalStaff, WEAPON_TYPES, BAY_WEAPON_TYPES, getAvailableSpinalWeapons, getNumberOfSections, getMinimumComputer, COMPUTER_TYPES } from './data/constants';
import { databaseService } from './services/database';
import { createEmptyShipDesign, createDefaultShip } from './utils/shipDefaults';
import { sumMass, sumMassWithQuantity, sumCost, sumCostWithQuantity, sumCargoTonnage } from './utils/calculations';
import { generateShipPrintContent } from './utils/printContent';
// Eagerly load only the ship selection panel (first screen)
import SelectShipPanel from './components/SelectShipPanel';
// Lazy load all design panels to reduce initial bundle size
const ShipPanel = lazy(() => import('./components/ShipPanel'));
const EnginesPanel = lazy(() => import('./components/EnginesPanel'));
const FittingsPanel = lazy(() => import('./components/FittingsPanel'));
const WeaponsPanel = lazy(() => import('./components/WeaponsPanel'));
const DefensesPanel = lazy(() => import('./components/DefensesPanel'));
const BerthsPanel = lazy(() => import('./components/BerthsPanel'));
const FacilitiesPanel = lazy(() => import('./components/FacilitiesPanel'));
const CargoPanel = lazy(() => import('./components/CargoPanel'));
const VehiclesPanel = lazy(() => import('./components/VehiclesPanel'));
const DronesPanel = lazy(() => import('./components/DronesPanel'));
const CustomPanel = lazy(() => import('./components/CustomPanel'));
const StaffPanel = lazy(() => import('./components/StaffPanel'));
const SummaryPanel = lazy(() => import('./components/SummaryPanel'));
// Keep UI components eagerly loaded as they're small and always visible
import MassSidebar from './components/MassSidebar';
import FileMenu from './components/FileMenu';
import RulesMenu from './components/RulesMenu';
import './App.css';
const panels = [
    'Ship', 'Engines', 'Fittings', 'Weapons', 'Defenses',
    'Rec/Health', 'Cargo', 'Vehicles', 'Drones', 'Custom',
    'Berths', 'Staff', 'Ship Design'
];
function App() {
    const [showSelectShip, setShowSelectShip] = useState(true);
    const [currentPanel, setCurrentPanel] = useState(0);
    const [combinePilotNavigator, setCombinePilotNavigator] = useState(false);
    const [noStewards, setNoStewards] = useState(false);
    const [activeRules, setActiveRules] = useState(new Set(['spacecraft_design_srd']));
    const [shipDesign, setShipDesign] = useState(createEmptyShipDesign(createDefaultShip('', 'A', 5000, 'standard')));
    useEffect(() => {
        databaseService.initialize().catch(err => console.error('Error initializing database:', err));
    }, []);
    const handleFileSave = useCallback(async () => {
        if (!shipDesign.ship.name.trim()) {
            alert('Please enter a ship name before saving.');
            return;
        }
        try {
            await databaseService.saveShip(shipDesign);
        }
        catch (error) {
            console.error('Error saving ship:', error);
            alert(error instanceof Error ? error.message : 'Failed to save ship design. Please try again.');
        }
    }, [shipDesign]);
    const handleFileSaveWithName = useCallback(async (newName) => {
        try {
            const modifiedShipDesign = {
                ...shipDesign,
                ship: { ...shipDesign.ship, name: newName }
            };
            await databaseService.saveShip(modifiedShipDesign);
            setShipDesign(modifiedShipDesign);
        }
        catch (error) {
            console.error('Error saving ship:', error);
            alert(error instanceof Error ? error.message : 'Failed to save ship design. Please try again.');
        }
    }, [shipDesign]);
    const handleFileSaveAs = useCallback(() => {
        const newName = prompt('Enter new ship name:', shipDesign.ship.name);
        if (newName && newName.trim() !== '') {
            handleFileSaveWithName(newName.trim());
        }
    }, [shipDesign.ship.name, handleFileSaveWithName]);
    const handleFilePrint = useCallback(() => {
        const printWindow = window.open('', '_blank');
        if (!printWindow)
            return;
        const mass = calculateMass();
        const cost = calculateCost();
        const staff = calculateStaffRequirements();
        const printContent = generateShipPrintContent(shipDesign, mass, cost, staff, combinePilotNavigator, noStewards, activeRules);
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }, [shipDesign, combinePilotNavigator, noStewards, activeRules]);
    // Global keyboard shortcuts for file operations
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Only handle shortcuts when not in ship select mode and when not focused on an input
            if (showSelectShip || event.target?.tagName === 'INPUT' || event.target?.tagName === 'TEXTAREA') {
                return;
            }
            if (event.ctrlKey && !event.shiftKey && event.key === 's') {
                event.preventDefault();
                handleFileSave();
            }
            else if (event.ctrlKey && event.shiftKey && event.key === 'S') {
                event.preventDefault();
                handleFileSaveAs();
            }
            else if (event.ctrlKey && event.key === 'p') {
                event.preventDefault();
                handleFilePrint();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [showSelectShip, handleFileSave, handleFileSaveAs, handleFilePrint]);
    const handleRuleChange = useCallback((ruleId, enabled) => {
        setActiveRules(prevRules => {
            const newRules = new Set(prevRules);
            if (enabled) {
                newRules.add(ruleId);
            }
            else {
                newRules.delete(ruleId);
            }
            return newRules;
        });
    }, []);
    const calculateMass = () => {
        let used = 0;
        used += sumMass(shipDesign.engines);
        used += sumMass(shipDesign.fittings);
        used += sumMassWithQuantity(shipDesign.weapons);
        // Defense mass is stored per-unit; multiply by quantity for total
        used += sumMassWithQuantity(shipDesign.defenses);
        used += sumMassWithQuantity(shipDesign.berths);
        used += sumMassWithQuantity(shipDesign.facilities);
        used += sumCargoTonnage(shipDesign.cargo);
        used += sumMassWithQuantity(shipDesign.vehicles);
        used += sumMassWithQuantity(shipDesign.drones);
        used += sumMass(shipDesign.custom_items);
        const jumpDrive = shipDesign.engines.find(e => e.engine_type === 'jump_drive');
        const maneuverDrive = shipDesign.engines.find(e => e.engine_type === 'maneuver_drive');
        const jumpPerformance = jumpDrive?.performance || 0;
        const maneuverPerformance = maneuverDrive?.performance || 0;
        const useAntimatter = activeRules.has('antimatter');
        used += calculateTotalFuelMass(shipDesign.ship.tonnage, jumpPerformance, maneuverPerformance, shipDesign.ship.fuel_weeks, useAntimatter);
        used += shipDesign.ship.missile_reloads;
        used += shipDesign.ship.sand_reloads;
        if (shipDesign.ship.armor_percentage) {
            used += (shipDesign.ship.tonnage * shipDesign.ship.armor_percentage) / 100;
        }
        if (shipDesign.ship.spinal_weapon) {
            const powerPlant = shipDesign.engines.find(e => e.engine_type === 'power_plant');
            const availableSpinalWeapons = getAvailableSpinalWeapons(shipDesign.ship.tech_level, powerPlant?.performance || 0);
            const spinalWeaponData = availableSpinalWeapons.find(w => w.name === shipDesign.ship.spinal_weapon);
            if (spinalWeaponData) {
                used += spinalWeaponData.mass;
            }
        }
        const total = shipDesign.ship.tonnage;
        return { total, used, remaining: total - used, isOverweight: used > total };
    };
    const calculateCost = () => {
        let total = 0;
        total += sumCost(shipDesign.engines);
        total += sumCost(shipDesign.fittings);
        total += sumCostWithQuantity(shipDesign.weapons);
        // Defense cost is stored per-unit; multiply by quantity for total
        total += sumCostWithQuantity(shipDesign.defenses);
        total += sumCostWithQuantity(shipDesign.berths);
        total += sumCostWithQuantity(shipDesign.facilities);
        total += sumCost(shipDesign.cargo);
        total += sumCostWithQuantity(shipDesign.vehicles);
        total += sumCostWithQuantity(shipDesign.drones);
        total += sumCost(shipDesign.custom_items);
        total += shipDesign.ship.missile_reloads;
        total += shipDesign.ship.sand_reloads * 0.1;
        if (shipDesign.ship.armor_percentage) {
            const armorMass = (shipDesign.ship.tonnage * shipDesign.ship.armor_percentage) / 100;
            total += armorMass * 0.1;
        }
        if (shipDesign.ship.spinal_weapon) {
            const powerPlant = shipDesign.engines.find(e => e.engine_type === 'power_plant');
            const availableSpinalWeapons = getAvailableSpinalWeapons(shipDesign.ship.tech_level, powerPlant?.performance || 0);
            const spinalWeaponData = availableSpinalWeapons.find(w => w.name === shipDesign.ship.spinal_weapon);
            if (spinalWeaponData) {
                total += spinalWeaponData.cost;
            }
        }
        return { total };
    };
    const calculateStaffRequirements = () => {
        const pilot = 1;
        const navigator = 1;
        let engineers = 0;
        const shipTonnage = shipDesign.ship.tonnage;
        if (shipTonnage === 100) {
            engineers = 1;
        }
        else if (shipTonnage === 200 || shipTonnage === 300) {
            engineers = 2;
        }
        else if (shipTonnage >= 400) {
            const engineCount = shipDesign.engines.length;
            engineers = Math.max(engineCount, 1);
            for (const engine of shipDesign.engines) {
                if (engine.mass > 100) {
                    engineers += Math.ceil(engine.mass / 100) - 1;
                }
            }
        }
        else {
            const totalEnginesWeight = shipDesign.engines.reduce((sum, engine) => sum + engine.mass, 0);
            engineers = Math.ceil(totalEnginesWeight / 100);
        }
        const bayWeaponNames = BAY_WEAPON_TYPES.map(b => b.name);
        let turretsAndBarbettesGunners = 0;
        shipDesign.weapons
            .filter(weapon => weapon.weapon_name !== 'Hard Point' && !bayWeaponNames.includes(weapon.weapon_name))
            .forEach(weapon => {
            turretsAndBarbettesGunners += Math.ceil(weapon.quantity / 10);
        });
        let defenseTurretGunners = 0;
        shipDesign.defenses
            .filter(defense => !['nuclear_damper', 'meson_screen', 'black_globe'].includes(defense.defense_type))
            .forEach(defense => {
            defenseTurretGunners += Math.ceil(defense.quantity / 10);
        });
        let screenGunners = 0;
        const screenTypes = ['nuclear_damper', 'meson_screen', 'black_globe'];
        screenTypes.forEach(screenType => {
            const screen = shipDesign.defenses.find(d => d.defense_type === screenType);
            if (screen && screen.quantity > 0) {
                const totalTons = screen.mass * screen.quantity;
                screenGunners += totalTons > 400 ? Math.ceil(totalTons / 100) : 4;
            }
        });
        const spinalWeaponGunners = shipDesign.ship.spinal_weapon ? 10 : 0;
        const bayWeapons = shipDesign.weapons.filter(w => bayWeaponNames.includes(w.weapon_name));
        const bayWeaponGunners = bayWeapons.reduce((sum, weapon) => sum + (weapon.quantity * 2), 0);
        const gunners = turretsAndBarbettesGunners + defenseTurretGunners + screenGunners + spinalWeaponGunners + bayWeaponGunners;
        const vehicleService = calculateVehicleServiceStaff(shipDesign.vehicles);
        const droneService = calculateDroneServiceStaff(shipDesign.drones);
        const service = vehicleService + droneService;
        const totalStaterooms = shipDesign.berths
            .filter(berth => berth.berth_type === 'staterooms' || berth.berth_type === 'luxury_staterooms')
            .reduce((sum, berth) => sum + berth.quantity, 0);
        const stewards = Math.ceil(totalStaterooms / 8);
        const medicalStaff = calculateMedicalStaff(shipDesign.facilities);
        const { nurses, surgeons, techs } = medicalStaff;
        const total = pilot + navigator + engineers + gunners + service + stewards + nurses + surgeons + techs;
        return { pilot, navigator, engineers, gunners, service, stewards, nurses, surgeons, techs, total };
    };
    const calculateAdjustedCrewCount = (staffRequirements) => {
        const isSmallShip = shipDesign.ship.tonnage === 100 || shipDesign.ship.tonnage === 200;
        if (!isSmallShip)
            return staffRequirements.total;
        return combinePilotNavigator && noStewards
            ? staffRequirements.total - 1 - staffRequirements.stewards
            : combinePilotNavigator
                ? staffRequirements.total - 1
                : noStewards
                    ? staffRequirements.total - staffRequirements.stewards
                    : staffRequirements.total;
    };
    const isCurrentPanelValid = () => {
        switch (currentPanel) {
            case 0: // Ship
                return shipDesign.ship.name.trim() !== '' &&
                    shipDesign.ship.tech_level !== '' &&
                    shipDesign.ship.tonnage >= 100;
            case 1: // Engines
                return shipDesign.engines.some(e => e.engine_type === 'power_plant' && e.drive_code && e.performance >= 1) &&
                    shipDesign.engines.some(e => e.engine_type === 'jump_drive' && e.drive_code && e.performance >= 1);
            case 2: { // Fittings
                const hasBridge = shipDesign.fittings.some(f => f.fitting_type === 'bridge' || f.fitting_type === 'half_bridge');
                if (!hasBridge)
                    return false;
                const jumpDrive = shipDesign.engines.find(e => e.engine_type === 'jump_drive');
                const jumpPerformance = jumpDrive?.performance || 0;
                const minimumComputer = getMinimumComputer(shipDesign.ship.tonnage, jumpPerformance);
                if (minimumComputer) {
                    const computer = shipDesign.fittings.find(f => f.fitting_type === 'computer');
                    if (!computer)
                        return false;
                    const installedComputerIndex = COMPUTER_TYPES.findIndex(c => c.model === computer.computer_model);
                    const minimumComputerIndex = COMPUTER_TYPES.findIndex(c => c.name === minimumComputer.name);
                    if (installedComputerIndex < minimumComputerIndex)
                        return false;
                }
                return true;
            }
            case 5: // Rec/Health
                return shipDesign.facilities.some(f => f.facility_type === 'commissary');
            default:
                return true;
        }
    };
    const canAdvance = (precomputedMass) => {
        if (!isCurrentPanelValid())
            return false;
        if (currentPanel >= 1) {
            const m = precomputedMass ?? calculateMass();
            if (m.isOverweight)
                return false;
        }
        return true;
    };
    const nextPanel = () => {
        if (canAdvance() && currentPanel < panels.length - 1) {
            setCurrentPanel(currentPanel + 1);
        }
    };
    const prevPanel = () => {
        if (currentPanel > 0) {
            setCurrentPanel(currentPanel - 1);
        }
    };
    const updateShipDesign = (updates) => {
        setShipDesign(prev => {
            const newDesign = { ...prev, ...updates };
            if (updates.ship?.tonnage !== undefined) {
                const sections = getNumberOfSections(updates.ship.tonnage);
                newDesign.ship = {
                    ...newDesign.ship,
                    sections: sections ?? undefined
                };
            }
            return newDesign;
        });
    };
    const handleNewShip = () => {
        setShowSelectShip(false);
        setCurrentPanel(0);
    };
    const handleLoadShip = async (loadedShipDesign) => {
        const knownWeaponNames = new Set([
            ...WEAPON_TYPES.map(wt => wt.name),
            ...BAY_WEAPON_TYPES.map(bw => bw.name)
        ]);
        const standardWeapons = loadedShipDesign.weapons.filter(weapon => knownWeaponNames.has(weapon.weapon_name));
        const removedWeapons = loadedShipDesign.weapons.filter(weapon => !knownWeaponNames.has(weapon.weapon_name));
        let cleanedShipDesign = loadedShipDesign;
        if (removedWeapons.length > 0) {
            cleanedShipDesign = { ...loadedShipDesign, weapons: standardWeapons };
            try {
                await databaseService.saveOrUpdateShipByName(cleanedShipDesign);
            }
            catch (error) {
                console.error('Error saving cleaned ship design:', error);
            }
        }
        setShipDesign(cleanedShipDesign);
        setShowSelectShip(false);
        setCurrentPanel(0);
    };
    const handleBackToShipSelect = () => {
        setShowSelectShip(true);
        setCurrentPanel(0);
    };
    const renderCurrentPanel = (mass, cost, staff) => {
        if (showSelectShip) {
            return _jsx(SelectShipPanel, { onNewShip: handleNewShip, onLoadShip: handleLoadShip });
        }
        switch (currentPanel) {
            case 0:
                return _jsx(ShipPanel, { ship: shipDesign.ship, onUpdate: (ship) => updateShipDesign({ ship }), onLoadExistingShip: (loadedShipDesign) => setShipDesign(loadedShipDesign) });
            case 1:
                return _jsx(EnginesPanel, { engines: shipDesign.engines, shipTonnage: shipDesign.ship.tonnage, shipTechLevel: shipDesign.ship.tech_level, fuelWeeks: shipDesign.ship.fuel_weeks, activeRules: activeRules, onUpdate: (engines) => updateShipDesign({ engines }), onFuelWeeksUpdate: (fuel_weeks) => updateShipDesign({ ship: { ...shipDesign.ship, fuel_weeks } }) });
            case 2:
                return _jsx(FittingsPanel, { fittings: shipDesign.fittings, shipTonnage: shipDesign.ship.tonnage, shipTechLevel: shipDesign.ship.tech_level, engines: shipDesign.engines, shipSections: shipDesign.ship.sections, onUpdate: (fittings) => updateShipDesign({ fittings }) });
            case 3:
                return _jsx(WeaponsPanel, { weapons: shipDesign.weapons, shipTonnage: shipDesign.ship.tonnage, shipTechLevel: shipDesign.ship.tech_level, engines: shipDesign.engines, spinalWeapon: shipDesign.ship.spinal_weapon, missileReloads: shipDesign.ship.missile_reloads, remainingMass: mass.remaining + shipDesign.ship.missile_reloads, defenseTurretsCount: shipDesign.defenses.filter(d => !['nuclear_damper', 'meson_screen', 'black_globe'].includes(d.defense_type)).reduce((sum, d) => sum + d.quantity, 0), onUpdate: (weapons) => updateShipDesign({ weapons }), onSpinalWeaponUpdate: (spinal_weapon) => updateShipDesign({ ship: { ...shipDesign.ship, spinal_weapon } }), onMissileReloadsUpdate: (missile_reloads) => updateShipDesign({ ship: { ...shipDesign.ship, missile_reloads } }) });
            case 4:
                return _jsx(DefensesPanel, { defenses: shipDesign.defenses, shipTonnage: shipDesign.ship.tonnage, shipTechLevel: shipDesign.ship.tech_level, weaponsCount: shipDesign.weapons.reduce((sum, weapon) => sum + weapon.quantity, 0), sandReloads: shipDesign.ship.sand_reloads, armorPercentage: shipDesign.ship.armor_percentage || 0, remainingMass: mass.remaining + shipDesign.ship.sand_reloads, onUpdate: (defenses) => updateShipDesign({ defenses }), onSandReloadsUpdate: (sand_reloads) => updateShipDesign({ ship: { ...shipDesign.ship, sand_reloads } }), onArmorUpdate: (armor_percentage) => updateShipDesign({ ship: { ...shipDesign.ship, armor_percentage } }) });
            case 5:
                return _jsx(FacilitiesPanel, { facilities: shipDesign.facilities, onUpdate: (facilities) => updateShipDesign({ facilities }) });
            case 6:
                return _jsx(CargoPanel, { cargo: shipDesign.cargo, remainingMass: mass.remaining, shipTonnage: shipDesign.ship.tonnage, onUpdate: (cargo) => updateShipDesign({ cargo }) });
            case 7:
                return _jsx(VehiclesPanel, { vehicles: shipDesign.vehicles, shipTechLevel: shipDesign.ship.tech_level, onUpdate: (vehicles) => updateShipDesign({ vehicles }) });
            case 8:
                return _jsx(DronesPanel, { drones: shipDesign.drones, onUpdate: (drones) => updateShipDesign({ drones }) });
            case 9:
                return _jsx(CustomPanel, { custom_items: shipDesign.custom_items, onUpdate: (custom_items) => updateShipDesign({ custom_items }) });
            case 10:
                return _jsx(BerthsPanel, { berths: shipDesign.berths, staffRequirements: staff, adjustedCrewCount: calculateAdjustedCrewCount(staff), onUpdate: (berths) => updateShipDesign({ berths }) });
            case 11:
                return _jsx(StaffPanel, { staffRequirements: staff, berths: shipDesign.berths, shipTonnage: shipDesign.ship.tonnage, combinePilotNavigator: combinePilotNavigator, noStewards: noStewards, onCombinePilotNavigatorChange: setCombinePilotNavigator, onNoStewardsChange: setNoStewards });
            case 12:
                return _jsx(SummaryPanel, { shipDesign: shipDesign, mass: mass, cost: cost, staff: staff, combinePilotNavigator: combinePilotNavigator, noStewards: noStewards, activeRules: activeRules, onBackToShipSelect: handleBackToShipSelect });
            default:
                return null;
        }
    };
    const mass = calculateMass();
    const cost = calculateCost();
    const staff = calculateStaffRequirements();
    return (_jsxs("div", { className: "app", children: [_jsxs("header", { className: "app-header", children: [_jsxs("div", { className: "header-top", children: [!showSelectShip && (_jsxs(_Fragment, { children: [_jsx(FileMenu, { shipDesign: shipDesign, mass: mass, cost: cost, staff: staff, combinePilotNavigator: combinePilotNavigator, noStewards: noStewards, onPrint: handleFilePrint, onSave: handleFileSave, onSaveAs: handleFileSaveWithName }), _jsx(RulesMenu, { shipDesign: shipDesign, onRuleChange: handleRuleChange })] })), _jsxs("h1", { children: ["Traveller Capital Starship Designer", !showSelectShip && currentPanel > 0 && shipDesign.ship.name.trim() &&
                                        `: ${shipDesign.ship.name}`] })] }), !showSelectShip && (_jsx("nav", { className: "panel-nav", children: panels.map((panel, index) => (_jsx("button", { className: `nav-button ${index === currentPanel ? 'active' : ''} ${index < currentPanel ? 'completed' : ''}`, onClick: () => {
                                if (index <= currentPanel || (index === currentPanel + 1 && canAdvance(mass))) {
                                    setCurrentPanel(index);
                                }
                            }, disabled: index > currentPanel + 1, children: panel }, panel))) }))] }), _jsxs("div", { className: "app-content", children: [_jsxs("main", { className: "main-panel", children: [_jsx("h2", { children: showSelectShip ? 'Select Ship' : panels[currentPanel] }), _jsx(Suspense, { fallback: _jsx("div", { className: "loading-panel", children: "Loading panel..." }), children: renderCurrentPanel(mass, cost, staff) }), !showSelectShip && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "panel-controls", children: [_jsx("button", { onClick: prevPanel, disabled: currentPanel === 0, children: "Previous" }), _jsx("button", { onClick: nextPanel, disabled: currentPanel === panels.length - 1 || !canAdvance(mass), children: "Next" }), _jsx("button", { onClick: handleBackToShipSelect, className: "back-to-select", children: "Back to Ship Select" })] }), _jsx("div", { className: "panel-attribution", children: _jsx("p", { children: _jsx("a", { href: "https://www.traveller-srd.com/core-rules/spacecraft-design/", target: "_blank", rel: "noopener noreferrer", children: "Based on the Traveller SRD Spacecraft Design page, as best as I can." }) }) })] }))] }), !showSelectShip && currentPanel >= 1 && (_jsx(MassSidebar, { mass: mass, cost: cost, shipDesign: shipDesign, activeRules: activeRules }))] })] }));
}
export default App;
