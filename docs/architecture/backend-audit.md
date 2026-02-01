# Backend Audit — initial pass

Date: 2026-02-01

Summary
-------
This file captures an initial static audit of the backend to identify quick wins, hotspots and an ordered plan for refactor. The goal is to reach a clean, KISS/SOLID-aligned architecture with separated layers (Controllers → Requests/DTOs → UseCases/Services → Repositories → Models/Persistence), strong tests, clear ADRs and reproducible automation (Bruno).

Hotspots Found (prioritized)
----------------------------
1. Route-model binding scoping ambiguity
   - Tests intermittently saw `No query results for model [App\\Models\\Invoice]` while using implicit binding. Cause: route-model binding without tenant (property_id) scoping can return NotFound unexpectedly.

2. Controllers with direct model creation
   - Several controllers create models directly (e.g. `PartnerController`, `PropertyController`). Prefer thin controllers delegating to Services/UseCases.

3. Mixed responsibilities in Services
   - Services like `InvoiceService` and `PaymentService` mix business logic with persistence. Introduce Repositories to encapsulate DB operations and keep services focused on business rules.

4. Incomplete scoping helpers and low coverage
   - `EnsuresPropertyScope` exists but has 0% coverage and is used inconsistently. Consolidate scoping in a single place (RouteServiceProvider binding + Controller::getPropertyId) and add tests.

5. Tests depend on implicit fallbacks
   - Tests rely on `Controller::getPropertyId` fallback to pick a property in `testing` environment. Make tests explicit by creating a `Property` and wiring `property_id` in requests or use test helpers.

6. Missing repository abstraction and interfaces
   - No repository layer exists. Adding repositories will make logic easier to test and swap implementations.

7. Bruno collection and scripts
   - Bruno flows exist but require updates after refactors. Make Bruno scripts resilient to API changes and ensure they use seeded credentials.

8. No static analysis enforcement
   - No PHPStan or linting enforcement found in the repo. Add PHPStan and `pint` to CI to keep code quality high.

Proposed Incremental Workplan (first iterations)
------------------------------------------------
- Phase 0 (this PR): documentation and ADRs (done).
- Phase 1 (small, local changes):
  1. Implement scoped route-model binding in `RouteServiceProvider` for models that need `property_id` scoping (Invoice, Room, RoomRate, etc.). Include `testing` fallback.
  2. Ensure `Controller::getPropertyId` is the single source of truth for property context.
  3. Convert a single billing controller (InvoiceController) to be thin: accept a typed `StoreInvoiceRequest` (validation), call `InvoiceService::createInvoice($dto)` and return a resource.
  4. Move persistence calls to `InvoiceRepository` (create, find, list) and inject repository into `InvoiceService`.
  5. Add/adjust feature tests to use a `TestHelpers::asProperty($property)` helper that sets the property context for requests.

- Phase 2 (wider refactor):
  - Apply same pattern to PaymentController/PartnerController.
  - Add interfaces for services and repositories and unit tests for services.
  - Improve factories and seeds to create deterministic test data.

- Phase 3 (quality gates):
  - Add PHPStan (level 7+), Pint config and pre-commit hooks.
  - Update README and contributing docs with workflow and testing instructions.
  - Update Bruno collection and scripts to the new endpoints and payload shapes.

Acceptance criteria for phase 1
-------------------------------
- `phpunit --filter InvoiceControllerTest` passes locally.
- Route-model binding returns `Invoice` only when `property_id` matches request context.
- Invoice creation request validation uses `FormRequest` class.
- Minimal tests added to prove repository boundaries.

Next actions (I will perform now, automatically)
----------------------------------------------
1. Implement scoped route-model binding in `RouteServiceProvider` (safe, central change).
2. Create `app/Repositories` directory with `InvoiceRepository` and a minimal implementation used by `InvoiceService`.
3. Convert `InvoiceController::store` to use a `StoreInvoiceRequest` and call the `InvoiceService` (controller already exists — keep thin).
4. Run focused tests for invoices and payments, fix issues iteratively.

I will proceed to implement the first two actions and push incremental commits to `refactor/backend-cleanup`.
