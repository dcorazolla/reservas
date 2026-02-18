# Instruções para GitHub Copilot / Assistente (consolidado)

Este arquivo é o ponto único de referência para agentes automatizados e humanos sobre como operar neste repositório `reservas`.

## Resumo rápido

- Responda em Português (pt-BR) por padrão.
- Antes de qualquer mudança: leia `docs/CONSOLIDATED_REQUIREMENTS.md`, `docs/adr/` e `docs/system-instructions.md` (sumário).
- Use `manage_todo_list` para planejar tarefas multi-step e atualize `TODO.md` como snapshot humano.
- Nunca faça merge sem aprovação humana; o agente não deve mesclar PRs automaticamente.

## ⚠️ CRÍTICO - Operações Git e GitHub

**JAMAIS use GitKraken ou qualquer ferramenta GUI para operações Git neste repositório.**

Use SEMPRE:
- ✅ `git` comandos diretos: `git branch`, `git commit`, `git push`, `git checkout`, `git log`, etc
- ✅ `gh` (GitHub CLI) para operações GitHub: `gh pr create`, `gh pr list`, `gh pr view`, `gh pr edit`, `gh release list`, etc

**❌ PROIBIDO:**
- ❌ GitKraken (ou qualquer ferramenta GUI similar)
- ❌ GitHub Desktop
- ❌ Qualquer cliente visual de Git

**Razão:** Ferramenta GUI pode criar comportamentos não-determinísticos, modificar commits, ou falhar silenciosamente em operações críticas. Command-line é determinístico, auditável e seguro.

## Comportamento e convenções (essenciais)

- Trunk-based: `main` é release-ready. Branches curtas: `feature/*`, `fix/*`, `chore/*`.
- Commits pequenos e atômicos; mensagens no padrão: `feat:`, `fix:`, `docs:`, `test:`, `chore:`.
- Antes de commitar automaticamente, o agente deve executar os scripts de teste e validação (veja `scripts/commit_and_test.sh`).
- IDs: UUID strings; `property_id` vive no JWT e deve ser usado para scoping.

⚠️ **CRÍTICO - Segurança do Banco de Dados em Testes:**
- **JAMAIS use `ALLOW_TESTS_ON_NON_TEST_DB=1`** — isso permite que phpunit modifique o banco de produção!
- Testes backend DEVEM usar banco em memória ou ambiente isolado (SQLite in-memory, test DB container, etc).
- **Protocolos de teste backend:**
  - ✅ Use `docker compose` com env isolado (banco em teste/memória)
  - ✅ Use variáveis de ambiente: `APP_ENV=testing`, `DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:`
  - ✅ Validar que `phpunit.xml` aponta para DB de teste
  - ❌ NUNCA passe `ALLOW_TESTS_ON_NON_TEST_DB=1` (risco crítico de perda de dados em produção)
- Verificação: antes de rodar phpunit, confirmar que `php artisan env` retorna `testing`.

## Fluxo de trabalho do agente

- Planejar multi-step tasks com `manage_todo_list` (obrigatório para tarefas não triviais).
- Validar localmente: executar `./scripts/test-all.sh` ou o equivalente antes de criar commits automáticos.
- Atualizar documentação e OpenAPI quando endpoints mudarem.
- Ao finalizar um ciclo: versionamento (frontend: `npm run bump:patch|minor|major`), gerar release-notes, criar commit(es) com mensagens concisas, fazer push, e abrir PR com `gh pr create --fill`.
- **O agente NÃO deve fazer merge**: sempre aguardar revisão humana e aprovação antes de mesclar.
- Usar `gh` (GitHub CLI) para todas as operações Git e PRs. Nunca usar gitkraken.

## Regras específicas para automação

- O agente pode criar branches, commits, push e abrir PRs.
- O agente NÃO deve:
  - Mesclar PRs automaticamente sem pelo menos UMA aprovação humana.
  - Comitar credenciais ou segredos.
  - Mudar políticas de auditoria financeira sem criar um ADR e obter aprovação humana.
  - Rodar testes no container sem as variáveis de ambiente corretas (risco crítico de perda de dados).

## Onde buscar contexto

- `docs/CONSOLIDATED_REQUIREMENTS.md` — regras de negócio e requisitos (fonte canônica).
- `docs/adr/` — decisões arquiteturais.
- `docs/system-instructions.md` — visão resumida do sistema e convenções operacionais.
- `backend/src/public/openapi.yaml` e `docs/collections/reservas` — especificação de API e exemplos.

