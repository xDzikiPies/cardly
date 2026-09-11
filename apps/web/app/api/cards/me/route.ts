import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const card = await prisma.businessCard.findFirst({ where: { userId, isPrimary: true } });
  return NextResponse.json(card);
}

const upsertSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  jobTitle: z.string(),
  company: z.string().optional().nullable(),
  email: z.string().email(),
  phone: z.string(),
  workAddress: z.string().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  backgroundId: z.string(),
});

/** Tworzy albo aktualizuje jedyną (primary) wizytówkę usera. */
export async function PUT(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const parsed = upsertSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.businessCard.findFirst({ where: { userId, isPrimary: true } });

  const card = existing
    ? await prisma.businessCard.update({ where: { id: existing.id }, data: parsed.data })
    : await prisma.businessCard.create({ data: { ...parsed.data, userId, isPrimary: true } });

  return NextResponse.json(card);
}
