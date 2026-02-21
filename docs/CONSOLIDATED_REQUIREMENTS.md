# Regras de Negócio e Requisitos Consolidados

Este arquivo reúne as regras de negócio, requisitos funcionais e não-funcionais, e orientações operacionais extraídas de `docs/AGENT_CONTEXT/RULES_AND_REQUIREMENTS.md`, `docs/requirements/*` e ADRs relevantes.

## 1) Visão geral do domínio
- O sistema gerencia: propriedades, quartos, reservas, partners, invoices e pagamentos.
- Objetivo: permitir geração de faturas por partner/property, registro de pagamentos (parciais e totais), export (PDF/CSV) e envio por e‑mail com trilha imutável de auditoria financeira.

## 2) Regras de negócio críticas
- Auditoria financeira (obrigatória): qualquer ação que altere valores financeiros (criar invoice, registrar payment, alocar pagamento, enviar invoice) deve gerar entradas em `financial_audit_logs` (append-only).
- Logs append-only: correções representadas por eventos compensadores; não editar entradas históricas.
- Numerador de invoices: `invoice_counters` por property/ano (formato a ser definido em ADR).
- Partners: parceiros podem agrupar reservas de múltiplas propriedades; invoices são geradas por property/period/partner.
- Pagamentos: suportar pagamentos parciais com alocação por `invoice_line_payments`; status calculado (`open`, `partially_paid`, `paid`).

## 3) Requisitos funcionais prioritários
- CRUD de partners e endpoints de invoice/payment/preview/send/export.
- `POST /api/invoices/preview` → retorna reservas candidatas e valores por linha.
- `POST /api/invoices` → cria invoice + linhas + audit log.
- `POST /api/invoices/{id}/payments` → cria payment e atualiza alocações/estado e audit log.
- `POST /api/invoices/{id}/send` → enfileira job de envio; gera `invoice_communications` e audit log.
- Export e download: endpoints para PDF/CSV de invoices e logs.
- `POST /api/auth/switch-property` → troca propriedade ativa e retorna novo JWT com claim `property_id`.

## 4) Requisitos não-funcionais
- Integridade: `financial_audit_logs` append-only; recomenda-se hash-chaining para tamper-evidence (ADR 0001).
- Testes: obrigatoriedade de executar a suíte localmente antes de push/PR; cobertura mínima para áreas alteradas (meta geral: alta, 95% para domínio financeiro).
- Segurança: nunca comitar credenciais; usar `.env`. Jobs sensíveis em filas e idempotentes.
- Performance: operações de geração/export por jobs (assíncrono) para não bloquear requests.
- Observabilidade: registrar status de jobs, exportar logs e métricas.

## 5) Regras operacionais e de desenvolvimento
- Fluxo Git: `main` como trunk; branches curtas e PRs com CI e revisão humana.
- Antes do PR:
  - Rodar testes (backend + frontend) e gerar cobertura.
    - Observação importante: ao rodar a suíte frontend (`vitest`) em ambientes não-interativos (CI, scripts, runners), execute com a flag `-- --run` (ou `--run`) para forçar execução não-interativa e evitar que o runner entre em modo watch aguardando interação.
      - Ex.: `cd frontend && npm ci && npm run test -- --run --coverage` ou `npm test -- --run --coverage`.
  - Atualizar OpenAPI (`backend/src/public/openapi.yaml`) e coleção Bruno (`docs/collections/reservas`) quando endpoints mudarem.
  - Atualizar `RELEASE_NOTES.md` no pacote afetado (frontend/backend).
- Convenções: backend usa `app/Services/*` para lógica; controllers finos. Frontend: components colocated, i18n obrigatório, a11y e testes.

## 6) Critérios de aceite / QA
- PRs que afetem faturamento/pagamentos devem incluir:
  - Testes unitários cobrindo serviços e edge-cases.
  - Testes de integração comprovando gravação em `financial_audit_logs` na mesma transação.
  - Revisão humana obrigatória.
  - Atualização OpenAPI/collections e `RELEASE_NOTES.md`.

## 7) Artefatos a manter atualizados
- `docs/AGENT_CONTEXT/`, `OVERVIEW.md`, `SETUP.md`, `ARCHITECTURE.md`, `CHECKLIST.md`, `frontend/RELEASE_NOTES.md`, `backend/RELEASE_NOTES.md`, `docs/adr/`.

## 8) Tarifário — cascata de preços

O sistema calcula preços por dia usando uma cascata de prioridade. Para cada dia da estadia, o `ReservationPriceCalculator` busca a tarifa nesta ordem (a primeira encontrada vence):

1. **Room Rate Period** (`room_rate_periods`) — tarifa do quarto para um período específico + people_count.
2. **Category Rate Period** (`room_category_rate_periods`) — tarifa da categoria para um período.
3. **Room Rate base** (`room_rates`) — tarifa base do quarto por `people_count`.
4. **Category Rate base** (`room_category_rates`) — tarifa base da categoria (`base_one_adult`, `base_two_adults`, `additional_adult`, `child_price`).
5. **Property base** (`properties`) — tarifa base da propriedade (mesmos campos da categoria).

