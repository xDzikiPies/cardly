import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

/** Kształt zwracany przez Prisma dla tego konkretnego include — jawny typ zamiast polegać
 *  na inferencji, żeby plik type-checkował się nawet zanim `prisma generate` zdąży się wygenerować. */
interface SpecialistWithUser {
  id: string;
  userId: string;
  profession: string;
  bio: string;
  categories: string[];
  city: string;
  latitude: number;
  longitude: number;
  ratingAvg: number;
  ratingCount: number;
  user: { firstName: string; lastName: string; avatarUrl: string | null };
}

/**
 * GET /api/specialists?query=&categories=Prawo,Finanse&radiusKm=10&sortBy=rating&lat=..&lng=..
 * Kształt odpowiedzi 1:1 z `SpecialistProfile[]` w apps/mobile/src/types.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query")?.trim() ?? "";
  const categories = searchParams.get("categories")?.split(",").filter(Boolean) ?? [];
  const radiusKm = Number(searchParams.get("radiusKm") ?? 0);
  const sortBy = searchParams.get("sortBy") ?? "rating";
  const lat = Number(searchParams.get("lat") ?? 0);
  const lng = Number(searchParams.get("lng") ?? 0);

  const profiles = await prisma.specialistProfile.findMany({
    where: {
      isPublished: true,
      ...(categories.length > 0 ? { categories: { hasSome: categories } } : {}),
      ...(query
        ? {
            OR: [
              { profession: { contains: query, mode: "insensitive" } },
              { city: { contains: query, mode: "insensitive" } },
              { user: { firstName: { contains: query, mode: "insensitive" } } },
              { user: { lastName: { contains: query, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: { user: true },
  });

  let result = (profiles as SpecialistWithUser[]).map((p) => ({
    id: p.id,
    userId: p.userId,
    firstName: p.user.firstName,
    lastName: p.user.lastName,
    avatarUrl: p.user.avatarUrl ?? undefined,
    profession: p.profession,
    bio: p.bio,
    categories: p.categories,
    city: p.city,
    distanceKm: lat && lng ? haversineKm(lat, lng, p.latitude, p.longitude) : 0,
    ratingAvg: p.ratingAvg,
    ratingCount: p.ratingCount,
  }));

  if (radiusKm > 0) {
    result = result.filter((s) => s.distanceKm <= radiusKm);
  }

  if (sortBy === "rating") result.sort((a, b) => b.ratingAvg - a.ratingAvg);
  if (sortBy === "distance") result.sort((a, b) => a.distanceKm - b.distanceKm);
  if (sortBy === "name") result.sort((a, b) => a.firstName.localeCompare(b.firstName));

  return NextResponse.json(result);
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const becomeSpecialistSchema = z.object({
  profession: z.string().min(1),
  bio: z.string().min(1),
  categories: z.array(z.string()).min(1),
  city: z.string().min(1),
  latitude: z.number().optional().default(0),
  longitude: z.number().optional().default(0),
});

/** POST /api/specialists — "Dołącz jako specjalista", osobny krok od rejestracji konta. */
export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const parsed = becomeSpecialistSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.specialistProfile.findUnique({ where: { userId } });
  if (existing) {
    return NextResponse.json({ error: "ALREADY_SPECIALIST" }, { status: 409 });
  }

  const profile = await prisma.specialistProfile.create({
    data: { ...parsed.data, userId },
    include: { user: true },
  });

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
    ratingAvg: 0,
    ratingCount: 0,
  });
}
