# Índice de Documentação

Este arquivo centraliza onde está cada documentação e referências importantes do projeto. Use-o como ponto único para localizar documentação humana e artefatos necessários para um agente IA retomar o trabalho.

Top-level
- `README.md` — visão geral do projeto e links rápidos.
- `OVERVIEW.md` — resumo do sistema, atores e fluxos.
- `SETUP.md` — passos para levantar ambiente (Docker, comandos, testes).
- `ARCHITECTURE.md` — visão arquitetural e entidades principais.
- `CHANGELOG.md` / `RELEASE_NOTES.md` — histórico de alterações.

Diretórios de documentação
- `docs/adr/` — ADRs (decisões arquiteturais) numeradas.
- `docs/collections/` — coleções Bruno/Postman (exemplos de requisições).
- `docs/process/` — processos operacionais e guias.
 - `docs/epics/` — backlog, epics e tarefas priorizadas.
 - `docs/sprints/` — notas e checklists de sprint (sprints entregues e em andamento).

- `docs/requirements/` — detailed feature requirements and UI/UX specs (reservations, payments, minibar, check-in flows).
	- `docs/requirements/ui-payments-checkin-invoices.md` — UI and payments/check-in/invoices requirements (2026-02-08).

Agent context
- `AGENT_CONTEXT/CONTEXT_SUMMARY.md` — resumo de negócio e prioridades.
- `AGENT_CONTEXT/DEVELOPMENT_STATE.md` — estado atual do repositório e comandos.
- `AGENT_CONTEXT/TASKS.md` — backlog e tarefas prioritárias.
- `AGENT_CONTEXT/SAMPLE_PROMPTS.md` — prompts exemplares para um agente IA.

Frontend
- `frontend/README.md` (se existir) — instruções específicas do frontend.
- `frontend/package.json` — versão do frontend e scripts (dev/build/test).
- `frontend/TODO.md` — tarefas e notas para o frontend.
- `frontend/RELEASE_NOTES.md` — notas de release do frontend.
- `frontend/src/` — código-fonte (components, pages, api, __tests__).

Backend
- `backend/src/composer.json` — versão do backend e dependências.
- `backend/TODO.md` — tarefas e notas para o backend.
- `backend/RELEASE_NOTES.md` — notas de release do backend.
- `backend/src/` — código-fonte (app/, database/, tests/).
- `backend/src/app/Http/Controllers/Api/` — endpoints principais (reservations, invoices, payments).
- `backend/src/app/Services/` — regras de negócio (reservation, invoice, pricing).

CI / Operação
- `.github/workflows/` — workflows de CI (testes backend, frontend, a11y job).
- `docker-compose.yml` e `docker-compose.ci.yml` — configurações para ambiente local e CI.
- `scripts/` — scripts utilitários (test-all, monitor_ci, commit hooks).

Como usar
- Para localizar documentação relacionada a uma área, abra `docs/DOCS_INDEX.md` e siga o link para o arquivo correspondente.
- Ao alterar comportamento do sistema, atualize o arquivo de documentação relacionado e adicione uma entrada em `frontend/RELEASE_NOTES.md` ou `backend/RELEASE_NOTES.md`.
