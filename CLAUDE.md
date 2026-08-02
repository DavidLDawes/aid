# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Traveller Megastructure Designer** - a React-based web application for designing megastructures (1,000,000–1,000,000,000 tons, in 1M-ton steps) based on the Traveller SRD (System Reference Document) spacecraft design rules. The application uses IndexedDB for local persistence and features a multi-panel wizard interface for configuring all aspects of a megastructure.

**Megastructures have no jump drives.** They are permanent (or very-slow-moving) structures — ring worlds, orbital habitats, shipyards. This is a hard rule difference from the sibling `main` (100–2,000 ton starships) and `capital` (2,000–1,000,000 ton capital ships) branches, which do have jump drives. Don't port jump-drive logic back in from those branches.

## General Rules
When you spend time searching for commands to typecheck, lint, build, or test, you should ask the user if it's okay to add those commands to CLAUDE.md. Similarly, when learning about code style preferences or important codebase information, ask if it's okay to add that to CLAUDE.md so you can remember it for next time.

## Common Development Commands

```bash
# Install dependencies
pnpm install

# Local development (Vite dev server, port 5173)
pnpm dev

# Build for production (tsc -b + vite build)
pnpm build

# Build then preview production build (vite preview, port 4173)
pnpm serve

# Preview an existing production build
pnpm preview

# Linting
pnpm lint

# Testing
pnpm test               # Run tests in watch mode
pnpm test:ui            # Run tests with UI
pnpm test:run           # Run tests once (used in CI)

# Database management
pnpm extractDB          # Export ships from IndexedDB to JSON files
pnpm preloadDB          # Import ships from JSON files to IndexedDB
pnpm flushDB            # Clear all ships from IndexedDB
pnpm setInitialDB       # Reset DB to initial state
pnpm apply-feature      # Apply feature branches to ships
```

## Project Directory Structure

```
aid/
├── public/                      # Static assets
│   ├── index.html              # HTML template
│   └── initial-ships.json      # Default ships loaded on first run (a Ring World Alpha seed)
├── src/                        # Source code
│   ├── components/             # React UI components
│   │   ├── SelectShipPanel.tsx # Ship selection screen
│   │   ├── ShipPanel.tsx       # Basic megastructure info (panel 0)
│   │   ├── EnginesPanel.tsx    # Power plant / maneuver drive (panel 1, no jump drive)
│   │   ├── FittingsPanel.tsx   # Control center (auto), sensors, computer, launch tubes (panel 2)
│   │   ├── WeaponsPanel.tsx    # Weapons configuration (panel 3)
│   │   ├── DefensesPanel.tsx   # Defenses, armor, screens (panel 4)
│   │   ├── FacilitiesPanel.tsx # Rec/Health facilities (panel 5)
│   │   ├── CargoPanel.tsx      # Cargo bays (panel 6)
│   │   ├── VehiclesPanel.tsx   # Vehicles (panel 7)
│   │   ├── DronesPanel.tsx     # Drones (panel 8)
│   │   ├── CustomPanel.tsx     # Custom items + custom crew (panel 9)
│   │   ├── FuelPanel.tsx       # Fuel scoops, processors, tanks, antimatter plant (panel 10)
│   │   ├── SectionsPanel.tsx   # Zone sections — residential/industrial/farm/etc. (panel 11)
│   │   ├── BerthsPanel.tsx     # Berths (panel 12)
│   │   ├── StaffPanel.tsx      # Crew requirements (panel 13)
│   │   ├── SummaryPanel.tsx    # Ship summary (panel 14)
│   │   ├── MassSidebar.tsx     # Real-time mass/cost tracker
│   │   ├── FileMenu.tsx        # Save/Load/Print menu
│   │   └── RulesMenu.tsx       # Rules variants menu
│   ├── data/                   # Game data and constants
│   │   └── constants.ts        # Tech levels, engines, weapons, megastructure formulas, etc.
│   ├── services/                # Business logic
│   │   ├── database.ts         # IndexedDB wrapper (store `mega_ships`, see Database Persistence below)
│   │   └── initialDataService.ts # Initial data loader
│   ├── types/                  # TypeScript definitions
│   │   └── ship.ts             # Ship interfaces
│   ├── utils/                  # Utility functions
│   │   ├── calculations.ts     # Mass/cost aggregation helpers
│   │   ├── crewCalculations.ts # Pilot/navigator crew-size formulas
│   │   ├── csv.ts              # CSV field escaping
│   │   ├── logger.ts           # Console logger with [StarshipDesigner] prefix
│   │   ├── printContent.ts     # Shared print HTML generator
│   │   ├── shipDefaults.ts     # Ship initialization helpers
│   │   ├── sparesCalculation.ts # Spares tonnage / months-between-service helpers
│   │   ├── techLevelCleanup.ts # Drops/clamps vehicles, bay weapons, screens on a TL drop
│   │   └── tonnageRescale.ts   # Rescales engines/fittings when tonnage changes
│   ├── test/                   # Test utilities
│   ├── App.tsx                 # Main app component
│   ├── App.css                 # Global styles
│   └── main.tsx                # React entry point
├── dist/                       # Production build output (generated)
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── jest.config.cjs            # Jest configuration
├── CLAUDE.md                  # This file - Claude Code guidance
└── README.md                  # Project README

Test files are co-located with source files using .test.ts/.test.tsx extension
```

