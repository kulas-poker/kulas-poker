# KULAS POKER

Texas Hold'em na żetony dla znajomych. Aplikacja instalowana z linku (PWA) + serwer gry w Supabase.

## Jak to działa

- **Aplikacja** (`index.html`, `app.js`) jest publikowana na GitHub Pages. Znajomi otwierają link i dodają ją do ekranu głównego telefonu.
- **Serwer gry** (`supabase/functions/game`) tasuje i rozdaje karty, pilnuje zasad i kolejności ruchów. Każdy telefon dostaje tylko swoje 2 karty.
- **Zasady gry** są w jednym pliku: `supabase/functions/_shared/logic.mjs`. Używa go serwer i tryb podglądu w aplikacji.
- **Baza danych** (`supabase/migrations`) jest zabezpieczona regułami (RLS): czytać mogą tylko osoby, które podały kod stołu, a pisać do stanu gry może tylko serwer.

## Publikacja

Każda zmiana wgrana do gałęzi `main` uruchamia automat (`.github/workflows/deploy.yml`):
1. **testy**: zasady, serwer, klikany test aplikacji z trzema graczami. Jeśli coś nie przejdzie, nic się nie publikuje.
2. **serwer**: aktualizacja bazy i serwera gry w Supabase.
3. **aplikacja**: publikacja na GitHub Pages.

Potrzebne sekrety (GitHub → Settings → Secrets and variables → Actions):

| Nazwa | Co to jest |
|---|---|
| `SUPABASE_ACCESS_TOKEN` | token z Supabase (Account → Access Tokens) |
| `SUPABASE_PROJECT_REF` | identyfikator projektu (część adresu `https://XXXX.supabase.co`) |
| `SUPABASE_DB_PASSWORD` | hasło do bazy danych projektu |
| `ADMIN_PIN` | PIN właściciela stołu (zmiana ciemnych, nowa gra, reset rankingu) |
| `TABLE_CODE` | kod stołu, który dajesz znajomym |

## Testy lokalnie

```
npm install
npx playwright install chromium
npm test
```
