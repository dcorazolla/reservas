# 🚀 Otimizações para Máquinas com RAM Limitada

Se o VS Code/agente trava durante build ou testes, use estas otimizações:

## 📋 Soluções Implementadas

### 1. **Limite de Memória Node.js**
- `.npmrc` configura max-old-space-size=512MB
- Automaticamente aplicado em todos os comandos npm

### 2. **Vite Config Otimizado**
- HMR remoto para dev server
- esbuild minifier (mais rápido)
- Sem sourcemap em build
- Manual chunks para melhor cache

### 3. **Vitest Otimizado**
- Single-thread mode (não usa multiprocessing)
- Reduz overhead de threads
- Mais lento mas muito mais estável

### 4. **Scripts de Execução**

```bash
# Usar script otimizado (recomendado)
./frontend/scripts/run-optimized.sh dev      # Dev server
./frontend/scripts/run-optimized.sh build    # Build
./frontend/scripts/run-optimized.sh test     # Testes

# OU variáveis de ambiente diretas
export NODE_OPTIONS="--max-old-space-size=512"
npm run dev
```

## 🎯 Limites Recomendados por RAM Disponível

| RAM Disponível | Node Max | Vite | Vitest |
|---|---|---|---|
| 2GB | 512MB | --skip-build | single-thread |
| 4GB | 1024MB | normal | single-thread |
| 8GB+ | 2048MB | normal | multi-thread |

## ⚙️ Outras Dicas

1. **Feche abas desnecessárias** no VS Code
2. **Desabilite extensões pesadas** (prettier, eslint em tempo real)
3. **Use apenas 1 terminal** rodando dev/build por vez
4. **Considere usar WSL2** se em Windows (melhor gerenciamento de RAM)

## 📊 Monitoramento

Monitore uso de RAM enquanto roda:

```bash
# Linux/Mac
watch -n 1 'ps aux | grep node'

# Verificar limite aplicado
node -e "console.log(require('v8').getHeapStatistics().heap_size_limit / 1024 / 1024, 'MB')"
```

## 🔧 Se Ainda Travar

1. Reduza NODE_OPTIONS para 256MB
2. Use `npm ci` em vez de `npm install` (mais rápido)
3. Rode testes sem coverage: `npm test -- --run --no-coverage`
4. Build incrementalmente: `npm run build -- --incremental`

---

Implementado em: 2026-02-18
