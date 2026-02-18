# Backend Room Blocks - Implementação Completa ✅

## Resumo de Mudanças (18 de Fevereiro de 2026)

### 🎯 Objetivo
Ajustar o backend de Room Blocks (Bloqueios de Disponibilidade) para implementar completamente as decisões de funcionamento documentadas no ADR 0012:
- Adicionar suporte para `type` (enum: maintenance, cleaning, private, custom)
- Adicionar suporte para `recurrence` (enum: none, daily, weekly, monthly)
- Adicionar `property_id` explícito para scoping multi-tenant
- Implementar expansão de bloqueios periódicos
- Validar bloqueios ao criar/editar reservas

### ✅ Implementação Completada

#### 1. **Modelo de Dados** (`RoomBlock.php`)
- ✅ Adicionados enums constantes: TYPE_* e RECURRENCE_*
- ✅ Campo `property_id` adicionado ao `fillable`
- ✅ Removido `partner_id` (substituído por `type` system)
- ✅ Campos atualizados: `[property_id, room_id, start_date, end_date, type, reason, recurrence, created_by]`

#### 2. **Migration** (`2026_02_18_000001_update_room_blocks_table.php`)
- ✅ Adicionado coluna `property_id` com FK para `properties` (cascade on delete)
- ✅ Adicionada coluna `type` (enum: maintenance, cleaning, private, custom)
- ✅ Adicionada coluna `recurrence` (enum: none, daily, weekly, monthly)
- ✅ Removida coluna `partner_id` com rollback support
- ✅ Criados índices: (property_id, type), (property_id, recurrence)

#### 3. **Controller** (`RoomBlockController.php`)
**Endpoints:**
- ✅ `GET /room-blocks` - Listar com filtros avançados
  - Filtro por `room_id`
  - Filtro por `type` (maintenance | cleaning | private | custom)
  - Filtro por `recurrence` (none | daily | weekly | monthly)
  - Filtro por date range: `from` e `to`
  - Suporte a paginação: `per_page` (padrão 15)
  - Scoping automático por `property_id` do user

- ✅ `POST /room-blocks` - Criar bloqueio
  - Validação: `end_date > start_date`
  - Validação: room pertence à property do user
  - Campos obrigatórios: room_id, start_date, end_date, type
  - Campos opcionais: reason, recurrence (default: 'none')
  - Atribui `property_id` e `created_by` automaticamente

- ✅ `PUT /room-blocks/{roomBlock}` - Editar bloqueio
  - Mesmas validações que POST
  - Verifica ownership: bloco pertence à property do user
  - Suporta edição parcial (PATCH semantics com PUT)

- ✅ `DELETE /room-blocks/{roomBlock}` - Deletar bloqueio
  - Verifica ownership: bloco pertence à property do user
  - Retorna 204 No Content

- ✅ `GET /room-blocks/expand` - Expandir bloqueios periódicos
  - Query params: `room_id`, `from`, `to` (datas em YYYY-MM-DD)
  - Retorna: `{ "blocked_dates": ["2026-02-18", "2026-02-19", ...] }`
  - Expande bloqueios periódicos baseado em recurrence rule:
    - `daily`: Todas as datas no range
    - `weekly`: Mesma day-of-week que start_date (a cada 7 dias)
    - `monthly`: Mesmo dia do mês que start_date
    - `none`: Apenas datas no range [start_date, end_date)

#### 4. **Validação de Recorrência** (`CreateReservationService.php`)
- ✅ Método `isBlockedByRecurringRules()`: Valida se um range de datas está bloqueado
- ✅ Método `dateIsBlocked()`: Verifica se uma data específica é bloqueada considerando recurrence
- ✅ Lógica integrada no `create()`: Bloqueia criação de reserva se houver sobreposição com bloqueio
- ✅ Suporta bloqueios periódicos na validação

#### 5. **Autorização** (`RoomBlockPolicy.php`)
- ✅ `create()`: User deve ter `property_id` (staff)
- ✅ `update()` / `delete()`: User e bloqueio devem ter mesma `property_id`

#### 6. **Testes Backend**
- ✅ `RoomBlockCrudTest.php`: Atualizado com novos campos (type, property_id)
- ✅ `RoomBlockAuthorizationTest.php`: Atualizado com validações de property scoping
- ✅ `RoomBlockReservationTest.php`: Atualizado para novo formato de bloqueios
- ✅ **Resultado: 201/201 tests passing, 698 assertions** ✅

#### 7. **Documentação OpenAPI** (`openapi.yaml`)
- ✅ Tag adicionada: "Room Blocks"
- ✅ Schemas: `RoomBlockInput`, `RoomBlock` (com allOf composition)
- ✅ Endpoints documentados com parâmetros, request/response examples
- ✅ Códigos HTTP apropriados: 200, 201, 204, 404, 422

