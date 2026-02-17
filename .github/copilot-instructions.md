# Instruções para GitHub Copilot / Assistente (consolidado)

Este arquivo é o ponto único de referência para agentes automatizados e humanos sobre como operar neste repositório `reservas`.

Resumo rápido
- Responda em Português (pt-BR) por padrão.
- Antes de qualquer mudança: leia `docs/CONSOLIDATED_REQUIREMENTS.md`, `docs/adr/` e `docs/system-instructions.md` (sumário).
- Use `manage_todo_list` para planejar tarefas multi-step e atualize `TODO.md` como snapshot humano.
- Nunca faça merge sem aprovação humana; o agente não deve mesclar PRs automaticamente.

Comportamento e convenções (essenciais)
- Trunk-based: `main` é release-ready. Branches curtas: `feature/*`, `fix/*`, `chore/*`.
- Commits pequenos e atômicos; mensagens no padrão: `feat:`, `fix:`, `docs:`, `test:`, `chore:`.
- Antes de commitar automaticamente, o agente deve executar os scripts de teste e validação (veja `scripts/commit_and_test.sh`).
- IDs: UUID strings; `property_id` vive no JWT e deve ser usado para scoping.

Fluxo de trabalho do agente
- Planejar multi-step tasks com `manage_todo_list` (obrigatório para tarefas não triviais).
- Validar localmente: executar `./scripts/test-all.sh` ou o equivalente antes de criar commits automáticos.
- Atualizar documentação e OpenAPI quando endpoints mudarem.
- Ao finalizar um ciclo: criar commit(es) com mensagens concisas e abrir PR (usar `gh pr create --fill`), mas NÃO mesclar sem revisão humana.

Regras específicas para automação
- O agente pode criar branches, commits, push e abrir PRs.
- O agente NÃO deve:
  - Mesclar PRs automaticamente sem pelo menos UMA aprovação humana.
  - Comitar credenciais ou segredos.
  - Mudar políticas de auditoria financeira sem criar um ADR e obter aprovação humana.

Onde buscar contexto
- `docs/CONSOLIDATED_REQUIREMENTS.md` — regras de negócio e requisitos (fonte canônica).
- `docs/adr/` — decisões arquiteturais.
- `docs/system-instructions.md` — visão resumida do sistema e convenções operacionais.
- `backend/src/public/openapi.yaml` e `docs/collections/reservas` — especificação de API e exemplos.

Commits automáticos (checagens obrigatórias)
- Antes de commitar automaticamente, o agente deve:
  1. Executar a suíte de testes (frontend + backend) e garantir que TODOS os testes passem.
  2. Validar cobertura: não reduzir cobertura nas áreas alteradas (meta: >= 80% mínimo; 95% para áreas financeiras).
  3. Atualizar documentação, OpenAPI e coleção Bruno quando necessário.
  4. Criar commit com mensagem seguindo o padrão e abrir PR com descrição e checklist.

Este arquivo substitui instruções dispersas previamente mantidas em `docs/copilot-instructions.md`, `docs/AGENT_CONTEXT/*` e seções do `frontend/README.md` e `README.md`. Os arquivos originais agora apontam para esta localização.

