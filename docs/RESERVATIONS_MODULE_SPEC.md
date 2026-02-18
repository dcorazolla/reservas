# Módulo de Reservas - Análise e Requisitos (2026-02-18)

## 1. Visão Geral da Solicitação

O usuário pediu a implementação de um novo módulo de **Reservas** com dois componentes principais:

### A. Página de Calendário com Grid de Reservas
- Calendário interativo mostrando dias com reservas
- Cores diferentes para diferentes status de reservas
- Navegação de datas fácil e intuitiva
- Número de dias exibidos adaptável ao tamanho da tela (responsivo)
- Cada dia com 2 colunas (check-in e check-out visual)
- Modal de edição de reservas (usando padrão do frontend antigo)

### B. Página CRUD de Listagem de Reservas
- Listagem de todas as reservas do mês ativo
- Filtros por hóspede (guest)
- Filtros por contatos do hóspede
- Referência visual na linha da reserva

---

## 2. Estado Atual da Documentação

### 2.1 Documentação Existente

#### Encontrada em `docs/CONSOLIDATED_REQUIREMENTS.md`:
- ✅ **§1-3**: Visão geral e regras de negócio do sistema
- ✅ **§8**: Tarifário - cascata de preços (completo)
- ⚠️ **Reservas**: Mencionadas apenas genericamente ("CRUD de partners e endpoints")
- ❌ **Não documentado**: Requisitos específicos de UI para calendário e listagem

#### Encontrada em `docs/requirements/ui-payments-checkin-invoices.md`:
- ✅ Contém requisitos de UI, pagamentos, check-in/check-out
- ✅ Seção sobre "Bloqueios" (room_blocks)
- ❌ **Não documentado**: Especificações de calendário grid, responsividade, adaptação de dias

#### Encontrada em `backend/src/app/Services/CalendarService.php`:
- ✅ Service backend que retorna quartos com reservas em intervalo
- ✅ Método: `getRoomsWithReservations(propertyId, start, end)`

#### Encontrada em `@BKP/src/components/Calendar/CalendarGrid.tsx`:
- ✅ Componente funcional que foi desenvolvido e testado
- ✅ Implementa: grid de dias (2 colunas por dia), status com cores, check-in/check-out visual
- ✅ Implementa: bloqueios (room_blocks), reservas, células vazias

#### Encontrada em `@BKP/src/components/Reservation/ReservationModal.tsx`:
- ✅ Modal de edição de reservas (completo)
- ✅ Suporta: criação, edição, cálculo de preço, integração com minibar
- ✅ Status: pre-reserva, reservado, confirmado, checked_in, checked_out, no_show, cancelado, blocked

---

## 3. Diferenças: O que foi Pedido vs. o que está Documentado

| Aspecto | Pedido | Status Documentação | Observação |
|---------|-------|-------------------|-----------|
| **Calendário Grid** | Sim | Parcial (código antigo existe, não formalizado em ADR) | Componente `CalendarGrid.tsx` no @BKP prova conceito |
| **Cores por Status** | Sim | Parcial (CSS no @BKP, mas não em spec de requisitos) | CSS define cores por status em calendar.css |
| **Navegação de Datas** | Sim | Não documentado | Não há spec formal da UX (prev/next, input de data, etc) |
| **Dias Adaptativos (Responsivo)** | Sim | Não documentado | @BKP tem media queries, mas sem spec de breakpoints |
| **Check-in/Check-out Visuais** | Sim | Não documentado | @BKP implementa 2 colunas por dia (checkout/checkin) |
| **Modal de Edição** | Sim | Parcial (ReservationModal.tsx existe no @BKP) | Referência de UX disponível |
| **Página CRUD Listagem** | Sim | Não documentado | Não há especificação formal |
| **Filtros por Hóspede** | Sim | Não documentado | Não definido como funcionar (select, search, etc) |
| **Filtros por Contato** | Sim | Não documentado | Não definido (email, phone, qual prioridade?) |
| **Referência Visual em Linha** | Sim | Não documentado | Não especificado (ícone, cores, partner badge?) |

---

## 4. Análise do Frontend Antigo (@BKP)

### 4.1 CalendarGrid.tsx (✅ Bem Implementado)

**Características:**
```tsx
// Grid de dias com 2 colunas por dia
- Checkout (col 0) | Check-in (col 1)
- Para cada dia da semana

// Suporta:
- Reservas com colSpan baseado em dias (ex: 3 dias = colSpan 6)
- Status colors: pre-reserva, reservado, confirmado, checked_in, checked_out, no_show, cancelado, blocked
- Room blocks (bloqueios)
- Popover no hover com informações (nome hóspede, datas)
- Partner badge (ícone 🤝 se tem partner)
```

