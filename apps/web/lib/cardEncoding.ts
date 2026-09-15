/** Kształt wizytówki używany przez publiczne strony/komponenty (bez pól wewnętrznych typu userId). */
export interface PublicBusinessCard {
  firstName: string;
  lastName: string;
  jobTitle: string;
  company?: string;
  email: string;
  phone: string;
  workAddress?: string;
  backgroundId: string;
}

export function decodeCardFromUrlParam(param: string): PublicBusinessCard | null {
  try {
    const jsonStr = decodeURIComponent(atob(param));
    return JSON.parse(jsonStr) as PublicBusinessCard;
  } catch {
    try {
      const jsonStr = decodeURIComponent(param);
      return JSON.parse(jsonStr) as PublicBusinessCard;
    } catch {
      return null;
    }
  }
}

export function encodeCardToUrlParam(card: PublicBusinessCard): string {
  const jsonStr = JSON.stringify(card);
  return btoa(encodeURIComponent(jsonStr));
}