# Design de Políticas de Cancelamento - Multi-Propriedade

**Data:** Fevereiro 20, 2026  
**Status:** Proposta de Arquitetura  
**Objetivo:** Criar sistema flexível de políticas de cancelamento vinculadas à propriedade, atendendo diversos tipos de negócios.

---

## 1. Por Que Multi-Propriedade?

### Contexto: Tipos de Propriedade Diferentes

```
Pousada Rural (Baixa sazonalidade):
├─ Cancelamento até 7 dias antes = 100% refund
├─ Cancelamento 3-7 dias antes = 50% refund
└─ Cancelamento < 3 dias = 0% refund

Hotel Resort (Alta demanda):
├─ Cancelamento até 14 dias antes = 100% refund
├─ Cancelamento 7-14 dias antes = 75% refund
├─ Cancelamento 3-7 dias antes = 25% refund
└─ Cancelamento < 3 dias = 0% refund

Aluguel Temporário (Flexível):
├─ Cancelamento até 21 dias antes = 100% refund
├─ Cancelamento até dia anterior = 50% refund
└─ Cancelamento no dia = 0% refund

Chalé Premium (Rígido):
├─ Cancelamento até 21 dias antes = 100% refund
├─ Cancelamento 7-21 dias antes = 50% refund
└─ Cancelamento < 7 dias = 0% refund (sem exceções)
```

**Conclusão:** Cada propriedade tem modelo de negócio diferente → política customizável por propriedade ✅

---

## 2. Arquitetura da Solução

### 2.1 Modelo de Dados - Nova Tabela

```sql
CREATE TABLE cancellation_policies (
    id                  UUID PRIMARY KEY,
    property_id         UUID NOT NULL UNIQUE,  -- UMA política por propriedade
    name                VARCHAR(100),          -- "Política Padrão", "Sazonal", etc
    description         TEXT,                  -- Para UI admin
    
    -- Tipo de política
    type                ENUM('fixed_timeline', 'percentage_cascade', 'free_until_date'),
    
    -- Dados de configuração (polimórfico)
    config              JSON,                  -- Estrutura flexível
    
    -- Controle
    active              BOOLEAN DEFAULT true,
    applies_from        DATE,                  -- Quando começa a valer
    applies_to          DATE,    NULL,        -- Até quando (NULL = indefinido)
    
    -- Auditoria
    created_by_id       UUID,
    created_at          TIMESTAMP,
    updated_at          TIMESTAMP,
    
    FOREIGN KEY (property_id) REFERENCES properties(id) CASCADE,
    FOREIGN KEY (created_by_id) REFERENCES users(id)
);

CREATE TABLE cancellation_refund_rules (
    id                  UUID PRIMARY KEY,
    policy_id           UUID NOT NULL,
    
    -- Regra de reembolso
    days_before_checkin_min  INT NOT NULL,    -- Mínimo dias antes check-in
    days_before_checkin_max  INT NOT NULL,    -- Máximo dias antes check-in (0 = dia do check-in)
    refund_percent      DECIMAL(5,2),         -- % reembolsável (0-100)
    
    -- Tipo de penalidade
    penalty_type        ENUM('fixed', 'percentage') DEFAULT 'fixed',
    penalty_amount      DECIMAL(10,2),        -- Valor ou % retido
    
    -- Descrição para UI
    label               VARCHAR(50),          -- "Cancelamento com 7+ dias"
    
    -- Ordem de avaliação
    priority            INT DEFAULT 0,        -- Descending: maior = avalia primeiro
    
    created_at          TIMESTAMP,
    updated_at          TIMESTAMP,
    
    FOREIGN KEY (policy_id) REFERENCES cancellation_policies(id) CASCADE,
    UNIQUE (policy_id, days_before_checkin_min, days_before_checkin_max)
);
```

### 2.2 Modelos Laravel

