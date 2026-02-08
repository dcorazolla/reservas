# Regras de Negócio e Requisitos (consolidação)

Este arquivo consolida as regras de negócio, requisitos funcionais e não-funcionais e orientações para agentes e desenvolvedores humanos, extraídos dos ADRs e da documentação principal.

1) Resumo do domínio
- O sistema gerencia propriedades, quartos, reservas, parceiros (partners), invoices e pagamentos.
- Objetivo principal: permitir geração de faturas por partner/property, registro de pagamentos (parciais e totais), export e envio (PDF/CSV/e‑mail) com trilha de auditoria financeira imutável.

2) Regras de negócio críticas
- Auditoria financeira (obrigatória): todas as ações que alteram valores ou o estado financeiro (criar invoice, registrar payment, alocar pagamento, enviar invoice) devem gerar entradas em `financial_audit_logs` (append-only). (ADR 0001, 0003)
- Logs append-only: correções devem ser representadas por eventos compensadores, nunca updates diretos nos logs.
- Invoice numbering: `invoice_counters` por property/ano (ex.: `PROP-2026-0001`) — decisão a confirmar/finalizar em ADR (especificar formato definitivo antes do release).
- Multi-property & partners: partners podem agrupar reservas de múltiplas properties; invoices são geradas por property/period/partner (um invoice por property). (partners-invoicing)
- Pagamentos e alocações: pagamentos podem ser parciais; `invoice_line_payments` mantém alocações por linha; status de invoice é calculado (`open`, `partially_paid`, `paid`).
- Jobs idempotentes: geração de PDF e envio de e‑mail devem ser idempotentes ou registrar execução para evitar duplicados.

3) Requisitos funcionais (prioritários)
- CRUD de partners: `POST /api/partners`, `GET /api/partners`, `PUT/PATCH`, `DELETE` (se aplicável).
- Preview de invoice: `POST /api/invoices/preview` (input: partner_id, property_id, period) → retorna reservas candidatas e valores por linha.
- Criar invoice: `POST /api/invoices` a partir do preview → cria invoice + invoice_lines e registra audit log.
- Registrar payment: `POST /api/invoices/{id}/payments` → cria payment, eventualmente aloca para `invoice_line_payments`, atualiza status e registra audit log.
- Enviar invoice: `POST /api/invoices/{id}/send` → enfileira job; cria `invoice_communications` e audit log.
- Export/Download: endpoints para gerar/baixar PDF/CSV das invoices e logs.
- Audit logs read-only: endpoints para consulta e export com filtros (por período, entity_type, actor_user_id).
- Calendar API: endpoint que retorna disponibilidade por `start_date`/`end_date` com paginação por intervalo.
- Multi-property switch: `POST /api/auth/switch-property` → retorna novo JWT com claim `property_id`.

4) Requisitos não-funcionais
- Auditoria e integridade: `financial_audit_logs` append-only; preferir hash-chaining (`previous_hash`, `entry_hash`) para tamper-evidence (ADR 0001).
- Testes e cobertura: obrigatoriedade de executar toda a suíte localmente antes de push/PR e manter cobertura mínima de **95%** nas áreas alteradas; testes unitários + testes de integração (DB, Jobs). Políticas documentadas em `AGENT_CONTEXT/DEVELOPMENT_STATE.md` e `CHECKLIST.md`.
- Segurança: nunca commitar credenciais; usar `.env`. Jobs sensíveis (pagamentos, envios) devem ser idempotentes e enfileirados.
- Performance: operações de geração/export devem ser realizadas via Jobs (assíncrono) para não bloquear requests; planejar retenção para logs.
- Observabilidade: registrar status de jobs, enviar métricas/erros; proporcionar endpoints para exportação de logs para auditoria legal.
- Conformidade operacional: políticas de retenção e arquivamento para `financial_audit_logs` (discutir com ops/legal); prever export periódica para arquivamento.

5) Regras para desenvolvimento e agentes (operacionais)
- Fluxo Git: trunk-based (branch `main` sempre releasable). Branches curtas: `feature/*`, `chore/*`, `fix/*`.
- Commits e PRs: mensagens curtas e padrão (`feat:`, `fix:`, `docs:`). PRs devem incluir checklist preenchido (`CHECKLIST.md`).
- Automatização mínima antes de commit/PR: executar `./scripts/test-all.sh`; garantir testes passando e cobertura mínima. Existe um script de commit/test (`scripts/commit_and_test.sh`) e hook de exemplo em `scripts/hooks/pre-commit`.
- Convenções de código: backend usa `app/Services/*` para regras de negócio e controllers finos; prefira Repositories para persistência. Frontend: componentes e testes a11y.
- Regras do agente (do `docs/copilot-instructions.md`): responder em português, usar `manage_todo_list` para planejar multi-step tasks, nunca mesclar sem aprovação humana, criar ADRs para decisões sensíveis.

6) Critérios de aceite / QA
- Para qualquer história/PR que altere faturamento/pagamentos:
  - Testes unitários cobrindo serviços e edge-cases.
  - Testes de integração que comprovem gravação em `financial_audit_logs` na mesma transação.
  - Revisão humana obrigatória (pelo menos 1 approver).
  - Atualização de OpenAPI/collections e `RELEASE_NOTES.md` correspondente.

7) Artefatos a manter atualizados sempre
- `AGENT_CONTEXT/` (contexto do agente), `OVERVIEW.md`, `SETUP.md`, `ARCHITECTURE.md`, `CHECKLIST.md`, `frontend/RELEASE_NOTES.md`, `backend/RELEASE_NOTES.md`, `docs/adr/`.

8) Próximos passos recomendados (curto prazo)
- P1: Finalizar ADR sobre numeração de invoices e confirmar formato de `invoice_counters`.
- P2: Implementar `financial_audit_logs` migration + model e prova de conceito em `InvoiceService` com gravação dentro de transação.
- P3: Gerar `openapi/openapi.yaml` rascunho para os endpoints críticos (invoices, payments, partners) e colocar em PR de API docs.
- P4: Integrar checagem de testes + coverage mínima no CI (workflow que executa `./scripts/test-all.sh` e falha se coverage abaixo do limiar) — pedir sua autorização antes de mexer em workflows.

---
Gerado a partir de: `docs/adr/*`, `docs/partners-invoicing.md`, `docs/copilot-instructions.md`, `AGENT_CONTEXT/*`, `backend/TODO.md`, `frontend/TODO.md`, `CHECKLIST.md`.
