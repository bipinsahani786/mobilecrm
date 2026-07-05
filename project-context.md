# Mobile & Electronics Shop CRM — Project Context

> **Purpose of this file:** Yeh file AI coding assistant (Claude Code, Cursor, Copilot, etc.) ke liye hai. Ise project ke root folder mein rakho. Ismein pura business context, tech stack, current status, database design, aur aage kya banana hai — sab likha hai. Naye session mein bhi AI isko padh kar seedha kaam continue kar sake, isliye har section explicit aur self-contained hai.

---

## 1. Tech Stack

- **Frontend:** React JS
- **Backend:** Laravel (PHP)
- **Environment:** Docker (docker-compose already set up)
- **Database:** MySQL (assume via Laravel `.env` config — confirm/adjust if Postgres is used instead)
- **Auth:** Laravel Sanctum/Passport recommended for API-token based auth (confirm what's currently used for Superadmin/Business login)

## 2. Current Status (already built)

- [x] Superadmin panel — base setup done
- [x] Business (shop owner) login — done
- [ ] Everything else below is **pending** — this file describes what to build next

## 3. Product Summary

Yeh ek **multi-tenant SaaS CRM** hai jo mobile phone + electronics/other-goods dukaano ko becha jayega. Har dukaan (business) apna alag account use karegi. Superadmin sabhi businesses ko control/monitor karta hai. Har business ke andar owner (Admin) aur uske employees hote hain jo apna daily kaam (sale, stock, attendance) khud manage karte hain.

Agar current architecture single-tenant hai (ek hi business, superadmin sirf ek high-level owner hai), to neeche diya gaya schema/roles usi hisaab se simplify kiya ja sakta hai — is document mein multi-tenant assume kiya gaya hai kyunki "Superadmin" aur "Business login" alag mention hue hain.

---

## 4. User Roles & Hierarchy

```
Superadmin
   └── manages many Businesses (shops)
Business Admin / Owner (per shop)
   └── manages own Employees, Inventory, Sales, Expenses, etc.
Employee (per shop)
   └── does Sales entry, views own attendance/salary
```

| Role | Scope | Key Permissions |
|---|---|---|
| **Superadmin** | All businesses | Create/suspend/activate businesses, view platform-wide analytics, manage subscription/billing of businesses (if SaaS-paid), impersonate/support access |
| **Business Admin (Owner)** | Own shop only | Full control: inventory, sales, expenses, EMI, suppliers/udhar, employees, attendance, payroll, analytics dashboard |
| **Employee** | Own shop, limited | Create sales, view own attendance/leave, view own salary slip |

**Important multi-tenancy rule:** Every table below that belongs to shop-level data must include a `business_id` foreign key, and every Eloquent query must be scoped to the logged-in user's `business_id` (use a Laravel Global Scope or middleware to enforce this automatically — do not rely on manual `where()` everywhere, it's error-prone).

---

## 5. Modules To Build (in suggested build order)

### Phase 1 — Core Setup
1. `businesses` table + Superadmin CRUD to manage businesses
2. `users` table with `role` (superadmin / business_admin / employee) + `business_id` (nullable for superadmin)
3. Role-based middleware/guards in Laravel (`role:admin`, `role:employee`, `role:superadmin`)
4. React route guards matching the above roles

### Phase 2 — Inventory (Multi-Category)
5. `categories` table (Mobile, Electronics, Accessories, Other — business can add custom categories)
6. `products`/`inventory` table — supports both IMEI-tracked items (phones) and simple qty-tracked items (electronics/accessories)
7. Stock In / Stock Out ledger (`inventory_movements`)
8. Low-stock threshold + alert

### Phase 3 — Supplier & Udhar (Credit) Management
9. `suppliers` table
10. `supplier_purchases` (bill amount, paid amount, balance, due date)
11. `supplier_payments` (payments made against a purchase over time)
12. Supplier ledger view — running balance per supplier

