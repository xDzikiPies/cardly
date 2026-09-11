import { BusinessCard, CardBackground, ExchangeResult, Review, SpecialistProfile, User } from "@/types";

/** Zalogowany użytkownik (mock — docelowo z auth store / API) */
export const CURRENT_USER: User = {
  id: "u_me",
  firstName: "Kamil",
  lastName: "Nowicki",
  email: "kamil.nowicki@cardly.app",
  avatarUrl: "https://i.pravatar.cc/300?img=12",
};

export const CARD_BACKGROUNDS: CardBackground[] = [
  { id: "bg_violet", name: "Violet", colorStart: "#6C5CE7", colorEnd: "#5B4CF0", textColor: "#FFFFFF", pattern: "none" },
  { id: "bg_midnight", name: "Midnight", colorStart: "#161A2B", colorEnd: "#2B2F4A", textColor: "#FFFFFF", pattern: "dots" },
  { id: "bg_sunset", name: "Sunset", colorStart: "#FF7A59", colorEnd: "#FFB199", textColor: "#1A1A1A", pattern: "waves" },
  { id: "bg_mint", name: "Mint", colorStart: "#1FD1A1", colorEnd: "#00B894", textColor: "#FFFFFF", pattern: "grid" },
  { id: "bg_paper", name: "Paper", colorStart: "#FFFFFF", colorEnd: "#F0F0F7", textColor: "#15142B", pattern: "none" },
  { id: "bg_ocean", name: "Ocean", colorStart: "#0F4C81", colorEnd: "#2E86AB", textColor: "#FFFFFF", pattern: "waves" },
  { id: "bg_rose", name: "Rose Gold", colorStart: "#F7B8B0", colorEnd: "#EAA2A2", textColor: "#3A1F1F", pattern: "none", isPremium: true },
  { id: "bg_graphite", name: "Graphite", colorStart: "#2D2D34", colorEnd: "#000000", textColor: "#FFFFFF", pattern: "grid", isPremium: true },
];

export const MY_CARD: BusinessCard = {
  id: "card_me_1",
  userId: CURRENT_USER.id,
  firstName: CURRENT_USER.firstName,
  lastName: CURRENT_USER.lastName,
  jobTitle: "Doradca finansowy",
  company: "Nowicki Finance",
  email: CURRENT_USER.email,
  phone: "+48 512 340 221",
  workAddress: "ul. Świdnicka 12, Wrocław",
  logoUrl: undefined,
  backgroundId: "bg_violet",
  isPrimary: true,
};

const reviewsFor = (seed: number): Review[] => {
  const pool: Review[] = [
    { id: `r${seed}a`, authorName: "Ola W.", rating: 5, comment: "Bardzo profesjonalne podejście, polecam każdemu.", createdAt: "2026-08-20" },
    { id: `r${seed}b`, authorName: "Marek T.", rating: 4, comment: "Sprawna komunikacja, wszystko na czas.", createdAt: "2026-07-11" },
    { id: `r${seed}c`, authorName: "Julia K.", rating: 5, comment: "Zdecydowanie wracam przy kolejnej sprawie.", createdAt: "2026-06-02" },
  ];
  return pool.slice(0, (seed % 3) + 1);
};

export const SPECIALISTS: SpecialistProfile[] = [
  {
    id: "sp_1",
    userId: "u_1",
    firstName: "Anna",
    lastName: "Kowalska",
    avatarUrl: "https://i.pravatar.cc/300?img=32",
    profession: "Radca prawny",
    bio: "Specjalizuję się w prawie nieruchomości i umowach najmu. 8 lat doświadczenia.",
    categories: ["Prawo", "Nieruchomości"],
    city: "Wrocław",
    distanceKm: 1.2,
    ratingAvg: 4.9,
    ratingCount: 58,
    reviews: reviewsFor(1),
  },
  {
    id: "sp_2",
    userId: "u_2",
    firstName: "Piotr",
    lastName: "Zieliński",
    avatarUrl: "https://i.pravatar.cc/300?img=15",
    profession: "Architekt wnętrz",
    bio: "Projektuję mieszkania i biura z naciskiem na funkcjonalność i minimalizm.",
    categories: ["Architektura", "Design"],
    city: "Wrocław",
    distanceKm: 3.6,
    ratingAvg: 4.7,
    ratingCount: 34,
    reviews: reviewsFor(2),
  },
  {
    id: "sp_3",
    userId: "u_3",
    firstName: "Magdalena",
    lastName: "Wójcik",
    avatarUrl: "https://i.pravatar.cc/300?img=45",
    profession: "Fizjoterapeutka",
    bio: "Terapia manualna, rehabilitacja sportowa. Pracuję też z pacjentami po kontuzjach.",
    categories: ["Zdrowie"],
    city: "Wrocław",
    distanceKm: 5.1,
    ratingAvg: 5.0,
    ratingCount: 91,
    reviews: reviewsFor(3),
  },
  {
    id: "sp_4",
    userId: "u_4",
    firstName: "Tomasz",
    lastName: "Lewandowski",
    avatarUrl: "https://i.pravatar.cc/300?img=53",
    profession: "Księgowy",
    bio: "Pełna księgowość i rozliczenia dla jednoosobowych działalności oraz spółek.",
    categories: ["Finanse"],
    city: "Oleśnica",
    distanceKm: 22.4,
    ratingAvg: 4.5,
    ratingCount: 21,
    reviews: reviewsFor(4),
  },
  {
    id: "sp_5",
    userId: "u_5",
    firstName: "Katarzyna",
    lastName: "Dąbrowska",
    avatarUrl: "https://i.pravatar.cc/300?img=48",
    profession: "Fotografka",
    bio: "Sesje ślubne, portretowe i produktowe. Naturalne światło, minimalistyczny styl.",
    categories: ["Design", "Marketing"],
    city: "Wrocław",
    distanceKm: 2.8,
    ratingAvg: 4.8,
    ratingCount: 47,
    reviews: reviewsFor(5),
  },
  {
    id: "sp_6",
    userId: "u_6",
    firstName: "Michał",
    lastName: "Kaczmarek",
    avatarUrl: "https://i.pravatar.cc/300?img=60",
    profession: "Doradca podatkowy",
    bio: "Optymalizacja podatkowa dla firm technologicznych i freelancerów.",
    categories: ["Finanse", "Prawo"],
    city: "Wrocław",
    distanceKm: 6.9,
    ratingAvg: 4.6,
    ratingCount: 15,
    reviews: reviewsFor(6),
  },
];

