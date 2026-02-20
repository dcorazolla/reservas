# Frontend CSS Architecture - Current State (Phase 3 Complete)

## Overview

The frontend CSS architecture has been fully refactored to use centralized, semantic classes powered by design system tokens.

**Status:** ✅ **Zero inline styles in codebase** (extraction complete, Phase 3 ✓)

---

## CSS Organization

### 1. Foundation Layer (`frontend/src/styles/`)

#### base.css (450+ lines)
- **100 CSS Variables** organized by category
- Semantic color tokens (`--color-primary`, `--color-danger`, etc)
- Spacing system (`--spacing-xs` through `--spacing-2xl`)
- Typography tokens (`--font-size-*`, `--font-weight-*`)
- Layout dimensions (`--app-header-h`, `--app-sidebar-left`)
- Transitions, shadows, z-index scale

#### utilities.css (500+ lines)
- **100+ utility classes** for common layouts
- Flexbox utilities (`.flex`, `.flex-center`, `.flex-between`)
- Grid utilities (`.grid-2-col`, `.grid-3-col`)
- Spacing utilities (`padding-*`, `margin-*`, `gap-*`)
- Typography helpers (text sizes, weights, colors)
- Visibility utilities (`.hidden`, `.visible`)

#### themes.css (350+ lines)
- Light theme (default)
- Dark theme (`[data-theme="dark"]`)
- High-contrast theme (`[data-theme="high-contrast"]`)
- OS color-scheme detection via `@media prefers-color-scheme`
- Accessibility support (`prefers-contrast`, `prefers-reduced-motion`)

### 2. Component Layer (`frontend/src/components/*`)

Each component has a dedicated `.css` file (same name prefix):

#### Calendar Components
- `ReservationModal.css` (430+ lines)
  - Confirmation dialogs, guarantee selection
  - Modal header with status badge
  - Price summary with breakdown display
  - Action buttons and controls
  
- `MinibarPanel.css` (365+ lines)
  - Quantity input controls with +/- buttons
  - History toggle and section styling
  - Table with header/rows/cells
  - Loading/error/empty states
  
- `CalendarGrid.css` (extended with `.hidden` utility)

#### Block Management
- `EditBlockModal.tsx` now uses `.form-grid .form-grid--2col`

#### Shared Components
- `PeriodPicker.css` (new, 20 lines)

### 3. Import Order (Critical!)

```tsx
// main.tsx
import './styles/base.css'        // 1. Variables, reset, accessibility
import './styles/utilities.css'   // 2. Utility classes
import './styles/themes.css'      // 3. Theme overrides
// Component CSS files imported in components themselves
```

**Why this order matters:**
- Variables defined in base.css are available to all subsequent files
- Utilities can override base styles
- Themes cascade on top to customize for different schemes

---

## Class Naming Conventions

### Pattern: BEM (Block Element Modifier)

```css
.component-name { }                    /* Block */
.component-name__element { }           /* Element */
.component-name--variant { }           /* Modifier */
.component-name.state-class { }        /* State */
```

### Examples

#### ReservationModal
```css
.reservation-modal-content              /* Block */
.reservation-modal-header               /* Element */
.reservation-modal-header__status-section /* Subelement */
.reservation-modal-guarantee-badge      /* Component variant */
.confirm-dialog-guarantee-button.active /* Button with active state */
```

#### MinibarPanel
```css
.minibar-panel                          /* Block */
.minibar-history-toggle-section         /* Element */
.minibar-history-table                  /* Table block */
.minibar-history-table-header           /* Table header cells */
.minibar-history-table-row.alt          /* Alternating row modifier */
```

---

## Button System

All buttons now use semantic classes from utilities:

```css
.btn                    /* Base button styles */
.btn-primary            /* Primary action (blue) */
.btn-secondary          /* Secondary action (gray) */
.btn-success            /* Success/confirm action (green) */
.btn-danger             /* Danger/delete action (red) */
.btn-warning            /* Warning action (orange) */
.btn-purple             /* Status transitions (purple) */
.btn-ghost              /* Transparent button */
.btn-sm                 /* Small variant */
.btn-xs                 /* Extra small variant */
```

### Usage

```tsx
// Before (inline styles)
<button style={{
  padding: '8px 16px',
  backgroundColor: '#3182CE',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
}}>
  Save
</button>

// After (CSS classes)
<button className="btn btn-primary">
  Save
</button>
```

---

## Form Grid System

### Two-Column Layout
```tsx
<div className="form-grid form-grid--2col">
  <FormField label="Start Date">
    <input type="date" />
  </FormField>
  <FormField label="End Date">
    <input type="date" />
  </FormField>
</div>
```

### Three-Column Layout
```tsx
<div className="form-grid form-grid--3col">
  <FormField label="Adults">...</FormField>
  <FormField label="Children">...</FormField>
  <FormField label="Infants">...</FormField>
</div>
```

### CSS
```css
.form-grid {
  display: grid;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.form-grid--2col {
  grid-template-columns: 1fr 1fr;
}

.form-grid--3col {
  grid-template-columns: 1fr 1fr 1fr;
}
```

---

## State & Conditional Classes

### Active/Selected States
```tsx
className={`confirm-dialog-guarantee-button ${guaranteeInput === 'card' ? 'active' : ''}`}

// CSS
.confirm-dialog-guarantee-button.active {
  background-color: var(--color-primary);
  color: var(--color-text-inverted);
}
```

