# Roadmap de Implementação Priorizado

**Data:** Fevereiro 20, 2026  
**Priorização:** Cancelamento → Reservas Completo → FNRH  
**Timeline Estimado:** 3-4 semanas

---

## 🎯 Visão Geral

```
┌──────────────────────────────────────────────────────────────────┐
│ FASE 1: POLÍTICAS DE CANCELAMENTO (Semana 1)                     │
├──────────────────────────────────────────────────────────────────┤
│ ✅ Tabelas: cancellation_policies, cancellation_refund_rules     │
│ ✅ Service: CancellationService (calculateRefund)                │
│ ✅ Controller: CancellationPolicyController                      │
│ ✅ UI: /config/cancelamento (admin)                              │
│ ✅ Seeder: 4 templates pré-built                                 │
│ Resultado: Cada propriedade tem política configurável            │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ FASE 2: RESERVAS COMPLETO (Semana 2-2.5)                         │
├──────────────────────────────────────────────────────────────────┤
│ ✅ Status Completos: pre-reserva → confirmed → checked-in →      │
│                     early-departure → checked-out → finalized    │
│                     + no-show, cancelled                         │
│ ✅ Guest Data: Pré-check-in minimal + check-in 12 campos        │
│ ✅ Operações: Check-in, Check-out, Early Departure,             │
│              Guest Modification, Finalize, No-show              │
│ ✅ Price Recalc: Editar datas → recalcula preço                 │
│ ✅ Room Change: Trocar quarto mid-stay                           │
│ ✅ UI: ReservationModal com botões contextuais                   │
│ ✅ Auditoria: Tudo em ReservationStateChanges                    │
│ Resultado: Operador controla 100% da jornada do hóspede         │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ FASE 3: FINANCEIRO INTEGRADO (Semana 2.5-3)                     │
├──────────────────────────────────────────────────────────────────┤
│ ✅ Invoice Consolidation: 1 invoice por reserva (booking+        │
│   minibar + adjustments)                                         │
│ ✅ Refund Invoices: Automáticas ao cancelar/early departure     │
│ ✅ Payment Status: Auto-calc (open→partially_paid→paid)         │
│ ✅ Invoice Lock: Após envio = locked_at timestamp               │
│ ✅ FinancialAuditLog: Rastreamento completo                      │
│ ✅ Multi-property: Políticas financeiras por propriedade         │
│ Resultado: Financeiro 100% síncrono com reserva                 │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ FASE 4: INTEGRAÇÃO FNRH (Semana 3-4)                            │
├──────────────────────────────────────────────────────────────────┤
│ ✅ Outbox Pattern: fnrh_outbox + fnrh_sync_logs                 │
│ ✅ 6 Stages: guest_created, check_in_completed,                 │
│             check_out_completed, early_departure,               │
│             guest_modified, finalized                           │
│ ✅ Async Queue: Redis/Database backed                           │
│ ✅ Validações: CNPJ, CPF, dados obrigatórios                    │
│ ✅ Retry Logic: Exponential backoff                              │
│ ✅ Monitoring: Dashboard de sync status                         │
│ ✅ Gov.br Integration: Portaria compliance                       │
│ Resultado: FNRH recebe dados corretos, completos, auditados     │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ FASE 5: POLISH + DOCUMENTAÇÃO (Semana 4)                        │
├──────────────────────────────────────────────────────────────────┤
│ ✅ Error Handling: Graceful degradation                         │
│ ✅ Performance: Index optimization, caching                      │
│ ✅ OpenAPI: Documentação completa                                │
│ ✅ ADRs: Decisões técnicas registradas                          │
│ ✅ Testes: Coverage > 80%                                        │
│ ✅ README: Guia de operação                                      │
│ Resultado: Pronto para produção                                 │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📋 FASE 1: Políticas de Cancelamento

### 1.1 Backend

**Arquivos a Criar:**

```
backend/src/
├── database/migrations/
│   └── 2026_02_20_create_cancellation_policies.php
├── app/Models/
│   ├── CancellationPolicy.php
│   └── CancellationRefundRule.php
├── app/Services/
│   └── CancellationService.php
├── app/Http/Controllers/
│   └── CancellationPolicyController.php
├── database/seeders/
│   └── CancellationPolicySeeder.php
└── tests/Feature/
    ├── CancellationPolicyTest.php
    └── CancellationServiceTest.php
