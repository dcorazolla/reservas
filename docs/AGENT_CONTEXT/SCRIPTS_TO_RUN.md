# SCRIPTS_TO_RUN

Comandos úteis para desenvolvedores/agentes — execute a partir da raiz do repositório.

Docker e ambiente

```bash
docker compose up -d --build
docker compose exec app bash
```

Rodar todos os testes (script consolidado)

```bash
./scripts/test-all.sh
```

Frontend

```bash
cd frontend
npm ci
npm test
```

Backend

```bash
cd backend/src
composer install
vendor/bin/phpunit
```

Outros utilitários

```bash
# rodar linters (frontend)
cd frontend && npm run lint

# inspecionar workflow e runs via gh
gh run list --workflow="frontend-tests.yml"
```
