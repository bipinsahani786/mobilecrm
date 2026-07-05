<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MessageLog extends Model
{
    protected $fillable = [
        'lead_id',
        'template_id',
        'type',
        'status',
        'error_message',
    ];

    /**
     * Get the lead that received the message.
     */
    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    /**
     * Get the template used for the message.
     */
    public function template()
    {
        return $this->belongsTo(Template::class);
    }
}
