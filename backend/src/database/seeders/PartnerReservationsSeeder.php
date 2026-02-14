<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Models\Partner;
use App\Models\Reservation;
use App\Models\Room;

class PartnerReservationsSeeder extends Seeder
{
    public function run(): void
    {
        // Create a partner with 10% discount and partner billing rule
        $partner = Partner::create([
            'id' => (string) Str::uuid(),
            'name' => 'Parceiro Exemplo',
            'email' => 'parceiro@example.com',
            'phone' => null,
            'billing_rule' => 'charge_partner',
            'partner_discount_percent' => 10.0,
        ]);

        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $lastDay = (int) $now->copy()->endOfMonth()->day;

        $statuses = ['reserved', 'checked_in', 'checked_out', 'cancelado', 'confirmed'];

        // Ensure there are rooms available
        $rooms = Room::inRandomOrder()->limit(10)->get();
        if ($rooms->isEmpty()) {
            $this->command->info('No rooms found; skipping reservations seeding.');
            return;
        }

        for ($i = 0; $i < 10; $i++) {
            // pick random start day such that end fits within month
            $maxStart = max(1, $lastDay - 7);
            $day = rand(1, $maxStart);
            $length = rand(2, 7);

            $start = $startOfMonth->copy()->addDays($day - 1);
            $end = $start->copy()->addDays($length);

            $room = $rooms->random();

            $hasPartner = rand(1, 100) <= 40; // ~40% of reservations linked to partner

            // Simple pricing: flat 50 per night
            $basePerNight = 50.00;
            $total = $basePerNight * $length;

            // Occasionally create a manual override in seeded data to exercise UI
            $maybeOverride = (rand(1, 100) <= 25); // ~25% chance
            $overrideValue = $maybeOverride ? round($total * (0.8 + (rand(0,20)/100)), 2) : null;

            $reservation = Reservation::create([
                'id' => (string) Str::uuid(),
                'room_id' => $room->id,
                'partner_id' => $hasPartner ? $partner->id : null,
                'guest_name' => 'Hóspede ' . ($i + 1),
                'email' => null,
                'phone' => null,
                'adults_count' => 2,
                'children_count' => 0,
                'infants_count' => 0,
                'start_date' => $start->toDateString(),
                'end_date' => $end->toDateString(),
                'status' => $statuses[array_rand($statuses)],
                'total_value' => $overrideValue ?? $total,
                'price_override' => $overrideValue,
                'notes' => 'Seeded reservation',
            ]);

            // Create an invoice for this reservation
            try {
                $invoiceService = app(\App\Services\InvoiceService::class);

                $invoiceAmount = $reservation->total_value;
                if ($reservation->partner_id) {
                    $discount = (float) ($partner->partner_discount_percent ?? 0);
                    $invoiceAmount = round($invoiceAmount * (1 - ($discount / 100)), 2);
                }

                $invoice = $invoiceService->createInvoice([
                    'partner_id' => $reservation->partner_id,
                    'lines' => [
                        [
                            'description' => sprintf('Reserva %s', $reservation->id),
                            'quantity' => 1,
                            'unit_price' => (float) $invoiceAmount,
                        ],
                    ],
                    'status' => 'issued',
                ]);

                if ($invoice && $invoice->id) {
                    $reservation->invoice_id = $invoice->id;
                    $reservation->save();
                }
            } catch (\Throwable $e) {
                $this->command->error('Failed to create invoice for reservation ' . $reservation->id . ': ' . $e->getMessage());
            }
        }
    }
}
