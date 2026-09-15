import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

interface ReviewWithAuthor {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  author: { firstName: string; lastName: string; avatarUrl: string | null };
}

/** GET/PATCH /api/profile — rozszerzony profil (bio, zawód, kategorie, opinie o mnie).
 *  To alias na własny SpecialistProfile usera — jeśli jeszcze nie istnieje (user nie jest
 *  jeszcze specjalistą), zwracamy/tworzymy "pusty" wpis zamiast 404, żeby ekran Profil
 *  w apce zawsze miał czym się wypełnić. */

async function serialize(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const profile = await prisma.specialistProfile.findUnique({
    where: { userId },
    include: { reviews: { include: { author: true }, orderBy: { createdAt: "desc" } } },
  });

  if (!profile) {
    return {
      id: "",
      userId,
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      avatarUrl: user?.avatarUrl ?? undefined,
      profession: "",
      bio: "",
      categories: [] as string[],
      city: "",
      distanceKm: 0,
      ratingAvg: 0,
      ratingCount: 0,
      reviews: [],
    };
  }

  return {
    id: profile.id,
    userId: profile.userId,
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    avatarUrl: user?.avatarUrl ?? undefined,
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
  };
}

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  return NextResponse.json(await serialize(userId));
}

const patchSchema = z.object({
  profession: z.string().optional(),
  bio: z.string().optional(),
  categories: z.array(z.string()).optional(),
});

export async function PATCH(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });

  const existing = await prisma.specialistProfile.findUnique({ where: { userId } });

  if (existing) {
    await prisma.specialistProfile.update({ where: { userId }, data: parsed.data });
  } else {
    await prisma.specialistProfile.create({
      data: {
        userId,
        profession: parsed.data.profession ?? "",
        bio: parsed.data.bio ?? "",
        categories: parsed.data.categories ?? [],
        city: "",
        latitude: 0,
        longitude: 0,
        isPublished: false, // profil istnieje, ale user nie zrobił jeszcze świadomego "dołącz jako specjalista"
      },
    });
  }

  return NextResponse.json(await serialize(userId));
}
