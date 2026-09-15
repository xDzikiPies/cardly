import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

interface ExchangeWithCard {
  id: string;
  method: string;
  createdAt: Date;
  card: {
    id: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
    company: string | null;
    email: string;
    phone: string;
    workAddress: string | null;
    backgroundId: string;
    isPrimary: boolean;
    userId: string;
  };
}

const bodySchema = z.object({
  cardId: z.string().min(1),
  method: z.enum(["NFC", "QR"]),
});

/**
 * POST /api/exchanges — wywoływane przez ODBIORCĘ (identyfikowany własnym JWT-em) po
 * zeskanowaniu/odczytaniu linku z wizytówką nadawcy. `cardId` to stabilne ID karty
 * (nie sekret — wizytówka ma być publiczna), więc nie trzeba żadnej ephemeral sesji/tokenu.
 */
export async function POST(req: NextRequest) {
  const toUserId = await getUserIdFromRequest(req);
  if (!toUserId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  const { cardId, method } = parsed.data;

  const card = await prisma.businessCard.findUnique({ where: { id: cardId } });
  if (!card) return NextResponse.json({ error: "CARD_NOT_FOUND" }, { status: 404 });

  if (card.userId === toUserId) {
    return NextResponse.json({ error: "CANNOT_EXCHANGE_WITH_SELF" }, { status: 400 });
  }

  const exchange = await prisma.exchange.create({
    data: { method, fromUserId: card.userId, toUserId, cardId },
  });

  return NextResponse.json({
    id: exchange.id,
    method: exchange.method,
    createdAt: exchange.createdAt.toISOString(),
    card: {
      id: card.id,
      firstName: card.firstName,
      lastName: card.lastName,
      jobTitle: card.jobTitle,
      company: card.company,
      email: card.email,
      phone: card.phone,
      workAddress: card.workAddress,
      backgroundId: card.backgroundId,
      isPrimary: card.isPrimary,
      userId: card.userId,
    },
  });
}

/** GET /api/exchanges — historia odebranych wizytówek zalogowanego użytkownika. */
export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const exchanges = await prisma.exchange.findMany({
    where: { toUserId: userId },
    include: { card: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    (exchanges as ExchangeWithCard[]).map((ex) => ({
      id: ex.id,
      method: ex.method,
      createdAt: ex.createdAt.toISOString(),
      card: {
        id: ex.card.id,
        firstName: ex.card.firstName,
        lastName: ex.card.lastName,
        jobTitle: ex.card.jobTitle,
        company: ex.card.company,
        email: ex.card.email,
        phone: ex.card.phone,
        workAddress: ex.card.workAddress,
        backgroundId: ex.card.backgroundId,
        isPrimary: ex.card.isPrimary,
        userId: ex.card.userId,
      },
    }))
  );
}
