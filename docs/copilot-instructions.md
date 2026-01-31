```instructions
# Instruções para o GitHub Copilot / Assistente

Propósito
- Este arquivo contém instruções explícitas para o Copilot (ou qualquer assistente) sobre como operar no repositório `reservas`. Deve fornecer contexto suficiente para que, ao iniciar uma nova sessão, o assistente entenda convenções, prioridades e limites sem que você repita tudo.

Comportamento esperado (persona)
- Aja como um par-programador conciso e seguro.
- Responda sempre em português (pt-BR), salvo pedido explícito em outro idioma.
- Antes de modificar arquivos, leia `docs/system-instructions.md` e ADRs em `docs/adr/`.
- Use o `TODO` (gerenciado em `manage_todo_list`) para planejar tarefas multi-step.
- Sempre prefira mudanças pequenas, testáveis e reversíveis.

Arquivos e lugares para checar primeiro
- `docs/system-instructions.md` — visão geral e convenções.
- `docs/adr/` — decisões arquiteturais (ex.: auditoria financeira).
- `backend/src/app` — código Laravel (controllers, services, models).
- `frontend/src` — React + TypeScript.
- `docs/collections/reservas` — coleção Bruno / exemplos de requests.
- `public/openapi.yaml` — OpenAPI spec (documentar novos endpoints quando criar).

Convenções importantes (não altere sem confirmação)
- IDs: UUID strings; backend e frontend tratam IDs como strings.
- `property_id` é o escopo ativo e vem no JWT. Serviços e controllers devem usar esse claim.
- Usuários podem ter múltiplas propriedades; há fluxo de troca de propriedade que emite novo JWT.
- Auditoria financeira: tudo que altera valores deve ser registrado em `financial_audit_logs` (append-only). Evite mudanças que violem esse princípio.

Regras de desenvolvimento
- Use `app/Services/*` para lógica de negócio e mantenha controllers finos.
- Ao criar migrations, adicione seeders mínimos para dados necessários em desenvolvimento (ex.: properties/admin user association).
- Escreva testes (PHPUnit) para lógica crítica, especialmente financeira.
- Atualize OpenAPI e a coleção Bruno quando adicionar/alterar endpoints.

Segurança / produção
- Nunca comitar credenciais. Use `.env` e documente variáveis necessárias no `README.md`.
- Jobs e operações assíncronas que alteram estado importante (envio de e‑mail, geração de PDF, gravação de logs) devem usar filas e serem idempotentes quando possível.

Como lidar com pedidos do usuário
- Se o pedido for multi-step (várias alterações no backend e frontend), registre passos no TODO e peça confirmação antes de aplicar grandes migrações.
- Para mudanças sensíveis (auditoria, pagamentos, numeração), proponha um ADR e espere aprovação.

Exemplos de prompts úteis para retomar contexto
- "Leia `docs/system-instructions.md` e `docs/adr/0001-auditoria-financeira.md`. Me dê um plano em 5 passos para implementar a tabela `financial_audit_logs`."
- "Implemente a migration `user_properties` pivot e o endpoint `POST /api/auth/switch-property`, garantindo emissão de novo JWT com claim `property_id`." 

Observações finais
- Este arquivo deve ser mantido curto, atualizado e referenciado no início de qualquer nova sessão com o Copilot.
- Se fizer mudanças neste arquivo, atualize também o `README.md` para apontar onde o Copilot deve buscar instruções.

Commits automáticos e mensagens
- No final de cada ciclo de trabalho (ou quando o assistente julgar apropriado), o Copilot pode criar commits automaticamente das mudanças realizadas.
- Mensagens de commit devem ser curtas (<=72 chars), objetivas e seguir convenções básicas: `feat:`, `fix:`, `docs:`, `test:`, `chore:`. Exemplo: `feat: add invoice preview endpoint`.
- Antes de commitar automaticamente, o Copilot deve:
	- Executar a suíte de testes (backend e frontend).
	- Garantir que novas alterações tenham testes cobrindo a funcionalidade.
	- Atualizar documentação relevante (`docs/`, `README.md`, `public/openapi.yaml`) e coleção Bruno (`docs/collections/reservas`).
	- Gerar mensagem de commit concisa descrevendo o que foi alterado (feature/resumo + arquivos principais).

## Fluxo Git (Trunk-Based Development)

- Mantemos `main` como trunk: sempre em estado "releasable".
- Novas funcionalidades criam branches curtas a partir de `main`: `feature/<descrição-curta>`.
- Quando possível, desenvolva a feature com Feature Flag:
	- Implementação controlada por flag (`feature.<nome>`) para deploy contínuo sem ativação imediata.
	- Flags documentadas em `docs/feature-flags.md`.

Regras de branch/merge
- Crie branch: `feature/<resumo>-<ticket>` (ex.: `feature/partner-invoicing-42`).
- Commits pequenos e atômicos; mensagens no padrão:
	- `feat: adicionar criação de partner`
	- `fix: corrigir cálculo de desconto em reservation`
- Antes do PR:
	- Rodar todos os testes (unit + integration) e gerar cobertura.
	- Atualizar documentação pertinente e collections (Bruno/Postman).
- Workflow de PR:
	- Abra PR contra `main`.
	- CI deve passar (testes + linters).
	- Requer pelo menos 1 aprovação humana (code review).
	- Squash-merge ou merge quando CI e reviews aprovados.
- Após merge:
	- Agent fecha o branch remoto localmente e atualiza o `TODO.md`.

Automação e responsabilidades do agente
- O agente (Copilot) cuidará automaticamente de:
	- Criar branches conforme convenção.
	- Fazer commits com mensagens concisas e padronizadas.
	- Fazer push dos branches.
	- Abrir Pull Requests com descrição do que foi feito e checklist.
	- Atualizar `TODO.md` e documentação referente.
	- Após merge, fechar branch remoto e atualizar logs.
- Operações automáticas respeitam sempre a política de revisão: o agente NÃO faz merge sem CI verde e uma aprovação humana (salvo exceções explicitadas em `docs/release-policy.md`).

Testes e documentação
- Antes de cada commit que altera comportamento: escrever/atualizar testes.
- A cobertura deve ser alta; atualizar relatórios em CI.
- Toda alteração de comportamento requer atualização de `docs/` e `docs/adr/` quando aplica.

Conflitos e rebase
- Agent deverá tentar rebase/sync com `main` antes do PR.
- Em caso de conflito não resolvível automaticamente, o agente abre uma nota/issue para intervenção humana.

## Sempre antes de agir
- Antes de propor ou aplicar qualquer mudança, leia integralmente:
	- `docs/system-instructions.md`
	- todos os arquivos em `docs/adr/`
	- `TODO.md` (na raiz do projeto)
	- `public/openapi.yaml` e a coleção em `docs/collections/reservas` quando a mudança afetar APIs

- Atualize `TODO.md` (arquivo humano) e o `manage_todo_list` (ferramenta) para refletir progresso e mudanças de status. O `manage_todo_list` é a fonte canônica para a automação; `TODO.md` é um snapshot persistido para leitura e retomada humana.

Regra de nomenclatura para testes
- Todos os métodos de teste devem seguir o padrão: `should_[o que espero]_when_[o metodo que estou invocando]_given_[quais parametros ou qual situacao]`.
- Exemplos:
	- `/** @test */ \n public function should_persist_fields_when_create_called_given_valid_data()`
	- `/** @test */ \n public function should_throw_validation_exception_when_create_called_given_conflicting_dates()`
- Use `@test` para que o PHPUnit reconheça métodos que não começam com `test`.

Regras de testes e cobertura
- Objetivo: manter cobertura de testes o mais próxima possível de 100% para lógica crítica, incluindo domínio financeiro.
- Tipos de testes exigidos:
	- Testes unitários para funções/serviços isolados.
	- Testes de integração para fluxos que envolvem DB, jobs e integração entre camadas.
- Evitar mocks sempre que possível. Use dados reais em DB de teste (transaction rollbacks ou refresh database between tests).
- Dados de teste não podem poluir o banco principal: use a configuração de ambiente de testes (`phpunit.xml`, DB_TEST) ou containers separados.
- Ao alterar contratos de API, atualizar imediatamente os testes de integração, OpenAPI (`public/openapi.yaml`) e a coleção Bruno.

Uso do script de commit/teste
- Há um script auxiliar proposto em `scripts/commit_and_test.sh`. O Copilot deve executá-lo antes de commitar mudanças automaticamente. O script executa testes, valida e cria commit com a mensagem fornecida.


## Sempre leia antes de agir

- Antes de propor ou aplicar qualquer mudança, leia integralmente:
  - `docs/system-instructions.md`
  - todos os arquivos em `docs/adr/`
  - `TODO.md` (na raiz do projeto)
  - `public/openapi.yaml` e a coleção em `docs/collections/reservas` quando a mudança afetar APIs

- Atualize `TODO.md` (arquivo humano) e o `manage_todo_list` (ferramenta) para refletir progresso e mudanças de status. O `manage_todo_list` é a fonte canônica para a automação; `TODO.md` é um snapshot persistido para leitura e retomada humana.

```
# Instruções para o GitHub Copilot / Assistente