## Commits automáticos (checagens obrigatórias)

- Antes de commitar automaticamente, o agente deve:
  1. Executar a suíte de testes (frontend + backend) e garantir que TODOS os testes passem.
  2. Validar cobertura: não reduzir cobertura nas áreas alteradas (meta: >= 80% mínimo; 95% para áreas financeiras).
  3. Atualizar documentação, OpenAPI e coleção Bruno quando necessário.
  4. Criar commit com mensagem seguindo o padrão e abrir PR com descrição e checklist.

---

## Principais comandos

### Frontend

```bash
# Development
cd frontend && npm ci && npm run dev

# Tests (com coverage)
cd frontend && npm ci && npm test -- --run --coverage
```

**Nota:** Em ambientes não-interativos (CI, runners), use a flag `-- --run` para forçar execução não-interativa (sem watch mode):
```bash
cd frontend && npm ci && npm test -- --run --coverage
```

### Backend

```bash
# ✅ RECOMENDADO: Use docker compose com ambiente de teste
docker compose exec -e APP_ENV=testing -e DB_CONNECTION=sqlite -e DB_DATABASE=:memory: app sh -c "vendor/bin/phpunit"

# OU: Criar script local que configura as envs corretas para SQLite em memória
# Verificar: php artisan env  →  deve retornar "testing"
```

⚠️ **CRÍTICO - Segurança: Testes Backend**

**✅ CORRETO (Usa banco em memória):**
```bash
docker compose exec -e APP_ENV=testing -e DB_CONNECTION=sqlite -e DB_DATABASE=:memory: app sh -c "vendor/bin/phpunit"
```

**❌ ERRADO (JAMAIS FAÇA ISSO - VAI ZERAR O BANCO DE PRODUÇÃO):**
```bash
docker compose exec app vendor/bin/phpunit  # Sem envs → banco produção será deletado!
docker compose exec -e ALLOW_TESTS_ON_NON_TEST_DB=1 app vendor/bin/phpunit  # PROIBIDO!
```

**Verificação antes de rodar testes:**
```bash
docker compose exec app php artisan env  # Deve retornar: "testing"
```

---

## Padrões e convenções do projeto

- IDs como UUID strings — tratar IDs como `string` em frontend e backend.
- `property_id` é o escopo ativo (vem no JWT). Serviços e controllers usam este claim.
- Lógica de negócio deve ficar em `backend/src/app/Services/*`; controllers apenas orquestram.
- Frontend: seguir padrão de serviços em `frontend/src/services/*`, páginas em `frontend/src/pages/*`, componentes em `frontend/src/components/*` e traduções em `frontend/public/locales/<lang>/common.json`.
- Modal compartilhado: `frontend/src/components/Shared/Modal/Modal.tsx` (padrão simples — usado por muitos modals locais).

## ⚠️ Evitar Reinvenção de Componentes - CONSULTE ANTES DE CRIAR

**REGRA CRÍTICA: SEMPRE procure se o componente já existe antes de criá-lo do zero**

### Componentes Reutilizáveis Disponíveis

**Listas:**
- ✅ `DataList` - Lista com gap/espaçamento uniforme, entity-row styling
  - Uso: `<DataList items={items} className="list-name" renderItem={(item) => <div>...</div>} />`
  - Vantagem: Espaçamento consistente, CSS já padronizado
  - Exemplos: RoomsPage, RoomCategoriesPage, PartnersPage, BlocksPage

**Modais:**
- ✅ `Modal` - Modal simples com header, close button
  - Uso: `<Modal isOpen={isOpen} onClose={onClose} title="Título">{children}</Modal>`
  - Já usado: EditRoomModal, EditRoomCategoryModal, EditPartnerModal, EditBlockModal
- ✅ `ConfirmDeleteModal` - Modal específico para confirmação de exclusão
  - Uso: `<ConfirmDeleteModal isOpen={isOpen} name="Item" onClose={onClose} onConfirm={onConfirm} />`

**Formulários:**
- ✅ `FormField` - Label + input/select/textarea + error message
  - Uso: `<FormField label="Label" name="field" errors={errors}><input {...register('field')} /></FormField>`
  - Vantagem: Styling consistente, tratamento de erros automático

