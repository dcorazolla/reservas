<?php

namespace App\Services;

use App\Models\Reservation;
use App\Models\CancellationPolicy;
use App\Models\FinancialAuditLog;
use Carbon\Carbon;
use Exception;

class CancellationService
{
    /**
     * Calcula reembolso baseado na política de cancelamento da propriedade
     *
     * @param Reservation $reservation
     * @param Carbon|null $cancelledAt (default = now)
     * @return array ['refund_amount' => decimal, 'refund_percent' => int, 'retained_amount' => decimal, 'reason' => string, 'policy_id' => string|null]
     */
    public function calculateRefund(Reservation $reservation, ?Carbon $cancelledAt = null): array
    {
        $cancelledAt = $cancelledAt ?? now();

        // 1. Get property_id from room relationship
        $propertyId = $reservation->room->property_id ?? null;
        
        if (!$propertyId) {
            return [
                'refund_amount' => 0,
                'refund_percent' => 0,
                'retained_amount' => $reservation->total_value ?? 0,
                'reason' => 'Reserva sem quarto válido',
                'policy_id' => null,
                'rule_id' => null,
            ];
        }

        // 2. Buscar política ativa da propriedade
        $policy = CancellationPolicy::where('property_id', $propertyId)
            ->active()
            ->applicableAt($cancelledAt->toDateString())
            ->first();

        if (!$policy) {
            // Sem política ativa = sem reembolso
            return [
                'refund_amount' => 0,
                'refund_percent' => 0,
                'retained_amount' => $reservation->total_value ?? 0,
                'reason' => 'Nenhuma política de cancelamento ativa',
                'policy_id' => null,
                'rule_id' => null,
            ];
        }

        // 3. Calcular dias até check-in
        $startDate = Carbon::parse($reservation->start_date);
        // Calculate days between cancellation and check-in
        // If start_date is in the future (from cancelledAt), this will be positive
        $daysUntilCheckin = (int) $cancelledAt->diffInDays($startDate, absolute: false);
        // If it's negative, the checkin is in the past - invalid cancellation
        if ($daysUntilCheckin < 0) {
            return [
                'refund_amount' => 0,
                'refund_percent' => 0,
                'retained_amount' => $reservation->total_value ?? 0,
                'reason' => 'Cancelamento após check-in',
                'policy_id' => $policy->id,
                'rule_id' => null,
            ];
        }

        // 4. Buscar regra aplicável (ordenada por prioridade)
        $applicableRule = $policy->rules()
            ->orderedByPriority()
            ->get()
            ->first(function ($rule) use ($daysUntilCheckin) {
                return $daysUntilCheckin >= $rule->days_before_checkin_min
                    && $daysUntilCheckin <= $rule->days_before_checkin_max;
            });

        if (!$applicableRule) {
            // Sem regra aplicável = política mais restritiva
            return [
                'refund_amount' => 0,
                'refund_percent' => 0,
                'retained_amount' => $reservation->total_value ?? 0,
                'reason' => 'Cancelamento fora das datas permitidas',
                'policy_id' => $policy->id,
                'rule_id' => null,
            ];
        }

        // 4. Calcular valores
        $totalValue = $reservation->total_value ?? 0;
        $refundPercent = (int) $applicableRule->refund_percent;
        $refundAmount = $totalValue * ($refundPercent / 100);
        $retainedAmount = $totalValue - $refundAmount;

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
     * Processa cancelamento: atualiza status, cria invoice de reembolso, auditoria
     *
     * @param Reservation $reservation
     * @param string|null $reason
     * @throws Exception
     */
    public function processCancel(Reservation $reservation, ?string $reason = null): void
    {
        // 1. Calcular reembolso
        $refundCalc = $this->calculateRefund($reservation);

        // 2. Atualizar reserva
        $reservation->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $reason,
            'cancellation_refund_calc' => json_encode($refundCalc),
        ]);

        // 3. Registrar auditoria financeira usando schema correto
        $auditData = [
            'event_type' => 'cancellation_processed',
            'resource_type' => 'Reservation',
            'resource_id' => $reservation->id,
            'payload' => json_encode([
                'refund_amount' => $refundCalc['refund_amount'],
                'refund_percent' => $refundCalc['refund_percent'],
                'retained_amount' => $refundCalc['retained_amount'],
                'reason' => $refundCalc['reason'],
                'user_reason' => $reason,
                'policy_id' => $refundCalc['policy_id'],
                'rule_id' => $refundCalc['rule_id'],
            ]),
        ];

        // Adicionar user_id apenas se houver usuário autenticado
        if (auth()->check()) {
            $auditData['user_id'] = auth()->id();
        }

        FinancialAuditLog::create($auditData);

        // 4. Criar invoice de reembolso (negativa) se houver refund
        if ($refundCalc['refund_amount'] > 0) {
            $this->createRefundInvoice($reservation, $refundCalc);
        }
    }

    /**
     * Criar invoice de reembolso (negativa = crédito ao cliente)
     *
     * @param Reservation $reservation
     * @param array $refundCalc
     */
    protected function createRefundInvoice(Reservation $reservation, array $refundCalc): void
    {
        // TODO: Implementar em FASE 3 (Financial Integration)
        // Por enquanto, apenas log
        logger()->info('Refund invoice would be created for reservation ' . $reservation->id, $refundCalc);
    }
}
