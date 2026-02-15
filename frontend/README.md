# Frontend - Reservas
````markdown
# Frontend - Reservas

Visão geral

Este diretório contém o frontend da aplicação "Reservas". O frontend é um aplicativo React com TypeScript, pensado desde o início para ser mobile-first, acessível, e fácil de internacionalizar.

Decisões e stack

- Framework: React + TypeScript
- Bundler / scaffold: Vite (projeto inicial baseado em `react-ts` template)
- Design System / UI: Chakra UI (`@chakra-ui/react`) — seleção por ser acessível, mobile-first e facilmente customizável. Usaremos `Skeleton` para estados de carregamento em todas as páginas que fazem fetch.
- Routing: `react-router-dom`
- Data fetching / cache: `@tanstack/react-query` (para isLoading, cache e gerenciamento de fetch)
- HTTP client: `axios` (encapsulado em `src/services/api` quando necessário)
- Internacionalização: `react-i18next`, `i18next` com suporte a `pt-BR`, `es`, `fr`, `en`. Traduções armazenadas em `public/locales/{pt-BR,es,fr,en}`.
- Testes: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `msw` para mocks HTTP em testes.
- Lint & format: `eslint` + `eslint-plugin-react` + `eslint-plugin-jsx-a11y` + `prettier`.
- Acessibilidade: integrar `eslint-plugin-jsx-a11y`, usar `axe` em testes críticos.
- Git hooks: opcionalmente `husky` + `lint-staged` para garantir qualidade pré-commit.

Estrutura sugerida

- `public/locales/{pt-BR,es,fr,en}/common.json` - arquivos de tradução
- `src/main.tsx` - entrypoint, providers (ChakraProvider, QueryClientProvider, I18nextProvider)
- `src/i18n.ts` - configuração do i18n
- `src/theme/` - tema do Chakra (tokens mobile-first)
- `src/pages/` - páginas, cada uma com `index.tsx` e `index.test.tsx` colocados lado a lado
- `src/components/` - componentes reutilizáveis e atômicos
- `src/services/` - `api.ts` (axios client) e clients específicos
- `src/hooks/` - hooks compartilhados

Padrões e convenções

- Mobile-first: breakpoints e design pensados primeira para telas pequenas.
- Acessibilidade: todos os componentes devem seguir boas práticas de `aria-` e passar checagens básicas de `axe`.
- Skeletons: páginas que fazem fetch devem mostrar `Skeleton` ou `SkeletonText` até que os dados carreguem.
- Testes colocated: `*.test.tsx` ao lado do componente/página testada.
- Internacionalização: usar namespaces simples (ex: `common`) e fornecer mecanismo fácil para adicionar novos idiomas (adicionar arquivo JSON em `public/locales/<lang>/` e registrar se necessário).

Comandos úteis

- Instalar dependências:

```bash
cd frontend
npm install
```

- Rodar o servidor de desenvolvimento (eu NÃO executarei este comando sem sua permissão):

```bash
npm run dev
```

- Rodar build:

```bash
npm run build
```

- Rodar testes:

```bash
npm test
# ou com foco
npm run test -- src/pages/Login/LoginPage.test.tsx -t "shows error on failed login"
```

Como adicionar um novo idioma

1. Adicione a pasta `public/locales/<novo-idioma>/` e um arquivo `common.json` com as chaves traduzidas.
2. Atualize a configuração de `i18n.ts` se desejar forçar o idioma suportado ou namespaces extras.
3. Use `useTranslation` nos componentes para acessar as strings.

Próximos passos sugeridos

- Instalar as dependências listadas no `README.md`.
- Configurar `src/main.tsx` com `ChakraProvider`, `QueryClientProvider` (react-query) e `I18nextProvider`.
- Implementar `src/i18n.ts` e criar os arquivos de tradução iniciais.
- Criar uma `LoginPage` de exemplo com skeleton e testes colocated.

Se quiser, eu executo os comandos `npm install` para adicionar as dependências e depois rodo `npm run build` (não rodarei `npm run dev`). Diga para eu prosseguir quando quiser que eu execute os installs e build agora.
````

**AGENT_TODO_JSON**

```json
{
	"repo": {
		"path": ".",
		"frontend_path": "frontend",
		"branch": "chore/design-system-audit",
		"commit_prefix": "chore(frontend)"
	},
	"instructions": "This JSON is intended for an autonomous agent to read and continue frontend work. If the agent cannot push commits it must stop and request credentials.",
	"tasks": [
		{
			"id": "1",
			"title": "Implement routing and PageShell",
			"description": "Create `src/AppRoutes.tsx` and `src/components/PageShell.tsx`. Add routes for '/', '/login' and a skeleton loading UI for pages that fetch data.",
			"commands": [
				"cd frontend",
				"git checkout -b feat/frontend-routing-<initials>",
				"# create files and implement routes",
				"git add src/AppRoutes.tsx src/components/PageShell.tsx",
				"git commit -m \"feat(frontend): add routing and PageShell\""
			],
			"expected_files": ["src/AppRoutes.tsx","src/components/PageShell.tsx"]
		},
		{
			"id": "2",
			"title": "Setup tests and accessibility checks",
			"description": "Add vitest config, Testing Library setup, MSW handlers and integrate `axe` checks in critical tests.",
			"commands": ["cd frontend","# add/verify vitest config","git add vitest.config.* src/setupTests.*","git commit -m \"test(frontend): add vitest and testing setup\""]
		},
		{
			"id": "3",
			"title": "Create LoginPage demo",
			"description": "Implement `src/pages/Login/LoginPage.tsx` using `react-hook-form` + `zod`, show Skeleton while submitting, and colocated tests `LoginPage.test.tsx`.",
			"commands": ["cd frontend","# implement LoginPage and tests","git add src/pages/Login","git commit -m \"feat(frontend): add LoginPage with tests\""]
		},
		{
			"id": "4",
			"title": "CI scripts",
			"description": "Add npm scripts and CI job instructions: lint, test, build, and artifacts. Document expected pipeline steps in README.",
			"commands": ["cd frontend","git add package.json .github/workflows/frontend-ci.yml","git commit -m \"ci(frontend): add CI config and scripts\""]
		},
		{
			"id": "5",
			"title": "Commit & push conventions",
			"description": "Use commit prefix from repo.commit_prefix, create feature branches `feat/...` or `chore/...`. If push fails due to missing credentials, stop and ask human for access.",
			"commands": []
		}
	]
}
```