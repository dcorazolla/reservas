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
- Flags (ícones): escolhemos `flag-icons` para exibir bandeiras no `LanguageSelector`.
	- Por que: é uma dependência leve, evita manter SVGs manualmente e fornece classes CSS simples (`fi fi-xx`).
	- Instalação: `npm install flag-icons` (já adicionada como dependência opcional no `package.json`).
	- Uso: importamos `flag-icons/css/flag-icons.min.css` em `src/main.tsx` e mapeamos locales para códigos de país (`pt-BR -> br`, `en -> us`, `es -> es`, `fr -> fr`).
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

- Arquivos de teste: os arquivos de teste devem sempre ficar na mesma pasta do arquivo que está sendo testado (tests colocated). Ex.: `src/components/MeuComponente/MeuComponente.tsx` e `src/components/MeuComponente/MeuComponente.test.tsx`.
- Cobertura obrigatória: todas as páginas e componentes devem ter testes cobrindo 100% dos componentes e fluxos possíveis (unidades + interações críticas). Testes devem incluir caminhos de sucesso, falha e casos extremos.
- CSS e estilos:
	- É proibido usar CSS inline. Todos os estilos devem residir em arquivos CSS/SCSS separados no mesmo nível do componente/página, seguindo o padrão `meu-componente.css` (ou `meu-componente.module.css` se preferir CSS Modules).
	- Valores padrão (cores, tamanhos, fontes, espaçamentos, etc.) devem ser configurados como variáveis CSS globais (ex.: `:root { --brand-500: #123456; --space-4: 1rem; }`) e consumidos pelos arquivos CSS específicos de páginas/componentes.
	- Prefira classes CSS a estilos inline; componentes podem usar utility props do design system quando apropriado, mas não devem injetar estilos inline que prejudiquem reutilização.
- Mobile first: o front é mobile-first — comece o CSS para telas pequenas e adicione breakpoints progressivamente para tablet/desktop.
- Internacionalização (i18n): o front é internacionalizado; todas as strings visíveis ao usuário devem vir de `i18n` (ex.: `useTranslation('common')`). Não hardcodear strings.
- Acessibilidade: o front é acessível — siga práticas ARIA, labels explícitos, foco visível, navegação por teclado e inclua checagens de `axe` nos testes críticos.
- Responsividade e compatibilidade:
	- O front deve funcionar bem em celular, tablet e computador (layout e touch targets apropriados).
	- O front deve funcionar corretamente nos navegadores usados no mercado (Chrome, Firefox, Safari, Edge). Testes E2E ou verificações manuais precisam validar os navegadores alvo definidos pela equipe.
- Reutilização: prefira sempre usar componentes já existentes do design system ou componentes compartilhados a reinventar a roda. Crie novos componentes apenas quando necessário e documente-os.
- Cargas assíncronas: todos os componentes/páginas que fazem carga assíncrona devem usar `Skeleton` (ou equivalente) para placeholders de carregamento, garantindo layout estável e experiência consistente.
- Temas: o front deve suportar os temas `normal`, `escuro` (dark) e `alto contraste` (high-contrast). As variáveis CSS e tokens de tema devem ser a fonte da verdade para cores e contrastes.

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

Fluxo de Git (CLI recomendado)

- **Use a CLI `gh` em vez do GitKraken**: este repositório adota o uso da GitHub CLI (`gh`) para operações remotas (abrir PRs, criar rascunhos, fazer review). Evite usar clientes GUI que alterem branches ou façam pushes automáticos sem revisão.
- **Criar branch e abrir PR** (exemplo):

```bash
cd frontend
git checkout -b feat/properties-page
git add <arquivos-alterados>
git commit -m "feat(frontend): add properties CRUD page (início)"
git push --set-upstream origin feat/properties-page
# criar PR com título e descrição a partir da branch
gh pr create --fill
```

