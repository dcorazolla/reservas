# Release Notes - Backend

## 0.1.0 - Inicial

- Versão inicial do backend: `0.1.0`.
- Atualizações/observações:
  - Campo `version` adicionado ao `composer.json` para rastreamento semver.
  - Ajustes recentes em validação de datas e testes para evitar exceções do Carbon.

Fluxo para nova release:
- Atualizar `backend/src/composer.json` com a nova versão (ex.: `0.1.1`).
- Atualizar `backend/RELEASE_NOTES.md` com mudanças.
- Tag no git: `git tag -a backend/v0.1.0 -m "backend v0.1.0"`

## 0.2.0 - Sprint 1 MVP (2026-02-08)

- Entregas principais:
  - Reservas: endpoints de criação/atualização/listagem e cálculo de preços detalhado.
  - Pagamentos e faturas: endpoints de pagamento e criação de faturas a partir de reservas (flaggeado).
  - Partners: CRUD completo de parceiros e associação a reservas.
  - Auditoria financeira: logs de auditoria de transações implementados.

- Observações e próximos passos:
  - Habilitar feature-flag `invoices.create_from_reservation` em staging para validação manual.
  - Revisar pequenas deprecações do PHPUnit em follow-up.

## 0.1.1 - Patch (2026-02-08)

- Bump patch release for backend: `0.1.1`.
- Feature: Add minibar consumptions and checkout integration (see PR #63).
  - New migration: `2026_02_08_030000_create_minibar_consumptions_table.php`.
  - New model/service: `MinibarConsumption`, `MinibarService` and minibar API endpoints.
  - Reservation checkout now attempts minibar invoice creation and writes audit logs on success/failure.

Deployment notes:
- Run `php artisan migrate --force` to apply migrations.
- Verify `APP_KEY` and `JWT_SECRET` are set in the environment for production/staging to avoid runtime errors when creating invoices.

Developer workflow (version, tests, push, merge)

- Update version:
  - Edit `backend/src/composer.json` and set the `version` field to the new SemVer value (e.g. `0.1.2`).
  - Add a short entry into `backend/RELEASE_NOTES.md` describing the changes.

- Run tests locally (recommended in Docker):
  ```bash
  # Start DB + app containers
  docker compose up -d pg app

  # Install PHP deps (if needed) and run migrations
  docker compose exec app sh -lc "composer install --no-interaction --prefer-dist || true"
  docker compose exec app sh -lc "php artisan migrate --force"

  # Run the backend test suite
  docker compose exec app sh -lc "./vendor/bin/phpunit --colors=never"
  ```

- Commit & push:
  ```bash
  git add backend/src/composer.json backend/RELEASE_NOTES.md
  git commit -m "chore(release): backend vX.Y.Z"
  git push origin <branch>
  ```

- Open a PR and ensure CI passes. When all checks pass and reviews are approved, merge via PR. Prefer using `gh` for automation:
  ```bash
  gh pr create --fill --base main --head <branch>
  # optionally enable auto-merge
  gh pr merge <number> --auto --merge
  ```

- After merge, create annotated tag and GitHub Release (example):
  ```bash
  git fetch origin
  git checkout main
  git pull origin main
  git tag -a backend/vX.Y.Z -m "backend vX.Y.Z"
  git push origin backend/vX.Y.Z
  gh release create backend/vX.Y.Z --title "backend vX.Y.Z" --notes-file backend/RELEASE_NOTES.md --target main
  ```

Note: this workflow mirrors the project's `docs/CHECKLIST.md` release section; keep both updated if processes change.

