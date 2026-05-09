import { NextResponse } from "next/server";
import { deleteActor, getActorById, upsertActor } from "@/lib/actors";

export const runtime = "nodejs";

function parseNumberFromUnknown(value: unknown) {
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
  const body = await req.json();
  const existingPhotos = Array.isArray(body.existingPhotos)
    ? (body.existingPhotos as string[])
    : [];

  const actor = await upsertActor({
    id,
    name: String(body.name ?? ""),
    birthDate: String(body.birthDate ?? ""),
    heightCm: parseNumberFromUnknown(body.heightCm),
    weightKg: parseNumberFromUnknown(body.weightKg),
    specialties: String(body.specialties ?? ""),
    hobbies: String(body.hobbies ?? ""),
    filmography: String(body.filmography ?? ""),
    youtubeUrl: String(body.youtubeUrl ?? ""),
    existingPhotos,
    newPhotoKeys: Array.isArray(body.newPhotoKeys)
      ? (body.newPhotoKeys as string[])
      : [],
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
