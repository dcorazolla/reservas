# Épico: Auditoria Financeira (Financial Audit Logs)

Objetivo: Garantir que todas as operações de faturamento/gravação de invoices e pagamentos criem entradas em `financial_audit_logs` para rastreabilidade.

Escopo:
- Implementar gravação de `financial_audit_logs` no fluxo de criação de invoice e pagamentos.
- Criar testes de integração que verifiquem a existência das entradas de auditoria.
- Documentar as garantias de consistência e o formato do log em `docs/architecture`.

Critérios de aceite:
- Inserções em `financial_audit_logs` são geradas para `POST /api/invoices` e `POST /api/payments`.
- Testes cobrindo gravação de logs em CI.