```

**Especificação Técnica:**

| Componente | O Que Fazer | Dependências |
|-----------|-----------|-------------|
| Migration | Criar 2 tabelas (policies + rules) + colunas em reservations | Property model |
| Models | CancellationPolicy, CancellationRefundRule com relationships | - |
| Service | calculateRefund(), processCancel() | CancellationPolicy model |
| Controller | CRUD de políticas, endpoints calculate/cancel | Service |
| Seeder | 4 templates: fixed_timeline, percentage_cascade, free_until_date, seasonal | Models |
| Tests | Validar cálculos de refund, processamento de cancel | Service + Controller |

### 1.2 Frontend

**Arquivos a Criar:**

```
frontend/src/
├── pages/Config/
│   ├── CancellationPolicyPage.tsx
│   └── CancellationPolicyPage.test.tsx
├── components/Config/
│   ├── PolicyEditor.tsx
│   ├── PolicyPreview.tsx
│   ├── FixedTimelineEditor.tsx
│   ├── PercentageCascadeEditor.tsx
│   ├── FreeUntilDateEditor.tsx
│   └── SeasonalEditor.tsx
├── models/
│   └── cancellationPolicy.ts
├── services/
│   └── cancellationPolicyService.ts
└── public/locales/
    ├── pt-BR/common.json (update)
    ├── en/common.json (update)
    ├── es/common.json (update)
    └── fr/common.json (update)
```

**Rotas a Adicionar:**

```
GET    /config/cancelamento              (listar/editar política)
GET    /api/properties/{id}/cancel-policy
PUT    /api/properties/{id}/cancel-policy
GET    /api/cancel-policy-templates      (listar 4 templates)
```

### 1.3 Tipos de Políticas Implementadas

```json
{
  "fixed_timeline": {
    "description": "Cascata simples com dias de antecedência",
    "use_case": "Pousadas rurais, pequenos hotéis",
    "default_tiers": [
      { "days_before": 7, "refund_percent": 100 },
      { "days_before": 3, "refund_percent": 50 },
      { "days_before": 0, "refund_percent": 0 }
    ]
  },
  
  "percentage_cascade": {
    "description": "Cascata com penalidades específicas",
    "use_case": "Hotéis resort, propriedades premium",
    "default_rules": [
      { "days_min": 21, "refund": 100, "penalty": 0 },
      { "days_min": 14, "refund": 75, "penalty": 25 },
      { "days_min": 7, "refund": 50, "penalty": 50 },
      { "days_min": 0, "refund": 0, "penalty": 100 }
    ]
  },
  
  "free_until_date": {
    "description": "Cancelamento livre até N dias antes check-in",
    "use_case": "Aluguel temporário",
    "config": {
      "free_until_days": 10,
      "after_penalty": 50
    }
  },
  
  "seasonal": {
    "description": "Políticas diferentes por temporada",
    "use_case": "Resorts de praia, chalés de montanha",
    "seasons": [
      { "name": "Alta", "months": [12,1,2], "refund": 0 },
      { "name": "Baixa", "months": [6,7,8], "refund": 100 }
    ]
  }
}
```

### 1.4 Endpoints CRUD

```bash
# Buscar política da propriedade
GET /api/properties/{property_id}/cancellation-policy
# Response: { id, name, type, rules: [...], config }

# Atualizar política
PUT /api/properties/{property_id}/cancellation-policy
# Body: { name, type, rules: [...], config }

# Listar templates pré-built
GET /api/cancellation-policy-templates
# Response: [{ id, name, type, description, default_rules }]

# Preview de reembolso (sem processar)
GET /api/reservations/{reservation_id}/preview-cancellation
# Response: { refund_amount, refund_percent, retained_amount, reason }