**Estrutura de Dados:**
```ts
type Room = {
  id: string
  name: string
  capacity: number
  reservations: Reservation[]
  room_blocks?: RoomBlock[]
}

type Reservation = {
  id: string
  room_id: string
  guest_name: string
  people_count: number
  adults_count?: number
  children_count?: number
  infants_count?: number
  start_date: string  // YYYY-MM-DD
  end_date: string    // YYYY-MM-DD
  status: ReservationStatus
  total_value?: number
  notes?: string
  partner_id?: string | null
  partner_name?: string | null
  price_override?: number | null
}
```

**CSS Relevante:**
- `.calendar-table`: table-layout fixed, border-collapse
- `.room-col`: sticky column com quarto (120px width)
- `.day-header`: colSpan=2, mostra dia e mês
- `.reservation-cell`: colSpan=span (calculado), cor por status
- `.half-cell`: checkout/checkin, 30px width, clicável
- `.room-block-cell`: bloqueio, 🔒 label

**Responsividade:**
```css
@media (max-width: 900px) {
  .room-col { width: 90px; }
  .day-header .day-label { font-size: 0.9em; }
  .reservation-cell { font-size: 11px; }
}

@media (max-width: 600px) {
  .room-col { position: static; width: auto; }
}
```

### 4.2 ReservationModal.tsx (✅ Funcional)

**Características:**
```tsx
// Modal com formulário completo de reserva
- Inputs: guest_name, adults, children, infants, room select, start_date, end_date
- Status select (pre-reserva → reservado → confirmado → checked_in → checked_out)
- Cálculo de preço automático (calculateReservationPriceDetailed)
- Exibição de dias com preço por dia
- Price override manual
- Notas de reserva
- Partner select
- Minibar panel (consumo adicional)
- Buttons: Save, Cancel, Check-in, Check-out, Confirm, Cancel Reservation, Finalize
```

**API Calls:**
- `listPartners()`
- `listRooms()`
- `calculateReservationPriceDetailed()`
- `createReservation() / updateReservation()`
- `checkinReservation(id)` etc

---

## 5. Requisitos Consolidados para Implementação

### 5.1 Página de Calendário de Reservas

#### Visual & UX
- [ ] Grid com tabela: rows=quartos, cols=dias (2 subcols cada)
- [ ] Header com controles:
  - [ ] Input de data (ou prev/next buttons) para navegar
  - [ ] Seletor do número de dias (5/10/15/20/30/35)
  - [ ] Mês/ano atual em texto
- [ ] Responsividade adaptativa:
  - [ ] Mobile (< 600px): 5-10 dias
  - [ ] Tablet (600-1024px): 10-15 dias
  - [ ] Desktop (> 1024px): 15-35 dias
- [ ] Status com cores diferenciadas:
  - [ ] pre-reserva: cor A
  - [ ] reservado: cor B
  - [ ] confirmado: cor C
  - [ ] checked_in: cor D
  - [ ] checked_out: cor E
  - [ ] no_show: cor F
  - [ ] cancelado: cor G
  - [ ] blocked: cor H (lock icon)

#### Interação
- [ ] Clique em célula vazia → abre modal para criar reserva
- [ ] Clique em reserva → abre modal para editar
- [ ] Clique em bloqueio → abre modal para editar bloqueio
- [ ] Hover → popover com info (nome, datas, partner badge)

#### Backend
- [ ] Endpoint `GET /api/calendar?property_id=...&start=...&end=...`
  - Retorna rooms com reservations e room_blocks

---

### 5.2 Página CRUD de Listagem de Reservas (Tabela)

#### Visual & UX
- [ ] Tabela com colunas:
  - [ ] Quarto (Room name)
  - [ ] Hóspede (Guest name)
  - [ ] Datas (Check-in, Check-out)
  - [ ] Status (badge colorido)
  - [ ] Contato (email, phone) - opcional, expansível?
  - [ ] Partner (se houver)
  - [ ] Valor total
  - [ ] Ações (Edit, Delete)

#### Filtros
- [ ] Mês/Ano (para definir intervalo)
- [ ] Filtro por hóspede (busca/select)
- [ ] Filtro por contato (email/phone - search)
- [ ] Filtro por status (multi-select ou checkboxes)
- [ ] Filtro por partner (select)

#### Referência Visual
- [ ] Cores por status (like calendar)
- [ ] Partner badge (🤝 ou similar) na linha
- [ ] Ícone de edit/delete nas ações

#### Backend
- [ ] Endpoint `GET /api/reservations?property_id=...&from=...&to=...&filters[guest]=...&filters[contact]=...`
  - Retorna lista de reservations com dados do hóspede

#### Paginação
- [ ] Paginação ou lazy-loading
- [ ] Mostrar total de resultados

---

## 6. Artefatos do Frontend Antigo a Reutilizar/Migrar

