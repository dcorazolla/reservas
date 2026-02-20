# Phase 4C: Padding Conversion Strategy

## Goal
Convert hardcoded padding values to design tokens (var(--spacing-*))

## Mapping Hardcoded → Tokens

| Hardcoded | Spacing Var | Files Affected | Count |
|-----------|-------------|-----------------|-------|
| `padding: 0` | Remove or use 0 | base.css, forms.css, components-base.css, data-list.css | 7 |
| `padding: 4px 8px` | `--spacing-sm` / `--spacing-xs` | components-base.css, MinibarPanel.css, PeriodPicker.css | 3 |
| `padding: 6px` | `--spacing-xs` | header.css, PeriodPicker.css | 2 |
| `padding: 6px 8px` | `--spacing-xs` `--spacing-sm` | PeriodPicker.css, MinibarPanel.css | 2 |
| `padding: 6px 10px` | `--spacing-sm` | forms.css | 1 |
| `padding: 8px` | `--spacing-sm` | forms.css, MinibarPanel.css, modal.css, data-list.css | 4 |
| `padding: 8px 12px` | `--spacing-sm` | forms.css | 1 |
| `padding: 10px` | `--spacing-md` (or new `--spacing-sm-md`) | forms.css | 2 |
| `padding: 12px` | `--spacing-md` | modal.css, MinibarPanel.css | 2 |
| `padding: 12px 16px` | `--spacing-md` `--spacing-lg` | modal.css | 1 |
| `padding: 16px` | `--spacing-lg` | modal.css, MinibarPanel.css, ReservationModal.css | 5+ |

## Design Token Reference

Current tokens in `base.css`:
```css
--spacing-xs: 4px;      /* extra small */
--spacing-sm: 8px;      /* small */
--spacing-md: 12px;     /* medium */
--spacing-lg: 16px;     /* large */
--spacing-xl: 24px;     /* extra large */
--spacing-2xl: 32px;    /* 2x large */
--spacing-3xl: 48px;    /* 3x large */
```

## Conversion Plan

### Phase 4C-1: Standardize Form Padding (HIGH PRIORITY)
Files: `forms.css`
- `padding: 8px` → `var(--spacing-sm)`
- `padding: 8px 12px` → `var(--spacing-sm) var(--spacing-md)`
- `padding: 10px` → `var(--spacing-md)` (or keep if specific)
- `padding: 6px 10px` → `var(--spacing-xs) var(--spacing-sm)`

**Expected Reduction:** 6 lines → 6 replacements (no line reduction, but consistency gain)

### Phase 4C-2: Consolidate Component Padding (MEDIUM PRIORITY)
Files: `MinibarPanel.css`, `modal.css`, `data-list.css`, `header.css`, `PeriodPicker.css`
- `padding: 0` → Keep as-is (already optimized)
- `padding: 4px 8px` → `var(--spacing-xs) var(--spacing-sm)`
- `padding: 6px` → `var(--spacing-xs)`
- `padding: 6px 8px` → `var(--spacing-xs) var(--spacing-sm)`
- `padding: 8px` → `var(--spacing-sm)`
- `padding: 12px` → `var(--spacing-md)`
- `padding: 16px` → `var(--spacing-lg)`
- `padding: 12px 16px` → `var(--spacing-md) var(--spacing-lg)`

**Expected Reduction:** No direct reduction, but improves consistency and maintainability

### Phase 4C-3: Add Missing Padding Token (if needed)
Current gap: 10px doesn't map directly
Options:
1. Use `--spacing-md` (12px) instead
2. Add `--spacing-sm-md: 10px` token
3. Keep hardcoded for specific cases

**Decision:** Use existing tokens, avoid new ones

## Implementation Order

1. ✅ Identify all padding declarations (done)
2. ⏳ Update `forms.css` (foundation file)
3. ⏳ Update component CSS files
4. ⏳ Verify visual consistency
5. ⏳ Test build and layout

## Expected Outcomes

- ✅ 100% consistency: All padding uses design tokens
- ✅ Easier maintenance: Change spacing globally by updating tokens
- ✅ Better semantics: "md padding" vs "12px"
- ✅ Reduced confusion: No hardcoded values scattered across codebase
- ✅ No visual regressions: Values remain the same

## Files to Update

### Primary (Foundation)
- [ ] `frontend/src/styles/forms.css` (6 declarations)

### Secondary (Components)  
- [ ] `frontend/src/components/Calendar/MinibarPanel.css` (6 declarations)
- [ ] `frontend/src/components/Shared/Modal/modal.css` (4 declarations)
- [ ] `frontend/src/components/Shared/List/data-list.css` (2 declarations)
- [ ] `frontend/src/components/PeriodoPicker/PeriodPicker.css` (2 declarations)
- [ ] `frontend/src/components/Layout/header.css` (1 declaration)

### Tertiary (Already using tokens - verify)
- ✅ `frontend/src/styles/base.css` (reset padding)
- ✅ `frontend/src/styles/components-base.css` (check all)
- ✅ `frontend/src/components/Calendar/ReservationModal.css` (already converted)

## Success Metrics

- [ ] 100% of padding declarations use vars (or are reset with 0)
- [ ] No hardcoded padding values remain
- [ ] Build passes
- [ ] Tests pass
- [ ] No visual regressions
- [ ] All spacing tokens used: xs, sm, md, lg, xl, 2xl, 3xl

---

**Status:** Ready to implement Phase 4C-1 (forms.css)  
**Next Action:** Convert form padding to use design tokens
