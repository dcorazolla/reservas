<?php

namespace Tests\Unit;

use App\Models\Property;
use App\Models\Room;
use App\Models\Reservation;
use App\Services\CalendarService;
use Illuminate\Support\Str;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

class CalendarServiceTest extends TestCase
{
    #[Test]
    public function should_return_rooms_with_reservations_when_getRoomsWithReservations_called_given_interval()
    {
        $property = new Property(['name' => 'CalP']);
        $property->id = Str::uuid()->toString();
        $property->save();

        $room = new Room(['property_id' => $property->id, 'name' => 'CalR']);
        $room->id = Str::uuid()->toString();
        $room->save();

        $res = new Reservation([
            'room_id' => $room->id,
            'guest_name' => 'Res',
            'adults_count' => 1,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(2)->toDateString(),
        ]);
        $res->id = Str::uuid()->toString();
        $res->save();

        $svc = new CalendarService();
        $rooms = $svc->getRoomsWithReservations($property->id, now()->toDateString(), now()->addDays(3)->toDateString());

        $this->assertNotEmpty($rooms);
        $this->assertEquals($room->id, $rooms->first()->id);
        $this->assertNotEmpty($rooms->first()->reservations);
    }
}
