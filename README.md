# Traveller Megastructure Designer

A Megastructure Designer for the Traveller RPG, built with Claude. Uses a Wizard UI and IndexedDB for browser-local persistence — no backend server required.

Megastructures are permanent (or near-stationary) constructions from 1,000,000 to 1,000,000,000 tons (in 1,000,000-ton steps) — ring worlds, orbital habitats, shipyards, and similar. Unlike the sibling Starship and Capital Ship designers in this repository, megastructures have **no jump drive**.

## Quick Start

```bash
pnpm install
pnpm dev
```

The application will be available at `http://localhost:5173`.

## Features

- **Multi-Panel Design Interface**: 15 panels for complete megastructure configuration
- **Megastructure Scale**: Designs from 1,000,000 to 100,000,000 tons, with a control center, sensors, and computer that scale by the number of million-ton sections
- **Power Plant & Maneuver Drive**: No jump drive; power plant performance is tech-level gated (up to P-12 at TL-J) so an Antimatter Plant (which needs P-10+) is reachable
- **Antimatter Plants**: Cut maneuver fuel requirements to 1/10th once installed
- **Zone Sections**: Residential, commercial, industrial, farm, park, and other 1,000-ton zone types
- **Weapons & Defenses**: Turrets, bay weapons, armor, and defensive screens (Nuclear Damper, Meson Screen, Black Globe)
- **Real-time Mass & Cost Tracking**: Live calculations with overweight warnings
- **Component Library**: Extensive selection of vehicles, drones, cargo bays, and Rec/Health facilities, plus a Custom panel for anything not in the predefined lists
- **Staff Requirements**: Auto-calculated crew — 8 pilots for round-the-clock coverage on an underway (M-1+) structure, 1 for a stationary one; navigators only for an Atmosphere Support (floating city) structure
- **Database Persistence**: Save and load designs using IndexedDB

## System Requirements

- **Node.js** 24+ (LTS)
- **pnpm** 11+ package manager

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/DavidLDawes/aid.git
cd aid
git checkout megastructure
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start the Development Server

```bash
pnpm dev
```

IndexedDB is auto-initialized on first run with a "Ring World Alpha" seed ship from `public/initial-ships.json`.

## Design Process

1. **Megastructure Panel**: Name, Tech Level (A–H, J), Tonnage, optional Atmosphere Support (adds 4 navigators), optional description
2. **Engines Panel**: Power Plant (required) and Maneuver Drive (optional, defaults to M-0) — no Jump Drive
3. **Fittings Panel**: Control Center (auto-calculated from tonnage), Launch Tubes, Comms & Sensors, Computer
4. **Weapons Panel**: Turrets, barbettes, hard points, and bay weapons
5. **Defenses Panel**: Point defense/sandcaster turrets, armor, and defensive screens
6. **Rec/Health Panel**: Commissary (required), medical, recreational, and utility facilities
7. **Cargo Panel**: Multiple cargo bay types
8. **Vehicles Panel**: Ground vehicles and aircraft, tech-level gated
9. **Drones Panel**: Combat, repair, and sensor drones
10. **Custom Panel**: Any component not in the predefined lists (name, mass, cost)
11. **Fuel Panel**: Fuel scoops, processors, tanks, and Antimatter Plant (requires a P-10+ power plant)
12. **Sections Panel**: Zone sections — residential, commercial, industrial, farm, park, etc.
13. **Berths Panel**: Crew and passenger accommodations
14. **Staff Panel**: Auto-calculated crew requirements
15. **Design Summary Panel**: Final summary, CSV export, print-friendly view

### Mass Tracking

The **Mass Sidebar** (visible from Engines panel onward) shows total, used, and remaining tonnage with an overweight warning when the design exceeds limits.

## Project Structure