**Confirmação/Feedback:**
- ✅ `Message` - Mensagens de sucesso/erro com auto-close
  - Uso: `<Message type="success|error" message="Texto" onClose={onClose} autoClose={5000} />`
- ✅ `ConfirmModal` - Modal de confirmação genérico

**Skeleton/Loading:**
- ✅ `SkeletonList` - Placeholder durante carregamento
  - Uso: `<SkeletonList rows={3} />`
- ✅ `SkeletonFields` - Placeholder para formulários

**Checklist antes de criar novo componente:**
1. ❓ Componente similar já existe em `frontend/src/components/Shared/*`?
2. ❓ Outra página CRUD usa padrão similar que posso reutilizar?
3. ❓ Posso usar componente genérico (DataList, Modal, FormField) em vez de criar específico?
4. ✅ Somente DEPOIS de responder NÃO a todas, crie novo componente

### Anti-Pattern: Componentes Desnecessários

❌ **EVITAR:**
- Criar `BlocksList` quando `DataList` + `entity-row` já resolve
- Criar `BlocksModal` quando `Modal` + `FormField` + HTML nativo já resolve
- Criar `BlockStatusBadge` quando uma `Box` com className já funciona
- Componentes simples (< 50 linhas) que são apenas wrappers

✅ **PREFERIR:**
- Usar componentes genéricos do `Shared`
- Composição: FormField + inputs em vez de FormField wrapper específico
- CSS classes para styling em vez de componentes decoradores

## Serviços frontend

- CRUD simples (list/get/create/update/remove): usar `createCrudService<T,P>(basePath)` de `frontend/src/services/crudService.ts`.
- CRUD nested (sub-recursos como rates): usar `createNestedCrudService<T,P>(parentBase, sub, itemBase)` — ex: rooms→rates, room-categories→rates.
- **CRUD com scoping de property (blocks, reservations)**: usar `createScopedCrudService<T,P>(basePath, token)` — injeta `property_id` do JWT automaticamente em todas as operações.
- Types/models ficam em `frontend/src/models/*.ts` com alias `@models`.

### createScopedCrudService (property-scoped CRUD)

**Uso:**
```tsx
// Em um componente/serviço que tem acesso ao token
const { token } = useAuth()

// Criar serviço scoped
const blocksService = createScopedCrudService<RoomBlock, RoomBlockInput>(
  '/api/room-blocks',
  token
)

// Todas as operações incluem automaticamente property_id no params
const blocks = await blocksService.list()  // property_id injetado
const block = await blocksService.get(id)  // property_id injetado
const newBlock = await blocksService.create(data)  // property_id injetado
```

**Benefícios:**
- ✅ Elimina duplicação: propriedade_id é sempre extraída do JWT
- ✅ Seguro: token é validado no momento de criação do serviço
- ✅ Simples: mesma interface que `createCrudService`, mas com scoping automático
- ✅ Testável: token pode ser mockado em testes

**Quando usar:**
- Recursos que dependem de `property_id` do usuário (blocks, reservations)
- Sempre que houver múltiplas operações (list/get/create/update/delete) que precisam do mesmo `property_id`

**Quando NÃO usar:**
- Recursos globais/sem tenant (properties, users, etc) → use `createCrudService`
- Recursos nested com parent explícito (rates sob rooms) → use `createNestedCrudService`

### ⚠️ Anti-Pattern: Criar Novo Serviço Desnecessariamente

❌ **NUNCA FAÇA:**
```tsx
// ❌ ERRADO - criar novo serviço quando factory genérico já existe
const blocksService = {
  async list() { return fetch(...).json() },
  async get(id) { return fetch(...).json() },
  async create(data) { return fetch(...).json() }
}
```

✅ **USE FACTORY GENÉRICO:**
```tsx
// ✅ CORRETO - 3 linhas em vez de 30+ linhas de código duplicado
import { createCrudService } from '@services/crudService'
import type { RoomBlock, RoomBlockInput } from '@models/blocks'

const blocksService = createCrudService<RoomBlock, RoomBlockInput>('/api/room-blocks')
```

**Benefício:** Reduz duplicação, mantém consistência, facilita testes, menos bugs.

**Checklist ao criar novo serviço:**
1. ❓ Já existe `createCrudService` ou `createNestedCrudService` que resolve?
2. ❓ Preciso apenas de list/get/create/update/delete?
3. ✅ Use factory genérico. ❌ Só crie novo se lógica é realmente diferente (calcs complexos, workflows especiais, etc)

