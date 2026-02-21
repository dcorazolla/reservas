# Análise: Cenários de Reservas + Financeiro (FNRH)

## 1. CENÁRIOS DE RESERVAS - COBERTURA COMPLETA

### 1.1 Lifecycle Completo de Reservas (Hoje)

**Estados (8 total):**
```
pré-reserva → reservado → confirmado → checked_in → checked_out ✅
                                      ↓
                                   check_in → check_out ✅
           ↓
        cancelado (qualquer ponto)
           ↓
        no_show (se checked_in não foi feito)
           ↓
        blocked (quartos bloqueados manutenção)
```

**Status Transitions Implementados (ReservationModal.tsx):**
- ✅ Pré-reserva → Reservado (implicit via CREATE)
- ✅ Reservado → Confirmado (button: "Confirmar")
- ✅ Reservado → Check-in (button: "Check-in")
- ✅ Confirmado → Check-in (button: "Check-in")
- ✅ Check-in → Check-out (button: "Check-out")
- ✅ Qualquer → Cancelado (button: "Cancelar")
- ⚠️ **MISSING:** No-show (operador marca quando hóspede não aparece)
- ⚠️ **MISSING:** Finalize (após check-out, fechar reserva)

### 1.2 Cenários de Reservas QUE TEMOS

| Cenário | Status | Descrição | Fluxo |
|---------|--------|-----------|-------|
| Criação simples | ✅ | Nome + datas + quarto | CREATE → pré-reserva |
| Confirmação | ✅ | Operador confirma antes checkin | reservado → confirmado |
| Check-in standard | ✅ | Operador faz check-in | confirmado → checked_in |
| Check-out standard | ✅ | Operador faz check-out | checked_in → checked_out |
| Cancelamento | ✅ | Cancelar de qualquer estado | X → cancelado |
| Edição de preço | ✅ | Override de preço com auditoria | UPDATE → FinancialAuditLog |
| Minibar | ✅ | Adicionar consumo frigobar | MinibarConsumption table |

### 1.3 CENÁRIOS FALTANDO 🚨

| Cenário | Impacto | Descrição |
|---------|--------|-----------|
| **No-show** | ALTO | Hóspede não apareceu. Precisa status especial, talvez penalidade |
| **Early departure** | ALTO | Hóspede saiu antes da data prevista. Ajustar preço, invoice, FNRH |
| **Early check-in** | MÉDIO | Hóspede chegou antes (quartos disponíveis). Sistema permite? |
| **Late check-out** | MÉDIO | Hóspede pediu estender. Valida disp? Cobra taxa? |
| **Room change** | MÉDIO | Hóspede quer trocar de quarto mid-stay |
| **Partial cancellation** | MÉDIO | Group booking, cancelar alguns hóspedes |
| **Price recalc on edit** | MÉDIO | Alterar datas → recalc preço → update invoice |
| **Guest modifications** | ALTO | **NOVO COM FNRH**: Após check-in, corrigir dados guest (nome typo, doc errado) |
| **Finalize** | MÉDIO | Fechar reserva após check-out (unlock guest data) |

---

## 2. CENÁRIOS FINANCEIROS - COBERTURA INCOMPLETA 🚨

### 2.1 Fluxo Financeiro Hoje (Backend)

**Endpoints existentes:**
- ✅ `POST /reservations` - Cria reserva + invoice auto
- ✅ `PUT /reservations/{id}` - Edita preço → gera NOVO invoice (draft)
- ✅ `POST /reservations/{id}/confirm` - Confirma reserva
- ✅ `POST /reservations/{id}/checkin` - Check-in
- ✅ `POST /reservations/{id}/checkout` - Check-out
- ✅ `POST /reservations/{id}/cancel` - Cancelar (NO REFUND LOGIC!)
- ✅ `POST /reservations/{id}/finalize` - Finaliza (bloqueia edições)

**Audit Logging:**
- ✅ `FinancialAuditLog` - registra todo evento financeiro
- ✅ Events: created, confirmed, price_overridden, invoice_creation_failed, minibar_invoice_created, cancelled, finalized

### 2.2 Fatos Financeiros HOJE

```php
// Quando cria reserva
CREATE Invoice (draft) → FinancialAuditLog(created)

// Quando edita preço
UPDATE Reservation.total_value
CREATE Invoice (draft) → FinancialAuditLog(price_overridden)

// Quando minibar
CREATE MinibarConsumption
CREATE Invoice (draft, minibar only) → FinancialAuditLog(minibar_invoice_created)

// Cancelamento
UPDATE Reservation.status = 'cancelado'
NO invoice update / NO refund logic
→ FinancialAuditLog(cancelled)
```

