# Frontend Refactoring Roadmap - Guia Prático

**Preparado em:** 19 de fevereiro de 2026  
**Aplicável a:** v0.3.0 e posteriores

---

## 🎯 Objetivos

1. ✅ Eliminar **60-80% boilerplate** em CRUD pages/modals
2. ✅ Centralizar **cores, fonts, spacing** em design tokens
3. ✅ Remover **100+ inline styles** → CSS classes
4. ✅ Melhorar **maintainability** e **reusability**
5. ✅ Preparar para **dark mode, theming**

---

## Phase 1: Design Tokens (1-2 dias)

### Step 1.1: Criar `src/styles/tokens.css`

```css
/* ============================================================
   Design Tokens - Centralized colors, spacing, typography
   ============================================================ */

:root {
  /* --- Colors: Primary --- */
  --color-primary: #3182ce;
  --color-primary-light: #3b82f6;
  --color-primary-dark: #1e40af;
  --color-primary-darker: #1d4ed8;

  /* --- Colors: Semantic --- */
  --color-success: #10b981;
  --color-success-dark: #047857;
  --color-error: #ef4444;
  --color-error-dark: #991b1b;
  --color-warning: #f59e0b;
  --color-warning-light: #fcd34d;
  --color-info: #0284c7;

  /* --- Colors: Neutral --- */
  --color-text-primary: #1f2937;
  --color-text-secondary: #6b7280;
  --color-text-muted: #9ca3af;
  --color-text-light: #d1d5db;

  --color-bg-white: #ffffff;
  --color-bg-primary: #f8f9fa;
  --color-bg-secondary: #f3f4f6;
  --color-bg-tertiary: #f9fafb;

  --color-border-light: #e5e7eb;
  --color-border-medium: #d1d5db;
  --color-border-dark: #9ca3af;

  /* --- Colors: Special --- */
  --color-reserved: #93c5fd;
  --color-confirmed: #10b981;
  --color-checkin: #0891b2;
  --color-checkout: #a78bfa;
  --color-dark-bg: #1f2937;
  --color-dark-text: #374151;

  /* --- Spacing --- */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;

  /* --- Typography --- */
  --font-size-xs: 12px;
  --font-size-sm: 13px;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;

  --font-weight-normal: 400;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --font-family-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-family-mono: 'Courier New', monospace;

  /* --- Sizing --- */
  --size-room-col: 100px;
  --size-input-height: 32px;
  --size-button-height: 36px;
  --size-border-radius: 6px;

  /* --- Shadows --- */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 10px 40px rgba(0, 0, 0, 0.2);

  /* --- Z-Index --- */
  --z-content: auto;
  --z-room-col: 1045;
  --z-floating-thead: 1085;
  --z-sidebar: 1090;
  --z-header: 1100;
  --z-modal: 2200;
}

/* Dark mode (future) */
@media (prefers-color-scheme: dark) {
  :root {
    --color-text-primary: #e5e7eb;
    --color-text-secondary: #9ca3af;
    --color-bg-white: #1f2937;
    --color-bg-primary: #111827;
    --color-bg-secondary: #1f2937;
    /* ... etc */
  }
}
```

### Step 1.2: Atualizar `src/main.tsx`

```tsx
import './styles/tokens.css'  // ← ADD THIS
import './styles/forms.css'
import './App.css'
// ... resto
```

### Step 1.3: Atualizar estilos existentes

**Antes:**
```css
.minibar-card {
  background: #fafafa;
  border: 1px solid #e5e7eb;
  padding: 8px;
  gap: 4px;
}
```

**Depois:**
```css
.minibar-card {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  padding: var(--space-2);
  gap: var(--space-1);
}
```

### ✅ Resultado

- ✅ Cores centralizadas em um lugar
- ✅ Fácil trocar tema inteiro alterando `:root`
- ✅ Suporte a dark mode com `@media (prefers-color-scheme: dark)`

---

## Phase 2: Extract Inline Styles (3 dias)

### Step 2.1: Extrair MinibarPanel.tsx inline styles

**Arquivo:** `src/components/Calendar/MinibarPanel.tsx`  
**Novo arquivo:** `src/components/Calendar/MinibarPanel.css` (EXPAND)

