<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Casts\Attribute;
use App\Services\StorageService;

class Setting extends Model
{
    protected $fillable = ['key', 'value', 'type'];

    /**
     * Get the value formatted according to its type.
     */
    protected function value(): Attribute
    {
        return Attribute::make(
            get: function (?string $value, array $attributes) {
                if ($attributes['type'] === 'file' && $value) {
                    return str_starts_with($value, 'http') ? $value : app(StorageService::class)->getUrl($value);
                }
                return $value;
            }
        );
    }
}
