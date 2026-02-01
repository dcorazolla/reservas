# 4. Scoped Route-Model Binding

Date: 2026-02-01

Status: Proposed

Context
-------
Implicit route-model binding is convenient but can yield surprising NotFound results when model queries must be scoped by tenant context (property_id). Tests and code previously observed `No query results for model [App\\Models\\Invoice]` during feature tests.

Decision
--------
Create explicit scoped route-model binding for models that require property-level isolation (e.g., `Invoice`, `Room`, `RoomRate`). The binding will use the request's property context and fallback in `local`/`testing` environments.

Consequences
------------
- Consistent behavior for route-model binding across environments.
- Slightly more code in a central provider, but single place to reason about scoping.

Implementation Notes
--------------------
- Register bindings in `RouteServiceProvider` (not in controllers) and ensure it executes early in the boot sequence.
- Avoid logging or IO during binding; keep binding fast and deterministic.