```css
/* MinibarPanel - Extract all inline styles */

.minibar-header {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  padding: var(--space-2);
  border-bottom: 1px solid var(--color-border-light);
}

.minibar-btn-toggle {
  background-color: var(--color-text-secondary);
  color: white;
  padding: var(--space-2) var(--space-3);
  border: none;
  border-radius: var(--size-border-radius);
  cursor: pointer;
  transition: background-color 0.2s;
}

.minibar-btn-toggle:hover {
  opacity: 0.9;
}

.minibar-btn-toggle.active {
  background-color: var(--color-success);
}

.minibar-error-box {
  background-color: #fee;
  color: #c33;
  padding: var(--space-3);
  border-radius: var(--size-border-radius);
}

.minibar-input-wrapper {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.minibar-input-wrapper input {
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--color-border-light);
  border-radius: var(--size-border-radius);
  background-color: var(--color-bg-primary);
}

/* ... continue for all inline styles ... */
```

**TSX atualizado:**
```tsx
// Remove all style={{...}}
<div className="minibar-header">
  <h3>Adicionar Consumo</h3>
</div>

<button className="minibar-btn-toggle active">
  Mostrar Histórico
</button>

<div className="minibar-error-box">
  Erro ao carregar
</div>

<div className="minibar-input-wrapper">
  <input type="number" />
  <input type="text" />
</div>
```

### Step 2.2: Extrair ReservationModal.tsx inline styles

**Arquivo:** `src/components/Calendar/ReservationModal.tsx`  
**Atualizar:** `src/components/Calendar/ReservationModal.css`

```css
.reservation-guarantee-option {
  padding: var(--space-3) var(--space-4);
  border: 1px solid transparent;
  border-radius: var(--size-border-radius);
  cursor: pointer;
  transition: all 0.2s;
  background-color: #f0f0f0;
  color: #333;
}

.reservation-guarantee-option.active {
  background-color: var(--color-primary-light);
  color: white;
  border-color: var(--color-primary);
}

.reservation-price-summary {
  background-color: var(--color-bg-secondary);
  border: 2px solid var(--color-info);
  padding: var(--space-4);
  border-radius: var(--size-border-radius);
}

.reservation-action-btn {
  padding: var(--space-2) var(--space-4);
  border: none;
  border-radius: var(--size-border-radius);
  cursor: pointer;
  font-weight: var(--font-weight-semibold);
  transition: all 0.2s;
}

.reservation-action-btn.confirm {
  background-color: var(--color-success);
  color: white;
}

.reservation-action-btn.cancel {
  background-color: var(--color-error-dark);
  color: white;
}

.reservation-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ... continue for all ... */
```

**TSX atualizado:**
```tsx
<div className="reservation-guarantee-option active">
  Card
</div>

<div className="reservation-price-summary">
  Total: R$ 1.200,00
</div>

<button className="reservation-action-btn confirm">
  Confirmar
</button>
```

### ✅ Resultado

- ✅ 100+ inline styles → CSS classes
- ✅ Fácil manter e consistente
- ✅ Suporte a dark mode automático

---

## Phase 3: Generic CRUDPage Component (2 dias)

### Step 3.1: Criar `src/components/Shared/CRUDPage/CRUDPage.tsx`

```tsx
import React from 'react'
import type { ReactNode } from 'react'
import DataList from '@components/Shared/List/DataList'
import SkeletonList from '@components/Shared/Skeleton/SkeletonList'

export type CRUDPageProps<T> = {
  title: string
  description?: string
  items: T[]
  isLoading: boolean
  onNew: () => void
  onEdit: (item: T) => void
  onDelete: (item: T) => void
  renderItem: (item: T) => ReactNode
  children?: ReactNode // For modals, confirmDelete, etc.
}

export default function CRUDPage<T extends { id: string }>({
  title,
  description,
  items,
  isLoading,
  onNew,
  onEdit,
  onDelete,
  renderItem,
  children,
}: CRUDPageProps<T>) {
  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <h1>{title}</h1>
          {description && <p className="crud-description">{description}</p>}
        </div>
        <button className="btn btn-primary" onClick={onNew}>
          + Novo
        </button>
      </div>

      {isLoading ? (
        <SkeletonList rows={5} />
      ) : items.length === 0 ? (
        <div className="crud-empty">
          <p>Nenhum item encontrado</p>
        </div>
      ) : (
        <DataList items={items} renderItem={renderItem} className="crud-list" />
      )}

      {children}
    </div>
  )
}
```

