# ADR 0009 — Organização da documentação e pacote de contexto para agentes

Status: proposta

Contexto
- O repositório possui documentação dispersa (README, CHANGELOG, scripts, alguns docs). Para facilitar onboarding humano e por agentes IA é necessário um pacote de documentação consistente e previsível.

Decisão
- Criar um conjunto padronizado de documentos em raíz: `OVERVIEW.md`, `SETUP.md`, `ARCHITECTURE.md`, `CHECKLIST.md` e um diretório `AGENT_CONTEXT/` que consolida o contexto mínimo necessário para um agente continuar o projeto.

Consequências
- Melhora transferibilidade entre agentes e desenvolvedores humanos.
- Facilita automações (CI que valida presença de docs, geração de releases, etc.).

Alternativas consideradas
- Deixar a documentação dispersa e confiar em README + CHANGELOG — rejeitado porque dificulta transferência de contexto para agentes IA.

Data: 2026-02-06
Autor: automated-docs-agent
