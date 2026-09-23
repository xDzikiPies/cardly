export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
}

export interface CardBackground {
  id: string;
  name: string;
  colorStart: string;
  colorEnd: string;
  textColor: string;
  pattern: "none" | "dots" | "waves" | "grid";
  isPremium?: boolean;
}

export interface BusinessCard {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  company?: string;
  email: string;
  phone: string;
  workAddress?: string;
  logoUrl?: string;
  backgroundId: string;
  isPrimary: boolean;
}

export interface Review {
  id: string;
  authorName: string;
  authorAvatarUrl?: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string; // ISO
}

export interface ServiceOffering {
  id: string;
  name: string;
  description?: string;
  price?: number; // brak = "Do ustalenia"
  priceUnit?: string;
}

export interface SpecialistProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  profession: string;
  bio: string;
  categories: string[];
  city: string;
  distanceKm: number; // liczone względem lokalizacji użytkownika (mock/haversine)
  ratingAvg: number;
  ratingCount: number;
  card?: BusinessCard;
  reviews: Review[];
  services?: ServiceOffering[];
}

export type SpecialistSortKey = "rating" | "distance" | "name";

export interface SpecialistFilters {
  query: string;
  categories: string[];
  radiusKm: number; // 0 = bez limitu
  sortBy: SpecialistSortKey;
}

export type ExchangeMethod = "NFC" | "QR";

export interface ExchangeResult {
  id: string;
  method: ExchangeMethod;
  card: BusinessCard;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Zapytania o wycenę
// ---------------------------------------------------------------------------
export type QuoteRequestStatus = "pending" | "accepted" | "declined";

export interface QuoteRequest {
  id: string;
  title: string;
  description: string;
  budget?: number;
  status: QuoteRequestStatus;
  attachments: string[];
  conversationId: string | null;
  createdAt: string;
  specialistName?: string; // obecne gdy to JA wysłałem zapytanie
  requesterName?: string; // obecne gdy JA jestem specjalistą i to dostałem
}

export interface ConversationInfo {
  id: string;
  otherUserName: string;
  otherUserAvatarUrl?: string;
  context: { type: "quote_request" | "job_application"; title: string } | null;
}

// ---------------------------------------------------------------------------
// Rynek zleceń
// ---------------------------------------------------------------------------
export type JobBudgetType = "fixed" | "hourly" | "negotiable";
export type JobStatus = "open" | "in_progress" | "closed";

export interface JobListing {
  id: string;
  title: string;
  description: string;
  category: string;
  budget?: number;
  budgetType: JobBudgetType;
  city: string;
  deadline?: string;
  status?: JobStatus;
  createdAt: string;
  authorName: string;
  authorId: string;
  applicationsCount: number;
}

export interface JobFilters {
  query: string;
  category: string;
  city: string;
  budgetType: JobBudgetType | "";
  sortBy: "recent" | "budget" | "deadline";
}

export interface JobApplication {
  id: string;
  message?: string;
  price?: number;
  status: "pending" | "accepted" | "rejected";
  conversationId: string | null;
  createdAt: string;
  applicantName: string;
  applicantAvatarUrl?: string;
}

// ---------------------------------------------------------------------------
// Powiadomienia
// ---------------------------------------------------------------------------
export interface AppNotification {
  id: string;
  type: "quote_request" | "quote_status" | "job_application" | "message" | "review";
  title: string;
  body: string;
  isRead: boolean;
  data?: { conversationId?: string; quoteRequestId?: string; jobListingId?: string };
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Czat
// ---------------------------------------------------------------------------
export interface ConversationSummary {
  id: string;
  otherUserName: string;
  otherUserAvatarUrl?: string;
  lastMessageText?: string;
  lastMessageAt: string;
  isUnread: boolean;
  context: { type: "quote_request" | "job_application"; title: string } | null;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  isMine: boolean;
  createdAt: string;
}
