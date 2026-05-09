import { NextResponse } from "next/server";
import { deleteActor, getActorById, upsertActor } from "@/lib/actors";

export const runtime = "nodejs";

function parseNumber(value: FormDataEntryValue | null) {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const actor = await getActorById(id);
  if (!actor) {
    return NextResponse.json({ message: "배우 정보를 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json(actor);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const form = await req.formData();
  const photos = form
    .getAll("photos")
    .filter((v): v is File => v instanceof File && v.size > 0);
  const existingPhotosRaw = String(form.get("existingPhotos") ?? "[]");
  const existingPhotos = JSON.parse(existingPhotosRaw) as string[];

  const actor = await upsertActor({
    id,
    name: String(form.get("name") ?? ""),
    birthDate: String(form.get("birthDate") ?? ""),
    heightCm: parseNumber(form.get("heightCm")),
    weightKg: parseNumber(form.get("weightKg")),
    specialties: String(form.get("specialties") ?? ""),
    hobbies: String(form.get("hobbies") ?? ""),
    filmography: String(form.get("filmography") ?? ""),
    youtubeUrl: String(form.get("youtubeUrl") ?? ""),
    existingPhotos,
    newPhotos: photos,
  });

  return NextResponse.json(actor);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = await deleteActor(id);
  if (!deleted) {
    return NextResponse.json({ message: "배우 정보를 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
