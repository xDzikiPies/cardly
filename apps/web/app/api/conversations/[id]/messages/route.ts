import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

interface MessageRow {
  id: string;
  text: string;
  senderId: string;
  createdAt: Date;
}

interface Params {
  params: Promise<{ id: string }>;
}

async function assertParticipant(conversationId: string, userId: string) {
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  return !!participant;
}

/** GET /api/conversations/:id/messages — historia wiadomości + oznacza jako przeczytane */
export async function GET(req: NextRequest, { params }: Params) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id: conversationId } = await params;
  if (!(await assertParticipant(conversationId, userId))) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });

  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId, userId } },
    data: { lastReadAt: new Date() },
  });

  return NextResponse.json(
    (messages as MessageRow[]).map((m) => ({
      id: m.id,
      text: m.text,
      senderId: m.senderId,
      isMine: m.senderId === userId,
      createdAt: m.createdAt.toISOString(),
    }))
  );
}

const bodySchema = z.object({ text: z.string().min(1).max(2000) });

/** POST /api/conversations/:id/messages — wysyła wiadomość + powiadomienie dla drugiej strony */
export async function POST(req: NextRequest, { params }: Params) {
  const senderId = await getUserIdFromRequest(req);
  if (!senderId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id: conversationId } = await params;
  if (!(await assertParticipant(conversationId, senderId))) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });

  const message = await prisma.message.create({
    data: { conversationId, senderId, text: parsed.data.text },
    include: { sender: true },
  });

  const otherParticipant = await prisma.conversationParticipant.findFirst({
    where: { conversationId, userId: { not: senderId } },
  });

  if (otherParticipant) {
    await createNotification(
      otherParticipant.userId,
      "message",
      `Wiadomość od ${message.sender.firstName}`,
      parsed.data.text.slice(0, 120),
      { conversationId }
    );
  }

  return NextResponse.json({
    id: message.id,
    text: message.text,
    senderId: message.senderId,
    isMine: true,
    createdAt: message.createdAt.toISOString(),
  });
}
