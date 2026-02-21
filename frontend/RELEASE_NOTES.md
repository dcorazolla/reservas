# Frontend Release Notes

## v0.3.0 - 2026-02-18

**Reservations Module Complete + Room Blocks Management**

### Phase 1-2: Reservations Module (Models and Services)
- feat(reservations): implement complete Reservation model with 8 statuses, 3 payment types, 4 guarantee types
- feat(reservations): add ReservationStatus enum (pre-reserva, reservado, confirmado, checked_in, checked_out, no_show, cancelado, blocked)
- feat(reservations): add status color mapping (8 colors) and English labels for all statuses
- feat(reservations): add CALENDAR_BREAKPOINTS configuration (mobile/tablet/desktop with adaptive 5-35 days)
- feat(reservations): add helper functions (getCalendarConfig, isValidReservationDates, getStayLength, isDateInReservation, canonicalizeStatus)
- feat(reservations): implement ReservationService with CRUD operations, state transitions, price calculation
- feat(reservations): implement calendar service with date utilities and room filtering

### Phase 3a-3e: Room Blocks Management (Models, Services, Components, Page, Routes)
- feat(blocks): implement BlockType enum (maintenance, cleaning, private, custom)
- feat(blocks): implement BlockRecurrence enum (none, daily, weekly, monthly) with helper expansion logic
- feat(blocks): implement 16+ helper functions for block status, duration, validation, sorting, grouping
- feat(blocks): add RoomBlockService with CRUD + expand operations (list, get, create, update, delete, expandBlocks)
- feat(blocks): add batch operations support (createBlocksBatch, deleteBlocksBatch)
- feat(blocks): add API data formatting and expansion logic for recurring blocks
- feat(blocks): implement BlockStatusBadge component with type-specific colors and icons
- feat(blocks): implement BlocksList component with sorting (date/type/duration), filtering, CRUD actions
- feat(blocks): implement BlocksModal component with form validation, date range checking, recurrence support
- feat(blocks): add BlocksPage (full CRUD interface) with loading states, error handling, statistics
- feat(routes): add /settings/blocks route with lazy loading and auth protection
- feat(menu): add "🚫 Bloqueios" menu item to Settings submenu with i18n support

### Testing
- test(blocks): 47 comprehensive tests for block models (helpers, recurrence, validation, sorting, grouping)
- test(blocks): 23 tests for block CRUD service (list, get, create, update, delete, expand, batch operations)
- test(blocks): 16 tests for block components (exports, prop interfaces, edge cases)
- test(calendar): 32 tests for calendar service utilities
- test(reservations): 38 tests for reservation models, 29 tests for reservation service
- test(overall): 395/395 frontend tests passing (100% coverage maintained across all modules)

