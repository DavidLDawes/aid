# Traveler Starship Designer
New attempt at a Starship Designer, built with Claude. Using a Wizard UI and local storage for the DB.
## Quick Start
npm install
npm run dev
## Docker Quick Start
**Build Command**:
```bash
docker build -t starship-designer .
```

**Run Command**:
```bash
docker run -p 8080:8080 starship-designer
```
## Traveler SRD Ships
Got it roughly working, output is a table in a web page, or a CSV, or print the table.

**TODO List**
* Distinguish Commercial vs. Military designs. Commercial->Lasers, Sandcasters * PD only, no Shields or Armor either.
* Add overhead for vehicles: bays (5%) & service bays (15%), user selectable.
* Add a ton of free space for every 10 staterooms available for Rec & Health purposes.
**TODO List - non Starships SRD**
* Add a "Non-standard Features" tab where you can select the following non-canonical changes:
* Add AntiMatter at TL-H, 1% of ship tons per Jump (J-2 = 2% etc.)
* Add discounts for higher tech levels on engines
* At higher TL (G+) robots can serve as Engineers & Service crew, with 1-1 human-bot ratio at TL G, 2-1 at H, etc.
* At TL-F and higher, powerful batteries allow for external power for Jumps, with the ship decoupling and moving under normal power in the last couple minutes before Jump (to get separation) using the batteries to provide the last bit of power. As a result, no Jump fuel is needed, or covnersely the normal Jump fuel load (being unspent) is now available for a return trip without needing to refuel.
* Implement the advanced/expensive TL upgrades (Accuracy, EZ Repair, High Yield, etc.)
* Traveler SRD Capital Ships

## 🚀 Features

- **Multi-Panel Design Interface**: 12 specialized panels for complete starship configuration
- **Real-time Mass & Cost Tracking**: Live calculations with overweight warnings
- **Component Library**: Extensive selection of engines, weapons, defenses, and facilities
- **Staff Requirements**: Auto-calculated crew requirements based on ship configuration
- **Database Persistence**: Save and load ship designs into local storage
- **Responsive Design**: Works seamlessly on desktop and mobile devices - maybe

## 📋 System Requirements

- **Node.js** (v16 or higher)
- **npm** package manager

## 🛠️ Installation & Setup
Requires node, 
### 1. Clone the Repository

```bash
git clone https://github.com/DavidLDawes/aid.git
cd aid
```

### 2. Database Setup

1. **DB is auto-initialized the first time it is run**
Check out the npm run commands for DB manipulation scripts to flush, load and unload the DB.
### 3. Frontend Setup

```bash

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend application will be available at `http://localhost:5173`

## 🎮 Usage

### Design Process

1. **Ship Panel**: Configure basic ship information
   - Name (max 32 characters)
   - Tech Level (A-H)
   - Tonnage (minimum 100 tons)
   - Optional description

2. **Engines Panel**: Configure propulsion systems
   - Power Plant (Performance 1-10)
   - Maneuver Drive (Performance 1-10)
   - Jump Drive (Performance 1-10)

3. **Fittings Panel**: Essential ship components
   - Bridge or Half Bridge (required)
   - Optional Launch Tubes

4. **Weapons Panel**: Offensive systems
   - 15 different weapon types
   - Mount limits based on ship tonnage

5. **Defenses Panel**: Protective systems
   - Armor plating
   - Point Defense systems
   - Electronic countermeasures

6. **Berths Panel**: Crew accommodations
   - Various berth types for crew and passengers

7. **Rec/Health Panel**: Life support facilities
   - Commissary (required)
   - Medical, recreational, and utility facilities

8. **Cargo Panel**: Storage systems
   - Multiple cargo bay types with different costs

9. **Vehicles Panel**: Carried craft
   - Shuttles, fighters, and utility vehicles

10. **Drones Panel**: Automated systems
    - Combat, repair, and sensor drones

11. **Custom Panel**: User Defined
    - Name, tons and cost per item entered by user

12. **Staff Panel**: Crew requirements
    - Auto-calculated based on ship systems

13. **Ship Design Panel**: Final summary
    - Complete design overview
    - Save/Load functionality

### Mass Tracking

The **Mass Sidebar** (visible from Engines panel onward) shows:
- **Total**: Ship's maximum tonnage
- **Used**: Currently allocated mass
- **Remaining**: Available mass for components
- **Overweight Warning**: Alerts when design exceeds limits

## 🏗️ Project Structure

```
aid/
├── backend/                 # Node.js/Express API server
│   ├── server.ts           # Main server application
│   ├── schema.sql          # MySQL database schema
│   ├── package.json        # Backend dependencies
│   └── .env                # Environment configuration
├── starship-designer/      # React frontend application
│   ├── src/
│   │   ├── components/     # React components for each panel
│   │   ├── types/          # TypeScript type definitions
│   │   ├── data/           # Constants and data structures
│   │   └── App.tsx         # Main application component
│   └── package.json        # Frontend dependencies
└── README.md               # This file
```

# Engine Performance Data

This application uses engine performance ratings based on the Traveller SRD Spaceship Design rules. The official engine performance table can be found at: https://www.traveller-srd.com/core-rules/spacecraft-design/

The table shows drive performance ratings by drive letter (A-Z) across different hull tonnages (100-2000 tons). This data is implemented in `src/data/constants.ts` as the `ENGINE_DRIVES` object and is used to determine which engine drives are compatible with specific hull sizes and power plant configurations.

For reference and historical documentation, the complete performance table used by this application is preserved in `src/claude/bug/maneuver-broken.MD`.

# DB
Using innodb-like fake-indexeddb to handle indexing for shop names being exclusive, result is there's not really any SQL, just local files, which is actually kinda cool.

On startup if there are no Ships defined in the DB then the contents of public/initial-ships.json are read into the DB.

Adddedd a few npm scripts to twiddle with the DB:
* npm run extractDB - copies ships from the DB to file(s)
* npm run preloadDB - loads file(s) into Ships DB
* npm run flushDB - removes all ships from the DB

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## 🧪 Development

### Frontend Development

```bash
cd starship-designer
npm run dev    # Start Vite development server
npm run build  # Build for production
npm run preview # Preview production build
```

## 🔧 API Endpoints

- `GET /api/ships` - List all saved ships
- `GET /api/ships/:id` - Get specific ship design
- `POST /api/ships` - Save new ship design
- `DELETE /api/ships/:id` - Delete ship design

## 🎨 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **CSS3** with responsive design
- **Modern ES6+** JavaScript features

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Backend: Change `PORT` in `backend/.env`
   - Frontend: Vite will automatically suggest alternate port

2. **Module Not Found Errors**
   - Run `npm install` in both directories
   - Clear npm cache: `npm cache clean --force`

3. **CORS Errors**
   - Ensure backend server is running
   - Check API URL in frontend requests

## 📝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is part of the aid repository and follows the same licensing terms.

## 🙏 Acknowledgments

Built with modern web technologies and designed for extensibility and maintainability.
