import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";
import { createNotification, createConversation } from "@/lib/notifications";

interface Params {
  params: Promise<{ id: string }>;
}

interface ApplicationRow {
  id: string;
  message: string | null;
  price: number | null;
  status: string;
  conversationId: string | null;
  createdAt: Date;
  applicant: { firstName: string; lastName: string; avatarUrl: string | null };
}

const bodySchema = z.object({
  message: z.string().optional(),
  price: z.number().positive().optional().nullable(),
});

export async function POST(req: NextRequest, { params }: Params) {
  const applicantId = await getUserIdFromRequest(req);
  if (!applicantId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id: jobListingId } = await params;
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });

  const job = await prisma.jobListing.findUnique({ where: { id: jobListingId } });
  if (!job) return NextResponse.json({ error: "JOB_NOT_FOUND" }, { status: 404 });
  if (job.authorId === applicantId) {
    return NextResponse.json({ error: "CANNOT_APPLY_TO_OWN_JOB" }, { status: 400 });
  }

  const conversation = await createConversation(applicantId, job.authorId);

  const application = await prisma.jobApplication.create({
    data: { jobListingId, applicantId, ...parsed.data, conversationId: conversation.id },
    include: { applicant: true },
  });

  await createNotification(
    job.authorId,
    "job_application",
    "Nowe zgłoszenie do zlecenia",
    `${application.applicant.firstName} ${application.applicant.lastName} zgłosił się do "${job.title}"`,
    { jobListingId, applicationId: application.id, conversationId: conversation.id }
  );

  return NextResponse.json({
    id: application.id,
    message: application.message ?? undefined,
    price: application.price ?? undefined,
    status: application.status,
    conversationId: conversation.id,
    createdAt: application.createdAt.toISOString(),
  });
}

export async function GET(req: NextRequest, { params }: Params) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id: jobListingId } = await params;
  const job = await prisma.jobListing.findUnique({ where: { id: jobListingId } });
  if (!job || job.authorId !== userId) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const applications = await prisma.jobApplication.findMany({
    where: { jobListingId },
    include: { applicant: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    (applications as ApplicationRow[]).map((a) => ({
      id: a.id,
      message: a.message ?? undefined,
      price: a.price ?? undefined,
      status: a.status,
      conversationId: a.conversationId,
      createdAt: a.createdAt.toISOString(),
      applicantName: `${a.applicant.firstName} ${a.applicant.lastName}`,
      applicantAvatarUrl: a.applicant.avatarUrl ?? undefined,
    }))
  );
}
