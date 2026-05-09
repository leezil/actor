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
        {actor.profilePhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={actor.profilePhoto}
            alt={`${actor.name} 대표 사진`}
            className="mx-auto h-[520px] w-full max-w-[390px] rounded-lg object-cover"
          />
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-500">
            등록된 대표 사진이 없습니다.
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">상세 사진</h2>
        <DetailPhotoCarousel actorName={actor.name} photos={actor.detailPhotos} />
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <p>생년월일: {actor.birthDate}</p>
        <p>
          신체: {actor.heightCm}cm / {actor.weightKg}kg
        </p>
        <p>특기: {actor.specialties}</p>
        <p>취미: {actor.hobbies}</p>
        <p>출연작품: {actor.filmography}</p>
        {actor.youtubeUrl && (
          <p>
            유튜브:{" "}
            <a
              href={actor.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline"
            >
              {actor.youtubeUrl}
            </a>
          </p>
        )}
      </section>
    </main>
  );
}
