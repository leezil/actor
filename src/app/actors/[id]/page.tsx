import Link from "next/link";
import { notFound } from "next/navigation";
import { getActorById } from "@/lib/actors";

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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {actor.photos.map((photo) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={photo}
            src={photo}
            alt={`${actor.name} 사진`}
            className="h-72 w-full rounded-lg object-cover"
          />
        ))}
      </div>

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