**CSS:**
```css
.crud-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.crud-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--space-4);
  background: var(--color-bg-white);
  border-radius: var(--size-border-radius);
}

.crud-header h1 {
  margin: 0 0 var(--space-2) 0;
  font-size: var(--font-size-2xl);
  color: var(--color-text-primary);
}

.crud-description {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.crud-empty {
  text-align: center;
  padding: var(--space-6);
  color: var(--color-text-muted);
}
```

### Step 3.2: Refatorar RoomsPage com CRUDPage

**Antes (150+ linhas):**
```tsx
export default function RoomsPage() {
  const [rooms, setRooms] = useState([])
  const [editModal, setEditModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  // ... etc, muito boilerplate
}
```

**Depois (50 linhas):**
```tsx
import CRUDPage from '@components/Shared/CRUDPage/CRUDPage'
import EditRoomModal from '@components/Rooms/EditRoomModal'

export default function RoomsPage() {
  const [rooms, setRooms] = useState([])
  const [editRoom, setEditRoom] = useState(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    listRooms().then(setRooms).finally(() => setLoading(false))
  }, [])

  return (
    <CRUDPage
      title={t('rooms.title')}
      items={rooms}
      isLoading={loading}
      onNew={() => { setEditRoom(null); setIsEditOpen(true) }}
      onEdit={(room) => { setEditRoom(room); setIsEditOpen(true) }}
      onDelete={(room) => { /* TODO: confirm delete */ }}
      renderItem={(room) => <RoomRow room={room} onEdit={onEdit} />}
    >
      <EditRoomModal isOpen={isEditOpen} room={editRoom} onClose={() => setIsEditOpen(false)} />
    </CRUDPage>
  )
}
```

### Step 3.3: Aplicar para todas as 5 CRUD pages

- RoomsPage.tsx
- PropertiesPage.tsx
- RoomCategoriesPage.tsx
- PartnersPage.tsx
- BlocksPage.tsx

### ✅ Resultado

- ✅ 5 pages: 150 lines each → 50 lines each (75% reduction)
- ✅ Lógica centralizada em CRUDPage
- ✅ Fácil adicionar features (search, filters, pagination)

---

## Phase 4: Generic EditModal Component (2 dias)

### Step 4.1: Criar `src/components/Shared/EditModal/EditModal.tsx`

```tsx
import React from 'react'
import type { ReactNode } from 'react'
import type { FieldErrors } from 'react-hook-form'
import Modal from '@components/Shared/Modal/Modal'

export type EditModalFieldDef = {
  name: string
  label: string
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea'
  required?: boolean
  options?: Array<{ value: string; label: string }>
  placeholder?: string
  multiColumn?: boolean // Span 2 columns in grid
}

export type EditModalProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  fields: EditModalFieldDef[]
  values: Record<string, any>
  errors: FieldErrors
  isLoading?: boolean
  onSubmit: (values: Record<string, any>) => Promise<void>
  children?: ReactNode // For additional content like rates
}

export default function EditModal({
  isOpen,
  onClose,
  title,
  fields,
  values,
  errors,
  isLoading = false,
  onSubmit,
  children,
}: EditModalProps) {
  const [formData, setFormData] = React.useState(values)

  React.useEffect(() => {
    setFormData(values)
  }, [values, isOpen])

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onSubmit(formData)
      onClose()
    } catch (err) {
      console.error('Submit error:', err)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <form onSubmit={handleSubmit} className="edit-modal-form">
        <div className="form-grid-2">
          {fields.map(field => (
            <div
              key={field.name}
              className={field.multiColumn ? 'form-grid-full' : ''}
            >
              <label className="form-label">{field.label}</label>
              {field.type === 'select' ? (
                <select
                  value={formData[field.name] ?? ''}
                  onChange={e => handleChange(field.name, e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">Selecione...</option>
                  {field.options?.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  value={formData[field.name] ?? ''}
                  onChange={e => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  disabled={isLoading}
                />
              ) : (
                <input
                  type={field.type}
                  value={formData[field.name] ?? ''}
                  onChange={e => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  disabled={isLoading}
                />
              )}
              {errors[field.name] && (
                <div className="field-error">
                  {String((errors[field.name] as any)?.message ?? 'Invalid')}
                </div>
              )}
            </div>
          ))}
        </div>

        {children}

        <div className="modal-actions">
          <button type="button" onClick={onClose} disabled={isLoading}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            Salvar
          </button>
        </div>
      </form>
    </Modal>
  )
}
```

