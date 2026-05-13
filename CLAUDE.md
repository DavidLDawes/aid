# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Traveller Starship Designer** — a React-based web application for designing starships (100–2,000 tons) based on the Traveller SRD (System Reference Document) spacecraft design rules. The application uses IndexedDB for local persistence and features a multi-panel wizard interface for configuring all aspects of a ship.

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

**Note**: `npm test` may fail on Node v24 due to a fake-indexeddb compatibility issue. Use `node_modules\.bin\jest.cmd --no-coverage` directly, or ensure Node 22.x is active.

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
│   │   ├── BerthsPanel.tsx     # Berths (panel 9)
│   │   ├── StaffPanel.tsx      # Crew requirements (panel 10)
│   │   ├── SummaryPanel.tsx    # Ship summary (panel 11)
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
│   │   └── sparesCalculation.ts
│   ├── test/                   # Test utilities
│   ├── App.tsx                 # Main app component
│   ├── App.css                 # Global styles
│   └── main.tsx                # React entry point
├── dist/                       # Production build output (generated)
├── package.json                # Dependencies and scripts
├── webpack.config.cjs          # Webpack configuration
├── tsconfig.json               # TypeScript configuration
├── tsconfig.app.json           # TypeScript configuration for app
├── jest.config.cjs             # Jest configuration
├── babel.config.cjs            # Babel configuration
├── Dockerfile                  # Docker container definition
├── CLAUDE.md                   # This file
└── README.md                   # Project README

Test files are co-located with source files using .test.ts/.test.tsx extension
```

## Build System & Technology Stack

- **Build Tool**: Webpack 5 with webpack-dev-server
- **Frontend**: React 19 with TypeScript
- **Testing**: Jest with Testing Library
- **Database**: IndexedDB (via fake-indexeddb for tests) — browser-based local storage
- **Bundler Config**: `webpack.config.cjs` — entry point is `src/main.tsx`
- **Dev Server**: Runs on port 8080 (configured in webpack.config.cjs)
- **Node Version**: 22.x (specified in package.json engines)

## Architecture Overview

### Core Application Structure

**Main Entry Point**: `src/App.tsx`
- Central state management for entire ship design
- Orchestrates 12 specialized panels in a wizard flow
- Handles mass/cost calculations and validation
- Manages file operations (save/load/print)
- Implements "Rules Menu" system for optional rule sets (e.g., antimatter drives)

**Panel Flow**: Ship → Engines → Fittings → Weapons → Defenses → Rec/Health → Cargo → Vehicles → Drones → Berths → Staff → Ship Design

### Key Design Patterns

1. **Wizard UI Pattern**: User progresses through panels sequentially. Each panel validates before allowing advancement.

2. **Centralized State**: `App.tsx` maintains the complete `shipDesign` object containing all ship components (ship, engines, fittings, weapons, defenses, berths, facilities, cargo, vehicles, drones).

3. **Mass & Cost Tracking**: Real-time calculations in `App.tsx`:
   - `calculateMass()`: Sums masses from all components + fuel + reloads
   - `calculateCost()`: Sums costs from all components
   - `calculateStaffRequirements()`: Determines crew needs based on ship systems
   - Validation prevents over-mass designs

4. **Database Service Pattern**: `src/services/database.ts` provides IndexedDB abstraction
   - Ships are stored with unique names (enforced by unique index)
   - Auto-initialization loads `public/initial-ships.json` on first run
   - Handles version migrations (currently at version 2)

### Critical Data Files

**`src/data/constants.ts`**: Central source of truth for game rules
- Tech levels (A–H mapping to TL 10–17+)
- Engine performance tables (power plant, maneuver, jump drives)
- Weapon types, defense types, vehicle types, drone types
- Fuel calculation formulas
- Staff calculation helpers

**`src/types/ship.ts`**: TypeScript interfaces for all ship components
- `ShipDesign`: Root interface containing all component arrays
- Component interfaces: `Engine`, `Fitting`, `Weapon`, `Defense`, `Berth`, `Facility`, `Cargo`, `Vehicle`, `Drone`
- `StaffRequirements`: Crew calculation results
- `MassCalculation`, `CostCalculation`: Calculation result types

### Component Architecture

Components follow a consistent pattern:
- **Props**: Receive current state + `onUpdate` callback
- **State**: Local UI state only (selections, toggles)
- **Updates**: Call `onUpdate` with new array/object to update parent
- **Validation**: Display warnings but allow invalid states (validation enforced at panel navigation level)

Example: `WeaponsPanel` manages weapon selection UI but calls `onUpdate(weapons)` to update App state.

### Architecture Best Practices

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
// GOOD: Calculate derived values when needed
const mass = calculateMass();
const cost = calculateCost();

// AVOID: Store calculated values in state
const [totalMass, setTotalMass] = useState(0);
```

