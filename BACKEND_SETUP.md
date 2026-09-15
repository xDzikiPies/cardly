# Cardly — backend + auth: instrukcja uruchomienia

## Co się zmieniło

Apka mobilna **nie jest już w 100% na mockach**. Realnie podłączone do `apps/web` (Prisma + Postgres):

- Rejestracja / logowanie / sesja (JWT, `expo-secure-store` na telefonie)
- Wizytówka (odczyt / tworzenie / edycja) — `GET|PUT /api/cards/me`
- Tła wizytówek — `GET /api/backgrounds`
- Lista specjalistów + wyszukiwanie/filtry — `GET /api/specialists`
- Profil specjalisty + opinie — `GET /api/specialists/:id`
- Dodawanie opinii — `POST /api/specialists/:id/reviews`
- "Dołącz jako specjalista" — `POST /api/specialists`

**Nadal na mocku (świadomie, patrz `TODO` w kodzie):**
- Historia wymian (NFC/QR) — prawdziwy handshake między dwoma telefonami to osobny protokół,
  nie sam REST; na razie zostaje symulowany lokalnie w `src/services/api.ts`
- Rozszerzony profil własny (bio/zawód/kategorie na zakładce Profil) — brakuje jeszcze
  dedykowanego `GET/PATCH /api/profile`, zostaje na mocku w pamięci

## 1. Postaw backend

```bash
cd apps/web
npm install                 # postinstall sam odpali `prisma generate`
cp .env.example .env
```