### Step 4.2: Refatorar EditRoomModal com EditModal

**Antes (200+ linhas):**
```tsx
export default function EditRoomModal({ isOpen, room, onClose, onSave }) {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm(...)
  const [categories, setCategories] = useState([])
  // ... 150+ lines of boilerplate
}
```

**Depois (80 linhas):**
```tsx
import EditModal from '@components/Shared/EditModal/EditModal'

export default function EditRoomModal({ isOpen, room, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: room?.name ?? '',
    number: room?.number ?? '',
    room_category_id: room?.room_category_id ?? '',
    capacity: room?.capacity ?? 1,
  })

  const fields = [
    { name: 'name', label: t('rooms.name'), type: 'text', required: true },
    { name: 'number', label: t('rooms.number'), type: 'text', required: true },
    { 
      name: 'room_category_id', 
      label: t('rooms.category'),
      type: 'select',
      options: categories.map(c => ({ value: c.id, label: c.name })),
      required: true 
    },
    { name: 'capacity', label: t('rooms.capacity'), type: 'number', required: true },
  ]

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      title={room?.id ? t('rooms.edit') : t('rooms.new')}
      fields={fields}
      values={formData}
      errors={{}}
      onSubmit={onSave}
    />
  )
}
```

### ✅ Resultado

- ✅ 5 modals: 150 lines each → 80 lines each (45% reduction)
- ✅ Validação e submissão centralizadas
- ✅ Fácil adicionar novo fields

---

## Phase 5: Cleanup & Polish (1 dia)

### Step 5.1: Create StatusBadge Component

```tsx
// src/components/Shared/StatusBadge/StatusBadge.tsx
export default function StatusBadge({ status }: { status: 'reserved' | 'confirmed' | 'checkin' | 'checkout' }) {
  const statusConfig = {
    reserved: { bg: '--color-reserved', text: '--color-primary-dark', border: '--color-primary' },
    confirmed: { bg: '--color-success', text: 'white', border: '--color-success-dark' },
    checkin: { bg: '--color-checkin', text: 'white', border: '--color-checkin-dark' },
    checkout: { bg: '--color-checkout', text: 'white', border: '--color-checkout-dark' },
  }

  const config = statusConfig[status]

  return (
    <span
      className="status-badge"
      style={{
        backgroundColor: `var(${config.bg})`,
        color: `var(${config.text})`,
        borderLeft: `3px solid var(${config.border})`,
      }}
    >
      {status}
    </span>
  )
}
```

### Step 5.2: Update Button Styles

```css
/* src/styles/buttons.css */
.btn {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--size-border-radius);
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  font: inherit;
  font-weight: var(--font-weight-semibold);
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.btn-success {
  background-color: var(--color-success);
  color: white;
}

.btn-error {
  background-color: var(--color-error);
  color: white;
}

.btn-secondary {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-light);
}

.btn-small {
  padding: var(--space-1) var(--space-2);
  font-size: var(--font-size-xs);
}

.btn-large {
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-base);
}
```

### Step 5.3: Update forms.css

```css
/* Remove or update old button styles */
/* Update .form-grid to use new tokens */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
  align-items: start;
}

@media (max-width: 800px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-grid-full {
  grid-column: 1 / -1;
}

.form-label {
  display: block;
  margin-bottom: var(--space-1);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.field-error {
  color: var(--color-error);
  font-size: var(--font-size-xs);
  margin-top: var(--space-1);
}
```

### ✅ Result

- ✅ Centralized styling
- ✅ Easy to maintain
- ✅ Consistent across app

---

## 📋 Implementation Checklist

### Phase 1: Tokens
- [ ] Create `src/styles/tokens.css`
- [ ] Update `src/main.tsx` to import tokens.css
- [ ] Update existing `.css` files to use tokens
- [ ] Test dark mode with DevTools