## Build System & Technology Stack

- **Build Tool**: Vite (with @vitejs/plugin-react)
- **Frontend**: React 19 with TypeScript
- **Testing**: Jest with Testing Library
- **Database**: IndexedDB (via fake-indexeddb for tests) - browser-based local storage
- **Bundler Config**: `vite.config.js` - entry point is `index.html` → `src/main.tsx`
- **Dev Server**: Vite defaults (dev 5173, preview 4173)
- **Node Version**: >=24 (LTS; specified in package.json engines)
- **Deployment**: Cloudflare Worker, path prefix `/MegaDesign` under `srd-tools.com` — same origin as the sibling `main` (`/ShipDesign`) and `capital` (`/CapitalShipDesign`) branch deployments. This is why the IndexedDB store name matters (see Database Persistence).

## Architecture Overview

### Core Application Structure

**Main Entry Point**: `src/App.tsx`
- Central state management for entire megastructure design
- Orchestrates 15 specialized panels in a wizard flow (indices 0–14; `SelectShipPanel` is the pre-wizard screen and isn't in this list)
- Handles mass/cost calculations and validation
- Manages file operations (save/load/print)
- Implements a "Rules Menu" for optional rule sets, though see the Rules System note below — most of it is currently inert on this branch
- `SelectShipPanel` is eagerly loaded; all 15 design panels are **lazy-loaded** via `React.lazy()` to reduce initial bundle size

**Panel Flow** (`panels` array in App.tsx): Megastructure → Engines → Fittings → Weapons → Defenses → Rec/Health → Cargo → Vehicles → Drones → Custom → Fuel → Sections → Berths → Staff → Design Summary

### Key Design Patterns

1. **Wizard UI Pattern**: User progresses through panels sequentially. Each panel validates before allowing advancement.

2. **Centralized State**: `App.tsx` maintains the complete `shipDesign` object containing all ship components (ship, engines, fittings, weapons, defenses, berths, facilities, cargo, vehicles, drones, custom_items, fuel_systems, zone_sections).

3. **Mass & Cost Tracking**: Real-time calculations in `App.tsx` methods:
   - `calculateMass()`: Sums masses from all components + control center + maneuver fuel + armor + reloads + fuel systems + zone sections
   - `calculateCost()`: Sums costs from all components, plus the hull itself (tonnage / 10 MCr)
   - `calculateStaffRequirements()`: Determines crew needs based on ship systems
   - Validation prevents over-mass designs

4. **Database Service Pattern**: `src/services/database.ts` provides IndexedDB abstraction
   - Ships are stored with unique names (enforced by unique index)
   - Auto-initialization loads `public/initial-ships.json` on first run
   - Handles version migrations (currently at version 3)
   - `databaseService.initialize()` is called exactly once at App startup via a `useEffect([], [])` — do not call it again in save/load handlers or component renders

5. **`updateShipDesign()` side effects**: App.tsx's central update function isn't a pure merge — it runs several derived-state cleanups whenever the relevant field actually changes value (not just whenever it's present in the update payload):
   - Tonnage change → recompute `sections`, then rescale engine mass/cost and comms/sensors + computer fitting mass/cost (`src/utils/tonnageRescale.ts`) so those percentage-of-tonnage/per-section values don't go stale.
   - Tech level change → drop vehicles/bay weapons and clamp screen quantities that are no longer available at the new tech level (`src/utils/techLevelCleanup.ts`).
   - Power plant dropped below P-10 → strip an installed Antimatter Plant from `fuel_systems` (it can no longer be supported).

### Critical Data Files

**`src/data/constants.ts`**: Central source of truth for game rules
- Tech levels (`TECH_LEVELS = ['A'..'H','J']`, skipping 'I'; TL-A=10 .. TL-H=17, TL-J=18)
- `getMaxPowerPlantByTechLevel()`: power plant performance cap by TL (TL-F=P-7, TL-G=P-8, TL-H=P-10, TL-J=P-12) — this is what makes the P-10 Antimatter Plant requirement reachable
- Engine performance tables for `power_plant` and `maneuver_drive` only — **no `jump_drive` engine type exists on this branch**
- `FRACTIONAL_MANEUVER_DRIVE_LEVELS`: sub-1-gee maneuver drives (M-.01 through M-.5), megastructure-branch-only. Unlike the integer M-1..M-6/P-1..P-12 tables (a flat percentage of ship tonnage, cost = mass × `ENGINE_COST_PER_TON`), each fractional level is defined as a percentage of the **M-1 drive's own mass and cost**, and the two percentages diverge per level (e.g. M-.5 is 40% of M-1's tons but only 33% of M-1's cost) — so `calculateEngineMassAndCost()` special-cases `0 < performance < 1` for `maneuver_drive` rather than going through the shared table lookup. `getAvailableEngines()` always lists all seven ahead of M-1 for `maneuver_drive`; they're never excluded by the power-plant-performance gate since every level is under 1 gee
- Weapon types, defense types, vehicle types, drone types
- Megastructure-specific formulas: `getMegastructureSections()`, `calculateControlCenterMass/Cost()`, `getMegastructureSensorMassAndCost()`, `getMegastructureComputerCost()`
- `hasAntimatterPlant()` / `calculateAntimatterAdjustedManeuverFuel()`: an installed Antimatter Plant (in `fuel_systems`) cuts maneuver fuel to 1/10th
- Staff calculation helpers (`calculateMedicalStaff`, `calculateVehicleServiceStaff`, `calculateDroneServiceStaff`)
- `getScreenSpecs()`: defensive-screen (Nuclear Damper/Meson Screen/Black Globe) mass/cost, scaled by a 5x-per-tier tonnage bracket starting at 1,000,000 tons (see `getScreenTonnageTier()`) — not capital-ship hull codes, which topped out at 1,000,000 tons and didn't scale across the megastructure range

**`src/types/ship.ts`**: TypeScript interfaces for all ship components
- `ShipDesign`: Root interface containing all component arrays
- `Ship`: includes `atmosphere_support?: boolean` — a floating-city-style structure that needs active navigation (see Staff Requirements Logic)
- Component interfaces: `Engine` (`engine_type: 'power_plant' | 'maneuver_drive'`, no jump drive), `Fitting` (`fitting_type: 'control_center' | 'launch_tube' | 'comms_sensors' | 'computer'`, no bridge), `Weapon`, `Defense`, `Berth`, `Facility`, `Cargo`, `Vehicle`, `Drone`, `CustomItem`, `CustomCrew`, `FuelSystem`, `ZoneSection`
- `CustomItem`: User-defined items with name, mass, and cost (no predefined types)
- `CustomCrew`: a single object (not an array) on `ShipDesign`, holding a count per crew category to operate/service/repair/serve custom items — the same 9 positions shown on the Staff panel (pilot/navigator/engineers/gunners/service/stewards/nurses/surgeons/techs), plus 4 that exist only as custom-crew entries (infantry/armor/mp/security, no baseline formula elsewhere). Every count adds directly onto the corresponding `StaffRequirements` field in `calculateStaffRequirements()` (see Staff Requirements Logic)
- `StaffRequirements`: Crew calculation results

### Component Architecture

Components follow a consistent pattern:
- **Props**: Receive current state + `onUpdate` callback
- **State**: Local UI state only (selections, toggles)
- **Updates**: Call `onUpdate` with new array/object to update parent
- **Validation**: Display warnings but allow invalid states (validation enforced at panel navigation level)

Example: `WeaponsPanel` manages weapon selection UI but calls `onUpdate(weapons)` to update App state.

### Architecture Best Practices

#### ✅ Core Guidelines

**Immutable State Updates:**
```typescript
// GOOD: Spread operator for immutability
const newItems = [...items, newItem];
onUpdate(newItems);

// AVOID: Direct mutation
items.push(newItem);
onUpdate(items);
```

**Calculate, Don't Store:**
```typescript
// GOOD: Calculate derived values on render
const totalMass = calculateMass();
const totalCost = calculateCost();

// AVOID: Store calculated values in state
const [totalMass, setTotalMass] = useState(0);
```

Note: engine mass/cost and comms/sensors + computer fitting mass/cost are an intentional exception — they're stored on the design (not recomputed on every render) because they're user selections (performance rating / sensor type / computer model), not pure derived totals. `src/utils/tonnageRescale.ts` exists specifically to keep those stored values in sync when tonnage changes.

**Type Safety:**
```typescript
// GOOD: Use TypeScript interfaces
interface CustomItem {
  name: string;
  mass: number;
  cost: number;
}

// AVOID: Using 'any' type
const items: any[] = [];
```

**Clear Naming:**
```typescript
// GOOD: Descriptive function names
const calculateAntimatterAdjustedManeuverFuel = (tonnage, perf, weeks, hasAmPlant) => { ... };

// AVOID: Cryptic abbreviations
const calcFM = (t, p, w, a) => { ... };
```

### Database Persistence

**IndexedDB Schema** (version 3):
- **Database**: `StarshipDesignerDB` — shared name across the `main`/`capital`/`megastructure` branches, since all three deploy to the same origin (`srd-tools.com`)
- **Object Store**: `mega_ships` — deliberately branch-specific (main uses `ship_ships`, capital uses `capital_ships`) to avoid same-origin IndexedDB collisions between the three deployed apps
- **Key Path**: `id` (auto-increment)
- **Indexes**:
  - `name` (unique) on `ship.name` - enforces unique ship names
  - `createdAt` on `createdAt` - for sorting

**Initial Data**: On first load, if the `mega_ships` store is empty, `SelectShipPanel` calls `initialDataService.loadInitialDataIfNeeded()`, which preloads ships from `public/initial-ships.json` (currently a single "Ring World Alpha" seed). If that fails too, `SelectShipPanel` falls back to an in-memory hardcoded copy of the same ship so the screen is never empty.

**Data Cleanup**: `constants.ts` includes `cleanInvalidCargo()` to remove deprecated cargo types when loading ships

### Utility Functions

**`src/utils/shipDefaults.ts`**: Ship initialization helpers
- `createEmptyShipDesign(shipInfo)`: Creates a ShipDesign with empty component arrays and default comms/sensors
- `createDefaultShip(name, techLevel, tonnage, configuration)`: Creates a Ship object with sensible defaults

**`src/utils/calculations.ts`**: Component aggregation helpers
- `sumMass(items)`: Sum mass for components without quantity (engines, fittings, custom_items)
- `sumMassWithQuantity(items)`: Sum mass for components with quantity (weapons, defenses, vehicles, drones, berths, facilities)
- `sumCost(items)` / `sumCostWithQuantity(items)`: Cost equivalents
- `sumCargoTonnage(cargo)`: Sum cargo tonnage (special case, uses `tonnage` property)

**`src/utils/tonnageRescale.ts`**: Keeps stored engine/fitting values in sync with tonnage
- `rescaleEnginesForTonnage(engines, tonnage)`: Recomputes engine mass/cost from the stored performance rating at the new tonnage
- `rescaleFittingsForTonnage(fittings, tonnage)`: Recomputes comms/sensors and computer fitting mass/cost from the stored sensor type / computer model at the new tonnage
- Called from `App.tsx`'s `updateShipDesign()` whenever `ship.tonnage` actually changes

**`src/utils/techLevelCleanup.ts`**: Drops components that are no longer tech-level-eligible
- `cleanupVehiclesForTechLevel()`, `cleanupBayWeaponsForTechLevel()`: drop entries no longer in the tech level's available list
- `cleanupScreensForTechLevel()`: clamp screen quantity down to the new `getMaxScreens()` ceiling (drop if it hits 0)
- Called from `App.tsx`'s `updateShipDesign()` whenever `ship.tech_level` actually changes

**`src/utils/crewCalculations.ts`**: Pilot/navigator/engineer crew-size formulas (see Staff Requirements Logic)

**`src/utils/csv.ts`**: `escapeCsvField()` — quotes/escapes a CSV field if it contains a comma, quote, or newline (ship names and generated item labels routinely do)

**`src/utils/printContent.ts`**: Shared print HTML generator
- `generateShipPrintContent(shipDesign, mass, cost, staff, activeRules)`: Generates a complete standalone HTML document for printing
- Includes `escapeHtml()` for XSS prevention
- Used by `handleFilePrint()` in App.tsx; SummaryPanel does not have its own print implementation

**`src/utils/logger.ts`**: Lightweight console logger
- Exports a `logger` object with `info()` and `error()` methods
- All messages are prefixed with `[StarshipDesigner]` for easy DevTools filtering

**`src/utils/sparesCalculation.ts`**: Spares / maintenance helpers (used by CargoPanel)
- `calculateMonthsBetweenService(spares, shipTonnage)`: Returns months between service; formula is `1 + floor((spares / shipTonnage) * 100)` — every 1% of ship tonnage in spares adds one month
- `getSparesIncrement(currentSpares, shipTonnage)`: Tons needed to reach the next service interval
- `getSparesPercentage(spares, shipTonnage)`: Spares as a percentage of ship tonnage

## Important Implementation Details

### Mass Calculation Complexity

The `calculateMass()` function in App.tsx handles:
- Component masses using utility functions (sumMass, sumMassWithQuantity, sumCargoTonnage)
- Control center mass (auto-calculated from tonnage, not stored in fittings)
- Maneuver fuel only — no jump fuel on this branch — via `calculateAntimatterAdjustedManeuverFuel()`
- Missile/sand reload storage (direct tonnage)
- Armor mass (percentage of hull tonnage)
- Fuel systems mass (scoops are 0 mass; the antimatter-plant-adjacent "plant" support infrastructure is derived from scoop count via `PLANT_PER_SCOOP`)
- Zone sections mass

**Watch out**: Defense mass is stored **per-unit** (not pre-multiplied). Use `sumMassWithQuantity(defenses)` — not `sumMass` — to get the correct total. The same applies to defense cost.

**Watch out**: The Hull, Missile Reloads, and Sand Reloads costs are all folded into `calculateCost()`'s total but are *not* separate line items anywhere else automatically — SummaryPanel, its CSV export, and `printContent.ts` each explicitly add a Hull row and Missile Reloads/Sand cost rows so the displayed line items sum to the shown total. If you add a new cost source to `calculateCost()`, add a matching display row in all three places or the total will silently stop matching what's shown.

### Staff Requirements Logic

Crew calculation in `calculateStaffRequirements()` (hoisted before JSX return in App.tsx, called once per render):
- **Pilot**: `calculatePilotCount(maneuverPerformance)` — 8 pilots (24x7 coverage with spares) if the maneuver drive is M-1 or better; 1 (skeleton crew) if the structure is stationary (M-0 / no maneuver drive)
- **Navigator**: `calculateNavigatorCount(ship.atmosphere_support)` — 0 by default (a plotted course is followed for decades, no standing navigator needed); 4 if `atmosphere_support` is set (a floating-city-style structure needs active navigation), toggled on the Megastructure panel (`ShipPanel.tsx`)
- **Engineers** (`calculateEngineerCount()` in `src/utils/crewCalculations.ts`): at least 1 per engine (minimum 1 total, even with none configured), plus `ceil(mass/100) - 1` extra for each engine whose mass exceeds 100 tons. If the Robotics rule is enabled (TL-F+, toggled via the Rules menu), each engine's own crew requirement is divided (rounded up, per engine) by `getRoboticsCrewDivisor(techLevel)`: TL-F=1/2, TL-G=1/4, TL-H=1/6, TL-J=1/8
- **Gunners**:
  - 1 per 10 turrets/barbettes (rounded up)
  - 1 per 10 defense turrets (rounded up)
  - Defensive screens: minimum 4, or `ceil(totalScreenTons / 100)` if total screen tonnage >400
  - Bay weapons: 2 gunners per bay weapon (per unit quantity)
  - No spinal weapon gunners — megastructures have no spinal mounts
- **Stewards**: 1 per 8 staterooms (rounded up)
- **Medical**: Calculated by `calculateMedicalStaff()` based on medical facilities
- **Service**: Vehicle service (`calculateVehicleServiceStaff`) + drone service (`calculateDroneServiceStaff`) from `constants.ts`
- **Custom Crew** (`shipDesign.custom_crew`, entered on the Custom panel — see Common Modifications): added directly onto the corresponding field above for the 9 shared positions (pilot/navigator/engineers/gunners/service/stewards/nurses/surgeons/techs). **Infantry/Armor/MP/Security** have no baseline formula anywhere else in the app, so their `StaffRequirements` values are exactly whatever's entered as custom crew

There is no small-ship pilot/navigator-combining or no-stewards toggle on this branch (that convention only applied to exactly-100/200-ton starships on the `main` branch; megastructures start at 1,000,000 tons, so it never applied here and was removed as dead code).

### Tech Level Dependencies

Many features are tech-level gated:
- Power plant performance: TL-F=P-7, TL-G=P-8, TL-H=P-10, TL-J=P-12 (`getMaxPowerPlantByTechLevel()`) — **not** jump-related; this exists purely to make the P-10 Antimatter Plant reachable
- Antimatter Plant: requires a P-10+ power plant (TL-H+); installing one cuts maneuver fuel to 1/10th
- Computer models: gated by tech level directly in `FittingsPanel.tsx` (via `COMPUTER_TYPES[].techLevel`), independent of tonnage/jump
- Vehicle, bay weapon, and screen availability: tech-level gated; see `src/utils/techLevelCleanup.ts` for what happens to already-selected components when tech level drops

Use helper functions: `isTechLevelAtLeast()`, `getMaxPowerPlantByTechLevel()`, `getTechLevelIndex()`, `convertTechLevelToNumber()`

**There is no jump drive on this branch.** `Engine['engine_type']` is `'power_plant' | 'maneuver_drive'` only. If you're looking at code from the `capital` or `main` branch for reference, strip out anything related to `jump_drive`, `getMaxJumpByTechLevel`, or the "Longer Jumps" rule — none of it applies here.

### Rules System

`activeRules` state (Set<string>) is passed down to several components (`RulesMenu`, `EnginesPanel`, `MassSidebar`, `SummaryPanel`, `printContent.ts`). Most of it is still inert plumbing inherited from the `capital` branch, but `'robotics'` is a real exception — App.tsx's `calculateStaffRequirements()` reads `activeRules.has('robotics')` directly to drive the engineer-count reduction:
- Antimatter fuel discount: driven by `hasAntimatterPlant(shipDesign.fuel_systems)`, not by toggling the "Antimatter" rule
- `'spacecraft_design_srd'`: always enabled, can't be disabled (display-only)
- `'high_guard_capital_ships'`: always shown disabled (display-only, not applicable to megastructures)
- `'antimatter'`: toggleable in the UI (gated to TL-H+ ships) but currently has no effect on any calculation
- `'robotics'`: toggleable in the UI (gated to TL-F+ ships) and **does** affect calculations — `calculateEngineerCount()` (`src/utils/crewCalculations.ts`) divides each engine's crew requirement (rounded up) by `getRoboticsCrewDivisor(techLevel)` when enabled: TL-F=1/2, TL-G=1/4, TL-H=1/6, TL-J=1/8

If you add a new rule that should actually affect calculations, wire it through real game state (like the Antimatter Plant is) rather than `activeRules.has('rule_id')`, unless you're also adding the code that reads it (as `'robotics'` does).

### Print Functionality

`handleFilePrint()` in App.tsx generates a printable HTML view. It calls `generateShipPrintContent()` from `src/utils/printContent.ts`, which produces a complete standalone HTML document with embedded styles and XSS prevention via `escapeHtml()`. This shared utility is the single source of truth for print output — SummaryPanel does not have its own print implementation.

## Testing Approach

- **Test Runner**: Jest with jsdom environment
- **Test Location**: Co-located with source files (`.test.ts` extension)
- **Setup Files**:
  - `jest.setup.js`: Global mocks
  - `src/test/setup.ts`: Testing Library setup
  - `jest-environment-jsdom-with-structuredclone.js`: Custom environment for structuredClone support
- **Coverage**: Utility functions and business logic extracted from App.tsx. React components (panels) are largely untested directly — logic worth testing is extracted into `src/utils/`/`src/services/` first.
- **Mocking**: `fake-indexeddb` for IndexedDB tests
- **Test files** (current):
  - `src/utils/sparesCalculation.test.ts` — spares/service interval math
  - `src/utils/printContent.test.ts` — print HTML generation
  - `src/utils/tonnageRescale.test.ts` — engine/fitting rescaling on tonnage change
  - `src/utils/techLevelCleanup.test.ts` — vehicle/bay-weapon/screen cleanup on TL change
  - `src/utils/crewCalculations.test.ts` — pilot/navigator crew formulas
  - `src/utils/csv.test.ts` — CSV field escaping
  - `src/data/constants.test.ts` — game constants and helpers
  - `src/data/cargoCleanup.test.ts` — `cleanInvalidCargo()` filtering
  - `src/services/database.test.ts` — IndexedDB service
  - `src/services/flushDB.test.ts` — DB flush utility
  - `src/services/initialDataService.test.ts` — initial ship loading
  - `src/services/engineeringStaff.test.ts` — engineer count calculation (extracted from App.tsx)
  - `src/services/serviceStaff.test.ts` — vehicle/drone service staff calculation
  - `src/components/RulesMenu.test.tsx` — RulesMenu component

## File Operations

The app supports standard file operations via FileMenu component:
- **Save (Ctrl+S)**: Updates existing ship in DB
- **Save As (Ctrl+Shift+S)**: Prompts for new name and creates copy
- **Print (Ctrl+P)**: Opens print dialog with ship summary
- **Back to Ship Select**: Returns to ship selection panel

Ship names must be unique (enforced by DB unique index). Attempting to save duplicate names will throw an error.

## Deployment

Production deploys as a Cloudflare Worker (`wrangler deploy`, see `wrangler.jsonc`) serving the Vite `dist/` build under `/MegaDesign` at `srd-tools.com`. There is no Docker deployment path — a stale `Dockerfile` (pre-Vite webpack dev server, port 8080) was removed.

## Debugging Tips

1. **Database Issues**: Check browser DevTools → Application → IndexedDB → StarshipDesignerDB → `mega_ships` object store
2. **Mass Calculation Problems**: Add console.log in `calculateMass()` to trace component contributions
3. **Panel Validation**: Check `isCurrentPanelValid()` and `canAdvance()` in App.tsx
4. **Initial Data Loading**: Check `SelectShipPanel.tsx` and `initialDataService.ts` for DB initialization logic
5. **Weapon/Defense Cleanup**: Non-standard weapons are automatically removed on ship load (see `handleLoadShip()`); tech-level-ineligible vehicles/bay weapons/screens are cleaned up on tech level change (see `updateShipDesign()` / `techLevelCleanup.ts`)
6. **Stale mass/cost after changing tonnage or tech level**: should not happen — check `tonnageRescale.ts` / `techLevelCleanup.ts` are still being invoked from `updateShipDesign()` if you suspect a regression here

## Common Modifications

**Adding a new component type**:
1. Add interface to `src/types/ship.ts`
2. Add array to `ShipDesign` interface
3. Add panel component in `src/components/`
4. Add case to `renderCurrentPanel(mass, cost, staff)` in App.tsx, and add the panel name to the `panels` array (mind the index shift on every panel after it)
5. Update `calculateMass()` and `calculateCost()`
6. Add to initial ship design state in App.tsx / `createEmptyShipDesign()`
7. Update `MassSidebar.tsx` to include new category
8. Update `SummaryPanel.tsx` (table + CSV) and `printContent.ts` to include new items
9. Update all test mock data (`ShipDesign` fixtures) to include the new field

**Example: Custom Items Panel**:
The Custom panel (`src/components/CustomPanel.tsx`, panel index 9) demonstrates this pattern:
- **Purpose**: Allow users to add arbitrary items not in predefined lists
- **Data Model**: `CustomItem { name: string, mass: number, cost: number }`
- **UI Pattern**: Form with text/number inputs + table with remove buttons
- **Different from other panels**: No predefined types or constants - fully user-defined
- **Integration**: Same as other panels - appears in mass/cost calculations, CSV export, summary, print
- **Custom Crew**: a second section on the same panel, gated on `custom_items.length > 0` (hidden entirely until at least one custom item exists, rather than shown-but-disabled). Iterates `CUSTOM_CREW_CATEGORIES` (`src/data/constants.ts`) to render one number input per crew position; unlike `CustomItem`, this list of categories **is** predefined (it mirrors the Staff panel's positions plus infantry/armor/mp/security) since the whole point is tracking crew against known position types, not arbitrary user-named ones

**Modifying validation**:
- Panel-specific validation in `isCurrentPanelValid()` switch statement
- Mass overweight check in `canAdvance()`

## Known Issues & Quirks

- Ship names in DB are stored as `ship.name` (nested property) for indexing
- `public/initial-ships.json` is loaded once on first DB initialization - subsequent changes require DB flush
- The `activeRules` "Antimatter" toggle in RulesMenu doesn't currently gate anything — the real Antimatter Plant mechanic is driven by `hasAntimatterPlant(fuel_systems)` instead (see Rules System above)

## Case Study: Implementing the Custom Items Feature

This section documents the implementation of the Custom panel as a reference for adding similar features.

### Requirements
- Allow users to define custom ship components not in predefined lists
- Each item has: name (string), mass (tons), cost (MCr)
- Multiple items can be added independently
- Items integrate into mass/cost calculations, CSV export, and summary display

### Implementation Steps Taken

1. **Data Model** (`src/types/ship.ts`):
   ```typescript
   export interface CustomItem {
     id?: number;
     name: string;
     mass: number;
     cost: number;
   }

   // Added to ShipDesign interface:
   custom_items: CustomItem[];
   ```

2. **UI Component** (`src/components/CustomPanel.tsx`):
   - Form section: text input (name) + number inputs (mass, cost) + Add button
   - List section: table showing all items with Remove buttons
   - Totals display: sum of mass and cost
   - Form validation: name required, mass > 0
   - Form resets after adding item

3. **App Integration** (`src/App.tsx`):
   - Imported CustomPanel component
   - Added 'Custom' to the `panels` array at index 9
   - Initialized `custom_items: []` in shipDesign state
   - Added the corresponding case in `renderCurrentPanel()`
   - Updated `calculateMass()`/`calculateCost()` to sum `custom_items`

4. **Mass Sidebar** (`src/components/MassSidebar.tsx`):
   - Calculated customItemsMass
   - Added Custom category to categories array

5. **Summary Panel and print** (`src/components/SummaryPanel.tsx`, `src/utils/printContent.ts`):
   - Updated `generateCsvData()`: added custom items section
   - Updated display JSX and print HTML: added custom items rows

6. **Test Updates**: Added `custom_items: []` to every mock `ShipDesign` fixture across affected test files.

### Key Design Decisions

**Why No Constants?**
- Unlike weapons/drones with WEAPON_TYPES/DRONE_TYPES arrays, Custom items have no predefined types
- Users enter names directly, providing maximum flexibility
- Trade-off: No validation against typos, but meets requirement for arbitrary items

**Why Not Quantity-Based?**
- Each custom item is independent (not grouped by type)
- User might want "Lab Module A" and "Lab Module B" as separate line items
- Simpler data structure: just an array of items

**Database Persistence:**
- No schema changes needed - IndexedDB automatically serializes custom_items array
- Backward compatible: old ships without custom_items work fine (field defaults to empty array)

### Lessons Learned

1. **Follow the Pattern**: Custom panel followed the same structure as other panels, making integration straightforward
2. **Update All Integration Points**: Mass calculation, cost calculation, sidebar, summary, CSV, print — all must be updated
3. **Don't Forget Tests**: All mock data needs the new field to avoid TypeScript errors
4. **Panel Indices Matter**: Adding a panel mid-sequence requires updating every subsequent case/index reference
5. **Validation Philosophy**: App allows invalid intermediate states but prevents navigation past blocking issues
6. **Don't leave stored, derived values to go stale**: if a value depends on tonnage or tech level and is stored on the design (not recomputed every render), add a cleanup/rescale step to `updateShipDesign()` — see `tonnageRescale.ts` and `techLevelCleanup.ts` for the established pattern.

This implementation serves as a template for adding similar features in the future.
