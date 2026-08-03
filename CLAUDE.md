# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Traveller Capital Starship Designer** - a React-based web application for designing capital starships based on the Traveller SRD (System Reference Document) spacecraft design rules. The application uses IndexedDB for local persistence and features a multi-panel wizard interface for configuring all aspects of a capital ship.

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
├── index.html                   # HTML template (Vite entry)
├── worker/index.js               # Cloudflare Worker: strips the /CapitalShipDesign path prefix
├── wrangler.jsonc                # Cloudflare Worker deployment config
├── public/                      # Static assets
│   └── initial-ships.json      # Default ships loaded on first run (Large Liner, Destroyer)
├── src/                        # Source code
│   ├── components/             # React UI components
│   │   ├── SelectShipPanel.tsx # Ship selection screen
│   │   ├── ShipPanel.tsx       # Basic ship info (panel 0)
│   │   ├── EnginesPanel.tsx    # Engines configuration (panel 1)
│   │   ├── FittingsPanel.tsx   # Fittings configuration (panel 2)
│   │   ├── WeaponsPanel.tsx    # Weapons configuration (panel 3)
│   │   ├── DefensesPanel.tsx   # Defenses configuration (panel 4)
│   │   ├── FacilitiesPanel.tsx # Rec/Health facilities (panel 5)
│   │   ├── CargoPanel.tsx      # Cargo bays (panel 6)
│   │   ├── VehiclesPanel.tsx   # Vehicles (panel 7)
│   │   ├── DronesPanel.tsx     # Drones (panel 8)
│   │   ├── CustomPanel.tsx     # Custom items (panel 9)
│   │   ├── BerthsPanel.tsx     # Berths (panel 10)
│   │   ├── StaffPanel.tsx      # Crew requirements (panel 11)
│   │   ├── SummaryPanel.tsx    # Ship summary (panel 12)
│   │   ├── MassSidebar.tsx     # Real-time mass/cost tracker
│   │   ├── FileMenu.tsx        # Save/Load/Print menu
│   │   └── RulesMenu.tsx       # Rules variants menu
│   ├── data/                   # Game data and constants
│   │   └── constants.ts        # Tech levels, engines, weapons, etc.
│   ├── services/               # Business logic
│   │   ├── database.ts         # IndexedDB wrapper
│   │   └── initialDataService.ts # Initial data loader
│   ├── types/                  # TypeScript definitions
│   │   └── ship.ts             # Ship interfaces
│   ├── utils/                  # Utility functions
│   │   ├── calculations.ts     # Mass/cost aggregation helpers
│   │   ├── logger.ts           # Console logger with [StarshipDesigner] prefix
│   │   ├── printContent.ts     # Shared print HTML generator
│   │   ├── shipDefaults.ts     # Ship initialization helpers
│   │   └── sparesCalculation.ts # Spares tonnage / months-between-service helpers
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
- **Deployment**: Cloudflare Worker (`worker/index.js` + `wrangler.jsonc`), serving `dist/` under the `/CapitalShipDesign` path at `srd-tools.com` — the same origin as the main Starship Designer app (`/ShipDesign`), which is why the two apps must use different IndexedDB store names (see Database Persistence below)
- **Node Version**: >=24 (LTS; specified in package.json engines)

## Architecture Overview

### Core Application Structure

**Main Entry Point**: `src/App.tsx`
- Central state management for entire ship design
- Orchestrates 13 specialized panels in a wizard flow
- Handles mass/cost calculations and validation
- Manages file operations (save/load/print)
- Implements "Rules Menu" system for optional rule sets (e.g., antimatter drives)
- `SelectShipPanel` is eagerly loaded; all 13 design panels are **lazy-loaded** via `React.lazy()` to reduce initial bundle size

**Panel Flow**: Ship → Engines → Fittings → Weapons → Defenses → Rec/Health → Cargo → Vehicles → Drones → Custom → Berths → Staff → Ship Design

**Note**: The Custom panel (index 9) was added to allow users to define custom items not in predefined lists. Once at least one custom item exists, the panel also shows a "Custom Crew" section (`shipDesign.custom_crew`, type `CustomCrew`) with a number entry per crew category — the same 9 positions shown on the Staff panel, plus 4 (Infantry/Armor/MP/Security) that exist only as custom-crew entries. These counts add directly into `calculateStaffRequirements()`'s totals (see Staff Requirements Logic).

