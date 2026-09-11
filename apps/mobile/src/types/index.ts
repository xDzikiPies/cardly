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
