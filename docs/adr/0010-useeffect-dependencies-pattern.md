# ADR 0010: useEffect Dependencies Pattern para CRUD Pages

## Status
Accepted (2026-02-18) - Implementado em produção após descoberta de bug crítico

## Context

Durante implementação do Message Component e aplicação a todas as CRUD pages, descobrimos um padrão de bug em todas as páginas (RoomsPage, PropertiesPage, RoomCategoriesPage):

1. Após atualizar um item (ex: "Room A" → "Room A Updated"), a lista era imediatamente resetada
2. O item atualizado desaparecia e retornava ao estado anterior
3. Testes falhavam com "Unable to find element with text: Room A Updated"
4. A causa raiz: `useEffect` de carregamento inicial estava sendo re-executado

### Root Cause Analysis

```typescript
// ❌ PROBLEMA - useEffect com [t] como dependência
React.useEffect(() => {
  let mounted = true
  setLoading(true)
  roomsService.listRooms()
    .then((data) => {
      if (!mounted) return
      setItems(data)  // Reseta items para valores iniciais
    })
    .finally(() => {
      if (mounted) setLoading(false)
    })
  return () => { mounted = false }
}, [t])  // ← t é recriada a CADA render!
```

**Por que `t` causava re-execução?**
- A função `t` (tradução) é criada novo a cada render do componente
- React compara `t` atual vs. dependência anterior
- Objetos/funções são sempre "diferentes" por referência
- Resultado: efeito re-executa, chamando `listRooms()` novamente
- O `setItems(data)` da chamada anterior sobrescreve o update bem-sucedido

### Timeline do Bug

1. **Execução Normal:**
   - Mount: `listRooms()` → `setItems([{id: 'r-1', name: 'Room A', ...}])`
   - Usuário clica Edit
   - Modal abre, usuário muda name para "Room A Updated"
   - Usuário clica Save
   - `handleSave()` → `setItems((s) => s.map(it => it.id === id ? updatedRoom : it))`
   - React batch updates: modal fecha, lista atualiza

2. **Com Bug `[t]`:**
   - Após `setItems` com Room A Updated, componente re-renderiza
   - `t` função é recriada
   - `useEffect` detecta dependência mudou
   - `useEffect` re-executa → chama `listRooms()` novamente
   - Resposta vem do mock com dados originais `[{id: 'r-1', name: 'Room A', ...}]`
   - `setItems()` sobrescreve com dados antigos
   - Lista mostra "Room A" novamente!

## Decision

**Use dependency array vazio `[]` para useEffect que carrega dados iniciais em CRUD pages.**

### Regras:

1. **Data Loading Effects - `[]` (mount only)**
   ```typescript
   React.useEffect(() => {
     // Carregamento inicial
     listRooms().then(setItems)
   }, [])  // ✅ Executa apenas uma vez
   ```

2. **Se precisar de tradução/i18n no efeito:**
   ```typescript
   // ✅ CORRETO - Guardar t fora do efeito
   const { t } = useTranslation()
   React.useEffect(() => {
     // Use t aqui, mas não coloque em dependências
     console.log(t('rooms.page.title'))
   }, [])
   ```

3. **Para cleanup - use callback/event ao invés de efeito:**
   ```typescript
   // ✅ CORRETO - handleSave fecha a modal explicitamente
   async function handleSave(data) {
     await api.update(data)
     setItems(prev => prev.map(it => it.id === data.id ? data : it))
     setIsModalOpen(false)  // Explícito, não via efeito
   }
   ```

## Consequences

### Positivos
- ✅ CRUD pages mantêm estado correto após operações
- ✅ Items atualizados permanecem na lista com novo valor
- ✅ Testes passam (210/210)
- ✅ Sem race conditions entre efeito de carregamento e updates
- ✅ Performance: efeito executa apenas uma vez

### Negativos
- ⚠️ Se tradução precisar mudar dinâmicamente, precisa de efeito separado
- ⚠️ Deve usar `useCallback` se passando funções como dependências

### Mitigação
- Se mudança de idioma precisar recarregar dados: criar efeito separado com `[selectedLanguage]`
- Documentar padrão em ADRs e instruções do copilot (feito)

## Implementation

### Afetados
- `frontend/src/pages/Rooms/RoomsPage.tsx`
- `frontend/src/pages/Properties/PropertiesPage.tsx`
- `frontend/src/pages/RoomCategories/RoomCategoriesPage.tsx`
- `frontend/src/pages/Partners/PartnersPage.tsx`

### Mudança
```diff
- }, [t])
+ }, [])
```

Todas as 4 páginas CRUD tiveram `useEffect` corrigido no commit `af70d25f`.

## Compliance Checklist

- [x] Documentado em ADRs
- [x] Documentado em `.github/copilot-instructions.md`
- [x] Testes passando (210/210)
- [x] Code review ready
- [x] Exemplos fornecidos em documentação

## References

- Commit: `af70d25f` - fix: correct useEffect dependencies in all CRUD pages
- Issue: Afeta PR #77 - Base Rates Feature
- React Docs: https://react.dev/reference/react/useEffect