# Processar cancelamento
POST /api/reservations/{reservation_id}/cancel
# Body: { reason: "string" }
# Response: { status: 'cancelled', refund_amount, message }
```

### 1.5 Resultado Esperado

✅ Admin de propriedade acessa `/config/cancelamento`  
✅ Escolhe entre 4 tipos de política  
✅ Editor visual mostra preview em tempo real  
✅ Salva configuração por propriedade  
✅ Ao cancelar reserva: preview mostra reembolso  
✅ Operador confirma e sistema processa refund  

---

## 📋 FASE 2: Reservas/Hóspede - Fluxo Completo

### 2.1 Estados & Transições

```
Pre-reserva (criada, dados mínimos)
    ├─ [confirmar] → Confirmada (ainda sem hóspede no local)
    │   ├─ [check-in] → Checked-in (hóspede no local, guest data completa)
    │   │   ├─ [check-out] → Checked-out (hóspede saiu no horário)
    │   │   │   └─ [finalize] → Finalized (fechado, pronto pra FNRH)
    │   │   ├─ [early-departure] → Early-departure (saiu antes)
    │   │   │   └─ [finalize] → Finalized
    │   │   └─ [no-show] → No-show (marcou mas não veio)
    │   │       └─ [finalize] → Finalized
    │   └─ [cancel] → Cancelled (refund aplicado)
    └─ [cancel] → Cancelled (sem penalidade)
```

**Estados Novos:**
- `checked-in` (novo, diferente de hoje)
- `early-departure` (novo)
- `no-show` (novo)
- `finalized` (novo, lock total)

### 2.2 Guest Data Model

**Pré-Check-in (Minimal):**
```json
{
  "guest_name": "João Silva",
  "guest_cpf": "123.456.789-00"
}
```

**Check-in (Completo - 12 Campos):**
```json
{
  "guest_name": "João Silva",
  "guest_cpf": "123.456.789-00",
  "guest_email": "joao@email.com",
  "guest_phone": "+55 11 98765-4321",
  "guest_rg": "12.345.678-9",
  "guest_birthdate": "1985-05-15",
  "guest_nationality": "Brasileira",
  "guest_address": "Rua das Flores, 123",
  "guest_city": "São Paulo",
  "guest_state": "SP",
  "guest_zip": "01234-567",
  "number_of_adults": 2,
  "number_of_children": 1,
  "number_of_infants": 0,
  "additional_notes": "Sem alérgias"
}
```

### 2.3 Operações Principais

| Operação | Input | Output | Auditoria |
|----------|-------|--------|-----------|
| **check-in** | guest_data (12 campos) | Reservation status=checked-in | ReservationStateChanges |
| **check-out** | (sem input) | status=checked-out | ReservationStateChanges |
| **early-departure** | reason | status=early-departure, refund_calc | ReservationStateChanges + FinancialAuditLog |
| **guest-modification** | updated guest_data | Unlock form, audit changes | ReservationStateChanges (tracking de mudanças) |
| **no-show** | (sem input) | status=no-show, sem refund | ReservationStateChanges |
| **finalize** | (sem input) | status=finalized, locked=true | ReservationStateChanges, ready for FNRH |

### 2.4 Price Recalculation

**Trigger:** Ao editar `start_date` ou `end_date` de uma reserva confirmada

```php
// Fluxo
1. Validar que checkout ainda não ocorreu
2. Calcular novo preço com nova cascata
3. Se preço mudou:
   - Criar adjustment invoice (delta positivo/negativo)
   - Atualizar total_value da reserva
   - Log em FinancialAuditLog: "Price adjusted due to date change"
4. Se preço desceu:
   - Considerar refund automático? (configurável por propriedade)
```

### 2.5 Room Change (Mid-Stay)

**Trigger:** Operador quer trocar quarto durante hospedagem

```php
// Fluxo
1. Validar disponibilidade do novo quarto para período restante
2. Se preço diferente:
   - Calcular novo preço do quarto para dias restantes
   - Criar adjustment invoice
3. Atualizar room_id da reserva
4. Log: ReservationStateChanges
```

### 2.6 Backend - Arquivos a Criar

```
backend/src/
├── database/migrations/
│   ├── 2026_02_20_add_complete_guest_data.php (12 campos)
│   └── 2026_02_20_add_reservation_states.php (finalized, early-departure, etc)
├── app/Models/
│   └── ReservationStateChange.php (nova, rastreia transitions)
├── app/Services/
│   ├── ReservationService.php (refactor)
│   ├── GuestDataService.php (novo)
│   └── PriceRecalculationService.php (novo)
├── app/Http/Controllers/
│   └── ReservationController.php (refactor + novos endpoints)
└── tests/Feature/
    ├── ReservationStateTransitionsTest.php
    ├── GuestDataTest.php
    └── PriceRecalculationTest.php