```php
// app/Models/CancellationPolicy.php
<?php
namespace App\Models;

class CancellationPolicy extends Model
{
    protected $fillable = [
        'property_id', 'name', 'description', 'type', 'config',
        'active', 'applies_from', 'applies_to', 'created_by_id'
    ];

    protected $casts = [
        'config' => 'array',
        'active' => 'boolean',
        'applies_from' => 'date',
        'applies_to' => 'date',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function rules()
    {
        return $this->hasMany(CancellationRefundRule::class, 'policy_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }
}

// app/Models/CancellationRefundRule.php
<?php
namespace App\Models;

class CancellationRefundRule extends Model
{
    protected $fillable = [
        'policy_id', 'days_before_checkin_min', 'days_before_checkin_max',
        'refund_percent', 'penalty_type', 'penalty_amount', 'label', 'priority'
    ];

    protected $casts = [
        'refund_percent' => 'decimal:2',
        'penalty_amount' => 'decimal:2',
    ];

    public function policy()
    {
        return $this->belongsTo(CancellationPolicy::class);
    }
}
```

---

## 3. Tipos de Políticas Pré-Built

### 3.1 Fixed Timeline (Cascata de Dias)

**Config:**
```json
{
  "type": "fixed_timeline",
  "tiers": [
    { "days_before": 7, "refund_percent": 100, "label": "7+ dias" },
    { "days_before": 3, "refund_percent": 50, "label": "3-6 dias" },
    { "days_before": 0, "refund_percent": 0, "label": "< 3 dias" }
  ]
}
```

**Uso:** Pousadas rurais, pequenos hotéis  
**Vantagem:** Simples, fácil de comunicar

---

### 3.2 Percentage Cascade (Cascata com Penalidade)

**Config:**
```json
{
  "type": "percentage_cascade",
  "rules": [
    { "days_min": 21, "days_max": 999, "refund_percent": 100, "penalty_type": "fixed", "penalty_amount": 0 },
    { "days_min": 14, "days_max": 20, "refund_percent": 75, "penalty_type": "fixed", "penalty_amount": 25.00 },
    { "days_min": 7, "days_max": 13, "refund_percent": 50, "penalty_type": "fixed", "penalty_amount": 50.00 },
    { "days_min": 0, "days_max": 6, "refund_percent": 0, "penalty_type": "fixed", "penalty_amount": 100 }
  ]
}
```

**Uso:** Hotéis resort, propriedades de alta demanda  
**Vantagem:** Mais granular, retém valores específicos

---

### 3.3 Free Until Date (Cancelamento Livre Até Data)

**Config:**
```json
{
  "type": "free_until_date",
  "free_until_days_before": 10,
  "after_penalty_percent": 50,
  "description": "Cancele grátis até 10 dias antes do check-in"
}
```

**Uso:** Aluguel temporário, propriedades sazonais  
**Vantagem:** Mais simples, única data de corte

---

### 3.4 Seasonal (Política Sazonal - Avançado)

**Config:**
```json
{
  "type": "seasonal",
  "seasons": [
    {
      "name": "Alta Temporada",
      "starts_month": 12,
      "starts_day": 15,
      "ends_month": 2,
      "ends_day": 28,
      "refund_percent": 0,
      "policy_cascade": [ /* = fixed_timeline */ ]
    },
    {
      "name": "Baixa Temporada",
      "starts_month": 6,
      "starts_day": 1,
      "ends_month": 8,
      "ends_day": 31,
      "refund_percent": 100,
      "policy_cascade": [ /* = fixed_timeline */ ]
    }
  ]
}
```

**Uso:** Resorts de praia, chalés de montanha  
**Vantagem:** Adapta por season

---

## 4. Serviço de Cálculo de Reembolso

### 4.1 Service Layer