## ⚠️ Manipulação de Datas - OBRIGATÓRIO usar `date-fns`

**REGRA CRÍTICA: NUNCA manipule datas manualmente (new Date, getMonth, setDate, toISOString.split(), etc)**

A biblioteca `date-fns` já está instalada. Use SEMPRE para qualquer operação com datas.

### Padrão obrigatório

❌ **JAMAIS FAÇA:**
```tsx
const date = new Date(dateStr + 'T00:00:00')
const day = date.getDate()
const month = String(date.getMonth() + 1).padStart(2, '0')
const year = date.getFullYear()
return `${day}/${month}/${year}`
```

✅ **USE date-fns:**
```tsx
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const date = parseISO(dateStr)
return format(date, 'dd/MM/yyyy', { locale: ptBR })
```

### Funções comuns

```tsx
import { 
  format,      // Formatar datas: format(date, 'dd/MM/yyyy')
  parseISO,    // Parse ISO strings: parseISO('2026-02-18')
  addDays,     // Adicionar dias: addDays(date, 5)
  addMonths,   // Adicionar meses: addMonths(date, 1)
  subMonths,   // Subtrair meses: subMonths(date, 1)
  startOfMonth, // Início do mês: startOfMonth(date)
  endOfMonth,  // Fim do mês: endOfMonth(date)
  differenceInDays, // Dias entre datas: differenceInDays(end, start)
  isBefore,    // Comparar: isBefore(start, end)
} from 'date-fns'
import { ptBR } from 'date-fns/locale' // Sempre usar locale pt-BR
```

### Exemplos de refatoração

**Gerar range de datas:**
```tsx
// ❌ Ruim
const dates = []
const current = new Date(startDate + 'T00:00:00')
for (let i = 0; i < days; i++) {
  dates.push(`${current.getFullYear()}-${current.getMonth()+1}-${current.getDate()}`)
  current.setDate(current.getDate() + 1)
}

// ✅ Bom
import { format, parseISO, addDays } from 'date-fns'
const dates = []
let current = parseISO(startDate)
for (let i = 0; i < days; i++) {
  dates.push(format(current, 'yyyy-MM-dd'))
  current = addDays(current, 1)
}
```

**Calcular comprimento de estadia:**
```tsx
// ❌ Ruim
const start = new Date(startDate)
const end = new Date(endDate)
return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

// ✅ Bom
import { differenceInDays, parseISO } from 'date-fns'
return differenceInDays(parseISO(endDate), parseISO(startDate))
```

**Próximo/mês anterior:**
```tsx
// ❌ Ruim
const date = new Date(fromDate + 'T00:00:00')
date.setMonth(date.getMonth() + 1)

// ✅ Bom
import { addMonths, format } from 'date-fns'
const next = addMonths(parseISO(fromDate), 1)
return format(next, 'yyyy-MM-dd')
```

### Serviços com datas

Todos os serviços que trabalham com datas estão refatorados em `date-fns`:
- ✅ `frontend/src/services/calendar.ts` - Gerenciamento de calendário
- ✅ `frontend/src/services/reservations.ts` - Reservas
- ✅ `frontend/src/models/reservation.ts` - Validações de data

Ao adicionar novas funcionalidades, siga o mesmo padrão nesses arquivos.

## Formulários frontend

- Usar `react-hook-form` + `zod` (via `@hookform/resolvers/zod`) para validação.
- Schemas Zod ficam em `frontend/src/models/schemas.ts`.
- Para campos monetários, usar `<CurrencyInput>` de `frontend/src/components/Shared/CurrencyInput/CurrencyInput.tsx`.
- Para loading em formulários, usar `<SkeletonFields rows={n}>` de `frontend/src/components/Shared/Skeleton/SkeletonFields.tsx`.
- Para loading em listas, usar `<SkeletonList rows={n}>` de `frontend/src/components/Shared/Skeleton/SkeletonList.tsx`.

### Padrão de Campos, Ordenação e Layout

**Ordem obrigatória de campos em CRUD forms:**

1. **Campos primários/obrigatórios** (topo) - Seleção, IDs, principais
2. **Campos de range/datas** - Datas de início/fim agrupadas na mesma linha (grid 2 colunas)
3. **Campos de classificação** - Tipo, categoria, status
4. **Campos opcionais** (final) - Notas, motivos, textos descritivos

