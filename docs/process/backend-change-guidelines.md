# Backend Change Guidelines

Whenever a change is made to the backend you must:

1. Update or add automated tests to cover the behavior changed/added
   - Unit tests for services and small logic
   - Feature/Integration tests for API controller behavior
   - Ensure validation rules are tested (bad/missing input)
2. Run the full test suite locally (or the relevant subset) and fix any failures.
3. Update project documentation:
   - `CHANGELOG.md` (short entry under Unreleased)
   - Any relevant `docs/*.md` files
   - Update the Bruno collection(s) under `docs/collections/reservas` to keep examples in sync (add or change request bodies and variables)
4. Commit tests and docs together with the code change in the same feature branch.
5. Push and open a PR. The PR must include a short description of what tests were added/updated and where the docs were changed.

Checklist (to include in PR description):

- [ ] Tests added/updated: files/paths
- [ ] All tests pass locally: `php artisan test`
- [ ] CHANGELOG updated
- [ ] Bruno collection updated: `docs/collections/reservas/...` (if applicable)

Rationale

Keeping tests and docs in lock-step with backend code ensures the API remains reliable, easier to review, and prevents regressions in downstream consumers (frontend, integrations, automation).

Automation suggestion

- CI should run `php artisan test` and a script to validate the Bruno collection (if used in CI) with `newman` or equivalent.
- Consider adding a pre-commit hook to run relevant tests quickly before pushing.
