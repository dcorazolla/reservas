# Requisitos: UI, Pagamentos, Check-in/Check-out e Faturamento

Data: 2026-02-08

Resumo dos requisitos solicitados e diretrizes para implementação:

1) Acesso rápido à criação de reservas
- Na página `Lista de Reservas` deve haver um botão `Criar reserva` que abra o modal de reserva (`ReservationModal`).
- O modal deve permitir criação manual, com `price_override`, seleção opcional de parceiro, e validações de capacidade.

2) Renomear página principal de reservas
- A página atualmente rotulada `Reservas` deverá ser apresentada como `Motor de busca` no header e no menu principal.

3) Faturamento por parceiro
- Evoluir a tela de `Faturas` para permitir criação de faturas para parceiros:
  - Workflow: selecionar parceiro e período → listar reservas faturáveis (após checkout) → selecionar múltiplas reservas → gerar invoice com linhas por reserva.
  - UI deve permitir revisar e editar destinatários (e-mail), adicionar notas e emitir/baixar PDF.
  - Backend: endpoint que recebe lista de `reservation_id` e cria `invoice` ligado ao `partner_id`.

4) Check-in / Check-out
- Adicionar ações de check-in e check-out na UI que atualizam o status da reserva no backend.
- No check-out, marcar reservas como faturáveis (se aplicável) e habilitar seleção na tela de faturas.

Check-in / Check-out: comportamentos detalhados
- Check-in modal:
  - Ao acionar `Check-in` em uma reserva, abrir um modal de confirmação que permita confirmar/ajustar a data/hora de entrada e dados obrigatórios del registro (ex.: documento do hóspede, número de cartão para garantia quando aplicável, notas de condição do quarto).
  - O modal deve mostrar resumo da reserva (hóspede, quarto, período, total estimado) e permitir anexar observações.
  - Backend: `POST /api/reservations/{id}/checkin` deve receber payload com `actual_checkin_at`, `guest_document` e `notes` e gravar evento `reservation.checkin` em `financial_audit_logs`.

- Check-out modal e regras de faturamento:
  - Ao acionar `Check-out`, abrir um modal que resuma:
    - Consumos pendentes (frigobar, serviços, vendas no balcão) associados à estadia.
    - Total de hospedagem pendente.
    - Pagamentos já recebidos/linked invoices.
  - Regras de negócio para permitir o checkout:
    - O sistema deve impedir o checkout caso existam pendências financeiras não conciliadas (ex.: pagamento parcial da hospedagem) — apresentar aviso e opção de abrir a tela de pagamentos.
    - Para reservas pagas por parceiro (flag `partner_pays`), o checkout só cobrará os consumos (frigobar / vendas balcão). A hospedagem base não deve ser cobrada ao hóspede, apenas itens extras.
    - Backend: `POST /api/reservations/{id}/checkout` deve validar pendências, calcular linhas de invoice para consumos se necessário, criar invoice(s) quando aplicável, marcar `status = 'checked_out'` e escrever `reservation.checkout` em `financial_audit_logs`.
  - O modal deve permitir selecionar forma de pagamento para os itens cobrados, ou gerar fatura para o parceiro quando aplicável.

6.1) Exceções e UX
- Permitir forçar checkout apenas para usuários com permissão `force_checkout` (ex.: gerência), gravando um audit log `reservation.checkout_forced` com motivo.
- Quando o backend rejeitar checkout por pendência, o frontend deve exibir motivo legível e apontar para a ação necessária (ex.: criar pagamento, ajustar cobrança do parceiro).


5) Pagamentos e métodos
- Finalizar lista de métodos de pagamento visíveis na UI: `cartão débito`, `cartão crédito`, `pix`, `transferência`, `depósito` e `dinheiro`.
- UI para criar pagamentos deve permitir selecionar método, inserir referência/autorization id, valor, e vincular ao invoice.
- Planejar integração com gateways (p.ex. Stripe/PagSeguro/Pagar.me) — começar com um interface/adapter no backend para facilitar trocas.

5.1) Regras para parceiros que pagam reservas
- Quando `partner_pays` está ativo na reserva:
  - Ao gerar a fatura final, a hospedagem pode ser omitida do invoice enviado ao hóspede; a cobrança da hospedagem fica a cargo do parceiro.
  - O hóspede é cobrado apenas por consumos diretos (frigobar, vendas balcão, serviços extras) no momento do checkout.
  - Backend deve permitir emitir duas classes de documentos: `invoice_guest` (para itens cobrados ao hóspede) e `invoice_partner` (para itens faturados ao parceiro), ou criar linhas separadas com destinatários distintos conforme legislação/local.


6) Formatação de datas (frontend)
- Todas as datas exibidas no frontend devem seguir o padrão brasileiro: `DD/MM/YYYY`.
- Quando horários estiverem presentes, usar `DD/MM/YYYY HH:mm:ss`.
- Centralizar formatação em `frontend/src/utils/dates.ts` e atualizar todos os componentes para usá-la.

7) Evitar exibir IDs no frontend
- Não mostrar UUIDs ou IDs primários nas listagens ou telas sensíveis. Usar códigos curtos, números sequenciais ou esconder o campo por completo.
- Se um identificador precisar ser mostrado (por exemplo, para suporte), apresentar versão truncada ou gerar `display_code` no backend.

