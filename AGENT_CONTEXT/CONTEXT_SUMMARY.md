# CONTEXT_SUMMARY

Objetivo do sistema
- Reservas é uma aplicação para gerenciar propriedades, quartos, reservas e faturamento para múltiplos proprietários (properties). O sistema facilita criação de reservas, cálculo de preços, geração de invoices e integração de pagamentos, com auditoria financeira.

Prioridades do produto (curto prazo)
- Estabilidade das rotinas de reserva e faturamento.
- Cobertura de testes automática (backend PHPUnit e frontend Vitest + a11y).
- Acessibilidade e correções de formulários críticos.

Stakeholders / atores
- Admin / Property manager: gerencia propriedades, configura tarifas e revisa faturas.
- Guest: faz reservas e visualiza invoices.
- Parceiro (partner): entidade associada a propriedades que pode receber comissões.

Critério de sucesso
- Ambiente local reproduzível (Docker), testes passam e PRs revisáveis com documentação atualizada e OpenAPI mínima.
