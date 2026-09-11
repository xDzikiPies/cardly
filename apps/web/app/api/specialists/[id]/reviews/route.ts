import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

interface Params {
  params: Promise<{ id: string }>;
}

const bodySchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: Params) {
  const authorId = await getUserIdFromRequest(req);
  if (!authorId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id: specialistProfileId } = await params;
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const review = await prisma.review.create({
    data: { specialistProfileId, authorId, ...parsed.data },
    include: { author: true },
  });

  const agg = await prisma.review.aggregate({
    where: { specialistProfileId },
    _avg: { rating: true },
    _count: true,
  });

  await prisma.specialistProfile.update({
    where: { id: specialistProfileId },
    data: {
      ratingAvg: Math.round((agg._avg.rating ?? 0) * 10) / 10,
      ratingCount: agg._count,
    },
  });

  return NextResponse.json({
    id: review.id,
    authorName: `${review.author.firstName} ${review.author.lastName}`,
    authorAvatarUrl: review.author.avatarUrl ?? undefined,
    rating: review.rating,
    comment: review.comment ?? undefined,
    createdAt: review.createdAt.toISOString(),
  });
}
