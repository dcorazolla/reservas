# 3. Append-only Financial Audit Logs

Date: 2026-02-01

Status: Proposed

Context
-------
Financial events (invoices, payments, allocations) require an immutable trail for auditing, dispute resolution and compliance.

Decision
--------
Maintain an append-only `financial_audit_logs` table capturing `event_type`, `resource_type`, `resource_id`, `payload` (JSON), `created_at`. Do not delete or update existing audit entries; if correction is needed, create compensating audit events.

Consequences
------------
- Streamlines auditing and reduces risk of data tampering.
- Requires careful retention policy planning and storage monitoring since logs grow indefinitely.

Implementation Notes
--------------------
- All services that mutate billing resources must write a corresponding `FinancialAuditLog` record inside the same DB transaction as the state change.
