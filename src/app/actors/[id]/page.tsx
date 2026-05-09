import Link from "next/link";
import { notFound } from "next/navigation";
import { getActorById } from "@/lib/actors";
import { DetailPhotoCarousel } from "@/components/detail-photo-carousel";

export const dynamic = "force-dynamic";

export default async function ActorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const actor = await getActorById(id);

  if (!actor) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{actor.name}</h1>
        <Link href="/" className="rounded border px-3 py-2">
          목록으로
        </Link>
      </div>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">프로필 사진</h2>
        <DetailPhotoCarousel
          actorName={actor.name}
          profilePhoto={actor.profilePhoto}
          photos={actor.detailPhotos}
        />
      </section>

      <section className="space-y-2 rounded-xl border border-zinc-200 bg-white p-5 text-zinc-900">
        <p className="text-zinc-900">생년월일: {actor.birthDate}</p>
        <p className="text-zinc-900">
          신체: {actor.heightCm}cm / {actor.weightKg}kg
        </p>
        <p className="text-zinc-900">특기: {actor.specialties}</p>
        <p className="text-zinc-900">취미: {actor.hobbies}</p>
        <p className="text-zinc-900">출연작품: {actor.filmography}</p>
        {actor.youtubeUrl && (
          <p className="text-zinc-900">
            유튜브:{" "}
            <a
              href={actor.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-blue-700 underline"
            >
              {actor.youtubeUrl}
            </a>
          </p>
        )}
      </section>
    </main>
  );
}