```

### 2.7 Frontend - ReservationModal Estendido

**Novo Layout:**

```tsx
<Modal isOpen={isOpen} onClose={onClose}>
  {/* 1. Hóspede Section */}
  <GuestSection />
  
  {/* 2. Datas Section (com recalc ao editar) */}
  <DatesSection />
  
  {/* 3. Quarto Section */}
  <RoomSection />
  
  {/* 4. Preço Section */}
  <PriceSection />
  
  {/* 5. Status Section (Edit mode) */}
  {editing && <StatusSection reservation={reservation} />}
  
  {/* 6. Botões Contextuais */}
  <ContextualButtons reservation={reservation} />
</Modal>
```

**Botões Contextuais:**

```tsx
switch (reservation.status) {
  case 'pre-reserva':
    return [
      <button onClick={confirm}>Confirmar</button>,
      <button onClick={cancel}>Cancelar</button>,
    ]
  
  case 'confirmed':
    return [
      <button onClick={checkIn}>Check-in</button>,
      <button onClick={cancel}>Cancelar</button>,
    ]
  
  case 'checked-in':
    return [
      <button onClick={checkout}>Check-out</button>,
      <button onClick={earlyDeparture}>Saída Antecipada</button>,
      <button onClick={noShow}>Não Compareceu</button>,
      <button onClick={modifyGuest}>Editar Dados</button>,
      <button onClick={changeRoom}>Trocar Quarto</button>,
    ]
  
  case 'checked-out' | 'early-departure' | 'no-show':
    return [
      <button onClick={finalize}>Finalizar Reserva</button>,
    ]
  
  case 'finalized':
    return [
      <button disabled>Finalizado (Travado)</button>,
    ]
}
```

### 2.8 Resultado Esperado

✅ Operador acompanha 100% da jornada do hóspede  
✅ Estados claros, transições controladas  
✅ Dados completos capturados no check-in  
✅ Preço recalculado ao editar datas  
✅ Cada operação auditada em ReservationStateChanges  
✅ Pronto para FNRH (6 stages mapeados)  

---

## 📋 FASE 3: Financeiro Integrado

### 3.1 Invoice Consolidation

**Problema Atual:** Booking cria 1 invoice, minibar cria outra

**Solução:** 1 invoice com múltiplas linhas

```sql
ALTER TABLE invoices ADD COLUMN lines JSON;
-- Exemplo:
{
  "lines": [
    { "type": "booking", "description": "Hospedagem 3 noites", "amount": 600.00 },
    { "type": "minibar", "description": "Mini-bar consumo", "amount": 50.00 },
    { "type": "service", "description": "Taxa de serviço", "amount": 70.00 }
  ],
  "total": 720.00
}
```

### 3.2 Refund Invoices (Automatic)

**Trigger 1: Early Departure**

```php
// Se cancelamento refund = R$ 150
// Criar invoice negativa: -150 (crédito)
invoices::create([
    'reservation_id' => $reservationId,
    'type' => 'adjustment_early_departure',
    'amount' => -150.00,  // negativa = crédito
    'description' => 'Reembolso saída antecipada',
    'lines' => [
        ['type' => 'refund', 'description' => 'Devolução por antecipação', 'amount' => -150.00]
    ]
]);
```

**Trigger 2: Cancelamento**

```php
// Similar ao early departure
// Usa CancellationService::calculateRefund() para % certo
```

### 3.3 Payment Status Auto-Calculation

**Regra:**

```
payment_status = 'open'     if total_paid == 0
payment_status = 'partially_paid' if 0 < total_paid < total_value
payment_status = 'paid'     if total_paid >= total_value
```

**Update Trigger:** Sempre que registrar novo pagamento

```php
public function recordPayment(Invoice $invoice, $amount) {
    $payment = Payment::create([...]);
    
    // Auto-update status
    $totalPaid = $invoice->payments()->sum('amount');
    $invoice->update([
        'payment_status' => $this->calculatePaymentStatus($totalPaid, $invoice->total)
    ]);
    
    // Log
    FinancialAuditLog::create([
        'action' => 'payment_recorded',
        'details' => [...],
    ]);
}
```

### 3.4 Invoice Lock After Send

**Lock Triggers:**

```php
// 1. Após envio para cliente
if ($invoice->sent_at) {
    $invoice->update(['locked_at' => now()]);
}