### Previous Release - 2026-02-18
- feat(crud-pages): add success/error messages with 30s autoclose to all CRUD pages (Diogo Santana Corazolla)
- feat(base-rates): add close button to success message and increase display time to 6s (Diogo Santana Corazolla)
- chore(i18n): equalize translations across all 4 languages (pt-BR, en, es, fr) (Diogo Santana Corazolla)
- feat(frontend): add cancel button and success message to BaseRatesPage (Diogo Santana Corazolla)
- fix(frontend): create baseRatesSchema for BaseRatesPage validation (Diogo Santana Corazolla)
- fix(frontend): use proper form element instead of VStack as for form submission (Diogo Santana Corazolla)
- refactor(frontend): add 2-column grid layout to BaseRatesPage for better UX (Diogo Santana Corazolla)
- refactor(frontend): remove baseRates.form.description for consistency with other pages (Diogo Santana Corazolla)
- fix(frontend): add missing i18n keys and correct translation keys in BaseRatesPage (Diogo Santana Corazolla)
- fix(frontend): correct CurrencyInput import path in BaseRatesPage (Diogo Santana Corazolla)
- refactor(frontend): simplify BaseRatesPage to show only tariff base fields (Diogo Santana Corazolla)
- fix(frontend): load property from JWT token in BaseRatesPage (Diogo Santana Corazolla)
- fix(frontend): remove useToast from BaseRatesPage (use console logging) (Diogo Santana Corazolla)
- fix(frontend): correct AuthContext import path in BaseRatesPage (Diogo Santana Corazolla)
- fix(frontend): refactor BaseRatesPage to use AuthContext property and fix layout (Diogo Santana Corazolla)
- fix(frontend): correct propertiesService import in BaseRatesPage (Diogo Santana Corazolla)
- fix(frontend): correct PageShell import path in BaseRatesPage (Diogo Santana Corazolla)
- chore(release): bump frontend to v0.2.1 with release notes (Diogo Santana Corazolla)
- fix: correct base rates link in sidebar menu (Diogo Santana Corazolla)
- docs: CRITICAL - update backend test security protocol to ban ALLOW_TESTS_ON_NON_TEST_DB=1 (Diogo Santana Corazolla)
- refactor: replace duplicate tariff code with RatesField component in EditPropertyModal (Diogo Santana Corazolla)
- feat(frontend): add RatesField component and BaseRatesPage for tariff base management (Diogo Santana Corazolla)
- ci: remove unused a11y job from frontend tests (Diogo Santana Corazolla)
- fix: correct YAML indentation in create-release-tags workflow (Diogo Santana Corazolla)
- fix: correct YAML syntax in create-release-tags workflow (Diogo Santana Corazolla)
- ci: improve release notes to show both frontend and backend tags (Diogo Santana Corazolla)
- ci: add automatic release tag creation workflow (Diogo Santana Corazolla)
- Merge pull request #76 from dcorazolla/feature/partners-crud (Diogo Corazolla)
- docs: update agent workflow to use gh CLI instead of gitkraken (Diogo Santana Corazolla)
- docs: consolidate and harden backend test safety documentation (Diogo Santana Corazolla)
- fix(backend): property delete check for cascading reservations via rooms (Diogo Santana Corazolla)
- Merge pull request #75 from dcorazolla/feature/partners-crud (Diogo Corazolla)
- fix(frontend): close delete confirmation modals, add form validation & masks (Diogo Santana Corazolla)
- feat(frontend): add partners CRUD UI, service, tests, i18n (Diogo Santana Corazolla)
- Merge pull request #74 from dcorazolla/feature/rooms-crud (Diogo Corazolla)
- chore: resolve merge conflicts with main (package.json version, release notes) (Diogo Santana Corazolla)
- feat: room rates, pricing cascade fix, nested CRUD service, docs & v0.2.0 (Diogo Santana Corazolla)
- refactor: extract domain types to src/models, add @models alias (Diogo Santana Corazolla)
- refactor: unify CSS, extract CRUD service and validation helpers (Diogo Santana Corazolla)
- test: add comprehensive frontend tests reaching 99.5% line coverage (Diogo Santana Corazolla)
- chore: apagando scripts (Diogo Santana Corazolla)
- chore: traduction adjusts (Diogo Santana Corazolla)
- chore: traduction adjusts (Diogo Santana Corazolla)
- chore: traduction adjusts (Diogo Santana Corazolla)
- chore(frontend): bump frontend version to 0.1.2 and update RELEASE_NOTES (Diogo Santana Corazolla)
- chore(frontend): bump frontend version to 0.1.2 and update RELEASE_NOTES (Diogo Santana Corazolla)
- Merge pull request #72 from dcorazolla/inspect/stash0 (Diogo Corazolla)
- chore(scripts): add markdown link checker (Diogo Santana Corazolla)
- Merge pull request #71 from dcorazolla/docs/consolidate-docs (Diogo Corazolla)
- fix(docs): resolve merge conflict in .github/copilot-instructions.md (Diogo Santana Corazolla)
- fix(test): correct Sidebar integration import (./Sidebar) (Diogo Santana Corazolla)
- Merge pull request #70 from dcorazolla/feat/room-categories (Diogo Corazolla)
- chore(docs): archive duplicated docs and point to consolidated files (Diogo Santana Corazolla)
- chore(docs): consolidate agent instructions and requirements (Diogo Santana Corazolla)