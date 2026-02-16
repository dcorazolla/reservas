# Reservas

Aplicação de reservas para propriedades (hotel/pousada) — backend em Laravel (PHP) e frontend em React + Vite.

<!-- Versioning & Release Notes (front) -->
## Frontend Versioning and Release Notes

- The frontend package (`frontend`) follows semantic versioning (semver). The current version lives in `frontend/package.json` in the `version` field.
- To bump the frontend version and create a release commit/tag, use the npm scripts in the `frontend` folder:

```bash
# bump patch (recommended for small fixes)
cd frontend && npm run bump:patch

# bump minor (new features, backward-compatible)
cd frontend && npm run bump:minor

# bump major (breaking changes)
cd frontend && npm run bump:major
```

- After bumping the version, you can generate a simple `frontend/RELEASE_NOTES.md` by running:

```bash
cd frontend && npm run release-notes
```

- The `release-notes` script generates `frontend/RELEASE_NOTES.md` from recent git commits. Keep that file up-to-date and include it in the PR that contains the version bump.

- Workflow suggestion for releases (frontend):
	1. Create a short-lived branch for the release work or bump: `git checkout -b release/<version>`.
 2. Run `npm run bump:patch|minor|major` and push the commit and tag created by `npm version`.
 3. Run `npm run release-notes` and commit the updated `RELEASE_NOTES.md`.
 4. Open a PR to `main`, verify CI (tests), then merge.

These instructions should be followed for every new frontend release.


Visão geral
- Propósito: gerenciar propriedades, quartos, tarifas e reservas; no roadmap: parceiros e faturamento com auditoria completa.
- Público: operadores de hospedagem e equipe administrativa.

Preferência de idioma
- Todas as comunicações e instruções no repositório devem ser em Português (pt-BR) por padrão. Se for necessário outro idioma, solicite explicitamente.

Arquitetura
- Backend: Laravel (PHP) — controllers, services, form requests, Eloquent models.
- Banco: PostgreSQL (UUIDs como PKs). Requer extensão `pgcrypto` para geração de UUIDs.
- Frontend: React + TypeScript + Vite.
- Infra: Docker Compose (app, postgres, pgadmin).

Principais convenções
- IDs: usamos UUIDs (strings) como PKs/FKs em toda a stack.
- `property_id`: claim presente no JWT e usada por controllers/services para escopo.
- Usuários podem ter acesso a múltiplas propriedades (multi-property). Existe endpoint para trocar a propriedade ativa e emitir novo JWT.
- Auditoria financeira: todas operações que afetam valores (invoices, payments, envios) serão registradas em `financial_audit_logs` (append-only, hash-chaining opcional).

Começando (desenvolvimento)
1. Subir containers:

```bash
docker compose up -d
```

2. Rodar migrations/seeders (dentro do container `app`):

```bash
docker compose exec app bash
php artisan migrate --seed
```

Notas importantes (chaves e ambiente)
- **Gerar `APP_KEY` e `JWT_SECRET`:** se ao acessar a API você receber erro relacionado a "Secret is not set" ou autenticação falhar, gere a chave da aplicação e um `JWT_SECRET` dentro do container `app`:

```bash
docker compose exec app bash
php artisan key:generate
# add a random JWT secret (example using openssl):
printf "\nJWT_SECRET=%s\n" "$(openssl rand -hex 32)" >> .env
php artisan config:clear
php artisan cache:clear
```

- **Test DB & UUIDs:** the project uses PostgreSQL with UUID PKs. Ensure the DB has `pgcrypto` extension enabled for tests/migrations.

3. Frontend (local):

```bash
cd frontend
npm install
npm run dev
```

Testing e utilitários
- Rodar testes PHP:

```bash
docker compose exec app bash
vendor/bin/phpunit
```

Rodar tests com cobertura (PCOV)
- PCOV is enabled in the development PHP image. To run PHPUnit and collect coverage inside the `app` container and output a clover report:

```bash
docker compose exec app bash
vendor/bin/phpunit --coverage-clover=build/logs/clover.xml
```