### Key Design Patterns

1. **Wizard UI Pattern**: User progresses through panels sequentially. Each panel validates before allowing advancement.

2. **Centralized State**: `App.tsx` maintains the complete `shipDesign` object containing all ship components (ship, engines, fittings, weapons, defenses, berths, facilities, cargo, vehicles, drones, custom_items).

3. **Mass & Cost Tracking**: Real-time calculations in `App.tsx` methods:
   - `calculateMass()`: Sums masses from all components + fuel + armor + reloads
   - `calculateCost()`: Sums costs from all components
   - `calculateStaffRequirements()`: Determines crew needs based on ship systems
   - Validation prevents over-mass designs

4. **Database Service Pattern**: `src/services/database.ts` provides IndexedDB abstraction
   - Ships are stored with unique names (enforced by unique index) in the `capital_ships` object store (currently at version 3)
   - `SelectShipPanel` auto-loads `public/initial-ships.json` via `initialDataService` on first run if the DB is empty
   - `databaseService.initialize()` is called exactly once at App startup via a `useEffect([], [])` — do not call it again in save/load handlers or component renders

### Critical Data Files

**`src/data/constants.ts`**: Central source of truth for game rules
- Tech levels (A-H mapping to TL 10-17+)
- Tonnage codes for capital ships (CA-CZ for 3K-1M tons)
- Engine performance tables (power plant, maneuver, jump drives)
- Weapon types, defense types, vehicle types, drone types
- Fuel calculation formulas
- Staff calculation helpers
- Hull section calculations (capital ships have 2-6 sections based on hull code)
- Computer requirements based on tonnage and jump performance

**`src/types/ship.ts`**: TypeScript interfaces for all ship components
- `ShipDesign`: Root interface containing all component arrays
- Component interfaces: `Engine`, `Fitting`, `Weapon`, `Defense`, `Berth`, `Facility`, `Cargo`, `Vehicle`, `Drone`, `CustomItem`
- `CustomItem`: User-defined items with name, mass, and cost (no predefined types)
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
const calculateTotalFuelMass = (tonnage, jumpPerf, weeks) => { ... };

