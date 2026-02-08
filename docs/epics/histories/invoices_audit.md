# Épico: Invoices — integração com parceiros e descontos

Objetivo: Garantir que parceiros, regras de cobrança e percentuais de desconto sejam suportados no fluxo de invoice e visíveis na UI de edição de parceiros.

Escopo:
- Persistir `billing_rule` e `partner_discount_percent` no backend e expor no controller.
- Mostrar nas telas de `PartnerForm` e `Reservations` quando aplicável.
- Criar testes unitários/cobertura que garantam persistência e exposições.

Critérios de aceite:
- `Partner` model e controller persistem e retornam `billing_rule` e `partner_discount_percent`.
- UI mostra informações relevantes e testes backend passam.
