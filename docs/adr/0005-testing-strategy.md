# 5. Testing strategy

Date: 2026-02-01

Status: Proposed

Context
-------
Maintainable refactor requires a robust test suite. Billing domain is business-critical and must have high coverage.

Decision
--------
- Use PHPUnit feature tests for end-to-end flows (login → create partner → create invoice → create payment).
- Use unit tests for services (InvoiceService, PaymentService) to validate allocation, idempotency and audit log creation.
- Use RefreshDatabase and sqlite :memory: for fast tests. Provide factories for core models.

Consequences
------------
- Tests will be the safety net for refactors.
- Keep tests deterministic by using test factories and avoiding external network IO.