- **Dicas**:
	- Use `gh pr view --web` para abrir o PR no browser.
	- Use `gh auth login` se precisar autenticar a CLI.
	- Prefira criar PRs pequenos e descreva o escopo e testes realizados.


Como adicionar um novo idioma

1. Adicione a pasta `public/locales/<novo-idioma>/` e um arquivo `common.json` com as chaves traduzidas.
2. Atualize a configuração de `i18n.ts` se desejar forçar o idioma suportado ou namespaces extras.
3. Use `useTranslation` nos componentes para acessar as strings.

Próximos passos sugeridos

- Instalar as dependências listadas no `README.md`.
- Configurar `src/main.tsx` com `ChakraProvider`, `QueryClientProvider` (react-query) e `I18nextProvider`.
- Implementar `src/i18n.ts` e criar os arquivos de tradução iniciais.
- Criar uma `LoginPage` de exemplo com skeleton e testes colocated.

Autenticação (JWT) e rotas protegidas

- Implementação atual: adicionamos suporte a autenticação JWT no frontend.
	- `src/services/api.ts` cria uma instância axios e fornece `setAuthToken`.
	- `src/services/auth.ts` contém `loginRequest`, `saveToken`, `removeToken` e `loadToken` helpers.
	- `src/contexts/AuthContext.tsx` expõe `AuthProvider` e `useAuth()` com `login()` e `logout()`.
	- `src/AppRoutes.tsx` protege a rota raiz (`/`) com `RequireAuth` e mantém `/login` pública.
	- `src/pages/Home.tsx` é o template básico exibido após login (protegido).

- Como usar localmente:
	1. Garanta o backend rodando (você mencionou que o `docker compose up` já está ativo).
	2. Ajuste a variável de ambiente `VITE_API_BASE_URL` se o backend não estiver no mesmo host/porta (ex.: `export VITE_API_BASE_URL=http://localhost:8000`).
	3. Inicie o frontend: `npm run dev` e acesse `/login`.
	4. Ao autenticar com sucesso, o token JWT será salvo em `localStorage` e enviado automaticamente em `Authorization: Bearer <token>` nas requisições Axios.

Observações e próximos passos

- O endpoint de login usado pelo frontend é `POST /api/auth/login` e espera um JSON `{ email, password }` retornando `{ accessToken }`.
- Ideal: adicionar um hook `useCurrentUser` que decodifica o JWT (exp, sub) e busca dados do usuário, além de renovar tokens quando próximo do vencimento.
- Segurança: estamos armazenando o token em `localStorage` por simplicidade. Para maior segurança, considere cookies HttpOnly com renovação no backend.


Se quiser, eu executo os comandos `npm install` para adicionar as dependências e depois rodo `npm run build` (não rodarei `npm run dev`). Diga para eu prosseguir quando quiser que eu execute os installs e build agora.

## Progresso, decisões e descobertas (resumo)

Este projeto passou por várias iterações enquanto estabilizamos o frontend. Abaixo resumo as decisões importantes, avanços e problemas encontrados até o momento.

- **Autenticação (JWT)**: Implementamos `AuthContext` em `src/contexts/AuthContext.tsx` com `login(email,password,remember?)`, `logout()` e sincronização entre abas via `storage` event. Tokens podem ser salvos em `localStorage` (remember) ou `sessionStorage` (sessão).
- **Auto-logout e renovação**: Decodificamos o `exp` do JWT (`src/utils/jwt.ts`) e agendamos logout automático no fim da validade. Também adicionamos um interceptor axios que faz logout em respostas 401.
- **Layout e componentes**: Criado `Header`, `Sidebar`, `Footer` e `PageShell` (componentes responsivos e acessíveis). O `Header` agora exibe o `property_name`, subtítulo, um relógio (`DateTimeClock`), seletor de idioma e menu de usuário com logout.
- **Internacionalização**: `react-i18next` configurado e locais em `public/locales/{pt-BR,en,es,fr}`. Adicionamos chaves `header.*` para textos do cabeçalho.
- **Chakra UI compatibilidade**: Ajustes feitos para a versão instalada do `@chakra-ui/react` (algumas APIs/exports não estavam disponíveis na versão do projeto). Evitamos componentes não-exportados e usamos implementações portáveis quando necessário.
- **Testes**: Ambiente de testes com `vitest` + Testing Library. Criamos testes colocated para `LanguageSelector` e `LoginPage` i18n. Agora adicionamos testes unitários para `Header` e `DateTimeClock` (arquivos novos: `src/components/Layout/Header.test.tsx` e `src/components/Layout/DateTimeClock.test.tsx`).
- **Alias de importação**: Normalizamos imports para aliases (`@components`, `@services`, `@contexts`, etc.) em `tsconfig.json` e `vite.config.ts` para melhorar a navegabilidade.

