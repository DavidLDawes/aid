# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Traveller Capital Starship Designer** - a React-based web application for designing capital starships based on the Traveller SRD (System Reference Document) spacecraft design rules. The application uses IndexedDB for local persistence and features a multi-panel wizard interface for configuring all aspects of a capital ship.

## General Rules
When you spend time searching for commands to typecheck, lint, build, or test, you should ask the user if it's okay to add those commands to CLAUDE.md. Similarly, when learning about code style preferences or important codebase information, ask if it's okay to add that to CLAUDE.md so you can remember it for next time.

## Common Development Commands

```bash
# Install dependencies
npm install

# Development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Preview production build
npm preview

# Linting
npm run lint

# Testing
npm test                # Run tests in watch mode
npm run test:ui         # Run tests with UI
npm run test:run        # Run tests once (used in CI)

# Database management
npm run extractDB       # Export ships from IndexedDB to JSON files
npm run preloadDB       # Import ships from JSON files to IndexedDB
npm run flushDB         # Clear all ships from IndexedDB
npm run setInitialDB    # Reset DB to initial state
npm run apply-feature   # Apply feature branches to ships
```

## Project Directory Structure

```
aid/
├── public/                      # Static assets
│   ├── index.html              # HTML template
│   └── initial-ships.json      # Default ships loaded on first run
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
│   │   ├── printContent.ts     # Shared print HTML generator
│   │   └── shipDefaults.ts     # Ship initialization helpers
│   ├── test/                   # Test utilities
│   ├── App.tsx                 # Main app component
│   ├── App.css                 # Global styles
│   └── main.tsx                # React entry point
├── dist/                       # Production build output (generated)
├── package.json                # Dependencies and scripts
├── webpack.config.cjs          # Webpack configuration
├── tsconfig.json              # TypeScript configuration
├── jest.config.cjs            # Jest configuration
├── Dockerfile                 # Docker container definition
├── CLAUDE.md                  # This file - Claude Code guidance
└── README.md                  # Project README

Test files are co-located with source files using .test.ts/.test.tsx extension
```

## Build System & Technology Stack

- **Build Tool**: Webpack 5 with webpack-dev-server
- **Frontend**: React 19 with TypeScript
- **Testing**: Jest with Testing Library
- **Database**: IndexedDB (via fake-indexeddb for tests) - browser-based local storage
- **Bundler Config**: `webpack.config.cjs` - entry point is `src/main.tsx`
- **Dev Server**: Runs on port 8080 (configured in webpack.config.cjs)
- **Node Version**: 22.x (specified in package.json engines)

## Architecture Overview

### Core Application Structure

**Main Entry Point**: `src/App.tsx`
- Central state management for entire ship design
- Orchestrates 13 specialized panels in a wizard flow
- Handles mass/cost calculations and validation
- Manages file operations (save/load/print)
- Implements "Rules Menu" system for optional rule sets (e.g., antimatter drives)

**Panel Flow**: Ship → Engines → Fittings → Weapons → Defenses → Rec/Health → Cargo → Vehicles → Drones → Custom → Berths → Staff → Ship Design

**Note**: The Custom panel (index 9) was added to allow users to define custom items not in predefined lists.

### Key Design Patterns

1. **Wizard UI Pattern**: User progresses through panels sequentially. Each panel validates before allowing advancement.

2. **Centralized State**: `App.tsx` maintains the complete `shipDesign` object containing all ship components (ship, engines, fittings, weapons, defenses, berths, facilities, cargo, vehicles, drones, custom_items).

3. **Mass & Cost Tracking**: Real-time calculations in `App.tsx` methods:
   - `calculateMass()`: Sums masses from all components + fuel + armor + reloads
   - `calculateCost()`: Sums costs from all components
   - `calculateStaffRequirements()`: Determines crew needs based on ship systems
   - Validation prevents over-mass designs

