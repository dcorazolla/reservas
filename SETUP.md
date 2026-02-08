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
# na raiz (executa frontend + backend)
./scripts/test-all.sh

# Frontend (dentro da raiz do projeto)
cd frontend
npm ci
npm run test -- --run

# Backend (recomendado dentro do container app)
cd /home/diogo/projects/reservas
docker compose up -d pg app
docker compose exec app sh -lc "composer install --no-interaction --prefer-dist || true"
docker compose exec app sh -lc "php artisan migrate --force"
docker compose exec app sh -lc "./vendor/bin/phpunit --colors=never"

# Alternativa (sem Docker) - se tiver PHP/Composer localmente
cd backend/src
composer install
./vendor/bin/phpunit --colors=never
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

Versionamento e fluxo de PR (backend)

- Bump de versão (patch/minor/major): atualize `backend/src/composer.json` chave `version` para a nova versão seguindo SemVer.
- Atualize `backend/RELEASE_NOTES.md` com o resumo das mudanças e notas de migração.
- Rode os testes localmente/CI (ver comandos acima) e verifique que tudo passa.
- Commit, push e abra PR: `git add backend/src/composer.json backend/RELEASE_NOTES.md && git commit -m "chore(release): backend vX.Y.Z" && git push origin <branch>`.
- Aguarde CI executar e, após checks verdes, faça merge via PR (ou habilite auto-merge quando apropriado).

Deployment notes:
- Ao liberar para staging/prod certifique-se de rodar `php artisan migrate --force` e de ter `APP_KEY` e `JWT_SECRET` configurados no ambiente.
