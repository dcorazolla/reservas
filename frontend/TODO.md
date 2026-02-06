# TODO - Frontend

Este arquivo lista tarefas e informação mínima para iniciar o frontend a partir do zero.

- Versão atual: `0.1.0`
- Como iniciar (resumo):
  - Instalar dependências: `npm ci`
  - Rodar dev: `npm run dev`
  - Executar testes: `npm test` (Vitest)

- Tarefas imediatas:
  - [ ] Verificar integração com backend (endpoints e CORS)
  - [ ] Atualizar `public` e `openapi` se endpoints mudarem
  - [ ] Garantir que testes de acessibilidade (`*.a11y.test.tsx`) passam em CI

- Notas para um agente IA que começa do zero:
  - `package.json` contém scripts básicos (`dev`, `build`, `test`).
  - `vitest.setup.ts` inclui polyfills necessários para testes.
  - Componentes críticos: `src/components/Modal`, `src/pages/Reservation`.

Sempre mantenha este arquivo sincronizado com o `manage_todo_list` do repositório.

-- Tarefas distribuídas do `TODO.md` raiz --

- **Planejar telas (frontend)**
  - [ ] Mapear telas: Parceiros (CRUD), Reservas do Parceiro (filtro/seleção), Gerar Fatura modal, Faturas (lista/detalhe), Registrar Pagamento modal, downloads (PDF/CSV), envio de e-mail e UI de auditoria.

- **Implementar UI Parceiros**
  - [ ] Implementar telas para CRUD de parceiros e adicionar `partner` select no formulário de reserva (create/update).

- **Implementar geração de faturas (UI)**
  - [ ] Criar workflow: selecionar parceiro+período → revisar reservas candidatas → confirmar → criar invoice; UI para enviar por e-mail e editar destinatários.

- **Registrar/aplicar pagamentos (UI)**
  - [ ] Implementar modais/formulários para registrar pagamentos e alocação por linha; atualizar estado da fatura na UI.

- **Adicionar log de comunicações (frontend)**
  - [ ] Interface para visualizar `invoice_communications` e status de envio.

- **Calendar (frontend)**
  - [ ] Adicionar controles de navegação: prev/next, jump-to-date, step size e botão 'Hoje'.
  - [ ] Planejar melhoria de performance (infinite scroll) como v2.

- **Troca de propriedade no menu (frontend)**
  - [ ] Mostrar propriedade atual no menu; permitir troca via dropdown/modal que chama `POST /api/auth/switch-property` e atualiza token.

- **Testes e QA (frontend)**
  - [ ] Garantir testes a11y e de integração nas telas críticas; meta de cobertura conforme política (>=95% em áreas alteradas).
  - [ ] Checklist de QA manual: criar parceiro, gerar fatura, exportar e simular envio de e-mail, registrar pagamento parcial/total, verificar trilha de auditoria.

- **OpenAPI / consumo**
  - [ ] Atualizar cliente/consumo conforme `openapi/openapi.yaml` (ou adaptar fetch/axios calls) quando a API for atualizada.

