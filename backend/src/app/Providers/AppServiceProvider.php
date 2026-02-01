<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Model as EloquentModel;
use Illuminate\Support\Str;
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
        // Auto-generate UUIDs for models that use non-incrementing string PKs
        EloquentModel::creating(function ($model) {
            // Auto-generate UUIDs for models that use string primary keys.
            // Checking the key type is more reliable than inspecting the
            // incrementing property and avoids accidentally writing UUIDs
            // into integer auto-increment columns.
            if (method_exists($model, 'getKeyType') && $model->getKeyType() === 'string' && empty($model->getKey())) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }
}
