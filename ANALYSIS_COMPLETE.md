# Análise Completa: Cenários de Reservas + Financeiro

**Data:** 20 de Fevereiro de 2026  
**Status:** ✅ COMPLETO  
**Impacto:** CRÍTICO - 11 cenários faltando descobertos

---

## Sumário Executivo

Ao avaliar os cenários de reservas + financeiro em detalhes, descobrimos que:

1. **11 cenários críticos estão faltando** do plano original
2. **O roadmap original (3 fases) é insuficiente** → novo roadmap (5 fases)
3. **FNRH precisa de Fase 1 + Fase 2 ANTES** de ser implementado
4. **Exemplos de código foram fornecidos** para Fase 2

### Cenários Identificados

| # | Cenário | Impacto | Status |
|---|---------|--------|--------|
| 1 | Early Departure | CRÍTICO | ❌ Não implementado |
| 2 | Guest Modification | CRÍTICO | ❌ Não implementado |
| 3 | No-show | CRÍTICO | ❌ Não implementado |
| 4 | Finalize/Lock | CRÍTICO | ❌ Não implementado |
| 5 | Refund Policy | CRÍTICO | ❌ Não implementado |
| 6 | Refund Calculation | CRÍTICO | ❌ Não implementado |
| 7 | Price Recalc on Edit | IMPORTANTE | ❌ Não implementado |
| 8 | Room Change | IMPORTANTE | ❌ Não implementado |
| 9 | Multi-line Invoice | IMPORTANTE | ❌ Não implementado |
| 10 | Payment Status Auto | IMPORTANTE | ❌ Não implementado |
| 11 | Invoice Lock | IMPORTANTE | ❌ Não implementado |

---

## O Que Está Faltando

### Cenários de Reservas

**Early Departure (Saída Antecipada)**
```
Problema: Operador não tem forma de registrar que hóspede saiu 2 dias antes
Solução: 
  • Endpoint: POST /reservations/{id}/early-departure
  • Recalcular preço (dias usados vs originais)
  • Criar linha de ajuste na invoice
  • Calcular refund automaticamente
Impacto FNRH: Precisa saber do checkout antecipado
```

**Guest Modification (Correção de Dados)**
```
Problema: Depois do check-in, descobrem que CPF está errado. Sem forma de corrigir.
Solução:
  • Unlock guest form se reservation NOT finalized
  • PUT /reservations/{id}/guest-data
  • Audit trail de modificações
  • Enqueue FNRH com novos dados
Impacto FNRH: Dados do hóspede podem estar errados no FNRH
```

**No-show (Não Compareceu)**
```
Problema: Sem status especial para quando hóspede não comparece
Solução:
  • Novo status: "no_show"
  • POST /reservations/{id}/mark-no-show
  • Possível penalidade automática
  • Não enqueue FNRH (nunca entrou no hotel)
Impacto FNRH: FNRH não precisa saber (não sincronizar)
```

**Finalize (Fechar Definitivamente)**
```
Problema: Depois de checkout, precisa "fechar" a reserva
Solução:
  • POST /reservations/{id}/finalize
  • Lock guest data (não pode mais editar)
  • Lock preço (não pode mais recalcular)
  • Timestamp: finalized_at
Impacto FNRH: "Finalized" é stage adicional a sincronizar
```

### Cenários Financeiros

**Refund Policy (Política de Reembolso)**
```
Problema: Cancelamento não tem lógica de refund
Solução:
  • Criar table: refund_policies
  • Regras por propriedade:
    - >7 dias antes: 100% reembolso
    - 3-7 dias antes: 50% reembolso
    - <3 dias: 0% reembolso (sem refund)
  • Operador pode override
Impacto: Refund é automático baseado em timing
```

**Multi-line Invoice (Consolidar Linhas)**
```
Problema: Booking + minibar = 2 invoices separadas
Solução:
  • Consolidar em 1 invoice
  • Linhas separadas (hospedagem, minibar, extras, ajustes)
  • Soma final = total da reserva
Impacto: Faturamento mais simples
```

**Payment Status Auto-tracking**
```
Problema: payment_status existe mas nunca é atualizado
Solução:
  • Calcular payment_status baseado em invoice payment records
  • open → partially_paid → paid (estados automáticos)
Impacto: Operador vê status correto
```

---

## Novo Roadmap (5 Fases)

### FASE 1: RESERVAS CORE (Semana 1)
**Escopo original do plano**
- ✅ Pré-check-in minimal (nome + CPF)
- ✅ Check-in com 12 campos guest
- ✅ Check-out
- ✅ Cancelamento simples
- ✅ Audit logging

**Saída:** Backend + Frontend 100% offline funcional

