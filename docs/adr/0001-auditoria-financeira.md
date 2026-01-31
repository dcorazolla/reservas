# ADR 0001 — Auditoria Financeira (Append-only + Hash Chaining)

Data: 2026-01-30

Status: Proposta (a confirmar antes de implementação)

Contexto
- O sistema irá gerenciar valores financeiros (invoices, payments) que exigem rastreabilidade e proteção contra adulteração.
- Necessitamos de evidência de quem fez o quê, quando, e quais dados foram alterados.

Decisão
- Implementar tabela append-only `financial_audit_logs` com esquema mínimo:
  - `id` (uuid)
  - `entity_type` (string) — ex.: `invoice`, `payment`, `reservation`
  - `entity_id` (uuid) — id da entidade afetada
  - `action` (string) — ex.: `create`, `update`, `delete`, `send_email`, `switch_property`
  - `actor_user_id` (uuid) — quem executou a ação
  - `timestamp` (timestamptz)
  - `payload` (jsonb) — dados relevantes (diff ou snapshot)
  - `previous_hash` (text|null) — hash do registro anterior (opcional)
  - `entry_hash` (text) — hash do próprio registro
  - `metadata` (jsonb|null) — info extra (ip, user_agent, job_id)

Justificativa
- Append-only garante que os registros não sejam sobrescritos.
- Hash-chaining (`previous_hash`) fornece evidência adicional de tamper-evidence: alterar um registro exigiria recalcular hashes subsequentes.

Implementação
- Criar migration para `financial_audit_logs` e model Eloquent mínimo.
- Gravar logs a partir de:
  - Model Observers (where applicable) — ex.: InvoiceObserver::created/updated
  - Services (para ações compostas) — ex.: InvoiceService::generate() registra uma entrada por ação completa.
  - Jobs (envio de e‑mails, geração de PDF) registram e atualizam log ao final.
- Calcular `entry_hash` como SHA256 sobre uma string determinística (ex.: concat de entity_type|entity_id|action|actor_user_id|timestamp|payload JSON canonicalizado|previous_hash).

Operacional
- Tabela deve ser tratada como append-only: não permitir updates/deletes via aplicação. Ajustes administrativos devem gerar novas entradas que expliquem e corrijam o histórico.
- Implementar endpoints read-only para consulta e export (CSV/PDF) dos logs, com filtros por período, entity_type, actor_user_id.

Alternativas consideradas
- Usar solução externa de audit trail (ex.: ELK/immutable storage) — descartada para v1 por complexidade e custo.

Consequências
- Necessidade de política de retenção e armazenamento (tamanho do DB).
- Processos de export periódicos podem ser necessários para arquivamento legal.
