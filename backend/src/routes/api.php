<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CalendarController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\RoomCategoryController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\RoomRateController;
use App\Http\Controllers\Api\RoomRatePeriodController;
use App\Http\Controllers\Api\PropertyPricingController;
use App\Http\Controllers\Api\PropertyController;
use App\Http\Controllers\Api\RoomCategoryRateController;
use App\Http\Controllers\Api\RoomCategoryRatePeriodController;
use App\Http\Controllers\Api\AvailabilityController;
use App\Http\Controllers\Api\ReservationPriceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PartnerController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\PaymentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Aqui estão as rotas da API protegidas pelo JWT e sessões.
|
*/

// Login/refresh públicos
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/refresh', [AuthController::class, 'refresh']);

// Grupo de rotas protegidas pelo JWT
Route::middleware(['auth:api'])->group(function () {

    // Rotas de autenticação
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/logout-all', [AuthController::class, 'logoutAll']);

    // Calendário
    Route::get('/calendar', [CalendarController::class, 'index']);

    // Reservas
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::put('/reservations/{reservation}', [ReservationController::class, 'update']);
    Route::post('/reservations/{reservation}/checkin', [ReservationController::class, 'checkin']);
    Route::post('/reservations/{reservation}/checkout', [ReservationController::class, 'checkout']);
    Route::get('/reservations/{reservation}', [ReservationController::class, 'show']);
    Route::post('/reservations/calculate', [ReservationPriceController::class, 'calculate']);
    Route::post('/reservations/calculate-detailed', [ReservationPriceController::class, 'calculateDetailed']);
    Route::post('/availability/search', [AvailabilityController::class, 'search']);

    // Categorias e quartos
    Route::apiResource('room-categories', RoomCategoryController::class);
    Route::apiResource('rooms', RoomController::class);

    // Tarifários
    Route::get('/properties/pricing', [PropertyPricingController::class, 'show']);
    Route::put('/properties/pricing', [PropertyPricingController::class, 'update']);

    // Propriedades
    Route::apiResource('properties', PropertyController::class);

    // Partners & billing
    Route::apiResource('partners', PartnerController::class);

    // Minibar consumptions (housekeeping / front desk)
    Route::get('/minibar-consumptions', [\App\Http\Controllers\Api\MinibarConsumptionController::class, 'index']);
    Route::post('/minibar-consumptions', [\App\Http\Controllers\Api\MinibarConsumptionController::class, 'store']);
    Route::delete('/minibar-consumptions/{minibarConsumption}', [\App\Http\Controllers\Api\MinibarConsumptionController::class, 'destroy']);

    // Room blocks (maintenance / partner blocks)
    Route::get('/room-blocks', [\App\Http\Controllers\Api\RoomBlockController::class, 'index']);
    Route::post('/room-blocks', [\App\Http\Controllers\Api\RoomBlockController::class, 'store']);
    Route::put('/room-blocks/{roomBlock}', [\App\Http\Controllers\Api\RoomBlockController::class, 'update']);
    Route::delete('/room-blocks/{roomBlock}', [\App\Http\Controllers\Api\RoomBlockController::class, 'destroy']);

    // Invoices & payments
    Route::get('/invoices', [InvoiceController::class, 'index']);
    Route::post('/invoices', [InvoiceController::class, 'store']);
    Route::post('/invoices/from-reservations', [InvoiceController::class, 'createFromReservations']);
    Route::get('/invoices/{invoice}', [InvoiceController::class, 'show']);
    Route::put('/invoices/{invoice}', [InvoiceController::class, 'update']);
    Route::post('/invoices/{invoice}/cancel', [InvoiceController::class, 'cancel']);
    Route::get('/invoices/{invoice_id}/payments', [PaymentController::class, 'index']);
    Route::post('/invoices/{invoice_id}/payments', [PaymentController::class, 'store']);

    Route::get('/rooms/{room}/rates', [RoomRateController::class, 'index']);
    Route::post('/rooms/{room}/rates', [RoomRateController::class, 'store']);
    Route::put('/room-rates/{rate}', [RoomRateController::class, 'update']);
    Route::delete('/room-rates/{rate}', [RoomRateController::class, 'destroy']);

    Route::get('/rooms/{room}/rate-periods', [RoomRatePeriodController::class, 'index']);
    Route::post('/rooms/{room}/rate-periods', [RoomRatePeriodController::class, 'store']);
    Route::put('/room-rate-periods/{period}', [RoomRatePeriodController::class, 'update']);
    Route::delete('/room-rate-periods/{period}', [RoomRatePeriodController::class, 'destroy']);

    Route::get('/room-categories/{roomCategory}/rates', [RoomCategoryRateController::class, 'index']);
    Route::post('/room-categories/{roomCategory}/rates', [RoomCategoryRateController::class, 'store']);
    Route::put('/room-category-rates/{rate}', [RoomCategoryRateController::class, 'update']);
    Route::delete('/room-category-rates/{rate}', [RoomCategoryRateController::class, 'destroy']);

    Route::get('/room-categories/{roomCategory}/rate-periods', [RoomCategoryRatePeriodController::class, 'index']);
    Route::post('/room-categories/{roomCategory}/rate-periods', [RoomCategoryRatePeriodController::class, 'store']);
    Route::put('/room-category-rate-periods/{period}', [RoomCategoryRatePeriodController::class, 'update']);
    Route::delete('/room-category-rate-periods/{period}', [RoomCategoryRatePeriodController::class, 'destroy']);
});