```php
// app/Services/CancellationService.php
<?php
namespace App\Services;

use App\Models\Reservation;
use App\Models\CancellationPolicy;
use Carbon\Carbon;

class CancellationService
{
    /**
     * Calcula reembolso baseado na política da propriedade
     * @param Reservation $reservation
     * @param Carbon|null $cancelledAt (default = now)
     * @return array ['refund_amount' => decimal, 'refund_percent' => int, 'retained_amount' => decimal, 'reason' => string]
     */
    public function calculateRefund(Reservation $reservation, ?Carbon $cancelledAt = null): array
    {
        $cancelledAt ??= now();
        
        // 1. Buscar política da propriedade
        $policy = CancellationPolicy::where('property_id', $reservation->property_id)
            ->where('active', true)
            ->where('applies_from', '<=', $cancelledAt->toDateString())
            ->where(function ($q) use ($cancelledAt) {
                $q->whereNull('applies_to')
                  ->orWhere('applies_to', '>=', $cancelledAt->toDateString());
            })
            ->first();
        
        if (!$policy) {
            // Sem política = sem reembolso
            return [
                'refund_amount' => 0,
                'refund_percent' => 0,
                'retained_amount' => $reservation->total_value,
                'reason' => 'Nenhuma política de cancelamento ativa',
                'policy_id' => null,
            ];
        }
        
        // 2. Calcular dias até check-in
        $daysUntilCheckin = $cancelledAt->diffInDays($reservation->start_date, absolute: false);
        
        // 3. Buscar regra aplicável (order by priority DESC, depois by days_before_checkin DESC)
        $applicableRule = $policy->rules()
            ->orderBy('priority', 'desc')
            ->orderBy('days_before_checkin_min', 'desc')
            ->first(function ($rule) use ($daysUntilCheckin) {
                return $daysUntilCheckin >= $rule->days_before_checkin_min 
                    && $daysUntilCheckin <= $rule->days_before_checkin_max;
            });
        
        if (!$applicableRule) {
            // Sem regra aplicável = política mais restritiva
            return [
                'refund_amount' => 0,
                'refund_percent' => 0,
                'retained_amount' => $reservation->total_value,
                'reason' => 'Cancelamento fora das datas permitidas',
                'policy_id' => $policy->id,
            ];
        }
        
        // 4. Calcular valores
        $refundPercent = $applicableRule->refund_percent;
        $refundAmount = $reservation->total_value * ($refundPercent / 100);
        $retainedAmount = $reservation->total_value - $refundAmount;
        
        return [
            'refund_amount' => round($refundAmount, 2),
            'refund_percent' => $refundPercent,
            'retained_amount' => round($retainedAmount, 2),
            'reason' => $applicableRule->label ?? "Cancelamento com {$daysUntilCheckin} dias de antecedência",
            'policy_id' => $policy->id,
            'rule_id' => $applicableRule->id,
        ];
    }
    
    /**
     * Processa cancelamento: cria ajuste financeiro + registra refund
     */
    public function processCancel(Reservation $reservation, ?string $reason = null): void
    {
        $refundCalc = $this->calculateRefund($reservation);
        
        // Registrar auditoria
        $reservation->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $reason,
            'cancellation_refund_calc' => json_encode($refundCalc),
        ]);
        
        // Criar invoice de ajuste (negativa)
        if ($refundCalc['refund_amount'] > 0) {
            $this->createRefundInvoice($reservation, $refundCalc);
        }
    }
    
    private function createRefundInvoice(Reservation $reservation, array $refundCalc): void
    {
        // Invoice com -$refund_amount (negativa = crédito)
        // Vê FASE_2_IMPLEMENTATION_EXAMPLES.md para detalhes
    }
}
```

### 4.2 Controller

```php
// app/Controllers/ReservationController.php (novo endpoint)
<?php
public function previewCancellation(Request $request, Reservation $reservation)
{
    $this->assertBelongsToProperty($reservation, $this->getPropertyId($request));
    
    $cancellationService = new CancellationService();
    $refundCalc = $cancellationService->calculateRefund($reservation);
    
    return response()->json([
        'refund_amount' => $refundCalc['refund_amount'],
        'refund_percent' => $refundCalc['refund_percent'],
        'retained_amount' => $refundCalc['retained_amount'],
        'reason' => $refundCalc['reason'],
        'message' => sprintf(
            'Cancelamento resulta em reembolso de R$ %.2f (%.0f%%)',
            $refundCalc['refund_amount'],
            $refundCalc['refund_percent']
        ),
    ]);
}

public function cancel(Request $request, Reservation $reservation)
{
    $this->assertBelongsToProperty($reservation, $this->getPropertyId($request));
    
    $validated = $request->validate([
        'reason' => 'nullable|string|max:500',
    ]);
    
    $cancellationService = new CancellationService();
    $cancellationService->processCancel($reservation, $validated['reason'] ?? null);
    
    return response()->json([
        'status' => 'cancelled',
        'message' => 'Reserva cancelada com sucesso',
    ]);
}
```

