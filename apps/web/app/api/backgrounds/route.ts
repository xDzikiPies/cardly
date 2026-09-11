import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const backgrounds = await prisma.cardBackground.findMany();
  return NextResponse.json(backgrounds);
}