8) Documentação e instruções
- Adicionar estes requisitos ao repositório (`docs/requirements/ui-payments-checkin-invoices.md`) e referenciar em `DOCS_INDEX.md`.
- Sempre atualizar a documentação de APIs quando endpoints novos forem adicionados (ex.: `POST /api/invoices/from-reservations`).

Próximos passos sugeridos
- Implementar o botão `Criar reserva` na `Lista de Reservas` (feito).
- Atualizar a tela de `Faturas` com seleção de reservas faturáveis e endpoint no backend (planejar e implementar).
- Implementar check-in/check-out actions e gatilho para marcar reservas faturáveis.
- Implementar a tela de pagamentos com lista de métodos e adaptador para gateways.

10) Controle de Estoque, Ponto de Venda (POS) e Frigobar
- Visão geral:
  - O sistema deve suportar controle de estoque para itens vendidos no balcão e consumidos no frigobar, registro de vendas, e integração com faturamento/pagamentos.

- Requisitos funcionais mínimos:
  - Catálogo de `products` com atributos: `id`, `property_id`, `sku` (opcional), `name`, `price`, `tax_rate`, `is_for_minibar` (bool), `track_stock` (bool), `created_by`.
  - Controle de estoque (`stock_movements`): registrar `quantity` +/- com `reason` (purchase, sale, adjustment, minibar_consumption), `source_id` (sale_id / purchase_id / reservation_id), timestamp, `user_id`.
  - Vendas de balcão (POS): API para criar `pos_sales` com linhas (product_id, qty, unit_price), que reduz o estoque e pode gerar `invoice`/`payment` imediatos.
  - Frigobar: endpoints para registrar consumos por `reservation_id` (e opcional `room_id`), que criam `minibar_consumption` records and reduce stock if tracked.
  - Integração com checkout: ao abrir o `Check-out` modal, somar `minibar_consumption` and `pos_sales` linked to the reservation to present the final charge.

- Regras de faturamento e pagamento:
  - Consumptions linked to a `reservation` are billable at checkout; if `partner_pays` only consumptions are charged to guest, and the rest to partner as described earlier.
  - POS sales can be invoiced immediately or batched per shift/day for back-office reconciliation.

Próximos passos técnicos sugeridos
- Backend migrations: `products`, `stock_movements`, `pos_sales`, `pos_sale_lines`, `minibar_consumptions`.
- Services: `InventoryService` (adjust stock, report low stock), `PosService` (create sale, link payment), `MinibarService` (register consumption, optionally auto-charge).
- API: endpoints to list products, create POS sale, record minibar consumption, and report stock levels.
- Frontend: POS screen (fast add by SKU/name), minibar consumption UI on Reservation detail, stock report page, and integration into `Check-out` modal.

Notas adicionais
- Autorizações: diferencie papéis (front-desk, cashier, manager) e proteja endpoints críticos (stock adjustments, forced checkouts).
- Testes: adicionar integração e feature tests cobrindo POS sales → stock change → invoice/payment flows.

9) Bloqueio de quartos
- O sistema deve permitir bloquear quartos por período por motivos como manutenção.

- Requisitos:
  - CRUD para bloqueios (`room_id`, `start_date`, `end_date`, `reason`, `created_by`, optional `partner_id`).
  - Bloqueios devem impedir criação de reservas que conflitem com o período do bloqueio.
  - Bloqueios podem ser temporários ou permanentes; fornecer escopo para tipos (manutenção). 
  - Interface de seleção para admins criar/excluir bloqueios e visualizar sobreposições no calendário.
  - API: endpoints `GET /room-blocks`, `POST /room-blocks`, `PUT /room-blocks/{id}`, `DELETE /room-blocks/{id}`.

Próximos passos técnicos sugeridos
- Criar migration `room_blocks` com colunas `id`, `room_id`, `start_date`, `end_date`, `reason`, `partner_id`, `created_by`, timestamps.
- Enforce conflict check in `CreateReservationService` (reject reservation if intersects an active room_block).
- Update calendar grid to show blocked periods as overlay and prevent creating reservations on blocked days.


Notas de desenvolvimento
- Testes automatizados devem cobrir os novos fluxos: criação de invoice por parceiro, criação de pagamento e marcação de reservas após check-out.
- Evitar mudanças de API que quebrem consumidores sem versão; preferir novos endpoints quando necessário.

Processo de entrega e documentação
- Ao editar código ou API, sempre:
  - Atualize a documentação relevante (`docs/`, `docs/collections/reservas/`, `backend/src/public/openapi.yaml`).
  - Adicione ou atualize testes unitários/feature para garantir cobertura das mudanças.
  - Atualize `docs/DOCS_INDEX.md` e `docs/requirements/*` quando necessário.
  - Rode a suíte de testes localmente e confirme cobertura antes de push.
  - Faça `git push origin <branch>` e abra um PR com descrição, referências a issues/ADRs e checklist preenchida.
  - Aguarde a pipeline CI passar. Apenas faça merge quando a pipeline estiver verde; se a pipeline falhar, corrija e reenvie.