---

## 5. UI/UX - Admin de Políticas

### 5.1 Página de Configuração

**Localização:** `/config/cancelamento`

```tsx
// frontend/src/pages/Config/CancellationPolicyPage.tsx
interface PolicyType {
  id: string
  propertyId: string
  name: string
  type: 'fixed_timeline' | 'percentage_cascade' | 'free_until_date' | 'seasonal'
  rules: RefundRule[]
}

export default function CancellationPolicyPage() {
  const { propertyId } = useAuth()
  const [policy, setPolicy] = React.useState<PolicyType | null>(null)
  const [editing, setEditing] = React.useState(false)
  
  // Carregar política da propriedade
  React.useEffect(() => {
    cancelPolicyService.getByProperty(propertyId)
      .then(setPolicy)
      .catch(err => console.error(err))
  }, [propertyId])
  
  return (
    <div className="config-page">
      <h1>{t('config.cancellation_policy')}</h1>
      
      {policy && (
        <>
          <div className="policy-header">
            <h2>{policy.name}</h2>
            <badge className="badge-info">{typeLabel(policy.type)}</badge>
            <button onClick={() => setEditing(!editing)}>
              {editing ? t('common.cancel') : t('common.edit')}
            </button>
          </div>
          
          {!editing && <PolicyViewer policy={policy} />}
          {editing && <PolicyEditor policy={policy} onSave={handleSave} />}
        </>
      )}
    </div>
  )
}
```

### 5.2 Editor de Políticas

```tsx
// frontend/src/components/Config/PolicyEditor.tsx
interface PolicyEditorProps {
  policy: PolicyType
  onSave: (policy: PolicyType) => void
}

export default function PolicyEditor({ policy, onSave }: PolicyEditorProps) {
  const { t } = useTranslation()
  const [selectedType, setSelectedType] = React.useState(policy.type)
  const [rules, setRules] = React.useState(policy.rules)
  
  return (
    <div className="policy-editor">
      {/* Tipo de política */}
      <FormField label={t('cancellation.type')} name="type">
        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value as any)}>
          <option value="fixed_timeline">Cascata de Dias Simples</option>
          <option value="percentage_cascade">Cascata com Percentual</option>
          <option value="free_until_date">Livre Até Data</option>
          <option value="seasonal">Sazonal</option>
        </select>
      </FormField>
      
      {/* Renderização condicional por tipo */}
      {selectedType === 'fixed_timeline' && <FixedTimelineEditor rules={rules} onChange={setRules} />}
      {selectedType === 'percentage_cascade' && <PercentageCascadeEditor rules={rules} onChange={setRules} />}
      {selectedType === 'free_until_date' && <FreeUntilDateEditor rules={rules} onChange={setRules} />}
      {selectedType === 'seasonal' && <SeasonalEditor policy={policy} onChange={setRules} />}
      
      {/* Preview */}
      <PolicyPreview rules={rules} />
      
      {/* Ações */}
      <div className="actions">
        <button onClick={() => onSave({ ...policy, type: selectedType, rules })}>
          {t('common.save')}
        </button>
      </div>
    </div>
  )
}
```

### 5.3 Preview Visual