W `.env` ustaw prawdziwy `DATABASE_URL`. Najszybciej: darmowy Postgres na
[neon.tech](https://neon.tech) albo [supabase.com](https://supabase.com) — załóż projekt,
skopiuj connection string.

```bash
npx prisma migrate dev --name init
npx prisma db seed          # tworzy konto testowe + 3 przykładowych specjalistów + tła kart
npm run dev
```

Backend wstaje na `http://localhost:3000`. Sprawdź: `http://localhost:3000/api/backgrounds`
powinno zwrócić 8 teł w JSON-ie.

**Konto testowe po seedzie:** `kamil.nowicki@cardly.app` / `cardly123`

## 2. Podłącz apkę mobilną

```bash
cd apps/mobile
cp .env.example .env
```

W `.env` ustaw `EXPO_PUBLIC_API_URL`:

- **Symulator/emulator na tym samym komputerze:** `http://localhost:3000/api` (domyślne)
- **Fizyczny telefon / dev build:** `localhost` NIE zadziała — użyj IP komputera w sieci Wi-Fi:
  ```
  EXPO_PUBLIC_API_URL=http://192.168.1.23:3000/api
  ```
  (znajdziesz swoje IP przez `ipconfig` na Windows, `ifconfig`/`ipconfig getifaddr en0` na Mac)

```bash
pnpm install
npx expo start --dev-client -c
```

Zaloguj się kontem testowym — powinieneś zobaczyć swoją wizytówkę (utworzoną przez seed)
i listę 3 specjalistów pobraną z prawdziwej bazy.

## 3. Deploy (żeby dać ludziom do testowania)

- **Backend (`apps/web`):** Vercel — najmniej konfiguracji, wystarczy podpiąć repo i ustawić
  zmienne środowiskowe (`DATABASE_URL`, `JWT_SECRET`) w panelu projektu
- **Baza:** Neon albo Supabase (oba mają darmowy tier, wystarczający na testy)
- **Mobile:** po ustawieniu `EXPO_PUBLIC_API_URL` na prawdziwą domenę produkcyjną, zrób nowy
  build EAS (`eas build --profile preview` — do rozesłania linku znajomym, bez App Store)

## ⚠️ Duży update — wymagana nowa migracja

Schemat bazy mocno się rozrósł (usługi specjalistów, zapytania o wycenę, rynek zleceń,
powiadomienia, czat). **Przed deployem zrób nową migrację:**

```bash
cd apps/web
npx prisma migrate dev --name marketplace_and_chat
npx prisma db seed   # opcjonalnie — dorzuci przykładowe usługi do demo-specjalistów
```

Na Vercelu: po pushu z nowym schematem, migracja **nie odpali się sama** — musisz ją
odpalić ręcznie (lokalnie, wskazując na tę samą bazę co produkcja) albo dodać krok
migracji do CI/CD. Dla małej apki najszybciej: uruchom migrację lokalnie z `DATABASE_URL`
wskazującym na produkcyjny Neon/Supabase.

## Co nowego

- **"Zapytaj o wycenę"** na profilu specjalisty — modal z opisem, budżetem, zdjęciami
  (upload — patrz ograniczenie niżej), tworzy zapytanie + od razu konwersację
- **Usługi i cennik** specjalisty — zarządzane z Profilu (`Moje usługi`), widoczne
  publicznie na jego profilu; brak ceny = "Do ustalenia"
- **Rynek zleceń** — nowa zakładka "Zlecenia": lista z wyszukiwarką/filtrami
  (kategoria, miasto, typ budżetu, sortowanie), tworzenie zlecenia, zgłaszanie się
- **Powiadomienia** — dzwonek z badgem w headerze każdego głównego ekranu, lista
  powiadomień, odpytywane co 20s (nie push — patrz niżej)
- **Czat** — jedna konwersacja per zapytanie o wycenę / zgłoszenie do zlecenia,
  odpytywana co 4s (nie WebSockety — prościej, wystarczające na start)

### Upload zdjęć — WAŻNE ograniczenie

`POST /api/upload` zapisuje pliki na dysk (`apps/web/public/uploads`). To działa
w `next dev` i na VPS-ie, **ale nie na Vercelu** (serverless = brak trwałego dysku,
pliki znikną). Jeśli testujesz na Vercelu, funkcja dodawania zdjęć do zapytania
o wycenę będzie się wywalać albo pliki nie przetrwają. Przed pokazaniem tego
szerszej grupie osób: podmień `apps/web/app/api/upload/route.ts` na S3/Cloudinary
(sam endpoint zostaje strukturalnie taki sam, zmienia się tylko `writeFile(...)`).

### Powiadomienia i czat — brak prawdziwego real-time

Oba działają na "odpytywaniu" (polling) w ustalonych odstępach, nie na WebSocketach/push.
Wystarczające do testów, ale przy realnym ruchu warto rozważyć: Pusher/Ably do czatu,
Expo Push Notifications do powiadomień systemowych (żeby przychodziły nawet gdy apka
jest zamknięta — teraz działają tylko w apce).

## Nowa natywna zależność w mobile

Dodany `expo-image-picker` (do zdjęć w zapytaniu o wycenę) — **wymaga nowego natywnego
builda**, tak jak poprzednio przy `react-native-hce`. `pnpm install`, potem nowy build
EAS zanim to przetestujesz na telefonie.



1. ~~`GET/PATCH /api/profile`~~ — ✅ zrobione
2. ~~Realny protokół wymiany NFC/QR~~ — ✅ zrobione: karty mają stabilne ID z bazy,
   `/c/[id]` zawsze pokazuje aktualne dane, `POST /api/exchanges` zapisuje prawdziwy
   rekord w bazie (autoryzowany JWT-em odbiorcy, karta identyfikowana ID — nie trzeba
   osobnej tabeli sesji/tokenów, bo wizytówka i tak ma być publiczna)
3. ~~Rate limiting~~ — ✅ zrobione (`middleware.ts`, 10 req/min na `/api/auth/*`,
   60 req/min na resztę `/api/*`) + podstawowe nagłówki bezpieczeństwa
4. Refresh tokeny zamiast jednego JWT na 30 dni — nadal do zrobienia
5. Upload zdjęć/logo (S3 albo Cloudinary) zamiast samych URL-i — nadal do zrobienia
6. Universal Links / App Links — żeby otwarcie `cardly.app/c/...` na telefonie z
   zainstalowaną apką od razu otwierało apkę zamiast przeglądarki (wymaga plików
   `apple-app-site-association` i `assetlinks.json` hostowanych na domenie + config
   w `app.json`) — nadal do zrobienia, nie blokuje działania (przeglądarka i tak działa)

## NFC — cross-platform, ważne ograniczenie

- **Odczyt (odbieranie)** działa identycznie na iOS i Androidzie — to sprawdzona,
  wcześniej już działająca ścieżka (`react-native-nfc-manager`)
- **Nadawanie** działa TYLKO z Androida (`react-native-hce`, przez emulację karty HCE) —
  to nie jest ograniczenie tej biblioteki, tylko systemu iOS: Apple nie udostępnia
  stronom trzecim możliwości emitowania danych przez NFC, tylko odczyt. Dlatego:
  - Android → Android: NFC działa
  - Android → iPhone: NFC działa (Android nadaje, iPhone czyta)
  - iPhone → cokolwiek: zawsze QR (przycisk NFC ukryty, jasny komunikat w UI)
- Ten kawałek (`react-native-hce` + własny Expo config plugin w `plugins/withNfcHce.js`)
  **nigdy nie był budowany na prawdziwym urządzeniu** — jeśli natywny build Androida
  się wywali przez ten plugin, najszybszy ratunek: usuń `"./plugins/withNfcHce.js"`
  z listy `plugins` w `app.json` i zrób nowy build — apka wróci do samego QR na
  Androidzie (traci nadawanie NFC, ale reszta działa)
- **iOS (TestFlight) nie jest tym zagrożony w ogóle** — iPhone i tak nigdy nie nadaje
  przez NFC, więc ten kod nawet się tam nie uruchamia
