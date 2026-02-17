# Frontend Release Notes

This file contains release notes for the frontend package (`frontend`). Keep this updated whenever you cut a new release (see README instructions).

- Initial release notes created: version 0.1.0

## 0.2.0 - Room Rates, Service Refactoring & UI Improvements

### Novas funcionalidades
- **Room Rates**: toggle de tarifas por nº de pessoas no modal de edição de quartos, com campos dinâmicos baseados na capacidade.
- **createNestedCrudService**: factory genérica para serviços de sub-recursos (rates de rooms, rates de categories). Substitui implementações manuais.
- **CurrencyInput**: componente de input monetário com máscara (R$ / formato brasileiro).
- **FormField**: wrapper para campos de formulário com label, error e layout consistente.
- **SkeletonFields / SkeletonList**: componentes de loading com CSS puro para formulários e listas.
- **Schemas Zod**: validação centralizada em `frontend/src/models/schemas.ts` via `react-hook-form` + `zod`.

### Correções e melhorias
- Toggle de tarifas sempre inicia fechado ao abrir qualquer modal (Properties, Room Categories, Rooms).
- Ao limpar campo de tarifa que tinha valor no banco, o registro é deletado (via `deleteRate`).
- Ao reduzir capacidade de quarto, rates órfãos (people_count > nova capacidade) são deletados automaticamente.
- Labels de tarifas usam i18n keys existentes (`price_single`, `price_double`, etc.) via mapa `RATE_LABEL_KEYS`.
- Refatoração de `roomRates.ts` e `roomCategoryRates.ts` para usar `createNestedCrudService`.
- Types extraídos para `frontend/src/models/roomRate.ts`.

### Testes
- 196 testes em 38 arquivos (100% passing).
- 14 testes para EditRoomModal (skeleton, toggle, rate fields, save).
- 4 testes para roomRates service.
- 4 testes para createNestedCrudService.

## 0.1.2 - Release - 2026-02-16

