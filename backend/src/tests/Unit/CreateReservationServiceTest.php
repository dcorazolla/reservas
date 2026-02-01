<?php

namespace Tests\Unit;

use App\Models\Property;
use App\Models\Room;
use App\Services\CreateReservationService;
use App\Services\ReservationPriceCalculator;
use Illuminate\Support\Str;
use Tests\TestCase;

class CreateReservationServiceTest extends TestCase
{
    /** @test */
    public function should_create_reservation_when_create_called_given_valid_capacity_and_price()
    {
        $property = new Property(['name' => 'CP1']);
        $property->id = Str::uuid()->toString();
        $property->save();

        $room = new Room(['property_id' => $property->id, 'capacity' => 2, 'name' => 'CR']);
        $room->id = Str::uuid()->toString();
        $room->save();

        // add a room rate so calculator returns a positive total
        $rate = new \App\Models\RoomRate([
            'room_id' => $room->id,
            'people_count' => 1,
            'price_per_day' => 100,
        ]);
        $rate->id = Str::uuid()->toString();
        $rate->save();

        $calculator = new ReservationPriceCalculator();
        $svc = new CreateReservationService($calculator);

        $res = $svc->create([
            'room_id' => $room->id,
            'guest_name' => 'G1',
            'adults_count' => 1,
            'children_count' => 0,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(1)->toDateString(),
        ]);

        $this->assertEquals($room->id, $res->room_id);
        $this->assertNotNull($res->total_value);
        $this->assertGreaterThan(0, $res->total_value);
    }

    /** @test */
    public function should_throw_runtime_exception_when_create_called_given_exceed_capacity()
    {
        $this->expectException(\RuntimeException::class);

        $property = new Property(['name' => 'CP2']);
        $property->id = Str::uuid()->toString();
        $property->save();

        $room = new Room(['property_id' => $property->id, 'capacity' => 1, 'name' => 'CR2']);
        $room->id = Str::uuid()->toString();
        $room->save();

        $calculator = new ReservationPriceCalculator();
        $svc = new CreateReservationService($calculator);

        $svc->create([
            'room_id' => $room->id,
            'guest_name' => 'G2',
            'adults_count' => 2,
            'children_count' => 0,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(1)->toDateString(),
        ]);
    }
}
