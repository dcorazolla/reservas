# PR / Release Checklist

Use esta checklist ao abrir um PR ou preparar uma release. Itens obrigatórios para garantir qualidade, rastreabilidade e conformidade com políticas do projeto.

- [ ] Todos os testes passam localmente: `./scripts/test-all.sh`
- [ ] Cobertura alvo: proteção mínima de cobertura >= **95%** nas áreas modificadas
- [ ] Testes adicionados/atualizados para novas funcionalidades ou correções (arquivos e paths listados no PR)
- [ ] Documentação atualizada: `OVERVIEW.md`, `SETUP.md`, `ARCHITECTURE.md`, `frontend/TODO.md`, `backend/TODO.md`, `RELEASE_NOTES.md` quando aplicável
- [ ] OpenAPI atualizada (`openapi/openapi.yaml` ou `public/openapi.yaml`) se houver mudanças de API
- [ ] ADRs criadas/atualizadas para decisões arquiteturais relevantes (`docs/adr/`)
- [ ] Bruno / Postman collection atualizada (`docs/collections/reservas/`) quando aplicável
- [ ] Migrations e seeders incluídos para mudanças em DB
- [ ] Commit messages seguindo convenção (`feat:`, `fix:`, `docs:`, `chore:`)
- [ ] Atualizar `RELEASE_NOTES.md` no subprojeto correspondente (frontend/backend)
- [ ] Caso sensível (pagamentos/auditoria), incluir referência a `financial_audit_logs` e validações adicionais

Rationale
- Esta checklist consolida orientações pré-existentes em `docs/process` e em guidelines internas. Ela é requerida antes de aceitar merges no `main`.
