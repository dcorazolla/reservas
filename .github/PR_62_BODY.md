This PR adds append-only financial audit logs for invoices and payments and includes the supporting migration, an Eloquent model, and tests.

Files of interest:
- `backend/src/database/migrations/2026_02_08_010000_create_financial_audit_logs.php` — migration to create `financial_audit_logs` table.
- `backend/src/app/Models/FinancialAuditLog.php` — Eloquent model; assigns `id` with `Str::uuid()` on create to keep sqlite test DB happy.
- `backend/src/tests/Feature/InvoicePaymentAuditTest.php` — integration test verifying audit entries are created transactionally and invoice status updates to `paid`.

Notes for reviewers:
- Migration: run `php artisan migrate` to add the `financial_audit_logs` table. On Postgres the table uses `uuid` default at DB level; the model also assigns a UUID if none present (ensures tests and other DBs without a server-side default work).
- Tests: All backend PHPUnit tests pass locally: `./vendor/bin/phpunit` (189 tests).

Checklist before merge:
- [ ] CI (GitHub Actions) completes successfully on `main`.
- [ ] Confirm migrations applied in staging/prod with `php artisan migrate`.
- [ ] (Optional) Run smoke e2e flow: create invoice -> create payment -> check `financial_audit_logs`.

If you'd like, I can add a small smoke script or more tests (partial payments / idempotency) before requesting reviews.
