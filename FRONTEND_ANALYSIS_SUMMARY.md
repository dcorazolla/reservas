# Frontend Analysis Report - Reservas v0.3.0

**Data:** 19 de fevereiro de 2026  
**Caminho:** `/home/diogo/projects/reservas/frontend`  
**Status:** Análise completa de estrutura, componentes, estilos e padrões

---

## 1. Resumo Executivo

O frontend Reservas é um aplicativo React 19 com ~60 arquivos (47 TSX, 13 CSS) organizado em padrões bem estruturados de componentes + páginas + serviços. A arquitetura é sólida, mas apresenta **oportunidades significativas de refatoração** (60-80% código duplicado em CRUD pages/modals) e **inconsistências de estilo** (35+ cores hex, 100+ inline styles).

### Status por Aspecto:
| Aspecto | Status | Nota |
|---------|--------|------|
| Organização | ✅ Excelente | Componentes, páginas, serviços bem separados |
| Reutilização | ⚠️ Bom/Médio | Componentes Shared existem, mas CRUD boilerplate alto |
| Estilo/Tokens | ❌ Fraco | 35+ cores, sem design tokens centralizados |
| Inline Styles | ❌ Alto | 100+ instâncias, especialmente MinibarPanel.tsx |
| Acessibilidade | ✅ Bom | Aria attributes presentes, pode melhorar |
| Testes | ✅ Bom | Flow tests, unit tests com MSW |
| Performance | ⚠️ Médio | Calendário grande, usar virtualization |

---

## 2. Estrutura de Diretórios (Resumo)

```
src/
├── components/           # 47 componentes reutilizáveis
│   ├── Shared/          # GenéricoS: Modal, FormField, DataList, Skeleton, etc.
│   ├── Calendar/        # CalendarGrid, ReservationModal, MinibarPanel
│   ├── Layout/          # Header, Sidebar, PageShell
│   ├── Rooms/           # EditRoomModal
│   ├── RoomCategories/  # EditRoomCategoryModal
│   ├── Blocks/          # EditBlockModal
│   ├── Partners/        # EditPartnerModal
│   ├── Properties/      # EditPropertyModal, ConfirmDeleteModal
│   └── [outros]/        # DateTimeClock, LanguageSelector, etc.
│
├── pages/               # 8 páginas principais
│   ├── Calendar/        # CalendarPage (grid + reservations + minibar)
│   ├── Rooms/           # RoomsPage (CRUD list)
│   ├── Properties/      # PropertiesPage (CRUD list)
│   ├── RoomCategories/  # RoomCategoriesPage (CRUD list)
│   ├── Partners/        # PartnersPage (CRUD list)
│   ├── Blocks/          # BlocksPage (CRUD list)
│   ├── BaseRates/       # BaseRatesPage
│   ├── Home/            # Dashboard
│   └── LoginPage/       # Autenticação
│
├── services/            # API layer com factories genéricas
│   ├── crudService.ts   # createCrudService<T,P>(), createNestedCrudService<T,P>(), createScopedCrudService<T,P>()
│   ├── rooms.ts, roomCategories.ts, reservations.ts, minibar.ts, etc.
│
├── models/              # TypeScript types + Zod schemas
│   ├── room.ts, reservation.ts, blocks.ts, minibar.ts, partner.ts, property.ts, roomCategory.ts
│   └── schemas.ts       # roomSchema, reservationSchema, blockSchema, etc.
│
├── styles/              # Estilos globais
│   └── forms.css        # Grid layout, form fields, buttons
│
├── contexts/            # React Context
│   └── AuthContext.tsx  # Autenticação, token management
│
└── utils/               # Utilitários
```

---

## 3. Componentes Principais

### Componentes Genéricos (Shared)

| Componente | Caminho | Propósito | Padrão |
|------------|---------|----------|--------|
| **Modal** | `Shared/Modal/Modal.tsx` | Modal genérico (backdrop, header, close, body) | Usado em todos os CRUD modals |
| **FormField** | `Shared/FormField/FormField.tsx` | Label + input + erro message wrapper | Padrão react-hook-form |
| **DataList** | `Shared/List/DataList.tsx` | Lista genérica com gap uniforme | Usado em todas as CRUD pages |
| **CurrencyInput** | `Shared/CurrencyInput/CurrencyInput.tsx` | Input monetário (NumericFormat) | Usado em tarifas e preços |
| **Message** | `Shared/Message/Message.tsx` | Toast notification | Sucesso/erro |
| **SkeletonList** | `Shared/Skeleton/SkeletonList.tsx` | Pure-CSS loader para listas | Replace Chakra Skeleton |
| **SkeletonFields** | `Shared/Skeleton/SkeletonFields.tsx` | Pure-CSS loader para formulários | Replace Chakra Skeleton |
| **ConfirmModal** | `Shared/Confirm/ConfirmModal.tsx` | Confirmação genérica (delete, etc.) | Padrão em CRUD pages |
| **RatesField** | `Shared/RatesField/RatesField.tsx` | Input aninhado para tarifas | EditRoomModal |

