import { NextResponse } from "next/server";
import { listActors, upsertActor } from "@/lib/actors";

export const runtime = "nodejs";

function parseNumber(value: unknown) {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function GET() {
  const actors = await listActors();
  return NextResponse.json(actors);
}

export async function POST(req: Request) {
  const body = await req.json();

  const actor = await upsertActor({
    id: body.id ? String(body.id) : undefined,
    name: String(body.name ?? ""),
    birthDate: String(body.birthDate ?? ""),
    heightCm: parseNumber(body.heightCm),
    weightKg: parseNumber(body.weightKg),
    specialties: String(body.specialties ?? ""),
    hobbies: String(body.hobbies ?? ""),
    filmography: String(body.filmography ?? ""),
    youtubeUrl: String(body.youtubeUrl ?? ""),
    newProfilePhotoKey: body.newProfilePhotoKey
      ? String(body.newProfilePhotoKey)
      : undefined,
    newDetailPhotoKeys: Array.isArray(body.newDetailPhotoKeys)
      ? (body.newDetailPhotoKeys as string[])
      : [],
  });

  return NextResponse.json(actor, { status: 201 });
}
