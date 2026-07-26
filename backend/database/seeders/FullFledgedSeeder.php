<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Business;
use App\Models\Plan;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\Customer;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SalePayment;
use App\Models\Supplier;
use App\Models\SupplierPurchase;
use App\Models\SupplierPurchaseItem;
use App\Models\SupplierPayment;
use App\Models\Expense;
use App\Models\InventoryMovement;
use App\Models\Attendance;
use App\Models\Payroll;
use App\Models\EmiDetail;
use App\Models\EmiInstallment;

class FullFledgedSeeder extends Seeder
{
    public function run(): void
    {
        // ─── 1. Create Master Owner User ────────────────────────────────────────
        $owner = User::firstOrCreate(
            ['email' => 'owner@multifirm.com'],
            [
                'name' => 'Global Master Owner',
                'phone' => '9999911111',
                'password' => Hash::make('password123'),
            ]
        );

        $plans = Plan::all();

        // ─── 2. Create 3 Businesses for this Owner ────────────────────────────────
        $businessesData = [
            ['name' => 'Main City Mobiles', 'state' => 'Maharashtra', 'pincode' => '400001', 'address' => 'Andheri West'],
            ['name' => 'Suburb Electronics', 'state' => 'Maharashtra', 'pincode' => '400050', 'address' => 'Bandra'],
            ['name' => 'Downtown Gadgets', 'state' => 'Delhi', 'pincode' => '110001', 'address' => 'Connaught Place'],
        ];

        foreach ($businessesData as $index => $bData) {
            // Distribute plans: 0 -> Enterprise, 1 -> Professional, 2 -> Starter
            // Assumes plans are ordered ID 1=Starter, 2=Professional, 3=Enterprise. So reverse index.
            $planIndex = count($plans) > 0 ? (2 - $index) % count($plans) : 0;
            $plan = $plans[$planIndex] ?? null;

            $business = Business::firstOrCreate(
                ['email' => 'contact' . $index . '@' . Str::slug($bData['name']) . '.com'],
                [
                    'name' => $bData['name'],
                    'phone' => '990000' . rand(1000, 9999),
                    'gst_number' => '27' . Str::upper(Str::random(10)) . '1ZP',
                    'address' => $bData['address'],
                    'owner_id' => $owner->id,
                    'status' => 'active',
                    'plan_id' => $plan ? $plan->id : null,
                    'plan_expires_at' => now()->addYear(),
                    'state' => $bData['state'],
                    'pincode' => $bData['pincode'],
                    'description' => 'Fully fledged business demo setup',
                ]
            );

            // Attach owner to business
            if (!$owner->businesses->contains($business->id)) {
                $owner->businesses()->attach($business->id);
            }

            // Assign Admin Role for Owner
            setPermissionsTeamId($business->id);
            $businessAdminRole = \Spatie\Permission\Models\Role::firstOrCreate([
                'name' => 'Business Admin',
                'business_id' => $business->id,
                'guard_name' => 'web'
            ]);
            $owner->assignRole($businessAdminRole);

            // ─── 3. Add Staff Members ───────────────────────────────────────────────
            $staffRole = \Spatie\Permission\Models\Role::firstOrCreate([
                'name' => 'Staff',
                'business_id' => $business->id,
                'guard_name' => 'web'
            ]);

            $staffUsers = [];
            for ($s = 1; $s <= 3; $s++) {
                $staff = User::firstOrCreate(
                    ['email' => 'staff' . $s . '_' . $index . '@' . Str::slug($bData['name']) . '.com'],
                    [
                        'name' => 'Staff Member ' . $s . ' (' . $bData['name'] . ')',
                        'phone' => '980000' . rand(1000, 9999),
                        'password' => Hash::make('password123'),
                    ]
                );

                if (!$staff->businesses->contains($business->id)) {
                    $staff->businesses()->attach($business->id);
                }
                $staff->assignRole($staffRole);
                $staffUsers[] = $staff;
            }

            // ─── 4. Categories & Brands ─────────────────────────────────────────────
            $catNames = ['Smartphones', 'Accessories', 'Tablets', 'Laptops'];
            $categories = [];
            foreach ($catNames as $name) {
                $categories[] = Category::firstOrCreate(['name' => $name, 'business_id' => $business->id]);
            }

            $brandNames = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Sony'];
            $brands = [];
            foreach ($brandNames as $name) {
                $brands[] = Brand::firstOrCreate(['name' => $name, 'business_id' => $business->id]);
            }

            // ─── 5. Products & Inventory ────────────────────────────────────────────
            $products = [];
            for ($p = 1; $p <= 10; $p++) {
                $cat = $categories[array_rand($categories)];
                $brand = $brands[array_rand($brands)];
                $pp = rand(10000, 50000);
                $mrp = $pp + rand(2000, 10000);

                $product = Product::firstOrCreate(
                    ['model_name' => $brand->name . ' Model X' . $p, 'business_id' => $business->id],
                    [
                        'category_id' => $cat->id,
                        'brand_id' => $brand->id,
                        'purchase_price' => $pp,
                        'mrp' => $mrp,
                        'quantity' => 50,
                        'status' => 'in_stock',
                    ]
                );

                ProductBatch::firstOrCreate(
                    ['product_id' => $product->id, 'batch_number' => 'BATCH-FF-' . $index . '-' . $p],
                    [
                        'purchase_price' => $pp,
                        'mrp' => $mrp,
                        'original_quantity' => 50,
                        'remaining_quantity' => 50,
                    ]
                );
                $products[] = $product;
            }

            // ─── 6. Customers & Suppliers ───────────────────────────────────────────
            $customers = [];
            for ($c = 1; $c <= 5; $c++) {
                $customers[] = Customer::firstOrCreate(
                    ['phone' => '88888000' . $c . $index, 'business_id' => $business->id],
                    ['name' => 'Demo Customer ' . $c, 'address' => 'Local City']
                );
            }

            $suppliers = [];
            for ($sup = 1; $sup <= 2; $sup++) {
                $suppliers[] = Supplier::firstOrCreate(
                    ['phone' => '77777000' . $sup . $index, 'business_id' => $business->id],
                    ['name' => 'Demo Supplier ' . $sup, 'address' => 'Wholesale Market']
                );
            }

            // ─── 7. Supplier Purchases (Finance Ledger) ─────────────────────────────
            for ($pur = 1; $pur <= 5; $pur++) {
                $supplier = $suppliers[array_rand($suppliers)];
                $totalAmount = rand(50000, 200000);

                $purchase = SupplierPurchase::create([
                    'supplier_id' => $supplier->id,
                    'bill_amount' => $totalAmount,
                    'paid_amount' => $totalAmount,
                    'purchase_date' => now()->subDays(rand(10, 60))->toDateString(),
                    'due_date' => now()->addDays(rand(0, 30))->toDateString(),
                ]);

                // We don't add items extensively to save space, but let's add 1 dummy item
                SupplierPurchaseItem::create([
                    'supplier_purchase_id' => $purchase->id,
                    'product_id' => $products[array_rand($products)]->id,
                    'quantity' => 10,
                    'purchase_price' => $totalAmount / 10,
                    'total_price' => $totalAmount,
                ]);

                // Payment for Purchase (Finance)
                SupplierPayment::create([
                    'supplier_id' => $supplier->id,
                    'supplier_purchase_id' => $purchase->id,
                    'payment_mode' => 'Bank Transfer',
                    'amount' => $totalAmount,
                    'date' => $purchase->purchase_date,
                    'notes' => 'Full payment made for purchase',
                ]);
            }

            // ─── 8. Sales & EMI (Finance Ledger) ────────────────────────────────────
            for ($sl = 1; $sl <= 10; $sl++) {
                $customer = $customers[array_rand($customers)];
                $product = $products[array_rand($products)];
                $qty = rand(1, 2);
                $totalAmount = $product->mrp * $qty;
                $isFinance = ($sl % 3 === 0); // Every 3rd sale is a finance/EMI sale
                
                $sale = Sale::create([
                    'business_id' => $business->id,
                    'customer_id' => $customer->id,
                    'user_id' => $staffUsers[array_rand($staffUsers)]->id,
                    'invoice_number' => 'INV-FF-' . strtoupper(Str::random(6)),
                    'total_amount' => $totalAmount,
                    'discount' => 0,
                    'round_off' => 0,
                    'final_amount' => $totalAmount,
                    'paid_amount' => $isFinance ? ($totalAmount * 0.3) : $totalAmount, // 30% downpayment if finance
                    'payment_mode' => $isFinance ? 'Finance' : 'Cash',
                    'date' => now()->subDays(rand(1, 30))->toDateString(),
                    'status' => 'completed',
                ]);

                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $product->id,
                    'product_batch_id' => $product->batches()->first()->id,
                    'quantity' => $qty,
                    'unit_price' => $product->mrp,
                    'subtotal' => $totalAmount,
                ]);

                InventoryMovement::create([
                    'product_id' => $product->id,
                    'type' => 'out',
                    'quantity' => $qty,
                    'reference_type' => 'sale',
                    'reference_id' => $sale->id,
                ]);

                if ($isFinance) {
                    $downPayment = $totalAmount * 0.3;
                    $loanAmount = $totalAmount - $downPayment;
                    $tenure = rand(6, 12);
                    $emiAmount = $loanAmount / $tenure;

                    // Create Sale Payment for downpayment
                    SalePayment::create([
                        'sale_id' => $sale->id,
                        'payment_mode' => 'Cash',
                        'amount' => $downPayment,
                    ]);

                    $isPayoutReceived = (rand(0, 1) === 1);
                    
                    // EmiDetail
                    $emiDetail = EmiDetail::create([
                        'sale_id' => $sale->id,
                        'financier_name' => ['Bajaj Finance', 'TVS Credit', 'HDFC Bank'][rand(0, 2)],
                        'down_payment' => $downPayment,
                        'loan_amount' => $loanAmount,
                        'processing_fee' => 500,
                        'tenure_months' => $tenure,
                        'monthly_installment_amount' => $emiAmount,
                        'first_emi_date' => Carbon::parse($sale->date)->addMonth(),
                        'is_payout_received' => $isPayoutReceived,
                        'payout_date' => $isPayoutReceived ? Carbon::parse($sale->date)->addDays(2) : null,
                    ]);

                    // Generate dummy EmiInstallment records
                    for ($i = 1; $i <= $tenure; $i++) {
                        $dueDate = Carbon::parse($emiDetail->first_emi_date)->addMonths($i - 1);
                        EmiInstallment::create([
                            'emi_detail_id' => $emiDetail->id,
                            'installment_number' => $i,
                            'due_date' => $dueDate,
                            'amount' => $emiAmount,
                            'status' => $dueDate->isPast() ? 'paid' : 'pending',
                            'paid_on' => $dueDate->isPast() ? $dueDate : null,
                        ]);
                    }
                } else {
                    SalePayment::create([
                        'sale_id' => $sale->id,
                        'payment_mode' => 'Cash',
                        'amount' => $totalAmount,
                    ]);
                }
            }

