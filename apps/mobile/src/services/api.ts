import {
  AppNotification,
  BusinessCard,
  CardBackground,
  ChatMessage,
  ConversationSummary,
  ExchangeMethod,
  ExchangeResult,
  JobApplication,
  JobFilters,
  JobListing,
  QuoteRequest,
  Review,
  ServiceOffering,
  SpecialistFilters,
  SpecialistProfile,
  User,
  ConversationInfo
} from "@/types";
import { getToken, setToken, clearToken } from "@/lib/tokenStore";

export async function getConversationInfo(conversationId: string): Promise<ConversationInfo> {
  return request<ConversationInfo>(`/conversations/${conversationId}`);
}

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";
/** Bazowy adres bez `/api` — do budowania pełnych URL-i do uploadowanych plików. */
export const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

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
  } catch (err) {
    console.error("--> RZECZYWISTY BŁĄD Z API (login):", err);
    throw err; // Pozwoli zobaczyć w konsoli dokładny status i wiadomość!
  }
}

export async function register(input: RegisterInput): Promise<User> {
  try {
    const { token, user } = await request<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
    await setToken(token);
    return user;
  } catch (err) {
    console.error("--> RZECZYWISTY BŁĄD Z API (register):", err);
    throw err;
  }
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// export async function register(input: RegisterInput): Promise<User> {
//   const { token, user } = await request<{ token: string; user: User }>("/auth/register", {
//     method: "POST",
//     body: JSON.stringify(input),
//   });
//   await setToken(token);
//   return user;
// }

export async function logout(): Promise<void> {
  await clearToken();
}

export async function getCurrentUser(): Promise<User> {
  return request<User>("/auth/me");
}

// ---------------------------------------------------------------------------
// Mój rozszerzony profil (bio, zawód, kategorie, opinie o mnie)
// ---------------------------------------------------------------------------
export async function getMyProfileDetails(): Promise<SpecialistProfile> {
  return request<SpecialistProfile>("/profile");
}

export interface MyProfileDetailsInput {
  profession?: string;
  bio?: string;
  categories?: string[];
}

export async function updateMyProfileDetails(patch: MyProfileDetailsInput): Promise<SpecialistProfile> {
  return request<SpecialistProfile>("/profile", { method: "PATCH", body: JSON.stringify(patch) });
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
// ---------------------------------------------------------------------------
export interface SubmitExchangeResult extends ExchangeResult {}

/** Zapisuje wymianę na backendzie — `cardId` to stabilne ID karty nadawcy
 *  (wyciągnięte z zeskanowanego/odczytanego linku), NIE surowe dane. */
export async function submitExchange(method: ExchangeMethod, cardId: string): Promise<ExchangeResult> {
  return request<ExchangeResult>("/exchanges", {
    method: "POST",
    body: JSON.stringify({ cardId, method }),
  });
}

export async function getMyExchanges(): Promise<ExchangeResult[]> {
  return request<ExchangeResult[]>("/exchanges");
}

// ---------------------------------------------------------------------------
// Upload zdjęć (do zapytań o wycenę)
// TODO: to zapisuje pliki na dysk backendu (patrz komentarz w apps/web/app/api/upload) —
// działa lokalnie/na VPS, NIE na Vercelu. Przed produkcją podmienić backend na S3/Cloudinary,
// funkcja mobile zostaje bez zmian (URL i tak przychodzi z backendu).
// ---------------------------------------------------------------------------
export async function uploadImage(localUri: string): Promise<string> {
  const token = await getToken();
  const filename = localUri.split("/").pop() ?? `photo_${Date.now()}.jpg`;
  const match = /\.(\w+)$/.exec(filename);
  const ext = match?.[1]?.toLowerCase() ?? "jpg";
  const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

  const formData = new FormData();
  formData.append("file", { uri: localUri, name: filename, type: mime } as unknown as Blob);

  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: formData,
  });

  if (!res.ok) throw new Error("UPLOAD_FAILED");
  const { url } = await res.json();
  return `${SERVER_URL}${url}`;
}

