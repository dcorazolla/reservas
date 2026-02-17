# Regras de Negócio e Requisitos Consolidados

Este arquivo reúne as regras de negócio, requisitos funcionais e não-funcionais, e orientações operacionais extraídas de `docs/AGENT_CONTEXT/RULES_AND_REQUIREMENTS.md`, `docs/requirements/*` e ADRs relevantes.

## 1) Visão geral do domínio
- O sistema gerencia: propriedades, quartos, reservas, partners, invoices e pagamentos.
- Objetivo: permitir geração de faturas por partner/property, registro de pagamentos (parciais e totais), export (PDF/CSV) e envio por e‑mail com trilha imutável de auditoria financeira.

## 2) Regras de negócio críticas
- Auditoria financeira (obrigatória): qualquer ação que altere valores financeiros (criar invoice, registrar payment, alocar pagamento, enviar invoice) deve gerar entradas em `financial_audit_logs` (append-only).
- Logs append-only: correções representadas por eventos compensadores; não editar entradas históricas.
- Numerador de invoices: `invoice_counters` por property/ano (formato a ser definido em ADR).
- Partners: parceiros podem agrupar reservas de múltiplas propriedades; invoices são geradas por property/period/partner.
- Pagamentos: suportar pagamentos parciais com alocação por `invoice_line_payments`; status calculado (`open`, `partially_paid`, `paid`).

## 3) Requisitos funcionais prioritários
- CRUD de partners e endpoints de invoice/payment/preview/send/export.
- `POST /api/invoices/preview` → retorna reservas candidatas e valores por linha.
- `POST /api/invoices` → cria invoice + linhas + audit log.
- `POST /api/invoices/{id}/payments` → cria payment e atualiza alocações/estado e audit log.
- `POST /api/invoices/{id}/send` → enfileira job de envio; gera `invoice_communications` e audit log.
- Export e download: endpoints para PDF/CSV de invoices e logs.
- `POST /api/auth/switch-property` → troca propriedade ativa e retorna novo JWT com claim `property_id`.

## 4) Requisitos não-funcionais
- Integridade: `financial_audit_logs` append-only; recomenda-se hash-chaining para tamper-evidence (ADR 0001).
- Testes: obrigatoriedade de executar a suíte localmente antes de push/PR; cobertura mínima para áreas alteradas (meta geral: alta, 95% para domínio financeiro).
- Segurança: nunca comitar credenciais; usar `.env`. Jobs sensíveis em filas e idempotentes.
- Performance: operações de geração/export por jobs (assíncrono) para não bloquear requests.
- Observabilidade: registrar status de jobs, exportar logs e métricas.

## 5) Regras operacionais e de desenvolvimento
- Fluxo Git: `main` como trunk; branches curtas e PRs com CI e revisão humana.
- Antes do PR:
  - Rodar testes (backend + frontend) e gerar cobertura.
    - Observação importante: ao rodar a suíte frontend (`vitest`) em ambientes não-interativos (CI, scripts, runners), execute com a flag `-- --run` (ou `--run`) para forçar execução não-interativa e evitar que o runner entre em modo watch aguardando interação.
      - Ex.: `cd frontend && npm ci && npm run test -- --run --coverage` ou `npm test -- --run --coverage`.
  - Atualizar OpenAPI (`backend/src/public/openapi.yaml`) e coleção Bruno (`docs/collections/reservas`) quando endpoints mudarem.
  - Atualizar `RELEASE_NOTES.md` no pacote afetado (frontend/backend).
- Convenções: backend usa `app/Services/*` para lógica; controllers finos. Frontend: components colocated, i18n obrigatório, a11y e testes.

## 6) Critérios de aceite / QA
- PRs que afetem faturamento/pagamentos devem incluir:
  - Testes unitários cobrindo serviços e edge-cases.
  - Testes de integração comprovando gravação em `financial_audit_logs` na mesma transação.
  - Revisão humana obrigatória.
  - Atualização OpenAPI/collections e `RELEASE_NOTES.md`.

## 7) Artefatos a manter atualizados
- `docs/AGENT_CONTEXT/`, `OVERVIEW.md`, `SETUP.md`, `ARCHITECTURE.md`, `CHECKLIST.md`, `frontend/RELEASE_NOTES.md`, `backend/RELEASE_NOTES.md`, `docs/adr/`.

## 8) Requisitos específicos extraídos
- Reservas: CRUD, disponibilidade, overrides de preço auditados.
- Pagamentos: parciais e totais, integração com frigobar, alocações por linha.
- Frigobar: catálogo, lançamentos vinculados a reservas, agrupamento em invoice.

---
Referências originárias: `docs/AGENT_CONTEXT/RULES_AND_REQUIREMENTS.md`, `docs/requirements/*`, `docs/adr/*`.
