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
        $properties = Property::all();

        foreach ($properties as $property) {
            // Criar política padrão: Fixed Timeline
            $policy = CancellationPolicy::firstOrCreate(
                ['property_id' => $property->id],
                [
                    'name' => 'Política Padrão',
                    'type' => 'fixed_timeline',
                    'description' => 'Cancelamento com cascata de dias simples',
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

            // Criar regras padrão
            $rules = [
                [
                    'days_before_checkin_min' => 7,
                    'days_before_checkin_max' => 999,
                    'refund_percent' => 100,
                    'label' => 'Cancelamento com 7+ dias',
                    'priority' => 3,
                    'penalty_type' => 'fixed',
                    'penalty_amount' => 0,
                ],
                [
                    'days_before_checkin_min' => 3,
                    'days_before_checkin_max' => 6,
                    'refund_percent' => 50,
                    'label' => 'Cancelamento com 3-6 dias',
                    'priority' => 2,
                    'penalty_type' => 'fixed',
                    'penalty_amount' => null,
                ],
                [
                    'days_before_checkin_min' => 0,
                    'days_before_checkin_max' => 2,
                    'refund_percent' => 0,
                    'label' => 'Cancelamento com < 3 dias',
                    'priority' => 1,
                    'penalty_type' => 'fixed',
                    'penalty_amount' => null,
                ],
            ];

            foreach ($rules as $ruleData) {
                CancellationRefundRule::updateOrCreate(
                    [
                        'policy_id' => $policy->id,
                        'days_before_checkin_min' => $ruleData['days_before_checkin_min'],
                        'days_before_checkin_max' => $ruleData['days_before_checkin_max'],
                    ],
                    $ruleData
                );
            }
        }
    }
}