### Database Persistence

**IndexedDB Schema** (version 2):
- **Object Store**: `ships`
- **Key Path**: `id` (auto-increment)
- **Indexes**:
  - `name` (unique) on `ship.name` — enforces unique ship names
  - `createdAt` on `createdAt` — for sorting
- **Migration Logic**: Version 2 upgrade cleaned up duplicate "Fat Trader" entries and added unique constraint

**Initial Data**: On first load, if DB is empty, loads ships from `public/initial-ships.json` via `initialDataService.ts`

**Data Cleanup**: `constants.ts` includes `cleanInvalidCargo()` to remove deprecated cargo types when loading ships

## Important Implementation Details

### Mass Calculation

The `calculateMass()` function in App.tsx handles:
- Engine masses (sum of mass for each engine)
- Fitting masses
- Weapon masses × quantity
- Defense masses × quantity
- Facility masses × quantity
- Berth masses × quantity
- Vehicle masses × quantity
- Drone masses × quantity
- Cargo tonnage (uses `tonnage` property, not `mass`)
- Fuel mass via `calculateTotalFuelMass()` with optional antimatter rule
- Missile/sand reload storage (direct tonnage)

**Watch out**: Defense/weapon/berth/vehicle/drone mass is stored **per-unit**. Always multiply by `quantity` when summing — don't just sum the `mass` field directly.

### Staff Requirements Logic

`calculateStaffRequirements()` in App.tsx:
- **Engineers**: Based on ship tonnage tiers and engine mass (1 per 100 tons)
- **Gunners**: 1 per 10 turrets/barbettes (rounded up), 1 per 10 defense turrets (rounded up)
- **Stewards**: 1 per 8 staterooms (rounded up)
- **Medical**: Calculated by `calculateMedicalStaff()` based on medical facilities
- **Service**: For vehicle/drone maintenance

Small ships (100–200 tons) can combine pilot/navigator roles and skip stewards.

### Tech Level Dependencies

Many features are tech-level gated:
- Maximum jump performance: TL A=J1, TL B=J2, … TL F+=J6
- Vehicle availability: Most vehicles have minimum TL requirements

Use helper functions: `isTechLevelAtLeast()`, `getMaxJumpByTechLevel()`, `getTechLevelIndex()`

### Rules System

`activeRules` state (Set<string>) enables optional rule sets:
- `'spacecraft_design_srd'`: Always enabled (base rules)
- `'antimatter'`: Antimatter drives (TL-H, 1% of ship tons per Jump performance)

Rules affect calculations (e.g., fuel mass with antimatter) — check `activeRules.has('rule_id')` before applying rule-specific logic.

### Print Functionality

`handleFilePrint()` in App.tsx opens a new window and calls `generatePrintContent()` (defined in App.tsx) to produce a standalone HTML document. The implementation is currently simplified; for a more complete print view, SummaryPanel's display logic can serve as a reference.

## Testing Approach

- **Test Runner**: Jest with jsdom environment
- **Test Location**: Co-located with source files (`.test.ts` extension)
- **Setup Files**:
  - `jest.setup.js`: Global mocks
  - `src/test/setup.ts`: Testing Library setup
  - `jest-environment-jsdom-with-structuredclone.js`: Custom environment for structuredClone support
- **Coverage**: Focus on utility functions, constants, and services
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
4. Add case to `renderCurrentPanel()` in App.tsx
5. Update `calculateMass()` and `calculateCost()`
6. Add to initial ship design state in App.tsx
7. Update `MassSidebar.tsx` to include new category
8. Update `SummaryPanel.tsx` CSV/print/display to include new items
9. Update all test mock data to include empty array for new field

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
- `public/initial-ships.json` is loaded once on first DB initialization — subsequent changes require DB flush
- TESTING.md incorrectly mentions Vitest, but project uses Jest
- Print output (`generatePrintContent` in App.tsx) is currently a simplified stub; the full ship details are only shown in SummaryPanel's on-screen display
