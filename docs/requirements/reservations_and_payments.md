Requisitos: Reservas, Pagamentos e Frigobar
=========================================

Resumo
------
Este documento descreve os requisitos funcionais e regras de negócio para as próximas entregas do módulo de reservas, pagamentos e frigobar.

1) Criação manual de reserva (interface simplificada)
- Deve ser possível criar uma reserva na tela `Reservas` com campos mínimos:
  - Datas: `start_date`, `end_date` (datas inclusivas/exclusivas conforme o domínio atual).
  - Ocupantes: adultos, crianças, infants.
  - Quarto: selecionar entre quartos disponíveis para o período.
  - Parceiro: selecionar um parceiro (opcional).
  - Valor: permitir sobrescrever o valor total/reserva (override manual do preço).
- Regras:
  - Ao escolher quarto e datas o sistema deve validar disponibilidade e bloquear conflitos.
  - Se o usuário sobrepor o valor, isto deve ser gravado e auditado (entrada em `financial_audit_logs`).
  - A criação gera/atualiza fatura(s) associadas à reserva com os valores atuais.

2) Edição de reserva
- Deve ser possível editar reservas existentes (datas, pessoa, quarto, parceiro, valor override).
- Regras:
  - Alterações de datas/ quarto devem revalidar disponibilidade; permitir forçar alteração com aviso (opção avançada).
  - Alterações de preço precisam recalcular totais e atualizar faturas, relatórios e gráficos.
  - Todas as alterações que impactem valores ou status devem gerar um registro de auditoria financeiro.

3) Pagamentos
- Suportar pagamentos parciais e totais:
  - Pagar total da reserva (marcar fatura/pagamento como quitada).
  - Pagamento parcial: gerar pagamento parcial, alocar em linhas e atualizar saldo pendente.
- Integração com frigobar: permitir pagar frigobar junto com hospedagem ou separadamente.
- Regras de parceiro:
  - Quando reserva for de parceiro (parceiro responsável pelas diárias), as regras de cobrança devem permitir que
    - diárias sejam faturadas ao parceiro (parceiro paga), e
    - frigobar seja cobrado ao hóspede (guest pays), conforme a configuração do parceiro.

4) Frigobar (Minibar)
- Catálogo de produtos:
  - Tela para gerenciar produtos do frigobar: `name`, `price`, `tax` (se aplicável), `sku`.
- Lançamentos/manuais:
  - Permitir lançar itens do frigobar vinculados a uma reserva com `description`, `amount`, `datetime`.
  - Permitir editar/excluir lançamentos até fechamento (com auditoria).
- Pagamento:
  - Lançamentos podem ser agrupados na mesma fatura da reserva ou em fatura separada.

5) UI / Usabilidade
- Renomear a lista para `Reservas` em todo o frontend.
- Buscar reservas por intervalo: corrigir bug onde intervalo de mesmo-dia não retorna reservas que sobrepõem esse dia.
- No grid (calendário) adicionar um elemento visual (badge/div) quando houver check-ins no dia (indicar ação necessária).
- Em todas as vistas onde a reserva aparece (lista, modal, grid, detalhes), permitir ações rápidas de `check-in` e `check-out`.

6) Relatórios & Consistência
- Alterações de valores nas reservas devem refletir imediatamente em:
  - Faturas / invoices
  - Exibições de histórico de reservas
  - Relatórios agregados e gráficos (receita, ocupação)
- Toda alteração financeira deve ser auditada em `financial_audit_logs` com informação suficiente (user, timestamp, before/after payload).

7) Testes e qualidade
- Cobertura mínima: adicionar testes de integração que cubram o fluxo: criar reserva -> editar preço -> verificar invoice atualizado -> criar pagamento parcial -> verificar saldo e audit logs.

8) Migração incremental
- Implementar em pequenos passos: UI create/edit minimal -> invoices update on change -> payments -> minibar. Cada passo com testes e documentação.