Regras complementares:
- Quando a tarifa usa `price_per_day` (room rate / room rate period), o valor já inclui tudo para aquele `people_count`.
- Quando a tarifa usa `base_two_adults` + `additional_adult` (category / property), o cálculo é: `base_two_adults + max(0, adultos-2) × additional_adult + crianças × child_price`.
- Para 1 adulto, usa `base_one_adult` se disponível.
- `child_price` tem fallback: se null, calcula `adult_per_person × child_factor` da propriedade.
- Campos de tarifa são **opcionais** — se não configurados, o sistema cai na próxima camada da cascata automaticamente.
- O endpoint `POST /reservations/calculate` (simplificado) trata `people_count` como adultos (0 crianças). Para cálculo com crianças, usar `POST /reservations/calculate-detailed`.

Flexibilidade por porte:

| Porte | O que configura | Onde |
|---|---|---|
| Pousada pequena | Só a propriedade | `properties.base_two_adults` + `additional_adult` |
| Pousada média | Categorias (Standard, Luxo) | `room_category_rates` |
| Hotel / Rede | Exceções por quarto | `room_rates` (por `people_count`) |
| Alta temporada | Períodos específicos | `room_rate_periods` / `room_category_rate_periods` |

## 9) Requisitos de Reservas - UI e Frontend

### 9.1 Calendário de Reservas (CalendarPage)
- Grid interativo: rows=quartos, cols=dias (2 colunas por dia: checkout|checkin)
- Responsividade adaptativa:
  - Mobile (< 600px): 5-10 dias (padrão 7), half-cell 30px, não sticky room col
  - Tablet (600-1024px): 10-15 dias (padrão 12), half-cell 35px, room col 90px sticky
  - Desktop (> 1024px): 15-35 dias (padrão 21), half-cell 40px, room col 120px sticky
- Controles no header:
  - Botões Prev/Next ou date input para navegação
  - Input numérico para alterar número de dias (respeita min/max por breakpoint)
  - Texto de período (ex: "Fevereiro 2026" ou "01/02 - 28/02")
