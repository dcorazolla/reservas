<?php

namespace App\Http\Controllers;

use App\Models\CancellationPolicy;
use App\Models\CancellationRefundRule;
use App\Models\Reservation;
use App\Services\CancellationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CancellationPolicyController extends Controller
{
    protected CancellationService $cancellationService;

    public function __construct(CancellationService $cancellationService)
    {
        $this->cancellationService = $cancellationService;
    }

    /**
     * GET /api/properties/{property_id}/cancellation-policy
     * Buscar política de cancelamento da propriedade
     */
    public function show(Request $request, string $propertyId): JsonResponse
    {
        $propertyId = $this->getPropertyId($request);

        $policy = CancellationPolicy::where('property_id', $propertyId)->first();

        if (!$policy) {
            return response()->json([
                'error' => 'Política de cancelamento não encontrada',
            ], 404);
        }

        return response()->json([
            'id' => $policy->id,
            'property_id' => $policy->property_id,
            'name' => $policy->name,
            'description' => $policy->description,
            'type' => $policy->type,
            'config' => $policy->config,
            'active' => $policy->active,
            'applies_from' => $policy->applies_from?->format('Y-m-d'),
            'applies_to' => $policy->applies_to?->format('Y-m-d'),
            'rules' => $policy->rules()
                ->orderedByPriority()
                ->get()
                ->map(fn ($rule) => [
                    'id' => $rule->id,
                    'days_before_checkin_min' => $rule->days_before_checkin_min,
                    'days_before_checkin_max' => $rule->days_before_checkin_max,
                    'refund_percent' => $rule->refund_percent,
                    'penalty_type' => $rule->penalty_type,
                    'penalty_amount' => $rule->penalty_amount,
                    'label' => $rule->label,
                    'priority' => $rule->priority,
                ]),
        ]);
    }

    /**
     * PUT /api/properties/{property_id}/cancellation-policy
     * Atualizar política de cancelamento
     */
    public function update(Request $request, string $propertyId): JsonResponse
    {
        $propertyId = $this->getPropertyId($request);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'type' => 'required|in:fixed_timeline,percentage_cascade,free_until_date,seasonal',
            'config' => 'nullable|array',
            'active' => 'boolean',
            'applies_from' => 'nullable|date',
            'applies_to' => 'nullable|date',
            'rules' => 'required|array',
            'rules.*.days_before_checkin_min' => 'required|integer|min:0',
            'rules.*.days_before_checkin_max' => 'required|integer|min:0',
            'rules.*.refund_percent' => 'required|numeric|min:0|max:100',
            'rules.*.penalty_type' => 'in:fixed,percentage',
            'rules.*.penalty_amount' => 'nullable|numeric|min:0',
            'rules.*.label' => 'nullable|string',
            'rules.*.priority' => 'nullable|integer',
        ]);

        // Buscar ou criar política
        $policy = CancellationPolicy::firstOrCreate(
            ['property_id' => $propertyId],
            [
                'name' => $validated['name'],
                'type' => $validated['type'],
                'created_by_id' => auth()->id(),
            ]
        );

        // Atualizar política
        $policy->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'config' => $validated['config'] ?? null,
            'active' => $validated['active'] ?? true,
            'applies_from' => $validated['applies_from'] ?? now()->toDateString(),
            'applies_to' => $validated['applies_to'] ?? null,
        ]);

        // Excluir regras antigas
        $policy->rules()->delete();

        // Criar novas regras
        foreach ($validated['rules'] as $ruleData) {
            CancellationRefundRule::create([
                'policy_id' => $policy->id,
                'days_before_checkin_min' => $ruleData['days_before_checkin_min'],
                'days_before_checkin_max' => $ruleData['days_before_checkin_max'],
                'refund_percent' => $ruleData['refund_percent'],
                'penalty_type' => $ruleData['penalty_type'] ?? 'fixed',
                'penalty_amount' => $ruleData['penalty_amount'] ?? null,
                'label' => $ruleData['label'] ?? null,
                'priority' => $ruleData['priority'] ?? 0,
            ]);
        }

        return response()->json([
            'message' => 'Política atualizada com sucesso',
            'policy_id' => $policy->id,
        ]);
    }

    /**
     * GET /api/cancellation-policy-templates
     * Listar templates pré-built de políticas
     */
    public function templates(): JsonResponse
    {
        return response()->json([
            [
                'id' => 'fixed_timeline',
                'name' => 'Cascata de Dias Simples',
                'type' => 'fixed_timeline',
                'description' => 'Reembolso baseado em dias de antecedência com 3 níveis',
                'rules' => [
                    [
                        'days_before_checkin_min' => 7,
                        'days_before_checkin_max' => 999,
                        'refund_percent' => 100,
                        'label' => '7+ dias',
                        'priority' => 3,
                    ],
                    [
                        'days_before_checkin_min' => 3,
                        'days_before_checkin_max' => 6,
                        'refund_percent' => 50,
                        'label' => '3-6 dias',
                        'priority' => 2,
                    ],
                    [
                        'days_before_checkin_min' => 0,
                        'days_before_checkin_max' => 2,
                        'refund_percent' => 0,
                        'label' => '< 3 dias',
                        'priority' => 1,
                    ],
                ],
            ],
            [
                'id' => 'percentage_cascade',
                'name' => 'Cascata com Percentual',
                'type' => 'percentage_cascade',
                'description' => 'Reembolso em cascata com penalidades específicas',
                'rules' => [
                    [
                        'days_before_checkin_min' => 21,
                        'days_before_checkin_max' => 999,
                        'refund_percent' => 100,
                        'label' => '21+ dias',
                        'priority' => 4,
                    ],
                    [
                        'days_before_checkin_min' => 14,
                        'days_before_checkin_max' => 20,
                        'refund_percent' => 75,
                        'label' => '14-20 dias',
                        'priority' => 3,
                    ],
                    [
                        'days_before_checkin_min' => 7,
                        'days_before_checkin_max' => 13,
                        'refund_percent' => 50,
                        'label' => '7-13 dias',
                        'priority' => 2,
                    ],
                    [
                        'days_before_checkin_min' => 0,
                        'days_before_checkin_max' => 6,
                        'refund_percent' => 0,
                        'label' => '< 7 dias',
                        'priority' => 1,
                    ],
                ],
            ],
            [
                'id' => 'free_until_date',
                'name' => 'Livre Até Data',
                'type' => 'free_until_date',
                'description' => 'Cancelamento livre até N dias antes do check-in',
                'rules' => [
                    [
                        'days_before_checkin_min' => 10,
                        'days_before_checkin_max' => 999,
                        'refund_percent' => 100,
                        'label' => 'Cancele grátis até 10 dias',
                        'priority' => 2,
                    ],
                    [
                        'days_before_checkin_min' => 0,
                        'days_before_checkin_max' => 9,
                        'refund_percent' => 50,
                        'label' => '< 10 dias',
                        'priority' => 1,
                    ],
                ],
            ],
        ]);
    }

    /**
     * GET /api/reservations/{reservation_id}/preview-cancellation
     * Preview de reembolso sem processar cancelamento
     */
    public function previewCancellation(Request $request, string $reservationId): JsonResponse
    {
        $propertyId = $this->getPropertyId($request);

        $reservation = Reservation::findOrFail($reservationId);
        // Check that the reservation's room belongs to the user's property
        $this->assertBelongsToProperty($reservation->room, $propertyId);

        $refundCalc = $this->cancellationService->calculateRefund($reservation);

        return response()->json([
            'refund_amount' => $refundCalc['refund_amount'],
            'refund_percent' => $refundCalc['refund_percent'],
            'retained_amount' => $refundCalc['retained_amount'],
            'reason' => $refundCalc['reason'],
            'policy_id' => $refundCalc['policy_id'],
            'message' => sprintf(
                'Cancelamento resulta em reembolso de R$ %.2f (%.0f%%)',
                $refundCalc['refund_amount'],
                $refundCalc['refund_percent']
            ),
        ]);
    }

    /**
     * POST /api/reservations/{reservation_id}/cancel
     * Processar cancelamento com refund
     */
    public function cancel(Request $request, string $reservationId): JsonResponse
    {
        $propertyId = $this->getPropertyId($request);

        $reservation = Reservation::findOrFail($reservationId);
        // Check that the reservation's room belongs to the user's property
        $this->assertBelongsToProperty($reservation->room, $propertyId);

        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $this->cancellationService->processCancel($reservation, $validated['reason'] ?? null);

        return response()->json([
            'status' => 'cancelled',
            'message' => 'Reserva cancelada com sucesso',
            'reservation_id' => $reservation->id,
        ]);
    }

    /**
     * Helper: assert resource belongs to property
     */
    protected function assertBelongsToProperty($resource, string $propertyId): void
    {
        if ($resource->property_id !== $propertyId) {
            abort(403, 'Recurso não pertence à propriedade');
        }
    }
}