### Phase 4 — Sales & Billing
13. `customers` table
14. `sales` table (linked to employee, customer, inventory item, payment mode)
15. Auto invoice generation (PDF — use `barryvdh/laravel-dompdf` or similar)
16. On sale creation: auto-decrement inventory quantity (use DB transaction to avoid race conditions)

### Phase 5 — EMI / Finance
17. `emi_details` table linked 1:1 to a `sale` where `payment_mode = 'emi'`
18. Fields: finance_company, down_payment, tenure_months, monthly_emi, status (active/completed/overdue)

### Phase 6 — Attendance & Payroll
19. `attendance` table (daily status per employee: present/absent/half_day/leave/week_off/holiday + reason)
20. `leave_policy` table (paid leave quota, business-configurable)
21. `payroll` table — generated per employee per month from attendance + sales incentive
22. Payroll calculation service/class (see Section 7 — Business Rules for exact formula)

### Phase 7 — Expenses
23. `expenses` table (category, amount, description, added_by, date)

### Phase 8 — Analytics Dashboards
24. Business Admin dashboard: total sales, profit, best-selling item, employee leaderboard, inventory value, supplier udhar total, EMI pending total, attendance %
25. Superadmin dashboard: platform-wide — total businesses, total sales across all businesses, active vs inactive shops, revenue if SaaS is subscription-based

---

## 6. Database Schema (Laravel Migration Reference)

> Field types are suggestions — adjust to match existing conventions in the codebase.

```
businesses
- id
- name
- owner_name
- phone
- address
- status (active/suspended)
- created_at, updated_at

users
- id
- business_id (nullable — null for superadmin)
- name
- email / phone
- password
- role (enum: superadmin, business_admin, employee)
- monthly_salary (nullable, employees only)
- join_date
- created_at, updated_at

categories
- id
- business_id
- name

products (inventory)
- id
- business_id
- category_id
- brand
- model_name
- imei (nullable — only for phones)
- serial_no (nullable — for electronics)
- variant
- purchase_price
- mrp
- quantity
- supplier_id
- status (in_stock / sold / damaged)
- created_at, updated_at

inventory_movements
- id
- product_id
- type (in / out)
- quantity
- reference_type (purchase / sale / adjustment)
- reference_id
- created_at

suppliers
- id
- business_id
- name
- phone
- address
- items_supplied (text)

supplier_purchases
- id
- supplier_id
- bill_amount
- paid_amount
- balance_amount (computed or maintained)
- purchase_date
- due_date

supplier_payments
- id
- supplier_id
- supplier_purchase_id (nullable — if paying against specific bill)
- amount
- payment_mode
- date

customers
- id
- business_id
- name
- phone
- address
- id_proof (nullable)

sales
- id
- business_id
- employee_id (user_id)
- customer_id
- product_id
- sale_price
- discount
- payment_mode (cash / upi / card / emi)
- date

emi_details
- id
- sale_id
- finance_company
- down_payment
- tenure_months
- monthly_emi
- status (active / completed / overdue)

expenses
- id
- business_id
- category
- amount
- description
- added_by (user_id)
- date

attendance
- id
- business_id
- employee_id
- date
- status (present / absent / half_day / leave / week_off / holiday)
- reason (nullable)
- check_in (nullable)
- check_out (nullable)
- approved_by (nullable)

leave_policy
- id
- business_id
- leave_type
- monthly_quota
- is_paid (boolean)

payroll
- id
- business_id
- employee_id
- month (YYYY-MM)
- present_days
- absent_days
- paid_leaves
- unpaid_leaves
- per_day_salary
- deduction
- base_salary
- incentive
- final_salary
- status (pending / paid)
```

---

## 7. Key Business Rules (implement as Laravel service classes, not inline controller logic)

### 7.1 Payroll Calculation
```
per_day_salary   = base_salary / total_days_in_month
unpaid_absences  = total_absent_days - allowed_paid_leave_quota   (min 0)
deduction        = unpaid_absences * per_day_salary
incentive        = sum of per-sale commission rule for that employee in that month
final_salary     = base_salary - deduction + incentive
```
Build this as `App\Services\PayrollService::generateForEmployee($employeeId, $month)`.

