# DEVELOPMENT_STATE

Branch atual de trabalho
- `docs/overview-setup` — contém templates de documentação (OVERVIEW, SETUP, ARCHITECTURE) e AGENT_CONTEXT.

Branches relevantes
- `main` — trunk principal (releasable)
- `chore/frontend-a11y` — branch com atualizações de testes a11y e workflow (PR #24)

Versões
- Frontend: `0.1.0` (arquivo: `frontend/package.json`)
- Backend: `0.1.0` (arquivo: `backend/src/composer.json`)

Testes e comandos úteis
- Rodar todos os testes locais (script já presente):
  - `./scripts/test-all.sh`
- Frontend (Vitest):
  - `cd frontend && npm ci && npm test`
- Backend (PHPUnit):
  - `cd backend/src && composer install && vendor/bin/phpunit`

Docker / compose
- Arquivo principal: `docker-compose.yml` (serviços nomeados `reservas_*`, ex.: `reservas_app`, `reservas_pg`).
- Levantar containers:
  - `docker compose up -d --build`

PRs abertas / pendências relevantes
- PR #24 — `chore/frontend-a11y` (a11y job + testes) — revisar e mesclar quando pronto.

Onde encontrar código importante
- Backend controllers: `backend/src/app/Http/Controllers/Api/`
- Backend services: `backend/src/app/Services/`
- Frontend: `frontend/src/components/` e `frontend/src/pages/`

Notas operacionais
- Não commitar credenciais; usar `.env` e documentar variáveis necessárias.
- Antes de commitar mudanças que alterem comportamentos, rodar testes e atualizar documentação e OpenAPI quando aplicável.

Políticas obrigatórias (aplicáveis a todos os desenvolvedores e agentes)
- Cobertura de testes: todo código novo/alterado deve ser coberto por testes. O objetivo obrigatório do projeto é manter cobertura de testes acima de **95%** nas áreas modificadas. Pull requests que reduzam cobertura abaixo desse limiar devem ser rejeitados até correção.
- Execução de testes: execute a suíte completa de testes (backend + frontend) antes de qualquer push e antes de abrir PR. Use `./scripts/test-all.sh` e garanta que todos os testes passem.
- Critério para push/PR: só avançar com push ou abertura de PR se:
  1. Todos os testes passarem localmente.
  2. A cobertura mínima definida (95% nas áreas modificadas) for atendida.
  3. Documentação relacionada tiver sido atualizada (README/OVERVIEW/SETUP/RELEASE_NOTES/OpenAPI/ADRs quando aplicável).

Referência de documentação central
- Há um índice principal em `docs/DOCS_INDEX.md` que referencia todos os documentos essenciais do projeto (OVERVIEW, SETUP, ARCHITECTURE, AGENT_CONTEXT, front/back TODOs, release notes).

Referências úteis
- Checklist para PRs e mudanças importantes: `CHECKLIST.md` (root)


