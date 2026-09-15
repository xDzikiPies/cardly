import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const job = await prisma.jobListing.findUnique({
    where: { id },
    include: { author: true, _count: { select: { applications: true } } },
  });
  if (!job) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  return NextResponse.json({
    id: job.id,
    title: job.title,
    description: job.description,
    category: job.category,
    budget: job.budget ?? undefined,
    budgetType: job.budgetType,
    city: job.city,
    deadline: job.deadline?.toISOString(),
    status: job.status,
    createdAt: job.createdAt.toISOString(),
    authorName: `${job.author.firstName} ${job.author.lastName}`,
    authorId: job.authorId,
    applicationsCount: job._count.applications,
  });
}