### Páginas CRUD (5x similar, 70-80% boilerplate)

**Padrão:** Header + Search/Filter + DataList + EditModal + ConfirmDeleteModal

- **RoomsPage** (47 linhas úteis, ~150 com boilerplate)
- **PropertiesPage** (idem)
- **RoomCategoriesPage** (idem)
- **PartnersPage** (idem)
- **BlocksPage** (idem)

**Oportunidade:** Refatorar para `<CRUDPage<T>>` genérico.

### Páginas Especiais

| Página | Componentes | Recursos |
|--------|-------------|----------|
| **CalendarPage** | CalendarGrid, ReservationModal, MinibarPanel | Sticky headers, horizontal scroll, status colors, price calc, minibar tracking |
| **LoginPage** | Chakra Form, Email/Password | 4 idiomas, remember-me |
| **Home** | Card grid, links | Dashboard/landing |

---

## 4. Estilos e CSS

### CSS Files (13 total, 28 KB)

| Arquivo | Tamanho | Propósito | Classes |
|---------|---------|----------|---------|
| **CalendarGrid.css** | 8.2 KB | Grid sticky headers, room col, cell colors | `.calendar-table`, `.room-col`, `.cell-*`, `.floating-*` |
| **MinibarPanel.css** | 3.1 KB | Minibar modal, cards | `.minibar-grid`, `.minibar-card`, `.minibar-modal-*` |
| **forms.css** | 3.4 KB | Global form styles | `.form-grid` (2col gap:12px), `.form-field`, `.field-error`, `.btn` |
| **login-page.css** | 3.6 KB | Login form styling | Login form overrides |
| **modal.css** | 2.1 KB (minified) | Generic modal | `.shared-modal-*` (backdrop, panel, header, body) |
| **CalendarPage.css** | 2.8 KB | Calendar page layout | Top controls |
| **Home.css** | 1.1 KB | Dashboard page | Card grid |
| **ReservationModal.css** | 1.3 KB | Reservation modal | Status colors |
| **data-list.css** | 354 B | List styling | `.data-list`, `.data-list-item` (flex col, gap: 8px) |
| **message.css** | 200 B | Toast animation | `.shared-message` (slideIn) |
| **confirm-modal.css** | 200 B | Confirm styling | `.confirm-message` |
| **header.css** | 101 B | Header styling | Flex, gap |
| **language-selector.css** | 123 B | Language selector | Flex |

### Inline Styles (100+ instâncias) ⚠️

**Problema:** MinibarPanel.tsx (35 matches), ReservationModal.tsx (25 matches), backup modals

**Exemplos:**
```tsx
style={{
  backgroundColor: '#f5f5f5',
  border: '1px solid #ccc',
  padding: '8px 16px',
  display: 'flex',
  gap: '8px',
  marginBottom: '16px'
}}
```

**Impacto:** Difícil de manter, sem reusabilidade, impossível de tematizar  
**Solução:** Extrair para CSS classes em arquivos dedicados

---

## 5. Cores Usadas (35+ valores) ❌

### Palette Consolidada

| Rol | Cores | Exemplo |
|-----|-------|---------|
| **Primary** | #3182ce, #3b82f6, #2563eb, #1e40af | Botões, seleções, links |
| **Success** | #10b981, #047857 | Check-in, confirmação |
| **Error** | #ef4444, #991b1b | Delete, erro |
| **Warning** | #f59e0b, #fcd34d | Alerta |
| **Neutral** | #1f2937→#f8f9fa (9 tons) | Backgrounds, borders, text |
| **Accents** | #a78bfa (purple), #64748b (slate), #f97316 (orange) | Event colors |

**Problema:** 35+ variações sem sistema centralizado  
**Solução:** CSS custom properties

