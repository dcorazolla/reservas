Internationalization (i18n) quick notes

- We use `i18next` + `react-i18next` with simple JSON resources under `./locales/`.
- Supported initial locales: `pt-BR`, `es`, `en`, `fr`.
- The app detects the browser language and falls back to `en` if the language is not supported.
- The selected locale is persisted in `localStorage` under key `locale`.

To install dependencies (if not already present):

```bash
cd frontend
npm install i18next react-i18next
# optional (if you want automatic detection library):
npm install i18next-browser-languagedetector
```

How to add a new language:
- Add a JSON file in `frontend/src/i18n/locales/` (e.g. `de.json`).
- Add the locale key and import it in `frontend/src/i18n/index.ts` and the `resources` map.
- Add the locale key to the `supported` array in `index.ts`.
