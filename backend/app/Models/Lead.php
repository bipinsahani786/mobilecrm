<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Filterable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lead extends Model
{
    use Filterable, SoftDeletes;
    protected $fillable = [
        'partner_id',
        'business_name',
        'contact_person',
        'phone',
        'email',
        'status',
        'notes',
    ];

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }

    public function contacts()
    {
        return $this->hasMany(LeadContact::class)->orderBy('contacted_at', 'desc');
    }
}
