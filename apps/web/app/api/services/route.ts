import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

/** GET /api/services — moje usługi (jako specjalista) */
export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const profile = await prisma.specialistProfile.findUnique({ where: { userId } });
  if (!profile) return NextResponse.json([]);

  const services = await prisma.serviceOffering.findMany({
    where: { specialistProfileId: profile.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(services);
}

const bodySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive().optional().nullable(),
  priceUnit: z.string().optional(),
});

/** POST /api/services — dodaje usługę do WŁASNEGO profilu specjalisty */
export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });

  const profile = await prisma.specialistProfile.findUnique({ where: { userId } });
  if (!profile) {
    return NextResponse.json({ error: "NOT_A_SPECIALIST" }, { status: 400 });
  }

  const service = await prisma.serviceOffering.create({
    data: { ...parsed.data, specialistProfileId: profile.id },
  });
  return NextResponse.json(service);
}