Problemas encontrados e ações tomadas

- Erros de import/exports do Chakra — resolvido usando a API compatível com a versão instalada ou substituindo componentes ausentes por implementações simples.
- Race condition no carregamento do token (RequireAuth redirecionando antes do token ser lido) — corrigido inicializando token de forma síncrona no `AuthProvider`.
- Testes que dependem do provider real (Chakra) geravam warnings; para os testes novos usamos `ChakraProvider` no wrapper ou mocks leves quando necessário.

Próximos passos imediatos

- Rodar a suíte de testes (`vitest`) e consertar falhas remanescentes.
- Commitar as alterações e criar um PR na branch `chore/design-system-audit`.
- Opcional: migrar para uma versão mais nova do `@chakra-ui/react` e refatorar o theme provider.

Se quiser que eu execute os testes agora, eu posso rodar `npm test` no diretório `frontend` e reportar resultados e correções.
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

**Processo de atualização de TODOs**

## **Descobertas & Perguntas**

- **Erro runtime em `<ChakraProvider>`**: ao abrir a app recebíamos `TypeError: Cannot read properties of undefined (reading '_config')`. Causa: incompatibilidade entre a forma como eu estava construindo/passando o tema e a API do `@chakra-ui/react` instalada (v3).
	- Ação tomada: atualizei `src/design-system/ChakraProvider.tsx` para usar o `defaultSystem` e passá‑lo como `value` para `<ChakraProvider>` (API v3). Isso resolveu o crash.
	- Nota: versões mais novas do Chakra exportam utilitários diferentes (`extendTheme` etc.). Se quisermos migrar para uma API mais nova, atualizar `@chakra-ui/react` e adaptar o provider será necessário.

- **Import/Export não encontrado**: após tentar usar `extendTheme` houve um erro `does not provide an export named 'extendTheme'`. Causa: a versão instalada não exporta esse helper no entrypoint. Solução: usar as APIs compatíveis com a versão instalada ou atualizar a dependência.

- **Servidor dev e porta**: Vite pode trocar a porta se 5173 já estiver em uso (ex.: iniciou em 5174). Sempre abra a URL indicada no terminal (ex.: `http://localhost:5173/` ou `http://localhost:5174/`).

- **Páginas em branco no browser**: sintomas comuns são erros de runtime no console (ex.: erro no provider). Quando isso ocorrer:
	- Verifique o console do navegador para a primeira stack trace.
	- Pare o dev server e limpe cache do Vite: `rm -rf node_modules/.vite` e reinicie com `npm run dev`.
	- Se persistir, reinstale dependências: `rm -rf node_modules package-lock.json && npm install`.