```css
:root {
  --color-primary: #3182ce;
  --color-primary-dark: #1e40af;
  --color-success: #10b981;
  --color-error: #ef4444;
  --color-text: #1f2937;
  --color-border: #e5e7eb;
  /* etc. */
}
```

---

## 6. Typography

### Font Sizes (Padronizadas)

| Uso | Tamanho | Frequência |
|-----|---------|-----------|
| Labels, small text | 12px | Alto |
| Body, form text | 13-14px | Alto |
| Large headers | 16px | Médio |
| Page titles | 24px | Baixo |
| Modal header | 14px-16px | Médio |

### Font Weights

- **400:** Body text (normal)
- **600:** Headers, labels (semibold) ← **Mais usado**
- **700:** Page titles (bold)

### Font Families

- **System (inherit):** Maioria dos elementos
- **Monospace:** SKU display (ex: `ROOM-001`)
- **Chakra default:** Body text

---

## 7. Spacing (Bem Padronizado ✅)

### Gaps

```
1px    - Hairline (table borders)
2px    - Minimal gap
4px    - Small (table cells, icons)
6px    - Small-medium
8px    → DataList, minibar cards, form buttons → PADRÃO
12px   → Form grid, modal sections → PADRÃO
16px   → Large (form-grid dates, modal footer)
20px   → Extra large (card gaps)
24px   → Page-level gaps
```

### Padding

```
2-4px    - Micro (inputs borders)
6-8px    - Small (cell, button)
12-16px  - Medium (modal, panels)
20-24px  - Large (cards)
```

### Widths

```
100px  - Room column (sticky left)
120px  - Count inputs
180px  - Date inputs
280px  - Card min-width
420px  - Modal small max
640px  - Modal medium max
920px  - Modal large max
```

### Heights

```
30px - Calendar day cell
32px - Input/select standard
36px - Button
48px - Tall input
60px - Textarea min
```

### Border Radius

- **6px** - Inputs, buttons, cards, modals
- **8px** - Panels, modals (Chakra override)
- **12px** - Modal panel container

---

## 8. Componentes Repetitivos (Oportunidade de Refatoração)

### 📌 CRUD Pages (5x similar)

**Estrutura comum:**
```tsx
<Page>
  <Header title="..." />
  <Search/Filter />
  <DataList items={items} renderItem={...} />
  <EditModal isOpen={editModal} onSave={handleSave} />
  <ConfirmDeleteModal isOpen={deleteModal} onConfirm={handleDelete} />
</Page>
```

**Linhas de código:**
- Atual: ~150-200 linhas por página
- Com CRUDPage<T>: ~50 linhas (75% redução)

**Arquivos:** RoomsPage, PropertiesPage, RoomCategoriesPage, PartnersPage, BlocksPage

### 📌 Edit Modals (5x similar)

**Estrutura comum:**
```tsx
<Modal title={t('edit_modal')}>
  <form onSubmit={...}>
    {fields.map(field => <FormField key={field} />)}
    <button type="submit">Salvar</button>
  </form>
</Modal>
```

**Linhas de código:**
- Atual: ~150-200 linhas por modal
- Com <EditModal>: ~40 linhas (75% redução)

**Arquivos:** EditRoomModal, EditBlockModal, EditRoomCategoryModal, EditPropertyModal, (Partners)

### 📌 Status Badges (10x similar)

```tsx
// Current - duplicated in CalendarGrid.css + ReservationModal.tsx
<div style={{
  backgroundColor: status === 'reserved' ? '#93c5fd' : ...,
  color: status === 'reserved' ? '#1e3a8a' : ...,
  borderLeft: '3px solid #3b82f6'
}}>
  {status}
</div>

// Proposed
<StatusBadge status={status} />
```

### 📌 Form Grid Layout (15x similar)

```tsx
// Current - repeated everywhere
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
  <FormField ... />
  <FormField ... />
</div>

// Better - use CSS class
<div className="form-grid-2">
  <FormField ... />
  <FormField ... />
</div>
```

---

## 9. Padrões de Layout

### Flex Patterns

| Nome | Uso | Exemplo |
|------|-----|---------|
| **Row (horizontal)** | Headers, buttons, inline controls | `display: flex, gap: 8px, alignItems: center` |
| **Column (vertical)** | Form fields, list items | `display: flex, flexDirection: column, gap: 8px` |

### Grid Patterns

