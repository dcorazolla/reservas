# SAMPLE_PROMPTS

Exemplos de prompts para um novo agente ou desenvolvedor automatizado.

1) Rodar todos os testes e reportar falhas:

```
Execute `./scripts/test-all.sh`. Se algum teste falhar, gere um relatório com os erros e proponha 3 passos para correção.
```

2) Implementar endpoint POST `/api/reservations`:

```
Implemente o endpoint POST /api/reservations que aceita JSON com property_id, room_id, guest_name, start_date, end_date. Adicione validações, serviço de criação de reserva, testes unitários e integração, e atualize o OpenAPI stub. Abra PR com descrição e checklist.
```

3) Criar ADR para decisão arquitetural:

```
Escreva um ADR (docs/adr/000X-<slug>.md) explicando a decisão, alternativas avaliadas e a escolha final sobre persistência de logs financeiros (append-only). Inclua data e autor.
```

4) Gerar OpenAPI básico para endpoints críticos:

```
Inspecione controllers em `backend/src/app/Http/Controllers/Api/` e gere um `openapi/openapi.yaml` contendo paths para reservations, invoices e payments com schemas básicos. Marque como draft e abra PR para revisão.
```