**Exemplo - Room Blocks (EditBlockModal):**
```tsx
<FormField label={t('blocks.form.room')} name="room_id" errors={errors}>
  <select {...register('room_id')} disabled={isSubmitting}>...</select>
</FormField>

{/* Datas agrupadas em grid 1fr 1fr com gap: 16px */}
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
  <FormField label={t('blocks.form.start_date')} name="start_date" errors={errors}>
    <input type="date" {...register('start_date')} disabled={isSubmitting} />
  </FormField>
  <FormField label={t('blocks.form.end_date')} name="end_date" errors={errors}>
    <input type="date" {...register('end_date')} disabled={isSubmitting} />
  </FormField>
</div>

<FormField label={t('blocks.form.type')} name="type" errors={errors}>
  <select {...register('type')} disabled={isSubmitting}>...</select>
</FormField>

<FormField label={t('blocks.form.recurrence')} name="recurrence" errors={errors}>
  <select {...register('recurrence')} disabled={isSubmitting}>...</select>
</FormField>

<FormField label={t('blocks.form.reason')} name="reason" errors={errors}>
  <input type="text" placeholder={t('common.optional')} {...register('reason')} disabled={isSubmitting} />
</FormField>
```

**Checklist ao criar/editar form:**
- ✅ Campos obrigatórios/primários no topo (sem "(optional)")
- ✅ Datas/ranges agrupadas em grid com 2 colunas: `gridTemplateColumns: '1fr 1fr', gap: '16px'`
- ✅ Tipos/categorias de classificação no meio
- ✅ Campos opcionais no final com placeholder "(opcional)" ou "(optional)"
- ✅ Usar sempre `<FormField>` wrapper para consistência de styling
- ✅ Estados `disabled={isSubmitting}` durante submissão
- ✅ Inputs HTML nativo (type="date", type="text", select, textarea)

**Layout CSS para multi-coluna:**
```tsx
{/* 2 colunas iguais */}
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
  <FormField>...</FormField>
  <FormField>...</FormField>
</div>

{/* 3 colunas iguais */}
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
  <FormField>...</FormField>
  <FormField>...</FormField>
  <FormField>...</FormField>
</div>

{/* Proporção customizada (80% + 20%) */}
<div style={{ display: 'grid', gridTemplateColumns: '4fr 1fr', gap: '16px' }}>
  <FormField>...</FormField>
  <FormField>...</FormField>
</div>
```

**Anti-patterns em formulários:**

❌ **EVITAR:**
- Todos os campos em uma coluna sem agrupamento visual
- Campos opcionais no meio, misturados com obrigatórios
- Datas de início/fim em linhas separadas (menos visível que são relacionadas)
- Placeholders sem "(optional)" em campos opcionais
- Usar `<Box>` Chakra em vez de `<FormField>` para envolver inputs

✅ **PREFERIR:**
- Agrupar logicamente (dados → datas → classificação → opcionais)
- Datas relacionadas lado a lado em grid
- FormField sempre como wrapper
- CSS classes e grid layout em vez de componentes Chakra complexos
- Nomes de campos claros e autodescritivos

**Exemplos de referência (implementações corretas):**
- ✅ `EditBlockModal.tsx` (Shared/Modal + FormField + grid layout para datas)
- ✅ `EditRoomModal.tsx` (Shared/Modal + FormField + CurrencyInput para tarifas)
- ✅ `EditRoomCategoryModal.tsx` (Shared/Modal + FormField)
- ✅ `EditPartnerModal.tsx` (Shared/Modal + FormField)

## ⚠️ Chakra UI - Estratégia de Imports (CRÍTICO)

**PROBLEMA:** Importar muitos componentes Chakra UI simultaneamente causa erro Vite: `SyntaxError: does not provide an export named 'FormControl'` (ou similar).

**SOLUÇÃO:** Minimizar imports diretos de Chakra:

❌ **NUNCA FAÇA:**
```tsx
import {
  Modal, ModalOverlay, ModalContent, FormControl, FormLabel, Input,
  Select, Textarea, Button, VStack, HStack, Box, Text, Spinner, Icon
} from '@chakra-ui/react'
```

✅ **USE UM DESTES PADRÕES:**

