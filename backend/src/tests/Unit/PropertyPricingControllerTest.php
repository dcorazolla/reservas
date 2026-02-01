<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Http\Request;
use App\Models\Property;

class PropertyPricingControllerTest extends TestCase
{
    public function test_show_returns_property_pricing()
    {
        $property = Property::create([
            'name' => 'Prop A',
            'timezone' => 'UTC',
            'base_one_adult' => 100.0,
            'base_two_adults' => 150.0,
            'additional_adult' => 50.0,
            'child_price' => 25.0,
            'infant_max_age' => 2,
            'child_max_age' => 12,
            'child_factor' => 0.5,
        ]);

        $controller = new \App\Http\Controllers\Api\PropertyPricingController();

        $request = new Request();
        $request->attributes->set('property_id', (string) $property->id);

        $resp = $controller->show($request);

        $this->assertEquals(200, $resp->getStatusCode());
        $data = $resp->getData(true);
        $this->assertEquals(100.0, $data['base_one_adult']);
        $this->assertEquals(0.5, $data['child_factor']);
    }

    public function test_update_validates_updates_and_returns_new_values()
    {
        $property = Property::create([
            'name' => 'Prop B',
            'timezone' => 'UTC',
            'base_one_adult' => 80.0,
            'base_two_adults' => 120.0,
            'additional_adult' => 40.0,
            'child_price' => 20.0,
            'infant_max_age' => 2,
            'child_max_age' => 12,
            'child_factor' => 0.6,
        ]);

        $validated = [
            'base_one_adult' => 90.0,
            'child_factor' => 0.4,
        ];

        $controller = new \App\Http\Controllers\Api\PropertyPricingController();

        $request = new class($validated) extends Request {
            private $v;
            public function __construct($v)
            {
                parent::__construct();
                $this->v = $v;
            }
            public function validate($rules)
            {
                return $this->v;
            }
        };

        $request->attributes->set('property_id', (string) $property->id);

        $resp = $controller->update($request);

        $this->assertEquals(200, $resp->getStatusCode());
        $data = $resp->getData(true);
        $this->assertEquals(90.0, $data['base_one_adult']);
        $this->assertEquals(0.4, $data['child_factor']);
    }
}
