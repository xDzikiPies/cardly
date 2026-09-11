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

## Co dalej (żeby było w pełni "produkcyjne")

1. `GET/PATCH /api/profile` — dokończyć endpoint pod rozszerzony profil (bio/zawód/kategorie)
2. Realny protokół wymiany NFC/QR — dwustronny handshake, nie tylko symulacja jednej strony
3. Refresh tokeny zamiast jednego JWT na 30 dni
4. Upload zdjęć/logo (S3 albo Cloudinary) zamiast samych URL-i
5. Rate limiting na `/api/auth/*` (na razie brute-force na hasło jest technicznie możliwy)