```tsx
// Exemplo: Fixed Timeline
const FixedTimelinePreview = ({ rules }) => {
  return (
    <table className="policy-preview">
      <thead>
        <tr>
          <th>Dias de Antecedência</th>
          <th>Reembolso</th>
          <th>Retido</th>
        </tr>
      </thead>
      <tbody>
        {rules.map((r) => (
          <tr key={r.id}>
            <td>Mínimo {r.days_before_checkin_min} dias</td>
            <td className="text-success">{r.refund_percent}%</td>
            <td className="text-danger">{100 - r.refund_percent}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

### 5.4 Modal de Preview de Cancelamento

```tsx
// Frontend: Ao clicar "Cancelar Reserva" no ReservationModal
<div className="cancellation-preview">
  <h4>Simulação de Cancelamento</h4>
  <p>
    Se cancelar agora: <strong>Reembolso R$ {refundCalc.refund_amount}</strong> ({refundCalc.refund_percent}%)
  </p>
  <p className="text-muted">{refundCalc.reason}</p>
  
  <div className="form-group">
    <label>Motivo do cancelamento (opcional)</label>
    <textarea {...register('cancellation_reason')} />
  </div>
  
  <button onClick={() => confirmCancel()} className="btn-danger">
    Confirmar Cancelamento
  </button>
</div>
```

---

## 6. Migration & Seeding

### 6.1 Migration

```php
// database/migrations/2026_02_20_create_cancellation_policies.php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Tabela de políticas
        Schema::create('cancellation_policies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('property_id')->unique();
            $table->string('name')->default('Política Padrão');
            $table->text('description')->nullable();
            $table->enum('type', ['fixed_timeline', 'percentage_cascade', 'free_until_date', 'seasonal']);
            $table->json('config')->nullable();
            $table->boolean('active')->default(true);
            $table->date('applies_from')->useCurrent();
            $table->date('applies_to')->nullable();
            $table->uuid('created_by_id')->nullable();
            $table->timestamps();
            
            $table->foreign('property_id')->references('id')->on('properties')->cascadeOnDelete();
            $table->foreign('created_by_id')->references('id')->on('users')->nullOnDelete();
        });
        
        // Tabela de regras
        Schema::create('cancellation_refund_rules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('policy_id');
            $table->unsignedSmallInteger('days_before_checkin_min');
            $table->unsignedSmallInteger('days_before_checkin_max');
            $table->decimal('refund_percent', 5, 2);
            $table->enum('penalty_type', ['fixed', 'percentage'])->default('fixed');
            $table->decimal('penalty_amount', 10, 2)->nullable();
            $table->string('label')->nullable();
            $table->unsignedSmallInteger('priority')->default(0);
            $table->timestamps();
            
            $table->foreign('policy_id')->references('id')->on('cancellation_policies')->cascadeOnDelete();
            $table->unique(['policy_id', 'days_before_checkin_min', 'days_before_checkin_max']);
        });
        
        // Adicionar coluna em reservations para tracking
        if (!Schema::hasColumn('reservations', 'cancellation_refund_calc')) {
            Schema::table('reservations', function (Blueprint $table) {
                $table->json('cancellation_refund_calc')->nullable()->after('notes');
                $table->text('cancellation_reason')->nullable()->after('cancellation_refund_calc');
                $table->timestamp('cancelled_at')->nullable()->after('cancellation_reason');
            });
        }
    }
    
    public function down(): void
    {
        Schema::dropIfExists('cancellation_refund_rules');
        Schema::dropIfExists('cancellation_policies');
        
        if (Schema::hasColumn('reservations', 'cancellation_refund_calc')) {
            Schema::table('reservations', function (Blueprint $table) {
                $table->dropColumn(['cancellation_refund_calc', 'cancellation_reason', 'cancelled_at']);
            });
        }
    }
};
```

### 6.2 Seeder - Políticas Padrão

```php
// database/seeders/CancellationPolicySeeder.php
<?php
namespace Database\Seeders;

use App\Models\Property;
use App\Models\CancellationPolicy;
use App\Models\CancellationRefundRule;
use Illuminate\Database\Seeder;