### Phase 2: Extract Inline Styles
- [ ] Extract MinibarPanel.tsx inline styles
- [ ] Extract ReservationModal.tsx inline styles
- [ ] Extract other modals' inline styles
- [ ] Run tests to ensure no visual regressions

### Phase 3: CRUDPage Generic
- [ ] Create `src/components/Shared/CRUDPage/CRUDPage.tsx`
- [ ] Refactor RoomsPage
- [ ] Refactor PropertiesPage
- [ ] Refactor RoomCategoriesPage
- [ ] Refactor PartnersPage
- [ ] Refactor BlocksPage (if similar pattern)
- [ ] Run tests

### Phase 4: EditModal Generic
- [ ] Create `src/components/Shared/EditModal/EditModal.tsx`
- [ ] Refactor EditRoomModal
- [ ] Refactor EditBlockModal
- [ ] Refactor EditRoomCategoryModal
- [ ] Refactor EditPropertyModal
- [ ] Run tests

### Phase 5: Cleanup
- [ ] Create StatusBadge component
- [ ] Update button styles
- [ ] Create or update forms.css
- [ ] Remove deprecated styles
- [ ] Run full test suite
- [ ] Check visual regressions

---

## 🧪 Testing Strategy

### Unit Tests
```tsx
// Test CRUDPage
it('renders items in DataList', () => { ... })
it('calls onNew when button clicked', () => { ... })

// Test EditModal
it('renders fields correctly', () => { ... })
it('submits form with updated values', () => { ... })
```

### Integration Tests
```tsx
// Test full CRUD flow
it('creates, edits, deletes room via RoomsPage', () => { ... })
```

### Visual Regression Tests
```bash
# After refactoring, take screenshots
npm run test -- --ui
```

---

## 📊 Expected Impact

| Metric | Before | After | Reduction |
|--------|--------|-------|-----------|
| **CRUD Pages LOC** | 150/each | 50/each | 67% |
| **Edit Modals LOC** | 150/each | 80/each | 47% |
| **CSS Files** | 13 | 10 | 23% |
| **Inline Styles** | 100+ | <5 | 95% |
| **Unique Colors** | 35+ | 15 | 57% |
| **Total Lines Reduced** | ~2000 | ~1200 | 40% |
| **Bundle Size** | Baseline | -5-10% | ~10% |

---

## ⏱️ Timeline

| Phase | Duration | Start | End |
|-------|----------|-------|-----|
| 1: Tokens | 1-2 days | Week 1 | Week 1 |
| 2: Extract Styles | 3-4 days | Week 1-2 | Week 2 |
| 3: CRUDPage | 2-3 days | Week 2 | Week 2 |
| 4: EditModal | 2 days | Week 2-3 | Week 3 |
| 5: Polish | 1 day | Week 3 | Week 3 |
| **Total** | **~10-12 days** | **Week 1** | **Week 3** |

---

## 🚀 Future Improvements

### After Phase 5

1. **Dark Mode** (2 days)
   - Update all tokens for dark theme
   - Add theme toggle in LanguageSelector

2. **Storybook** (1 day)
   - Document all Shared components
   - Visual testing

3. **Form Builder** (3 days)
   - Meta-driven form generation
   - Reduce 80% of form code

4. **Theming System** (2 days)
   - Chakra integration or custom
   - Per-tenant themes

5. **Calendar Virtualization** (2 days)
   - react-window for large datasets
   - Performance improvement

---

## 📝 Git Strategy

```bash
# Branch per phase
git checkout -b refactor/phase-1-tokens
git commit -m "feat: add design tokens system"
git push

git checkout -b refactor/phase-2-extract-styles
git commit -m "refactor: extract inline styles to CSS classes"
git push

# PR per phase, easy to review and rollback
```

---

## ✅ Success Criteria

- [ ] All tests pass
- [ ] No visual regressions
- [ ] 40% code reduction achieved
- [ ] Design tokens centralized
- [ ] Dark mode ready (tokens in place)
- [ ] Team can maintain easily
- [ ] New features can reuse components

---

## 📞 Notes

- Keep `@BKP/` folder for reference during refactoring
- Run `npm test -- --run` after each phase
- Use `npm run lint` to check for issues
- Take screenshots before/after for comparison
- Document decisions in ADR if significant

---

**Status:** Ready for implementation  
**Last Updated:** 2026-02-19  
**Owner:** Engineering Team
