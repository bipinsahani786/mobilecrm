# Backend Architecture Guidelines

## Service-Oriented Laravel Architecture

This project uses Laravel and strictly follows a **Service-Oriented Architecture (SOA)** pattern to keep controllers thin and business logic reusable.

### Core Principles

1. **Thin Controllers:**
   - **Location:** `app/Http/Controllers/Api/`
   - **Responsibility:** Controllers should only handle HTTP requests, input validation (`$request->validate()`), and formatting JSON responses. 
   - **Rule:** NEVER write complex business logic, database transactions, or external API calls directly in the controller.

2. **Thick Services (Business Logic):**
   - **Location:** `app/Services/`
   - **Responsibility:** All core business rules, data processing, and complex interactions go here. 
   - **Example:** `BusinessService.php`, `StorageService.php`.
   - **Rule:** Services should be injectable via dependency injection in controllers.

3. **Models & Data:**
   - **Location:** `app/Models/`
   - **Responsibility:** Eloquent Models handle database relationships, casting, and scopes.

4. **API Documentation (Swagger/OpenAPI):**
   - **Rule:** EVERY API endpoint in the controller MUST have `l5-swagger` PHP attributes (`#[OA\Get]`, `#[OA\Post]`, etc.) defining the route, parameters, request body, and responses.

### ❌ WRONG (Fat Controller Pattern):
```php
public function store(Request $request) {
    // ❌ Validation + DB Insert + File Upload + Email Sending all mixed here
}
```

### ✅ CORRECT (Service Pattern):
```php
public function store(Request $request) {
    // 1. Validate
    $validated = $request->validate([...]);
    
    // 2. Delegate to Service
    $business = $this->businessService->createBusiness($request->user(), $validated);
    
    // 3. Return Response
    return response()->json([...]);
}
```

**CRITICAL:** Always inject services via the constructor and annotate new API methods with OpenAPI tags so that the Swagger UI remains automatically up-to-date.
