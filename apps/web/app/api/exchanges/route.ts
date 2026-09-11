import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

const bodySchema = z.object({
  method: z.enum(["NFC", "QR"]),
  toUserId: z.string(),
  cardId: z.string(), // wizytówka NADAWCY, którą odbiera "toUser"
});

/**
 * POST /api/exchanges
 * Wywoływane przez OBA telefony po zakończeniu handshake'u NFC/QR —
 * każda strona zgłasza, czyją wizytówkę odebrała.
 */
export async function POST(req: NextRequest) {
  const fromUserId = await getUserIdFromRequest(req);
  if (!fromUserId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { method, toUserId, cardId } = bodySchema.parse(await req.json());

  const exchange = await prisma.exchange.create({
    data: { method, fromUserId, toUserId, cardId },
    include: { card: true },
  });

  return NextResponse.json(exchange);
}

/** GET /api/exchanges — historia odebranych wizytówek zalogowanego użytkownika */
export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const exchanges = await prisma.exchange.findMany({
    where: { toUserId: userId },
    include: { card: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(exchanges);
}
