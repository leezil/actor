import { NextResponse } from "next/server";
import { listActors, upsertActor } from "@/lib/actors";

export const runtime = "nodejs";

function parseNumber(value: FormDataEntryValue | null) {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function GET() {
  const actors = await listActors();
  return NextResponse.json(actors);
}

export async function POST(req: Request) {
  const form = await req.formData();
  const photos = form
    .getAll("photos")
    .filter((v): v is File => v instanceof File && v.size > 0);

  const actor = await upsertActor({
    name: String(form.get("name") ?? ""),
    birthDate: String(form.get("birthDate") ?? ""),
    heightCm: parseNumber(form.get("heightCm")),
    weightKg: parseNumber(form.get("weightKg")),
    specialties: String(form.get("specialties") ?? ""),
    hobbies: String(form.get("hobbies") ?? ""),
    filmography: String(form.get("filmography") ?? ""),
    youtubeUrl: String(form.get("youtubeUrl") ?? ""),
    newPhotos: photos,
  });

  return NextResponse.json(actor, { status: 201 });
}