4. **Database Service Pattern**: `src/services/database.ts` provides IndexedDB abstraction
   - Ships are stored with unique names (enforced by unique index)
   - Auto-initialization loads `public/initial-ships.json` on first run
   - Handles version migrations (currently at version 2)
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

**IndexedDB Schema** (version 2):
- **Object Store**: `ships`
- **Key Path**: `id` (auto-increment)
- **Indexes**:
  - `name` (unique) on `ship.name` - enforces unique ship names
  - `createdAt` on `createdAt` - for sorting
- **Migration Logic**: Version 2 upgrade cleaned up duplicate "Fat Trader" entries and added unique constraint

**Initial Data**: On first load, if DB is empty, loads ships from `public/initial-ships.json` via `initialDataService.ts`

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
- **Engineers**: Based on ship tonnage tiers (100/200-300/400+) and engine mass (1 per 100 tons)
- **Gunners**:
  - 1 per 10 turrets/barbettes (rounded up)
  - 1 per 10 defense turrets (rounded up)
  - Defensive screens: minimum 4 or (tons/100) if >400 tons
  - Spinal weapons: +10 gunners
- **Stewards**: 1 per 8 staterooms (rounded up)
- **Medical**: Calculated by `calculateMedicalStaff()` based on medical facilities
- **Service**: For vehicle/drone maintenance

Small ships (100-200 tons) can combine pilot/navigator roles and skip stewards.

### Tech Level Dependencies

Many features are tech-level gated:
- Maximum jump performance: TL A=J1, TL B=J2, ... TL F+=J6
- Spinal weapons: Different weapons available at different TLs, require minimum power plant performance
- Computer models: Minimum computer required based on tonnage + jump performance
- Vehicle availability: Most vehicles have minimum TL requirements

Use helper functions: `isTechLevelAtLeast()`, `getMaxJumpByTechLevel()`, `getTechLevelIndex()`

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
- Additional rules can be added via RulesMenu component

Rules affect calculations (e.g., fuel mass with antimatter) - check `activeRules.has('rule_id')` before applying rule-specific logic.

### Print Functionality

`handleFilePrint()` in App.tsx generates a printable HTML view. It calls `generateShipPrintContent()` from `src/utils/printContent.ts`, which produces a complete standalone HTML document with embedded styles and XSS prevention via `escapeHtml()`. This shared utility is the single source of truth for print output — SummaryPanel does not have its own print implementation.

## Testing Approach

- **Test Runner**: Jest with jsdom environment
- **Test Location**: Co-located with source files (`.test.ts` extension)
- **Setup Files**:
  - `jest.setup.js`: Global mocks
  - `src/test/setup.ts`: Testing Library setup
  - `jest-environment-jsdom-with-structuredclone.js`: Custom environment for structuredClone support
- **Coverage**: Focus on utility functions (`sparesCalculation`, `constants`) and services (`database`, `initialDataService`)
- **Mocking**: `fake-indexeddb` for IndexedDB tests

## File Operations

The app supports standard file operations via FileMenu component:
- **Save (Ctrl+S)**: Updates existing ship in DB
- **Save As (Ctrl+Shift+S)**: Prompts for new name and creates copy
- **Print (Ctrl+P)**: Opens print dialog with ship summary
- **Back to Ship Select**: Returns to ship selection panel

Ship names must be unique (enforced by DB unique index). Attempting to save duplicate names will throw an error.

## Docker Support

`Dockerfile` available for containerized deployment:
```bash
docker build -t starship-designer .
docker run -p 8080:8080 starship-designer
```

The Docker image runs the production build served via http-server.

## Debugging Tips

1. **Database Issues**: Check browser DevTools → Application → IndexedDB → StarshipDesignerDB
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
- Port 8080 is hardcoded in webpack config and Docker setup
- `public/initial-ships.json` is loaded once on first DB initialization - subsequent changes require DB flush
- Testing.md incorrectly mentions Vitest, but project uses Jest

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
