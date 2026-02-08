# PR / Release Checklist

Use esta checklist ao abrir um PR ou preparar uma release. Itens obrigatórios para garantir qualidade, rastreabilidade e conformidade com políticas do projeto.

- [ ] Todos os testes passam localmente: `./scripts/test-all.sh`
- [ ] Cobertura alvo: proteção mínima de cobertura >= **95%** nas áreas modificadas
- [ ] Testes adicionados/atualizados para novas funcionalidades ou correções (arquivos e paths listados no PR)
- [ ] Documentação atualizada: `OVERVIEW.md`, `SETUP.md`, `ARCHITECTURE.md`, `frontend/TODO.md`, `backend/TODO.md`, `RELEASE_NOTES.md` quando aplicável
- [ ] OpenAPI atualizada (`backend/src/public/openapi.yaml` ou `backend/src/public/openapi.yaml`) se houver mudanças de API
- [ ] ADRs criadas/atualizadas para decisões arquiteturais relevantes (`docs/adr/`)
- [ ] Bruno / Postman collection atualizada (`docs/collections/reservas/`) quando aplicável
- [ ] Migrations e seeders incluídos para mudanças em DB
- [ ] Commit messages seguindo convenção (`feat:`, `fix:`, `docs:`, `chore:`)
- [ ] Atualizar `RELEASE_NOTES.md` no subprojeto correspondente (frontend/backend)
- [ ] Bump de versões seguindo SemVer nos subprojetos (`backend` e `frontend`) quando houver mudanças incompatíveis/novas features; atualizar `package.json`/`composer.json` e arquivos de versão correspondentes antes do push
- [ ] Caso sensível (pagamentos/auditoria), incluir referência a `financial_audit_logs` e validações adicionais

- [ ] Atualizar collections e exemplos (Postman/Insomnia) em `docs/collections/reservas/` quando endpoints ou payloads mudarem
- [ ] Executar cobertura de testes e garantir que alterações têm testes unitários e/ou feature; busque cobertura mínima na área alterada conforme política do projeto
- [ ] Push do branch remoto: `git push origin <branch>` e abrir PR com descrição clara das mudanças e links para docs e issues
- [ ] Não realizar merge manual: aguardar CI (pipeline) passar — quando o pipeline estiver verde, realizar merge via interface e marcar `merged` no PR; se a pipeline falhar, resolver antes de mesclar

- [ ] Antes de qualquer push/PR: Atualizar changelog (`CHANGELOG.md`, `backend/RELEASE_NOTES.md`, `frontend/RELEASE_NOTES.md`) e documentação relevante (`docs/`, `docs/collections/reservas/`). Incluir notas de versão com resumo de breaking changes, migrations necessárias e instruções de rollout.

Rationale
- Esta checklist consolida orientações pré-existentes em `docs/process` e em guidelines internas. Ela é requerida antes de aceitar merges no `main`.
