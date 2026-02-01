<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\InvoiceRepositoryInterface;
use App\Repositories\EloquentInvoiceRepository;



class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind repository interfaces to implementations
        $this->app->bind(InvoiceRepositoryInterface::class, EloquentInvoiceRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // No custom bindings for now.
    }
}