The generated `build/logs/clover.xml` can be used by CI or local tools to inspect coverage. Focused coverage runs for the billing domain can be done by pointing PHPUnit to the specific test directory (e.g., `tests/Unit/Billing`).

## Development workflow (Trunk-Based)

This project uses a trunk-based development workflow with `main` as the release-ready trunk. Feature work should happen on short-lived branches and go through PRs with CI and human review.

Key points:

- Branch naming: `feature/<short-desc>-<ticket>` (e.g. `feature/partner-invoicing-42`).
- Keep branches small and short-lived (prefer multiple focused PRs).
- Use Feature Flags for big changes and safe deploys.
- Agent automation: the project agent can create branches, commits, pushes, and open PRs, but it will never merge without human approval and passing CI.

Commands:

- Create branch: `git checkout -b feature/xxx`.
- Run tests (backend): `./backend/src/vendor/bin/phpunit`.
- Run frontend tests: `pnpm test`.
 - Run frontend tests: `cd frontend && npm ci && npm test`.

See `.github/copilot-instructions.md` for detailed agent automation and branching rules.

Arquivos importantes
- `backend/src` — código Laravel.
- `frontend/src` — código React/TS.
- `docs/` — documentação e ADRs (decisões arquiteturais).

Como pedir contexto ao Copilot / novo turno
- Leia `docs/system-instructions.md` antes de reiniciar a conversa com o Copilot.
- A lista de ADRs (`docs/adr/`) e `README.md` contém convenções essenciais (UUID, `property_id`, multi-property, audit logs).

Próximos passos (planejados)
- Implementar domínio de parceiros/faturamento: partners, invoices, payments, PDF/CSV, email e UI administrativa.
- Melhorar navegação do calendário (prev/next/jump e, futuramente, infinite scroll).

MVP Status
----------

- Sprint 1 MVP delivered: reservations, partner billing basics, invoices & payments flows, and initial audit logging (see PR #62).
- Current branch: `feature/compat-reservations-params` contains the audit logs, migration and tests; PR #62 open for review and CI verification.


Licença
- Código interno do projeto — seguir políticas da organização.

Local test helper

- Run all tests locally (backend + frontend):

```bash
# Run backend + frontend tests locally (recommended before pushing)
./scripts/test-all.sh
```

## Frontend component structure (convenção)

O frontend segue uma convenção simples para organização de componentes e estilos:

- Cada componente principal vive em sua própria pasta em `frontend/src/components/<NomeDoComponente>/`.
- Dentro da pasta do componente coloque:
	- O(s) arquivo(s) do componente em `PascalCase` (ex.: `MyComponent.tsx`).
	- O arquivo de estilos em kebab-case: `my-component.css` (ex.: `reservation-modal.css`).
	- Os testes relacionados ao componente ao lado: `MyComponent.test.tsx`.
	- Um `index.ts` que re-exporta os componentes do diretório, facilitando imports do tipo `import { X } from 'components/Reservation'`.

Boas práticas adotadas:
- Preferir `className` + arquivos CSS em vez de `style=` inline, exceto quando o estilo é dinamicamente calculado (ex.: `left/top` de um popover`).
- Agrupar componentes por domínio (ex.: `rates/`, `Reservation/`, `Minibar/`) quando fizer sentido para manter pastas menores e com responsabilidade definida.
- Mantemos tokens e variáveis globais em `frontend/src/styles/variables.css` para facilitar theming (incluído recentemente no projeto).


Pre-push recommendation

- Always run the full test suite locally before pushing or opening a PR. You can use the helper script below which runs backend PHPUnit and frontend Vitest locally and will fail the push if tests fail:

```bash
# Run backend and frontend tests, then commit
./scripts/commit_and_test.sh "<commit message>"
```

Git hooks

- This repository includes a sample pre-push hook at `.githooks/pre-push` that will run `./scripts/test-all.sh` before pushing. To enable it locally:

```bash
git config core.hooksPath .githooks
```

- You can disable it later with:

```bash
git config --unset core.hooksPath
```