export const ALL_CATEGORIES = Array.from(
  new Set(SPECIALISTS.flatMap((s) => s.categories))
).sort();

/** Rozszerzony profil ZALOGOWANEGO użytkownika — pokazywany na zakładce "Profil".
 *  Istnieje niezależnie od tego, czy user zdecydował się być widocznym na liście
 *  publicznej (to osobny krok — patrz `becomeSpecialist` w services/api.ts). */
export const MY_SPECIALIST_PROFILE: SpecialistProfile = {
  id: "sp_me",
  userId: CURRENT_USER.id,
  firstName: CURRENT_USER.firstName,
  lastName: CURRENT_USER.lastName,
  avatarUrl: CURRENT_USER.avatarUrl,
  profession: "Doradca finansowy",
  bio: "Pomagam osobom prywatnym i małym firmom ogarnąć finanse — od budżetu domowego po plan emerytalny. 6 lat doświadczenia.",
  categories: ["Finanse"],
  city: "Wrocław",
  distanceKm: 0,
  ratingAvg: 4.8,
  ratingCount: 12,
  reviews: reviewsFor(7),
};

/** Wizytówka "drugiej osoby" — używana do symulacji odebranej wymiany NFC/QR */
export const INCOMING_MOCK_CARD: BusinessCard = {
  id: "card_incoming_1",
  userId: "u_1",
  firstName: "Anna",
  lastName: "Kowalska",
  jobTitle: "Radca prawny",
  company: "Kancelaria Kowalska & Partnerzy",
  email: "anna.kowalska@kancelaria.pl",
  phone: "+48 601 220 118",
  workAddress: "ul. Krupnicza 4, Wrocław",
  backgroundId: "bg_midnight",
  isPrimary: true,
};

/** Kilka dodatkowych wizytówek do zademonstrowania zakładki "Historia" */
export const MOCK_EXCHANGE_CARDS: BusinessCard[] = [
  {
    id: "card_incoming_2",
    userId: "u_2",
    firstName: "Piotr",
    lastName: "Zieliński",
    jobTitle: "Architekt wnętrz",
    company: "Zieliński Design",
    email: "piotr.zielinski@design.pl",
    phone: "+48 501 118 227",
    workAddress: "ul. Legnicka 51, Wrocław",
    backgroundId: "bg_sunset",
    isPrimary: true,
  },
  {
    id: "card_incoming_3",
    userId: "u_3",
    firstName: "Magdalena",
    lastName: "Wójcik",
    jobTitle: "Fizjoterapeutka",
    company: "FizjoWrocław",
    email: "m.wojcik@fizjowroclaw.pl",
    phone: "+48 512 900 331",
    workAddress: "ul. Powstańców Śląskich 9, Wrocław",
    backgroundId: "bg_mint",
    isPrimary: true,
  },
  {
    id: "card_incoming_4",
    userId: "u_5",
    firstName: "Katarzyna",
    lastName: "Dąbrowska",
    jobTitle: "Fotografka",
    company: "Kate Dąbrowska Photography",
    email: "kontakt@katedabrowska.pl",
    phone: "+48 660 224 981",
    workAddress: "ul. Ruska 46, Wrocław",
    backgroundId: "bg_rose",
    isPrimary: true,
  },
  {
    id: "card_incoming_5",
    userId: "u_6",
    firstName: "Michał",
    lastName: "Kaczmarek",
    jobTitle: "Doradca podatkowy",
    company: "Kaczmarek Tax",
    email: "michal@kaczmarektax.pl",
    phone: "+48 792 331 004",
    workAddress: "ul. Oławska 15, Wrocław",
    backgroundId: "bg_ocean",
    isPrimary: true,
  },
];

/** Historia wymian — pokazywana na zakładce "Historia" (i skrótowo dawniej na Profilu) */
export const MOCK_EXCHANGES: ExchangeResult[] = [
  { id: "ex_1", method: "NFC", card: INCOMING_MOCK_CARD, createdAt: "2026-09-01T10:20:00Z" },
  { id: "ex_2", method: "QR", card: MOCK_EXCHANGE_CARDS[0], createdAt: "2026-08-27T15:05:00Z" },
  { id: "ex_3", method: "NFC", card: MOCK_EXCHANGE_CARDS[1], createdAt: "2026-08-14T09:40:00Z" },
  { id: "ex_4", method: "QR", card: MOCK_EXCHANGE_CARDS[2], createdAt: "2026-07-30T18:12:00Z" },
  { id: "ex_5", method: "NFC", card: MOCK_EXCHANGE_CARDS[3], createdAt: "2026-07-22T12:00:00Z" },
];
