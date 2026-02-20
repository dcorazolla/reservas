# Frontend Refactoring Analysis - CSS Architecture & Accessibility

**Date**: Feb 20, 2026  
**Objective**: Comprehensive mapping of frontend structure, inline styles, and refactoring opportunities for CSS variables, theming, and accessibility.

---

## 1. Current State Assessment

### 1.1 Frontend Structure

```
frontend/src/
├── styles/
│   └── forms.css (minimal, basic form styling)
├── design-system/
│   └── ChakraProvider (Chakra UI wrapper)
├── components/
│   ├── Calendar/
│   │   ├── CalendarGrid.tsx (398 lines, no inline styles)
│   │   ├── CalendarGrid.css (456 lines, grid + status colors)
│   │   ├── ReservationModal.tsx (1110 lines, EXTENSIVE inline styles)
│   │   ├── ReservationModal.css (42 lines, status badge only)
│   │   ├── MinibarPanel.tsx (609 lines, grid + table, MANY inline styles)
│   │   └── MinibarPanel.css (200+ lines)
│   ├── Layout/
│   │   ├── Header.tsx, Sidebar.tsx, Footer.tsx
│   │   ├── header.css, sidebar.css, footer.css
│   ├── Shared/
│   │   ├── Modal/Modal.tsx (generic modal component)
│   │   ├── FormField/FormField.tsx
│   │   ├── CurrencyInput/
│   │   ├── Skeleton/SkeletonFields.tsx, SkeletonList.tsx
│   │   └── [Other shared components]
│   ├── Blocks/, Partners/, RoomCategories/, Rooms/, Properties/
│   │   └── [CRUD pages with modals and inline styles]
│   └── [Other pages]
├── pages/
│   ├── Calendar/
│   ├── Home.tsx, Home.css
│   ├── LoginPage/LoginPage.tsx, login-page.css
│   ├── RoomCategories/, Rooms/, Properties/, etc.
│   └── [Settings pages with forms and tables]
├── services/
│   ├── crudService.ts (CRUD factories - createCrudService, createScopedCrudService)
│   ├── reservations.ts
│   ├── minibar.ts
│   └── [Other domain services]
├── contexts/
│   └── AuthContext.tsx
├── models/
│   ├── reservation.ts (interfaces + STATUS_COLORS dict)
│   └── [Other models]
├── utils/
│   └── [Utility functions]
├── i18n.ts (i18next configuration)
├── App.tsx
└── main.tsx (imports: flag-icons, styles/forms.css)
```

### 1.2 CSS Files Count & State

**Existing CSS Files** (~1500 lines total):
- `forms.css` - minimal
- `CalendarGrid.css` - 456 lines (grid layout + 7 status color classes)
- `MinibarPanel.css` - 200+ lines (grid, cards, modal overlay)
- `ReservationModal.css` - 42 lines (status badge only - NEW)
- `Header.css`, `Sidebar.css`, `Footer.css` - small
- `LoginPage/login-page.css` - ~50 lines
- Individual page/component CSS files for Rooms, RoomCategories, Partners, etc.

**NO centralized variables file** (unlike @BKP backup which has `styles/variables.css`)

### 1.3 Inline Styles Inventory

**CRITICAL FILES WITH EXTENSIVE INLINE STYLES:**

1. **ReservationModal.tsx** (1110 lines)
   - ~50+ inline `style={{}}` occurrences
   - Patterns:
     - Grid layouts: `display: 'grid', gridTemplateColumns: '1fr 1fr'`, gap
     - Flex layouts: `display: 'flex', gap, justifyContent, alignItems`
     - Padding/margins: `padding: '20px'`, `marginBottom: '16px'`, etc.
     - Colors: hardcoded `#666`, `#0284c7`, `#0c4a6e`, `#e5e7eb`
     - Font sizes: `fontSize: '12px'`, `'14px'`, `'20px'`
     - Font weights: `fontWeight: '600'`, `'bold'`
     - Borders: `borderBottom: '1px solid #e5e7eb'`

2. **MinibarPanel.tsx** (609 lines)
   - ~30+ inline styles
   - Grid cards with minmax sizing
   - Modal overlay with backdrop
   - Form styling

3. **EditBlockModal.tsx** (and similar CRUD modals)
   - Grid layouts: `gridTemplateColumns: '1fr 1fr'`, gap: `'16px'`
   - Padding, margins, display flexes

4. **Other pages** (RoomsPage, RoomCategoriesPage, etc.)
   - Inline table styling: `width: 160px` on `<th>`
   - Margin/padding: `marginBottom: 16`
   - Card styling: `marginBottom: 16`, `padding`

