# CSS Consolidation Strategy - Phase 4

## Overview
Eliminate duplication and maximize reuse of component base classes across the codebase.

## Components to Refactor

### 1. ReservationModal.css (433 lines → 200 lines target)
**Current Redundancy:**
- Modal header/content wrappers (can use `.modal-header`, `.modal-box`, `.modal-body`)
- Form grids already in utilities.css
- Button groups (use `.action-group`)
- Alert styling (use `.alert`)

**Refactoring Plan:**
- Remove `.reservation-modal-content` → use `.modal-box` + custom padding
- Consolidate `.confirm-dialog-content` → use `.modal-box`
- Use `.action-group` for button containers
- Use `.alert` for error messages
- Keep only component-specific styling (colors, breakdown display)

**Expected Reduction:** ~200 lines

### 2. MinibarPanel.css (365 lines → 180 lines target)
**Current Redundancy:**
- Table styling (can use `.table`, `.table__row`, `.table__cell`)
- Section headers (can use `.section__title`)
- List items (partially - can use `.list__item`)
- Button groups (use `.action-group`)

**Refactoring Plan:**
- Replace `.minibar-history-table*` with `.table` + mixin
- Use `.section` for history sections
- Use `.action-group` for button groups
- Keep only minibar-specific grid and consumption styling

**Expected Reduction:** ~185 lines

### 3. CalendarGrid.css (456 lines - mostly specific to calendar)
**Analysis:**
- Calendar-specific (table layout, sticky positioning)
- Not much duplication potential
- Keep as-is

### 4. PeriodPicker.css (20 lines - already minimal)
**Analysis:**
- Very specific component
- Could use `.form-control__input` for input styling
- Consolidate to 10 lines

**Refactoring Plan:**
- Import input styles from `.form-control__input`
- Reduce custom styling

**Expected Reduction:** ~10 lines

### 5. Other Component CSS Files
- EditBlockModal.css (likely minimal)
- Shared components (Modal, FormField)

## Total Consolidation Target
- **Before:** ~1,400 lines in components
- **After:** ~900 lines (36% reduction)
- **Method:** Maximize use of components-base.css patterns

## Implementation Phases

### Phase 4A: Optimize ReservationModal.css
1. Consolidate modal structure to use base classes
2. Keep confirmation dialog and guarantee button styling
3. Keep price breakdown display styling
4. Reduce from 433 → 200 lines

### Phase 4B: Optimize MinibarPanel.css
1. Replace table styling with `.table` classes
2. Use `.section` for sections
3. Keep consumption-specific styling
4. Reduce from 365 → 180 lines

### Phase 4C: Optimize Remaining Components
1. PeriodPicker: 20 → 10 lines
2. EditBlockModal: Minimal changes

### Phase 4D: Create Component Documentation
1. Document which base classes each component uses
2. Create examples of composition patterns
3. Update README with guidelines

## CSS Inheritance Hierarchy

```
base.css (variables)
  ↓
utilities.css (utility classes)
  ↓
themes.css (theme overrides)
  ↓
components-base.css (component patterns) ← NEW LAYER
  ↓
Component-specific CSS (ReservationModal.css, etc.)
```

## Expected Outcomes

1. **Code Reduction:** 1,400 → 900 lines (36% smaller)
2. **Maintainability:** Single source of truth for common patterns
3. **Consistency:** All modals, tables, forms look consistent
4. **Flexibility:** Components can still customize as needed
5. **Performance:** Smaller CSS file, better caching

## Success Metrics

- [ ] All components still render correctly
- [ ] No visual regressions
- [ ] CSS file size reduced
- [ ] Build completes without errors
- [ ] All tests pass
- [ ] Components fully documented

---

**Next Step:** Execute Phase 4A - Optimize ReservationModal.css
