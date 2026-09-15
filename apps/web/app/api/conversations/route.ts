import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

interface UserRow {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

interface ParticipationRow {
  userId: string;
  lastReadAt: Date | null;
  conversation: {
    id: string;
    createdAt: Date;
    participants: { userId: string; user: UserRow }[];
    messages: { text: string; senderId: string; createdAt: Date }[];
    quoteRequest: { title: string } | null;
    jobApplication: { jobListing: { title: string } } | null;
  };
}

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const participations = await prisma.conversationParticipant.findMany({
    where: { userId },
    include: {
      conversation: {
        include: {
          participants: { include: { user: true } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
          quoteRequest: true,
          jobApplication: { include: { jobListing: true } },
        },
      },
    },
  });

  const result = (participations as ParticipationRow[])
    .map((p) => {
      const conv = p.conversation;
      const other = conv.participants.find((x) => x.userId !== userId)?.user;
      const lastMessage = conv.messages[0];
      const context = conv.quoteRequest
        ? { type: "quote_request" as const, title: conv.quoteRequest.title }
        : conv.jobApplication
        ? { type: "job_application" as const, title: conv.jobApplication.jobListing.title }
        : null;

      return {
        id: conv.id,
        otherUserName: other ? `${other.firstName} ${other.lastName}` : "Użytkownik",
        otherUserAvatarUrl: other?.avatarUrl ?? undefined,
        lastMessageText: lastMessage?.text,
        lastMessageAt: (lastMessage?.createdAt ?? conv.createdAt).toISOString(),
        isUnread: !!lastMessage && lastMessage.senderId !== userId && (!p.lastReadAt || lastMessage.createdAt > p.lastReadAt),
        context,
      };
    })
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  return NextResponse.json(result);
}