class CancellationPolicySeeder extends Seeder
{
    public function run(): void
    {
        // Política padrão: Fixed Timeline (simples)
        $properties = Property::all();
        
        foreach ($properties as $property) {
            $policy = CancellationPolicy::firstOrCreate(
                ['property_id' => $property->id],
                [
                    'name' => 'Política Padrão',
                    'type' => 'fixed_timeline',
                    'description' => 'Cancelamento com cascata de dias',
                    'active' => true,
                    'applies_from' => now()->toDateString(),
                    'config' => [
                        'tiers' => [
                            ['days_before' => 7, 'refund_percent' => 100],
                            ['days_before' => 3, 'refund_percent' => 50],
                            ['days_before' => 0, 'refund_percent' => 0],
                        ]
                    ]
                ]
            );
            
            // Criar regras
            $rules = [
                [
                    'days_before_checkin_min' => 7,
                    'days_before_checkin_max' => 999,
                    'refund_percent' => 100,
                    'label' => 'Cancelamento com 7+ dias',
                    'priority' => 3,
                ],
                [
                    'days_before_checkin_min' => 3,
                    'days_before_checkin_max' => 6,
                    'refund_percent' => 50,
                    'label' => 'Cancelamento com 3-6 dias',
                    'priority' => 2,
                ],
                [
                    'days_before_checkin_min' => 0,
                    'days_before_checkin_max' => 2,
                    'refund_percent' => 0,
                    'label' => 'Cancelamento com < 3 dias',
                    'priority' => 1,
                ],
            ];
            
            foreach ($rules as $ruleData) {
                CancellationRefundRule::updateOrCreate(
                    [
                        'policy_id' => $policy->id,
                        'days_before_checkin_min' => $ruleData['days_before_checkin_min'],
                        'days_before_checkin_max' => $ruleData['days_before_checkin_max'],
                    ],
                    array_merge($ruleData, ['penalty_type' => 'fixed'])
                );
            }
        }
    }
}
```

---

## 7. Casos de Uso & Exemplos

### Caso 1: Pousada Rural

```php
$policy = CancellationPolicy::create([
    'property_id' => 'pousada-rural-id',
    'name' => 'Política Pousada Rural',
    'type' => 'fixed_timeline',
]);

// Simples, 3 níveis
CancellationRefundRule::create([
    'policy_id' => $policy->id,
    'days_before_checkin_min' => 7,
    'days_before_checkin_max' => 999,
    'refund_percent' => 100,
    'label' => 'Sem penalidade',
    'priority' => 3,
]);

// ... (3-6 dias, < 3 dias)
```

### Caso 2: Resort de Luxo

```php
$policy = CancellationPolicy::create([
    'property_id' => 'resort-id',
    'name' => 'Política Resort Premium',
    'type' => 'percentage_cascade',
    'config' => [
        'rules' => [
            ['days_min' => 21, 'refund_percent' => 100, 'penalty_fixed' => 0],
            ['days_min' => 14, 'refund_percent' => 75, 'penalty_fixed' => 25],
            ['days_min' => 7, 'refund_percent' => 50, 'penalty_fixed' => 50],
            ['days_min' => 0, 'refund_percent' => 0, 'penalty_fixed' => 100],
        ]
    ]
]);
```

### Caso 3: Aluguel Sazonal

```php
$policy = CancellationPolicy::create([
    'property_id' => 'aluguel-id',
    'name' => 'Política Sazonal',
    'type' => 'seasonal',
    'config' => [
        'seasons' => [
            [
                'name' => 'Alta (Dez-Fev)',
                'months' => [12, 1, 2],
                'refund_percent' => 0,  // Sem reembolso
            ],
            [
                'name' => 'Média (Mar-Nov)',
                'months' => [3,4,5,6,7,8,9,10,11],
                'rules' => [ /* fixed_timeline cascade */ ],
            ]
        ]
    ]
]);
```

---

## 8. Fluxo de Cancelamento Completo

```
┌─────────────────────────────────────────────────────────────┐
│ Frontend: ReservationModal → Botão "Cancelar Reserva"       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ GET /api/reservations/{id}/preview-cancel                   │
│ → Backend: CancellationService::calculateRefund()           │
│ → Retorna: { refund_amount, refund_percent, reason }        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Modal: Mostra preview de reembolso                           │
│ "Se cancelar agora: R$ 150,00 (50%) de reembolso"          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼ (Usuário confirma)
┌─────────────────────────────────────────────────────────────┐
│ POST /api/reservations/{id}/cancel                          │
│ Body: { reason: "Motivo do cancelamento" }                  │
│ → Backend: CancellationService::processCancel()             │
│   ├─ Atualizar reserva: status = 'cancelled'                │
│   ├─ Criar refund invoice (negativa)                        │
│   └─ FinancialAuditLog: registrar tudo                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Response: { status: 'cancelled', refund: R$ 150,00 }        │
│ Frontend: Atualizar lista + mostrar sucesso                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Integração com FNRH

