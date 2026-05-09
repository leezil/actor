import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { photoKey } from "@/lib/actors";
import { createUploadSignedUrl } from "@/lib/r2";

export const runtime = "nodejs";

type UploadFileInput = {
  name: string;
  type: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as {
    actorId?: string;
    files?: UploadFileInput[];
  };

  const actorId = body.actorId || randomUUID();
  const files = Array.isArray(body.files) ? body.files : [];
  const uploads = await Promise.all(
    files.map(async (file) => {
      const ext = file.name.split(".").pop() ?? "jpg";
      const key = photoKey(actorId, `${randomUUID()}.${ext}`);
      const uploadUrl = await createUploadSignedUrl(
        key,
        file.type || "application/octet-stream"
      );
      return { key, uploadUrl };
    })
  );

  return NextResponse.json({
    actorId,
    uploads,
  });
}