Propósito
- Este arquivo contém instruções explícitas para o Copilot (ou qualquer assistente) sobre como operar no repositório `reservas`. Deve fornecer contexto suficiente para que, ao iniciar uma nova sessão, o assistente entenda convenções, prioridades e limites sem que você repita tudo.

Comportamento esperado (persona)
- Aja como um par-programador conciso e seguro.
- Antes de modificar arquivos, leia `docs/system-instructions.md` e ADRs em `docs/adr/`.
- Use o `TODO` (gerenciado em `manage_todo_list`) para planejar tarefas multi-step.
- Sempre prefira mudanças pequenas, testáveis e reversíveis.

Arquivos e lugares para checar primeiro
- `docs/system-instructions.md` — visão geral e convenções.
- `docs/adr/` — decisões arquiteturais (ex.: auditoria financeira).
- `backend/src/app` — código Laravel (controllers, services, models).
- `frontend/src` — React + TypeScript.
- `docs/collections/reservas` — coleção Bruno / exemplos de requests.
- `public/openapi.yaml` — OpenAPI spec (documentar novos endpoints quando criar).

Convenções importantes (não altere sem confirmação)
- IDs: UUID strings; backend e frontend tratam IDs como strings.
- `property_id` é o escopo ativo e vem no JWT. Serviços e controllers devem usar esse claim.
- Usuários podem ter múltiplas propriedades; há fluxo de troca de propriedade que emite novo JWT.
- Auditoria financeira: tudo que altera valores deve ser registrado em `financial_audit_logs` (append-only). Evite mudanças que violem esse princípio.

