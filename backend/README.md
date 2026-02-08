# Backend

Este diretório contém o código do backend. Estrutura relevante:

- Código fonte: `backend/src/`
- Tests (phpunit): `backend/src/tests/`
- Config phpunit: `backend/src/phpunit.xml`

Para rodar testes localmente (assumindo dependências instaladas):

```bash
cd backend/src
composer install
./vendor/bin/phpunit -c phpunit.xml
```
