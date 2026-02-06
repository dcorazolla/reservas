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