**TOTAL ESTIMATED**: 150+ inline style objects across ~30 files

---

## 2. Color Palette & Tokens Analysis

### 2.1 Colors Currently in Use (hardcoded)

**From ReservationModal inline styles:**
- `#0c4a6e` - Dark blue (headers, labels)
- `#0284c7` - Medium blue (prices, totals, emphasis)
- `#e5e7eb` - Light gray (borders)
- `#666` - Medium gray (text)
- `#999` - Light gray (muted text)
- `#f97316` - Orange (warning, optional indicators)

**From CalendarGrid.css (status colors):**
- Pre-reserva: `#fbbf24` (amber)
- Reservado: `#60a5fa` (blue)
- Confirmado: `#10b981` (green)
- Check-in: `#8b5cf6` (purple)
- Check-out: `#f59e0b` (orange)
- No-show: `#ef4444` (red)
- Cancelado: `#d1d5db` (gray)

**From @BKP backup (reference):**
```css
--color-primary-500: #2563eb
--color-primary-400: #3b82f6
--color-primary-600: #1d4ed8
--color-success: #10b981
--color-danger: #991b1b (danger/red)
--color-warning: #f97316
--color-white: #ffffff
--color-black: #111827
--color-page-bg: #f9fafb
--color-surface: #ffffff
--color-muted: #6b7280
--color-gray-50 through --color-gray-400: grayscale
```

### 2.2 Typography Patterns

**Font Sizes Used (inline):**
- `fontSize: '12px'` - small labels, secondary text
- `fontSize: '14px'` - body text, inputs, normal
- `fontSize: '16px'` - mentioned but not extensive
- `fontSize: '20px'` - modal headers/titles

**Font Weights:**
- `fontWeight: '600'` - medium emphasis (labels, headers)
- `fontWeight: 'bold'` (== 700) - strong emphasis (totals, prices)
- Normal (400) - body text

**Font Family:** Inherited (not specified inline) - system default or Chakra default

### 2.3 Spacing Patterns

**Gaps (flexbox/grid):**
- `gap: '8px'` - tight spacing, icon buttons
- `gap: '12px'` - moderate spacing, form fields
- `gap: '16px'` - standard spacing, grid layouts
- `gap: '24px'` - loose spacing, sections

**Padding:**
- `padding: '20px'` - modal content
- `padding: '6px'` - button padding
- Margin-bottom: `8px`, `12px`, `16px`, `20px`

**Border radius:**
- `borderRadius: '8px'` - buttons, cards (Chakra default)
- `borderRadius: '9999px'` - avatars (circular)

---

## 3. Components Inventory & Refactoring Opportunities

### 3.1 CRUD Pages (Common Pattern)

**Files**: RoomsPage, RoomCategoriesPage, PropertiesPage, BlocksPage, PartnersPage

**Current Issues:**
- Inline grid layouts for forms
- Repeated FormField + input patterns
- Inline styling for tables (`<th style={{ width: 160 }}>`)
- Margin utilities applied inline

**Opportunity**: Create utility CSS classes for:
- `.form-grid-2col` → `display: grid; grid-template-columns: 1fr 1fr; gap: 16px;`
- `.form-grid-3col` → `display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;`
- `.table-th-actions` → `width: 160px;`

### 3.2 Modal Components

**Files**: ReservationModal, EditBlockModal, EditRoomModal, EditRoomCategoryModal, EditPartnerModal

**Current Issues:**
- ReservationModal: 50+ inline styles
- Modals all use `Shared/Modal/Modal` wrapper but add their own styling
- Similar layout patterns repeated: padding, flex containers, grid forms

**Opportunity**:
- Extract common modal layout patterns to CSS classes
- Create `.modal-content` wrapper with standard padding
- Create `.modal-header`, `.modal-footer` utilities

### 3.3 Status Badge Component

**File**: ReservationModal (status display)

**Current**: CSS class `.status-badge` with 7 status-specific colors in ReservationModal.css

**Opportunity**: Move to shared component library with CSS in:
- `components/Shared/StatusBadge/StatusBadge.tsx`
- `components/Shared/StatusBadge/status-badge.css`

---

## 4. Refactoring Plan (Phase-by-Phase)

### Phase 2: Create CSS Base System with Variables
**Location**: `frontend/src/styles/base.css`

