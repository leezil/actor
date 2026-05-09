import { randomUUID } from "node:crypto";
import { ActorProfile } from "@/types/actor";
import { readJson, removeObject, uploadBytes, uploadJson } from "@/lib/r2";

const INDEX_KEY = "actors/index.json";

type ActorIndex = {
  ids: string[];
};

async function getIndex(): Promise<ActorIndex> {
  const index = await readJson<ActorIndex>(INDEX_KEY);
  return index ?? { ids: [] };
}

async function saveIndex(index: ActorIndex) {
  await uploadJson(INDEX_KEY, index);
}

function actorKey(id: string) {
  return `actors/${id}.json`;
}

function photoKey(id: string, fileName: string) {
  return `actors/${id}/photos/${fileName}`;
}

function getPhotoUrl(key: string) {
  const base = process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL;
  if (!base) {
    return "";
  }
  return `${base.replace(/\/$/, "")}/${key}`;
}

export async function listActors() {
  const index = await getIndex();
  const actorList = await Promise.all(
    index.ids.map(async (id) => readJson<ActorProfile>(actorKey(id)))
  );
  return actorList
    .filter((actor): actor is ActorProfile => !!actor)
    .map(normalizeActor)
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

export async function getActorById(id: string) {
  const actor = await readJson<ActorProfile>(actorKey(id));
  return actor ? normalizeActor(actor) : null;
}

type UpsertActorInput = Omit<
  ActorProfile,
  "id" | "photoKeys" | "photos" | "createdAt" | "updatedAt"
> & {
  id?: string;
  existingPhotos?: string[];
  newPhotos?: File[];
};

export async function upsertActor(input: UpsertActorInput) {
  const id = input.id ?? randomUUID();
  const now = new Date().toISOString();
  const prev = input.id ? await getActorById(input.id) : null;

  const uploadedPhotoKeys: string[] = [];
  if (input.newPhotos) {
    for (const photo of input.newPhotos) {
      const ext = photo.name.split(".").pop() ?? "jpg";
      const key = photoKey(id, `${randomUUID()}.${ext}`);
      const bytes = Buffer.from(await photo.arrayBuffer());
      await uploadBytes(key, bytes, photo.type || "image/jpeg");
      uploadedPhotoKeys.push(key);
    }
  }

  const base = process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
  const existingPhotoKeys = (input.existingPhotos ?? []).map((urlOrKey) => {
    if (base && urlOrKey.startsWith(base)) {
      return urlOrKey.replace(`${base}/`, "");
    }
    return urlOrKey;
  });
  const photoKeys = [...existingPhotoKeys, ...uploadedPhotoKeys];

  const actor: ActorProfile = {
    id,
    name: input.name,
    birthDate: input.birthDate,
    heightCm: input.heightCm,
    weightKg: input.weightKg,
    specialties: input.specialties,
    hobbies: input.hobbies,
    filmography: input.filmography,
    youtubeUrl: input.youtubeUrl || "",
    photoKeys,
    photos: photoKeys.map((key) => getPhotoUrl(key) || key),
    createdAt: prev?.createdAt ?? now,
    updatedAt: now,
  };

  await uploadJson(actorKey(id), actor);
  const index = await getIndex();
  if (!index.ids.includes(id)) {
    index.ids.push(id);
    await saveIndex(index);
  }

  if (prev) {
    const photosToKeep = new Set(actor.photoKeys);
    const stalePhotos = prev.photoKeys.filter((key) => !photosToKeep.has(key));
    await Promise.all(stalePhotos.map((key) => removeObject(key)));
  }

  return actor;
}

export async function deleteActor(id: string) {
  const actor = await getActorById(id);
  if (!actor) return false;

  await Promise.all(actor.photoKeys.map((key) => removeObject(key)));
  await removeObject(actorKey(id));

  const index = await getIndex();
  index.ids = index.ids.filter((v) => v !== id);
  await saveIndex(index);
  return true;
}

function normalizeActor(actor: ActorProfile): ActorProfile {
  if (actor.photoKeys?.length) {
    return actor;
  }
  const base = process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
  const photoKeys = actor.photos.map((urlOrKey) => {
    if (base && urlOrKey.startsWith(base)) {
      return urlOrKey.replace(`${base}/`, "");
    }
    return urlOrKey;
  });
  return { ...actor, photoKeys };
}
