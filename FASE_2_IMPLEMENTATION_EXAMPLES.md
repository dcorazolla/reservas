# FASE 2: Exemplos de Implementação - Early Departure + Refund

## 1. Backend - ReservationService::recordEarlyDeparture()

```php
<?php

namespace App\Services;

use App\Models\Reservation;
use App\Models\Guest;
use App\Models\Invoice;
use App\Models\FinancialAuditLog;
use Illuminate\Support\Facades\DB;

class ReservationService
{
    public function recordEarlyDeparture(string $reservationId, string $checkoutDate): array
    {
        return DB::transaction(function () use ($reservationId, $checkoutDate) {
            $reservation = Reservation::findOrFail($reservationId);
            
            // Validações
            if ($reservation->status !== 'checked_in') {
                throw new \Exception('Only checked_in reservations can have early departure');
            }
            
            if ($checkoutDate >= $reservation->end_date) {
                throw new \Exception('Early checkout must be before original end date');
            }
            
            // 1. Recalcular preço (dias usados vs originais)
            $originalStayDays = $this->calculateStayDays($reservation->start_date, $reservation->end_date);
            $actualStayDays = $this->calculateStayDays($reservation->start_date, $checkoutDate);
            
            $pricePerDay = $reservation->total_value / $originalStayDays;
            $newTotal = $pricePerDay * $actualStayDays;
            $refundAmount = $reservation->total_value - $newTotal;
            
            // 2. Atualizar Reservation
            $reservation->update([
                'early_departure_at' => now(),
                'end_date' => $checkoutDate,
                'total_value' => $newTotal,
                'refund_amount' => $refundAmount,
            ]);
            
            // 3. Atualizar ou criar Invoice (adjustment line)
            $adjustment = [
                'description' => sprintf(
                    'Ajuste Early Departure: %d dias (R$ %.2f) → %d dias (R$ %.2f)',
                    $originalStayDays,
                    $reservation->total_value,
                    $actualStayDays,
                    $newTotal
                ),
                'quantity' => 1,
                'unit_price' => -$refundAmount, // Negativo = crédito
            ];
            
            $invoice = Invoice::where('reservation_id', $reservationId)->first();
            if ($invoice) {
                // Adicionar linha de ajuste
                $lines = $invoice->lines ?? [];
                $lines[] = $adjustment;
                $invoice->update(['lines' => $lines]);
            }
            
            // 4. Audit Log
            FinancialAuditLog::create([
                'event_type' => 'reservation.early_departure',
                'payload' => [
                    'reservation_id' => $reservationId,
                    'original_checkout' => $reservation->end_date,
                    'early_checkout' => $checkoutDate,
                    'original_price' => $reservation->total_value,
                    'new_price' => $newTotal,
                    'refund_amount' => $refundAmount,
                ],
                'resource_type' => 'reservation',
                'resource_id' => $reservationId,
            ]);
            
            return [
                'reservation' => $reservation,
                'invoice' => $invoice,
                'refund_amount' => $refundAmount,
                'new_total' => $newTotal,
            ];
        });
    }
    
    public function updateGuestData(string $reservationId, array $guestData): Guest
    {
        return DB::transaction(function () use ($reservationId, $guestData) {
            $reservation = Reservation::findOrFail($reservationId);
            
            // Validações
            if (!$reservation->guest_id) {
                throw new \Exception('Reservation has no guest');
            }
            
            if ($reservation->finalized_at) {
                throw new \Exception('Cannot modify guest data for finalized reservation');
            }
            
            $guest = $reservation->guest;
            
            // Registrar mudanças para auditoria
            $modifications = [];
            foreach ($guestData as $field => $newValue) {
                $oldValue = $guest->{$field};
                if ($oldValue !== $newValue) {
                    $modifications[] = [
                        'field' => $field,
                        'old_value' => $oldValue,
                        'new_value' => $newValue,
                    ];
                }
            }
            
            // Update guest
            $guest->update($guestData);
            
            // Audit log
            FinancialAuditLog::create([
                'event_type' => 'reservation.guest_modified',
                'payload' => [
                    'reservation_id' => $reservationId,
                    'modifications' => $modifications,
                ],
                'resource_type' => 'guest',
                'resource_id' => $guest->id,
            ]);
            
            return $guest;
        });
    }
    
    public function finalize(string $reservationId): Reservation
    {
        return DB::transaction(function () use ($reservationId) {
            $reservation = Reservation::findOrFail($reservationId);
            
            if ($reservation->status !== 'checked_out') {
                throw new \Exception('Only checked_out reservations can be finalized');
            }
            
            // Lock guest data + preço
            $reservation->update([
                'finalized_at' => now(),
                'allow_guest_modifications' => false,
            ]);
            
            // Audit log
            FinancialAuditLog::create([
                'event_type' => 'reservation.finalized',
                'payload' => [
                    'reservation_id' => $reservationId,
                    'final_total' => $reservation->total_value,
                ],
                'resource_type' => 'reservation',
                'resource_id' => $reservationId,
            ]);
            
            return $reservation;
        });
    }
    
    public function markNoShow(string $reservationId): Reservation
    {
        return DB::transaction(function () use ($reservationId) {
            $reservation = Reservation::findOrFail($reservationId);
            
            if ($reservation->status !== 'checked_in') {
                throw new \Exception('Only checked_in reservations can be marked as no-show');
            }
            
            // Marcar com status especial
            $reservation->update([
                'status' => 'no_show',
                'checked_in_at' => null, // Reverter check-in
            ]);
            
            // Audit log (NÃO enqueue FNRH - nunca entrou no hotel)
            FinancialAuditLog::create([
                'event_type' => 'reservation.no_show',
                'payload' => ['reservation_id' => $reservationId],
                'resource_type' => 'reservation',
                'resource_id' => $reservationId,
            ]);
            
            return $reservation;
        });
    }
    
    private function calculateStayDays(string $startDate, string $endDate): int
    {
        return $this->dateService->differenceInDays($endDate, $startDate);
    }
}
```

