import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

interface ReviewWithAuthor {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  author: { firstName: string; lastName: string; avatarUrl: string | null };
}

interface ServiceRow {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  priceUnit: string | null;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const profile = await prisma.specialistProfile.findUnique({
    where: { id },
    include: {
      user: true,
      reviews: { include: { author: true }, orderBy: { createdAt: "desc" } },
      services: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!profile) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  return NextResponse.json({
    id: profile.id,
    userId: profile.userId,
    firstName: profile.user.firstName,
    lastName: profile.user.lastName,
    avatarUrl: profile.user.avatarUrl ?? undefined,
    profession: profile.profession,
    bio: profile.bio,
    categories: profile.categories,
    city: profile.city,
    distanceKm: 0,
    ratingAvg: profile.ratingAvg,
    ratingCount: profile.ratingCount,
    reviews: (profile.reviews as ReviewWithAuthor[]).map((r) => ({
      id: r.id,
      authorName: `${r.author.firstName} ${r.author.lastName}`,
      authorAvatarUrl: r.author.avatarUrl ?? undefined,
      rating: r.rating,
      comment: r.comment ?? undefined,
      createdAt: r.createdAt.toISOString(),
    })),
    services: (profile.services as ServiceRow[]).map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description ?? undefined,
      price: s.price ?? undefined,
      priceUnit: s.priceUnit ?? undefined,
    })),
  });
}
