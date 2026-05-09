"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ActorProfile } from "@/types/actor";

type Props = {
  actors: ActorProfile[];
};

export function ProfileRowSlider({ actors }: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartScrollLeft, setDragStartScrollLeft] = useState(0);

  function startDrag(clientX: number) {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    setIsDragging(true);
    setDragStartX(clientX);
    setDragStartScrollLeft(scroller.scrollLeft);
  }

  function moveDrag(clientX: number) {
    if (!isDragging) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const delta = clientX - dragStartX;
    scroller.scrollLeft = dragStartScrollLeft - delta;
  }

  function endDrag() {
    setIsDragging(false);
  }

  function blockNativeDrag(e: React.DragEvent<HTMLElement>) {
    e.preventDefault();
  }

  return (
    <div
      ref={scrollerRef}
      className={`overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
        isDragging ? "cursor-grabbing select-none" : "cursor-grab"
      }`}
      style={{ touchAction: "pan-y" }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        startDrag(e.clientX);
      }}
      onPointerMove={(e) => moveDrag(e.clientX)}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
    >
      <section className="grid min-w-max grid-flow-col grid-rows-2 auto-cols-[13rem] gap-4 pb-1">
        {actors.map((actor) => (
          <Link
            key={actor.id}
            href={`/actors/${actor.id}`}
            className="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white text-zinc-900"
            draggable={false}
            onDragStart={blockNativeDrag}
          >
            {actor.profilePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={actor.profilePhoto}
                alt={`${actor.name} 프로필`}
                className="aspect-[3/4] w-full object-cover"
                draggable={false}
                onDragStart={blockNativeDrag}
              />
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center bg-zinc-100 text-zinc-500">
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
    </div>
  );
}
