# Traveller Starship Designer
New atttempt at a Starship Designer, build with Claude. Used a Wizard UI, plan on doing:
## Traveller SRD Ships
Mostly in, missing vehicle storage overhead 5%, or 15% overhead for a vehicle repair bay
Output is a table in a web page, or a CSV, or print the table

**TODO List**
* Defenses: Add Nucelar Shields & Meson Shields
* Defenses: Add Armor
* Defenses: Add Stealth, Reflec, Ablative, Explosoive options
* Defenses: Add Security
* Distinguish Commercial vs. Military designs. Commercial->Lasers, Sandcasters * PD only, no Shields or Armor either.
* Add overhead for vehicles: bays (5%) & service bays (15%), user selectable.
* Add a ton of free space for every 10 staterooms available for Rec & Health purposes.
The above Defensive options are all appropriate for military ships, not commercial.
**TODO List - non Starships SRD**
* Add a "Non-standard Features" tab where you can select the following non-canonical changes:
* Add AntiMatter at TL-H, 1% of ship tons per Jump (J-2 = 2% etc.)
* Add discounts for higher tech levels on engines
* At higher TL (G+) robots can serve as Engineers & Service crew, with 1-1 human-bot ratio at TL G, 2-1 at H, etc.
* At TL-F and higher, powerful batteries allow for external power for Jumps, with the ship decoupling and moving under normal power in the last couple minutes before Jump (to get separation) using the batteris to provide the last bit of power. As a result, no Jump fuel is needed, or covnersely the normal Jump fuel load (being unspent) is now available for a return trip without needing to refuel.
* Implement the advanced/expensive TL uprades (Accurecy, EZ Repair, High Yield, etc.)
* Traveller SRD Capital Ships

# Engine Performance Data

This application uses engine performance ratings based on the Traveller SRD Spaceship Design rules. The official engine performance table can be found at: https://www.traveller-srd.com/core-rules/spacecraft-design/

The table shows drive performance ratings by drive letter (A-Z) across different hull tonnages (100-2000 tons). This data is implemented in `src/data/constants.ts` as the `ENGINE_DRIVES` object and is used to determine which engine drives are compatible with specific hull sizes and power plant configurations.

For reference and historical documentation, the complete performance table used by this application is preserved in `src/claude/bug/maneuver-broken.MD`.

# DB
Using innodb-like fake-indexeddb to handle indexing for shop names being exclusive, result is there's not really any SQL, just local files, which is actually kinda cool.

On startup if there are no Ships defined in the DB then the contents of publicinitial-ships.json are read into the DB.

Adddedd a few npm scripts to twiddle with the DB:
* npm run extractDB - copies ships from the DB to file(s)
* npm run preloadDB - loads file(s) into Ships DB
* npm run flushDB - removes all ships from the DB

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

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