**1. Para Modais: Use `Shared/Modal/Modal` wrapper**
```tsx
import Modal from '@components/Shared/Modal/Modal'

<Modal isOpen={isOpen} onClose={onClose} title="Título">
  {/* HTML nativo ou FormField */}
</Modal>
```

**2. Para Formulários: Use HTML nativo + FormField ou CSS**
```tsx
<div className="form-group">
  <label htmlFor="field">Campo</label>
  <input id="field" type="text" {...register('field')} />
</div>
```

**3. Para Listas/Tabelas: Use HTML nativo `<table>` + CSS**
```tsx
<table className="custom-table">
  <thead><tr><th>Header</th></tr></thead>
  <tbody>{items.map(item => <tr key={item.id}>...</tr>)}</tbody>
</table>
```

**Referências (implementações corretas):**
- ✅ EditRoomModal.tsx (Shared/Modal + Shared/FormField)
- ✅ BlocksModal.tsx (Shared/Modal + HTML)
- ✅ BlocksList.tsx (HTML `<table>` + CSS)
- ✅ RoomsPage.tsx (Chakra apenas para layout container)

**Checklist ao criar componentes com muitos inputs:**
- [ ] Não importo 10+ componentes Chakra ao mesmo tempo
- [ ] Uso Shared/Modal wrapper em vez de Modal Chakra direto
- [ ] HTML nativo para inputs (input, select, textarea, button)
- [ ] CSS classes em arquivos .css separados para styling
- [ ] Testes passam sem SyntaxError de Vite

## Modais com seção de tarifas (regra de UX)

- O toggle de tarifas deve **sempre iniciar fechado** ao abrir o modal (`setShowRates(false)` no `useEffect` de abertura).
- Campos de tarifa são opcionais: campo vazio = não grava no banco. Se o campo tinha valor e foi limpo = deleta o registro.
- Ao reduzir a capacidade de um quarto, rates órfãos (people_count > nova capacidade) devem ser incluídos no payload com `price_per_day: null` para serem deletados.

## Cascata de preços (backend)

- O `ReservationPriceCalculator` usa 5 níveis: room_period → category_period → room_base → category_base → property_base.
- O endpoint `POST /reservations/calculate` trata `people_count` como adultos, usa a cascata completa e retorna `source` indicando de onde veio o preço.
- Ver `docs/CONSOLIDATED_REQUIREMENTS.md` §8 para detalhes.

## Padrões de Implementação no Backend

### Estrutura de CRUD - Sempre use Services

**Padrão obrigatório:**
- ✅ Controllers orquestram, Services contêm lógica
- ✅ Services usam Models para queries
- ✅ Controllers fazem assertions de propriedade (`assertBelongsToProperty`)
- ✅ Services usam scoping via relationships (`whereHas`, `where`)

**Exemplo correto - RoomBlockService:**
```php
// ✅ CORRETO: Lógica em Service
class RoomBlockService {
  public function list(string $propertyId) {
    return RoomBlock::whereHas('room', function ($q) use ($propertyId) {
      $q->where('property_id', $propertyId);
    })->get();
  }
}

// ✅ CORRETO: Controller delega para Service
class RoomBlockController {
  public function index(Request $request, RoomBlockService $service) {
    $propertyId = $this->getPropertyId($request);
    return $service->list($propertyId);
  }
}
```

**❌ NUNCA FAÇA:**
```php
// ❌ ERRADO: Lógica no Controller
public function index(Request $request) {
  $propertyId = $this->getPropertyId($request);
  return RoomBlock::where('property_id', $propertyId)->get();  // Direto!
}

// ❌ ERRADO: SQL com property_id direto em modelo
// RoomBlock model não deve ter property_id - é via relacionamento!
```

### Property Scoping

**Padrão obrigatório:**
- ✅ Usar `assertBelongsToProperty` nos Controllers para validar
- ✅ Usar `whereHas` com relationships para querying
- ✅ Nunca armazenar `property_id` redundantemente no modelo

**Exemplo - RoomBlockController.store():**
```php
public function store(StoreRoomBlockRequest $request, RoomBlockService $service): JsonResponse {
  $propertyId = $this->getPropertyId($request);
  $data = $request->validated();
  
  // Validar que room pertence à property
  $room = Room::findOrFail($data['room_id']);
  $this->assertBelongsToProperty($room, $propertyId);
  
  $block = $service->create($data);
  return response()->json($block, 201);
}
```

