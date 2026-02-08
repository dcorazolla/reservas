<!-- Restored from archive: guidance snapshot -->

# Backend Change Guidelines (historical snapshot)

Este arquivo é uma cópia das diretrizes históricas para mudanças no backend: requisitos de testes, atualização de documentação, atualização de coleções e checklist de PR.

- Testes: qualquer alteração em controllers e modelos deve vir acompanhada de testes Unit/Feature relevantes.
- Migration: adicionar migration quando for alterar schema; run `php artisan migrate` em ambiente de CI ou `php artisan migrate --env=testing` em local.
- Documentação: atualize `DOCS_INDEX.md` e a coleção em `docs/collections/reservas` quando houver mudanças em endpoints.
- Checklist de PR: descrição, passos para reproduzir, comandos de testes locais, screenshots quando aplicável.

Nota: conteúdo consolidado e sincronizado com `CHECKLIST.md` e `AGENT_CONTEXT/DEVELOPMENT_STATE.md`.
