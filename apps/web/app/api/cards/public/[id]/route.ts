import { NextRequest, NextResponse } from "next/server";
import { getPublicCard } from "@/lib/getPublicCard";

interface Params {
  params: Promise<{ id: string }>;
}

/** GET /api/cards/public/:id — publiczne, TYLKO odczyt. Używane przez apkę mobilną
 *  po zeskanowaniu/odczytaniu linku (żeby POKAZAĆ podgląd przed zapisaniem wymiany).
 *  Sama strona web (`/c/[id]`) woła `getPublicCard` bezpośrednio, bez HTTP round-tripu. */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const card = await getPublicCard(id);
  if (!card) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json(card);
}