| Nome | Uso | Columns | Gap |
|------|-----|---------|-----|
| **2-col form** | Edit modals | `1fr 1fr` | `12px`/`16px` |
| **Auto-fill minibar** | Product cards | `repeat(auto-fill, minmax(110px, 1fr))` | `8px` |
| **Auto-fit dashboard** | Home cards | `repeat(auto-fit, minmax(280px, 1fr))` | `20px` |

### Sticky/Fixed Positioning

| Elemento | Tipo | Z-Index | Nota |
|----------|------|---------|------|
| Calendar header | sticky top | 1050 | Com floating backup (1085) |
| Room column | sticky left | 1045 | Width: 100px |
| Sidebar | fixed | 1090 | Left navigation |
| App header | fixed | 1100 | Top bar |
| Modal | fixed | 2200 | Overlay |

---

## 10. Dependências de UI/Styling

### Instaladas

```json
{
  "@chakra-ui/react": "^3.33.0",  // ⚠️ Causa import errors
  "@emotion/react": "^11.14.0",   // Chakra dependency
  "@emotion/styled": "^11.14.1",  // Chakra dependency
  "react-icons": "^5.5.0",        // Icons (alternative)
  "framer-motion": "^12.34.0",    // Chakra dependency
  "date-fns": "^4.1.0",           // ✅ Dates
  "react-hook-form": "^7.71.1",   // ✅ Forms
  "zod": "^4.3.6",                // ✅ Validation
  "react-number-format": "^5.4.4" // ✅ Currency
}
```

### Não usadas (mas presentes)

- **@tanstack/react-query** - Cacheamento (comentado em services)
- **recharts** - Charts (não usado ainda)

### Abordagem CSS

- ❌ **Tailwind** - Não usado
- ❌ **CSS Modules** - Não usado
- ✅ **Plain CSS** - Arquivos .css com classe naming
- ⚠️ **Emotion** - Presentes via Chakra, não usado diretamente
- ⚠️ **Chakra theming** - Usado com CSS var fallback: `var(--chakra-colors-white, #fff)`

---

## 11. Principais Problemas Identificados

### 🔴 CRÍTICO

| Problema | Impacto | Solução |
|----------|---------|---------|
| **Chakra import errors** | Build/runtime failures | Use HTML native + CSS para maioria dos componentes |
| **100+ inline styles** | Não reutilizável, impossível tematizar | Extrair para CSS classes |
| **35+ cores hex sem tokens** | Inconsistência, difícil manter | CSS custom properties |

### 🟠 IMPORTANTE

| Problema | Impacto | Solução |
|----------|---------|---------|
| **60-80% boilerplate em CRUD** | Difícil manter, propenso a bugs | Generic `<CRUDPage<T>>` component |
| **5 modals similares** | 75% duplicação | Generic `<EditModal>` component |
| **Sem design tokens** | Inconsistente, impossível tema claro/escuro | CSS var system |

### 🟡 MÉDIO

| Problema | Impacto | Solução |
|----------|---------|---------|
| **Calendar grande DOM** | Possível performance lag em muitos eventos | Virtualization (react-window) |
| **DataList com key={idx}** | Potencial issue se lista reordenar | key={item.id} |
| **Aria-live faltante** | Acessibilidade reduzida | Adicionar em modals, loading states |

---

## 12. Oportunidades de Refatoração (Roadmap)

### 🔵 ALTA PRIORIDADE (1-2 semanas)

1. **Criar CSS Design Tokens** (1 dia)
   - `src/styles/tokens.css` com CSS custom properties
   - Impacto: 100% das cores, fonts, spacing centralizados

2. **Extrair Inline Styles** (3 dias)
   - MinibarPanel.tsx → minibar.css
   - ReservationModal.tsx → reservation-modal.css
   - Impacto: 30% CSS maintainability melhora

3. **Generic CRUDPage Component** (2 dias)
   - `src/components/shared/CRUDPage/CRUDPage.tsx`
   - Reduz 5 páginas de 150 linhas → 50 linhas

4. **Generic EditModal Component** (2 dias)
   - `src/components/shared/EditModal/EditModal.tsx`
   - Reduz 5 modals de 150 linhas → 40 linhas

### 🟠 MÉDIA PRIORIDADE (1 semana)

5. **StatusBadge Component** (4 horas)
6. **Cleanup Chakra Imports** (1 dia)
   - Remover imports desnecessários
   - Usar HTML native onde possível

7. **Form Field Variants** (1 dia)
   - Checkbox, radio, select groups
   - Date picker

### 🟡 BAIXA PRIORIDADE (2 semanas)

