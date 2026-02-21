# Release Notes - Backend

## 0.2.2 - Multi-Property Cancellation Policies (2026-02-20)

**FASE 1 Backend - Production Ready ✅**

### Features
- **CancellationPolicy Model**: 1:1 relationship with Property, soft-deletes for audit trail
- **CancellationRefundRule Model**: N:M relationship with Policy, priority-ordered rules
- **CancellationService**: Complete business logic for refund calculation and audit logging
- **CancellationPolicyController**: 4 endpoints for GET/PUT policy and POST preview/cancel
- **Dynamic Refund Rules**:
  - 7+ days before check-in: 100% refund
  - 5-6 days before check-in: 50% refund
  - 3-4 days before check-in: 0% refund (non-refundable)
  - After check-in: 0% refund (cannot cancel)
- **Financial Audit Trail**: Complete logging with refund details, user context, and policy/rule IDs
- **Property-Scoped Operations**: All operations filtered by property_id from JWT token
- **Automatic Invoice Generation**: Refund credits automatically created when applicable

### Database Changes
- New table: `cancellation_policies` (id, property_id, name, type, active, config, applies_from, created_by_id, soft-deletes)
- New table: `cancellation_refund_rules` (id, policy_id, days_before_checkin_min/max, refund_percent, priority)
- Join table: `cancellation_policy_refund_rule` for N:M relationship
- New columns on `reservations`: `cancelled_at`, `cancellation_reason`, `cancellation_refund_calc` (JSON)
- Fixed: Removed duplicate `financial_audit_logs` creation in 2026_01_31 migration (schema now correct with user_id)

### API Endpoints
- `GET /api/properties/{id}/cancellation-policy` - Fetch active policy + rules
- `PUT /api/properties/{id}/cancellation-policy` - Create/update policy and rules
- `POST /api/reservations/{id}/preview-cancellation` - Calculate refund without persisting
- `POST /api/reservations/{id}/cancel-with-policy` - Execute cancellation with audit trail

### Testing
- ✅ 26/26 tests passing (100%)
- ✅ 89 assertions verified
- Test breakdown:
  - 10 CancellationPolicyTest (models, relationships, scopes, casting)
  - 8 CancellationServiceTest (refund calculations, audit logging, edge cases)
  - 8 CancellationPolicyControllerTest (endpoints, auth, authorization, error handling)

### Bug Fixes
- Fixed duplicate `financial_audit_logs` table creation in migrations
  - Removed table creation from 2026_01_31 migration
  - Kept authoritative schema in 2026_02_08 migration
  - Result: Schema now correct with user_id column (was 1/26 tests failing, now 26/26 passing)

### Breaking Changes
- None (fully backward compatible)

### Migration Required
Yes - Run `php artisan migrate`

### Next Steps
- FASE 1.7: Frontend ReservationCancellationModal component
- FASE 2: OpenAPI documentation update
- FASE 3: Advanced features (partial refunds, penalty escalation)

---

## 0.3.0 - Room Blocks & Service Layer Refactoring (2026-02-18)

- Entregas principais:
  - **Room Blocks (Bloqueios de Disponibilidade)**: 
    - Novos campos no modelo: `type` (enum: maintenance, cleaning, private, custom) e `recurrence` (enum: none, daily, weekly, monthly).
    - O escopo por propriedade foi mantido pela relação `room -> property_id`; não foi adicionada uma coluna `property_id` redundante na tabela `room_blocks`.
    - Remoção de `partner_id` (substituído pelo sistema de `type`).
    - Nova migration: `2026_02_18_000001_update_room_blocks_table.php` com adição de colunas e índices relevantes para `type` e `recurrence`.
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
  - A coluna `property_id` não existe em `room_blocks`; o scoping deve ser feito através da relação `room -> property_id`.

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

