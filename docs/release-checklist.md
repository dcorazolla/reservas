Release checklist for MVP

Follow these steps before merging the MVP to `main` and deploying to staging/prod.

1. Run the full test suites locally
   - Backend: `cd backend/src && ./vendor/bin/phpunit`
   - Frontend: `cd frontend && npm ci && npm run test -- --run`

2. Ensure database migrations are ready
   - Review `backend/src/database/migrations/*` for new migrations.
   - Run locally: `cd backend/src && php artisan migrate`

3. Data and audit verification (optional but recommended)
   - After migrating, create a test invoice + payment and verify `financial_audit_logs` has entries.

4. Documentation
   - Add any necessary release notes to `CHANGELOG.md` and `docs/epics/README.md`.

5. CI and PR
   - Open PR with description and migration notes (PR #62 exists for audit changes).
   - Wait for GitHub Actions to complete and address failures.

6. Merge and deploy
   - Merge only when CI is green.
   - Run migrations in staging/prod: `php artisan migrate --force`.

7. Post-deploy checks
   - Run smoke checks: create invoice -> create payment -> confirm `financial_audit_logs` entries.

If you want, I can run or automate any of these steps.
