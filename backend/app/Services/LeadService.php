<?php

namespace App\Services;

use App\Models\Lead;
use App\Models\LeadContact;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class LeadService
{
    /**
     * Get paginated and filtered leads list.
     */
    public function getPaginatedLeads(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Lead::with('partner')
            ->withCount('contacts')
            ->with(['contacts' => function ($q) {
                $q->orderBy('contacted_at', 'desc')->limit(1);
            }])
            ->filterByFields($filters, [
                'status',
                'partner_id',
            ])
            ->search($filters['search'] ?? null, [
                'business_name',
                'contact_person',
                'phone',
                'email'
            ]);

        if (!empty($filters['from_date'])) {
            $query->whereDate('created_at', '>=', $filters['from_date']);
        }
        if (!empty($filters['to_date'])) {
            $query->whereDate('created_at', '<=', $filters['to_date']);
        }

        // Filter by follow-up date (relationship query fallback)
        if (!empty($filters['follow_up_date'])) {
            $query->whereHas('contacts', function ($q) use ($filters) {
                $q->whereDate('next_contact_at', $filters['follow_up_date']);
            });
        }

        // Filter by contact outcome
        if (!empty($filters['outcome'])) {
            $query->whereHas('contacts', function ($q) use ($filters) {
                $q->where('outcome', $filters['outcome']);
            });
        }

        $query->sort(
            $filters['sort_by'] ?? null,
            $filters['sort_order'] ?? null,
            ['created_at', 'business_name', 'contact_person', 'status']
        );

        // Paginate
        $paginator = $query->paginate($perPage);

        // Map last contact
        $paginator->getCollection()->transform(function ($lead) {
            $lead->last_contact = $lead->contacts->first();
            unset($lead->contacts);
            return $lead;
        });

        return $paginator;
    }

    /**
     * Create a new lead.
     */
    public function createLead(array $data): Lead
    {
        return Lead::create($data);
    }

    /**
     * Update an existing lead.
     */
    public function updateLead(int $id, array $data): Lead
    {
        $lead = Lead::findOrFail($id);
        $lead->update($data);
        return $lead;
    }

    /**
     * Delete a lead.
     */
    public function deleteLead(int $id): void
    {
        Lead::findOrFail($id)->delete();
    }

    /**
     * Get contact logs for a lead.
     */
    public function getLeadContacts(int $leadId)
    {
        $lead = Lead::findOrFail($leadId);
        return $lead->contacts;
    }

    /**
     * Log a new contact history entry.
     */
    public function logLeadContact(int $leadId, array $data): LeadContact
    {
        $lead = Lead::findOrFail($leadId);
        $data['lead_id'] = $lead->id;
        
        $contact = LeadContact::create($data);

        // Update lead status if contact shows progression
        if ($data['outcome'] !== 'no_answer' && $lead->status === 'new') {
            $lead->update(['status' => 'contacted']);
        }

        return $contact;
    }

    /**
     * Get aggregate statistics for leads.
     */
    public function getLeadStats(): array
    {
        $total = Lead::count();
        $newCount = Lead::where('status', 'new')->count();
        $contacted = Lead::where('status', 'contacted')->count();
        $converted = Lead::where('status', 'converted')->count();
        $lost = Lead::where('status', 'lost')->count();
        $rate = $total ? (int) round(($converted / $total) * 100) : 0;

        return [
            'total' => $total,
            'newCount' => $newCount,
            'contacted' => $contacted,
            'converted' => $converted,
            'lost' => $lost,
            'rate' => $rate,
        ];
    }
}
