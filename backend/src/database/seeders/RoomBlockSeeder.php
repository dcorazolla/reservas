<?php

namespace Database\Seeders;

use App\Models\Property;
use App\Models\Room;
use App\Models\RoomBlock;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class RoomBlockSeeder extends Seeder
{
    public function run(): void
    {
        // Garante que a propriedade principal exista
        $property = Property::firstOrCreate(
            ['name' => 'Pousada Casa do Cerrado'],
            ['timezone' => 'America/Sao_Paulo']
        );

        $rooms = Room::where('property_id', $property->id)->get();

        if ($rooms->isEmpty()) {
            return;
        }

        // Seleciona até 3 quartos aleatoriamente
        $count = min(3, $rooms->count());
        $selected = $rooms->random($count);
        if (! $selected instanceof \Illuminate\Support\Collection) {
            $selected = collect([$selected]);
        }

        // Admin (criador) se existir
        $admin = User::where('email', 'admin@admin.com')->first();

        $startOfMonth = Carbon::now($property->timezone)->startOfMonth();
        $endOfMonth = Carbon::now($property->timezone)->endOfMonth();

        foreach ($selected as $room) {
            // duração aleatória entre 3 e 10 dias
            $length = rand(3, 10);

            // calcula intervalo de início possível para que o bloqueio caiba no mês
            $latestStart = $endOfMonth->copy()->subDays($length - 1);
            if ($latestStart->lessThan($startOfMonth)) {
                $latestStart = $startOfMonth;
            }

            $daysRange = $startOfMonth->diffInDays($latestStart);
            $addDays = ($daysRange > 0) ? rand(0, $daysRange) : 0;
            $start = $startOfMonth->copy()->addDays($addDays)->startOfDay();
            $end = $start->copy()->addDays($length - 1);

            if ($end->greaterThan($endOfMonth)) {
                $end = $endOfMonth->copy();
            }

            RoomBlock::create([
                'room_id' => $room->id,
                'start_date' => $start->toDateString(),
                'end_date' => $end->toDateString(),
                'type' => RoomBlock::TYPE_MAINTENANCE,
                'reason' => 'Seeder: bloqueio aleatório',
                'recurrence' => RoomBlock::RECURRENCE_NONE,
                'created_by' => $admin ? $admin->id : null,
            ]);
        }
    }
}
