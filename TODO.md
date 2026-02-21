# Projeto Reservas - Implementação Priorizada

**Data Início:** Fevereiro 20, 2026  
**Roadmap:** 5 Fases em 4 semanas  
**Sequência:** Cancelamento → Reservas Completo → FNRH  

---

## 📊 Status Geral

| Fase | Nome | Semana | Status | Documentação |
|------|------|--------|--------|---------|
| 1 | Políticas de Cancelamento | Sem 1 | ⏳ Not Started | ✅ [CANCELLATION_POLICY_DESIGN.md](docs/CANCELLATION_POLICY_DESIGN.md) |
| 2 | Reservas/Hóspede Completo | Sem 2-2.5 | ⏳ Not Started | ✅ [PRIORITIZED_IMPLEMENTATION_ROADMAP.md](docs/PRIORITIZED_IMPLEMENTATION_ROADMAP.md) |
| 3 | Financeiro Integrado | Sem 2.5-3 | ⏳ Not Started | ✅ [PRIORITIZED_IMPLEMENTATION_ROADMAP.md](docs/PRIORITIZED_IMPLEMENTATION_ROADMAP.md) |
| 4 | Integração FNRH | Sem 3-4 | ⏳ Not Started | ✅ [PRIORITIZED_IMPLEMENTATION_ROADMAP.md](docs/PRIORITIZED_IMPLEMENTATION_ROADMAP.md) |
| 5 | Polish + Docs | Sem 4 | ⏳ Not Started | ✅ [PRIORITIZED_IMPLEMENTATION_ROADMAP.md](docs/PRIORITIZED_IMPLEMENTATION_ROADMAP.md) |

---

## 🎯 Sumário Executivo

**Priorização:** 
1. **FASE 1:** Políticas de Cancelamento (multi-propriedade, 4 tipos)
2. **FASE 2:** Reservas Completo (8 estados, 12 campos guest data, price recalc)
3. **FASE 3:** Financeiro Integrado (consolidação, refund auto, payment status)
4. **FASE 4:** FNRH Integration (Outbox, 6 stages, async, validações gov.br)
5. **FASE 5:** Polish + Docs (performance, error handling, documentação)

**Por que essa ordem:**
- ❌ NÃO começar FNRH sem cancelamento + reservas + financeiro prontos
- ✅ SIM garantir que FNRH terá 6 stages completos e dados corretos
- ✅ SIM cada propriedade tem suas próprias políticas
- ✅ SIM operador controla 100% da jornada

---

## 📋 FASE 1: Políticas de Cancelamento (Semana 1)

**Documentação Completa:** [`docs/CANCELLATION_POLICY_DESIGN.md`](docs/CANCELLATION_POLICY_DESIGN.md)

### ✅ Análise Completa
- [x] Design multi-propriedade validado
- [x] 4 tipos de políticas definidos (fixed_timeline, percentage_cascade, free_until_date, seasonal)
- [x] Service layer spec criada (calculateRefund, processCancel)
- [x] UI/UX spec criada (admin config page, preview modals)
- [x] Integration points identificados

### Backend Tasks - READY TO START

- [ ] **Migration:** `2026_02_20_create_cancellation_policies.php`
  - [ ] Tabela `cancellation_policies` (property_id UNIQUE, type ENUM, config JSON)
  - [ ] Tabela `cancellation_refund_rules` (policy_id, days_before_min/max, refund_percent, label)
  - [ ] Colunas em `reservations`: cancellation_refund_calc, cancellation_reason, cancelled_at

- [ ] **Models**
  - [ ] `CancellationPolicy.php` (relationships: property, rules, createdBy)
  - [ ] `CancellationRefundRule.php` (relationships: policy)

- [ ] **Service: CancellationService**
  - [ ] `calculateRefund(Reservation, ?cancelledAt)` → refund_amount, percent, reason
  - [ ] `processCancel(Reservation, ?reason)` → update status, criar refund invoice, audit

- [ ] **Controller: CancellationPolicyController**
  - [ ] CRUD endpoints (GET list, PUT update, GET templates)
  - [ ] GET `/api/reservations/{id}/preview-cancellation`
  - [ ] POST `/api/reservations/{id}/cancel`

- [ ] **Seeder:** `CancellationPolicySeeder.php`
  - [ ] 4 templates default por propriedade

- [ ] **Tests:** 80%+ coverage

### Frontend Tasks - READY TO START

