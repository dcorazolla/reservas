# Reservas

Aplicação de reservas para propriedades (hotel/pousada) — backend em Laravel (PHP) e frontend em React + Vite.

Visão geral
- Propósito: gerenciar propriedades, quartos, tarifas e reservas; no roadmap: parceiros e faturamento com auditoria completa.
- Público: operadores de hospedagem e equipe administrativa.

Arquitetura
- Backend: Laravel (PHP) — controllers, services, form requests, Eloquent models.
- Banco: PostgreSQL (UUIDs como PKs). Requer extensão `pgcrypto` para geração de UUIDs.
- Frontend: React + TypeScript + Vite.
- Infra: Docker Compose (app, postgres, pgadmin).

Principais convenções
- IDs: usamos UUIDs (strings) como PKs/FKs em toda a stack.
- `property_id`: claim presente no JWT e usada por controllers/services para escopo.
- Usuários podem ter acesso a múltiplas propriedades (multi-property). Existe endpoint para trocar a propriedade ativa e emitir novo JWT.
- Auditoria financeira: todas operações que afetam valores (invoices, payments, envios) serão registradas em `financial_audit_logs` (append-only, hash-chaining opcional).

Começando (desenvolvimento)
1. Subir containers:

```bash
docker compose up -d
```

2. Rodar migrations/seeders (dentro do container `app`):

```bash
docker compose exec app bash
php artisan migrate --seed
```

3. Frontend (local):

```bash
cd frontend
npm install
npm run dev
```

Testing e utilitários
- Rodar testes PHP:

```bash
docker compose exec app bash
vendor/bin/phpunit
```

Integração com SonarQube (opcional, recomendado)
- O projeto fornece `sonar-project.properties` e um script para enviar relatórios de cobertura ao SonarQube.
- Para gerar coverage e enviar para o SonarQube localmente execute:

```bash
# Inicia os containers (se necessário)
docker compose up -d

# Execute testes + envio ao Sonar (set SONAR_LOGIN se o servidor exigir token)
SONAR_HOST_URL=http://localhost:9000 SONAR_LOGIN="<token>" bash scripts/run_tests_and_sonar.sh
```

- Observações:
	- O script gera um relatório Clover XML em `backend/src/storage/coverage/clover.xml` usado pelo Sonar Scanner.
	- Você pode executar um SonarQube local usando a imagem oficial (ex.: `docker run -d --name sonarqube -p 9000:9000 sonarqube:community`).
	- Em CI preferível executar `sonar-scanner` com variáveis de ambiente `SONAR_HOST_URL` e `SONAR_LOGIN` configuradas.

Arquivos importantes
- `backend/src` — código Laravel.
- `frontend/src` — código React/TS.
- `docs/` — documentação e ADRs (decisões arquiteturais).

Como pedir contexto ao Copilot / novo turno
- Leia `docs/system-instructions.md` antes de reiniciar a conversa com o Copilot.
- A lista de ADRs (`docs/adr/`) e `README.md` contém convenções essenciais (UUID, `property_id`, multi-property, audit logs).

Próximos passos (planejados)
- Implementar domínio de parceiros/faturamento: partners, invoices, payments, PDF/CSV, email e UI administrativa.
- Melhorar navegação do calendário (prev/next/jump e, futuramente, infinite scroll).

Licença
- Código interno do projeto — seguir políticas da organização.
