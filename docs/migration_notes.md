Migration notes

New migration included in PR #62 (audit logs):

- `2026_02_08_010000_create_financial_audit_logs.php`

Notes:
- The migration creates `financial_audit_logs` with a UUID primary key and a JSON `payload` column.
- On Postgres the migration uses a DB-side `gen_random_uuid()` default; tests use sqlite in-memory where server defaults don't apply. The `FinancialAuditLog` model assigns a UUID on `creating` to make tests and other DBs work.

To run migrations locally:

```bash
cd backend/src
php artisan migrate
```

To rollback:

```bash
cd backend/src
php artisan migrate:rollback
```

When deploying to production ensure `pgcrypto` is enabled (Postgres) if relying on `gen_random_uuid()`.
