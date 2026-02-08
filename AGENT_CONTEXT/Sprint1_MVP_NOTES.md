# Sprint 1 — MVP (atualizado 2026-02-08)

## Status (checklist)
- [x] Frontend: `CalendarPage` e `CalendarGrid` — navegação por mês e seleção de intervalo.
- [x] Frontend: página de listagem de reservas (`/reservas/list`).
- [x] Frontend: botão/ação "Gerar fatura" mantido no formulário de reserva; feature flag `invoices.create_from_reservation` habilitada por padrão para Sprint 1.
- [x] Frontend: `PartnerForm` estendido com `billing_rule` e `partner_discount_percent`.
- [x] Testes: ajustes em Vitest / a11y (mecanismo para pular job quando não há testes) e testes locais validados.
- [ ] Backend: endpoints de suporte (ver lista abaixo).
- [ ] CI: job `a11y` integrado e verde no pipeline.

## Endpoints backend necessários (prioridade)
1. `GET /api/reservations` — listar reservas por `property_id` e intervalo de datas.
	- Query params: `start_date=YYYY-MM-DD`, `end_date=YYYY-MM-DD`, `property_id` (opcional se vindo do JWT).
	- Exemplo de resposta (200):
	  ```json
	  [{ "id": "uuid", "property_id": "uuid", "room_id": "uuid", "guest_name": "Fulano", "start_date": "2026-02-10", "end_date": "2026-02-12", "status": "confirmed", "total_price": 300.0 }]
	  ```

2. `POST /api/invoices/preview` — (opcional) gerar preview de invoice a partir de reservas/periodo/partner.
	- Body: `{ "partner_id": "uuid", "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD" }`
	- Resposta: resumo de linhas candidatas + totals.

3. `POST /api/invoices` — criar invoice definitivo (depois de preview/confirm).
	- Body: invoice payload (linhas, partner_id, property_id, totals).
	- Requisitos: gravação em `invoices`, `invoice_lines` e registro em `financial_audit_logs`.

4. `POST /api/payments` — registrar pagamento ligado a invoice.

5. `GET /api/properties` — listar propriedades do usuário (para seleção/escopo).

## Responsabilidades / Owners (proposta)
- Frontend: implementar chamadas para `GET /api/reservations` e renderizar em `ReservationsListPage` — owner: frontend team.
- Backend: implementar `GET /api/reservations`, `POST /api/invoices` e `POST /api/payments` com audit logs — owner: backend team.

## Riscos conhecidos
- Auditoria financeira não implementada → faturamento em produção deve ser bloqueado até que `financial_audit_logs` esteja ativo e testado.
- Falta de escopo por `property_id` em endpoints públicos pode causar leaks entre propriedades; sempre validar `property_id` vs claim do JWT.
- Mudanças em contratos de API exigem atualização imediata do OpenAPI (`public/openapi.yaml`) e coleção de requests (`docs/collections/reservas`).

## Próximos passos (curto prazo)
1. Criar OpenAPI stub com os endpoints listados e revisar com backend.
2. Implementar `GET /api/reservations` no backend (mínimo) e testar com frontend local (feature branch `feature/mvp-frontend-fixes`).
3. Adicionar job `a11y` ao CI e garantir que os testes a11y existentes sejam executados.
4. Garantir que fluxos de geração de invoice gravem entradas em `financial_audit_logs` e tenham testes de regressão.

--
Essas notas servem como checklist operacional para a Sprint 1. Atualize status quando um item for concluído ou bloqueado.
