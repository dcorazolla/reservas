# Instruções do Sistema e Contexto para Copilot

Objetivo deste arquivo
- Fornecer um único ponto de referência com propósito do sistema, funcionalidades, regras já definidas, convenções e informações necessárias para que o Copilot (ou qualquer desenvolvedor) retome o contexto sem repetição.

Resumo do sistema
- Nome: Reservas
- Propósito: sistema de gestão de propriedades (quartos, tarifas, reservas) com domínios adicionais planejados: parceiros e faturamento.

Funcionalidades principais
- CRUD de propriedades, quartos e categorias.
- Gestão de tarifas por quarto/categoria e períodos.
- Reservas: disponibilidade, criação, atualização e cancelamento.
- Autenticação: JWT com claim `property_id` que define o escopo ativo.
- Frontend: painel em React para usuários administrativos.

Decisões e convenções importantes
- UUIDs: todas as chaves primárias e foreign keys são UUIDs (strings).
- `property_id` no JWT: o token contém a propriedade ativa do usuário. Serviços e controllers devem usar esse claim para filtrar dados por propriedade.
- Usuários multi-propriedade: usuários podem ser atribuídos a várias propriedades. Há endpoint para trocar a propriedade ativa que retorna um novo JWT com o `property_id` selecionado.
- Auditoria financeira (essencial): todas ações que alteram valores monetários serão registradas em `financial_audit_logs` como append-only. Logs devem incluir informações de actor, timestamp, payload e hashes para tamper-evidence.

Fluxos importantes
- Trocar propriedade ativa (backend): `POST /api/auth/switch-property` — recebe `property_id` (UUID), valida se o usuário tem acesso e retorna novo JWT com claim `property_id` e, opcionalmente, refresh token.
- Gerar fatura (planejado): endpoint que recebe `partner_id` + período, retorna preview (reservas candidatas + totals) e, após confirmação, cria invoice e linhas, grava evento no audit log e opcionalmente envia e‑mail.

Regras de estilo e boas práticas para futuros commits
- Mantenha mudanças pequenas e focadas por PR; inclua testes unitários quando possível.
- Mantenha compatibilidade com UUID strings (evite castings para int em controllers/services).
- Use Services para lógica de negócio complexa; Controllers devem ser finos.
- Observe padrões existentes em `app/Services` e `app/Http/Controllers/Api`.

Nomenclatura de testes
- Use o padrão: `should_[o que espero]_when_[o metodo que estou invocando]_given_[quais parametros ou qual situacao]` para todos os métodos de teste.
- Ao usar esse padrão, adicione `/** @test */` acima do método para que o PHPUnit execute o teste (já que o método não começa com `test`).

Regras de testes e commits automáticos
- Testes: todas mudanças devem incluir testes. Objetivo de cobertura: o mais próximo possível de 100% para lógica crítica (especialmente financeira). Preferir:
	- Testes unitários para funções e services.
	- Testes de integração para operações que tocam DB, jobs ou múltiplas camadas.
- Evitar mocks quando possível; utilize DB de testes e transaction rollbacks para isolar testes.
- Dados de testes não podem poluir o banco do sistema — use `phpunit.xml` e/ou containers separados para ambiente de testes.
- Commits automáticos: o assistente pode criar commits no final de ciclos de trabalho. Antes de commitar automaticamente, executar a suíte de testes, atualizar documentação e a coleção Bruno, e produzir mensagem de commit curta seguindo convenções (`feat:`, `fix:`, `docs:`, `test:`).


Onde procurar contexto rápido
- ADRs: `docs/adr/` — decisões arquiteturais.
- Esquemas e coleção de API: `docs/` (OpenAPI em `public/openapi.yaml`) e coleção Bruno em `docs/collections/reservas`.
- Código backend: `backend/src/app`.
- Código frontend: `frontend/src`.

Informações para Copilot em novas sessões
- Antes de sugerir mudanças, verifique `docs/adr/` e `docs/system-instructions.md`.
- Se for criar endpoints, adicione/atualize OpenAPI e coleções Bruno.
- Ao mexer no domínio financeiro, registre todas as ações relevantes no `financial_audit_logs` e adicione testes de regressão.
