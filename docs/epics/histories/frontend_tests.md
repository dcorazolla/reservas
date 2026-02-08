# Épico: Melhoria dos Testes Frontend

Objetivo: Aumentar cobertura e robustez dos testes frontend, especialmente nas páginas críticas do MVP.

Escopo:
- Adicionar testes unitários e de integração para `CalendarPage` e `ReservationsList`.
- Implementar testes a11y e rodá-los localmente no CI.
- Ajustar setup (`vitest.setup.ts`) para compatibilidade com axe/jsdom.

Critérios de aceite:
- Testes frontend executam localmente e no CI sem erros.
- Testes a11y integrados ao workflow e documentação de como rodá-los.
