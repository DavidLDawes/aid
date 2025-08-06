# Traveller Starship Designer
New atttempt at a Starship Designer, build with Claude. Used a Wizard UI, plan on doing:
## Traveller SRD Ships
Mostly in, missing vehicle storage overhead 5%, or 15% overhead for a vehicle repair bay
Output is a table in a web page, or a CSV, or an attempt to print the table
* Traveller SRD Capital Ships - TODO

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
