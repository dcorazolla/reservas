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

## 0.1.0 - Initial
- Scaffolded frontend application and initial components
- Added Properties CRUD UI and tests

