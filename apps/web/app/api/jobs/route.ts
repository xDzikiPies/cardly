import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

interface JobRow {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number | null;
  budgetType: string;
  city: string;
  deadline: Date | null;
  createdAt: Date;
  authorId: string;
  author: { firstName: string; lastName: string };
  _count: { applications: number };
}

/** GET /api/jobs?query=&category=&city=&budgetType=&sortBy= — lista otwartych zleceń */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query")?.trim() ?? "";
  const category = searchParams.get("category") ?? "";
  const city = searchParams.get("city") ?? "";
  const budgetType = searchParams.get("budgetType") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "recent";

  const jobs = await prisma.jobListing.findMany({
    where: {
      status: "open",
      ...(category ? { category } : {}),
      ...(city ? { city: { equals: city, mode: "insensitive" } } : {}),
      ...(budgetType ? { budgetType } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { author: true, _count: { select: { applications: true } } },
  });

  const result = (jobs as JobRow[]).map((j) => ({
    id: j.id,
    title: j.title,
    description: j.description,
    category: j.category,
    budget: j.budget ?? undefined,
    budgetType: j.budgetType,
    city: j.city,
    deadline: j.deadline?.toISOString(),
    createdAt: j.createdAt.toISOString(),
    authorName: `${j.author.firstName} ${j.author.lastName}`,
    authorId: j.authorId,
    applicationsCount: j._count.applications,
  }));

  if (sortBy === "budget") result.sort((a, b) => (b.budget ?? 0) - (a.budget ?? 0));
  if (sortBy === "deadline") {
    result.sort((a, b) => new Date(a.deadline ?? "9999").getTime() - new Date(b.deadline ?? "9999").getTime());
  }
  if (sortBy === "recent") {
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return NextResponse.json(result);
}

const bodySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  budget: z.number().positive().optional().nullable(),
  budgetType: z.enum(["fixed", "hourly", "negotiable"]).default("negotiable"),
  city: z.string().min(1),
  latitude: z.number().optional().default(0),
  longitude: z.number().optional().default(0),
  deadline: z.string().datetime().optional().nullable(),
});

/** POST /api/jobs — wystawia nowe zlecenie */
export async function POST(req: NextRequest) {
  const authorId = await getUserIdFromRequest(req);
  if (!authorId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT", details: parsed.error.flatten() }, { status: 400 });
  }

  const { deadline, ...rest } = parsed.data;
  const job = await prisma.jobListing.create({
    data: { ...rest, authorId, deadline: deadline ? new Date(deadline) : undefined },
  });

  return NextResponse.json(job);
}