**Content Structure**:
```css
:root {
  /* Colors - Semantic */
  --color-primary: #3b82f6;
  --color-primary-dark: #1d4ed8;
  --color-primary-light: #93c5fd;
  
  --color-success: #10b981;
  --color-warning: #f97316;
  --color-danger: #ef4444;
  --color-info: #0284c7;
  
  /* Colors - Neutral */
  --color-white: #ffffff;
  --color-black: #111827;
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #374151;
  
  /* Text Colors */
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-text-tertiary: #9ca3af;
  --color-text-disabled: #d1d5db;
  
  /* Background Colors */
  --color-bg-page: #f9fafb;
  --color-bg-surface: #ffffff;
  --color-bg-hover: #f3f4f6;
  
  /* Status Colors */
  --color-status-pre-reserva: #fbbf24;
  --color-status-reservado: #60a5fa;
  --color-status-confirmado: #10b981;
  --color-status-checked-in: #8b5cf6;
  --color-status-checked-out: #f59e0b;
  --color-status-no-show: #ef4444;
  --color-status-cancelado: #d1d5db;
  
  /* Typography */
  --font-family-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  --line-height-tight: 1.2;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 20px;
  --spacing-2xl: 24px;
  --spacing-3xl: 32px;
  
  /* Sizing */
  --size-icon-sm: 16px;
  --size-icon-base: 20px;
  --size-icon-lg: 24px;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  
  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;
  
  /* Z-Index */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal: 300;
  --z-popover: 400;
  --z-tooltip: 500;
  
  /* Layout */
  --header-height: 64px;
  --header-height-compact: 40px;
  --sidebar-width: 200px;
  --max-content-width: 1400px;
  --border-width: 1px;
}

/* Reset and base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-family: var(--font-family-sans);
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  color: var(--color-text-primary);
  background-color: var(--color-bg-page);
  line-height: var(--line-height-normal);
}
```

### Phase 3: Extract All Inline Styles from ReservationModal
**Target**: Remove 50+ inline style objects from ReservationModal.tsx, move to ReservationModal.css

**High-Impact Extractions**:
1. `.modal-content` - padding, max-width
2. `.modal-header` - flex layout, border-bottom
3. `.modal-body` - content sections
4. `.modal-footer` - flex layout, gap, justify
5. `.form-group`, `.form-grid` - field layouts
6. `.value-box` - price display boxes
7. `.day-breakdown` - day-by-day pricing display
8. `.price-section` - emphasis box for pricing

### Phase 4: Create Theme System
**Location**: `frontend/src/styles/themes.css`

**Themes**:
1. **Light** (default)
2. **Dark**
3. **High Contrast** (accessibility)

```css
/* Light Theme (default - uses :root variables) */
:root {
  color-scheme: light;
}

/* Dark Theme */
[data-theme="dark"] {
  --color-text-primary: #f3f4f6;
  --color-text-secondary: #d1d5db;
  --color-text-tertiary: #9ca3af;
  
  --color-bg-page: #111827;
  --color-bg-surface: #1f2937;
  --color-bg-hover: #374151;
  
  --color-status-pre-reserva: #b45309;
  --color-status-reservado: #1e40af;
  /* ... other color overrides ... */
}

/* High Contrast Theme */
[data-theme="high-contrast"] {
  --color-text-primary: #000000;
  --color-text-secondary: #000000;
  
  --color-bg-page: #ffffff;
  --color-bg-surface: #ffffff;
  
  /* Increased contrast for status colors */
  --color-status-pre-reserva: #995500;
  --color-status-reservado: #003366;
  /* ... other high contrast variants ... */
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    color-scheme: dark;
    --color-text-primary: #f3f4f6;
    --color-bg-page: #111827;
    --color-bg-surface: #1f2937;
    /* ... sync with [data-theme="dark"] ... */
  }
}

@media (prefers-contrast: more) {
  :root:not([data-theme]) {
    /* increase contrast automatically */
  }
}
```

### Phase 5: Font Size Control Component
**Location**: `frontend/src/components/Shared/FontSizeControl/FontSizeControl.tsx`

**Approach**:
- Component stores user preference in localStorage
- Sets `data-font-scale` attribute on `<html>` root
- Updates `--font-size-base` CSS variable
- Example: `--font-size-base: clamp(14px, calc(16px * var(--user-font-scale, 1)), 20px)`

---

## 5. Utility Classes to Create

**In `frontend/src/styles/utilities.css`:**

