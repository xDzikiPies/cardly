import {
  BusinessCard,
  CardBackground,
  ExchangeMethod,
  ExchangeResult,
  Review,
  SpecialistFilters,
  SpecialistProfile,
  User,
} from "@/types";
import { getToken, setToken, clearToken } from "@/lib/tokenStore";
import { INCOMING_MOCK_CARD, MOCK_EXCHANGES, MY_SPECIALIST_PROFILE } from "@/mocks/data";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";

/** Konto testowe utworzone przez `npx prisma db seed` w apps/web. */
export const DEMO_CREDENTIALS = { email: "kamil.nowicki@cardly.app", password: "cardly123" };

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body?.error ?? "REQUEST_FAILED");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export async function checkSession(): Promise<User | null> {
  const token = await getToken();
  if (!token) return null;
  try {
    return await request<User>("/auth/me");
  } catch {
    await clearToken();
    return null;
  }
}

export async function login(email: string, password: string): Promise<User> {
  try {
    const { token, user } = await request<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    await setToken(token);
    return user;
  } catch {
    throw new Error("INVALID_CREDENTIALS");
  }
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export async function register(input: RegisterInput): Promise<User> {
  const { token, user } = await request<{ token: string; user: User }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  await setToken(token);
  return user;
}

export async function logout(): Promise<void> {
  await clearToken();
}

export async function getCurrentUser(): Promise<User> {
  return request<User>("/auth/me");
}

// ---------------------------------------------------------------------------
// Mój rozszerzony profil (bio, zawód, kategorie, opinie o mnie)
// TODO: brak jeszcze dedykowanego endpointu GET/PATCH /api/profile — dopóki go nie ma,
// ta sekcja zostaje na mocku w pamięci, żeby ekran Profil dalej działał.
// ---------------------------------------------------------------------------
let myProfileState: SpecialistProfile = { ...MY_SPECIALIST_PROFILE };

export async function getMyProfileDetails(): Promise<SpecialistProfile> {
  return { ...myProfileState };
}

export interface MyProfileDetailsInput {
  profession?: string;
  bio?: string;
  categories?: string[];
}

export async function updateMyProfileDetails(patch: MyProfileDetailsInput): Promise<SpecialistProfile> {
  myProfileState = { ...myProfileState, ...patch };
  return { ...myProfileState };
}

// ---------------------------------------------------------------------------
// Wizytówka
// ---------------------------------------------------------------------------
export async function getMyCard(): Promise<BusinessCard | null> {
  try {
    return await request<BusinessCard | null>("/cards/me");
  } catch {
    return null;
  }
}

/** Tworzy LUB aktualizuje jedyną (primary) wizytówkę użytkownika. */
export async function updateMyCard(patch: Partial<BusinessCard>): Promise<BusinessCard> {
  return request<BusinessCard>("/cards/me", { method: "PUT", body: JSON.stringify(patch) });
}

export async function getCardBackgrounds(): Promise<CardBackground[]> {
  return request<CardBackground[]>("/backgrounds");
}

// ---------------------------------------------------------------------------
// Specjaliści
// ---------------------------------------------------------------------------
export async function getCategories(): Promise<string[]> {
  // TODO: brak jeszcze GET /api/categories — na razie stała lista pasująca do seeda backendu
  return ["Architektura", "Design", "Finanse", "Marketing", "Nieruchomości", "Prawo", "Zdrowie"];
}

export async function getSpecialists(filters: SpecialistFilters): Promise<SpecialistProfile[]> {
  const params = new URLSearchParams();
  if (filters.query) params.set("query", filters.query);
  if (filters.categories.length > 0) params.set("categories", filters.categories.join(","));
  if (filters.radiusKm > 0) params.set("radiusKm", String(filters.radiusKm));
  params.set("sortBy", filters.sortBy);

  return request<SpecialistProfile[]>(`/specialists?${params.toString()}`);
}

export async function getSpecialistById(id: string): Promise<SpecialistProfile | undefined> {
  try {
    return await request<SpecialistProfile>(`/specialists/${id}`);
  } catch {
    return undefined;
  }
}

export interface AddReviewInput {
  rating: number;
  comment?: string;
}

export async function addReview(specialistId: string, input: AddReviewInput): Promise<Review> {
  return request<Review>(`/specialists/${specialistId}/reviews`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export interface BecomeSpecialistInput {
  profession: string;
  bio: string;
  categories: string[];
  city: string;
}

export async function becomeSpecialist(input: BecomeSpecialistInput): Promise<SpecialistProfile> {
  return request<SpecialistProfile>("/specialists", { method: "POST", body: JSON.stringify(input) });
}

// ---------------------------------------------------------------------------
// Wymiana (NFC / QR)
// TODO: prawdziwy handshake NFC/QR między dwoma telefonami wymaga osobnego protokołu
// (kto komu wysyła co i kiedy) — dopóki go nie ma, historia wymian zostaje na mocku,
// żeby dało się przetestować cały UX bez dwóch fizycznych urządzeń.
// ---------------------------------------------------------------------------
let myExchangesState: ExchangeResult[] = [...MOCK_EXCHANGES];

export async function submitExchange(method: ExchangeMethod): Promise<ExchangeResult> {
  const exchange: ExchangeResult = {
    id: `ex_${Date.now()}`,
    method,
    card: INCOMING_MOCK_CARD,
    createdAt: new Date().toISOString(),
  };
  myExchangesState = [exchange, ...myExchangesState];
  return exchange;
}

export async function getMyExchanges(): Promise<ExchangeResult[]> {
  return [...myExchangesState];
}