- [ ] **Models/Services**
  - [ ] `models/cancellationPolicy.ts`
  - [ ] `services/cancellationPolicyService.ts`

- [ ] **Page & Components**
  - [ ] `pages/Config/CancellationPolicyPage.tsx`
  - [ ] Editor com preview (FixedTimeline, PercentageCascade, FreeUntilDate, Seasonal)
  - [ ] ReservationModal: botão "Cancelar Reserva" → preview → confirmação

- [ ] **Translations** (pt-BR, en, es, fr)

- [ ] **Tests:** 80%+ coverage

### Resultado Esperado
✅ Admin configura política por propriedade  
✅ Preview de reembolso antes de cancelar  
✅ Refund automático ao processar cancel  
✅ Auditoria completa  

---

## 📋 FASE 2: Reservas/Hóspede - Fluxo Completo (Semana 2-2.5)

**Documentação Completa:** [`docs/PRIORITIZED_IMPLEMENTATION_ROADMAP.md`](docs/PRIORITIZED_IMPLEMENTATION_ROADMAP.md) - Seção FASE 2

### ✅ Análise Completa
- [x] 8 estados definidos (pre-reserva → confirmed → checked-in → early-departure/checked-out/no-show → finalized)
- [x] 12 campos guest data especificados
- [x] Operações mapeadas (check-in, check-out, early-departure, guest-modification, no-show, finalize, room-change)
- [x] Price recalc spec criada
- [x] State audit spec criada

### Backend Tasks - READY TO START

- [ ] **Database**
  - [ ] Migration: 12 campos guest data em reservations
  - [ ] Migration: estados novos (early-departure, no-show, finalized)
  - [ ] New table: `reservation_state_changes` (auditoria)

- [ ] **Models**
  - [ ] Update `Reservation` model
  - [ ] Create `ReservationStateChange` model

- [ ] **Service: ReservationService**
  - [ ] `checkIn(Reservation, $guestData)` → valida 12 campos, status=checked-in
  - [ ] `checkOut(Reservation)` → status=checked-out
  - [ ] `earlyDeparture(Reservation, $reason)` → early-departure, refund calc
  - [ ] `guestModification(Reservation, $newData)` → unlock, audit changes
  - [ ] `noShow(Reservation)` → no-show, sem refund
  - [ ] `finalize(Reservation)` → finalized, locked=true
  - [ ] Update `priceRecalculation()` → trigger ao editar datas

- [ ] **Service: GuestDataService** (novo)
  - [ ] Validação 12 campos
  - [ ] Transformação/normalizacao

- [ ] **Service: PriceRecalculationService** (novo)
  - [ ] Trigger ao editar start_date/end_date
  - [ ] Calcula delta, cria adjustment invoice

- [ ] **Controller: ReservationController**
  - [ ] POST `/api/reservations/{id}/check-in` (com guest data)
  - [ ] POST `/api/reservations/{id}/check-out`
  - [ ] POST `/api/reservations/{id}/early-departure`
  - [ ] PATCH `/api/reservations/{id}/guest-data`
  - [ ] POST `/api/reservations/{id}/no-show`
  - [ ] POST `/api/reservations/{id}/finalize`
  - [ ] PUT `/api/reservations/{id}` (refactor: recalc se datas mudam)

- [ ] **FormRequests**
  - [ ] `StoreCheckInRequest` (12 campos validados)
  - [ ] Validação de transições de estado

- [ ] **Tests:** 80%+ coverage

### Frontend Tasks - READY TO START

- [ ] **Models/Schemas**
  - [ ] Update `reservation.ts` (12 guest fields, new states)
  - [ ] Update `schemas.ts` (guestDataSchema com 12 campos)

- [ ] **ReservationModal Refactor**
  - [ ] Guest Section (minimal pre-check-in, complete check-in)
  - [ ] Dates Section (com recalc indicator)
  - [ ] Room Section (com opção room-change)
  - [ ] Price Section (com breakdown)
  - [ ] Status Section (transições permitidas)
  - [ ] Contextual Buttons (por estado)

- [ ] **Components**
  - [ ] `GuestDataForm.tsx` (reutilizável, 12 campos)
  - [ ] `EarlyDepartureModal.tsx`
  - [ ] `GuestModificationModal.tsx`
  - [ ] `RoomChangeModal.tsx`
  - [ ] `FinalizeModal.tsx`

- [ ] **Calendar/List**
  - [ ] Status visual (cores por estado)
  - [ ] Indicator se locked (finalized)