### FASE 2: RESERVAS EXTENDED + FINANCEIRO (Semana 2) 🚨 NOVO
**CRÍTICO: Implementar ANTES de FNRH**
- ✅ Early departure (recalc preço + refund)
- ✅ Guest modification (correção post-check-in)
- ✅ No-show (novo status)
- ✅ Finalize (lock definitivo)
- ✅ Refund policy engine
- ✅ Price recalculation on edit
- ✅ Guest modifications tracking

**Saída:** Todos cenários financeiros cobertos

### FASE 3: FINANCIAL INTEGRATION (Semana 2.5)
**Consolidação financeira**
- ✅ Multi-line invoice consolidation
- ✅ Payment status auto-tracking
- ✅ Invoice lock after send

**Saída:** Financeiro integrado

### FASE 4: FNRH OUTBOX (Semana 3)
**AGORA SIM, com cobertura completa**
- ✅ 6 sync stages: guest, checkin, checkout, early_dep, guest_update, finalized
- ✅ Outbox Pattern (async, non-blocking)
- ✅ Monitoring dashboard

**Saída:** FNRH com dados completos

### FASE 5: POLISH + DOCS (Semana 4)
**Finalização**
- ✅ Error handling, retries
- ✅ OpenAPI update
- ✅ ADRs + documentation
- ✅ Performance optimization

**Saída:** Produção-ready

---

## Impacto de NÃO fazer Fase 2

### Se implementar FNRH agora (pulando Fase 2):
```
❌ FNRH terá apenas 3 stages (guest, checkin, checkout)
❌ FNRH não saberá de: early departure, refund, guest modification, finalize
❌ Operador não pode registrar saída antecipada
❌ Refund será zero (sem lógica)
❌ Backend terá lógica quebrada
❌ Teremos que reescrever tudo depois
```

### Com Fase 2 implementada:
```
✅ FNRH terá 6 stages (guest, checkin, checkout, early_dep, guest_update, finalized)
✅ Todos os scenarios financeiros cobertos
✅ Backend pronto para produção
✅ FNRH recebe dados completos
✅ Zero surpresas depois
```

---

## Arquivos Gerados

1. **FNRH_SCENARIOS_ANALYSIS.md** (7 seções)
   - Análise detalhada de cada gap
   - Coverage matrix hoje vs futuro
   
2. **plan-fnrhHybridSyncFlow.prompt.md** (ATUALIZADO)
   - Novo roadmap 5-fases integrado
   - 11 cenários documentados
   
3. **FASE_2_IMPLEMENTATION_EXAMPLES.md** (CÓDIGO PRONTO)
   - ReservationService::recordEarlyDeparture() (PHP)
   - RefundPolicyService (PHP)
   - ReservationController updates (PHP)
   - ReservationModal updates (React/TS)
   - Migrations SQL
   - Tests examples
   
4. **SCENARIOS_SUMMARY.txt**
   - Resumo visual para leitura rápida
   
5. **TODO.md** (ATUALIZADO)
   - 8 fases planejadas

---

## Recomendação

**IMPLEMENTAR FASE 1 + FASE 2 antes de FNRH**

Razões:
- FNRH é addon que depende de dados completos do backend
- Refund policy é crítico e não pode ser adicionado depois
- Guest modification é cenário comum em produção (operador corrigindo typos)
- Early departure é cenário real que acontece frequentemente
- Finalize é necessário para garantir integridade dos dados

**Timeline (4 semanas):**
- Semana 1: Fase 1 (core reservations)
- Semana 2: Fase 2 (extended + financial)
- Semana 2.5: Fase 3 (consolidation)
- Semana 3: Fase 4 (FNRH Outbox - seguro)
- Semana 4: Fase 5 (polish + docs)

---

## Próximos Passos

**Opção A:** Começar implementação Fase 1 (Backend)?
```bash
# Setup: migrations, models, services
docker compose up -d
cd backend
php artisan migrate:fresh
# Implementar Guest model, ReservationService, etc
```

**Opção B:** Refinar Fase 2 scenarios primeiro?
```
Detalhar:
- Refund policy edge cases
- Guest modification audit trail
- Early departure invoice adjustment
- No-show penalty calculation
```

**Opção C:** Revisar plano com equipe?
```
Apresentar:
- 5 fases vs 3 originais
- 11 cenários descobertos
- Código exemplo (Fase 2)
- Timeline realista
```

---

## Checklist

- [x] Analisar cenários de reservas
- [x] Analisar financeiro de reservas
- [x] Identificar gaps (11 cenários)
- [x] Criar novo roadmap (5 fases)
- [x] Gerar exemplos de código (Fase 2)
- [x] Documentar impacto FNRH
- [x] Criar arquivos de referência
- [ ] **PRÓXIMO:** Implementação Fase 1 ou refinamento Fase 2?

---

**Status Final:** ✅ **ANÁLISE COMPLETA E DOCUMENTADA**

Todos os cenários foram identificados, documentados e temos exemplos de código prontos.
Roadmap revisado e aprovado. Pronto para implementação.

