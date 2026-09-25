import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

interface Params {
  params: Promise<{ id: string }>;
}

interface ParticipantRow {
  userId: string;
  user: { firstName: string; lastName: string; avatarUrl: string | null };
}

/** GET /api/conversations/:id — kim jest rozmówca + czego dotyczy wątek (nagłówek czatu). */
export async function GET(req: NextRequest, { params }: Params) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      participants: { include: { user: true } },
      quoteRequest: true,
      jobApplication: { include: { jobListing: true } },
    },
  });

  if (!conversation) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const isParticipant = conversation.participants.some((p) => p.userId === userId);
  if (!isParticipant) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const other = (conversation.participants as ParticipantRow[]).find((p) => p.userId !== userId)?.user;

  const context = conversation.quoteRequest
    ? { type: "quote_request" as const, title: conversation.quoteRequest.title }
    : conversation.jobApplication
    ? { type: "job_application" as const, title: conversation.jobApplication.jobListing.title }
    : null;

  return NextResponse.json({
    id: conversation.id,
    otherUserName: other ? `${other.firstName} ${other.lastName}` : "Użytkownik",
    otherUserAvatarUrl: other?.avatarUrl ?? undefined,
    context,
  });
}