### 2.3 GAPS FINANCEIROS CRÍTICOS 🚨

| Gap | Impacto | Detalhes |
|-----|--------|----------|
| **Refund Policy** | CRÍTICO | Cancelar reserva não calcula reembolso (depende de cancelamento timing) |
| **Partial Refund** | CRÍTICO | Se cancelado X dias antes, quanto reembolsa? ZERO lógica hoje |
| **Early Departure** | CRÍTICO | Hóspede sai 2 dias antes → recalc invoice (desce valor) ou cobra anyway? |
| **Late Checkout** | MÉDIO | Prorrogar quarto por 2h → taxa extra? Sistema não suporta |
| **Room Change** | MÉDIO | Trocar quarto mid-stay → recalc preço (suite → standard ou vice) |
| **Payment Status** | MÉDIO | Reservation.payment_status existe mas NUNCA é atualizado |
| **Guarantee Type** | MÉDIO | Existe mas NÃO é usado para anything (vale nada) |
| **Multi-line Invoice** | MÉDIO | Pode ter booking + minibar na mesma invoice? Hoje são invoices separadas |
| **Invoice Finalization** | MÉDIO | Como bloqueia edições APÓS fatura enviada? Sem lógica hoje |
| **Tax Calculation** | BAIXO | Nenhuma tax, fee, service charge em reservas |

---

## 3. IMPACTO FNRH NOS CENÁRIOS

### 3.1 Pontos de Trigger FNRH

**Quando FNRH é chamado:**

| Evento | Síncrono | Backend Hoje | Com FNRH |
|--------|----------|------------|----------|
| Check-in | ✅ | Permite | Outbox enqueue |
| Check-out | ✅ | Permite | Outbox enqueue |
| Cancelamento | ✅ | Permite | Outbox enqueue (delete) |
| Early departure | ❌ | Sem suporte | Outbox enqueue (early) |
| Guest mod | ❌ | Sem suporte | Outbox enqueue (update) |
| Finalize | ✅ | Sem suporte | Outbox enqueue (finalize) |

### 3.2 Cenários Que QUEBRAM Com FNRH Offline

**Hoje (sem FNRH):**
```
Check-in: ✅ Funciona 100%
Check-out: ✅ Funciona 100%
Cancelamento: ✅ Funciona 100%
```

**Com FNRH Async (Outbox):**
```
Check-in: ✅ Funciona 100% (local) + async enqueue para FNRH
Check-out: ✅ Funciona 100% (local) + async enqueue para FNRH
Cancelamento: ✅ Funciona 100% (local) + async enqueue (delete FNRH)
Early departure: ⚠️ NOVO - Precisa lógica local de recalc + enqueue
Guest modification: ⚠️ NOVO - Precisa permitir edição post-checkin (se não finalizado)
```

---

## 4. WHAT WE'RE MISSING - AÇÕES

### 4.1 Reservas - Cenários Faltando

**Priority 1 (Critical):**
- [ ] **Early Departure** - Recalc preço, update invoice, enqueue FNRH
- [ ] **Guest Modification** - Permitir edição post-check-in (nome typo, doc erro), enqueue FNRH
- [ ] **No-show** - Novo status, possível penalidade, update invoice

**Priority 2 (Important):**
- [ ] **Finalize** - Estado final após check-out, bloqueia edições
- [ ] **Room Change** - Mid-stay room switch, recalc preço
- [ ] **Price Recalc on Edit** - Alterar datas → invoice auto-update

**Priority 3 (Nice-to-have):**
- [ ] **Late Check-out** - 2h extension com taxa
- [ ] **Partial Cancellation** - Group bookings

### 4.2 Financeiro - Cenários Faltando

**Priority 1 (Critical):**
- [ ] **Refund Policy** - Regra de % baseada em timing cancelamento
- [ ] **Early Departure Recalc** - Reduz valor, gera credit/refund
- [ ] **Multi-line Invoice** - Booking + minibar + extras na mesma nota

**Priority 2 (Important):**
- [ ] **Payment Status Auto-update** - Sync com invoice payment tracking
- [ ] **Tax/Fee Calculation** - Se applicable
- [ ] **Invoice Finalization Lock** - Após enviada, não pode editar

**Priority 3 (Nice-to-have):**
- [ ] **Late Checkout Billing** - Taxa extra pré-configurada
- [ ] **Guarantee Enforcement** - Usar guarantee_type para regras