## Testes e mocks

- Vitest + Testing Library no frontend. Mock factories seguem o padrão usado em `frontend/src/pages/Properties/PropertiesPage.flow.test.tsx` (criar spies dentro do `vi.mock` e expor `__mocks`).
- Ao adicionar testes de integração/fluxo, copie o padrão de `PropertiesPage.flow.test.tsx` (mock de `react-i18next`, Chakra e serviços).

## APIs e documentação

- Atualize `backend/src/public/openapi.yaml` ao adicionar/alterar endpoints.
- Atualize a coleção em `docs/collections/reservas` (Bruno/Postman) quando mudar APIs.

## Commits, versionamento e releases

**Frontend:**
1. Criar branch `feature/<descrição>` ou `fix/<descrição>`
2. Implementar mudanças e rodar testes: `cd frontend && npm test -- --run --coverage`
3. Quando pronto para release, rodar: `npm run bump:patch|minor|major` (escolher conforme tipo de mudança)
4. Gerar release-notes: `npm run release-notes` → cria/atualiza `frontend/RELEASE_NOTES.md`
5. Fazer commit: `git add . && git commit -m "feat: descrição da mudança"`
6. Fazer push: `git push origin <branch>`
7. Abrir PR: `gh pr create --fill` (preenche automaticamente com branch/titulo)
8. Aguardar aprovação humana antes de merge
9. **AUTOMÁTICO ao merge para main**: GitHub Actions cria tags `frontend/v<version>` e `backend/v<version>` lendo as versões de `package.json` e `composer.json`

**Backend:**
- Versioning por atualização em `backend/src/composer.json` (semver)
- Manter `backend/RELEASE_NOTES.md` atualizado com mudanças importantes
- Mesmos passos de commit, push e PR que frontend
- **AUTOMÁTICO ao merge para main**: Tags são criadas via GitHub Actions

**Automação de Tags (GitHub Actions):**
- Workflow: `.github/workflows/create-release-tags.yml`
- Triggered: Automaticamente ao push para `main` (após merge de PR)
- Comportamento:
  - Lê versão de `frontend/package.json` → cria tag `frontend/v<version>`
  - Lê versão de `backend/src/composer.json` → cria tag `backend/v<version>`
  - Verifica se tags já existem (não recria duplicatas)
  - Se ambas as tags são novas, cria um Release no GitHub com ambas as versões
- **Não é necessário criar tags manualmente** — o sistema faz automaticamente

**Operações com `gh` (GitHub CLI):**
```bash
# Abrir PR interativamente
gh pr create --fill

# Listar PRs
gh pr list

# Checar status de PR
gh pr view <número>

# Adicionar label/assignee
gh pr edit <número> --add-label "label" --add-assignee "usuario"

# Listar tags (para verificação)
gh release list
```

**Nunca use gitkraken para operações Git neste repositório. Use sempre `gh` e `git` comandos diretos.**

## Políticas do agente

- Use `manage_todo_list` para planejar passos de trabalho e marque tarefas conforme progresso.
- Execute testes locais antes de commitar. Use comandos com envs de teste corretamente configuradas.
- Não faça merge automático: sempre exigir CI verde e uma aprovação humana antes de merge.
- **CRÍTICO - JAMAIS use `ALLOW_TESTS_ON_NON_TEST_DB=1`**: Sempre rode testes com `APP_ENV=testing`, `DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:` ou equivalent de banco em memória.
- **CRÍTICO - Verificar ambiente:** Rodar `php artisan env` deve retornar `testing` antes de executar phpunit.
- **IMPORTANTE:** Use `gh` (GitHub CLI) para todas as operações: branches, commits, push, PRs, labels, etc. Nunca use gitkraken.

## Arquivos importantes para checar rapidamente

- Backend: `backend/src/app/Controllers`, `backend/src/app/Services`, `backend/src/app/Models`.
- Frontend: `frontend/src/services/*`, `frontend/src/pages/*`, `frontend/src/components/*`, `frontend/public/locales/*/common.json`.
- Tests exemplos: `frontend/src/pages/Properties/PropertiesPage.flow.test.tsx` (pattern reference).

## Se algo for incerto

- Abra uma issue curta descrevendo a dúvida, referencia os arquivos afetados e proponha 2 opções de implementação.

## ⚠️ Validação End-to-End Antes de Commits Automáticos

