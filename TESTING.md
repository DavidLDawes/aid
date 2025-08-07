# Testing

This project uses [Vitest](https://vitest.dev/) for testing.

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui
```

## Test Structure

Tests are located alongside their source files with the `.test.ts` extension.

### Spares Calculation Tests

The `src/utils/sparesCalculation.test.ts` file contains comprehensive tests for the ship maintenance spares calculation logic:

- **calculateMonthsBetweenService**: Tests the calculation of maintenance intervals based on spares percentage
- **getSparesIncrement**: Tests the tonnage increment logic for spares
- **getSparesPercentage**: Tests percentage calculations
- **Integration tests**: Ensures consistency between related functions

## Test Coverage

The spares calculation logic is fully tested with edge cases including:
- Zero spares (minimum 1 month service interval)
- Fractional percentages (proper rounding)
- Different ship sizes
- Increment consistency
- Large percentages

## Build Integration

Tests are automatically run as part of the build process. The build will fail if any tests fail.