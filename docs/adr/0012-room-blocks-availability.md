# ADR 0012: Room Blocks (Bloqueios de Disponibilidade)

**Data**: 2026-02-18  
## Status: Implemented (Backend Complete)  
**Autor**: Diogo Santana Corazolla

## Contexto

O sistema Reservas precisa suportar bloqueios de disponibilidade para quartos durante períodos específicos, impedindo a criação ou edição de reservas em datas bloqueadas. Exemplos: manutenção, limpeza, períodos privados (do proprietário), etc.

Bloqueios podem ser:
- Pontuais (uma data específica)
- Periódicos (recorrentes: diária, semanal, mensal)
- Com motivo/descrição

## Decisão

1. **Modelo de Dados**:
   - Tabela `room_blocks` no backend com coluna `property_id` explícita
   - Campos: id (UUID), property_id (FK), room_id (FK), start_date, end_date, type (enum: maintenance, cleaning, private, custom), reason (string), recurrence (enum: none, daily, weekly, monthly), created_at, updated_at, created_by (FK User)
   - Índices: (property_id, room_id, start_date), (property_id, end_date), (property_id, type), (property_id, recurrence)
   - ✅ IMPLEMENTADO: Novo arquivo migration `2026_02_18_000001_update_room_blocks_table.php` adiciona campos `type`, `recurrence`, `property_id` e remove `partner_id`

2. **API Backend**:
   - `GET /api/room-blocks` - Listar bloqueios com filtros (room_id, type, recurrence, date_range, pagination)
   - `POST /api/room-blocks` - Criar bloqueio (valida end_date > start_date, room belongs to property)
   - `PUT /api/room-blocks/{block_id}` - Editar bloqueio (mesmas validações)
   - `DELETE /api/room-blocks/{block_id}` - Deletar bloqueio (verifica property ownership)
   - `GET /api/room-blocks/expand?room_id=uuid&from=2026-02-01&to=2026-02-28` - Expandir bloqueios periódicos em um range de datas (retorna array `blocked_dates`)
   - ✅ IMPLEMENTADO: RoomBlockController atualizado com todos os endpoints, filtros, e lógica de expansão de recorrências

3. **Validações**:
   - end_date > start_date (manual Carbon validation)
   - room_id deve existir e pertencer à property_id do user
   - ✅ IMPLEMENTADO: Validações no controller e CreateReservationService

4. **Integração com Reservas**:
   - Ao criar/editar reserva: validar que não há bloqueio ativo na sobreposição de datas
   - Suportam bloqueios periódicos (recurrence) com lógica de expansão
   - ✅ IMPLEMENTADO: CreateReservationService expandido com `isBlockedByRecurringRules()` e `dateIsBlocked()` helpers

5. **Frontend - CRUD de Bloqueios**:
   - Nova página: `/settings/blocks`
   - Componente reutilizável: `RoomBlockForm` (modal)
   - Lista de bloqueios: tabela com filtros
   - 📋 PENDENTE: Implementação frontend (Fase 3b)

6. **Frontend - Integração com Calendário**:
   - Calendário (`/calendar`) exibe bloqueios como "Indisponível"
   - Validação client-side contra bloqueios
   - 📋 PENDENTE: Integração com componentes de calendario (Fase 3b)

7. **Autorização**:
   - RoomBlockPolicy valida que usuário pertence à mesma propriedade
   - ✅ IMPLEMENTADO: Policy existente, validações de property_id adicionadas ao controller

## Status de Implementação

- ✅ Backend: Modelo + Migration + API endpoints + Validações
- ✅ Backend: Recurrence expansion + CreateReservationService integration
- ✅ Backend: Testes (201/201 passing, 698 assertions)
- ✅ Backend: Authorization via RoomBlockPolicy
- 📋 Frontend: Models/Types (próximo)
- 📋 Frontend: Services + CRUD (próximo)
- 📋 Frontend: Components (próximo)
- 📋 Frontend: Page + Routes (próximo)
- 📋 Frontend: Calendar integration (próximo)

## Impacto

- **Backend**: Novo modelo, API, validações de sobreposição
- **Frontend**: Página `/settings/blocks`, componente form, integração calendário
- **Rotas**: Adicionar menu item em Configurações > Bloqueios
- **i18n**: Traduzir labels para 4 idiomas

## Sequência de Implementação

1. Backend: Modelo + Migrations
2. Backend: API endpoints + Validações
3. Frontend: Models/Types
4. Frontend: Services (CRUD)
5. Frontend: Componentes (Form, List, Modal)
6. Frontend: Página `/settings/blocks`
7. Frontend: Integração calendário
8. Testes (backend + frontend)
9. i18n translations
10. Release + PR

## Referências

- seção 11.3 em `docs/CONSOLIDATED_REQUIREMENTS.md`
- Modelo de property scoping: ADR 0002
- Testing strategy: ADR 0005
