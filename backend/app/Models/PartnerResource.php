<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PartnerResource extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'file_path',
        'file_type',
        'file_size',
        'is_active',
    ];
    
    protected $casts = [
        'is_active' => 'boolean',
        'file_size' => 'integer',
    ];

    protected $appends = ['public_url'];

    public function getPublicUrlAttribute()
    {
        return $this->file_path ? \Illuminate\Support\Facades\Storage::disk('s3')->url($this->file_path) : null;
    }
}
