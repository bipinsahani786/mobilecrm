<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Template;
use App\Models\Lead;
use App\Models\MessageLog;
use Illuminate\Support\Facades\Log;

class SendBulkMessageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected array $leadIds;
    protected Template $template;

    /**
     * Create a new job instance.
     */
    public function __construct(array $leadIds, Template $template)
    {
        $this->leadIds = $leadIds;
        $this->template = $template;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $leads = Lead::whereIn('id', $this->leadIds)->get();

        foreach ($leads as $lead) {
            try {
                // Parse template variables
                $body = $this->template->body;
                $subject = $this->template->subject;
                
                $replacements = [
                    '{{name}}' => $lead->contact_person ?? '',
                    '{{email}}' => $lead->email ?? '',
                    '{{phone}}' => $lead->phone ?? '',
                    '{{company}}' => $lead->business_name ?? '',
                ];

                foreach ($replacements as $key => $value) {
                    $body = str_replace($key, $value, $body);
                    if ($subject) {
                        $subject = str_replace($key, $value, $subject);
                    }
                }

                // Simulate Sending (In future, integrate Mail/Twilio/WhatsApp here)
                Log::info("Mock Sending {$this->template->type} to Lead: {$lead->email}");
                Log::info("Subject: {$subject}");
                Log::info("Body: {$body}");

                // Create Message Log
                MessageLog::create([
                    'lead_id' => $lead->id,
                    'template_id' => $this->template->id,
                    'type' => $this->template->type,
                    'status' => 'sent',
                ]);

            } catch (\Exception $e) {
                Log::error("Failed to send message to Lead ID {$lead->id}: " . $e->getMessage());
                
                MessageLog::create([
                    'lead_id' => $lead->id,
                    'template_id' => $this->template->id,
                    'type' => $this->template->type,
                    'status' => 'failed',
                    'error_message' => $e->getMessage(),
                ]);
            }
        }
    }
}