#### 8. **Arquitetura de Decisões** (`ADR 0012`)
- ✅ Status atualizado para "Implemented (Backend Complete)"
- ✅ Documentado status de implementação: ✅ Backend, 📋 Frontend

### 📊 Métricas

| Metrica | Valor |
|---------|-------|
| Arquivos Modificados | 10 |
| Arquivos Criados | 2 (migration + ADR) |
| Linhas Adicionadas | 468+ |
| Testes Passando | 201/201 (100%) |
| Assertions | 698 |
| Commits Atômicos | 2 (implementation + docs) |

### 🔄 Fluxo de Dados

**Criar Bloqueio:**
```
POST /api/room-blocks
{
  "room_id": "uuid",
  "start_date": "2026-02-18",
  "end_date": "2026-02-25",
  "type": "maintenance",
  "reason": "Preventive maintenance",
  "recurrence": "none"
}
↓
Controller valida (end_date > start_date, room exists)
↓
property_id atribuído do JWT (via getPropertyId)
↓
RoomBlock criado com {property_id, room_id, dates, type, recurrence, created_by}
↓
201 Created
```

**Expandir Bloqueios Periódicos:**
```
GET /api/room-blocks/expand?room_id=uuid&from=2026-02&to=2026-02-28
↓
Controller busca bloqueios que sobrepõem o range
↓
Para cada bloqueio:
  - Se recurrence=none: adiciona dates[start_date, end_date)
  - Se recurrence=daily: adiciona TODAS as dates no range
  - Se recurrence=weekly: adiciona dates que match day-of-week
  - Se recurrence=monthly: adiciona dates com mesmo dia do mês
↓
Retorna { "blocked_dates": ["2026-02-18", "2026-02-19", ...] }
```

**Criar Reserva com Validação:**
```
POST /api/reservations
{
  "room_id": "uuid",
  "start_date": "2026-02-18",
  "end_date": "2026-02-20",
  ...
}
↓
CreateReservationService.create()
↓
Busca bloqueios que sobrepõem [start_date, end_date)
↓
Para cada bloqueio encontrado:
  - Valida se é bloqueio periódico e se realmente bloqueia
  - Método dateIsBlocked() verifica cada dia da reserva
↓
Se algum dia está bloqueado: ValidationException
Se nenhum bloqueio: cria reserva normalmente
```

### 🚀 Próximos Passos (Frontend)

1. **Fase 3a: Bloqueios Models** (frontend/src/models/blocks.ts)
   - BlockStatus enum
   - Block interface
   - Helper functions (expandRecurring, isDateBlocked, etc)

2. **Fase 3b: Bloqueios Services** (frontend/src/services/blocks.ts)
   - CRUD service com chamadas para backend
   - Integração com calendar expand endpoint
   - Validação client-side

3. **Fase 3c: Bloqueios Components**
   - BlocksModal (criar/editar)
   - BlocksList (tabela com filtros)
   - BlockStatusBadge (visual indicator)

4. **Fase 3d: Bloqueios Page + Routes**
   - /settings/blocks page
   - Adicionar menu item em Configurações
   - Integração com calendário

5. **Fase 3e: Testes + Versioning**
   - 100% test coverage para frontend
   - Version bump v0.3.0 → v0.3.1
   - Update RELEASE_NOTES.md
   - PR #79 para merge

### 📝 Comandos Úteis

**Verificar testes backend:**
```bash
docker compose exec -e APP_ENV=testing -e DB_CONNECTION=sqlite -e DB_DATABASE=:memory: app sh -c "vendor/bin/phpunit"
```

**Testar endpoint expand (após merge):**
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/room-blocks/expand?room_id=<uuid>&from=2026-02-18&to=2026-02-28"
```

**Listar bloqueios com filtros:**
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/room-blocks?type=maintenance&recurrence=weekly&per_page=20"
```

### ⚠️ Notas Importantes

1. **Breaking Change**: Campos `type` e `recurrence` agora são obrigatórios (com defaults no controller)
2. **Property Scoping**: Todos os endpoints automaticamente scopados por `property_id` do user (JWT)
3. **Recurrence Logic**: Implementado em 3 lugares para consistência:
   - RoomBlockController.expand() → para calendar visualization
   - RoomBlockController.matchesRecurrence() → validação de padrão
   - CreateReservationService.dateIsBlocked() → validação em reservas
4. **Índices**: Adicionados para queries de filtro por type e recurrence (performance)

---

**Status**: ✅ BACKEND COMPLETO | 📋 FRONTEND PENDENTE

**Commits**: 
- 8631331a: Backend implementation + tests
- d188258b: OpenAPI documentation

**Testes**: 201/201 ✅ | **Coverage**: 698 assertions ✅ | **ADR**: 0012 ✅
