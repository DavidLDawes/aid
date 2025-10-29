# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Traveller Capital Starship Designer** - a React-based web application for designing capital starships based on the Traveller SRD (System Reference Document) spacecraft design rules. The application uses IndexedDB for local persistence and features a multi-panel wizard interface for configuring all aspects of a capital ship.

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

**Main Entry Point**: `src/App.js` (compiled from App.tsx)
- Central state management for entire ship design
- Orchestrates 12 specialized panels in a wizard flow
- Handles mass/cost calculations and validation
- Manages file operations (save/load/print)
- Implements "Rules Menu" system for optional rule sets (e.g., antimatter drives)

**Panel Flow**: Ship → Engines → Fittings → Weapons → Defenses → Rec/Health → Cargo → Vehicles → Drones → Berths → Staff → Ship Design

### Key Design Patterns

1. **Wizard UI Pattern**: User progresses through panels sequentially. Each panel validates before allowing advancement.

2. **Centralized State**: `App.js` maintains the complete `shipDesign` object containing all ship components (ship, engines, fittings, weapons, defenses, berths, facilities, cargo, vehicles, drones).

3. **Mass & Cost Tracking**: Real-time calculations in `App.js` methods:
   - `calculateMass()`: Sums masses from all components + fuel + armor + reloads
   - `calculateCost()`: Sums costs from all components
   - `calculateStaffRequirements()`: Determines crew needs based on ship systems
   - Validation prevents over-mass designs

4. **Database Service Pattern**: `src/services/database.ts` provides IndexedDB abstraction
   - Ships are stored with unique names (enforced by unique index)
   - Auto-initialization loads `public/initial-ships.json` on first run
   - Handles version migrations (currently at version 2)

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
- Component interfaces: `Engine`, `Fitting`, `Weapon`, `Defense`, `Berth`, `Facility`, `Cargo`, `Vehicle`, `Drone`
- `StaffRequirements`: Crew calculation results

### Component Architecture

Components follow a consistent pattern:
- **Props**: Receive current state + `onUpdate` callback
- **State**: Local UI state only (selections, toggles)
- **Updates**: Call `onUpdate` with new array/object to update parent
- **Validation**: Display warnings but allow invalid states (validation enforced at panel navigation level)

Example: `WeaponsPanel` manages weapon selection UI but calls `onUpdate(weapons)` to update App state.

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

## Important Implementation Details

### Mass Calculation Complexity

The `calculateMass()` function in App.js handles:
- Component masses (some are per-item, some are pre-multiplied by quantity)
- Fuel mass calculation using `calculateTotalFuelMass()` with optional antimatter rule
- Missile/sand reload storage (direct tonnage)
- Armor mass (percentage of hull tonnage)
- Spinal weapon mass (for capital ships, tech-level dependent)

**Watch out**: Defense masses are already multiplied by quantity in the defense object, but other components multiply `mass * quantity` when summing.

### Staff Requirements Logic

Complex crew calculation in `calculateStaffRequirements()`:
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

`handleFilePrint()` generates printable HTML view with ship stats. Uses `generatePrintContent()` to create standalone HTML document with embedded styles. Simplified compared to SummaryPanel's detailed view.

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
3. **Panel Validation**: Check `isCurrentPanelValid()` and `canAdvance()` in App.js
4. **Initial Data Loading**: Check `SelectShipPanel.tsx` and `initialDataService.ts` for DB initialization logic
5. **Weapon/Defense Cleanup**: Non-standard weapons are automatically removed on ship load (see `handleLoadShip()`)

## Common Modifications

**Adding a new component type**:
1. Add interface to `src/types/ship.ts`
2. Add array to `ShipDesign` interface
3. Add panel component in `src/components/`
4. Add case to `renderCurrentPanel()` in App.js
5. Update `calculateMass()` and `calculateCost()`
6. Add to initial ship design state in App.js

**Adding a new rule**:
1. Add rule definition to RulesMenu component
2. Add rule ID to `activeRules` checks where needed
3. Update calculation functions to use `activeRules.has('rule_id')`

**Modifying validation**:
- Panel-specific validation in `isCurrentPanelValid()` switch statement
- Mass overweight check in `canAdvance()`

## Known Issues & Quirks

- App.js is compiled JavaScript (not TypeScript source) - prefer editing App.tsx if available, or be aware of JSX syntax when editing
- Defense objects store `mass * quantity` as `mass` property, unlike other components
- Ship names in DB are stored as `ship.name` (nested property) for indexing
- Port 8080 is hardcoded in webpack config and Docker setup
- `public/initial-ships.json` is loaded once on first DB initialization - subsequent changes require DB flush
- Testing.md incorrectly mentions Vitest, but project uses Jest
