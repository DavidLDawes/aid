#claude instructions

For main branch (Starships) for 100 ton ships:
1. A single vehicle may be added without requiring a service crew, the second and later vehicles require service crew.
2. Add an additional checkbox: No engineer - for 100 ton ships engineers can be skipped, in effect the pilot will have to handle the engineering.
3. A single pilot in a 100 ton ship does not need a Steward

All the above combined allows single-ship-operator pilots for 100 ton ships if all boxes are checked. Scouts.

# claude logs

## 2026-08-14 - Initial Implementation

Implemented all three crew-reduction options for 100 ton ships on the `feature/single-operator-100t` branch.

### 1. Single vehicle exempt from service crew (100 ton ships)
- `calculateVehicleServiceStaff()` in `src/data/constants.ts` now takes an optional `shipTonnage` parameter. On a 100 ton ship, exactly one vehicle unit (the first encountered, in array order) is exempt from its service-staff requirement; any further units (same type or a different type) are billed normally.
- `App.tsx` passes `shipDesign.ship.tonnage` into the call used for `calculateStaffRequirements()`'s `service` total.
- `VehiclesPanel.tsx` now receives a `shipTonnage` prop (passed from `App.tsx`) and applies the same exemption to both its running total and its per-row "Service Staff" column, so the panel display matches the crew calculation.

### 2. "No Engineer" checkbox (100 ton ships only)
- Added `noEngineer` state in `App.tsx`, following the same pattern as the existing `combinePilotNavigator`/`noStewards` small-ship options.
- `StaffPanel.tsx` shows a "No Engineer (pilot handles engineering)" checkbox, gated to `shipTonnage === 100` specifically (not 200 — a 200 ton ship always needs 2 engineers, so the option doesn't apply there). Checking it zeroes the Engineers line and subtracts the engineer count from the displayed total.
- `App.tsx`'s `calculateAdjustedCrewCount()` (used to size minimum staterooms on the Berths panel), `SummaryPanel.tsx`, and `printContent.ts` (the print/PDF view) were all updated to apply the same adjustment, gated the same way (100 tons only).
- Simplified the adjustment math in all four places (`StaffPanel`, `SummaryPanel`, `printContent`, `App.calculateAdjustedCrewCount`) from nested ternaries (which only scaled to 2 flags) to a straight sequence of conditional subtractions, since there are now three independent flags (combine / no stewards / no engineer) that can all apply at once.

### 3. Single pilot doesn't need a Steward
- This was already covered by the existing "No Stewards" checkbox (from the `crew-small-ships` feature), which is available on 100 ton ships whenever there are no passenger staterooms beyond what the crew needs. No code change was required; confirmed via the existing and new tests that it composes correctly with the other two new options.

### Combined effect
With Combine Pilot/Navigator + No Stewards + No Engineer all checked on a 100 ton ship with a single vehicle, total crew drops to 1 (the pilot), matching the single-operator Scout use case described in the instructions.

### Testing
- Extended `src/services/serviceStaff.test.ts` with a `100 ton ship single-vehicle exemption` block covering: single vehicle exempt, second unit of the same type billable, second vehicle of a different type billable, and no exemption on non-100-ton ships.
- Extended `src/services/crewAdjustments.test.ts`'s local copy of the `calculateAdjustedCrewCount` logic with a `noEngineer` parameter and a matching test block (100 tons reduces, 200/400 tons ignore it, combines with the other two flags).
- Extended `src/components/StaffPanel.test.tsx` with tests for checkbox visibility (100 tons only, hidden at 200/400), the change handler, the Engineers display, and the combined single-operator scenario.
- Extended `src/utils/printContent.test.ts` with a 100-ton ship fixture and tests for the Engineers row/crew total in the print view, including the combined all-three-flags scenario.
- Full suite: 403/403 tests passing. `pnpm build` (tsc -b + vite build) succeeds.

### Files Modified
- `src/data/constants.ts` — `calculateVehicleServiceStaff()` exemption logic
- `src/App.tsx` — `noEngineer` state, wiring, `calculateAdjustedCrewCount()` update
- `src/components/VehiclesPanel.tsx` — `shipTonnage` prop, exemption applied to totals/rows
- `src/components/StaffPanel.tsx` — "No Engineer" checkbox and display/total adjustments
- `src/components/SummaryPanel.tsx` — Engineers row/total adjustments
- `src/utils/printContent.ts` — Engineers row/total adjustments in the print view
- `src/services/serviceStaff.test.ts`, `src/services/crewAdjustments.test.ts`, `src/components/StaffPanel.test.tsx`, `src/utils/printContent.test.ts` — new/updated tests