## 2. Backend - RefundPolicyService

```php
<?php

namespace App\Services;

use App\Models\RefundPolicy;
use App\Models\Reservation;

class RefundPolicyService
{
    /**
     * Calcular % refund baseado em timing de cancelamento
     * 
     * Exemplo:
     *  - >7 dias antes: 100% reembolso
     *  - 3-7 dias antes: 50% reembolso
     *  - <3 dias: 0% reembolso
     */
    public function calculateRefund(Reservation $reservation, string $cancelDate): array
    {
        $checkInDate = $reservation->start_date;
        $daysBeforeCheckIn = $this->calculateDaysBetween($cancelDate, $checkInDate);
        
        // Buscar política da propriedade
        $policies = RefundPolicy::where('property_id', $reservation->property_id)
            ->orderBy('days_before_checkin', 'desc')
            ->get();
        
        $policy = $policies->firstWhere(
            fn($p) => $daysBeforeCheckIn >= $p->days_before_checkin
        ) ?? $policies->last();
        
        $refundPercentage = $policy->refund_percentage ?? 0;
        $refundAmount = $reservation->total_value * ($refundPercentage / 100);
        
        return [
            'refund_percentage' => $refundPercentage,
            'refund_amount' => $refundAmount,
            'days_before_checkin' => $daysBeforeCheckIn,
            'policy_id' => $policy->id,
        ];
    }
    
    /**
     * Criar policies padrão para uma propriedade
     */
    public function createDefaultPolicies(string $propertyId): void
    {
        $defaults = [
            ['days_before_checkin' => 7, 'refund_percentage' => 100],
            ['days_before_checkin' => 3, 'refund_percentage' => 50],
            ['days_before_checkin' => 0, 'refund_percentage' => 0],
        ];
        
        foreach ($defaults as $default) {
            RefundPolicy::create([
                'property_id' => $propertyId,
                'days_before_checkin' => $default['days_before_checkin'],
                'refund_percentage' => $default['refund_percentage'],
            ]);
        }
    }
    
    private function calculateDaysBetween(string $from, string $to): int
    {
        return \Carbon\Carbon::parse($to)->diffInDays(\Carbon\Carbon::parse($from));
    }
}
```

