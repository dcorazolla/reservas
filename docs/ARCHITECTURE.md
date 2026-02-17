# ARCHITECTURE

Resumo arquitetural do sistema `reservas`.

Camadas principais
- Backend (Laravel): API REST, services de negócio em `app/Services`, controllers em `app/Http/Controllers`, migrations em `database/migrations`.
- Frontend (React): SPA em `frontend/src`, components e pages organizados por funcionalidade.
- Persitência: Postgres em produção; SQLite para testes.

Entidades principais
- Property
  - Campos chave: id (uuid), name, timezone, base_one_adult, base_two_adults, additional_adult, child_price, child_factor, infant_max_age, child_max_age
- RoomCategory
  - Campos: id, name, description
- RoomCategoryRate
  - Campos: id, room_category_id, base_one_adult, base_two_adults, additional_adult, child_price
- RoomCategoryRatePeriod
  - Campos: id, room_category_id, start_date, end_date, base_one_adult, base_two_adults, additional_adult, child_price, description
- Room
  - Campos: id, property_id, room_category_id, name, number, beds, capacity, active, notes
- RoomRate
  - Campos: id, room_id, people_count, price_per_day (tarifa base por nº de pessoas)
- RoomRatePeriod
  - Campos: id, room_id, people_count, start_date, end_date, price_per_day, description
- Reservation
  - Campos: id, property_id, room_id, guest_name, start_date, end_date, status, total_price
- Invoice
  - Campos: id, reservation_id, amount, currency, status, issued_at, paid_at
- Payment
  - Campos: id, invoice_id, amount, provider, provider_id, status

Cascata de preços (ver `docs/CONSOLIDATED_REQUIREMENTS.md` §8)
- room_rate_period → category_rate_period → room_rate → category_rate → property_base
- `ReservationPriceCalculator` em `backend/src/app/Services/` implementa a lógica.

Onde encontrar o código (mapa rápido)
- `backend/src/app/Services` — lógica de cálculo de preço, criação de reserva, faturamento
- `backend/src/app/Http/Controllers/Api` — endpoints REST (reservations, invoices, payments)
- `frontend/src/components` — componentes UI reutilizáveis (Modal, FormField, Skeleton, CurrencyInput)
- `frontend/src/pages` — páginas (Properties, RoomCategories, Rooms, Reservations)
- `frontend/src/services` — serviços API (crud genérico + nested crud para sub-recursos)
- `frontend/src/models` — types/schemas TypeScript (Room, Property, RoomRate, schemas Zod)

Decisões importantes (resumo)
- Auditoria financeira: todas as alterações financeiras são registradas em logs append-only (ver ADRs quando existentes)
- Separação de responsabilidades: serviços (business logic) não devem usar lógica de controle/HTTP

Hotspots & Workplan (resumo do relatório de auditoria)
- Hotspots identificados:
  - Ambiguidade de route-model binding sem escopo por `property_id`, causando erros intermitentes.
  - Controllers com lógica de criação direta de models (devem ser finos e delegar a Services).
  - Services que misturam lógica de negócio com persistência; recomenda-se extrair Repositories.
  - Cobertura de testes insuficiente em helpers de escopo (ex.: `EnsuresPropertyScope`).
  - Falta de análise estática e linting automatizado (PHPStan / Pint).

- Plano incremental sugerido:
    5. Incluir helpers de teste e coverage para scoping e falhas previamente intermitentes.
    6. Incluir ferramentas de análise (PHPStan) e formatação (Pint) e integrar na CI.

  ## Sprint 1 MVP: alterações arquiteturais e requisitos

  - Endpoints mínimos a serem expostos (OpenAPI stub):
    - `GET /api/reservations` — listar reservas por `property_id` e intervalo.
    - `POST /api/invoices` — criar invoice (deve gerar linhas, totals e registrar audit log).
    - `POST /api/payments` — registrar pagamento de invoice.
    - `GET /api/properties` — listar propriedades do usuário.

  - Regras importantes:
    - Todos os endpoints que retornam/alteram dados ligados a uma propriedade devem validar o claim `property_id` no JWT e aplicar scoping por `property_id`.
    - Fluxos que alteram valores (invoices, payments) devem gravar entradas em `financial_audit_logs` como append-only e ter testes que verifiquem imutabilidade básica do log.

  - Observações operacionais:
    - Ao implementar `POST /api/invoices`, garantir que a operação seja transacional: criação de invoice + linhas + audit log devem ocorrer dentro de uma única transação ou com compensação em caso de falha.
    - Atualize `backend/src/public/openapi.yaml` imediatamente ao alterar contratos da API e gere/atualize a coleção Bruno (`docs/collections/reservas`).
  1. Implementar scoped route-model binding no `RouteServiceProvider` para modelos sensíveis ao `property_id`.
  2. Tornar controllers finos (ex.: `InvoiceController`) usando `FormRequest` e `Services` para regras de negócio.
  3. Extrair persistência para `Repositories` (ex.: `InvoiceRepository`) e injetar nos `Services`.
  4. Adicionar helpers de teste e coverage para scoping e falhas previamente intermitentes.
  5. Incluir ferramentas de análise (PHPStan) e formatação (Pint) e integrar na CI.

Esses passos foram arquivados originalmente em um relatório de auditoria (`docs/architecture/backend-audit.md`) e sintetizados aqui para referência operacional.
