import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";
import { createNotification, createConversation } from "@/lib/notifications";

interface QuoteSentRow {
  id: string;
  title: string;
  description: string;
  budget: number | null;
  status: string;
  conversationId: string | null;
  createdAt: Date;
  attachments: { url: string }[];
  specialistProfile: { user: { firstName: string; lastName: string } };
}

interface QuoteReceivedRow {
  id: string;
  title: string;
  description: string;
  budget: number | null;
  status: string;
  conversationId: string | null;
  createdAt: Date;
  attachments: { url: string }[];
  requester: { firstName: string; lastName: string };
}

const bodySchema = z.object({
  specialistProfileId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  budget: z.number().positive().optional().nullable(),
  attachmentUrls: z.array(z.string()).max(6).optional().default([]),
});

/** POST /api/quote-requests — "Zapytaj o wycenę" na profilu specjalisty */
export async function POST(req: NextRequest) {
  const requesterId = await getUserIdFromRequest(req);
  if (!requesterId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  const { specialistProfileId, title, description, budget, attachmentUrls } = parsed.data;

  const profile = await prisma.specialistProfile.findUnique({ where: { id: specialistProfileId } });
  if (!profile) return NextResponse.json({ error: "SPECIALIST_NOT_FOUND" }, { status: 404 });
  if (profile.userId === requesterId) {
    return NextResponse.json({ error: "CANNOT_MESSAGE_YOURSELF" }, { status: 400 });
  }

  const conversation = await createConversation(requesterId, profile.userId);

  const quoteRequest = await prisma.quoteRequest.create({
    data: {
      specialistProfileId,
      requesterId,
      title,
      description,
      budget: budget ?? undefined,
      conversationId: conversation.id,
      attachments: { create: attachmentUrls.map((url) => ({ url })) },
    },
    include: { attachments: true, requester: true },
  });

  await createNotification(
    profile.userId,
    "quote_request",
    "Nowe zapytanie o wycenę",
    `${quoteRequest.requester.firstName} ${quoteRequest.requester.lastName}: ${title}`,
    { quoteRequestId: quoteRequest.id, conversationId: conversation.id }
  );

  return NextResponse.json({
    id: quoteRequest.id,
    title: quoteRequest.title,
    description: quoteRequest.description,
    budget: quoteRequest.budget ?? undefined,
    status: quoteRequest.status,
    attachments: quoteRequest.attachments.map((a: { url: string }) => a.url),
    conversationId: conversation.id,
    createdAt: quoteRequest.createdAt.toISOString(),
  });
}

/** GET /api/quote-requests — moje zapytania: wysłane (jako klient) + otrzymane (jako specjalista) */
export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const myProfile = await prisma.specialistProfile.findUnique({ where: { userId } });

  const [sent, received] = await Promise.all([
    prisma.quoteRequest.findMany({
      where: { requesterId: userId },
      include: { attachments: true, specialistProfile: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    }),
    myProfile
      ? prisma.quoteRequest.findMany({
          where: { specialistProfileId: myProfile.id },
          include: { attachments: true, requester: true },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  return NextResponse.json({
    sent: (sent as QuoteSentRow[]).map((q) => ({
      id: q.id,
      title: q.title,
      description: q.description,
      budget: q.budget ?? undefined,
      status: q.status,
      attachments: q.attachments.map((a) => a.url),
      conversationId: q.conversationId,
      createdAt: q.createdAt.toISOString(),
      specialistName: `${q.specialistProfile.user.firstName} ${q.specialistProfile.user.lastName}`,
    })),
    received: (received as QuoteReceivedRow[]).map((q) => ({
      id: q.id,
      title: q.title,
      description: q.description,
      budget: q.budget ?? undefined,
      status: q.status,
      attachments: q.attachments.map((a) => a.url),
      conversationId: q.conversationId,
      createdAt: q.createdAt.toISOString(),
      requesterName: `${q.requester.firstName} ${q.requester.lastName}`,
    })),
  });
}
