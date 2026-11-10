# 5DRAGONS — status i konfiguracja właściciela

## Wejdź do panelu

Strona jest opublikowana: https://5dragons.matkosmo27.workers.dev/

Zaloguj się przez `/login.html` adresem e-mail, który podałeś. Po udanym logowaniu produkcyjny Worker automatycznie nada temu kontu rolę `OWNER`. Jeśli konto jeszcze nie istnieje, zarejestruj je najpierw i zaloguj się ponownie.

Control Center: https://5dragons.matkosmo27.workers.dev/admin/index.html

W panelu możesz zarządzać składem, meczami, newsami, rekrutacją, brandingiem, osiągnięciami i rolami użytkowników. Backend sprawdza uprawnienia; zmiana roli jest dostępna tylko dla OWNER.

## Wdrożenie jest już wykonane

Worker `calm-sunset-b06e` i frontend `5dragons` zostały opublikowane. Sekret `OWNER_EMAIL` jest ustawiony po stronie Workera; nie znajduje się w publicznym kodzie. Ostatni OWNER nie może zostać usunięty ani zdegradowany. Statyczny deploy pomija `.git`, `.wrangler`, plik Workera i konfiguracje dzięki `.assetsignore`.

## Kolejne wdrożenie

Z katalogu projektu:

```powershell
npx wrangler deploy --config wrangler.json
npx wrangler deploy --config wrangler.frontend.json
```

Do zmiany konta OWNER użyj sekretu Workera, a nie edytuj plików publicznych:

```powershell
npx wrangler secret put OWNER_EMAIL --config wrangler.json
```

Wymagane są: zalogowane konto Cloudflare w Wranglerze, istniejące powiązanie D1 oraz sekret `GITHUB_TOKEN` do uploadu obrazów.
