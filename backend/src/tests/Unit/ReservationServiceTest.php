<?php

namespace Tests\Unit;

use App\Models\Property;
use App\Models\Room;
use App\Models\Reservation;
use App\Services\ReservationService;
use Illuminate\Support\Str;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

class ReservationServiceTest extends TestCase
{
    #[Test]
    public function should_persist_fields_when_create_called_given_valid_data()
    {
        $property = new Property(['name' => 'P6']);
        $property->id = Str::uuid()->toString();
        $property->save();

        $room = new Room([
            'property_id' => $property->id,
            'name' => 'RoomX',
        ]);
        $room->id = Str::uuid()->toString();
        $room->save();

        $svc = new ReservationService();

        $res = $svc->create([
            'room_id' => $room->id,
            'guest_name' => 'Guest',
            'adults_count' => 2,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(1)->toDateString(),
        ]);

        $this->assertInstanceOf(Reservation::class, $res);
        $this->assertEquals('Guest', $res->guest_name);
        $this->assertEquals(2, $res->adults_count);
    }

    #[Test]
    public function should_throw_validation_exception_when_create_called_given_conflicting_dates()
    {
        $this->expectException(\Illuminate\Validation\ValidationException::class);

        $property = new Property(['name' => 'P7']);
        $property->id = Str::uuid()->toString();
        $property->save();

        $room = new Room([
            'property_id' => $property->id,
            'name' => 'RoomY',
        ]);
        $room->id = Str::uuid()->toString();
        $room->save();

        $existing = new Reservation([
            'room_id' => $room->id,
            'guest_name' => 'Existing',
            'adults_count' => 1,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(3)->toDateString(),
        ]);
        $existing->id = Str::uuid()->toString();
        $existing->save();

        $svc = new ReservationService();
        // overlapping dates
        $svc->create([
            'room_id' => $room->id,
            'guest_name' => 'New',
            'adults_count' => 1,
            'start_date' => now()->addDays(1)->toDateString(),
            'end_date' => now()->addDays(2)->toDateString(),
        ]);
    }

    #[Test]
    public function should_throw_validation_exception_when_update_called_given_conflicting_dates()
    {
        $this->expectException(\Illuminate\Validation\ValidationException::class);

        $property = new Property(['name' => 'P8']);
        $property->id = Str::uuid()->toString();
        $property->save();

        $room = new Room([
            'property_id' => $property->id,
            'name' => 'RoomZ',
        ]);
        $room->id = Str::uuid()->toString();
        $room->save();

        $existing = new Reservation([
            'room_id' => $room->id,
            'guest_name' => 'Existing2',
            'adults_count' => 1,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(3)->toDateString(),
        ]);
        $existing->id = Str::uuid()->toString();
        $existing->save();

        $toUpdate = new Reservation([
            'room_id' => $room->id,
            'guest_name' => 'ToUpdate',
            'adults_count' => 1,
            'start_date' => now()->addDays(4)->toDateString(),
            'end_date' => now()->addDays(5)->toDateString(),
        ]);
        $toUpdate->id = Str::uuid()->toString();
        $toUpdate->save();

        $svc = new ReservationService();

        $svc->update($toUpdate, [
            'start_date' => now()->addDays(2)->toDateString(),
            'end_date' => now()->addDays(4)->toDateString(),
        ]);
    }
}