---

## 5. IMPACTO NO PLANO FNRH

### 5.1 What We DON'T Need To Add (Already in Plan)

```
✅ Core Reservas (check-in/checkout/cancelamento)
✅ Guest Data Minimal (pré-check-in: nome+CPF)
✅ Async Outbox (não bloqueia)
✅ Audit Logging (append-only)
```

### 5.2 What We NEED To Add to Plan

**Backend Additions:**

1. **ReservationService (nova)**
   - `markNoShow(id)` - No-show status
   - `recordEarlyDeparture(id, checkout_date)` - Recalc + update invoice
   - `allowGuestModification(id)` - Unlock guest data edição post-check-in
   - `finalize(id)` - Lock reserva final

2. **PricingService (update)**
   - `calculateRefund(reservation, cancellation_date)` - % baseado em timing
   - `recalculateForEarlyDeparture(id, early_date)` - Nova invoice line
   - `recalculateForDateChange(id, new_dates)` - Preço ajustado

3. **InvoiceService (update)**
   - `consolidateLines(reservation)` - Booking + minibar + extras = 1 invoice
   - `lockAfterSend(id)` - Bloqueia edições pós-envio

4. **Migrations (new)**
   - `reservation_refund_policies` - % por dias antes
   - Update `reservation_state_changes` com `finalized_at`

**Frontend Additions:**

1. **ReservationModal (extend)**
   - Button: "Marcar como No-show" (se checked_in)
   - Button: "Saída antecipada" (recalc + confirm)
   - Button: "Editar dados" (se not finalized, post check-in)
   - Validação: Bloqueia edição se finalized

2. **FinancialSummary (nova componente)**
   - Mostra: Preço original, ajustes, subtotal, impostos, TOTAL
   - Se early departure: "Crédito: -R$ XX"
   - Se refund policy: "Reembolso: R$ XX (60% de cancelamento)"

---

## 6. RECOMMENDED ROADMAP ADJUSTMENT

**Current Plan (3 fases):**
```
Fase 1: Reservas Core (pré-check-in + check-in + checkout)
Fase 2: FNRH Outbox (async, monitoring)
Fase 3: Polish (error handling, docs)
```

**Recommended (5 fases):**
```
Fase 1: Reservas Core
  ✅ Check-in/checkout/cancel com Guest minimal
  ✅ Basic invoice auto-creation

Fase 2: Reservas Extended (BEFORE FNRH)
  ⚠️ Early departure + refund calc
  ⚠️ Guest modification (post-check-in)
  ⚠️ No-show + finalize
  ⚠️ Price recalc on edit

Fase 3: Financial Audit Complete
  ⚠️ Multi-line invoice consolidation
  ⚠️ Payment status auto-tracking
  ⚠️ Refund policy engine

Fase 4: FNRH Outbox (THEN async)
  ✅ Async queue com extended scenarios
  ✅ Enqueue early-departure, no-show, guest-mod

Fase 5: Polish
  ✅ Monitoring, error recovery, docs
```

**Razão:** FNRH precisa de scenarios financeiros completos para sincronizar corretamente. Se implementarmos FNRH NOW sem early-departure/refund/guest-mod, teremos de reescrever depois.

---

## 7. SUMMARY TABLE: Coverage Today vs Needed

| Cenário | Hoje | Fase 1 (Plan) | Fase 2 (Needed) | Fase 4 (FNRH) |
|---------|------|---------------|-----------------|---------------|
| Pre-check-in | ❌ | ✅ | ✅ | N/A |
| Check-in | ❌ | ✅ | ✅ | ✅ (sync) |
| Check-out | ❌ | ✅ | ✅ | ✅ (sync) |
| Cancelamento | ✅ | ✅ | ✅ | ✅ (sync) |
| **Early departure** | ❌ | ❌ | **✅ NEW** | ✅ (sync) |
| **Guest modification** | ❌ | ❌ | **✅ NEW** | ✅ (sync) |
| **No-show** | ❌ | ❌ | **✅ NEW** | ❌ (N/A) |
| **Finalize** | ❌ | ❌ | **✅ NEW** | ✅ (lock) |
| Invoice auto | ✅ | ✅ | ✅ (extended) | N/A |
| Refund calc | ❌ | ❌ | **✅ NEW** | ✅ (enqueue) |
| Price recalc edit | ❌ | ❌ | **✅ NEW** | N/A |
| Multi-line invoice | ❌ | ❌ | **✅ NEW** | N/A |
