# Épico: OpenAPI / Contratos de API

Objetivo: Ter um stub OpenAPI que descreva os endpoints críticos (`/api/reservations`, `/api/invoices`, `/api/payments`, `/api/properties`) e manter o spec atualizado quando contratos mudarem.

Escopo:
- Criar `openapi/openapi.yaml` (stub) com os endpoints principais e exemplos de payloads.
- Validar o spec contra implementações backend e gerar mock server quando necessário.

Critérios de aceite:
- `openapi/openapi.yaml` presente no repositório e referenciado nos docs.
- Processo descrito em `docs/process/backend-change-guidelines.md` para atualizar spec em PRs.
