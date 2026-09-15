import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getUserIdFromRequest } from "@/lib/auth";

/**
 * UWAGA — TYMCZASOWE ROZWIĄZANIE: zapisuje plik na lokalny dysk (`public/uploads`).
 * Działa w `next dev` i na VPS-ie z trwałym dyskiem. NIE ZADZIAŁA poprawnie na Vercelu
 * (serverless — system plików jest efemeryczny i pliki znikną po restarcie funkcji,
 * a poza tym każda instancja ma OSOBNY dysk, więc różne żądania mogą nie widzieć tych
 * samych plików). Przed pójściem na produkcję na Vercelu podmienić na S3 / Cloudinary —
 * ten endpoint zostaje strukturalnie taki sam, zmienia się tylko `writeFile(...)` na
 * upload do zewnętrznego storage i zwracany `url`.
 */
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "NO_FILE" }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 413 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "UNSUPPORTED_TYPE" }, { status: 415 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = file.type.split("/")[1] ?? "jpg";
  const filename = `${userId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), bytes);

  const url = `/uploads/${filename}`;
  return NextResponse.json({ url });
}
