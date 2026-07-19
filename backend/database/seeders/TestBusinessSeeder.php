<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
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
use App\Models\Expense;
use App\Models\InventoryMovement;

class TestBusinessSeeder extends Seeder
{
    public function run(): void
    {
        // ─── 1. Create Test User ────────────────────────────────────────
        $user = User::where('email', 'test@demo.com')->first();
        if ($user) {
            $this->command->info('Test user already exists. Skipping...');
            return;
        }

        $user = User::create([
            'name' => 'Demo Shop Owner',
            'email' => 'test@demo.com',
            'phone' => '9999900000',
            'password' => Hash::make('password123'),
        ]);

        // ─── 2. Create Business ─────────────────────────────────────────
        $plan = Plan::where('name', 'Enterprise Plan')->first();
        $business = Business::create([
            'name' => 'Demo Mobile Shop',
            'email' => 'test@demo.com',
            'phone' => '9999900000',
            'gst_number' => '27AABCD1234E1ZP',
            'address' => 'Shop No. 5, Main Market, Near Bus Stand',
            'owner_id' => $user->id,
            'status' => 'active',
            'plan_id' => $plan ? $plan->id : null,
            'plan_expires_at' => now()->addYear(),
            'state' => 'Bihar',
            'pincode' => '845401',
            'description' => 'Demo mobile phone shop for testing all features',
        ]);

        // Attach user to business
        $user->businesses()->attach($business->id);

        // Assign Business Admin role
        setPermissionsTeamId($business->id);
        $businessAdminRole = \Spatie\Permission\Models\Role::firstOrCreate([
            'name' => 'Business Admin',
            'business_id' => $business->id,
            'guard_name' => 'web'
        ]);
        
        $businessPermissions = [
            'manage_sales', 'manage_inventory', 'manage_purchases',
            'manage_expenses', 'manage_customers', 'manage_suppliers',
            'manage_staff', 'manage_attendance', 'manage_payroll',
            'manage_business_settings',
        ];
        $businessAdminRole->syncPermissions($businessPermissions);
        
        $user->assignRole($businessAdminRole);

        // ─── 3. Seed Categories ─────────────────────────────────────────
        $categories = [];
        $catNames = ['Smartphones', 'Feature Phones', 'Tablets', 'Accessories', 'Chargers & Cables', 'Screen Guards'];
        foreach ($catNames as $name) {
            $categories[$name] = Category::create([
                'business_id' => $business->id,
                'name' => $name,
            ]);
        }

        // ─── 4. Seed Brands ────────────────────────────────────────────
        $brands = [];
        $brandNames = ['Samsung', 'Apple', 'Xiaomi', 'Vivo', 'Oppo', 'Realme', 'OnePlus', 'Nothing'];
        foreach ($brandNames as $name) {
            $brands[$name] = Brand::create([
                'business_id' => $business->id,
                'name' => $name,
            ]);
        }

        // ─── 5. Seed Products with Batches ──────────────────────────────
        $products = [
            ['cat' => 'Smartphones', 'brand' => 'Samsung', 'model' => 'Galaxy S24 Ultra', 'pp' => 95000, 'mrp' => 134999, 'qty' => 3],
            ['cat' => 'Smartphones', 'brand' => 'Samsung', 'model' => 'Galaxy A55', 'pp' => 28000, 'mrp' => 39999, 'qty' => 8],
            ['cat' => 'Smartphones', 'brand' => 'Apple', 'model' => 'iPhone 15 Pro Max', 'pp' => 120000, 'mrp' => 159900, 'qty' => 2],
            ['cat' => 'Smartphones', 'brand' => 'Apple', 'model' => 'iPhone 15', 'pp' => 65000, 'mrp' => 79900, 'qty' => 5],
            ['cat' => 'Smartphones', 'brand' => 'Xiaomi', 'model' => 'Redmi Note 13 Pro+', 'pp' => 22000, 'mrp' => 31999, 'qty' => 12],
            ['cat' => 'Smartphones', 'brand' => 'Xiaomi', 'model' => 'Poco X6 Pro', 'pp' => 18000, 'mrp' => 24999, 'qty' => 10],
            ['cat' => 'Smartphones', 'brand' => 'Vivo', 'model' => 'V30 Pro', 'pp' => 32000, 'mrp' => 46999, 'qty' => 6],
            ['cat' => 'Smartphones', 'brand' => 'Oppo', 'model' => 'Reno 12 Pro', 'pp' => 30000, 'mrp' => 43999, 'qty' => 4],
            ['cat' => 'Smartphones', 'brand' => 'Realme', 'model' => 'GT 6T', 'pp' => 26000, 'mrp' => 34999, 'qty' => 7],
            ['cat' => 'Smartphones', 'brand' => 'OnePlus', 'model' => 'OnePlus 12', 'pp' => 55000, 'mrp' => 69999, 'qty' => 3],
            ['cat' => 'Smartphones', 'brand' => 'Nothing', 'model' => 'Phone 2a Plus', 'pp' => 20000, 'mrp' => 27999, 'qty' => 5],
            ['cat' => 'Feature Phones', 'brand' => 'Samsung', 'model' => 'Guru Music 2', 'pp' => 1200, 'mrp' => 1999, 'qty' => 20],
            ['cat' => 'Tablets', 'brand' => 'Samsung', 'model' => 'Galaxy Tab S9 FE', 'pp' => 35000, 'mrp' => 49999, 'qty' => 3],
            ['cat' => 'Tablets', 'brand' => 'Apple', 'model' => 'iPad 10th Gen', 'pp' => 30000, 'mrp' => 39900, 'qty' => 4],
            ['cat' => 'Accessories', 'brand' => 'Apple', 'model' => 'AirPods Pro 2', 'pp' => 15000, 'mrp' => 24900, 'qty' => 8],
            ['cat' => 'Accessories', 'brand' => 'Samsung', 'model' => 'Galaxy Buds FE', 'pp' => 4000, 'mrp' => 6999, 'qty' => 15],
            ['cat' => 'Chargers & Cables', 'brand' => 'Xiaomi', 'model' => '67W Turbo Charger', 'pp' => 800, 'mrp' => 1499, 'qty' => 25],
            ['cat' => 'Screen Guards', 'brand' => 'Realme', 'model' => 'Tempered Glass Universal', 'pp' => 30, 'mrp' => 199, 'qty' => 100],
        ];

        $createdProducts = [];
        foreach ($products as $p) {
            $product = Product::create([
                'business_id' => $business->id,
                'category_id' => $categories[$p['cat']]->id,
                'brand_id' => $brands[$p['brand']]->id,
                'model_name' => $p['model'],
                'purchase_price' => $p['pp'],
                'mrp' => $p['mrp'],
                'quantity' => $p['qty'],
                'status' => 'in_stock',
            ]);

            // Create a batch for each product
            ProductBatch::create([
                'product_id' => $product->id,
                'batch_number' => 'BATCH-' . strtoupper(Str::random(6)),
                'purchase_price' => $p['pp'],
                'mrp' => $p['mrp'],
                'original_quantity' => $p['qty'],
                'remaining_quantity' => $p['qty'],
            ]);

            $createdProducts[] = $product;
        }

        // ─── 6. Seed Customers ──────────────────────────────────────────
        $customerData = [
            ['name' => 'Rahul Kumar', 'phone' => '9876543210', 'address' => 'Patna, Bihar'],
            ['name' => 'Priya Sharma', 'phone' => '9876543211', 'address' => 'Muzaffarpur, Bihar'],
            ['name' => 'Amit Singh', 'phone' => '9876543212', 'address' => 'Gaya, Bihar'],
            ['name' => 'Sneha Devi', 'phone' => '9876543213', 'address' => 'Bhagalpur, Bihar'],
            ['name' => 'Ravi Ranjan', 'phone' => '9876543214', 'address' => 'Darbhanga, Bihar'],
            ['name' => 'Anjali Kumari', 'phone' => '9876543215', 'address' => 'Sitamarhi, Bihar'],
            ['name' => 'Vikash Yadav', 'phone' => '9876543216', 'address' => 'Motihari, Bihar'],
            ['name' => 'Pooja Gupta', 'phone' => '9876543217', 'address' => 'Chapra, Bihar'],
        ];

        $customers = [];
        foreach ($customerData as $c) {
            $customers[] = Customer::create([
                'business_id' => $business->id,
                'name' => $c['name'],
                'phone' => $c['phone'],
                'address' => $c['address'],
            ]);
        }

        // ─── 7. Seed Suppliers ──────────────────────────────────────────
        $supplierData = [
            ['name' => 'Jain Mobiles Distributor', 'phone' => '9800000001', 'email' => 'jain@supplier.com', 'address' => 'Patna Wholesale Market', 'gst' => '10AABCJ1234E1ZP'],
            ['name' => 'Kumar Electronics Wholesale', 'phone' => '9800000002', 'email' => 'kumar@supplier.com', 'address' => 'Delhi NCR', 'gst' => '07AABCK5678F2ZQ'],
            ['name' => 'Singh Tech Supplies', 'phone' => '9800000003', 'email' => 'singh@supplier.com', 'address' => 'Lucknow IT Park', 'gst' => '09AABCS9012G3ZR'],
        ];

        foreach ($supplierData as $s) {
            Supplier::create([
                'business_id' => $business->id,
                'name' => $s['name'],
                'phone' => $s['phone'],
                'address' => $s['address'],
            ]);
        }

        // ─── 8. Seed Sales (Sample Invoices) ────────────────────────────
        $salesData = [
            // Sale 1: Cash sale
            [
                'customer_idx' => 0,
                'items' => [
                    ['product_idx' => 1, 'qty' => 1], // Galaxy A55
                    ['product_idx' => 16, 'qty' => 1], // 67W Charger
                ],
                'payment_mode' => 'Cash',
                'discount' => 500,
                'days_ago' => 5,
            ],
            // Sale 2: Split payment
            [
                'customer_idx' => 1,
                'items' => [
                    ['product_idx' => 3, 'qty' => 1], // iPhone 15
                ],
                'payment_mode' => 'Split',
                'discount' => 1000,
                'days_ago' => 3,
                'split' => ['Cash' => 50000, 'UPI' => 28900],
            ],
            // Sale 3: Cash sale
            [
                'customer_idx' => 2,
                'items' => [
                    ['product_idx' => 4, 'qty' => 2], // Redmi Note 13 Pro+
                    ['product_idx' => 17, 'qty' => 2], // Tempered Glass
                ],
                'payment_mode' => 'Cash',
                'discount' => 0,
                'days_ago' => 2,
            ],
            // Sale 4: Walk-in customer
            [
                'customer_idx' => null,
                'items' => [
                    ['product_idx' => 15, 'qty' => 2], // Galaxy Buds FE
                ],
                'payment_mode' => 'Cash',
                'discount' => 0,
                'days_ago' => 1,
            ],
            // Sale 5: UPI sale
            [
                'customer_idx' => 4,
                'items' => [
                    ['product_idx' => 6, 'qty' => 1], // V30 Pro
                ],
                'payment_mode' => 'Cash',
                'discount' => 2000,
                'days_ago' => 0,
            ],
        ];

        foreach ($salesData as $saleData) {
            $totalAmount = 0;
            $itemsPayload = [];

            foreach ($saleData['items'] as $itemData) {
                $product = $createdProducts[$itemData['product_idx']];
                $batch = $product->batches()->first();
                $subtotal = $product->mrp * $itemData['qty'];
                $totalAmount += $subtotal;

                $itemsPayload[] = [
                    'product' => $product,
                    'batch' => $batch,
                    'qty' => $itemData['qty'],
                    'price' => $product->mrp,
                    'subtotal' => $subtotal,
                ];
            }

            $discount = $saleData['discount'];
            $finalAmount = $totalAmount - $discount;

            $sale = Sale::create([
                'business_id' => $business->id,
                'customer_id' => $saleData['customer_idx'] !== null ? $customers[$saleData['customer_idx']]->id : null,
                'user_id' => $user->id,
                'invoice_number' => 'INV-DEMO-' . strtoupper(Str::random(6)),
                'total_amount' => $totalAmount,
                'discount' => $discount,
                'round_off' => 0,
                'final_amount' => $finalAmount,
                'paid_amount' => $finalAmount,
                'payment_mode' => $saleData['payment_mode'],
                'date' => now()->subDays($saleData['days_ago'])->toDateString(),
                'status' => 'completed',
            ]);

            // Create sale items & deduct stock
            foreach ($itemsPayload as $ip) {
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $ip['product']->id,
                    'product_batch_id' => $ip['batch'] ? $ip['batch']->id : null,
                    'quantity' => $ip['qty'],
                    'unit_price' => $ip['price'],
                    'subtotal' => $ip['subtotal'],
                ]);

                // Deduct stock
                $ip['product']->decrement('quantity', $ip['qty']);
                if ($ip['batch']) {
                    $ip['batch']->decrement('remaining_quantity', $ip['qty']);
                }

                InventoryMovement::create([
                    'product_id' => $ip['product']->id,
                    'type' => 'out',
                    'quantity' => $ip['qty'],
                    'reference_type' => 'sale',
                    'reference_id' => $sale->id,
                ]);
            }