- [ ] **Tests:** 80%+ coverage

### Resultado Esperado
✅ Operador controla 100% da jornada  
✅ 8 estados e transições corretas  
✅ Guest data 12 campos capturada  
✅ Preço recalculado automaticamente  
✅ Cada operação auditada  

---

## 📋 FASE 3: Financeiro Integrado (Semana 2.5-3)

**Documentação Completa:** [`docs/PRIORITIZED_IMPLEMENTATION_ROADMAP.md`](docs/PRIORITIZED_IMPLEMENTATION_ROADMAP.md) - Seção FASE 3

### ✅ Análise Completa
- [x] Invoice consolidation spec
- [x] Refund invoice automation
- [x] Payment status auto-calc
- [x] Invoice lock mechanism
- [x] Financial audit approach

### Backend Tasks - READY TO START

- [ ] **Database**
  - [ ] Migration: `lines` JSON, `locked_at` timestamp em invoices

- [ ] **Services**
  - [ ] `InvoiceService` (consolidation, locking)
  - [ ] `PaymentService` (auto-status calc)
  - [ ] `FinancialAuditService` (centralized logging)

- [ ] **Controller: InvoiceController**
  - [ ] Validação: não editar se locked
  - [ ] POST `/api/invoices/{id}/lock`

- [ ] **Tests:** 95%+ coverage (financeiro)

### Frontend Tasks - READY TO START

- [ ] Invoice Display (com linhas consolidadas)
- [ ] Payment Status Visual
- [ ] Lock Indicator

- [ ] **Tests:** 80%+ coverage

### Resultado Esperado
✅ 1 invoice/reserva com N linhas  
✅ Refund automático ao cancelar  
✅ Payment status auto-calced  
✅ Invoices travadas após envio  

---

## 📋 FASE 4: Integração FNRH (Semana 3-4)

**Documentação Completa:** [`docs/PRIORITIZED_IMPLEMENTATION_ROADMAP.md`](docs/PRIORITIZED_IMPLEMENTATION_ROADMAP.md) - Seção FASE 4

### ✅ Análise Completa
- [x] Outbox Pattern spec
- [x] 6 stages mapeados (guest_created, check_in_completed, check_out_completed, early_departure, guest_modified, finalized)
- [x] Async queue design
- [x] Retry logic com exponential backoff
- [x] Gov.br validações identificadas

### Backend Tasks - READY TO START

- [ ] **Database**
  - [ ] Migration: `fnrh_outbox`, `fnrh_sync_logs`

- [ ] **Models**
  - [ ] `FnrhOutbox.php`
  - [ ] `FnrhSyncLog.php`

- [ ] **Service: FnrhSyncService**
  - [ ] `enqueueEvent()` → adiciona ao outbox
  - [ ] `processQueue()` → retry logic
  - [ ] `sendToGovBr()` → HTTP POST
  - [ ] `buildPayload()` → 6 stages

- [ ] **Service: FnrhValidationService**
  - [ ] Validar CPF/CNPJ
  - [ ] Validar guest data

- [ ] **Controller: FnrhAdminController** (monitoring)
  - [ ] GET `/api/admin/fnrh/sync-status`
  - [ ] GET `/api/admin/fnrh/outbox`
  - [ ] GET `/api/admin/fnrh/logs`
  - [ ] POST `/api/admin/fnrh/retry/{id}`

- [ ] **Jobs/Commands**
  - [ ] `ProcessFnrhOutboxJob`
  - [ ] Commands: fnrh:process-outbox, fnrh:status, fnrh:retry

- [ ] **Integration Hooks**
  - [ ] Enqueue events em cada operação de reserva

- [ ] **Tests:** 80%+ coverage

### Frontend Tasks - READY TO START

- [ ] **Admin Dashboard: FnrhMonitoringPage**
  - [ ] Status geral (pending, sent, failed counts)
  - [ ] Lista de eventos com filtros
  - [ ] Detalhes de sync
  - [ ] Retry button

- [ ] **Tests:** 80%+ coverage

### Configuration

- [ ] `.env.example`: FNRH_API_URL, FNRH_API_KEY, FNRH_CNPJ, QUEUE_CONNECTION

### Resultado Esperado
✅ Outbox com 6 stages  
✅ Async queue com retry  
✅ Gov.br validações  
✅ Admin dashboard  
✅ Portaria compliance  

---

## 📋 FASE 5: Polish + Documentação (Semana 4)

