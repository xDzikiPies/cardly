import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

interface Params {
  params: Promise<{ id: string }>;
}

const bodySchema = z.object({ status: z.enum(["accepted", "declined"]) });

export async function PATCH(req: NextRequest, { params }: Params) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });

  const quoteRequest = await prisma.quoteRequest.findUnique({
    where: { id },
    include: { specialistProfile: true, requester: true },
  });
  if (!quoteRequest || quoteRequest.specialistProfile.userId !== userId) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const updated = await prisma.quoteRequest.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  await createNotification(
    quoteRequest.requesterId,
    "quote_status",
    parsed.data.status === "accepted" ? "Zapytanie zaakceptowane" : "Zapytanie odrzucone",
    `Twoje zapytanie "${quoteRequest.title}" zostało ${parsed.data.status === "accepted" ? "zaakceptowane" : "odrzucone"}`,
    { quoteRequestId: id, conversationId: quoteRequest.conversationId }
  );

  return NextResponse.json({ id: updated.id, status: updated.status });
}
