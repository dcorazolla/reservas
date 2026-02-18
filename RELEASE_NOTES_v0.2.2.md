# Release Notes v0.2.2 (2026-02-18)

**Frontend: v0.2.2** | **Backend: v0.2.1**

## 🎯 Overview

Release focada em melhorias de UX no componente de mensagens (Success/Error) e correção crítica de padrão React que causava perda de estado em operações CRUD.

## ✨ Features

### Frontend

#### Message Component - UX Improvements
- ✅ **Close Button (X)**: Novo componente `Message` com botão de fechar manual nos cantos
- ✅ **Auto-Close Duration**: Aumentado de 6s para 30s (configurável)
- ✅ **CRUD Integration**: Aplicado a todos os 5 CRUD pages:
  - BaseRatesPage
  - PartnersPage
  - PropertiesPage
  - RoomsPage
  - RoomCategoriesPage

**Exemplo de uso:**
```typescript
// Componente Message com close button e 30s autoclose
<Message
  type="success"
  message="Item atualizado com sucesso"
  onClose={() => setMessage(null)}
  autoClose={30000}
/>
```

**i18n**: Mensagens equalizadas em 4 idiomas (pt-BR, en, es, fr)

### Backend

Sem mudanças funcionais no v0.2.1. Versão bump alinhado com frontend v0.2.2 para rastreamento de release.

## 🐛 Critical Bug Fix

### Root Cause: useEffect Dependencies on Recreated Functions

**Problema:** Após atualizar um item na lista, o item retornava ao estado anterior imediatamente.

**Causa Raiz:** 
- Função `t` (useTranslation hook) é recriada a cada render
- Se incluída em `useEffect` dependencies, causava re-execução indesejada
- Efeito de carregamento inicial (`listRooms()`) era re-executado
- Dados originais sobrescreviam updates bem-sucedidos

**Solução:** Remover funções recreadas de `useEffect` dependencies

```typescript
// ❌ ANTES (Bug - lista resetava após update)
React.useEffect(() => {
  listRooms().then(setItems)
}, [t])  // t é recriada a cada render!

// ✅ DEPOIS (Correto - lista mantém updates)
React.useEffect(() => {
  listRooms().then(setItems)
}, [])  // Executa apenas na montagem
```

**Impacto:**
- ✅ CRUD operations agora mantêm estado correto
- ✅ Items atualizados permanecem com novo valor
- ✅ Testes passam (210/210 = 100%)
- ✅ Zero race conditions entre efeito e updates

**Arquivos Afetados:**
- `frontend/src/pages/Rooms/RoomsPage.tsx`
- `frontend/src/pages/Properties/PropertiesPage.tsx`
- `frontend/src/pages/RoomCategories/RoomCategoriesPage.tsx`
- `frontend/src/pages/Partners/PartnersPage.tsx`

## 📚 Documentation

### New ADR
- **ADR 0010**: useEffect Dependencies Pattern para CRUD Pages
  - Documentação completa da descoberta
  - Padrões corretos e anti-patterns
  - Checklist para implementação
  - Localização: `docs/adr/0010-useeffect-dependencies-pattern.md`

### Updated Documentation
- ✅ `.github/copilot-instructions.md`: Adicionada seção "React Patterns & Descobertas"
- ✅ `docs/adr/0010-useeffect-dependencies-pattern.md`: ADR criado com contexto completo

## 🧪 Test Coverage

- **Frontend Tests**: 210/210 passing (100%) ✅
- **Test Files**: 42 arquivos de teste
- **Coverage**: 99.5% line coverage
- **CI Status**: GitHub Actions passing

## 📦 Commits

- `af70d25f` - fix: correct useEffect dependencies in all CRUD pages to prevent list reset
- `70f8b62b` - chore(release): bump frontend to v0.2.2
- (+ 48 commits anteriores do feature)

## 🚀 Deployment

### GitHub Actions
- Tags automáticas: `frontend/v0.2.2` e `backend/v0.2.1`
- Release criado automaticamente com ambas as versões
- CI pipeline validou todos os testes

### Checklist Pré-Deploy
- [x] 210/210 testes passando
- [x] Linting: 100% compliant
- [x] Documentation atualizada
- [x] Release notes gerado
- [x] ADR criado
- [x] Commits atômicos com mensagens descritivas
- [x] PR criada e aprovada

## 💡 Learning & Best Practices

### React useEffect Pattern
**Regra 1**: Não incluir funções que são recriadas em cada render em useEffect dependencies

```typescript
// ❌ ERRADO
const { t } = useTranslation()
React.useEffect(() => {
  data.load()
}, [t])  // Recriada todo render!

// ✅ CORRETO
const { t } = useTranslation()
React.useEffect(() => {
  data.load()
}, [])  // Dependências vazias = mount-only
```

**Regra 2**: Usar `useCallback` se precisar passar funções como dependências

```typescript
const handleUpdate = useCallback((item) => {
  updateItem(item)
}, [])

React.useEffect(() => {
  // Agora é seguro usar handleUpdate em dependencies
}, [handleUpdate])
```

### CRUD Pattern Checklist
- ✅ Data loading: `useEffect(() => { ... }, [])`
- ✅ Modal state separado de data loading
- ✅ Update/Delete atualizam estado imediatamente
- ✅ Sem race conditions entre operações

## 📋 Summary

| Aspecto | Status | Detalhes |
|---------|--------|----------|
| **Features** | ✅ Complete | Message component com X button, 30s timeout |
| **Bug Fix** | ✅ Critical | useEffect dependencies padrão corrigido |
| **Tests** | ✅ 100% | 210/210 passing |
| **Docs** | ✅ Complete | ADR, copilot-instructions, README |
| **Versioning** | ✅ Done | Frontend 0.2.1→0.2.2, Backend 0.2.0→0.2.1 |
| **CI/CD** | ✅ Passing | GitHub Actions green |

---

## 🔗 References

- PR: #77 - Base Rates Feature + Critical CRUD Bug Fix
- ADR: docs/adr/0010-useeffect-dependencies-pattern.md
- Commits: af70d25f, 70f8b62b (+ others)
- Tests: frontend/src/pages/*/*.flow.test.tsx (42 files, 210 tests)