```css
/* Flexbox Utilities */
.flex { display: flex; }
.flex-center { display: flex; align-items: center; justify-content: center; }
.flex-between { display: flex; justify-content: space-between; align-items: center; }
.flex-gap-xs { gap: var(--spacing-xs); }
.flex-gap-sm { gap: var(--spacing-sm); }
.flex-gap-md { gap: var(--spacing-md); }
.flex-gap-lg { gap: var(--spacing-lg); }

/* Grid Utilities */
.grid { display: grid; }
.grid-2-col { display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg); }
.grid-3-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--spacing-lg); }

/* Padding Utilities */
.p-xs { padding: var(--spacing-xs); }
.p-sm { padding: var(--spacing-sm); }
.p-md { padding: var(--spacing-md); }
.p-lg { padding: var(--spacing-lg); }
.p-xl { padding: var(--spacing-xl); }

/* Margin Utilities */
.m-0 { margin: 0; }
.mb-xs { margin-bottom: var(--spacing-xs); }
.mb-sm { margin-bottom: var(--spacing-sm); }
.mb-md { margin-bottom: var(--spacing-md); }
.mb-lg { margin-bottom: var(--spacing-lg); }

/* Text Utilities */
.text-sm { font-size: var(--font-size-xs); }
.text-base { font-size: var(--font-size-sm); }
.text-lg { font-size: var(--font-size-lg); }
.text-primary { color: var(--color-text-primary); }
.text-secondary { color: var(--color-text-secondary); }
.text-muted { color: var(--color-text-tertiary); }
.font-medium { font-weight: var(--font-weight-medium); }
.font-semibold { font-weight: var(--font-weight-semibold); }
.font-bold { font-weight: var(--font-weight-bold); }

/* Border Utilities */
.border { border: var(--border-width) solid var(--color-gray-200); }
.border-b { border-bottom: var(--border-width) solid var(--color-gray-200); }
.rounded-md { border-radius: var(--radius-md); }
.rounded-lg { border-radius: var(--radius-lg); }
.rounded-full { border-radius: var(--radius-full); }

/* Shadow Utilities */
.shadow-md { box-shadow: var(--shadow-md); }
.shadow-lg { box-shadow: var(--shadow-lg); }

/* Display Utilities */
.hidden { display: none; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }
```

---

## 6. Component Consolidation Opportunities

### 6.1 Duplicate Logic

**Price Calculations** (appears in ReservationModal + MinibarPanel):
- Currently: `reduce()` operations in component logic
- **Refactor to**: `utils/calculations.ts` with exported functions
  - `calculateMinibarTotal(consumptions: Consumption[]): number`
  - `calculateReservationTotal(basePrice: number, minibarTotal: number, override?: number): number`
  - `formatBreakdown(days: Array<{ date, price }>): string`

**Date Formatting** (appears across components):
- Currently: Using `date-fns` inline
- **Refactor to**: `utils/dateFormatters.ts`
  - `formatDateRange(start: string, end: string): string`
  - `formatDayBreakdown(days: Array): string`

### 6.2 Shared Component Candidates

**Status Badge**: Already semi-extracted but could be full component
- File: `components/Shared/StatusBadge/StatusBadge.tsx`
- Props: `status: ReservationStatus`, `variant?: 'badge' | 'dot-only'`
- CSS: Centralized status colors

**Modal Wrapper Utilities**: Extract from individual modals
- File: `components/Shared/ModalContent/ModalContent.tsx`
- Provides: `.modal-content`, `.modal-header`, `.modal-footer` layout

---

## 7. Implementation Roadmap (Quick Reference)

| Phase | Task | Est. Lines | Priority | Files |
|-------|------|-----------|----------|-------|
| 2 | Create base.css | 150 | HIGH | `src/styles/base.css` |
| 2 | Create utilities.css | 100 | HIGH | `src/styles/utilities.css` |
| 2 | Create themes.css | 80 | HIGH | `src/styles/themes.css` |
| 3 | Extract ReservationModal styles | 300 | HIGH | `ReservationModal.css` (extend from 42 → 300+) |
| 3 | Extract MinibarPanel styles | 150 | HIGH | `MinibarPanel.css` (extend from 200 → 350) |
| 3 | Update ReservationModal.tsx | -300 | HIGH | Remove inline styles |
| 3 | Update MinibarPanel.tsx | -150 | HIGH | Remove inline styles |
| 4 | Extract all CRUD page styles | 200 | MEDIUM | Rooms*, RoomCategories*, etc CSS |
| 4 | Create utility functions | 100 | MEDIUM | `utils/calculations.ts`, `utils/dateFormatters.ts` |
| 5 | Create ThemeContext + Switcher | 150 | MEDIUM | `contexts/ThemeContext.tsx`, `components/Shared/ThemeSelector/` |
| 6 | Create FontSizeControl component | 80 | MEDIUM | `components/Shared/FontSizeControl/` |
| 6 | Create StatusBadge component | 50 | LOW | `components/Shared/StatusBadge/` |