**Documentação Completa:** [`docs/PRIORITIZED_IMPLEMENTATION_ROADMAP.md`](docs/PRIORITIZED_IMPLEMENTATION_ROADMAP.md) - Seção FASE 5

### Backend Tasks

- [ ] **Performance**
  - [ ] Índices em: status, property_id, fnrh_outbox.status, cancelled_at
  - [ ] Cache de políticas (5 min TTL)
  - [ ] Eager loading relationships

- [ ] **Error Handling**
  - [ ] Try/catch robustos
  - [ ] Graceful degradation (offline-first)
  - [ ] Notificações admin

- [ ] **Tests**
  - [ ] Coverage report > 80% (95% financeiro)

### Frontend Tasks

- [ ] **Performance**
  - [ ] Code splitting
  - [ ] Lazy loading
  - [ ] Component cache

- [ ] **Error Handling**
  - [ ] Notificações amigáveis
  - [ ] Fallback UIs
  - [ ] Retry buttons

- [ ] **Tests**
  - [ ] Coverage report > 80%
  - [ ] a11y tests

### Documentation

- [ ] **OpenAPI**
  - [ ] Todos endpoints documentados
  - [ ] Exemplos request/response

- [ ] **ADRs**
  - [ ] ADR-CANCELLATION-POLICY.md
  - [ ] ADR-RESERVATION-STATES.md
  - [ ] ADR-FINANCIAL-AUDIT.md
  - [ ] ADR-FNRH-OUTBOX.md

- [ ] **READMEs**
  - [ ] Update `backend/README.md`
  - [ ] Update `frontend/README.md`
  - [ ] Update root `README.md`

- [ ] **Guides**
  - [ ] `docs/OPERATIONS_GUIDE.md`
  - [ ] `docs/FNRH_OPERATIONS_GUIDE.md`
  - [ ] `docs/TROUBLESHOOTING.md`

### Release

- [ ] Frontend version bump
- [ ] Backend version bump
- [ ] Release notes
- [ ] PR

### Resultado Esperado
✅ Performance otimizada  
✅ Error handling robusto  
✅ Documentação completa  
✅ Pronto para produção  

---

## 📚 Documentação de Referência

**LEITURA OBRIGATÓRIA ANTES DE COMEÇAR FASE 1:**

1. [`docs/CANCELLATION_POLICY_DESIGN.md`](docs/CANCELLATION_POLICY_DESIGN.md) - Design completo de políticas
2. [`docs/PRIORITIZED_IMPLEMENTATION_ROADMAP.md`](docs/PRIORITIZED_IMPLEMENTATION_ROADMAP.md) - Detalhes técnicos de todas as 5 fases
3. [`.github/copilot-instructions.md`](.github/copilot-instructions.md) - Padrões do projeto
4. [`docs/CONSOLIDATED_REQUIREMENTS.md`](docs/CONSOLIDATED_REQUIREMENTS.md) - Business rules

**ANÁLISE ANTERIOR (Contexto):**

- `docs/FNRH_SCENARIOS_ANALYSIS.md` - 11 cenários descobertos
- `docs/ANALYSIS_COMPLETE.md` - Análise executiva
- `docs/FASE_2_IMPLEMENTATION_EXAMPLES.md` - Exemplos de código pronto

---

## 🎯 Próximo Passo

**Phase 1 está pronto para implementação!**

Documentação Completa:
- ✅ Design (CANCELLATION_POLICY_DESIGN.md)
- ✅ Roadmap (PRIORITIZED_IMPLEMENTATION_ROADMAP.md)
- ✅ Tasks (este arquivo)

Começar com:
```bash
1. Criar migration create_cancellation_policies.php
2. Criar models CancellationPolicy, CancellationRefundRule
3. Criar service CancellationService
4. Criar controller CancellationPolicyController
5. Criar seeder com 4 templates
6. Backend tests
7. Frontend models/services/pages/components
8. Frontend tests
9. Translations (4 idiomas)
10. OpenAPI update
```

---

**Status:** 🟢 READY FOR PHASE 1 IMPLEMENTATION  
**Última Atualização:** Fevereiro 20, 2026  
**Roadmap:** 5 Fases em 4 Semanas  
**Priorização:** Cancelamento → Reservas Completo → FNRH

---

## Contact & Issues

- Questions about patterns? Refer to `.github/copilot-instructions.md`
- Uncertain about implementation? Open issue with 2 proposed options
- Pattern violations? Review checklist in this document and copilot-instructions.md

Last Updated: 2026-02-18
