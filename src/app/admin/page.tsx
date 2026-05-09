"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ActorForm } from "@/components/actor-form";
import { ActorProfile } from "@/types/actor";

export default function AdminPage() {
  const [actors, setActors] = useState<ActorProfile[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

  async function loadActors() {
    const res = await fetch("/api/actors", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as ActorProfile[];
    setActors(data);
    setSelectedId((prev) => {
      if (!data.length) return "";
      if (!prev) return data[0].id;
      return data.some((actor) => actor.id === prev) ? prev : data[0].id;
    });
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/actors", { cache: "no-store" });
      if (!res.ok || cancelled) return;
      const data = (await res.json()) as ActorProfile[];
      if (cancelled) return;
      setActors(data);
      setSelectedId((prev) => prev || data[0]?.id || "");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/actors/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("삭제 실패");
      return;
    }
    await loadActors();
  }

  const selectedActor = actors.find((actor) => actor.id === selectedId) ?? null;

  return (
    <main className="mx-auto max-w-6xl space-y-5 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">관리자 페이지</h1>
        <Link href="/" className="rounded border px-3 py-2">
          공개 페이지
        </Link>
      </div>

      <ActorForm onSaved={loadActors} />

      <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 text-zinc-900">
        <h2 className="text-xl font-semibold text-zinc-900">등록된 배우</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {actors.map((actor) => (
            <div
              key={actor.id}
              className="rounded border border-zinc-200 p-3 text-sm text-zinc-700"
            >
              <p className="font-medium text-zinc-900">{actor.name}</p>
              <p>
                {actor.heightCm}cm / {actor.weightKg}kg
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setSelectedId(actor.id)}
                  className="rounded border px-2 py-1"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(actor.id)}
                  className="rounded bg-red-600 px-2 py-1 text-white"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedActor && (
        <ActorForm
          key={`edit-${selectedActor.id}`}
          initial={selectedActor}
          onSaved={loadActors}
        />
      )}
    </main>
  );
}
