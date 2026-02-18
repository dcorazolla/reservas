# Projeto Reservas - TODO & Progress Tracking

## Sprint Atual: Room Blocks CRUD + Pattern Documentation

### ✅ COMPLETED

#### Backend - Room Blocks Feature
- [x] Create RoomBlockSeeder with random blocks (3/month, 3-10 days)
- [x] Update migration: remove property_id, add type/recurrence enums
- [x] Update RoomBlock model: remove property_id from fillable
- [x] Implement RoomBlockService with whereHas property scoping
- [x] Implement RoomBlockController with correct assertions
- [x] Version backend to v0.3.1
- [x] Update OpenAPI documentation
- [x] Git commit and push backend changes

#### Frontend - Room Blocks CRUD
- [x] Create models/blocks.ts with RoomBlock types
- [x] Create services/blocks.ts with createCrudService
- [x] Create pages/Blocks/BlocksPage.tsx with DataList component
- [x] Create components/Blocks/EditBlockModal.tsx with FormField pattern
- [x] Add blockSchema to models/schemas.ts for validation
- [x] Ensure dates use parseISO + format (not manual Date handling)
- [x] Implement CRUD operations: list, create, update, delete

#### Internationalization - 4 Languages
- [x] Add translations for blocks in pt-BR/common.json
- [x] Add translations for blocks in en/common.json
- [x] Add translations for blocks in es/common.json
- [x] Add translations for blocks in fr/common.json

#### Date-fns Consolidation
- [x] Refactor frontend/src/services/calendar.ts (complete date-fns migration)
- [x] Refactor frontend/src/models/reservation.ts (date-fns usage)
- [x] Refactor frontend/src/services/reservations.ts (date-fns usage)
- [x] Verify no new Date() usage scattered in frontend (only tests/clock)

#### UI/UX Standardization
- [x] Replace custom Box-based list with DataList component in BlocksPage
- [x] Reorganize EditBlockModal fields: Room → Dates (grid) → Type → Recurrence → Reason
- [x] Ensure FormField wrapper consistency across all forms
- [x] Verify grid layout for date ranges (gridTemplateColumns: '1fr 1fr')

#### Documentation - Copilot Instructions
- [x] Add section: "⚠️ Evitar Reinvenção de Componentes - CONSULTE ANTES DE CRIAR"
  - Document available components: DataList, Modal, FormField, Message, ConfirmDeleteModal
  - Include checklist: Is component similar to existing? Can I use generic? When to create new?
  - Provide anti-patterns: Don't create BlocksList, BlocksModal, etc when generics exist
- [x] Add section: "Formulários frontend - Padrão de Campos, Ordenação e Layout"
  - Document field ordering: required first → dates grouped → optional last
  - Include grid layout examples for multi-column forms
  - Provide anti-patterns: all fields in one column, optional in middle, separate date fields
  - Reference implementations: EditBlockModal, EditRoomModal, EditRoomCategoryModal
- [x] Add section: "Padrões de Implementação no Backend"
  - Document CRUD pattern: Controllers orquestram, Services contêm lógica
  - Document property scoping: assertBelongsToProperty, whereHas relationships
  - Include anti-patterns: Logic in controllers, direct property_id columns
- [x] Add section: "⚠️ Anti-Pattern: Criar Novo Serviço Desnecessariamente"
  - Document factory pattern usage: createCrudService, createNestedCrudService, createScopedCrudService
  - Include checklist: Does factory already exist? Implement only custom logic?
- [x] Add section: "⚠️ Validação End-to-End Antes de Commits Automáticos"
  - Document backend validation: routes, FormRequests, property scoping, tests
  - Document frontend validation: types, components, patterns, dates, translations
  - Document integration validation: backend format, property_id scoping, date formatting
  - Include mandatory checklist: tests pass, types valid, reusables used, patterns followed

### 🔄 IN PROGRESS
- [ ] Update root README.md to point to `.github/copilot-instructions.md` as instruction source

### ⏳ PENDING (Awaiting user validation)
- [ ] Local testing of all CRUD operations
- [ ] Git commit of all frontend changes
- [ ] Git push to feature branch
- [ ] Create PR with description and checklist

### 📋 Future Work
- [ ] Add CurrencyInput to Room rates section
- [ ] Implement cascading rates for room blocks
- [ ] Add tests for BlocksPage, EditBlockModal, blocks service
- [ ] Add complex reservation patterns (multi-room, group bookings)
- [ ] Implement availability calendar with block highlighting

---

## Key Decisions & Patterns

### Architecture
- **Property Scoping:** Backend-managed via JWT property_id claim, never sent by frontend
- **CRUD Services:** Use generic factories (createCrudService, createScopedCrudService) - no custom implementations
- **Date Handling:** All operations via date-fns v4.1.0 with pt-BR locale
- **Components:** Reuse Shared components (DataList, Modal, FormField) - no reinvention

### Frontend Patterns
- **Forms:** Logical field grouping (required → dates grouped → optional), FormField wrapper, HTML inputs
- **Lists:** DataList component with gap: 8px, entity-row CSS class
- **Modals:** Shared/Modal/Modal wrapper with title, close button, children
- **Dates:** parseISO for ISO strings, format for display, date-fns for all operations

### Backend Patterns
- **CRUD:** Service layer for logic, Controller for HTTP/assertions, Model for queries
- **Property Scoping:** whereHas(relationship) for queries, assertBelongsToProperty for validation
- **Naming:** Controllers in plural (RoomBlockController), Services as *Service suffix

### Git Workflow
- Trunk-based with feature/* branches
- Small atomic commits with conventional messages (feat:, fix:, docs:, test:, chore:)
- Automated tag creation via GitHub Actions (reads versions from package.json, composer.json)
- Always require human approval before merge

---

## Documentation References

**Read First:**
- `.github/copilot-instructions.md` (master instructions for agents)
- `docs/CONSOLIDATED_REQUIREMENTS.md` (business rules & requirements)
- `docs/system-instructions.md` (architecture overview)

**Architecture Decisions:**
- `docs/adr/0001-uuid-primary-keys.md`
- `docs/adr/0002-property-scoping.md`
- `docs/adr/0010-useeffect-dependencies-pattern.md`

**API Specification:**
- `backend/src/public/openapi.yaml`
- `docs/collections/reservas` (Bruno/Postman collections)

---

## Contact & Issues

- Questions about patterns? Refer to `.github/copilot-instructions.md`
- Uncertain about implementation? Open issue with 2 proposed options
- Pattern violations? Review checklist in this document and copilot-instructions.md

Last Updated: 2026-02-18
