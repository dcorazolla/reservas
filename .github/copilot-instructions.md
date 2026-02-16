## Instruções rápidas para agentes (resumo)

Siga estas instruções ao trabalhar neste repositório. Leia `docs/copilot-instructions.md` e `docs/system-instructions.md` para contexto adicional.

- Linguagem: responda em Português (pt-BR) por padrão.
- Arquitetura: backend Laravel em `backend/src` (controllers → services → models), frontend React+TS em `frontend/src`.
- Antes de editar código, verifique: `docs/adr/`, `backend/src/public/openapi.yaml` e `docs/collections/reservas`.

Principais comandos
- Frontend dev: `cd frontend && npm ci && npm run dev`
- Frontend tests: `cd frontend && npm ci && npm test -- --coverage`
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