// 2. Após envio para FNRH
if ($invoice->fnrh_sent_at) {
    $invoice->update(['locked_at' => now()]);
}

// Validação antes de editar
public function updateInvoice(Invoice $invoice, $data) {
    if ($invoice->locked_at) {
        throw new Exception('Invoice está travada, não pode ser editada');
    }
}
```

### 3.5 Financial Audit Log - Completo

```php
FinancialAuditLog::create([
    'transaction_id' => 'unique',
    'reservation_id' => $reservationId,
    'action' => 'invoice_created|payment_recorded|refund_processed|price_adjusted',
    'amount' => 600.00,
    'details' => json_encode([
        'booking_value' => 600.00,
        'refund_value' => 150.00,
        'reason' => 'Early departure',
    ]),
    'user_id' => $userId,
    'created_at' => now(),
]);
```

### 3.6 Backend - Arquivos a Criar

```
backend/src/
├── database/migrations/
│   └── 2026_02_20_enhance_financial_flow.php
├── app/Services/
│   ├── InvoiceService.php (consolidation, locking)
│   ├── PaymentService.php (auto-status calc)
│   └── FinancialAuditService.php (centralized logging)
├── app/Http/Controllers/
│   └── InvoiceController.php (refactor)
└── tests/Feature/
    ├── InvoiceConsolidationTest.php
    ├── RefundInvoiceTest.php
    └── PaymentStatusTest.php