- **Testes: ambiente e mocks**:
	- Problemas encontrados: testes falhavam com `describe is not defined` (vitest globals), ou `document is not defined` (jsdom ausente), e falhas por diferenças entre a API do Chakra em runtime quando tentamos usar o real provider em testes.
	- Ações tomadas:
		- Instalado `jsdom` e executei Vitest com `--environment jsdom` para permitir testes DOM.
		- Para isolar o componente `LoginPage` evitei depender do provider real nos testes e criei mocks leves para os componentes Chakra usados. Ajustes importantes nos mocks:
			- `Input` precisa encaminhar `ref` para funcionar com `react-hook-form`.
			- Containers que eram usados como `as="form"` (ex.: `VStack`) precisam renderizar o elemento correto para que `onSubmit` funcione nos testes.
		- Troquei a asserção `toHaveTextContent` (jest-dom matcher) por uma verificação simples em `textContent` para evitar dependência de configuração global de jest-dom no Vitest.
	- Próximo passo recomendado: adicionar um arquivo de setup do Vitest que importe `@testing-library/jest-dom` ou padronizar asserções sem jest-dom; e adicionar handlers MSW para mocks HTTP mais realistas.

- **Logs de aviso do React durante testes**: ao mockar Chakra alguns props não padronizados (`isInvalid`, `colorScheme`) aparecem como atributos DOM e geram warnings. Podemos refinar os mocks para filtrar esses props e reduzir ruído.

- **Decisão de curto prazo**: mantive a correção minimal que estabiliza dev e testes (usar `defaultSystem` no provider, instalar `jsdom`, ajustar testes). A preparação de um tema completo e migração para APIs mais novas do Chakra ficam para uma etapa posterior.

## **Próximos passos recomendados**

- **Concluir setup de testes**: adicionar `vitest` setup file, `msw` handlers e `axe` checks em testes críticos. (Status: in‑progress)
- **Consolidar tema Chakra**: decidir entre atualizar `@chakra-ui/react` para uma versão mais recente (e usar `extendTheme`) ou manter v3 e construir tokens via `mergeConfigs`/`createSystem`. (Status: pending decision)
- **Remover ruído de warnings em testes**: melhorar mocks ou criar um adaptador de teste para Chakra que filtre props não padronizados.
- **Documentar dev server**: adicionar nota no README sobre a porta fallback do Vite e como limpar cache se necessário.
 
Se quiser, implemento automaticamente os itens acima (tests setup + MSW + vitest setup) — diga qual deseja priorizar.

---

**Atualização: seletor de idioma global**

- Implementamos um seletor de idioma global no cabeçalho do aplicativo em `src/components/PageShell.tsx`. O seletor é um `<select>` que chama `i18next.changeLanguage` e permite alternar entre `pt-BR`, `en`, `es` e `fr` em tempo de execução.
- Por enquanto escolhemos um elemento nativo para máxima compatibilidade com a versão atual do `@chakra-ui/react` (v3). Podemos substituir por um componente `Select` estilizado do Chakra ou por um menu customizado com flags e labels se atualizarmos a lib.
- A seleção de idioma é acessível (contém `aria-label`) e testada: adicionamos `src/pages/LoginPage/LoginPage.i18n.test.tsx` que valida a troca de idioma no `LoginPage`.

**Visual e UX**

- O seletor global foi posicionado no topo de `PageShell` para ser facilmente encontrado. Em uma iteração futura podemos mover para um menu de perfil ou um cabeçalho persistente com logo e ações do usuário.

- A lista de TODOs (incluindo `AGENT_TODO_JSON`) deve ser atualizada ao final de cada ciclo de trabalho (sprint/iteração). Ao encerrar um ciclo, o responsável deve:
  - marcar os itens concluídos com o status apropriado,
  - adicionar novos itens que surgirem durante o ciclo,
  - NÃO apagar itens históricos — o histórico deve ser preservado para auditoria e rastreabilidade.

- Regras:
  - Itens só podem ser removidos por acordo explícito documentado (issue/PR) com a justificativa; por padrão, marque como `completed` ou `deprecated` e adicione um comentário explicando por quê.
  - Agentes automatizados que consumirem `AGENT_TODO_JSON` devem respeitar essas regras: atualizem status, adicionem tarefas novas, e se precisarem apagar itens ou pushar para branches remotas sem permissão, parem e solicitem credenciais/humana intervenção.

```