**REGRA CRÍTICA:** Antes de qualquer commit automático, o agente DEVE executar validações completas:

**Validação Backend:**
1. ✅ Validar endpoints: `php artisan route:list | grep -E "GET|POST|PUT|DELETE"`
2. ✅ Validar campos obrigatórios em Requests (FormRequests)
3. ✅ Validar que `getPropertyId($request)` está sendo usado no controller
4. ✅ Verificar que Services usam `whereHas` para property scoping
5. ✅ Rodar testes: `./scripts/test-all.sh` ou equivalente

**Validação Frontend:**
1. ✅ Validar tipos TypeScript: `npm run type-check` no diretório frontend
2. ✅ Validar existência de componentes/serviços genéricos antes de criar novos
3. ✅ Validar que forms seguem padrão: obrigatórios topo → datas grid → opcionais final
4. ✅ Validar que datas usam `date-fns` (não `new Date()`)
5. ✅ Validar que listas usam `DataList` component
6. ✅ Validar que modais usam `Shared/Modal/Modal` wrapper
7. ✅ Validar que formulários usam `FormField` para cada input
8. ✅ Rodar testes: `npm test -- --run --coverage`

**Validação de Integração:**
1. ✅ Backend retorna dados no formato esperado (types do frontend)?
2. ✅ Propriedade `property_id` do JWT está sendo respeitada em todas as operações?
3. ✅ Dates estão sendo formatadas corretamente (ISO strings ↔ DD/MM/YYYY)?
4. ✅ Traduções estão presentes em todos os 4 idiomas (pt-BR, en, es, fr)?
5. ✅ OpenAPI documentation atualizado (se endpoint mudou)?

**Validação de Documentação:**
1. ✅ Se novo padrão foi criado, está documentado em `copilot-instructions.md`?
2. ✅ Se novo componente foi criado, está listado na seção "Evitar Reinvenção"?
3. ✅ Se novo serviço foi criado, está documentado o padrão e exemplos?

**Checklist Obrigatório Antes do Commit:**
- [ ] Backend testes passam (100% cobertura em áreas alteradas, mínimo 80%)
- [ ] Frontend testes passam (100% cobertura em áreas alteradas, mínimo 80%)
- [ ] Tipos TypeScript validam sem erros
- [ ] Componentes reutilizáveis (não reinvei)
- [ ] Padrões seguidos (forms, datas, listas, modais)
- [ ] Traduções em 4 idiomas
- [ ] OpenAPI/documentação atualizado
- [ ] Commit message segue padrão: `feat:`, `fix:`, `docs:`, `test:`, `chore:`

**Se algo falhar:**
- ❌ NÃO faça commit
- ❌ NÃO faça push
- 🔄 Volte e corrija antes de tentar novamente
- 📝 Documente o erro encontrado e como foi corrigido

## React Patterns & Descobertas 🔍

### useEffect Dependencies - CRÍTICO
**Descoberta (2026-02-18):** Funções como `t` (i18n translation) são recriadas a cada render. Se incluída como dependência de `useEffect`, causa re-execução indesejada.

**Problema:**
```typescript
// ❌ ERRADO - t é recriada a cada render
React.useEffect(() => {
  listRooms().then((data) => setItems(data))
}, [t])  // Causava reset da lista após updates
```

**Solução:**
```typescript
// ✅ CORRETO - useEffect executa apenas uma vez na montagem
React.useEffect(() => {
  listRooms().then((data) => setItems(data))
}, [])  // Dependências vazias = executa só no mount
```

**Impacto:** CRUD pages (RoomsPage, PropertiesPage, RoomCategoriesPage) tiveram listas resetadas após update porque o efeito de carregamento inicial era re-executado, sobrescrevendo o estado atualizado com dados antigos.

**Checklist para CRUD Pages:**
- ✅ Inicialização de lista usa `useEffect` com dependências vazias `[]`
- ✅ Se precisar de tradução dentro do efeito, armazene `t` no momento do mount
- ✅ Operações CRUD (create/update/delete) NÃO causam re-execução do efeito de carregamento

---

**Nota:** Este arquivo substitui instruções dispersas previamente mantidas em `docs/copilot-instructions.md`, `docs/AGENT_CONTEXT/*` e seções do `frontend/README.md` e `README.md`. Se modificar este arquivo, atualize também o `README.md` na raiz para apontar onde agentes devem buscar instruções.
