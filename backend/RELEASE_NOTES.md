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