```

### 3.7 Resultado Esperado

✅ 1 invoice por reserva com múltiplas linhas  
✅ Refunds automáticos ao cancelar/early departure  
✅ Payment status atualizado automaticamente  
✅ Invoices travadas após envio  
✅ Auditoria completa em FinancialAuditLog  
✅ Financeiro 100% síncrono com reserva  

---

## 📋 FASE 4: Integração FNRH

### 4.1 Outbox Pattern - Tabelas

```sql
CREATE TABLE fnrh_outbox (
    id UUID PRIMARY KEY,
    event_type ENUM('guest_created', 'check_in_completed', 'check_out_completed', 
                    'early_departure', 'guest_modified', 'finalized'),
    reservation_id UUID,
    payload JSON,
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 5,
    next_retry_at TIMESTAMP,
    error_message TEXT,
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE fnrh_sync_logs (
    id UUID PRIMARY KEY,
    outbox_id UUID,
    event_type VARCHAR(50),
    status ENUM('success', 'failure'),
    response_code INT,
    response_body JSON,
    gov_br_reference_id VARCHAR(255),
    created_at TIMESTAMP
);
```

### 4.2 6 Sync Stages

**Stage 1: guest_created**
```json
{
  "stage": "guest_created",
  "event_at": "2026-02-20T10:30:00Z",
  "guest": {
    "cpf": "12345678900",
    "name": "João Silva",
    "birthdate": "1985-05-15",
    "nationality": "Brasileira",
    "email": "joao@email.com",
    "phone": "+55 11 98765-4321"
  }
}
```

**Stage 2: check_in_completed**
```json
{
  "stage": "check_in_completed",
  "check_in_at": "2026-02-20T14:00:00Z",
  "guest_full_data": { /* 12 campos completos */ },
  "room": { "number": "101", "capacity": 2 },
  "booking_details": { "check_out_at": "2026-02-23T12:00:00Z", "nights": 3 }
}
```

**Stage 3: check_out_completed**
```json
{
  "stage": "check_out_completed",
  "check_out_at": "2026-02-23T10:30:00Z",
  "actual_departure_time": "2026-02-23T10:30:00Z",
  "invoice": { "total": 600.00, "paid": 600.00 }
}
```

**Stage 4: early_departure** (NEW)
```json
{
  "stage": "early_departure",
  "early_departure_at": "2026-02-22T09:00:00Z",
  "original_checkout": "2026-02-23T12:00:00Z",
  "refund_amount": 150.00,
  "refund_percent": 50,
  "reason": "Early departure"
}
```

**Stage 5: guest_modified** (NEW)
```json
{
  "stage": "guest_modified",
  "modified_at": "2026-02-20T15:30:00Z",
  "changes": {
    "guest_phone": { "from": "+55 11 98765-4321", "to": "+55 11 99999-9999" }
  }
}
```

**Stage 6: finalized**
```json
{
  "stage": "finalized",
  "finalized_at": "2026-02-24T08:00:00Z",
  "final_status": "completed",
  "total_value": 600.00,
  "refund_value": 0.00
}
```

### 4.3 Async Queue & Retry Logic

```php
// Service: FnrhSyncService
class FnrhSyncService {
    public function enqueueEvent(Reservation $reservation, string $stage) {
        FnrhOutbox::create([
            'event_type' => $stage,
            'reservation_id' => $reservation->id,
            'payload' => $this->buildPayload($reservation, $stage),
            'status' => 'pending',
        ]);
    }
    
    public function processQueue() {
        $pendingEvents = FnrhOutbox::where('status', 'pending')
            ->where('retry_count', '<', 5)
            ->orderBy('created_at')
            ->limit(10)
            ->get();
        
        foreach ($pendingEvents as $event) {
            try {
                $response = $this->sendToGovBr($event);
                
                $event->update([
                    'status' => 'sent',
                    'sent_at' => now(),
                ]);
                
                FnrhSyncLog::create([
                    'outbox_id' => $event->id,
                    'status' => 'success',
                    'response_code' => $response->status(),
                    'gov_br_reference_id' => $response->json('reference_id'),
                ]);
                
            } catch (Exception $e) {
                $event->increment('retry_count');
                $event->update([
                    'error_message' => $e->getMessage(),
                    'next_retry_at' => now()->addMinutes(2 ** $event->retry_count),
                ]);
                
                FnrhSyncLog::create([
                    'outbox_id' => $event->id,
                    'status' => 'failure',
                    'response_code' => 500,
                    'response_body' => ['error' => $e->getMessage()],
                ]);
            }
        }
    }
}
```

### 4.4 Validações Gov.br

```php
// Validar antes de enfileirar
public function validateForFnrh(Reservation $reservation, string $stage) {
    switch ($stage) {
        case 'guest_created':
            if (!$reservation->guest_cpf) throw new Exception('CPF obrigatório');
            if (!$this->isValidCpf($reservation->guest_cpf)) throw new Exception('CPF inválido');
            break;
        
        case 'check_in_completed':
            if (count($this->getGuestFields($reservation)) < 12) {
                throw new Exception('Dados do hóspede incompletos');
            }
            break;
        
        case 'finalized':
            if (!$reservation->finalized_at) throw new Exception('Reserva não finalizada');
            if ($reservation->status !== 'finalized') throw new Exception('Status inválido');
            break;
    }
}
```

### 4.5 Monitoring Dashboard

**Endpoints:**

```bash
GET /api/admin/fnrh/sync-status
# Response: { total_pending, total_sent, total_failed, last_sync_at }

GET /api/admin/fnrh/outbox
# Response: [{ id, event_type, status, retry_count, error_message, created_at }]

GET /api/admin/fnrh/logs
# Response: [{ outbox_id, event_type, status, gov_br_reference_id, created_at }]

POST /api/admin/fnrh/retry/{outbox_id}
# Manual retry de um evento
```

### 4.6 Backend - Arquivos a Criar

```
backend/src/
├── database/migrations/
│   └── 2026_02_20_create_fnrh_outbox.php
├── app/Models/
│   ├── FnrhOutbox.php
│   └── FnrhSyncLog.php
├── app/Services/
│   └── FnrhSyncService.php
├── app/Http/Controllers/
│   └── FnrhAdminController.php
├── app/Jobs/
│   └── ProcessFnrhOutboxJob.php (queue job)
└── tests/Feature/
    ├── FnrhSyncTest.php
    └── FnrhValidationTest.php
```

### 4.7 Artisan Commands

```bash
# Processar fila de sync (rodar via cron/scheduler)
php artisan fnrh:process-outbox

# Verificar status
php artisan fnrh:status

# Retry manual
php artisan fnrh:retry {outbox_id}
```

### 4.8 Resultado Esperado

✅ Cada operação de reserva enfileirada no Outbox  
✅ 6 stages completos enviados ao gov.br  
✅ Retry automático com backoff exponencial  
✅ Validações de CNPJ/CPF antes de envio  
✅ Auditoria completa em FnrhSyncLog  
✅ Dashboard de monitoring para ops  
✅ Portaria MTur 41/2025 compliance  

---

## 📋 FASE 5: Polish + Documentação

### 5.1 Error Handling

```php
// Graceful degradation:
// Se FNRH cair → reservas continuam funcionando offline
// Se gov.br rejeitar → retry com notificação ao admin

// Exemplo: Try/catch em sync
try {
    $fnrhService->sync($reservation);
} catch (FnrhException $e) {
    logger()->warning("FNRH sync failed for reservation {$reservationId}: {$e->getMessage()}");
    // Continua, não falha a operação de reserva
}
```

### 5.2 Performance

- [ ] Index em `reservations.status`
- [ ] Index em `reservations.property_id`
- [ ] Index em `fnrh_outbox.status, created_at`
- [ ] Cache de políticas de cancelamento (5 min TTL)
- [ ] Eager loading de relationships

### 5.3 OpenAPI Update

Documentar todos os novos endpoints:

```yaml
/api/properties/{id}/cancellation-policy:
  get: ...
  put: ...

/api/reservations/{id}/preview-cancellation:
  get: ...

/api/reservations/{id}/cancel:
  post: ...

/api/reservations/{id}/check-in:
  post: ...

/api/admin/fnrh/sync-status:
  get: ...
```

### 5.4 ADRs (Architecture Decision Records)

- [ ] `ADR-CANCELLATION-POLICY.md` - Por que multi-propriedade
- [ ] `ADR-RESERVATION-STATES.md` - Estados e transições
- [ ] `ADR-FNRH-OUTBOX.md` - Padrão Outbox para sync
- [ ] `ADR-FINANCIAL-AUDIT.md` - Append-only logging

### 5.5 Testes

```bash
# Backend
cd backend && vendor/bin/phpunit tests/ --coverage-html coverage/

# Frontend
cd frontend && npm test -- --run --coverage
```

**Meta:** > 80% cobertura geral, 95% em financeiro

### 5.6 README Atualizado

- Guia operacional: Como configurar política de cancelamento
- Guia de estados: Estados possíveis e transições
- Guia de FNRH: Como monitorar sync
- Troubleshooting: Problemas comuns e soluções

### 5.7 Resultado Esperado

✅ Sistema robusto, com tratamento de erros  
✅ Performance otimizada  
✅ Documentação completa (OpenAPI, ADRs, README)  
✅ Cobertura de testes > 80%  
✅ Pronto para produção  

---

## 🚀 Cronograma

| Semana | Fase | Entregáveis | Status |
|--------|------|-------------|--------|
| Semana 1 | Cancelamento | Migration + Models + Service + Controller + UI | To-Do |
| Semana 2 | Reservas Completo | Estados + Operações + ReservationModal | To-Do |
| Semana 2.5 | Financeiro | Invoices + Refunds + Payment Status | To-Do |
| Semana 3 | FNRH | Outbox + 6 Stages + Validações | To-Do |
| Semana 4 | Polish | Error Handling + Performance + Docs | To-Do |

---

## 📌 Checklist Final

- [ ] Todas as migrations rodadas e testadas
- [ ] Models com relationships corretos
- [ ] Services com lógica de negócio isolada
- [ ] Controllers com assertions de propriedade
- [ ] Frontend com componentes reutilizáveis
- [ ] Traduções em 4 idiomas
- [ ] Testes com coverage > 80%
- [ ] OpenAPI atualizada
- [ ] ADRs criadas
- [ ] README atualizado
- [ ] PR criado e revisado
- [ ] Aprovação humana antes de merge
- [ ] Deploy em staging
- [ ] Validação em produção

---

**Fim do Roadmap Priorizado**

