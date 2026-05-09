import Link from "next/link";
import { listActors } from "@/lib/actors";
import { ProfileRowSlider } from "@/components/profile-row-slider";

export const dynamic = "force-dynamic";

export default async function Home() {
  const actors = await listActors();
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-6 pt-0">
      <div className="flex items-start justify-between gap-4 pb-6 pt-0">
        <h1 className="text-3xl font-bold">배우 프로필</h1>
        <Link href="/admin" className="rounded bg-black px-4 py-2 text-white">
          관리자 페이지
        </Link>
      </div>
      <div className="mt-16">
        <p className="mb-2 text-right text-sm text-zinc-400">옆으로 드래그 -&gt;</p>
        <ProfileRowSlider actors={actors} />
      </div>
    </main>
  );
}