## 3. Backend - ReservationController (Updated)

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Services\ReservationService;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function __construct(
        private ReservationService $reservationService,
    ) {}
    
    /**
     * Record early departure for checked_in reservation
     * POST /api/reservations/{id}/early-departure
     */
    public function recordEarlyDeparture(Request $request, Reservation $reservation)
    {
        $data = $request->validate([
            'checkout_date' => 'required|date',
        ]);
        
        $result = $this->reservationService->recordEarlyDeparture(
            $reservation->id,
            $data['checkout_date']
        );
        
        return response()->json($result, 200);
    }
    
    /**
     * Update guest data for checked_in (not finalized) reservation
     * PUT /api/reservations/{id}/guest-data
     */
    public function updateGuestData(Request $request, Reservation $reservation)
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'cpf' => 'sometimes|cpf',
            'email' => 'sometimes|email',
            'phone' => 'sometimes|phone',
            'address' => 'sometimes|string',
            'city' => 'sometimes|string',
            'state' => 'sometimes|in:AC,AL,...',
            'zip' => 'sometimes|regex:/^\d{5}-?\d{3}$/',
        ]);
        
        $guest = $this->reservationService->updateGuestData($reservation->id, $data);
        
        return response()->json(['guest' => $guest], 200);
    }
    
    /**
     * Mark reservation as no-show
     * POST /api/reservations/{id}/mark-no-show
     */
    public function markNoShow(Request $request, Reservation $reservation)
    {
        $updated = $this->reservationService->markNoShow($reservation->id);
        return response()->json($updated, 200);
    }
    
    /**
     * Finalize reservation (lock for good)
     * POST /api/reservations/{id}/finalize
     */
    public function finalize(Request $request, Reservation $reservation)
    {
        $updated = $this->reservationService->finalize($reservation->id);
        return response()->json($updated, 200);
    }
}
```

## 4. Frontend - ReservationModal (Extended)

```tsx
// Components/Calendar/ReservationModal.tsx - Additions

