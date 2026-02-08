# TASKS

Backlog priorizado (curto prazo)

1. Garantir CI de acessibilidade (a11y)
   - O que: ativar job `a11y` no workflow frontend e verificar que testes `*.a11y.test.tsx` rodem na pipeline.
   - Critério de aceite: job existe no CI e passa em branch de PR.

2. Criar OpenAPI stub e validar endpoints principais
   - O que: gerar `openapi/openapi.yaml` com endpoints: `/api/reservations`, `/api/invoices`, `/api/payments`, `/api/properties`.
   - Critério de aceite: spec revisada e colocada no repositório; PR com mudanças do spec.

3. Formalizar ADRs críticos
   - O que: criar ADRs para auditoria financeira, versionamento, e convenções de branch.
   - Critério de aceite: `docs/adr/` tem ADRs numerados e explicativos.

4. Padronizar documentação de setup e arquitetura
   - O que: preencher `OVERVIEW.md`, `SETUP.md`, `ARCHITECTURE.md` (feito) e atualizar `README.md` com links.
   - Critério de aceite: documentação revisada e PR aprovada.

5. Melhorar cobertura de testes frontend
   - O que: adicionar testes a11y nas páginas críticas e integrar ao CI.
   - Critério de aceite: cobertura mínima definível e testes a11y rodando no CI.

Como pegar tarefas
- Cada tarefa deve ter CLI steps (ex.: comando para rodar testes), arquivos a alterar e critérios de aceite claros.
- Ao finalizar uma tarefa crie PR com descrição e checklist preenchido.
