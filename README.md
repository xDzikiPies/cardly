# Cardly — monorepo (MVP)

Cyfrowe wizytówki + katalog specjalistów + wymiana kontaktów przez NFC/QR.

## Struktura

```
cardly/
├── apps/
│   ├── mobile/     Expo (React Native) — aplikacja mobilna, TERAZ działa na mockach
│   └── web/        Next.js — backend (API routes) + Prisma + w przyszłości strona www
```

## Filozofia "mock-first"

Cała logika w mobile (`src/services/api.ts`) ma sygnatury i kształty danych
identyczne z tym, co docelowo zwróci Next.js API (`apps/web/app/api/*`).
Żeby przełączyć apkę z mocków na realne dane, zmieniasz TYLKO zawartość
funkcji w `src/services/api.ts` (fetch do `apps/web`), reszta apki (hooki,
komponenty, ekrany) nie musi się zmienić ani o linijkę.

## Instalacja (pnpm, z roota — instaluje mobile + web naraz)

```bash
pnpm install
```

To monorepo jest skonfigurowane jako pnpm workspace (`pnpm-workspace.yaml`).
W `.npmrc` jest ustawione `node-linker=hoisted` — jest to wymagane, bo Expo/RN
z natywnymi modułami (np. `react-native-nfc-manager`) potrafi się gubić przy
standardowym, symlinkowanym `node_modules` pnpm. Bez tego ustawienia dostaniesz
błędy przy `expo start` / buildzie natywnym.

## Jak uruchomić mobile

```bash
pnpm mobile
# albo bezpośrednio:
cd apps/mobile && pnpm exec expo start
```

Uwaga: `react-native-nfc-manager` to natywny moduł — NFC nie zadziała w Expo Go.
Do testowania NFC potrzebny jest **development build**:
```bash
cd apps/mobile
pnpm exec expo run:android
# albo: pnpm exec eas build --profile development
```
QR działa normalnie w Expo Go.

## Jak uruchomić backend (Next.js + Prisma + Postgres)

```bash
cd apps/web
cp .env.example .env   # ustaw DATABASE_URL i JWT_SECRET
pnpm prisma:migrate    # albo z roota: pnpm web:migrate
pnpm web               # z roota: pnpm dev w apps/web
```

## Roadmap (co dalej, poza tym MVP)

1. Prawdziwa autoryzacja (na razie mock: zalogowany jest zawsze "Ty" z `src/mocks/data.ts`)
2. Realne geo (PostGIS albo proste haversine w API) zamiast `distanceKm` z mocków
3. Upload logo/avatarów (S3 / Cloudinary) zamiast `logoUrl` jako stały URL
4. Push notifications przy nowej wymianie / opinii
5. Web (apps/web) — publiczny frontend na tym samym API co mobile
6. Panel moderacji opinii