### Sync Stages

```
FNRH Sync (após finalize):
├─ Stage 1: guest_created       (Dados do hóspede)
├─ Stage 2: check_in_completed  (Check-in realizado)
├─ Stage 3: check_out_completed (Check-out realizado)
├─ Stage 4: early_departure ←   (NEW: Saída antecipada com refund)
├─ Stage 5: guest_modified ←    (NEW: Dados do hóspede atualizados)
└─ Stage 6: finalized           (Tudo fechado, enviado ao FNRH)
```

**Nova Stage: cancellation_processed** (opcional, se cancelamento após check-in):

```json
{
  "stage": "cancellation_processed",
  "reservation_id": "uuid",
  "cancelled_at": "2026-02-20T10:30:00Z",
  "refund_amount": 150.00,
  "refund_percent": 50,
  "cancellation_reason": "Motivo informado",
  "policy_id": "uuid"
}
```

---

## 10. API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/properties/{id}/cancellation-policy` | Buscar política da propriedade |
| GET | `/api/reservations/{id}/preview-cancel` | Preview de cancelamento |
| PUT | `/api/properties/{id}/cancellation-policy` | Atualizar política |
| POST | `/api/reservations/{id}/cancel` | Processar cancelamento |
| GET | `/api/cancellation-policies/templates` | Listar templates pré-built |

---

## 11. Traduções Necessárias

**`frontend/public/locales/pt-BR/common.json`:**

```json
{
  "cancellation": {
    "title": "Política de Cancelamento",
    "type": "Tipo de Política",
    "type_fixed_timeline": "Cascata de Dias Simples",
    "type_percentage_cascade": "Cascata com Percentual",
    "type_free_until_date": "Livre Até Data",
    "type_seasonal": "Sazonal",
    "days_before": "Dias de Antecedência",
    "refund_percent": "% Reembolso",
    "label": "Rótulo",
    "add_rule": "Adicionar Regra",
    "preview": "Preview",
    "policy_updated": "Política atualizada com sucesso"
  }
}
```

---

## 12. Checklist de Implementação

- [ ] Criar migration `create_cancellation_policies.php`
- [ ] Criar modelos `CancellationPolicy`, `CancellationRefundRule`
- [ ] Criar serviço `CancellationService`
- [ ] Criar controller `CancellationPolicyController`
- [ ] Criar endpoints: preview-cancel, cancel, policy CRUD
- [ ] Criar seeder com políticas padrão
- [ ] Criar UI: `CancellationPolicyPage`, `PolicyEditor`, `PolicyPreview`
- [ ] Integrar modal de preview em `ReservationModal`
- [ ] Adicionar testes: service, controller, UI
- [ ] Atualizar OpenAPI
- [ ] Adicionar ao ADR: `ADR-CANCELLATION-POLICY.md`
- [ ] Documentar no TODO.md

---

## 13. Sumário Arquitetural

```
┌─────────────────────────────────────────┐
│ Property (1 para 1)                     │
├─────────────────────────────────────────┤
│ ├─ CancellationPolicy                   │
│ │  ├─ type: 'fixed_timeline' etc        │
│ │  ├─ config: { tiers, rules, seasons } │
│ │  └─ rules: CancellationRefundRule[]   │
│ │     ├─ days_before_min/max            │
│ │     ├─ refund_percent                 │
│ │     └─ label                          │
│ │                                       │
│ └─ (Usado por CancellationService)      │
│    → calculateRefund(reservation)       │
│    → processCancel(reservation)         │
└─────────────────────────────────────────┘

Cada propriedade tem 1 política ativa
Cada política pode ter N regras
Cancelamento busca a regra aplicável
```

---

**Fim do Design de Políticas de Cancelamento Multi-Propriedade**