            // ─── 9. Expenses (Finance Ledger) ───────────────────────────────────────
            $expenseCategories = ['Rent', 'Electricity', 'Tea & Snacks', 'Marketing'];
            for ($ex = 1; $ex <= 10; $ex++) {
                Expense::create([
                    'business_id' => $business->id,
                    'category' => $expenseCategories[array_rand($expenseCategories)],
                    'amount' => rand(500, 5000),
                    'description' => 'Demo expense entry',
                    'expense_date' => now()->subDays(rand(1, 30))->toDateString(),
                    'added_by' => $owner->id,
                ]);
            }

            // ─── 10. Staff Attendance & Payroll ─────────────────────────────────────
            foreach ($staffUsers as $staff) {
                // Generate 20 days of attendance
                for ($d = 1; $d <= 20; $d++) {
                    $date = now()->subDays($d);
                    if (!$date->isSunday()) {
                        Attendance::firstOrCreate([
                            'business_id' => $business->id,
                            'user_id' => $staff->id,
                            'date' => $date->toDateString(),
                        ], [
                            'status' => 'present',
                            'check_in_time' => $date->copy()->setHour(9)->setMinute(rand(0, 30)),
                            'check_out_time' => $date->copy()->setHour(18)->setMinute(rand(0, 30)),
                            'is_within_geofence' => true,
                        ]);
                    }
                }

                // Generate Payroll for last month
                Payroll::create([
                    'business_id' => $business->id,
                    'user_id' => $staff->id,
                    'month' => now()->subMonth()->format('Y-m'),
                    'total_days' => 30,
                    'present_days' => 26,
                    'absent_days' => 0,
                    'half_days' => 0,
                    'paid_leaves' => 0,
                    'unpaid_leaves' => 0,
                    'week_offs' => 4,
                    'holidays' => 0,
                    'base_salary' => 15000,
                    'per_day_salary' => 500,
                    'deduction' => 0,
                    'total_commission' => 2000,
                    'bonus' => 0,
                    'advance_deduction' => 0,
                    'final_salary' => 17000,
                    'notes' => 'Demo payroll',
                    'status' => 'paid',
                    'paid_date' => now()->subMonth()->endOfMonth(),
                ]);
            }
        }

        $this->command->info('✅ Full Fledged Seeder generated successfully!');
        $this->command->info('   Owner Login: owner@multifirm.com / password123');
    }
}
