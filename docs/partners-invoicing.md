# Partners & Faturamento — Visão Geral

Objetivo
- Descrever o domínio de parceiros e faturamento a implementar: cadastro de parceiros, seleção de reservas vinculadas, geração de invoices, registro de pagamentos, export e envio e auditoria associada.

Entidades principais (v1)
- `partners` — empresas/parceiros que centralizam reservas e recebem faturas.
- `invoices` — cabeçalho da fatura (id, partner_id, property_id, period_start, period_end, total, status).
- `invoice_lines` — linhas da fatura (referência para reservation_id quando aplicável, descrição, amount).
- `payments` — pagamentos recebidos (amount, date, method, reference).
- `invoice_line_payments` — alocações de pagamento por linha (suporte a pagamentos parciais).
- `invoice_communications` — registros de envios por e‑mail (subject, recipients, status, error).

Fluxo básico (gerar fatura)
1. Usuário escolhe `partner` e período.
2. Backend retorna preview: reservas candidatas, totais por reserva/linha e somatório.
3. Usuário confirma → `InvoiceService::createFromReservations()` cria invoice + lines, grava evento no `financial_audit_logs` e retorna id da invoice.
4. Opcional: enviar por e‑mail (job enfileirado) — registrar `invoice_communications` e log de auditoria.

Pagamentos
- Registrar pagamento: criar registro em `payments` e alocar (opcionalmente) para linhas via `invoice_line_payments`.
- Atualizar status da invoice (`paid`, `partially_paid`, `open`) com eventos logados.

Regras e decisões para v1
- Sem impostos (taxes) em v1.
- Numeração: `invoice_counters` por property e ano (ex.: `PROP-2026-0001`). Registrar decisão final em ADR.
- Multi-property por partner: um parceiro pode ser associado a reservas de várias properties; invoices são geradas por property (um invoice por property/periodo/partner).

Endpoints prioritários (API)
- `POST /api/partners` — criar partner
- `GET /api/partners` — listar
- `POST /api/invoices/preview` — gerar preview de invoice (partner_id + period)
- `POST /api/invoices` — criar invoice a partir do preview
- `GET /api/invoices` — listar invoices (filtros: partner_id, property_id, status, period)
- `POST /api/invoices/{id}/payments` — registrar payment e alocar
- `POST /api/invoices/{id}/send` — enviar por e‑mail (enqueue job)

Auditoria
- Todas ações críticas (create invoice, register payment, send email, allocate payment) devem criar entradas em `financial_audit_logs`.

Notas de implementação
- Priorizar API read-only para previews antes de criar invoice (para evitar duplicação acidental).
- Jobs para geração de PDF e envio de e‑mail devem ser idempotentes ou registrarem execução para evitar duplicatas.
