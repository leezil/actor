import Link from "next/link";
import { listActors } from "@/lib/actors";

export const dynamic = "force-dynamic";

export default async function Home() {
  const actors = await listActors();
  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">배우 프로필</h1>
        <Link href="/admin" className="rounded bg-black px-4 py-2 text-white">
          관리자 페이지
        </Link>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actors.map((actor) => (
          <Link
            key={actor.id}
            href={`/actors/${actor.id}`}
            className="overflow-hidden rounded-xl border border-zinc-200 bg-white"
          >
            {actor.profilePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={actor.profilePhoto}
                alt={`${actor.name} 프로필`}
                className="h-64 w-full object-cover"
              />
            ) : (
              <div className="flex h-64 items-center justify-center bg-zinc-100 text-zinc-500">
                이미지 없음
              </div>
            )}
            <div className="space-y-1 p-3">
              <p className="text-xl font-semibold">{actor.name}</p>
              <p className="text-sm text-zinc-600">{actor.birthDate}</p>
              <p className="text-sm text-zinc-600">
                {actor.heightCm}cm / {actor.weightKg}kg
              </p>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
