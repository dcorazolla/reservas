# Project TODO

Persisted copy of the project's authoritative TODO. The canonical machine-readable TODO is managed by the `manage_todo_list` tool, but this file persists the current tasks so humans and editors can resume work easily.

Last updated: 2026-01-30

## How to use
- Agents/people: always read `docs/system-instructions.md`, ADRs in `docs/adr/` and this `TODO.md` before proposing or applying changes.
- Agents MUST also keep the `manage_todo_list` in sync (use the tool to update statuses). Treat `manage_todo_list` as canonical for automation; treat this file as a human-friendly snapshot.

## Tasks

- [ ] Documentar regras e ADR
  - Escrever `docs/partners-invoicing.md` e ADRs em `docs/adr/` com decisões de numeração, pagamentos, comunicações, modelo de dados e requisitos de auditoria.
- [ ] Criar migrations e modelos
  - Implementar migrations e Eloquent models para `partners`, `invoices`, `invoice_lines`, `payments`, `invoice_line_payments`, `invoice_counters`, `invoice_communications`, `financial_audit_logs` e alterar `reservations` para `partner_id`/`invoice_id`.
- [ ] Planejar backend endpoints
  - Definir e implementar endpoints: CRUD partners, associar partner a reservation, gerar invoice, listar candidatos, enviar email, registrar payment, export CSV/PDF, e endpoints de consulta de logs de auditoria.
- [ ] Implementar domínio de pagamentos
  - Criar `payments` e `invoice_line_payments` para suportar pagamentos parciais e alocações por linha; preparar provider/gateway para integrar mais tarde.
- [ ] Implementar PDF/CSV e email
  - Adicionar geração de PDF (dompdf), export CSV e envio de e‑mail via Job; gravar comunicações em `invoice_communications` e registo de envios em `financial_audit_logs`.
- [ ] Planejar frontend telas
  - Mapear telas: Parceiros (CRUD), Reservas do Parceiro (filtro/seleção), Gerar Fatura modal, Faturas (lista/detalhe), Registrar Pagamento modal, integração de downloads, envio de e‑mail e UI de auditoria (visualizar logs/exportar).
- [ ] Implementar UI Parceiros
  - Implementar telas para CRUD de parceiros e adicionar `partner` select no formulário de reserva (create/update).
- [ ] Implementar geração de faturas
  - Workflow: selecionar parceiro+período → revisar reservas candidatas → confirmar → criar invoice; permitir checkbox para envio por e‑mail, edição de destinatários e registrar ação no log de auditoria.
- [ ] Registrar/aplicar pagamentos
  - UI e endpoints para criar pagamento, alocar para linhas de invoice (parcial/total), atualizar status da fatura/linhas e gravar eventos no `financial_audit_logs`.
- [ ] Adicionar log de comunicações
  - Persistir todas as comunicações (subject, body, destinatários, status, error) em `invoice_communications` and indexar referências em `financial_audit_logs`.
- [ ] Auditoria financeira completa
  - Garantir auditabilidade completa para tudo que afeta valores: criar `financial_audit_logs` append-only com campos e implementar gravação via Observers/Services/Jobs; considerar hash-chaining e export/retention; expor endpoints read-only.
- [ ] Calendar API por intervalo
  - Criar endpoint para buscar calendário por `start_date` e `end_date` e suportar paginação por intervalo.
- [ ] Calendar: Controles navegação
  - Adicionar controles na UI do calendar: prev/next, jump-to-date, step size configurável e botão 'Hoje'.
- [ ] Calendar: Scroll performance
  - Implementar versão básica de navegação agora; planejar infinite scroll como melhoria futura (v2).
- [ ] Testes manuais e QA
  - Checklist: criar parceiro, criar reservas com partner, gerar fatura, exportar PDF/CSV, enviar e‑mail (simulado), registrar pagamento parcial e total, verificar exclusão de re-faturamento e verificar trilha de auditoria para cada operação.
- [ ] Atualizar OpenAPI e coleção
  - Documentar novos endpoints, esquemas de audit logs e variáveis de ambiente para as requests de parceiros/faturas/pagamentos/auditoria.
- [ ] Usuário multi-propriedade
  - Adicionar migration `user_properties` (pivot), Eloquent relations e endpoint `POST /api/auth/switch-property` que retorna JWT com claim `property_id`. Validar permissões.
- [ ] Troca de propriedade no menu
  - Mostrar propriedade atual no menu do usuário; permitir trocar propriedade (dropdown/modal) que chama `POST /api/auth/switch-property` e atualizar token; registrar troca no audit logs.
- [x] Criar README do projeto
  - Adicionar `README.md` com visão geral, como rodar localmente e convenções (UUIDs, `property_id`).
- [x] Criar instruções do sistema
  - Escrever `docs/system-instructions.md` com propósito e convenções para retomar contexto.
- [x] Criar ADR Auditoria
  - Adicionar `docs/adr/0001-auditoria-financeira.md` com decisões sobre append-only logs e hash-chaining.
- [x] Criar doc partners/faturamento
  - Adicionar `docs/partners-invoicing.md` com visão geral do domínio e endpoints prioritários.
- [x] Criar instruções Copilot
  - Adicionar `docs/copilot-instructions.md` com persona, arquivos a checar e convenções.
- [x] Script commits e policy
  - Adicionar `scripts/commit_and_test.sh` que executa testes e realiza `git commit` com mensagem curta.
- [ ] Regras de testes e cobertura
  - Definir regras: testes unitários + integração, cobertura próxima de 100%, evitar mocks quando possível, isolar dados de testes.
- [ ] Escrever testes backend 100%
  - Planejar e implementar suíte de testes backend em batches: services, models/scopes, controllers/endpoints, resources/requests.
