# Release Notes - Backend

## 0.3.0 - Room Blocks & Service Layer Refactoring (2026-02-18)

- Entregas principais:
  - **Room Blocks (Bloqueios de Disponibilidade)**: 
    - Novos campos no modelo: `type` (enum: maintenance, cleaning, private, custom), `recurrence` (enum: none, daily, weekly, monthly), `property_id` (FK explícita para scoping multi-tenant).
    - Remoção de `partner_id` (substituído pelo sistema de `type`).
    - Nova migration: `2026_02_18_000001_update_room_blocks_table.php` com adição de índices para performance.
  - **RoomBlockService (Nova Camada de Serviço)**:
    - Seguindo padrão arquitetural do projeto, toda lógica de CRUD movida para `App\Services\RoomBlockService`.
    - Métodos: `list()`, `create()`, `update()`, `delete()`, `expandBlocks()`.
    - Validação centralizada de date range, room-property relationship, e recurrence patterns.
  - **RoomBlockController Refatorado**:
    - Simplificado para apenas HTTP layer (validação de requisição, chamada ao service, resposta).
    - Segue padrão do `RoomController` e `RoomService`.
  - **Validação de Recorrência em Reservas**:
    - `CreateReservationService` agora valida bloqueios periódicos (daily, weekly, monthly) ao criar reservas.
    - Métodos helpers: `isBlockedByRecurringRules()`, `dateIsBlocked()`.
  - **Novo Endpoint**:
    - `GET /room-blocks/expand` retorna datas bloqueadas em um range (útil para calendário).
  - **Filtros Avançados**:
    - Filtros por `type`, `recurrence`, date range na listagem.
    - Suporte a paginação via `per_page`.
  - **Documentação OpenAPI**:
    - Tag "Room Blocks" adicionada com schemas `RoomBlockInput` e `RoomBlock`.
    - Todos os 5 endpoints documentados com exemplos de request/response.
  - **ADR 0012**:
    - Arquitetura de decisão criada e atualizada com status "Implemented (Backend Complete)".
  
- Testes:
  - ✅ 201/201 backend tests passing
  - ✅ 698 assertions
  - Cobertura: CRUD, authorization, recurrence validation, date range handling.

- Breaking Changes:
  - `RoomBlock` agora requer campos `type` e `recurrence` (com defaults no controller).
  - `partner_id` removido do modelo (usar `type` em vez disso).
  - `property_id` agora obrigatório (scoping automático pelo JWT).

- Next Steps (Frontend):
  - Fase 3a: Bloqueios Models (frontend/src/models/blocks.ts)
  - Fase 3b: Bloqueios Services (frontend/src/services/blocks.ts)
  - Fase 3c-3d: Components + Pages + Routes
  - Fase 3e: Integração com calendário

## 0.2.0 - Sprint 1 MVP (2026-02-08)

- Entregas principais:
  - Reservas: endpoints de criação/atualização/listagem e cálculo de preços detalhado.
  - Pagamentos e faturas: endpoints de pagamento e criação de faturas a partir de reservas (flaggeado).
  - Partners: CRUD completo de parceiros e associação a reservas.
  - Auditoria financeira: logs de auditoria de transações implementados.
  - **Remoção do `calculate()` legado**: o método `calculate()` do `ReservationPriceCalculator` agora delega inteiramente ao `calculateDetailed()`, eliminando código duplicado e garantindo cascata de preços correta (5 níveis: room_period → category_period → room_base → category_base → property_base).
  - **Campo `source` no response**: o endpoint `POST /reservations/calculate` agora retorna `source` indicando de onde veio o preço (`room_period`, `category_period`, `room_rate`, `category_rate`, `property_base`).
  - **Documentação OpenAPI atualizada**: endpoint `/reservations/calculate` documentado com cascata e schema de resposta incluindo `source`.

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