### Hidden/Visible States
```tsx
className={`floating-thead ${!floatingVisible ? 'hidden' : ''}`}

// CSS
.hidden {
  display: none !important;
}
```

### Loading/Error States
```tsx
className="minibar-history-loading"
className="minibar-history-error"
className="minibar-history-empty"
```

---

## Design Tokens in Action

### Colors
```css
--color-primary: #3182CE              /* Primary blue */
--color-success: #10b981              /* Success green */
--color-danger: #ef4444               /* Danger red */
--color-warning: #f59e0b              /* Warning orange */
--color-text-primary: #1f2937          /* Primary text */
--color-text-secondary: #6b7280        /* Secondary text */
```

### Spacing
```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 12px
--spacing-lg: 16px
--spacing-xl: 20px
--spacing-2xl: 24px
```

### Usage
```css
/* Instead of hardcoded values */
padding: 12px;
gap: 8px;
margin-bottom: 16px;

/* Use variables */
padding: var(--spacing-md);
gap: var(--spacing-sm);
margin-bottom: var(--spacing-lg);
```

### Benefits
✅ Consistent spacing across all components  
✅ Easy to adjust theme dimensions in one place  
✅ Better accessibility (larger spacing for visual impaired)  
✅ Responsive scaling (multiply variables by screen size)

---

## Responsive Design

### Existing Breakpoints (in utilities.css)
```css
@media (max-width: 768px) {
  .grid-2-col {
    grid-template-columns: 1fr;
  }
  
  .flex-between {
    flex-direction: column;
  }
}
```

### Adding Responsive Classes
```tsx
className="form-grid form-grid--2col md:form-grid--1col"
```

---

## Theming Ready

Current setup supports instant theme switching:

```tsx
// Light theme (default)
document.documentElement.removeAttribute('data-theme')

// Dark theme
document.documentElement.setAttribute('data-theme', 'dark')

// High contrast
document.documentElement.setAttribute('data-theme', 'high-contrast')
```

All CSS variables automatically adapt per theme (themes.css handles this).

---

## Migration Checklist for New Components

When creating a new component, follow this pattern:

- [ ] Create component file: `MyComponent.tsx`
- [ ] Create style file: `MyComponent.css`
- [ ] Import CSS in component: `import './MyComponent.css'`
- [ ] Use semantic class names (no inline styles)
- [ ] Import CSS variables from base.css for colors, spacing, etc
- [ ] Add component-specific classes for unique layouts
- [ ] Reuse utility classes for common patterns (flex, grid, spacing)
- [ ] Test in light/dark/high-contrast themes
- [ ] Verify build passes without warnings

---

## Common Mistakes to Avoid

❌ **DON'T:** Create new classes for simple padding
```css
.my-custom-box {
  padding: 16px;  /* ← Use utility instead */
}
```

✅ **DO:** Use utilities
```tsx
<div className="padding-lg">
```

---

❌ **DON'T:** Hardcode colors
```css
.button {
  background-color: #3182ce;  /* ← Use token instead */
}
```

✅ **DO:** Use CSS variables
```css
.button {
  background-color: var(--color-primary);
}
```

---

❌ **DON'T:** Create duplicate button styles
```css
.primary-button {
  padding: 8px 16px;
  background-color: #3182ce;
  /* ... */
}

.secondary-button {
  padding: 8px 16px;
  background-color: #6b7280;
  /* ... */
}
```

✅ **DO:** Use button system
```css
.btn { /* Base styles */ }
.btn-primary { /* Primary override */ }
.btn-secondary { /* Secondary override */ }
```

---

## File Structure Summary

```
frontend/src/
├── styles/
│   ├── base.css              (450 lines - variables, reset)
│   ├── utilities.css         (500 lines - utility classes)
│   └── themes.css            (350 lines - theme variants)
├── components/
│   ├── Calendar/
│   │   ├── ReservationModal.tsx
│   │   ├── ReservationModal.css  (430 lines)
│   │   ├── MinibarPanel.tsx
│   │   ├── MinibarPanel.css      (365 lines)
│   │   ├── CalendarGrid.tsx
│   │   └── CalendarGrid.css
│   ├── Blocks/
│   │   └── EditBlockModal.tsx    (uses .form-grid)
│   ├── PeriodoPicker/
│   │   ├── PeriodPicker.tsx
│   │   └── PeriodPicker.css      (20 lines)
│   └── Shared/
│       └── Modal/Modal.tsx       (no inline styles)
└── pages/
    └── ...                       (no inline styles)
```

---

## Performance Impact

| Aspect | Impact |
|--------|--------|
| CSS File Size | +300 lines total (minimal) |
| Browser Parsing | Slightly faster (CSS cached) |
| Runtime Recalculation | Eliminated (no inline styles) |
| Maintainability | Significantly improved |
| Theme Switching | Now possible (was not) |

---

## Next Phase (Phase 4 Pending)

1. Create `src/styles/components/` folder
2. Move component-specific CSS there
3. Create base component files (_button.css, _card.css, _modal.css, _form.css)
4. Consolidate duplicate patterns
5. Reduce overall CSS size
6. Implement CSS minification strategy

---

## Resources

- Design System Tokens: `frontend/src/styles/base.css`
- Utility Classes: `frontend/src/styles/utilities.css`
- Theme Configuration: `frontend/src/styles/themes.css`
- Component Examples: `frontend/src/components/Calendar/ReservationModal.tsx`

---

**Last Updated:** 2026-02-20  
**Phase:** 3 (Complete) ✅  
**Status:** Production Ready  
**Inline Styles:** 0 remaining  
