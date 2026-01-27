<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CalendarController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\RoomCategoryController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\ReservationPriceController;
use App\Http\Controllers\Api\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Aqui estão as rotas da API protegidas pelo JWT e sessões.
|
*/

// Login público
Route::post('/auth/login', [AuthController::class, 'login']);

// Grupo de rotas protegidas pelo JWT
Route::middleware(['auth:api', 'jwt.session'])->group(function () {

    // Rotas de autenticação
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/logout-all', [AuthController::class, 'logoutAll']);

    // Calendário
    Route::get('/calendar', [CalendarController::class, 'index']);

    // Reservas
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::put('/reservations/{reservation}', [ReservationController::class, 'update']);
    Route::get('/reservations/{reservation}', [ReservationController::class, 'show']);
    Route::post('/reservations/calculate', [ReservationPriceController::class, 'calculate']);

    // Categorias e quartos
    Route::apiResource('room-categories', RoomCategoryController::class);
    Route::apiResource('rooms', RoomController::class);
});
