import { randomUUID } from "node:crypto";
import { ActorProfile } from "@/types/actor";
import { readJson, removeObject, uploadJson } from "@/lib/r2";

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

export function photoKey(id: string, fileName: string) {
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
  | "id"
  | "profilePhotoKey"
  | "profilePhoto"
  | "detailPhotoKeys"
  | "detailPhotos"
  | "createdAt"
  | "updatedAt"
> & {
  id?: string;
  existingProfilePhoto?: string;
  existingDetailPhotos?: string[];
  newProfilePhotoKey?: string;
  newDetailPhotoKeys?: string[];
};

export async function upsertActor(input: UpsertActorInput) {
  const id = input.id ?? randomUUID();
  const now = new Date().toISOString();
  const prev = input.id ? await getActorById(input.id) : null;

  const base = process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
  const existingProfilePhotoKey = input.existingProfilePhoto
    ? toKey(input.existingProfilePhoto, base)
    : "";
  const existingDetailPhotoKeys = (input.existingDetailPhotos ?? []).map(
    (urlOrKey) => toKey(urlOrKey, base)
  );

  const profilePhotoKey =
    input.newProfilePhotoKey ?? existingProfilePhotoKey ?? prev?.profilePhotoKey ?? "";
  const detailPhotoKeys = [
    ...existingDetailPhotoKeys,
    ...(input.newDetailPhotoKeys ?? []),
  ];

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
    profilePhotoKey,
    profilePhoto: getPhotoUrl(profilePhotoKey) || profilePhotoKey,
    detailPhotoKeys,
    detailPhotos: detailPhotoKeys.map((key) => getPhotoUrl(key) || key),
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
    const photosToKeep = new Set([
      actor.profilePhotoKey,
      ...actor.detailPhotoKeys,
    ]);
    const stalePhotos = [
      prev.profilePhotoKey,
      ...prev.detailPhotoKeys,
    ].filter((key) => key && !photosToKeep.has(key));
    await Promise.all(stalePhotos.map((key) => removeObject(key)));
  }

  return actor;
}

export async function deleteActor(id: string) {
  const actor = await getActorById(id);
  if (!actor) return false;

  const photoKeys = [actor.profilePhotoKey, ...actor.detailPhotoKeys].filter(Boolean);
  await Promise.all(photoKeys.map((key) => removeObject(key)));
  await removeObject(actorKey(id));

  const index = await getIndex();
  index.ids = index.ids.filter((v) => v !== id);
  await saveIndex(index);
  return true;
}

function normalizeActor(actor: ActorProfile): ActorProfile {
  const hasNewFormat =
    typeof actor.profilePhotoKey === "string" &&
    Array.isArray(actor.detailPhotoKeys) &&
    typeof actor.profilePhoto === "string" &&
    Array.isArray(actor.detailPhotos);
  if (hasNewFormat) {
    return actor;
  }

  const legacyPhotoKeys = (
    Array.isArray((actor as { photoKeys?: string[] }).photoKeys)
      ? ((actor as { photoKeys?: string[] }).photoKeys ?? [])
      : Array.isArray((actor as { photos?: string[] }).photos)
        ? ((actor as { photos?: string[] }).photos ?? [])
        : []
  ).map((v) =>
    toKey(v, process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL?.replace(/\/$/, ""))
  );

  const [profilePhotoKey = "", ...detailPhotoKeys] = legacyPhotoKeys;
  return {
    ...actor,
    profilePhotoKey,
    profilePhoto: getPhotoUrl(profilePhotoKey) || profilePhotoKey,
    detailPhotoKeys,
    detailPhotos: detailPhotoKeys.map((key) => getPhotoUrl(key) || key),
  };
}

function toKey(urlOrKey: string, base?: string) {
  if (!urlOrKey) return "";
  if (base && urlOrKey.startsWith(base)) {
    return urlOrKey.replace(`${base}/`, "");
  }
  return urlOrKey;
}
