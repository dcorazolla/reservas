# TODO - Frontend

Este arquivo lista tarefas e informação mínima para iniciar o frontend a partir do zero.

- Versão atual: `0.1.0`
- Como iniciar (resumo):
  - Instalar dependências: `npm ci`
  - Rodar dev: `npm run dev`
  - Executar testes: `npm test` (Vitest)

- Tarefas imediatas:
  - [ ] Verificar integração com backend (endpoints e CORS)
  - [ ] Atualizar `public` e `openapi` se endpoints mudarem
  - [ ] Garantir que testes de acessibilidade (`*.a11y.test.tsx`) passam em CI

- Notas para um agente IA que começa do zero:
  - `package.json` contém scripts básicos (`dev`, `build`, `test`).
  - `vitest.setup.ts` inclui polyfills necessários para testes.
  - Componentes críticos: `src/components/Modal`, `src/pages/Reservation`.

Sempre mantenha este arquivo sincronizado com o `manage_todo_list` do repositório.