// AVOID: Cryptic abbreviations
const calcFM = (t, j, w) => { ... };
```

### Database Persistence

**IndexedDB Schema** (version 3):
- **Database name**: `StarshipDesignerDB` — shared with the main Starship Designer app, since both apps are served from the same origin (`srd-tools.com`) under different paths. IndexedDB is scoped by origin, not path, so opening a lower version than what's already in the browser throws `VersionError`; each app therefore keeps its own object store and independently bumps its own version.
- **Object Store**: `capital_ships` (this app's own store; the legacy `ships` store from v1/v2 is left untouched — it's shared history with main and this app cannot reliably tell which of those records are its own)
- **Key Path**: `id` (auto-increment)
- **Indexes**:
  - `name` (unique) on `ship.name` - enforces unique ship names
  - `createdAt` on `createdAt` - for sorting
- **Migration Logic**: Must stay callback-based inside `onupgradeneeded` — no async/await (the versionchange transaction auto-commits when no requests are pending)

**Initial Data**: On first load, if DB is empty, `SelectShipPanel` calls `initialDataService.loadInitialDataIfNeeded()`, which fetches `public/initial-ships.json` (currently seeded with "Large Liner" and "Destroyer") and preloads it. If that yields nothing, it falls back to the hardcoded ships in `SelectShipPanel.createDefaultShips()`.

**Data Cleanup**: `constants.ts` includes `cleanInvalidCargo()` to remove deprecated cargo types when loading ships

### Utility Functions

**`src/utils/shipDefaults.ts`**: Ship initialization helpers
- `createEmptyShipDesign(shipInfo)`: Creates a ShipDesign with empty component arrays and default comms/sensors
- `createDefaultShip(name, techLevel, tonnage, configuration)`: Creates a Ship object with sensible defaults
- Used to eliminate ~120 lines of repeated initialization code across 12+ files

**`src/utils/calculations.ts`**: Component aggregation helpers
- `sumMass(items)`: Sum mass for components without quantity (engines, fittings, custom_items)
- `sumMassWithQuantity(items)`: Sum mass for components with quantity (weapons, defenses, vehicles, drones, berths, facilities)
- `sumCost(items)`: Sum cost for components without quantity
- `sumCostWithQuantity(items)`: Sum cost for components with quantity
- `sumCargoTonnage(cargo)`: Sum cargo tonnage (special case, uses `tonnage` property)
- Used to eliminate ~30+ lines of repeated reduce operations across App.tsx, MassSidebar.tsx, and test files

**`src/utils/printContent.ts`**: Shared print HTML generator
- `generateShipPrintContent(shipDesign, mass, cost, staff, combinePilotNavigator, noStewards, activeRules)`: Generates a complete standalone HTML document for printing
- Includes `escapeHtml()` for XSS prevention
- Used by `handleFilePrint()` in App.tsx; replaces the former App.tsx stub and SummaryPanel's `generateTableRows()` function

**`src/utils/logger.ts`**: Lightweight console logger
- Exports a `logger` object with `info()` and `error()` methods
- All messages are prefixed with `[StarshipDesigner]` for easy DevTools filtering
- Used throughout App.tsx for DB operations, saves, prints, and rule changes

**`src/utils/sparesCalculation.ts`**: Spares / maintenance helpers (used by CargoPanel)
- `calculateMonthsBetweenService(spares, shipTonnage)`: Returns months between service; formula is `1 + floor((spares / shipTonnage) * 100)` — every 1% of ship tonnage in spares adds one month
- `getSparesIncrement(currentSpares, shipTonnage)`: Tons needed to reach the next service interval
- `getSparesPercentage(spares, shipTonnage)`: Spares as a percentage of ship tonnage

## Important Implementation Details

### Mass Calculation Complexity

The `calculateMass()` function in App.tsx handles:
- Component masses using utility functions (sumMass, sumMassWithQuantity, sumCargoTonnage)
- Fuel mass calculation using `calculateTotalFuelMass()` with optional antimatter rule
- Missile/sand reload storage (direct tonnage)
- Armor mass (percentage of hull tonnage)
- Spinal weapon mass (for capital ships, tech-level dependent)

**Watch out**: Defense mass is stored **per-unit** (not pre-multiplied). Use `sumMassWithQuantity(defenses)` — not `sumMass` — to get the correct total. The same applies to defense cost.

### Staff Requirements Logic

Complex crew calculation in `calculateStaffRequirements()` (hoisted before JSX return in App.tsx, called once per render):
- **Engineers**: Tiered by ship tonnage:
  - 100 tons: fixed 1 engineer (not reduced by Robotics)
  - 200 or 300 tons: fixed 2 engineers (not reduced by Robotics)
  - 400+ tons (or any tonnage with at least one engine): 1 per engine, plus `ceil(mass/100) - 1` extra for each engine whose mass exceeds 100 tons; if the Robotics rule is active, each engine's own crew requirement (mass tier included) is divided by `getRoboticsCrewDivisor(techLevel)` and rounded up *before* summing across engines
  - No engines configured: fixed 1 engineer (not reduced by Robotics)
- **Gunners**:
  - 1 per 10 turrets/barbettes (rounded up)
  - 1 per 10 defense turrets (rounded up)
  - Defensive screens: minimum 4, or `ceil(totalScreenTons / 100)` if total screen tonnage >400
  - Spinal weapons: +10 gunners
  - Bay weapons: 2 gunners per bay weapon (per unit quantity)
  - If the Robotics rule is active, the summed gunner total above is divided by `getRoboticsGunnerDivisor(techLevel)` and rounded up — one TL tier behind the engineer reduction (starts at TL-G, not TL-F)
- **Stewards**: 1 per 8 staterooms (rounded up)
- **Medical**: Calculated by `calculateMedicalStaff()` based on medical facilities
- **Service**: Vehicle service (`calculateVehicleServiceStaff`) + drone service (`calculateDroneServiceStaff`) from `constants.ts`
- **Custom Crew**: The Custom panel's per-category crew counts (`shipDesign.custom_crew`) are added on top of every formula-derived position above; `infantry`/`armor`/`mp`/`security` have no formula anywhere else, so their `StaffRequirements` totals are exactly whatever's entered there

Small ships (**exactly** 100 or 200 tons — not 300+) can combine pilot/navigator roles and skip stewards.

### Tech Level Dependencies

Many features are tech-level gated:
- `TECH_LEVELS` runs `A`-`H`, then `J` (TL 18) — `I` is skipped per the Traveller TL convention, matching the letter-skip already used for capital-ship hull codes. `convertTechLevelToNumber()` derives its result from `TECH_LEVELS` position (`getTechLevelIndex(tl) + 10`), not raw character code, so the skip is handled correctly; don't revert it to a charCode formula.
- Maximum jump performance: TL A=J1, TL B=J2, ... TL F+=J6. With the Longer Jumps rule active, TL G allows J-8 and TL H+ (including TL-J) allows J-10 (`getEffectiveMaxJump(techLevel, longerJumpsEnabled)`); power plants and maneuver drives can reach performance 10 to support those drives. TL-J doesn't currently unlock any jump/power-plant performance beyond what TL-H already gives — it exists to support the Robotics rule's TL-J tier (see Rules System) — so extending performance further at TL-J is a deliberate future addition, not an oversight.
- Spinal weapons: Different weapons available at different TLs, require minimum power plant performance
- Computer models: Minimum computer required based on tonnage + jump performance
- Vehicle availability: Most vehicles have minimum TL requirements
- Changing hull size (`handleShipInfoUpdate` in App.tsx) clears engine and fuel selections — engine mass/cost are computed from tonnage at selection time and don't auto-update — and re-tiers the bridge fitting. Changing tech level drops now-illegal jump drives and too-advanced vehicles from the design.

Use helper functions: `isTechLevelAtLeast()`, `getMaxJumpByTechLevel()`, `getEffectiveMaxJump()`, `getTechLevelIndex()`

### Capital Ship Rules

Ships ≥3,000 tons are capital ships with special rules:
- Have hull codes (CA-CZ) via `getTonnageCode()`
- Have sections (2-6) via `getNumberOfSections()`
- Can mount spinal weapons
- Different computer requirements

### Rules System

`activeRules` state (Set<string>) enables optional rule sets:
- `'spacecraft_design_srd'`: Always enabled (base rules)
- `'antimatter'`: Antimatter drives (TL-H, 1% of ship tons per Jump performance)
- `'longer_jumps'`: Extended jumps (TL-G+) — raises the jump cap via `getEffectiveMaxJump()`
- `'robotics'`: Robotic crew assistance (TL-F+) — reduces per-engine Engineer requirements via `getRoboticsCrewDivisor(techLevel)` (TL-F=1/2, TL-G=1/4, TL-H=1/6, TL-J=1/8) and, one TL tier later, total Gunner requirements via `getRoboticsGunnerDivisor(techLevel)` (TL-G=1/2, TL-H=1/3, TL-J=1/4). Both divisors are read directly in `calculateStaffRequirements()` — Robotics has no installed-component analog the way the Antimatter Plant does, it's a pure rules toggle
- Additional rules can be added via RulesMenu component

Rules affect calculations (e.g., fuel mass with antimatter) - check `activeRules.has('rule_id')` before applying rule-specific logic. `RulesMenu` computes `enabled`/`disabled` per-rule from the ship's tech level on every render, but that's purely for its own display — it must separately call `onRuleChange` whenever a tech-level change flips a rule's effective availability, or App's `activeRules` (the actual source of truth used in calculations) silently desyncs from what the menu shows.

### Print Functionality

`handleFilePrint()` in App.tsx generates a printable HTML view. It calls `generateShipPrintContent()` from `src/utils/printContent.ts`, which produces a complete standalone HTML document with embedded styles and XSS prevention via `escapeHtml()`. This shared utility is the single source of truth for print output — SummaryPanel does not have its own print implementation.

### Cost Calculation

`calculateCost()` in App.tsx includes the hull cost (`getHullCost()`, tonnage / 10 MCr per the simplified `HULL_SIZES` formula), all component costs, missile reloads (1 MCr/ton), sand reloads (0.1 MCr/ton), armor (0.1 MCr/ton of armor mass), and the spinal weapon if selected. Bridges follow the SRD: 0.5 MCr per 100 tons of ship, multiplied by section count for multi-section capital ships; half bridges are half tonnage at 75% of the full bridge cost. Launch tubes cost 0.5 MCr per ton of tube (12.5 MCr per ton of vehicle capacity, since a tube is 25 tons per ton of vehicle). The Summary table, CSV export, and print output must all include a line item for every cost source (Hull, Computer, Missile Reloads, Spinal Weapon, Armor included) so their displayed rows sum to the Totals row — a value folded into `calculateCost()`/`calculateMass()` without a matching line item makes the printout look wrong even though the total itself is correct.

## Testing Approach

- **Test Runner**: Jest with jsdom environment
- **Test Location**: Co-located with source files (`.test.ts` extension)
- **Setup Files**:
  - `jest.setup.js`: Global mocks
  - `src/test/setup.ts`: Testing Library setup
  - `jest-environment-jsdom-with-structuredclone.js`: Custom environment for structuredClone support
- **Coverage**: Utility functions and business logic extracted from App.tsx
- **Mocking**: `fake-indexeddb` for IndexedDB tests
- **Test files** (current):
  - `src/utils/sparesCalculation.test.ts` — spares/service interval math
  - `src/utils/printContent.test.ts` — print HTML generation
  - `src/data/constants.test.ts` — game constants and helpers
  - `src/data/cargoCleanup.test.ts` — `cleanInvalidCargo()` filtering
  - `src/services/database.test.ts` — IndexedDB service
  - `src/services/flushDB.test.ts` — DB flush utility
  - `src/services/initialDataService.test.ts` — initial ship loading
  - `src/services/antimatterIntegration.test.ts` — antimatter rule integration
  - `src/services/engineeringStaff.test.ts` — engineer count calculation (extracted from App.tsx)
  - `src/services/serviceStaff.test.ts` — vehicle/drone service staff calculation
  - `src/services/crewAdjustments.test.ts` — small-ship pilot/steward adjustments
  - `src/components/RulesMenu.test.tsx` — RulesMenu component

## File Operations

The app supports standard file operations via FileMenu component:
- **Save (Ctrl+S)**: Updates existing ship in DB
- **Save As (Ctrl+Shift+S)**: Prompts for new name and creates copy
- **Print (Ctrl+P)**: Opens print dialog with ship summary
- **Back to Ship Select**: Returns to ship selection panel

Ship names must be unique (enforced by DB unique index). Attempting to save duplicate names will throw an error.

## Deployment

Production deploys as a Cloudflare Worker (`wrangler deploy`, see `wrangler.jsonc`) serving the Vite `dist/` build under `/CapitalShipDesign` at `srd-tools.com`. There is no Docker deployment path — a stale `Dockerfile` (pre-Vite webpack dev server, port 8080) was removed.

## Debugging Tips

1. **Database Issues**: Check browser DevTools → Application → IndexedDB → StarshipDesignerDB → `capital_ships` object store
2. **Mass Calculation Problems**: Add console.log in `calculateMass()` to trace component contributions
3. **Panel Validation**: Check `isCurrentPanelValid()` and `canAdvance()` in App.tsx
4. **Initial Data Loading**: Check `SelectShipPanel.tsx` and `initialDataService.ts` for DB initialization logic
5. **Weapon/Defense Cleanup**: Non-standard weapons are automatically removed on ship load (see `handleLoadShip()`)

## Common Modifications

**Adding a new component type**:
1. Add interface to `src/types/ship.ts`
2. Add array to `ShipDesign` interface
3. Add panel component in `src/components/`
4. Add case to `renderCurrentPanel(mass, cost, staff)` in App.tsx
5. Update `calculateMass()` and `calculateCost()`
6. Add to initial ship design state in App.tsx
7. Update `MassSidebar.tsx` to include new category
8. Update `SummaryPanel.tsx` CSV/print/display to include new items
9. Update all test mock data to include empty array for new field

**Example: Custom Items Panel**:
The Custom panel (`src/components/CustomPanel.tsx`) is a recent addition that demonstrates this pattern:
- **Purpose**: Allow users to add arbitrary items not in predefined lists
- **Data Model**: `CustomItem { name: string, mass: number, cost: number }`
- **UI Pattern**: Form with text/number inputs + table with remove buttons
- **Different from other panels**: No predefined types or constants - fully user-defined
- **Integration**: Same as other panels - appears in mass/cost calculations, CSV export, summary

**Adding a new rule**:
1. Add rule definition to RulesMenu component
2. Add rule ID to `activeRules` checks where needed
3. Update calculation functions to use `activeRules.has('rule_id')`

**Modifying validation**:
- Panel-specific validation in `isCurrentPanelValid()` switch statement
- Mass overweight check in `canAdvance()`

## Known Issues & Quirks

- Ship names in DB are stored as `ship.name` (nested property) for indexing
- `public/initial-ships.json` is loaded once on first DB initialization - subsequent changes require DB flush
- Testing.md incorrectly mentions Vitest, but project uses Jest
- `scripts/extractDB.mjs`, `scripts/flushDB.mjs`, and `scripts/preloadDB.mjs` run against `fake-indexeddb` (an isolated in-memory implementation), not a real browser's IndexedDB — they can't actually read or write a user's saved ships. `pnpm setInitialDB` (which chains `extractDB` → copies the export into `public/initial-ships.json`) is non-functional for the same reason. Treat `public/initial-ships.json` as hand-maintained until this is fixed.
- Weapon/defense turrets and bay weapons and the spinal weapon all share the same mount pool (`getWeaponMountLimit()` = hull tonnage / 100); WeaponsPanel, DefensesPanel, and the spinal weapon selection must each account for the others' usage when enforcing the limit.

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
   - Added 'Custom' to panels array at index 9 (after Drones, before Berths)
   - Initialized `custom_items: []` in shipDesign state
   - Added case 9 in renderCurrentPanel() switch
   - Renumbered subsequent cases: Berths 9→10, Staff 10→11, Summary 11→12
   - Updated calculateMass(): `used += shipDesign.custom_items.reduce(...)`
   - Updated calculateCost(): `total += shipDesign.custom_items.reduce(...)`

4. **Mass Sidebar** (`src/components/MassSidebar.tsx`):
   - Calculated customItemsMass
   - Added Custom category to categories array
   - Positioned after Drones, before Berths

5. **Summary Panel** (`src/components/SummaryPanel.tsx`):
   - Updated generateCsvData(): added custom items section
   - Updated display JSX: added custom items table rows

6. **Test Updates** (all test files):
   - Added `custom_items: []` to every mock ShipDesign object
   - Files updated: RulesMenu.test.tsx, SelectShipPanel.tsx, ShipPanel.tsx,
     database.test.ts, flushDB.test.ts, initialDataService.test.ts,
     antimatterIntegration.test.ts

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
2. **Update All Integration Points**: Mass calculation, cost calculation, sidebar, summary, CSV - all must be updated
3. **Don't Forget Tests**: All mock data needs the new field to avoid TypeScript errors
4. **Panel Indices Matter**: Adding a panel mid-sequence requires renumbering subsequent cases
5. **Validation Philosophy**: App allows invalid intermediate states but prevents navigation past blocking issues

### Testing Checklist Used

- [x] Panel appears in navigation
- [x] Can add items with name, mass, cost
- [x] Can remove individual items
- [x] Form validates correctly
- [x] Form resets after add
- [x] Items show in Mass Sidebar
- [x] Mass calculation includes custom items
- [x] Cost calculation includes custom items
- [x] Summary table displays custom items
- [x] CSV export includes custom items
- [x] Print view includes custom items
- [x] Items persist when saving ship
- [x] Items load when loading ship
- [x] All tests pass (270 tests)
- [x] Build succeeds with no errors

### Files Modified

**Created:**
- `src/components/CustomPanel.tsx` (140 lines)

**Modified:**
- `src/types/ship.ts` - Added CustomItem interface
- `src/App.tsx` - Integration (import, state, navigation, calculations)
- `src/components/MassSidebar.tsx` - Added Custom category
- `src/components/SummaryPanel.tsx` - CSV/print/display updates
- `src/components/RulesMenu.test.tsx` - Test data
- `src/components/SelectShipPanel.tsx` - Default ships data
- `src/components/ShipPanel.tsx` - Existing ship loading
- `src/services/database.test.ts` - Test data
- `src/services/flushDB.test.ts` - Test data
- `src/services/initialDataService.test.ts` - Test data
- `src/services/antimatterIntegration.test.ts` - Test data

**Total Changes:** ~500 lines across 12 files

This implementation serves as a template for adding similar features in the future.
