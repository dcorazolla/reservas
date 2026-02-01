<?php

namespace Tests\Unit;

use App\Models\Property;
use App\Models\Room;
use App\Models\RoomCategory;
use App\Models\Reservation;
use App\Models\RoomRate;
use App\Services\RoomService;
use Illuminate\Support\Str;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

class RoomServiceTest extends TestCase
{
    #[Test]
    public function should_assign_property_when_create_called_given_valid_data()
    {
        $property = new Property(['name' => 'P1']);
        $property->id = Str::uuid()->toString();
        $property->save();

        $category = new RoomCategory(['name' => 'Cat1']);
        $category->id = Str::uuid()->toString();
        $category->save();

        $svc = new RoomService();

        $room = $svc->create([
            'name' => 'Room A',
            'number' => '1',
            'room_category_id' => $category->id,
            'capacity' => 2,
        ], $property->id);

        $this->assertInstanceOf(Room::class, $room);
        $this->assertEquals($property->id, $room->property_id);
        $this->assertEquals('Room A', $room->name);
    }

    #[Test]
    public function should_return_loaded_category_when_update_called_given_room()
    {
        $property = new Property(['name' => 'P2']);
        $property->id = Str::uuid()->toString();
        $property->save();

        $category = new RoomCategory(['name' => 'Cat2']);
        $category->id = Str::uuid()->toString();
        $category->save();

        $room = new Room([
            'property_id' => $property->id,
            'room_category_id' => $category->id,
            'name' => 'Old',
        ]);
        $room->id = Str::uuid()->toString();
        $room->save();

        $svc = new RoomService();

        $updated = $svc->update($room, ['name' => 'New']);

        $this->assertEquals('New', $updated->name);
        $this->assertTrue($updated->relationLoaded('category'));
    }

    #[Test]
    public function should_throw_validation_exception_when_delete_called_given_room_with_reservations()
    {
        $this->expectException(\Illuminate\Validation\ValidationException::class);

        $property = new Property(['name' => 'P3']);
        $property->id = Str::uuid()->toString();
        $property->save();

        $room = new Room([
            'property_id' => $property->id,
            'name' => 'R',
        ]);
        $room->id = Str::uuid()->toString();
        $room->save();

        $reservation = new Reservation([
            'room_id' => $room->id,
            'guest_name' => 'G1',
            'adults_count' => 1,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(1)->toDateString(),
        ]);
        $reservation->id = Str::uuid()->toString();
        $reservation->save();

        $svc = new RoomService();
        $svc->delete($room);
    }

    #[Test]
    public function should_throw_validation_exception_when_delete_called_given_room_with_rates()
    {
        $this->expectException(\Illuminate\Validation\ValidationException::class);

        $property = new Property(['name' => 'P4']);
        $property->id = Str::uuid()->toString();
        $property->save();

        $room = new Room([
            'property_id' => $property->id,
            'name' => 'R2',
        ]);
        $room->id = Str::uuid()->toString();
        $room->save();

        $rate = new RoomRate([
            'room_id' => $room->id,
            'people_count' => 1,
            'price_per_day' => 100.00,
        ]);
        $rate->id = Str::uuid()->toString();
        $rate->save();

        $svc = new RoomService();
        $svc->delete($room);
    }

    #[Test]
    public function should_delete_room_when_delete_called_given_room_without_relations()
    {
        $property = new Property(['name' => 'P5']);
        $property->id = Str::uuid()->toString();
        $property->save();

        $room = new Room([
            'property_id' => $property->id,
            'name' => 'R3',
        ]);
        $room->id = Str::uuid()->toString();
        $room->save();

        $svc = new RoomService();
        $svc->delete($room);

        $this->assertDatabaseMissing('rooms', ['id' => $room->id]);
    }
}