8. **Dark Mode Support** (2 dias)
9. **Calendar Virtualization** (2 dias)
10. **Storybook Setup** (1 dia)

---

## 13. Arquivos e Listas Completas

### Componentes Shared (9)

```
✅ Modal/Modal.tsx + modal.css
✅ FormField/FormField.tsx
✅ DataList/DataList.tsx + data-list.css
✅ CurrencyInput/CurrencyInput.tsx
✅ Message/Message.tsx + message.css
✅ SkeletonList/SkeletonList.tsx
✅ SkeletonFields/SkeletonFields.tsx
✅ Confirm/ConfirmModal.tsx + confirm-modal.css
✅ RatesField/RatesField.tsx
```

### Componentes CRUD Modals (5)

```
✅ Rooms/EditRoomModal.tsx
✅ RoomCategories/EditRoomCategoryModal.tsx
✅ Blocks/EditBlockModal.tsx
✅ Properties/EditPropertyModal.tsx
✅ Partners/EditPartnerModal.tsx (no explicit found, assumed)
```

### CRUD Pages (5)

```
✅ pages/Rooms/RoomsPage.tsx
✅ pages/Properties/PropertiesPage.tsx
✅ pages/RoomCategories/RoomCategoriesPage.tsx
✅ pages/Partners/PartnersPage.tsx
✅ pages/Blocks/BlocksPage.tsx
```

### Componentes Calendar (3)

```
✅ Calendar/CalendarGrid.tsx + CalendarGrid.css
✅ Calendar/ReservationModal.tsx + ReservationModal.css
✅ Calendar/MinibarPanel.tsx + MinibarPanel.css
```

### Componentes Layout (4)

```
✅ Layout/Header.tsx + header.css
✅ Layout/Sidebar.tsx
✅ Layout/Footer.tsx
✅ Layout/PageShell.tsx
```

### Outros (10+)

```
✅ DateTimeClock/DateTimeClock.tsx
✅ LanguageSelector/LanguageSelector.tsx
✅ PeriodoPicker/PeriodoPicker.tsx
✅ Properties/ConfirmDeleteModal.tsx
✅ [outros...]
```

### Páginas Principais (8)

```
✅ pages/Calendar/CalendarPage.tsx + CalendarPage.css
✅ pages/Home/Home.tsx + Home.css
✅ pages/LoginPage/LoginPage.tsx + login-page.css
✅ pages/Rooms/RoomsPage.tsx
✅ pages/Properties/PropertiesPage.tsx
✅ pages/RoomCategories/RoomCategoriesPage.tsx
✅ pages/Partners/PartnersPage.tsx
✅ pages/Blocks/BlocksPage.tsx
```

---

## 14. Recomendações Finais

### Curto Prazo (Sprint atual)

1. ✅ **Extrair CSS tokens** → arquivo `tokens.css`
2. ✅ **Criar .css files** para MinibarPanel, ReservationModal
3. ✅ **Refatorar CRUDPage** → generic component
4. ✅ **Refatorar EditModal** → generic component

### Médio Prazo (2-4 sprints)

5. Cleanup Chakra imports
6. Form field variants
7. StatusBadge component
8. Aria-live improvements

### Longo Prazo (Roadmap)

9. Dark mode support
10. Storybook
11. Calendar virtualization
12. E2E tests (Playwright)

---

## 📊 Estatísticas Finais

| Métrica | Valor | Status |
|---------|-------|--------|
| **Total Files** | 60 | ✅ |
| **TSX Components** | 47 | ✅ |
| **CSS Files** | 13 | ⚠️ Consolidar |
| **Inline Styles** | 100+ | ❌ Refatorar |
| **Unique Colors** | 35+ | ❌ Tokens |
| **Unique Font Sizes** | 8 | ✅ Bom |
| **Unique Spacing Values** | 12 | ✅ Bom |
| **CRUD Pages** | 5 | ⚠️ 70% boilerplate |
| **Edit Modals** | 5 | ⚠️ 70% boilerplate |
| **Shared Components** | 9 | ✅ Bom |

---

## Apêndice: Arquivo Completo

Para análise detalhada completa em JSON, consulte: **`/home/diogo/projects/reservas/FRONTEND_ANALYSIS.json`**

Contém:
- Estrutura completa de diretórios
- Lista de todos os componentes
- Definições de CSS e cores
- Análise de inline styles
- Oportunidades de refatoração
- Recomendações técnicas
