# ADR 0011: Arquitetura do Módulo de Reservas - Calendário e Listagem

## Status
Accepted (2026-02-18) - Especificação finalizada com confirmações do usuário

## Context

O módulo de Reservas é um componente crítico do sistema que permite visualizar, criar, editar e gerenciar reservas de hóspedes. Dois componentes principais foram solicitados:

1. **Calendário Grid**: Visualização interativa por dias/quartos com 2 colunas por dia (check-in/checkout)
2. **Página de Listagem**: CRUD com filtros e referência visual

### Referência Histórica

O frontend antigo (@BKP) continha implementações funciais de ambos os componentes:
- `CalendarGrid.tsx`: Grid com 2 colunas por dia, suporte a reservas multi-dia, bloqueios, status com cores
- `ReservationModal.tsx`: Modal completo com formulário, cálculo de preço, integração com minibar

Ambas as implementações foram validadas em produção anterior e serão portas/refatoradas para o novo frontend.

## Decision

### 1. Calendário de Reservas

#### Design
- **Baseado em**: `@BKP/src/components/Calendar/CalendarGrid.tsx` (prova conceito validada)
- **Estrutura**: Tabela com rows=quartos, cols=dias (2 subcolunas cada)
- **Cada dia**: 
  - Coluna LEFT: "Checkout" (check-out visual)
  - Coluna RIGHT: "Check-in" (check-in visual)
- **Room column**: Sticky (left=0, z-index=3) para scroll horizontal

#### Responsividade Adaptativa
```
Mobile (< 600px):
- Dias padrão: 7 (min: 5, max: 10)
- Room col: auto (não sticky)
- Half-cell: 30px
- Font: 11px

Tablet (600-1024px):
- Dias padrão: 12 (min: 10, max: 15)
- Room col: 90px (sticky)
- Half-cell: 35px
- Font: 12px

Desktop (> 1024px):
- Dias padrão: 21 (min: 15, max: 35)
- Room col: 120px (sticky)
- Half-cell: 40px
- Font: 14px

Overflow: scroll horizontal quando necessário
```

#### Controle de Dias
- Input numérico em header para alterar visível days
- Respeitará min/max conforme breakpoint atual
- Grid atualiza em tempo real
- Valor persistido em localStorage (opcional)

#### Status e Cores
Mantidas do @BKP (8 statuses):
```css
pre-reserva:    #fbbf24 (Âmbar)
reservado:      #60a5fa (Azul)
confirmado:     #34d399 (Verde)
checked_in:     #a78bfa (Roxo)
checked_out:    #fb923c (Laranja)
no_show:        #ef4444 (Vermelho)
cancelado:      #9ca3af (Cinza)
blocked:        #1f2937 (Preto) com 🔒 icon
```

#### Interatividade
- **Clique célula vazia**: Abre modal para criar reserva
- **Clique reserva**: Abre modal para editar
- **Clique bloqueio**: Abre modal para editar bloqueio
- **Hover reserva**: Popover com nome, datas, partner badge

#### Header Controls
- Botões Prev/Next ou Date input para navegação
- Número de dias input (respeitando min/max)
- Texto: "Mês YYYY" ou "DD/MM - DD/MM"
- Indicador de overflow: "📊 Scroll horizontal"

#### Dados
```typescript
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
  adults_count: number
  children_count: number
  infants_count: number
  start_date: string     // YYYY-MM-DD
  end_date: string       // YYYY-MM-DD
  status: ReservationStatus
  total_value?: number
  notes?: string
  partner_id?: string | null
  partner_name?: string | null
  price_override?: number | null
  email?: string
  phone?: string
}
```

---

### 2. Página de Listagem de Reservas

#### Layout
- Filtros em header (barra horizontal ou collapsível em mobile)
- Tabela com 9 colunas abaixo dos filtros
- Paginação em footer (20 items/página)

#### Colunas da Tabela
1. **Quarto** (Room name) - sortável
2. **Hóspede** (Guest name) - bold, sortável
3. **Check-in** (start_date: DD/MM/YYYY) - sortável
4. **Check-out** (end_date: DD/MM/YYYY) - sortável
5. **Status** (Badge colorido - cores iguais ao calendário) - sortável
6. **Contato** (Email + Phone) - tooltip ao hover
7. **Partner** (🤝 badge se houver)
8. **Valor** (total_value formatado como R$ 1.234,56) - sortável
9. **Ações** (Edit icon + Delete icon com confirmação)

#### Filtros (Simples e Úteis)
1. **Período**: Dropdown mês/ano (mês atual como padrão)
   - Determina `from` e `to` dates
   
2. **Hóspede**: Input text busca em tempo real
   - Busca em `guest_name`
   - Filtra enquanto digita (debounce 300ms)

3. **Contato**: Input text busca em tempo real
   - Busca em `email` E `phone`
   - Suporta parcial match

4. **Partner**: Select dropdown
   - Opção "Todos" (padrão) ou null
   - Lista de partners com count

5. **Status**: Multi-select/checkboxes
   - 8 opcões (cores iguais ao calendário)
   - Checkbox toggles