```
aid/
├── public/
│   ├── index.html
│   └── initial-ships.json       # Default ships loaded on first run
├── src/
│   ├── components/
│   │   ├── SelectShipPanel.tsx  # Ship selection screen
│   │   ├── ShipPanel.tsx        # Panel 0 — basic info
│   │   ├── EnginesPanel.tsx     # Panel 1 — power plant / maneuver drive
│   │   ├── FittingsPanel.tsx    # Panel 2 — control center, sensors, computer
│   │   ├── WeaponsPanel.tsx     # Panel 3 — weapons
│   │   ├── DefensesPanel.tsx    # Panel 4 — defenses, armor, screens
│   │   ├── FacilitiesPanel.tsx  # Panel 5 — Rec/Health
│   │   ├── CargoPanel.tsx       # Panel 6 — cargo
│   │   ├── VehiclesPanel.tsx    # Panel 7 — vehicles
│   │   ├── DronesPanel.tsx      # Panel 8 — drones
│   │   ├── CustomPanel.tsx      # Panel 9 — custom items
│   │   ├── FuelPanel.tsx        # Panel 10 — fuel systems, Antimatter Plant
│   │   ├── SectionsPanel.tsx    # Panel 11 — zone sections
│   │   ├── BerthsPanel.tsx      # Panel 12 — berths
│   │   ├── StaffPanel.tsx       # Panel 13 — crew requirements
│   │   ├── SummaryPanel.tsx     # Panel 14 — design summary
│   │   ├── MassSidebar.tsx      # Real-time mass/cost tracker
│   │   ├── FileMenu.tsx         # Save/Load/Print menu
│   │   └── RulesMenu.tsx        # Rules variants menu
│   ├── data/
│   │   └── constants.ts         # Tech levels, engines, weapons, megastructure formulas
│   ├── services/
│   │   ├── database.ts          # IndexedDB wrapper (object store `mega_ships`)
│   │   └── initialDataService.ts
│   ├── types/
│   │   └── ship.ts              # TypeScript interfaces
│   ├── utils/
│   │   ├── calculations.ts      # Mass/cost aggregation helpers
│   │   ├── crewCalculations.ts  # Pilot/navigator crew formulas
│   │   ├── csv.ts               # CSV field escaping
│   │   ├── printContent.ts      # Shared print HTML generator
│   │   ├── shipDefaults.ts      # Ship initialization helpers
│   │   ├── sparesCalculation.ts # Spares/service-interval helpers
│   │   ├── techLevelCleanup.ts  # Drops components made ineligible by a TL drop
│   │   └── tonnageRescale.ts    # Rescales engines/fittings on tonnage change
│   ├── test/                    # Test utilities
│   ├── App.tsx                  # Main app component
│   ├── App.css                  # Global styles
│   └── main.tsx                 # React entry point
├── dist/                        # Production build (generated)
├── package.json
├── vite.config.js               # Vite configuration
├── wrangler.jsonc                # Cloudflare Worker deployment config
├── tsconfig.json
├── jest.config.cjs
├── CLAUDE.md
└── README.md
```

## Development Commands

```bash
pnpm install         # Install dependencies
pnpm dev             # Development server on port 5173
pnpm build           # Build for production (tsc -b + vite build)
pnpm serve           # Build then preview (port 4173)
pnpm preview         # Preview an existing production build
pnpm lint            # Lint source files
pnpm test:run        # Run tests once (CI)
pnpm test            # Run tests in watch mode
pnpm test:ui         # Run tests with UI

# Database management
pnpm extractDB       # Export ships from IndexedDB to JSON files
pnpm preloadDB       # Import ships from JSON files to IndexedDB
pnpm flushDB         # Clear all ships from IndexedDB
pnpm setInitialDB    # Reset DB to initial state
```

## Engine Performance Data

This application uses engine performance ratings from the Traveller SRD Spacecraft Design rules:
https://www.traveller-srd.com/core-rules/spacecraft-design/

Power plant and maneuver drive performance tables are implemented in `src/data/constants.ts` as `ENGINE_PERFORMANCE_PERCENTAGES`. Megastructures have no jump drive, so power plant performance is instead gated directly by tech level (`getMaxPowerPlantByTechLevel`), extended past the SRD's normal P-6 cap so a P-10+ Antimatter Plant is reachable at TL-H+.

## Technology Stack

- **React 19** with TypeScript
- **Vite** for the dev server and production build
- **Jest** for testing
- **IndexedDB** for browser-local persistence
- **Node.js 24+ (LTS)**
- **pnpm 11+**

## Deployment

Production deploys as a Cloudflare Worker (`wrangler deploy`) serving the Vite `dist/` build under `/MegaDesign` at `srd-tools.com` — the same origin as the sibling Starship (`/ShipDesign`) and Capital Ship (`/CapitalShipDesign`) designers. There is no Docker deployment path.

## Troubleshooting

1. **Port Already in Use**: The dev server defaults to port 5173 (Vite); change it with `pnpm dev -- --port <port>`
2. **Module Not Found**: Run `pnpm install`; clear cache with `pnpm store prune`
3. **Database Issues**: Browser DevTools → Application → IndexedDB → StarshipDesignerDB → `mega_ships` object store

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `pnpm test:run` to verify all tests pass
4. Submit a pull request

## License

This project is part of the aid repository and follows the same licensing terms.