Se você modificar este arquivo, atualize também o `README.md` na raiz para apontar onde agentes devem buscar instruções.
```instructions
# Instruções para GitHub Copilot / Assistente (consolidado)

Este arquivo é o ponto único de referência para agentes automatizados e humanos sobre como operar neste repositório `reservas`.

Resumo rápido
- Responda em Português (pt-BR) por padrão.
- Antes de qualquer mudança: leia `docs/CONSOLIDATED_REQUIREMENTS.md`, `docs/adr/` e `docs/system-instructions.md` (sumário).
- Use `manage_todo_list` para planejar tarefas multi-step e atualize `TODO.md` como snapshot humano.
- Nunca faça merge sem aprovação humana; o agente não deve mesclar PRs automaticamente.

Comportamento e convenções (essenciais)
- Trunk-based: `main` é release-ready. Branches curtas: `feature/*`, `fix/*`, `chore/*`.
- Commits pequenos e atômicos; mensagens no padrão: `feat:`, `fix:`, `docs:`, `test:`, `chore:`.
- Antes de commitar automaticamente, o agente deve executar os scripts de teste e validação (veja `scripts/commit_and_test.sh`).
- IDs: UUID strings; `property_id` vive no JWT e deve ser usado para scoping.

Fluxo de trabalho do agente
- Planejar multi-step tasks com `manage_todo_list` (obrigatório para tarefas não triviais).
- Validar localmente: executar `./scripts/test-all.sh` ou o equivalente antes de criar commits automáticos.
- Atualizar documentação e OpenAPI quando endpoints mudarem.
- Ao finalizar um ciclo: criar commit(es) com mensagens concisas e abrir PR (usar `gh pr create --fill`), mas NÃO mesclar sem revisão humana.

Regras específicas para automação
- O agente pode criar branches, commits, push e abrir PRs.
- O agente NÃO deve:
  - Mesclar PRs automaticamente sem pelo menos UMA aprovação humana.
  - Comitar credenciais ou segredos.
  - Mudar políticas de auditoria financeira sem criar um ADR e obter aprovação humana.

Onde buscar contexto
- `docs/CONSOLIDATED_REQUIREMENTS.md` — regras de negócio e requisitos (fonte canônica).
- `docs/adr/` — decisões arquiteturais.
- `docs/system-instructions.md` — visão resumida do sistema e convenções operacionais.
- `backend/src/public/openapi.yaml` e `docs/collections/reservas` — especificação de API e exemplos.

Commits automáticos (checagens obrigatórias)
- Antes de commitar automaticamente, o agente deve:
  1. Executar a suíte de testes (frontend + backend) e garantir que TODOS os testes passem.
  2. Validar cobertura: não reduzir cobertura nas áreas alteradas (meta: >= 80% mínimo; 95% para áreas financeiras).
  3. Atualizar documentação, OpenAPI e coleção Bruno quando necessário.
  4. Criar commit com mensagem seguindo o padrão e abrir PR com descrição e checklist.

Este arquivo substitui instruções dispersas previamente mantidas em `docs/copilot-instructions.md`, `docs/AGENT_CONTEXT/*` e seções do `frontend/README.md` e `README.md`. Os arquivos originais agora apontam para esta localização.

Se você modificar este arquivo, atualize também o `README.md` na raiz para apontar onde agentes devem buscar instruções.

## Instruções rápidas para agentes (resumo)

Siga estas instruções ao trabalhar neste repositório. Leia `docs/copilot-instructions.md` e `docs/system-instructions.md` para contexto adicional.

- Linguagem: responda em Português (pt-BR) por padrão.
- Arquitetura: backend Laravel em `backend/src` (controllers → services → models), frontend React+TS em `frontend/src`.
- Antes de editar código, verifique: `docs/adr/`, `backend/src/public/openapi.yaml` e `docs/collections/reservas`.

Principais comandos
- Frontend dev: `cd frontend && npm ci && npm run dev`
- Frontend tests: `cd frontend && npm ci && npm test -- --run --coverage`
  - Nota: em ambientes não-interativos (CI, runners, ou quando executar testes via script), o `vitest` pode iniciar em modo interativo/watch e ficar aguardando entrada.
    - Para forçar execução não-interativa use a flag `-- --run` (ou `--run`). Exemplos:
      - `cd frontend && npm ci && npm run test -- --run --coverage`
      - `cd frontend && npm ci && npm test -- --run --coverage`
- Backend tests (container): `docker compose exec app bash -lc "vendor/bin/phpunit"`
- Full local test helper: `./scripts/test-all.sh`

Padrões e convenções do projeto
- IDs como UUID strings — tratar IDs como `string` em frontend e backend.
- `property_id` é o escopo ativo (vem no JWT). Serviços e controllers usam este claim.
- Lógica de negócio deve ficar em `backend/src/app/Services/*`; controllers apenas orquestram.
- Frontend: seguir padrão de serviços em `frontend/src/services/*`, páginas em `frontend/src/pages/*`, componentes em `frontend/src/components/*` e traduções em `frontend/public/locales/<lang>/common.json`.
- Modal compartilhado: `frontend/src/components/Shared/Modal/Modal.tsx` (padrão simples — usado por muitos modals locais).

Testes e mocks
- Vitest + Testing Library no frontend. Mock factories seguem o padrão usado em `frontend/src/pages/Properties/PropertiesPage.flow.test.tsx` (criar spies dentro do `vi.mock` e expor `__mocks`).
- Ao adicionar testes de integração/fluxo, copie o padrão de `PropertiesPage.flow.test.tsx` (mock de `react-i18next`, Chakra e serviços).

APIs e documentação
- Atualize `backend/src/public/openapi.yaml` ao adicionar/alterar endpoints.
- Atualize a coleção em `docs/collections/reservas` (Bruno/Postman) quando mudar APIs.

Commits, versionamento e releases
- Frontend tem scripts de versionamento em `frontend/package.json`: `bump:patch|minor|major` e `release-notes`.
- Fluxo recomendado (frontend): criar branch `feature/<x>`, rodar `npm run bump:patch` quando pronto, gerar `frontend/RELEASE_NOTES.md` com `npm run release-notes`, abrir PR e aguardar CI/revisão.

Políticas do agente
- Use `manage_todo_list` para planejar passos de trabalho e marque tarefas conforme progresso.
- Execute testes locais antes de commitar. Use `./scripts/commit_and_test.sh` quando disponível.
- Não faça merge automático: sempre exigir CI verde e uma aprovação humana antes de merge.

Arquivos importantes para checar rapidamente
- Backend: `backend/src/app/Controllers`, `backend/src/app/Services`, `backend/src/app/Models`.
- Frontend: `frontend/src/services/*`, `frontend/src/pages/*`, `frontend/src/components/*`, `frontend/public/locales/*/common.json`.
- Tests exemplos: `frontend/src/pages/Properties/PropertiesPage.flow.test.tsx` (pattern reference).

Se algo for incerto
- Abra uma issue curta descrevendo a dúvida, referencia os arquivos afetados e proponha 2 opções de implementação.

Peça feedback se alguma parte dessas instruções estiver incompleta ou se desejar que eu incorpore convenções adicionais.

``` 
