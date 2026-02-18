# Instruções para GitHub Copilot / Assistente (consolidado)

Este arquivo é o ponto único de referência para agentes automatizados e humanos sobre como operar neste repositório `reservas`.

## Resumo rápido

- Responda em Português (pt-BR) por padrão.
- Antes de qualquer mudança: leia `docs/CONSOLIDATED_REQUIREMENTS.md`, `docs/adr/` e `docs/system-instructions.md` (sumário).
- Use `manage_todo_list` para planejar tarefas multi-step e atualize `TODO.md` como snapshot humano.
- Nunca faça merge sem aprovação humana; o agente não deve mesclar PRs automaticamente.

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

## Serviços frontend

- CRUD simples (list/get/create/update/remove): usar `createCrudService<T,P>(basePath)` de `frontend/src/services/crudService.ts`.
- CRUD nested (sub-recursos como rates): usar `createNestedCrudService<T,P>(parentBase, sub, itemBase)` — ex: rooms→rates, room-categories→rates.
- Types/models ficam em `frontend/src/models/*.ts` com alias `@models`.

## Formulários frontend

- Usar `react-hook-form` + `zod` (via `@hookform/resolvers/zod`) para validação.
- Schemas Zod ficam em `frontend/src/models/schemas.ts`.
- Para campos monetários, usar `<CurrencyInput>` de `frontend/src/components/Shared/CurrencyInput/CurrencyInput.tsx`.
- Para loading em formulários, usar `<SkeletonFields rows={n}>` de `frontend/src/components/Shared/Skeleton/SkeletonFields.tsx`.
- Para loading em listas, usar `<SkeletonList rows={n}>` de `frontend/src/components/Shared/Skeleton/SkeletonList.tsx`.

## Modais com seção de tarifas (regra de UX)

- O toggle de tarifas deve **sempre iniciar fechado** ao abrir o modal (`setShowRates(false)` no `useEffect` de abertura).
- Campos de tarifa são opcionais: campo vazio = não grava no banco. Se o campo tinha valor e foi limpo = deleta o registro.
- Ao reduzir a capacidade de um quarto, rates órfãos (people_count > nova capacidade) devem ser incluídos no payload com `price_per_day: null` para serem deletados.

## Cascata de preços (backend)

- O `ReservationPriceCalculator` usa 5 níveis: room_period → category_period → room_base → category_base → property_base.
- O endpoint `POST /reservations/calculate` trata `people_count` como adultos, usa a cascata completa e retorna `source` indicando de onde veio o preço.
- Ver `docs/CONSOLIDATED_REQUIREMENTS.md` §8 para detalhes.

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
