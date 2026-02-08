# OVERVIEW

Reservas é um sistema para gerenciar propriedades, reservas e faturamento para múltiplos proprietários.

Resumo rápido
- Objetivo: permitir que managers/admins criem e gerenciem propriedades, quartos, reservas e faturas, com auditoria financeira e integração de pagamentos.
- Stack: Backend em Laravel (PHP 8+), Frontend em React + Vite (TypeScript), Banco principal Postgres (dev via Docker), Testes com PHPUnit e Vitest.
- Versões atualmente no repositório:
  - Frontend: `0.1.0` (arquivo: `frontend/package.json`)
  - Backend: `0.1.0` (arquivo: `backend/src/composer.json`)

Principais atores
- Admin / Property manager
- Guest (usuário que faz reserva)
- Parceiro (partner) — entidades que recebem comissões ou gerenciam propriedades

Fluxos principais
- Cadastro de propriedades → criação de quartos → definição de tarifas
- Busca de disponibilidade → criação de reserva → cálculo de preço → geração de invoice
- Pagamento da invoice → marcação como paga + auditoria financeira

Estado atual do código
- Branch atual de trabalho: `feature/mvp-frontend-fixes` (frontend fixes para o MVP)
- PRs importantes: revisar PRs abertos relacionados a a11y e frontend (ver histórico de PRs).
- Testes: backend PHPUnit configurado; frontend Vitest + testes a11y adicionados

## MVP Sprint 1 — status
- Frontend: calendar navigation, `ReservationsListPage` e `PartnerForm` atualizados — concluído (ver arquivos abaixo).
- Backend: endpoints mínimos (`/api/reservations`, `/api/invoices`, `/api/payments`) pendentes — prioridade alta.

Arquivos frontend relevantes
- `frontend/src/pages/CalendarPage.tsx`
- `frontend/src/components/Calendar/CalendarGrid.tsx`
- `frontend/src/pages/ReservationsListPage.tsx`
- `frontend/src/components/PartnerForm.tsx`

Onde procurar mais (resumo)
- Backend: `backend/src/` (controllers, services, migrations)
- Frontend: `frontend/src/` (components, pages, tests)
- Docs e ADRs: `docs/` (políticas, processos)
- CI: `.github/workflows/` (testes backend, frontend e a11y job)

Objetivo desse arquivo
- Fornecer um resumo rápido para novos desenvolvedores e agentes IA apresentando o sistema e apontando os artefatos essenciais.