            // Create payments
            if (!empty($saleData['split'])) {
                foreach ($saleData['split'] as $mode => $amount) {
                    SalePayment::create([
                        'sale_id' => $sale->id,
                        'payment_mode' => $mode,
                        'amount' => $amount,
                    ]);
                }
            } else {
                SalePayment::create([
                    'sale_id' => $sale->id,
                    'payment_mode' => $saleData['payment_mode'],
                    'amount' => $finalAmount,
                ]);
            }
        }

        // ─── 9. Seed Expenses ───────────────────────────────────────────
        $expenseData = [
            ['category' => 'Rent', 'amount' => 15000, 'desc' => 'Monthly shop rent - July 2026', 'days_ago' => 10],
            ['category' => 'Electricity', 'amount' => 3500, 'desc' => 'Electricity bill - June 2026', 'days_ago' => 8],
            ['category' => 'Staff Salary', 'amount' => 12000, 'desc' => 'Helper boy salary', 'days_ago' => 5],
            ['category' => 'Transport', 'amount' => 2000, 'desc' => 'Stock pickup from Patna', 'days_ago' => 3],
            ['category' => 'Maintenance', 'amount' => 1500, 'desc' => 'AC servicing', 'days_ago' => 2],
            ['category' => 'Marketing', 'amount' => 5000, 'desc' => 'Pamphlet printing + Banner', 'days_ago' => 1],
        ];

        foreach ($expenseData as $e) {
            Expense::create([
                'business_id' => $business->id,
                'category' => $e['category'],
                'amount' => $e['amount'],
                'description' => $e['desc'],
                'expense_date' => now()->subDays($e['days_ago'])->toDateString(),
                'added_by' => $user->id,
            ]);
        }

        $this->command->info('✅ Test business seeded successfully!');
        $this->command->info('   Login: test@demo.com / password123');
    }
}
