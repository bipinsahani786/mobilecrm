<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Plan;
use App\Models\Partner;
use App\Models\Lead;
use App\Models\LeadContact;
use App\Models\Business;
use App\Models\User;
use App\Models\Commission;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DummyDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Seed Plans if not present
        if (Plan::count() === 0) {
            $this->call(PlanSeeder::class);
        }
        $plans = Plan::all();

        // 2. Seed Partners
        $partnerNames = [
            'Rohan Sharma', 'Aman Gupta', 'Priya Patel', 'Neha Singh', 'Vikram Aditya',
            'Sanjay Dutt', 'Deepika Padukone', 'Rajesh Koothrapali', 'Kabir Sen', 'Divya Teja',
            'Manoj Bajpayee', 'Ananya Panday', 'Karan Johar', 'Sunil Dutt', 'Ranbir Kapoor'
        ];

        $partners = [];
        foreach ($partnerNames as $idx => $name) {
            $email = Str::slug($name, '.') . '@partner.com';
            
            // Create a user for the partner if needed (nullable user_id in migration)
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'phone' => '98765000' . str_pad($idx, 2, '0', STR_PAD_LEFT),
                'password' => Hash::make('password123'),
            ]);

            setPermissionsTeamId(null);
            $user->assignRole('Partner');

            $partners[] = Partner::create([
                'name' => $name,
                'email' => $email,
                'phone' => '98765000' . str_pad($idx, 2, '0', STR_PAD_LEFT),
                'company_name' => $name . ' Tech & Sales Ltd',
                'referral_code' => 'REF' . strtoupper(substr(Str::slug($name), 0, 3)) . str_pad($idx, 3, '0', STR_PAD_LEFT),
                'commission_type' => $idx % 2 === 0 ? 'percentage' : 'fixed',
                'commission_value' => $idx % 2 === 0 ? 10.00 : 500.00,
                'is_recurring_commission' => $idx % 3 === 0,
                'custom_domain' => $idx % 4 === 0 ? Str::slug($name) . '.mobilecrm.com' : null,
                'status' => true,
                'user_id' => $user->id,
            ]);
        }

        // 3. Seed Leads and Lead Contacts
        $businessNames = [
            'Sharma Grocery Store', 'Gupta Electronics', 'Patel Pharmacy', 'Verma Sweets',
            'Metro Cafe', 'Apex Auto', 'Spark Drycleaners', 'Alpha Clothing', 'Zenith Saloon',
            'Karan General Store', 'Royal Furniture', 'Noodles Corner', 'Gourmet Bakery',
            'Global Logistics', 'Quick Rent-a-car', 'Modern Boutique', 'Blue Heaven Spa',
            'Green Valley Nursery', 'Sunrise Stationery', 'Golden Gym', 'Star Diagnostic Lab',
            'Creative Studio', 'Cyber Net Cafe', 'Ganga Clean Water', 'Balaji Hardware',
            'Krishna Dairy', 'Saraswati Book Depot', 'Sai Auto Parts', 'Jai Hind Hotel',
            'Standard Watch Co', 'Siddharth Opticals', 'Lotus Florist', 'Elite Security Services',
            'Fast Delivery', 'Bright Laundry', 'Perfect Tailors', 'Novelty Gift Shop',
            'Classic Footwear', 'Super Diagnostic', 'Metro Bakers', 'Dynamic Gym',
            'Style & Smile Unisex Salon', 'Pest Control Experts', 'City Tours & Travels', 'Royal Sweets'
        ];

        $outcomes = ['called', 'emailed', 'whatsapp', 'visited', 'no_answer'];
        $statuses = ['new', 'contacted', 'converted', 'lost'];

        foreach ($businessNames as $idx => $bName) {
            $partner = $partners[array_rand($partners)];
            
            $lead = Lead::create([
                'partner_id' => $partner->id,
                'business_name' => $bName,
                'contact_person' => 'Contact Person ' . ($idx + 1),
                'phone' => '998877' . str_pad($idx, 4, '0', STR_PAD_LEFT),
                'email' => 'lead' . ($idx + 1) . '@example.com',
                'status' => $statuses[$idx % count($statuses)],
                'notes' => 'Interest level high for ' . $bName,
            ]);

            // Add 1-3 contact history logs
            $numContacts = rand(1, 3);
            for ($c = 0; $c < $numContacts; $c++) {
                $daysAgo = (3 - $c) * rand(1, 3);
                $contactedAt = now()->subDays($daysAgo);
                
                // Seed different next follow-up dates (today, tomorrow, next week, etc.)
                $nextContactAt = null;
                if ($lead->status !== 'converted' && $lead->status !== 'lost') {
                    // Spread next follow-up dates to test follow-up filter
                    // We'll set some to today, some to tomorrow, some to next week
                    if ($idx % 5 === 0) {
                        $nextContactAt = now()->startOfDay()->addHours(11); // Today
                    } elseif ($idx % 5 === 1) {
                        $nextContactAt = now()->addDay()->startOfDay()->addHours(14); // Tomorrow
                    } elseif ($idx % 5 === 2) {
                        $nextContactAt = now()->addDays(7)->startOfDay()->addHours(16); // Next week
                    } else {
                        $nextContactAt = now()->addDays(rand(2, 10))->startOfDay()->addHours(12);
                    }
                }

                LeadContact::create([
                    'lead_id' => $lead->id,
                    'contacted_by' => 'Superadmin',
                    'contacted_at' => $contactedAt,
                    'outcome' => $outcomes[rand(0, count($outcomes) - 1)],
                    'notes' => 'Contact attempt ' . ($c + 1) . ' notes for lead ' . $lead->business_name,
                    'next_contact_at' => $nextContactAt,
                ]);
            }
        }

        // 4. Seed Businesses (Tenants)
        $tenantBusinessNames = [
            'SuperMart India', 'TechHub Solutions', 'Gourmet Kitchen', 'City Supermarket',
            'Digital Edge IT', 'Kolkata Kathi Rolls', 'Punjab Sweets', 'New Delhi Book House',
            'South India Cafe', 'Ludhiana Hosiery', 'Surat Saree Kendra', 'Jaipur Blue Pottery',
            'Pune Tech Consultants', 'Hyderabad Biryani House', 'Chennai Spices',
            'Mumbai Fashion Hub', 'Bengaluru Software Solutions', 'Noida Packers',
            'Gurgaon Coworking', 'Faridabad Tooling', 'Ghaziabad Metal Works',
            'Agra Marble Exporters', 'Varanasi Weaves', 'Lucknow Chikan Art',
            'Patna Dairy Farm', 'Ranchi Coal Logistics', 'Bhubaneswar Smart Homes',
            'Guwahati Tea Traders', 'Shillong Resorts', 'Gangtok Adventure Tours'
        ];

        foreach ($tenantBusinessNames as $idx => $tName) {
            $plan = $plans->random();
            $partner = rand(0, 10) > 3 ? $partners[array_rand($partners)] : null;
            
            // Create Owner User
            $ownerEmail = 'owner' . ($idx + 1) . '@mobilecrm.com';
            $owner = User::create([
                'name' => 'Owner of ' . $tName,
                'email' => $ownerEmail,
                'phone' => '955512' . str_pad($idx, 4, '0', STR_PAD_LEFT),
                'password' => Hash::make('password123'),
            ]);

            $business = Business::create([
                'name' => $tName,
                'email' => $ownerEmail,
                'phone' => '955512' . str_pad($idx, 4, '0', STR_PAD_LEFT),
                'gst_number' => '27AAAAA' . str_pad($idx, 4, '0', STR_PAD_LEFT) . 'A1Z' . ($idx % 9),
                'address' => 'Floor ' . ($idx % 5 + 1) . ', Block ' . chr(65 + ($idx % 4)) . ', Phase ' . ($idx % 3 + 1) . ', Tech Zone',
                'owner_id' => $owner->id,
                'status' => 'active',
                'plan_id' => $plan->id,
                'plan_expires_at' => now()->addDays(rand(15, 300)),
                'partner_id' => $partner ? $partner->id : null,
                'state' => 'Maharashtra',
                'pincode' => '4000' . str_pad($idx, 2, '0', STR_PAD_LEFT),
                'description' => 'A premier billing outlet of ' . $tName,
            ]);

            // Attach user to business pivot table
            $owner->businesses()->attach($business->id);

            // Create and assign role scoped to this business
            setPermissionsTeamId($business->id);
            $businessAdminRole = \Spatie\Permission\Models\Role::firstOrCreate([
                'name' => 'Business Admin',
                'business_id' => $business->id,
                'guard_name' => 'web'
            ]);
            $owner->assignRole($businessAdminRole);


            // Seed commission record if business was referred by a partner
            if ($partner) {
                $amountPaid = $plan->price_yearly > 0 ? $plan->price_yearly : $plan->price_monthly;
                $commissionAmount = 0;
                if ($partner->commission_type === 'percentage') {
                    $commissionAmount = ($amountPaid * $partner->commission_value) / 100;
                } else {
                    $commissionAmount = $partner->commission_value;
                }

                $statusRand = rand(0, 10);
                $status = 'pending';
                $paidAt = null;
                if ($statusRand > 4) {
                    $status = 'paid';
                    $paidAt = now()->subDays(rand(1, 15));
                } elseif ($statusRand === 0) {
                    $status = 'cancelled';
                }

                Commission::create([
                    'partner_id' => $partner->id,
                    'business_id' => $business->id,
                    'plan_id' => $plan->id,
                    'amount_paid_by_tenant' => $amountPaid,
                    'commission_amount' => $commissionAmount,
                    'status' => $status,
                    'paid_at' => $paidAt,
                    'created_at' => now()->subDays(rand(1, 30)),
                ]);
            }

            // Phase 2: Seed Categories and Products for testing
            $cat1 = Category::create([
                'business_id' => $business->id,
                'name' => 'Smartphones'
            ]);
            
            $cat2 = Category::create([
                'business_id' => $business->id,
                'name' => 'Accessories'
            ]);

            $brandSamsung = \App\Models\Brand::firstOrCreate(['business_id' => $business->id, 'name' => 'Samsung']);
            $brandApple = \App\Models\Brand::firstOrCreate(['business_id' => $business->id, 'name' => 'Apple']);

            Product::create([
                'business_id' => $business->id,
                'category_id' => $cat1->id,
                'brand_id' => $brandSamsung->id,
                'model_name' => 'Galaxy S23',
                'imei' => '35' . rand(100000000, 999999999) . rand(1000, 9999),
                'purchase_price' => 50000,
                'mrp' => 70000,
                'quantity' => 5,
                'status' => 'in_stock'
            ]);

            Product::create([
                'business_id' => $business->id,
                'category_id' => $cat2->id,
                'brand_id' => $brandApple->id,
                'model_name' => 'AirPods Pro',
                'serial_no' => 'APP' . rand(10000, 99999),
                'purchase_price' => 15000,
                'mrp' => 24900,
                'quantity' => 10,
                'status' => 'in_stock'
            ]);
        }
    }
}
