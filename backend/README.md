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

Observações e documentação adicional
- Instruções do assistente e políticas de automação estão consolidadas em `.github/copilot-instructions.md`.
- Regras de negócio e requisitos em `docs/CONSOLIDATED_REQUIREMENTS.md`.
