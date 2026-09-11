# Cardly — backend (Next.js + Prisma + PostgreSQL)

## Setup

```bash
npm install
cp .env.example .env   # uzupełnij DATABASE_URL i JWT_SECRET
npx prisma generate    # WAŻNE: potrzebne nawet do samego `next build`/`next dev`,
                        # bo API routes importują @prisma/client przy starcie
npx prisma migrate dev --name init
npm run dev
```

## Strona (landing page + publiczne wizytówki)

Poza API, `apps/web` to teraz też publiczna strona:

- `/` — strona prezentacyjna aplikacji (hero, funkcje, opinie, linki do sklepów)
- `/c/[data]` — publiczny podgląd wizytówki, **fallback gdy NFC nie działa** (i dla osób bez apki).
  Dane karty są zakodowane bezpośrednio w URL-u (base64url), więc strona działa już teraz,
  bez podłączonej bazy. Apka mobilna generuje takie linki w `src/lib/cardEncoding.ts`.

  **TODO na później:** gdy ruszy prawdziwy backend, zamienić to na `/c/[cardId]` +
  `GET /api/cards/public/:id`, a QR/NFC z apki będą zawierać tylko ID, nie całe dane.

### Zmienne środowiskowe dla apki mobilnej (żeby QR/NFC wskazywały na Twoją domenę)

W `apps/mobile` ustaw (np. w `.env` czytanym przez Expo, albo `eas.json` → `env`):

```
EXPO_PUBLIC_WEB_URL=https://twoja-domena.pl
EXPO_PUBLIC_API_URL=https://twoja-domena.pl/api
```

Domyślnie (bez ustawienia) mobile używa placeholdera `https://cardly.app` — wygenerowane
linki będą wyglądać poprawnie, ale nie będą prowadzić do niczego, dopóki nie wdrożysz
tej strony pod prawdziwą domeną i nie podmienisz zmiennej.


## Gotowe endpointy (MVP)

- `GET  /api/specialists` — lista specjalistów (search, kategorie, promień, sort)
- `GET  /api/cards` — moje wizytówki
- `PATCH /api/cards` — edycja wizytówki
- `POST /api/exchanges` — zapis wymiany NFC/QR
- `GET  /api/exchanges` — historia odebranych kontaktów

## Do dodania

- `POST /api/auth/register`, `POST /api/auth/login` (bcrypt + `signToken` z `lib/auth.ts`)
- `POST /api/specialists` — publikacja profilu specjalisty ("dołącz jako specjalista")
- `POST /api/specialists/:id/reviews` — dodawanie opinii
- Seed script (`prisma/seed.ts`) z danymi z `apps/mobile/src/mocks/data.ts` — 1:1 te same
  dane co teraz widać na mockach w apce, więc podmiana będzie niezauważalna dla UI.
