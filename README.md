# Traveller Starship Designer

A Starship Designer for the Traveller RPG, built with Claude. Uses a Wizard UI and IndexedDB for browser-local persistence — no backend server required.

## Quick Start

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:8080`.

## Docker Quick Start

**Build:**
```bash
docker build -t starship-designer .
```

**Run:**
```bash
docker run -p 8080:8080 starship-designer
```

## Features

- **Multi-Panel Design Interface**: 13 specialized panels for complete starship configuration
- **Capital Ship Support**: Designs from 100 tons to 1,000,000 tons
  - Hull codes (CA–CZ) and hull sections (2–6) for ships ≥3,000 tons
  - Spinal weapons, bay weapons, and defensive screens
  - Armor percentage and tech-level-gated computer requirements
- **Real-time Mass & Cost Tracking**: Live calculations with overweight warnings
- **Component Library**: Extensive selection of engines, weapons, defenses, and facilities
- **Staff Requirements**: Auto-calculated crew based on ship systems
- **Database Persistence**: Save and load ship designs using IndexedDB
- **Non-Standard Rules**: Optional rule variants (antimatter drives, etc.)

## System Requirements

- **Node.js** 22.x
- **npm** package manager

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/DavidLDawes/aid.git
cd aid
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

IndexedDB is auto-initialized on first run with ships from `public/initial-ships.json`.

## Design Process

1. **Ship Panel**: Name, Tech Level (A–H), Tonnage, Configuration, optional description
2. **Engines Panel**: Power Plant, Maneuver Drive, Jump Drive
3. **Fittings Panel**: Bridge or Half Bridge (required), Launch Tubes, Sensors, etc.
4. **Weapons Panel**: Turrets, barbettes, bay weapons, and spinal weapons (capital ships)
5. **Defenses Panel**: Armor, Point Defense, Screens (Nuclear Damper, Meson Screen, Black Globe)
6. **Rec/Health Panel**: Commissary (required), Medical, recreational, and utility facilities
7. **Cargo Panel**: Multiple cargo bay types
8. **Vehicles Panel**: Shuttles, fighters, and utility vehicles
9. **Drones Panel**: Combat, repair, and sensor drones
10. **Custom Panel**: Any component not in the predefined lists (name, tonnage, cost)
11. **Berths Panel**: Crew and passenger accommodations
12. **Staff Panel**: Auto-calculated crew requirements
13. **Ship Design Panel**: Final summary, CSV export, print-friendly view

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
│   │   ├── ShipPanel.tsx        # Panel 0 — basic ship info
│   │   ├── EnginesPanel.tsx     # Panel 1 — engines
│   │   ├── FittingsPanel.tsx    # Panel 2 — fittings
│   │   ├── WeaponsPanel.tsx     # Panel 3 — weapons
│   │   ├── DefensesPanel.tsx    # Panel 4 — defenses
│   │   ├── FacilitiesPanel.tsx  # Panel 5 — Rec/Health
│   │   ├── CargoPanel.tsx       # Panel 6 — cargo
│   │   ├── VehiclesPanel.tsx    # Panel 7 — vehicles
│   │   ├── DronesPanel.tsx      # Panel 8 — drones
│   │   ├── CustomPanel.tsx      # Panel 9 — custom items
│   │   ├── BerthsPanel.tsx      # Panel 10 — berths
│   │   ├── StaffPanel.tsx       # Panel 11 — crew requirements
│   │   ├── SummaryPanel.tsx     # Panel 12 — ship summary
│   │   ├── MassSidebar.tsx      # Real-time mass/cost tracker
│   │   ├── FileMenu.tsx         # Save/Load/Print menu
│   │   └── RulesMenu.tsx        # Rules variants menu
│   ├── data/
│   │   └── constants.ts         # Tech levels, engines, weapons, etc.
│   ├── services/
│   │   ├── database.ts          # IndexedDB wrapper
│   │   └── initialDataService.ts
│   ├── types/
│   │   └── ship.ts              # TypeScript interfaces
│   ├── utils/
│   │   ├── calculations.ts      # Mass/cost aggregation helpers
│   │   ├── printContent.ts      # Shared print HTML generator
│   │   └── shipDefaults.ts      # Ship initialization helpers
│   ├── test/                    # Test utilities
│   ├── App.tsx                  # Main app component
│   ├── App.css                  # Global styles
│   └── main.tsx                 # React entry point
├── dist/                        # Production build (generated)
├── package.json
├── webpack.config.cjs           # Webpack configuration
├── tsconfig.json
├── jest.config.cjs
├── Dockerfile
├── CLAUDE.md
└── README.md
```

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Development server on port 8080
npm run build        # Build for production
npm preview          # Preview production build
npm run lint         # Lint source files
npm run test:run     # Run tests once (CI)
npm test             # Run tests in watch mode

# Database management
npm run extractDB    # Export ships from IndexedDB to JSON files
npm run preloadDB    # Import ships from JSON files to IndexedDB
npm run flushDB      # Clear all ships from IndexedDB
npm run setInitialDB # Reset DB to initial state
```

## Engine Performance Data

This application uses engine performance ratings from the Traveller SRD Spacecraft Design rules:
https://www.traveller-srd.com/core-rules/spacecraft-design/

Drive performance by drive letter (A–Z) across hull tonnages is implemented in `src/data/constants.ts` as the `ENGINE_DRIVES` object.

## Technology Stack

- **React 19** with TypeScript
- **Webpack 5** with webpack-dev-server
- **Jest** for testing
- **IndexedDB** for browser-local persistence
- **Node.js 22.x**

## Troubleshooting

1. **Port Already in Use**: Port 8080 is configured in `webpack.config.cjs`
2. **Module Not Found**: Run `npm install`; clear cache with `npm cache clean --force`
3. **Database Issues**: Browser DevTools → Application → IndexedDB → StarshipDesignerDB

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run test:run` to verify all tests pass
4. Submit a pull request

## License

This project is part of the aid repository and follows the same licensing terms.
