import Link from "next/link";
import { listActors } from "@/lib/actors";
import { ProfileRowSlider } from "@/components/profile-row-slider";

export const dynamic = "force-dynamic";

export default async function Home() {
  const actors = await listActors();
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-6 pt-14">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">배우 프로필</h1>
        <Link href="/admin" className="rounded bg-black px-4 py-2 text-white">
          관리자 페이지
        </Link>
      </div>
      <ProfileRowSlider actors={actors} />
    </main>
  );
}