### 7.2 Supplier Udhar (Credit) Balance
```
balance_amount = bill_amount - sum(payments made against that purchase)
```
Maintain a running "current outstanding" per supplier = sum of all `balance_amount` across their unpaid/partially-paid purchases. Recalculate on every payment insert (or use a DB trigger / accessor).

### 7.3 Inventory Deduction on Sale
Wrap in a DB transaction:
1. Check product quantity/status is available
2. Create `sales` row
3. Decrement `products.quantity` (or mark IMEI-tracked item as `sold`)
4. Insert `inventory_movements` row (type = out)

### 7.4 Multi-Tenancy Data Isolation
Every query for Business Admin / Employee roles must filter by `business_id` = logged-in user's business. Recommended: Laravel Global Scope on all tenant-owned models, applied automatically based on authenticated user — prevents accidental data leaks across businesses.

---

## 8. Suggested API Route Structure

```
/api/superadmin/businesses          (CRUD)
/api/superadmin/analytics           (platform-wide)

/api/business/inventory             (CRUD)
/api/business/categories            (CRUD)
/api/business/suppliers             (CRUD)
/api/business/suppliers/{id}/payments   (POST)
/api/business/customers             (CRUD)
/api/business/sales                 (CRUD)
/api/business/emi/{sale_id}         (GET/POST)
/api/business/expenses              (CRUD)
/api/business/attendance            (CRUD, daily)
/api/business/leave-policy          (CRUD)
/api/business/payroll/generate      (POST — triggers PayrollService)
/api/business/payroll               (GET — list/history)
/api/business/analytics             (GET — dashboard data)

/api/employee/sales                 (POST — own sales only)
/api/employee/attendance            (GET — own record)
/api/employee/payroll               (GET — own salary slips)
```

## 9. Frontend (React) — Suggested Structure

```
src/
  pages/
    superadmin/       (Businesses list, platform analytics)
    admin/            (Inventory, Sales, Suppliers, Expenses, Attendance, Payroll, Analytics)
    employee/         (New Sale, My Attendance, My Salary)
  components/
    inventory/
    sales/
    suppliers/
    attendance/
    payroll/
  services/           (axios API calls per module)
  context/ or store/  (auth/role context — already exists for login, extend for role-based routing)
```

Use role stored in auth context/token to conditionally render `admin/*` vs `employee/*` routes (protected routes wrapper already likely exists from login implementation — extend it, don't rewrite).

---

## 10. Suggested Next Steps for AI Assistant

When picking up this project, work in this order and confirm folder/naming conventions against the existing codebase before generating new files:

1. Inspect existing `users`/`business` migrations and auth flow already implemented — do not duplicate, extend.
2. Implement Phase 2 (Inventory) end-to-end: migration → model → controller → API route → React page.
3. Implement Phase 3 (Supplier/Udhar) — depends on Inventory (products reference supplier_id).
4. Implement Phase 4 (Sales/Billing) — depends on Inventory + Customers.
5. Implement Phase 5 (EMI) — depends on Sales.
6. Implement Phase 6 (Attendance + Payroll) — independent of above, can be built in parallel.
7. Implement Phase 7 (Expenses) — independent, simple CRUD.
8. Implement Phase 8 (Analytics) — depends on all above being populated with data.

Each phase should be a complete vertical slice (migration → model → controller/API → React UI) before moving to the next, so the business owner can start using partial functionality early.

---

## 11. Open Questions to Confirm With Business Owner (fill in once known)

- [ ] Is this truly multi-tenant (many shops on one platform) or single-shop (only one business, "Superadmin" = owner, "Business login" = a manager role)?
- [ ] Sales commission/incentive rule — fixed ₹ per item, or % of sale price, or tiered?
- [ ] Is GST billing required?
- [ ] Should employees be able to edit/delete a sale after creation, or only Admin?
- [ ] Any requirement for SMS/WhatsApp reminders (EMI due, udhar due)?