- 8 status com cores diferenciadas (mantidas do frontend antigo @BKP):
  - pre-reserva (#fbbf24), reservado (#60a5fa), confirmado (#34d399)
  - checked_in (#a78bfa), checked_out (#fb923c), no_show (#ef4444)
  - cancelado (#9ca3af), blocked (#1f2937 com ícone 🔒)
- Interatividade:
  - Clique célula vazia → criar reserva (ReservationModal)
  - Clique reserva → editar (ReservationModal)
  - Clique bloqueio → editar bloqueio (RoomBlockModal)
  - Hover → popover com nome hóspede, datas, partner badge (🤝)
- Design baseado em: `@BKP/src/components/Calendar/CalendarGrid.tsx` (prova conceito validada)

### 9.2 Listagem de Reservas (ListPage)
- Tabela com 9 colunas: Quarto | Hóspede | Check-in | Check-out | Status | Contato | Partner | Valor | Ações
- Status badge com cores iguais ao calendário
- Partner badge (🤝) se partner_id não null
- Contato: email + phone com tooltip ao hover
- Ações: Edit (✏️) + Delete (🗑️) com confirmação
- Filtros intuitivos:
  1. **Período**: Dropdown mês/ano (mês atual padrão) - determina intervalo
  2. **Hóspede**: Input busca real-time em guest_name
  3. **Contato**: Input busca real-time em email E phone
  4. **Partner**: Select com "Todos" ou lista de partners
  5. **Status**: Multi-select (8 opcões com cores)
  6. **Botão "Limpar Filtros"**: Reset all
- Paginação: 20 items/página, mostra total de resultados
- Sorting: Clicável em headers (Quarto, Hóspede, Datas, Status, Valor)
- Exibição: "123 reservas encontradas"

### 9.3 Modal de Edição de Reservas (ReservationModal)
- Mantém implementação do @BKP (refatorada para novos padrões)
- Campos: guest_name, adults_count, children_count, infants_count
- Room select (dropdown)
- Datas: start_date, end_date (inputs date)
- Status select (8 opcões)
- Cálculo automático de preço por dia (via backend)
- Price override manual (opcional)
- Notas de reserva (textarea)
- Partner select (opcional)
- Minibar panel (opcional - consumo adicional)
- Buttons: Save | Cancel | Check-in | Check-out | Confirm | Finalize

### 9.4 Backend Endpoints para Reservas
- `GET /api/calendar` - Retorna calendar grid data
  - Params: `property_id`, `start`, `end`
  - Response: `{ rooms: Room[], start: date, end: date }`
- `GET /api/reservations` - Listagem com paginação e filtros
  - Params: `property_id`, `from`, `to`, `search[guest]`, `search[contact]`, `search[partner_id]`, `search[status][]`, `sort`, `order`, `page`, `per_page`
  - Response: `{ data: Reservation[], total, per_page, current_page, last_page }`
- `POST /api/reservations` - Criar nova reserva
- `GET /api/reservations/{id}` - Detalhes de uma reserva
- `PUT /api/reservations/{id}` - Editar reserva
- `DELETE /api/reservations/{id}` - Deletar reserva
- `POST /api/reservations/{id}/check-in` - Check-in
- `POST /api/reservations/{id}/check-out` - Check-out
- `POST /api/reservations/{id}/confirm` - Confirmar reserva
- `POST /api/reservations/{id}/cancel` - Cancelar reserva
- `POST /api/reservations/calculate-detailed` - Calcular preço com adultos/crianças/infantes

## 10) Requisitos específicos extraídos
- Reservas: CRUD, disponibilidade, overrides de preço auditados.
- Pagamentos: parciais e totais, integração com frigobar, alocações por linha.
- Frigobar: catálogo, lançamentos vinculados a reservas, agrupamento em invoice.

## 11) Requisitos de Navegação e Layout - Frontend

### 11.1 Menu Principal (Sidebar)
**Estrutura de Navegação (consolidada)**:
```
Menu Principal:
├── 🏠 Home (/)
├── 📅 Calendário (/calendar)
│   └── Exibe grid de reservas com status coloridos
│   └── Navegação intuitiva (prev/next mês, seletor de dias 5-35)
│   └── Acesso para criar/editar reservas
├── 📋 Reservas (/reservations)
│   └── CRUD listagem com filtros (hospede, contato, partner, status)
│   └── Paginação, sorting
│   └── Ações: criar, editar, deletar, check-in, check-out, confirmar, cancelar
└── ⚙️ Configurações (menu dropdown)
    ├── 🏢 Propriedades (/settings/properties)
    ├── 🏷️ Categorias de Quartos (/settings/room-categories)
    ├── 🛏️ Quartos (/settings/rooms)
    ├── 👥 Usuários (/settings/users) [placeholder]
    ├── 🤝 Partners (/settings/partners)
    ├── 💰 Tarifas (submenu)
    │   ├── Base (/settings/base-rates)
    │   ├── Por Quarto (/settings/rates/room)
    │   └── Por Período (/settings/rates/period)
    └── 🚫 Bloqueios (/settings/blocks)
        └── CRUD para bloqueios de disponibilidade
        └── Periódico, pontos de interesse, manutenção, limpeza
        └── Integra com calendário para visualização
```

### 11.2 Regras de Navegação

**Home Page (`/`)**:
- Exibir dashboard com resumo geral
- Link destaque para Calendário e Reservas

**Calendário (`/calendar`)**:
- Grid responsivo: 7 dias mobile, 12 dias tablet, 21 dias desktop (user-selectable 5-35)
- 2 colunas por dia (check-in/checkout)
- Cores por status de reserva (8 cores)
- Navegação por mês, visualização de bloqueios
- Integração com bloqueios (exibir como "Indisponível")

**Reservas (`/reservations`)**:
- Tabela/lista com 9+ colunas (ID, hospede, contato, quarto, check-in, check-out, status, partner, ações)
- Filtros: hospede (nome), contato (email+phone), partner, status, data range
- Sorting: por qualquer coluna
- Paginação: 10/20/50 registros por página
- Ações inline: editar, deletar, check-in, check-out, confirmar, cancelar

**Configurações → Bloqueios (`/settings/blocks`)**:
- CRUD de bloqueios de disponibilidade
- Campos: quarto, data inicial, data final, tipo (manutenção, limpeza, private), motivo
- Visualização integrada com calendário (exibir bloqueios como "Indisponível")
- Suporte a bloqueios periódicos (recorrência: diária, semanal, mensal)
- Importância: bloqueios devem **prevenir criação/edição de reservas** nas datas bloqueadas
- Validação: ao criar/editar reserva, validar contra bloqueios ativos

### 11.3 Componentes Compartilhados

**Modal/Form de Bloqueio**:
- Quarto (selector)
- Data inicial (date picker)
- Data final (date picker)
- Tipo (radio: manutenção, limpeza, private, custom)
- Motivo (texto livre)
- Recorrência (opcional: none, daily, weekly, monthly)
- Submit/Cancel

**Modal/Form de Reserva**:
- (Já definido em seção 9, adicionar validação contra bloqueios)

---
Referências originárias: `docs/AGENT_CONTEXT/RULES_AND_REQUIREMENTS.md`, `docs/requirements/*`, `docs/adr/*`.

**Última atualização**: 2026-02-18 - Adicionada seção 9 (Requisitos de Reservas - UI), Seção 11 (Navegação + Bloqueios)