export default function ReservationModal({
  isOpen,
  onClose,
  onSaved,
  reservation,
  roomId,
  date,
  rooms = [],
}: Props) {
  // ... existing code ...
  
  const handleEarlyDeparture = async () => {
    if (!reservation?.id) return
    
    const newCheckoutDate = prompt('Data de saída antecipada (YYYY-MM-DD):')
    if (!newCheckoutDate) return
    
    try {
      setLoading(true)
      const result = await api.post(
        `/api/reservations/${reservation.id}/early-departure`,
        { checkout_date: newCheckoutDate }
      )
      
      setMessage({
        type: 'success',
        text: `Saída antecipada registrada. Reembolso: R$ ${result.refund_amount.toFixed(2)}`,
      })
      
      onSaved?.() // Refresh calendar
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleGuestModification = async () => {
    if (!reservation?.id) return
    
    // Desbloquear formulário de hóspede
    setEditGuestMode(true)
  }
  
  const handleGuestSave = async () => {
    try {
      setLoading(true)
      const guestData = {
        name: formData.guest_name,
        cpf: formData.guest_cpf,
        email: formData.guest_email,
        phone: formData.guest_phone,
        // ... resto dos fields
      }
      
      await api.put(
        `/api/reservations/${reservation.id}/guest-data`,
        guestData
      )
      
      setMessage({
        type: 'success',
        text: 'Dados do hóspede atualizados e enfileirados para FNRH',
      })
      
      setEditGuestMode(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleMarkNoShow = async () => {
    if (!confirm('Marcar como no-show? Esta ação não pode ser desfeita.')) return
    
    try {
      setLoading(true)
      await api.post(`/api/reservations/${reservation.id}/mark-no-show`)
      
      setMessage({
        type: 'success',
        text: 'Reserva marcada como no-show',
      })
      
      onSaved?.()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleFinalize = async () => {
    if (!confirm('Finalizar reserva? Isto bloqueará edições.')) return
    
    try {
      setLoading(true)
      await api.post(`/api/reservations/${reservation.id}/finalize`)
      
      setMessage({
        type: 'success',
        text: 'Reserva finalizada com sucesso',
      })
      
      onSaved?.()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  // Render buttons baseado em status
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes da Reserva">
      {/* ... existing fields ... */}
      
      <div className="modal-actions">
        {reservation?.status === 'checked_in' && (
          <>
            <button
              type="button"
              className="btn btn-warning"
              onClick={handleEarlyDeparture}
              disabled={loading}
            >
              ⏱️ Saída Antecipada
            </button>
            <button
              type="button"
              className="btn btn-info"
              onClick={handleGuestModification}
              disabled={loading || editGuestMode}
            >
              ✏️ Editar Dados
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleMarkNoShow}
              disabled={loading}
            >
              ⚠️ No-show
            </button>
          </>
        )}
        
        {reservation?.status === 'checked_out' && !reservation?.finalized_at && (
          <button
            type="button"
            className="btn btn-success"
            onClick={handleFinalize}
            disabled={loading}
          >
            🔒 Finalizar
          </button>
        )}
        
        {editGuestMode && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleGuestSave}
            disabled={loading}
          >
            Salvar Dados
          </button>
        )}
        
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Fechar
        </button>
      </div>
    </Modal>
  )
}
```

## 5. Database Migrations

```php
<?php

// Database/Migrations/2026_02_20_create_refund_policies.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('refund_policies', function (Blueprint $table) {
            $table->id();
            $table->uuid('property_id')->index();
            $table->integer('days_before_checkin'); // e.g., 7, 3, 0
            $table->tinyInteger('refund_percentage'); // 0-100
            $table->timestamps();
            
            $table->foreign('property_id')
                ->references('id')
                ->on('properties')
                ->onDelete('cascade');
            
            $table->unique(['property_id', 'days_before_checkin']);
        });
    }
    
    public function down(): void
    {
        Schema::dropIfExists('refund_policies');
    }
};
```

```php
<?php

// Database/Migrations/2026_02_20_update_reservations_table_phase2.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->timestamp('finalized_at')->nullable()->after('checked_out_at');
            $table->timestamp('early_departure_at')->nullable()->after('checked_out_at');
            $table->boolean('allow_guest_modifications')->default(true);
            $table->decimal('refund_amount', 10, 2)->nullable();
        });
    }
    
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['finalized_at', 'early_departure_at', 'allow_guest_modifications', 'refund_amount']);
        });
    }
};
```

---

## Tests Example

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Reservation;
use App\Models\Guest;
use App\Services\ReservationService;

class EarlyDepartureTest extends TestCase
{
    public function test_record_early_departure_reduces_price()
    {
        // Setup
        $reservation = Reservation::factory()->create([
            'start_date' => '2026-03-01',
            'end_date' => '2026-03-05', // 4 noites
            'total_value' => 400, // R$ 100/noite
            'status' => 'checked_in',
        ]);
        
        $service = new ReservationService();
        
        // Act
        $result = $service->recordEarlyDeparture($reservation->id, '2026-03-03'); // 2 noites
        
        // Assert
        $this->assertEquals(200, $result['new_total']); // R$ 100/noite × 2
        $this->assertEquals(200, $result['refund_amount']);
        
        $reservation->refresh();
        $this->assertEquals('2026-03-03', $reservation->end_date);
        $this->assertNotNull($reservation->early_departure_at);
    }
}
```

---

## This is Fase 2 Complete

Com isso, o backend estará pronto para:
- ✅ Early departure (saída antecipada com refund)
- ✅ Guest modification (correções post-check-in)
- ✅ No-show (nova marcação)
- ✅ Finalize (lock definitivo)
- ✅ Refund policy (% baseado em timing)

FNRH Outbox (Fase 4) poderá enfileirar esses 6 stages com confiança.
