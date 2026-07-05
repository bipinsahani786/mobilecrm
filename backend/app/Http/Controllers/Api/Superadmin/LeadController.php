<?php

namespace App\Http\Controllers\Api\Superadmin;

use App\Http\Controllers\BaseController;
use App\Models\Lead;
use App\Models\LeadContact;
use App\Services\LeadService;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class LeadController extends BaseController
{
    protected $leadService;

    /**
     * Inject the LeadService dependency.
     */
    public function __construct(LeadService $leadService)
    {
        $this->leadService = $leadService;
    }

    // ─── LEADS CRUD ──────────────────────────────────────────────

    #[OA\Get(path: '/superadmin/leads', summary: 'List Leads', tags: ['Superadmin - Leads'], security: [['sanctum' => []]], responses: [new OA\Response(response: 200, description: 'OK')])]
    public function index(Request $request)
    {
        // Support either returning all data (backward compatibility) or paginated data
        if ($request->input('all') === 'true' || $request->input('per_page') == -1) {
            $leads = Lead::with('partner')
                ->withCount('contacts')
                ->with(['contacts' => function ($q) {
                    $q->orderBy('contacted_at', 'desc')->limit(1);
                }])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($lead) {
                    $lead->last_contact = $lead->contacts->first();
                    unset($lead->contacts);
                    return $lead;
                });
            return $this->success($leads, 'Leads retrieved successfully');
        }

        $filters = $request->only(['status', 'partner_id', 'search', 'follow_up_date', 'outcome', 'sort_by', 'sort_order', 'from_date', 'to_date']);
        $perPage = $request->input('per_page', 10);

        $paginator = $this->leadService->getPaginatedLeads($filters, $perPage);
        return $this->paginated($paginator, 'Leads retrieved successfully');
    }

    #[OA\Get(path: '/superadmin/leads/stats', summary: 'Get Leads Stats', tags: ['Superadmin - Leads'], security: [['sanctum' => []]], responses: [new OA\Response(response: 200, description: 'OK')])]
    public function stats()
    {
        $stats = $this->leadService->getLeadStats();
        return $this->success($stats, 'Leads stats retrieved successfully');
    }

    #[OA\Post(path: '/superadmin/leads', summary: 'Create Lead', tags: ['Superadmin - Leads'], security: [['sanctum' => []]], responses: [new OA\Response(response: 200, description: 'Created')])]
    public function store(Request $request)
    {
        $validated = $request->validate([
            'partner_id'     => 'required|exists:partners,id',
            'business_name'  => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'phone'          => 'nullable|string|max:20',
            'email'          => 'nullable|email|max:255',
            'status'         => 'required|in:new,contacted,converted,lost',
            'notes'          => 'nullable|string',
        ]);

        $lead = $this->leadService->createLead($validated);
        return $this->success($lead->load('partner'), 'Lead created successfully');
    }

    #[OA\Get(path: '/superadmin/leads/{id}', summary: 'Get Lead', tags: ['Superadmin - Leads'], security: [['sanctum' => []]], parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'OK')])]
    public function show($id)
    {
        $lead = Lead::with(['partner', 'contacts'])->findOrFail($id);
        return $this->success($lead, 'Lead retrieved successfully');
    }

    #[OA\Patch(path: '/superadmin/leads/{id}', summary: 'Update Lead', tags: ['Superadmin - Leads'], security: [['sanctum' => []]], parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'Updated')])]
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'partner_id'     => 'sometimes|required|exists:partners,id',
            'business_name'  => 'sometimes|required|string|max:255',
            'contact_person' => 'sometimes|required|string|max:255',
            'phone'          => 'nullable|string|max:20',
            'email'          => 'nullable|email|max:255',
            'status'         => 'sometimes|required|in:new,contacted,converted,lost',
            'notes'          => 'nullable|string',
        ]);
        $lead = $this->leadService->updateLead($id, $validated);
        return $this->success($lead, 'Lead updated successfully');
    }

    #[OA\Delete(path: '/superadmin/leads/{id}', summary: 'Delete Lead', tags: ['Superadmin - Leads'], security: [['sanctum' => []]], parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'Deleted')])]
    public function destroy($id)
    {
        $this->leadService->deleteLead($id);
        return $this->success(null, 'Lead deleted successfully');
    }

    // ─── CONTACT HISTORY ─────────────────────────────────────────

    #[OA\Get(path: '/superadmin/leads/{id}/contacts', summary: 'List Contact History', tags: ['Superadmin - Leads'], security: [['sanctum' => []]], parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'OK')])]
    public function contacts($id)
    {
        $contacts = $this->leadService->getLeadContacts($id);
        return $this->success($contacts, 'Contact history retrieved');
    }

    #[OA\Post(path: '/superadmin/leads/{id}/contacts', summary: 'Log Contact', tags: ['Superadmin - Leads'], security: [['sanctum' => []]], parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'Logged')])]
    public function logContact(Request $request, $id)
    {
        $validated = $request->validate([
            'contacted_by'   => 'nullable|string|max:255',
            'contacted_at'   => 'required|date',
            'outcome'        => 'required|in:called,emailed,whatsapp,visited,no_answer',
            'notes'          => 'nullable|string',
            'next_contact_at' => 'nullable|date',
        ]);

        $contact = $this->leadService->logLeadContact($id, $validated);
        return $this->success($contact, 'Contact logged successfully');
    }

    #[OA\Delete(path: '/superadmin/leads/{leadId}/contacts/{contactId}', summary: 'Delete Contact Entry', tags: ['Superadmin - Leads'], security: [['sanctum' => []]], parameters: [new OA\Parameter(name: 'leadId', in: 'path', required: true, schema: new OA\Schema(type: 'integer')), new OA\Parameter(name: 'contactId', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'Deleted')])]
    public function deleteContact($leadId, $contactId)
    {
        LeadContact::where('lead_id', $leadId)->findOrFail($contactId)->delete();
        return $this->success(null, 'Contact entry deleted');
    }

    // ─── EXCEL IMPORT ─────────────────────────────────────────────

    #[OA\Post(path: '/superadmin/leads/import', summary: 'Import Leads from Excel/CSV', tags: ['Superadmin - Leads'], security: [['sanctum' => []]], responses: [new OA\Response(response: 200, description: 'Imported')])]
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx,xls|max:5120',
        ]);

        $file = $request->file('file');
        $extension = $file->getClientOriginalExtension();

        if ($extension === 'csv') {
            $rows = array_map('str_getcsv', file($file->getRealPath()));
        } else {
            return $this->error('Only CSV files are supported currently. Please export as CSV.', 422);
        }

        if (empty($rows) || count($rows) < 2) {
            return $this->error('File is empty or missing data rows', 422);
        }

        $headers = array_map('strtolower', array_map('trim', $rows[0]));
        $required = ['business_name', 'contact_person', 'status'];

        foreach ($required as $col) {
            if (!in_array($col, $headers)) {
                return $this->error("Missing required column: {$col}", 422);
            }
        }

        $imported = 0;
        $errors   = [];

        for ($i = 1; $i < count($rows); $i++) {
            if (count($rows[$i]) !== count($headers)) continue;
            $row = array_combine($headers, $rows[$i]);

            // Resolve partner by referral_code if partner_id not given
            $partnerId = null;
            if (!empty($row['partner_id'])) {
                $partnerId = (int) $row['partner_id'];
            } elseif (!empty($row['referral_code'])) {
                $partner = \App\Models\Partner::where('referral_code', strtoupper(trim($row['referral_code'])))->first();
                $partnerId = $partner?->id;
            }

            try {
                $this->leadService->createLead([
                    'partner_id'     => $partnerId,
                    'business_name'  => trim($row['business_name']),
                    'contact_person' => trim($row['contact_person']),
                    'phone'          => trim($row['phone'] ?? ''),
                    'email'          => trim($row['email'] ?? ''),
                    'status'         => in_array(trim($row['status'] ?? ''), ['new','contacted','converted','lost'])
                                        ? trim($row['status']) : 'new',
                    'notes'          => trim($row['notes'] ?? ''),
                ]);
                $imported++;
            } catch (\Exception $e) {
                $errors[] = "Row " . ($i + 1) . ": " . $e->getMessage();
            }
        }

        return $this->success(
            ['imported' => $imported, 'errors' => $errors],
            "{$imported} leads imported successfully"
        );
    }
}
