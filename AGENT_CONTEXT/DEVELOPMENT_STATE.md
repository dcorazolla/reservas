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
