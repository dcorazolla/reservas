# Reservas

Aplicação de reservas para propriedades (hotel/pousada) — backend em Laravel (PHP) e frontend em React + Vite.

Visão geral
- Propósito: gerenciar propriedades, quartos, tarifas e reservas; no roadmap: parceiros e faturamento com auditoria completa.
- Público: operadores de hospedagem e equipe administrativa.

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

See `docs/copilot-instructions.md` for detailed agent automation and branching rules.

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

Licença
- Código interno do projeto — seguir políticas da organização.
