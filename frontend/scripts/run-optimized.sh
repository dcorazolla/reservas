#!/bin/bash
# Script para rodar npm com limite de memória

export NODE_OPTIONS="--max-old-space-size=512 --no-warnings"

case "$1" in
  dev)
    echo "🚀 Iniciando dev server com 512MB RAM..."
    npm run dev
    ;;
  build)
    echo "🔨 Buildando com 512MB RAM..."
    npm run build
    ;;
  test)
    echo "🧪 Rodando testes com single-thread..."
    npm test -- --run --reporter=verbose
    ;;
  *)
    echo "Uso: ./scripts/run-optimized.sh [dev|build|test]"
    exit 1
    ;;
esac
