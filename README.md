# Traveller Starship Designer

New attempt at a Starship Designer, built with Claude. Using a Wizard UI and IndexedDB for local persistence.

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

## Traveller SRD Ships

Got it roughly working — output is a table in a web page, a CSV, or a print view.

**TODO List**
* Defenses: Add Stealth, Reflec, Ablative, Explosive options
* Defenses: Add Security
* Distinguish Commercial vs. Military designs. Commercial → Lasers, Sandcasters & PD only, no Shields or Armor.
* Add overhead for vehicles: bays (5%) & service bays (15%), user selectable.
* Add a ton of free space for every 10 staterooms available for Rec & Health purposes.

**TODO List - non Starships SRD**
* Add a "Non-standard Features" tab where you can select the following non-canonical changes:
* Add AntiMatter at TL-H, 1% of ship tons per Jump (J-2 = 2% etc.)
* Add discounts for higher tech levels on engines
* At higher TL (G+) robots can serve as Engineers & Service crew, with 1-1 human-bot ratio at TL G, 2-1 at H, etc.
* At TL-F and higher, powerful batteries allow for external power for Jumps, with the ship decoupling and moving under normal power in the last couple of minutes before Jump (to get separation) using the batteries to provide the last bit of power. As a result, no Jump fuel is needed, or conversely the normal Jump fuel load (being unspent) is now available for a return trip without needing to refuel.
* Implement the advanced/expensive TL upgrades (Accuracy, EZ Repair, High Yield, etc.)
* Traveller SRD Capital Ships

## Features

- **Multi-Panel Design Interface**: 12 specialized panels for complete starship configuration
- **Real-time Mass & Cost Tracking**: Live calculations with overweight warnings
- **Component Library**: Extensive selection of engines, weapons, defenses, and facilities
- **Staff Requirements**: Auto-calculated crew requirements based on ship configuration
- **Database Persistence**: Save and load ship designs using browser-local IndexedDB
- **Non-Standard Rules**: Optional rule variants including antimatter drives

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

1. **Ship Panel**: Name, Tech Level (A–H), Tonnage (100–2000 tons), Configuration, optional description
2. **Engines Panel**: Power Plant, Maneuver Drive, Jump Drive
3. **Fittings Panel**: Bridge or Half Bridge (required), Launch Tubes, Sensors
4. **Weapons Panel**: Turrets and barbettes; mount limits based on tonnage
5. **Defenses Panel**: Sandcaster and point-defense turrets, armor plating
6. **Rec/Health Panel**: Commissary (required), medical, recreational, and utility facilities
7. **Cargo Panel**: Multiple cargo bay types
8. **Vehicles Panel**: Shuttles, fighters, and utility vehicles
9. **Drones Panel**: Combat, repair, and sensor drones
10. **Berths Panel**: Crew and passenger accommodations
11. **Staff Panel**: Auto-calculated crew requirements
12. **Ship Design Panel**: Final summary, CSV export, print view

### Mass Tracking

The **Mass Sidebar** (visible from Engines panel onward) shows total, used, and remaining tonnage with an overweight warning when the design exceeds limits.

## Project Structure

```
aid/
├── public/
│   ├── index.html
│   └── initial-ships.json      # Default ships loaded on first run
├── src/
│   ├── components/
│   │   ├── SelectShipPanel.tsx # Ship selection screen
│   │   ├── ShipPanel.tsx       # Panel 0 — basic ship info
│   │   ├── EnginesPanel.tsx    # Panel 1 — engines
│   │   ├── FittingsPanel.tsx   # Panel 2 — fittings
│   │   ├── WeaponsPanel.tsx    # Panel 3 — weapons
│   │   ├── DefensesPanel.tsx   # Panel 4 — defenses
│   │   ├── FacilitiesPanel.tsx # Panel 5 — Rec/Health
│   │   ├── CargoPanel.tsx      # Panel 6 — cargo
│   │   ├── VehiclesPanel.tsx   # Panel 7 — vehicles
│   │   ├── DronesPanel.tsx     # Panel 8 — drones
│   │   ├── BerthsPanel.tsx     # Panel 9 — berths
│   │   ├── StaffPanel.tsx      # Panel 10 — crew requirements
│   │   ├── SummaryPanel.tsx    # Panel 11 — ship summary
│   │   ├── MassSidebar.tsx     # Real-time mass/cost tracker
│   │   ├── FileMenu.tsx        # Save/Load/Print menu
│   │   └── RulesMenu.tsx       # Rules variants menu
│   ├── data/
│   │   └── constants.ts        # Tech levels, engines, weapons, etc.
│   ├── services/
│   │   ├── database.ts         # IndexedDB wrapper
│   │   └── initialDataService.ts
│   ├── types/
│   │   └── ship.ts             # TypeScript interfaces
│   ├── utils/
│   │   └── sparesCalculation.ts
│   ├── test/                   # Test utilities
│   ├── App.tsx                 # Main app component
│   ├── App.css                 # Global styles
│   └── main.tsx                # React entry point
├── dist/                       # Production build (generated)
├── package.json
├── webpack.config.cjs          # Webpack configuration
├── tsconfig.json
├── tsconfig.app.json
├── jest.config.cjs
├── Dockerfile
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

## Database

Uses IndexedDB for browser-local persistence — no backend server required.

On startup, if no ships are in the DB, the contents of `public/initial-ships.json` are loaded automatically.

```bash
npm run extractDB    # copies ships from the DB to JSON files
npm run preloadDB    # loads JSON files into the ships DB
npm run flushDB      # removes all ships from the DB
```

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