Regras de desenvolvimento
- Use `app/Services/*` para lógica de negócio e mantenha controllers finos.
- Ao criar migrations, adicione seeders mínimos para dados necessários em desenvolvimento (ex.: properties/admin user association).
- Escreva testes (PHPUnit) para lógica crítica, especialmente financeira.
- Atualize OpenAPI e a coleção Bruno quando adicionar/alterar endpoints.

Segurança / produção
- Nunca comitar credenciais. Use `.env` e documente variáveis necessárias no `README.md`.
- Jobs e operações assíncronas que alteram estado importante (envio de e‑mail, geração de PDF, gravação de logs) devem usar filas e serem idempotentes quando possível.

Como lidar com pedidos do usuário
- Se o pedido for multi-step (várias alterações no backend e frontend), registre passos no TODO e peça confirmação antes de aplicar grandes migrações.
- Para mudanças sensíveis (auditoria, pagamentos, numeração), proponha um ADR e espere aprovação.

Exemplos de prompts úteis para retomar contexto
- "Leia `docs/system-instructions.md` e `docs/adr/0001-auditoria-financeira.md`. Me dê um plano em 5 passos para implementar a tabela `financial_audit_logs`."
- "Implemente a migration `user_properties` pivot e o endpoint `POST /api/auth/switch-property`, garantindo emissão de novo JWT com claim `property_id`." 

Observações finais
- Este arquivo deve ser mantido curto, atualizado e referenciado no início de qualquer nova sessão com o Copilot.
- Se fizer mudanças neste arquivo, atualize também o `README.md` para apontar onde o Copilot deve buscar instruções.

Commits automáticos e mensagens
- No final de cada ciclo de trabalho (ou quando o assistente julgar apropriado), o Copilot pode criar commits automaticamente das mudanças realizadas.
- Mensagens de commit devem ser curtas (<=72 chars), objetivas e seguir convenções básicas: `feat:`, `fix:`, `docs:`, `test:`, `chore:`. Exemplo: `feat: add invoice preview endpoint`.
- Antes de commitar automaticamente, o Copilot deve:
	- Executar a suíte de testes (backend e frontend).
	- Garantir que novas alterações tenham testes cobrindo a funcionalidade.
	- Atualizar documentação relevante (`docs/`, `README.md`, `public/openapi.yaml`) e coleção Bruno (`docs/collections/reservas`).
	- Gerar mensagem de commit concisa descrevendo o que foi alterado (feature/resumo + arquivos principais).

Regra de nomenclatura para testes
- Todos os métodos de teste devem seguir o padrão: `should_[o que espero]_when_[o metodo que estou invocando]_given_[quais parametros ou qual situacao]`.
- Exemplos:
	- `/** @test */ \n public function should_persist_fields_when_create_called_given_valid_data()`
	- `/** @test */ \n public function should_throw_validation_exception_when_create_called_given_conflicting_dates()`
- Use `@test` para que o PHPUnit reconheça métodos que não começam com `test`.

Regras de testes e cobertura
- Objetivo: manter cobertura de testes o mais próxima possível de 100% para lógica crítica, incluindo domínio financeiro.
- Tipos de testes exigidos:
	- Testes unitários para funções/serviços isolados.
	- Testes de integração para fluxos que envolvem DB, jobs e integração entre camadas.
- Evitar mocks sempre que possível. Use dados reais em DB de teste (transaction rollbacks ou refresh database between tests).
- Dados de teste não podem poluir o banco principal: use a configuração de ambiente de testes (`phpunit.xml`, DB_TEST) ou containers separados.
- Ao alterar contratos de API, atualizar imediatamente os testes de integração, OpenAPI (`public/openapi.yaml`) e a coleção Bruno.

Uso do script de commit/teste
- Há um script auxiliar proposto em `scripts/commit_and_test.sh`. O Copilot deve executá-lo antes de commitar mudanças automaticamente. O script executa testes, valida e cria commit com a mensagem fornecida.

