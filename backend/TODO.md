# TODO - Backend

Este arquivo lista tarefas e informação mínima para iniciar o backend (Laravel) a partir do zero.

- Versão atual: `0.1.0`
- Como iniciar (resumo):
  - Instalar dependências PHP: `composer install`
  - Preparar .env: copie `.env.example` e ajuste variáveis
  - Criar DB de testes: `touch database/database.sqlite`
  - Rodar migrations: `php artisan migrate`
  - Executar testes: `vendor/bin/phpunit` ou `composer test`

- Tarefas imediatas:
  - [ ] Validar rotas da API e atualizar `public/openapi.yaml` se necessário
  - [ ] Garantir que `phpunit.xml` define timezone (`UTC`) em CI
  - [ ] Documentar variáveis de ambiente necessárias no `README.md`

- Notas para um agente IA que começa do zero:
  - Use `app/Services` para regras de negócio; mantenha controllers finos.
  - Tests usam SQLite em memória ou `database/database.sqlite` conforme `phpunit.xml`.
  - Evitar commit de credenciais; usar `.env` e documentar necessidades no `README.md`.

Sempre mantenha este arquivo sincronizado com o `manage_todo_list` do repositório.

-- Tarefas distribuídas do `TODO.md` raiz --

- **Documentar regras e ADR**
  - [ ] Escrever `docs/partners-invoicing.md` (detalhes adicionais backend) e ADRs específicos em `docs/adr/` sobre numeração, pagamentos, comunicações e auditoria.

- **Migrations e modelos**
  - [ ] Criar migrations e Eloquent models para: `partners`, `invoices`, `invoice_lines`, `payments`, `invoice_line_payments`, `invoice_counters`, `invoice_communications`, `financial_audit_logs`.
  - [ ] Alterar `reservations` para incluir `partner_id` e `invoice_id` quando aplicável.

- **Endpoints backend (planejamento e implementação)**
  - [ ] CRUD `partners`
  - [ ] Associar `partner` a `reservation` (endpoint)
  - [ ] Gerar `invoice` a partir de reservas candidatas
  - [ ] Registrar `payment` e alocação por linha
  - [ ] Endpoints para export CSV/PDF e logs de auditoria (read-only)

- **Domínio de pagamentos**
  - [ ] Implementar lógica de `payments` e `invoice_line_payments` para suportar pagamentos parciais e alocações por linha.
  - [ ] Interface para integrar provider/gateway posteriormente.

- **PDF/CSV e envio de e-mail**
  - [ ] Adicionar geração de PDF (ex.: dompdf), export CSV e envio de e-mail via Job; gravar comunicações em `invoice_communications`.

- **Logs e auditoria financeira**
  - [ ] Implementar `financial_audit_logs` append-only com gravação via Observers/Services/Jobs; expor endpoints read-only para auditoria.
  - [ ] Considerar hash-chaining e política de retenção/export.

- **Calendar API (backend)**
  - [ ] Criar endpoint para buscar calendário por `start_date` e `end_date` com paginação/intervalo.

- **Usuário multi-propriedade (backend)**
  - [ ] Criar migration `user_properties` (pivot), implementar relations e endpoint `POST /api/auth/switch-property` que retorna JWT com claim `property_id`.

- **OpenAPI / documentação de API**
  - [ ] Atualizar `openapi/openapi.yaml` (ou `public/openapi.yaml`) com novos endpoints: partners, invoices, payments, audit logs.

- **Regras de testes e cobertura (backend)**
  - [ ] Implementar suíte de testes backend em batches (services, models, controllers, requests) visando cobertura alta (ver política: >=95% em áreas alteradas).

