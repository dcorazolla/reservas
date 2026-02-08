# Release Notes - Frontend

## 0.1.0 - Inicial

- Versão inicial do frontend: `0.1.0`.
- Atualizações principais:
  - Atualização das dependências de teste para compatibilidade com React 19.
  - Adição de testes de acessibilidade (`*.a11y.test.tsx`) e polyfills de teste.
  - Ajustes em componentes `Modal`, `RoomForm`, `PartnerForm` para melhorar acessibilidade.

Instruções para lançar nova versão:
- Atualizar `package.json` para nova versão semântica (ex.: `0.1.1`).
- Atualizar `frontend/RELEASE_NOTES.md` com mudanças.
- Tag no git: `git tag -a frontend/v0.1.0 -m "frontend v0.1.0"`

## 0.1.1 - Patch (2026-02-08)

- Bump patch release for frontend: `0.1.1`.
- Notes:
  - Minor UI improvements for reservation modal and add create-invoice-from-reservations page.
  - Tests: accessibility and reservation modal tests updated to reflect checkout/minibar UI flows.

Deployment notes:
- Run `npm ci` and build assets (`npm run build`) for production.
