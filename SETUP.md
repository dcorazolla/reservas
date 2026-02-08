# SETUP

Passos mínimos para levantar o projeto localmente (do zero).

Requisitos
- Docker + Docker Compose
- Node.js (v18+ recomendado) e npm
- PHP 8.2+ e Composer (se rodar nativamente)

Levantar com Docker (recomendado)
1. Na raiz do projeto:

```bash
docker compose up -d --build
```

2. Acessar containers quando necessário:

```bash
docker compose exec app bash
```

3. Criar DB local (se necessário):

```bash
# dentro do container app
php artisan migrate --force
php artisan db:seed
```

Front-end (local)

```bash
cd frontend
npm ci
npm run dev
```

Executar testes (local)

```bash
# na raiz
./scripts/test-all.sh
# ou apenas frontend
cd frontend && npm test
# ou backend
cd backend/src && composer test
```

Rodando somente os testes de acessibilidade (a11y) localmente

```bash
cd frontend
npm ci
# executa testes que seguem o padrão de arquivo *.a11y.test.tsx
npx vitest run "src/**/__tests__/*.a11y.test.*"
```

Se preferir executar todos os testes do frontend com reporter em linha:

```bash
cd frontend
npx vitest
```

Observações sobre `docker-compose.yml`
- O arquivo de compose foi atualizado para usar serviços com nomes `reservas_*` (ex.: `reservas_app`, `reservas_pg`). Ajuste o acesso/nomes se você usa scripts externos que referenciam nomes antigos.

Como contribuir
- Crie uma branch a partir de `main` com o padrão: `feature/<descrição>` ou `chore/<descrição>`.
- Rode `./scripts/test-all.sh` antes de commitar.
