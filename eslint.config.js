import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  // src/**/*.js mirrors the .gitignore entry: tsc -b (part of `pnpm build`)
  // compiles .tsx/.ts output directly into src/ alongside the sources, since
  // this project has no separate outDir. Those files aren't source and
  // shouldn't be linted — they can carry stale rule-disable comments that
  // reference rules not configured for plain .js, which errors as an
  // "unknown rule" rather than being silently ignored.
  globalIgnores(['dist', 'coverage', 'src/**/*.js']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
      }],
    },
  },
])
