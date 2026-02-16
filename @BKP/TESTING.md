Testing guidelines and how-to

Run tests
- From `frontend/` run the test suite with `vitest`:

```bash
cd frontend
# run once (CI-friendly)
npm run test -- --run

# run a subset by pattern (example: Header)
npm run test -- --run -t Header
```

Conventions
- Colocate tests next to implementation files. For a component/page at `src/components/Foo/Bar.tsx` place tests at `src/components/Foo/Bar.test.tsx` or `Bar.a11y.test.tsx`.
- Accessibility tests: name files with `.a11y.test.tsx` and use `vitest-axe` to assert `axe(container).violations` is empty.
- Interaction/unit tests: name with `.test.tsx` or `.interactions.test.tsx` as appropriate.

i18n guidelines
- Use `react-i18next` and place translation JSONs under `src/i18n/locales/`.
- Detect language via `localStorage` -> `navigator.language` and fallback to `en`.
- In unit tests, mock `react-i18next` by stubbing `useTranslation` to return a minimal `t()` and `i18n` object if you don't want to initialize i18n in tests.

a11y guidelines
- Use `vitest-axe` for automated accessibility checks: render the component/page, wait for async content, then `const results = await axe(container)` and assert `results.violations.length === 0`.
- When tests render Chakra components they need Chakra context. Wrap components in `AppChakraProvider` or mock Chakra provider in tests. Example:

```tsx
import AppChakraProvider from '../design-system/ChakraProvider'

render(
  <AppChakraProvider>
    <MyComponent />
  </AppChakraProvider>
)
```

Test runner notes for agents
- Always run `npm install` in `frontend/` before running tests.
- Use `--run` in CI to run tests once and exit.
- Use `-t <pattern>` to filter tests by name when iterating locally.

Adding new tests
- Prefer colocated tests; follow naming conventions above.
- Mock network/API modules at the module boundary (e.g., `vi.mock('../api/foo', () => ({ ... }))`).
