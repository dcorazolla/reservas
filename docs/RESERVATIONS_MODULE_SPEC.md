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
- [ ] Design baseado em `@BKP/src/components/Calendar/CalendarGrid.tsx` (mantém UX validada)
- [ ] Header com controles:
  - [ ] Botões prev/next ou input de data para navegar
  - [ ] Seletor do número de dias (input numérico com min/max por breakpoint)
  - [ ] Mês/ano atual em texto
  - [ ] Indicador visual se há overflow horizontal
- [ ] Responsividade adaptativa:
  - [ ] Mobile (< 600px): 5-10 dias (padrão: 7)
  - [ ] Tablet (600-1024px): 10-15 dias (padrão: 12)
  - [ ] Desktop (> 1024px): 15-35 dias (padrão: 21)
  - [ ] User pode mudar o número de dias via controle (input numérico ou slider)
  - [ ] Número de dias se ajusta para manter legibilidade
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
  - [ ] Check-in (start_date)
  - [ ] Check-out (end_date)
  - [ ] Status (badge colorido - cores iguais ao calendário)
  - [ ] Contato (email e phone - expandível ou tooltip)
  - [ ] Partner (🤝 badge se houver)
  - [ ] Valor total (preço formatado)
  - [ ] Ações (Edit, Delete com confirmação)

#### Filtros (Simples e Úteis)
- [ ] **Período**: Mês/Ano dropdown (mês atual padrão) - determina range de datas
- [ ] **Hóspede**: Input de busca em tempo real (busca em guest_name)
- [ ] **Contato**: Input de busca em tempo real (busca em email E phone)
- [ ] **Partner**: Select com opcões (todos + lista de partners)
- [ ] **Status**: Multi-select com 8 opcões
- [ ] **Botão**: Limpar filtros (reset)

**Layout de Filtros (Integrado):**
```tsx
// Header/Bar acima da tabela:
<div class="filters-bar">
  <select>Mês/Ano</select>
  <input placeholder="Buscar hóspede..." />
  <input placeholder="Buscar contato (email/phone)..." />
  <select>Partner (Todos)</select>
  <MultiSelect>Status</MultiSelect>
  <button>Limpar Filtros</button>
</div>

// Mostra: "123 reservas encontradas"
// Suporta paginação ou lazy-load
```

#### Referência Visual em Linha
- [ ] Status badge (cor + texto: "Confirmado", "Check-in", etc)
- [ ] Partner badge com ícone (🤝) se partner_id não null
- [ ] Texto: guest_name em bold
- [ ] Datas em formato DD/MM/YYYY
- [ ] Valor em moeda formatada (R$ 1.234,56)
- [ ] Ações com ícones (✏️ Edit, 🗑️ Delete)

#### Backend
- [ ] Endpoint `GET /api/reservations?property_id=...&from=...&to=...&filters[guest]=...&filters[contact]=...&filters[partner_id]=...&filters[status][]=...`
  - Retorna lista paginada de reservations

#### Paginação/Carregamento
- [ ] Mostrar total de resultados (ex: "123 reservas em 3 páginas")
- [ ] 20 items por página (padrão)
- [ ] Paginação com prev/next e jump to page

---

## 5.3 Especificações de Design - Baseadas em @BKP

### Calendário Grid - Adaptação por Tamanho de Tela

**Layout da Tabela:**
```tsx
// Estrutura mantida do @BKP:
<table class="calendar-table">
  <thead>
    <tr>
      <th class="room-col">Quarto</th>
      {days.map(date => (
        <th colSpan={2} class="day-header">
          <span>{mês (abr)}</span>
          <span>{dia}</span>
        </th>
      ))}
    </tr>
  </thead>
  <tbody>
    {rooms.map(room => (
      <tr>
        <td class="room-col">{room.name}</td>
        {/* 2 cells per day: checkout | checkin */}
      </tr>
    ))}
  </tbody>
</table>
```

**Responsividade por Breakpoint:**

1. **Desktop (> 1024px):**
   - Room col: 120px (sticky)
   - Half-cell: 40px cada
   - Font: 14px normal
   - Dias padrão: 21
   - Máximo: 35 dias
   - Overflow: scroll horizontal se ultrapassar viewport

