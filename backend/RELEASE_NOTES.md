# Release Notes - Backend

## 0.1.0 - Inicial

- Versão inicial do backend: `0.1.0`.
- Atualizações/observações:
  - Campo `version` adicionado ao `composer.json` para rastreamento semver.
  - Ajustes recentes em validação de datas e testes para evitar exceções do Carbon.

Fluxo para nova release:
- Atualizar `backend/src/composer.json` com a nova versão (ex.: `0.1.1`).
- Atualizar `backend/RELEASE_NOTES.md` com mudanças.
- Tag no git: `git tag -a backend/v0.1.0 -m "backend v0.1.0"`

## 0.2.0 - Sprint 1 MVP (2026-02-08)

- Entregas principais:
  - Reservas: endpoints de criação/atualização/listagem e cálculo de preços detalhado.
  - Pagamentos e faturas: endpoints de pagamento e criação de faturas a partir de reservas (flaggeado).
  - Partners: CRUD completo de parceiros e associação a reservas.
  - Auditoria financeira: logs de auditoria de transações implementados.

- Observações e próximos passos:
  - Habilitar feature-flag `invoices.create_from_reservation` em staging para validação manual.
  - Revisar pequenas deprecações do PHPUnit em follow-up.

