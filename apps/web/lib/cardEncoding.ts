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