2. **Tablet (600-1024px):**
   - Room col: 90px (sticky)
   - Half-cell: 35px cada
   - Font: 12px reduzida
   - Dias padrão: 12
   - Máximo: 15 dias
   - Overflow: scroll horizontal

3. **Mobile (< 600px):**
   - Room col: auto (não sticky, row-level)
   - Half-cell: 30px cada
   - Font: 11px reduzida
   - Dias padrão: 7
   - Máximo: 10 dias
   - Overflow: scroll horizontal necessário

**Controle de Número de Dias (Header):**
```tsx
// Input ou Stepper para alterar dias
<input 
  type="number"
  value={visibleDays}
  min={getMinDays()}    // 5 mobile, 10 tablet, 15 desktop
  max={getMaxDays()}    // 10 mobile, 15 tablet, 35 desktop
  onChange={setVisibleDays}
/>

// Atualizar live grid ao mudar
// CSS table: width se ajusta automaticamente
// Garantir que número de dias não quebre layout
```

**Cores e Status (mantidas do @BKP):**
```css
.status-pre-reserva { background: #fbbf24; }      /* Âmbar */
.status-reservado { background: #60a5fa; }        /* Azul */
.status-confirmado { background: #34d399; }       /* Verde */
.status-checked_in { background: #a78bfa; }       /* Roxo */
.status-checked_out { background: #fb923c; }      /* Laranja */
.status-no_show { background: #ef4444; }          /* Vermelho */
.status-cancelado { background: #9ca3af; }        /* Cinza */
.status-blocked { background: #1f2937; color: #fff; } /* Preto */
```

**Interatividade:**
- Clique em célula vazia → criar reserva
- Clique em reserva → editar
- Hover em reserva → popover com (nome, datas, partner badge)
- Scroll horizontal quando necessário
- Touch-friendly half-cells (≥ 30px)

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

## 9. Resumo das Diferenças (ATUALIZADO)

| Item | Pedido | Documentado? | Status Final |
|------|-------|------------|--------------|
| **Calendário com grid** | ✅ | ⚠️ Código antigo existe | ✅ **ESPECIFICADO**: Design baseado no @BKP, responsivo |
| **Cores por status** | ✅ | ⚠️ Parcial | ✅ **ESPECIFICADO**: 8 cores mantidas do @BKP |
| **Navegação intuitiva** | ✅ | ❌ | ✅ **ESPECIFICADO**: Prev/Next + Date input + Day selector |
| **Responsividade 5-35 dias** | ✅ | ❌ | ✅ **ESPECIFICADO**: User pode alterar, ajusta por breakpoint |
| **2 colunas check-in/out** | ✅ | ⚠️ Código prova conceito | ✅ **ESPECIFICADO**: Mantém design do @BKP |
| **Modal de edição** | ✅ | ⚠️ Existe no @BKP | ✅ **A PORTAR**: Refatorar para novos padrões |
| **Página CRUD listagem** | ✅ | ❌ | ✅ **ESPECIFICADO**: Tabela com 9 colunas + ações |
| **Filtro por hóspede** | ✅ | ❌ | ✅ **ESPECIFICADO**: Busca em tempo real (guest_name) |
| **Filtro por contato** | ✅ | ❌ | ✅ **ESPECIFICADO**: Busca em tempo real (email E phone) |
| **Filtro por partner** | ✅ (novo) | ❌ | ✅ **ESPECIFICADO**: Select com todas as opções |
| **Referência visual linha** | ✅ | ❌ | ✅ **ESPECIFICADO**: Status badge + partner badge + cores |

---

## 10. Próximos Passos

1. **Confirmação do usuário**: Validar se as especificações acima cobrem o escopo desejado
2. **Criar ADRs**: Formalizar decisões de UI/UX
3. **Atualizar Documentação**: CONSOLIDATED_REQUIREMENTS.md com seção de Reservas
4. **Iniciar Implementação**: Backend endpoints → Frontend componentes → Testes