| Arquivo | Status | Usar? | Observação |
|---------|--------|-------|-----------|
| `@BKP/src/components/Calendar/CalendarGrid.tsx` | Pronto | ✅ Sim | Portar para novo padrão de componentes |
| `@BKP/src/components/Calendar/calendar.css` | Pronto | ✅ Parcial | Migrar estilos, adaptar para novo DS |
| `@BKP/src/components/Reservation/ReservationModal.tsx` | Pronto | ✅ Sim | Refatorar para novos padrões, remover dependências legadas |
| `@BKP/src/types/calendar.ts` | Pronto | ✅ Sim | Usar como base para tipos no novo frontend |
| `@BKP/src/api/reservations.ts` | Antigo | ❌ Substituir | Backend novo deve ter endpoints próprios |
| `@BKP/src/utils/dates.ts` | Utilitário | ✅ Sim | Reutilizar funções de data se aplicável |
| `@BKP/src/components/Popover` | UI | ✅ Sim | Usar componente para hover info (ou Chakra tooltip) |

---

## 7. Plano de Implementação Sugerido

### Fase 1: Tipos e Modelos
- [ ] Criar `frontend/src/models/reservation.ts` com types do calendário
- [ ] Definir enums para `ReservationStatus`, `ReservationPaymentStatus`

### Fase 2: Serviços
- [ ] `frontend/src/services/reservations.ts`: CRUD básico
- [ ] `frontend/src/services/calendar.ts`: fetch calendar grid data

### Fase 3: Componentes Reutilizáveis
- [ ] `frontend/src/components/Shared/ReservationStatusBadge.tsx`
- [ ] `frontend/src/components/Shared/DateRangeSelector.tsx`
- [ ] `frontend/src/components/Calendar/CalendarGrid.tsx` (portado do @BKP)
- [ ] `frontend/src/components/Reservation/ReservationModal.tsx` (refatorado)

### Fase 4: Páginas
- [ ] `frontend/src/pages/Reservations/CalendarPage.tsx`
- [ ] `frontend/src/pages/Reservations/ListPage.tsx`
- [ ] `frontend/src/pages/Reservations/index.ts`

### Fase 5: I18n
- [ ] Adicionar chaves em `public/locales/{pt-BR,en,es,fr}/common.json`

### Fase 6: Testes
- [ ] Testes para CalendarGrid
- [ ] Testes para ReservationModal
- [ ] Testes para ListPage (filtros)
- [ ] Testes E2E para fluxos críticos

---

## 8. Documentação Ausente

### 8.1 ADR Necessária
- [ ] ADR 0011: Estratégia de Calendário Grid (responsive, 2-column days, etc)
- [ ] ADR 0012: Modal de Reservas (estrutura, fluxos de estado, integração com preço)

### 8.2 Atualizar CONSOLIDATED_REQUIREMENTS.md
- [ ] Seção **Requisitos de Reservas - UI**:
  - [ ] Página de calendário
  - [ ] Página de listagem
  - [ ] Responsividade adaptativa
  - [ ] Filtros disponíveis

### 8.3 Atualizar README.md
- [ ] Seção sobre Módulo de Reservas
- [ ] Explicar componentes principais
- [ ] Estrutura de pastas

### 8.4 Criar RESERVATIONS.md
- [ ] Documentação específica do módulo
- [ ] Fluxos de criação, edição, check-in/check-out
- [ ] Integração com faturamento (invoices)

---

## 9. Resumo das Diferenças

| Item | Pedido | Documentado? | Ação Necessária |
|------|-------|------------|-----------------|
| **Calendário com grid** | ✅ | ⚠️ Código antigo existe | ADR + spec de requisitos |
| **Cores por status** | ✅ | ⚠️ Parcial | Formalizar paleta de cores |
| **Navegação intuitiva** | ✅ | ❌ | Especificar UX (prev/next, input data) |
| **Responsividade 5-35 dias** | ✅ | ❌ | Definir breakpoints e visibilidade |
| **2 colunas check-in/out** | ✅ | ⚠️ Código prova conceito | Documentar padrão |
| **Modal de edição** | ✅ | ⚠️ Existe no @BKP | Portar e refatorar |
| **Página CRUD listagem** | ✅ | ❌ | Especificar colunas, filtros, layout |
| **Filtro por hóspede** | ✅ | ❌ | Detalhar interação (busca/select) |
| **Filtro por contato** | ✅ | ❌ | Detalhar (email? phone? ambos?) |
| **Referência visual linha** | ✅ | ❌ | Especificar (cores, badges, ícones) |

---

## 10. Próximos Passos

1. **Confirmação do usuário**: Validar se as especificações acima cobrem o escopo desejado
2. **Criar ADRs**: Formalizar decisões de UI/UX
3. **Atualizar Documentação**: CONSOLIDATED_REQUIREMENTS.md com seção de Reservas
4. **Iniciar Implementação**: Backend endpoints → Frontend componentes → Testes

