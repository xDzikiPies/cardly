import { prisma } from "./prisma";

export interface PublicCardData {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  company?: string | null;
  email: string;
  phone: string;
  workAddress?: string | null;
  backgroundId: string;
}

export async function getPublicCard(id: string): Promise<PublicCardData | null> {
  const card = await prisma.businessCard.findUnique({ where: { id } });
  if (!card) return null;

  return {
    id: card.id,
    firstName: card.firstName,
    lastName: card.lastName,
    jobTitle: card.jobTitle,
    company: card.company,
    email: card.email,
    phone: card.phone,
    workAddress: card.workAddress,
    backgroundId: card.backgroundId,
  };
}
