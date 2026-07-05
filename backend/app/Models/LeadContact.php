<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\SoftDeletes;

class LeadContact extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'lead_id',
        'contacted_by',
        'contacted_at',
        'outcome',
        'notes',
        'next_contact_at',
    ];

    protected $casts = [
        'contacted_at'   => 'datetime',
        'next_contact_at' => 'datetime',
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
}