// ---------------------------------------------------------------------------
// Usługi specjalisty (z cennikiem)
// ---------------------------------------------------------------------------
export async function getMyServices(): Promise<ServiceOffering[]> {
  return request<ServiceOffering[]>("/services");
}

export interface AddServiceInput {
  name: string;
  description?: string;
  price?: number | null;
  priceUnit?: string;
}

export async function addService(input: AddServiceInput): Promise<ServiceOffering> {
  return request<ServiceOffering>("/services", { method: "POST", body: JSON.stringify(input) });
}

export async function deleteService(id: string): Promise<void> {
  await request(`/services/${id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Zapytania o wycenę ("Zapytaj o wycenę" na profilu specjalisty)
// ---------------------------------------------------------------------------
export interface SubmitQuoteRequestInput {
  specialistProfileId: string;
  title: string;
  description: string;
  budget?: number | null;
  attachmentUrls?: string[];
}

export async function submitQuoteRequest(input: SubmitQuoteRequestInput): Promise<QuoteRequest> {
  return request<QuoteRequest>("/quote-requests", { method: "POST", body: JSON.stringify(input) });
}

export async function getMyQuoteRequests(): Promise<{ sent: QuoteRequest[]; received: QuoteRequest[] }> {
  return request("/quote-requests");
}

export async function updateQuoteRequestStatus(
  id: string,
  status: "accepted" | "declined"
): Promise<{ id: string; status: string }> {
  return request(`/quote-requests/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
}

// ---------------------------------------------------------------------------
// Rynek zleceń
// ---------------------------------------------------------------------------
export async function getJobs(filters: JobFilters): Promise<JobListing[]> {
  const params = new URLSearchParams();
  if (filters.query) params.set("query", filters.query);
  if (filters.category) params.set("category", filters.category);
  if (filters.city) params.set("city", filters.city);
  if (filters.budgetType) params.set("budgetType", filters.budgetType);
  params.set("sortBy", filters.sortBy);

  return request<JobListing[]>(`/jobs?${params.toString()}`);
}

export async function getJobById(id: string): Promise<JobListing | undefined> {
  try {
    return await request<JobListing>(`/jobs/${id}`);
  } catch {
    return undefined;
  }
}

export interface CreateJobInput {
  title: string;
  description: string;
  category: string;
  budget?: number | null;
  budgetType: "fixed" | "hourly" | "negotiable";
  city: string;
  deadline?: string | null;
}

export async function createJob(input: CreateJobInput): Promise<JobListing> {
  return request<JobListing>("/jobs", { method: "POST", body: JSON.stringify(input) });
}

export interface ApplyToJobInput {
  message?: string;
  price?: number | null;
}

export async function applyToJob(jobId: string, input: ApplyToJobInput): Promise<JobApplication> {
  return request<JobApplication>(`/jobs/${jobId}/applications`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getJobApplications(jobId: string): Promise<JobApplication[]> {
  return request<JobApplication[]>(`/jobs/${jobId}/applications`);
}

// ---------------------------------------------------------------------------
// Powiadomienia
// ---------------------------------------------------------------------------
export async function getNotifications(): Promise<AppNotification[]> {
  return request<AppNotification[]>("/notifications");
}

export async function getUnreadNotificationsCount(): Promise<number> {
  const { count } = await request<{ count: number }>("/notifications/unread-count");
  return count;
}

export async function markAllNotificationsRead(): Promise<void> {
  await request("/notifications", { method: "PATCH" });
}

export async function markNotificationRead(id: string): Promise<void> {
  await request(`/notifications/${id}`, { method: "PATCH" });
}

// ---------------------------------------------------------------------------
// Czat
// ---------------------------------------------------------------------------
export async function getConversations(): Promise<ConversationSummary[]> {
  return request<ConversationSummary[]>("/conversations");
}

export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  return request<ChatMessage[]>(`/conversations/${conversationId}/messages`);
}

export async function sendMessage(conversationId: string, text: string): Promise<ChatMessage> {
  return request<ChatMessage>(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}