**Total Estimated Code**: ~1350 lines CSS + ~180 lines TS = **1530 lines new**  
**Removed**: ~300 inline styles from ReservationModal, ~150 from MinibarPanel, ~100 from other components

---

## 8. Accessibility Improvements

### 8.1 By Theme System
- ✅ High-contrast mode for users with vision impairment
- ✅ Respects `prefers-color-scheme` OS setting
- ✅ Respects `prefers-contrast` for auto-high-contrast

### 8.2 By Font Size Control
- ✅ Users can enlarge/reduce font without breaking layout
- ✅ Uses CSS scale variable instead of fixed pixel sizes
- ✅ Applies uniformly to all text via base variable

### 8.3 Existing Good Practices
- ✅ ReservationModal has `aria-busy`, `aria-live` (already implemented)
- ✅ Focus management in modals (already implemented)
- ✅ Semantic HTML (already using `<form>`, `<label>`, `<button>`)
- ✅ Skip-to-content link candidates

---

## 9. Migration Strategy (Safe & Gradual)

### Step 1: Setup Foundation (no breaking changes)
- Create `src/styles/base.css` with all CSS variables
- Create `src/styles/utilities.css` with class utilities
- Create `src/styles/themes.css` with theme definitions
- Import all 3 files in `main.tsx`
- **No component changes yet** - everything still works with old inline styles

### Step 2: Component Extraction (one file at a time)
- Pick component (e.g., ReservationModal)
- Extract inline styles to component CSS file
- Replace inline `style={{}}` with `className` attributes
- Test thoroughly
- Move to next component

### Step 3: Utility Adoption (optional cleanup)
- Replace custom CSS with utility classes where appropriate
- Example: `.flex gap-md` instead of `.my-flex-container { display: flex; gap: 12px; }`

### Step 4: Theme & Font System (feature additions)
- Add ThemeContext + Provider in App.tsx
- Add ThemeSelector component to Header
- Add FontSizeControl component to Header
- Test all 3 themes + font scales

### Step 5: Finalization
- Remove Chakra inline style remnants (e.g., `p={3}`, `gap={4}`)
- Update to CSS-only approach
- Audit for accessibility

---

## 10. Files to Create/Update

### New Files
```
frontend/src/styles/
├── base.css (150 lines - CSS variables)
├── utilities.css (100 lines - utility classes)
├── themes.css (80 lines - theme variants)

frontend/src/components/Shared/
├── ThemeSelector/
│   ├── ThemeSelector.tsx
│   └── theme-selector.css
├── FontSizeControl/
│   ├── FontSizeControl.tsx
│   └── font-size-control.css
├── StatusBadge/
│   ├── StatusBadge.tsx
│   └── status-badge.css
├── ModalContent/
│   ├── ModalContent.tsx
│   └── modal-content.css

frontend/src/contexts/
├── ThemeContext.tsx

frontend/src/utils/
├── calculations.ts (100 lines - price/value calcs)
├── dateFormatters.ts (50 lines - date formatting)
```

### Updated Files
```
frontend/src/
├── main.tsx (add imports for base.css, utilities.css, themes.css)
├── App.tsx (add ThemeProvider)
├── components/Calendar/
│   ├── ReservationModal.tsx (-300 inline styles)
│   ├── ReservationModal.css (+300 extracted styles)
│   ├── MinibarPanel.tsx (-150 inline styles)
│   ├── MinibarPanel.css (+150 extracted styles)
├── components/Layout/
│   ├── Header.tsx (add ThemeSelector, FontSizeControl)
├── [All CRUD page components and modals]
```

---

## Summary

**Current Pain Points:**
1. ❌ No centralized CSS variables (colors, spacing, typography hardcoded)
2. ❌ 150+ inline style objects scattered across components
3. ❌ No theming support (light/dark/high-contrast)
4. ❌ No font size accessibility controls
5. ❌ Duplicate logic in multiple components
6. ❌ No responsive utilities (everything custom CSS)

**After Refactoring:**
1. ✅ Centralized CSS variables in `base.css`
2. ✅ All inline styles extracted to component CSS files
3. ✅ Theme system with 3 variants (light/dark/high-contrast)
4. ✅ Font size control component for accessibility
5. ✅ Utility functions for calculations and formatting
6. ✅ Utility CSS classes for common patterns
7. ✅ 100% maintainable, scalable, and accessible

**Estimated Effort**: 
- Phase 2-3: **8-10 hours** (setup + ReservationModal extraction)
- Phase 4-6: **4-6 hours** (theming + utilities)
- **Total: ~12-16 hours** of focused refactoring

**Risk Level**: ⚠️ **LOW** - Gradual migration with no breaking changes, full test coverage already in place