6. **Botão "Limpar Filtros"**: Reset all filters

#### Referência Visual em Linha
- **Nome hóspede**: Bold + clickável (abre modal edit)
- **Status**: Badge com cor + texto (ex: "✓ Confirmado")
- **Partner**: 🤝 badge se `partner_id` não null
- **Contato**: Ícone 📧 + ☎️ com tooltip (email/phone)
- **Valor**: Cor verde se payment_status=paid, laranja se partially_paid, cinza se open
- **Ações**: ✏️ Edit, 🗑️ Delete (com modal de confirmação)

#### Comportamento
- Mostra: "123 reservas encontradas" em tempo real
- Atualiza tabela ao mudar filtro
- Suporta paginação (20 items/página)
- Sort por colunas (click no header)

#### Backend
```
GET /api/reservations
  ?property_id={uuid}
  &from=2026-02-01
  &to=2026-02-28
  &search[guest]={string}
  &search[contact]={string}
  &search[partner_id]={uuid|null}
  &search[status][]={status}
  &sort={column}
  &order={asc|desc}
  &page=1
  &per_page=20

Response:
{
  data: Reservation[],
  total: number,
  per_page: number,
  current_page: number,
  last_page: number,
  from: number,
  to: number
}
```

---

## Consequences

### Positivos
- ✅ **Reutilização**: CalendarGrid + ReservationModal já existem e foram validadas
- ✅ **Consistência**: UI mantém padrão do frontend antigo (validado com usuários)
- ✅ **Responsividade**: Adaptação automática a qualquer tamanho de tela
- ✅ **Usabilidade**: Filtros simples mas poderosos (sem overwhelm)
- ✅ **Performance**: Grid com scroll horizontal não precisa renderizar todos os dias

### Negativos/Mitigation
- ⚠️ **Complexidade do Grid**: Table com colspan calculado é complexo
  - **Mitigação**: Copiar lógica testada do @BKP, adicionar testes cobrindo edge cases
- ⚠️ **Muitos filtros**: 5 filtros podem ficar lotados em mobile
  - **Mitigação**: Usar collapsível ou sticky header, priorizar filtros mais usados

---

## Implementation Details

### Fase 1: Tipos e Modelos
- Criar `frontend/src/models/reservation.ts` com types
- Enum `ReservationStatus` com 8 valores
- Type `Reservation` com dados completos (email, phone)

### Fase 2: Serviços
- `frontend/src/services/reservations.ts`: 
  - `listReservations(filters)` → chamada paginada
  - `getReservation(id)` → detalhes
  - `createReservation(data)` → nova
  - `updateReservation(id, data)` → editar
  - `deleteReservation(id)` → deletar
- `frontend/src/services/calendar.ts`:
  - `getCalendar(propertyId, start, end)` → rooms com reservas

### Fase 3: Componentes
- `frontend/src/components/Shared/ReservationStatusBadge.tsx`
- `frontend/src/components/Calendar/CalendarGrid.tsx` (portado do @BKP)
- `frontend/src/components/Calendar/CalendarHeader.tsx` (controles: nav, dia selector)
- `frontend/src/components/Reservation/ReservationModal.tsx` (portado do @BKP)
- `frontend/src/components/Reservations/ReservationFilters.tsx` (5 filtros)
- `frontend/src/components/Reservations/ReservationTable.tsx` (tabela com 9 colunas)

### Fase 4: Páginas
- `frontend/src/pages/Reservations/CalendarPage.tsx`
- `frontend/src/pages/Reservations/ListPage.tsx`
- Router config em `AppRoutes.tsx`

### Fase 5: I18n
- Chaves em `public/locales/{pt-BR,en,es,fr}/common.json`:
  - `reservations.calendar.*`
  - `reservations.list.*`
  - `reservations.modal.*`
  - Status labels (8)
  - Filter labels (5)

### Fase 6: Testes
- `CalendarGrid.test.tsx`: renderização, colSpan, click handlers
- `ReservationModal.test.tsx`: form validation, price calc
- `ReservationTable.test.tsx`: sorting, filtering, pagination
- `CalendarPage.flow.test.tsx`: E2E do fluxo completo

---

## References

- **RESERVATIONS_MODULE_SPEC.md**: Especificação completa
- **@BKP/src/components/Calendar/CalendarGrid.tsx**: Prova conceito
- **@BKP/src/components/Reservation/ReservationModal.tsx**: Prova conceito
- **backend/src/app/Services/CalendarService.php**: Service existente
- **CONSOLIDATED_REQUIREMENTS.md**: Regras de negócio

---

## Checklist de Implementação

- [ ] ADR aprovada
- [ ] Tipos criados (Reservation, ReservationStatus)
- [ ] Backend endpoints validados
- [ ] CalendarGrid portado e testado
- [ ] ReservationModal portado e testado
- [ ] Página de calendário funcional
- [ ] Página de listagem com filtros
- [ ] I18n 4 idiomas
- [ ] Testes coverage ≥ 90%
- [ ] UI/UX review com usuários
- [ ] Release notes atualizado
- [ ] PR criada e aprovada

