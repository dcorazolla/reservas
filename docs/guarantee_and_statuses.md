# Reservas: `reservado` vs `confirmado` e garantias

Este documento descreve as diferenças entre `reservado` e `confirmado`, os campos adicionados ao modelo `reservations` para suportar garantias, e as transições de estado recomendadas.

## Significados
- `pre-reserva` — reserva inicial, espaço reservado sem confirmação; pode ser apenas uma intenção.
- `reservado` — reserva criada/registrada no sistema; não necessariamente garantida por pagamento.
- `confirmado` — reserva garantida (p.ex. cartão pré-autorizado, pré-pagamento, voucher) ou validada manualmente pela recepção.
- `checked_in` — hóspede presente (entrada realizada).
- `checked_out` — hóspede saiu (saída realizada).
- `no_show` — hóspede não compareceu.
- `cancelado` — reserva cancelada.
- `blocked` — quarto bloqueado por manutenção ou outro motivo operacional.

## Campos novos (banco de dados)
- `guarantee_type` (string, nullable): tipo da garantia (`card`, `prepay`, `voucher`, `none`, etc.).
- `payment_status` (string, nullable): estado do pagamento (`pending`, `authorized`, `paid`).
- `guarantee_at` (timestamp, nullable): quando a garantia foi registrada.
- `guarantee_token` (string, nullable): token/identificador da autorização (opcional, sensível).

> Observação: os novos campos são adicionados à API de `ReservationResource` (exceto `guarantee_token`, que é sensível e não deve ser exposto sem necessidade). A `ReservationResource` expõe `guarantee_type`, `payment_status` e `guarantee_at`.

## Recomendações de transição e validação
- Recomendamos que a transição para `confirmado` exija uma forma de garantia (campo `guarantee_type` ou um `guarantee_token`) ou uma ação administrativa que indique aprovação manual.
- Em sistemas com políticas de cancelamento, reservas `confirmadas` devem ter regras de penalidade mais rígidas.
- Operacional: o front‑desk pode oferecer ações rápidas no modal: `Confirmar` (autorizar cartão), `Cancelar com penalidade`, `Registrar check-in`.

## Exemplo de payload para confirmar
```json
{
  "status": "confirmado",
  "guarantee_type": "card",
  "guarantee_token": "tok_abc",
  "guarantee_at": "2026-02-14T12:00:00Z",
  "payment_status": "authorized"
}
```

## UI
- Badge de status: `confirmado` usa cor verde; `reservado` usa azul.
- Quando `confirmado`, o modal mostra um pequeno indicador com o `guarantee_type` (por ex. `card` ou `prepay`).

## Próximos passos
- Implementar endpoints para autorizar/estornar garantias quando necessário (`/reservations/:id/guarantee`).
- Se desejar, impor validações no backend para impedir `status: confirmado` sem garantia (requer mudanças no fluxo de operação e testes).