- test(room-categories): stabilize flows and reach 100% coverage (Diogo Santana Corazolla)
- test(room-categories): stabilize flows and reach 100% coverage (Diogo Santana Corazolla)
- feat(room-categories): add rates UI, services, tests, i18n and README docs (Diogo Santana Corazolla)
- Merge pull request #69 from dcorazolla/feat/properties-bkp-cors (Diogo Corazolla)
- chore(properties): add backend CORS, move @BKP to repo root, relocate sidebar integration test, update frontend .gitignore (Diogo Santana Corazolla)
- Merge pull request #68 from dcorazolla/feat/properties-page (Diogo Corazolla)
- chore(frontend): add semver bump scripts, release-notes generator, initial release notes, README instructions; add properties flow tests (Diogo Santana Corazolla)
- feat(properties): add properties CRUD UI, tariff group, validation and i18n (Diogo Santana Corazolla)
- feat(frontend): scaffold Properties page, route and basic tests (Diogo Santana Corazolla)
- chore(frontend): fix tests, add Sidebar integration test, migrate remember-label to CSS, prefer gh CLI in README (Diogo Santana Corazolla)
- fix(tests): repair Sidebar integration test; fix DateTimeClock test import; move LoginPage remember label to CSS (Diogo Santana Corazolla)
- chore(repo): remove tracked frontend/node_modules and ignore it (Diogo Santana Corazolla)
- chore: fix .gitignore (remove fences) so frontend/node_modules is ignored (Diogo Santana Corazolla)
- chore: remove tracked node_modules and add frontend/node_modules to .gitignore (Diogo Santana Corazolla)
- Merge pull request #67 from dcorazolla/chore/design-system-audit (Diogo Corazolla)
- chore(frontend): docs, vitest config and header/clock tests (Diogo Santana Corazolla)
- refactor(frontend): pages/components aliases and LoginPage folder structure (Diogo Santana Corazolla)
- feat(frontend): implement LoginPage with react-hook-form + zod and add colocated test (Diogo Santana Corazolla)
- docs(frontend): add TODO update policy to README (preserve history; mark items completed only) (Diogo Santana Corazolla)
- fix(frontend): remove useColorModeValue from PageShell for Chakra compatibility (Diogo Santana Corazolla)
- feat(frontend): add routing (AppRoutes) and PageShell with skeletons; add Home/Login placeholders (Diogo Santana Corazolla)
- docs(frontend): enforce project conventions (tests colocated, css rules, themes, i18n, accessibility) (Diogo Santana Corazolla)
- chore(frontend): add AGENT_TODO_JSON to README for agent automation (Diogo Santana Corazolla)
- chore(design): add Chakra provider and ChakraModal POC (Diogo Santana Corazolla)
- chore(design): use CSS tokens for Popover background and ErrorDialog icon color (fix dark mode) (Diogo Santana Corazolla)
- fix(minibar): safely format product price with formatMoneyNullable (Diogo Santana Corazolla)
- fix(modal): include className in props to avoid ReferenceError (Diogo Santana Corazolla)
- ui(modal): add modal className prop and wide variant; use wide modal for ReservationModal (Diogo Santana Corazolla)
- ui(modal): increase default modal width for reservation details (Diogo Santana Corazolla)
- feat(ui): add Minibar products link to Configurações menu (Diogo Santana Corazolla)
- feat(minibar): add products CRUD UI and API helpers (Diogo Santana Corazolla)
- Merge pull request #66 from dcorazolla/feature/frigobar-stock (Diogo Corazolla)
- ci(workflow): call npm test without extra --run to avoid duplicate flag (Diogo Santana Corazolla)
- chore(ci): retrigger frontend tests (Diogo Santana Corazolla)
- feat(frontend): inline minibar quick-view in ReservationModal; open minibar modal instead of navigation; move tests next to components; standardize CSS names (Diogo Santana Corazolla)
- chore(styles): audit remaining colors, add theme toggle and dark variables (Diogo Santana Corazolla)
- chore(styles): introduce CSS variables and replace hard-coded colors across frontend (Diogo Santana Corazolla)
- feat(reservations): action endpoints (confirm/cancel/finalize), property settings, audit table, UI buttons and status square (Diogo Santana Corazolla)
- feat(guarantee): add guarantee fields, show guarantee badge in modal, docs, and test adjustments (Diogo Santana Corazolla)
- feat(frontend): canonicalize statuses, add status pill + palette, and make tests non-interactive (Diogo Santana Corazolla)
- fix(frontend): normalize backend reservation.status to frontend status values in ReservationModal (Diogo Santana Corazolla)
- fix(reservations): check conflicts against updated room and normalize dates on update (Diogo Santana Corazolla)
- fix(frontend): show manual input only when explicit price_override exists; remove stray calcLoading set in cleanup (Diogo Santana Corazolla)
- feat(backend): add price_override column + model/resource + seed updates (Diogo Santana Corazolla)
- feat(frontend): split reservations table into Valor Calculado and Valor Manual columns (Diogo Santana Corazolla)
- fix(frontend): show manual price input only when editing or value exists; adjust placeholder to avoid showing calc as value (Diogo Santana Corazolla)
- fix(frontend): show Edit button only when no manual price is set (Diogo Santana Corazolla)
- feat(frontend): manual price UX — edit/clear button, inline manual price, format days dd/mm/yyyy and larger font; update calc on manual change (Diogo Santana Corazolla)
- feat(frontend): summary layout — total left and manual price right; daily values inline (Diogo Santana Corazolla)
- feat(frontend): add skeleton placeholders to ReservationModal while loading partners/rooms and calc (Diogo Santana Corazolla)
- fix(frontend): avoid calendar header overlap by rendering skeleton only while loading (Diogo Santana Corazolla)
- feat(frontend): show skeleton placeholder on CalendarPage while loading (Diogo Santana Corazolla)
- feat(frontend): add Skeleton component + example usage (Diogo Santana Corazolla)
- chore: salvar progresso antes de adicionar skeleton components (Diogo Santana Corazolla)
- test: add MinibarService unit tests for stock decrement and insufficient stock (Diogo Santana Corazolla)
- tests: add .env.testing.example (sqlite in-memory + file-backed) (Diogo Santana Corazolla)
- tests: abort if APP_ENV != testing or DB not sqlite :memory: (safety guard) (Diogo Santana Corazolla)
- Merge pull request #65 from dcorazolla/feature/frigobar-stock (Diogo Corazolla)
- tests: mock global fetch under Vitest to avoid CI network calls (Diogo Santana Corazolla)
- test(ci): add calendar and room-blocks mocks in vitest.setup.ts to stabilize CI (Diogo Santana Corazolla)
- test: stub canvas getContext and add minimal global fetch mock for CI tests (Diogo Santana Corazolla)
- test(frontend): use plain 'vitest' in package.json to avoid duplicate --run with CI (Diogo Santana Corazolla)
- test: remove ExampleTest (cleanup) (Diogo Santana Corazolla)
- ci: run composer commands in backend/src and scope cache to backend/src/composer.lock (Diogo Santana Corazolla)
- test(frontend): run vitest with --run by default (Diogo Santana Corazolla)
- frontend: bump version to 0.1.2 for minibar stock improvements (Diogo Santana Corazolla)
- Calendar: canonicalize reservation status class names in CalendarGrid (Diogo Santana Corazolla)
- Seeds: add PartnerReservationsSeeder (partner + reservations + invoices) (Diogo Santana Corazolla)
- Minibar: add Product admin API, seeder and bump backend version to 0.1.3 (Diogo Santana Corazolla)
- Minibar: add Product model + migration and atomically decrement stock on consumption; handle OOS errors (Diogo Santana Corazolla)
- Merge feature/frigobar: minibar idempotency + reservation index defaults (Diogo Santana Corazolla)
- Reservations: default index range to current month when no dates provided (Diogo Santana Corazolla)
- Minibar: idempotent minibar invoice creation in checkout (skip duplicate) (Diogo Santana Corazolla)
- Reservation: avoid duplicate invoices by updating existing draft invoices (Diogo Santana Corazolla)
- Remove Laravel welcome route and view; bump backend version to 0.1.2 (Diogo Santana Corazolla)
- calendar: let page scrollbar scroll header/menu and content (remove internal scroll & sticky) (Diogo Santana Corazolla)
- calendar: make page header match other pages (wrap with .page) (Diogo Santana Corazolla)
- Merge pull request #64 from dcorazolla/feature/frontend-room-block-ui (Diogo Corazolla)
- layout: remove page-header sticky behavior; finalize layout tweaks (Diogo Santana Corazolla)
- feat(frontend): add RoomBlock UI (modal + calendar overlay) and frontend docs; enforce PR-only workflow (Diogo Santana Corazolla)
- docs: add backend developer workflow (version, tests, push, merge) and precise test commands in SETUP.md (Diogo Santana Corazolla)