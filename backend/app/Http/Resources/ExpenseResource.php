<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'business_id' => $this->business_id,
            'category' => $this->category,
            'amount' => $this->amount,
            'description' => $this->description,
            'receipt_path' => $this->receipt_path ? url('storage/' . $this->receipt_path) : null,
            'added_by' => $this->added_by,
            'added_by_name' => $this->whenLoaded('addedBy', fn() => $this->addedBy->name),
            'expense_date' => $this->expense_date?->format('Y-m-d'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
