"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ActorProfile } from "@/types/actor";

const DRAG_CLICK_THRESHOLD_PX = 12;
const INTENT_SLOP_PX = 10;

type Props = {
  actors: ActorProfile[];
};

type Intent = "undecided" | "horizontal" | "vertical";

export function ProfileRowSlider({ actors }: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragConsumedRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const scrollStartRef = useRef(0);
  const intentRef = useRef<Intent>("undecided");

  function blockNativeDrag(ev: React.DragEvent<HTMLElement>) {
    ev.preventDefault();
  }

  function teardownWindowListeners(move: (ev: PointerEvent) => void, up: () => void) {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
    window.removeEventListener("pointercancel", up);
  }

  function onPointerDownCapture(e: React.PointerEvent<HTMLDivElement>) {
    if (!scrollerRef.current?.contains(e.target as Node)) return;

    dragConsumedRef.current = false;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    scrollStartRef.current = scrollerRef.current.scrollLeft;
    intentRef.current = "undecided";
    setIsDragging(false);

    function onMove(ev: PointerEvent) {
      const scroller = scrollerRef.current;
      if (!scroller) return;

      const dx = ev.clientX - startXRef.current;
      const dy = ev.clientY - startYRef.current;

      if (intentRef.current === "undecided") {
        if (Math.abs(dx) < INTENT_SLOP_PX && Math.abs(dy) < INTENT_SLOP_PX) return;
        if (Math.abs(dy) > Math.abs(dx) + 4) {
          intentRef.current = "vertical";
          teardownWindowListeners(onMove, onUp);
          return;
        }
        if (Math.abs(dx) >= INTENT_SLOP_PX || Math.abs(dx) >= Math.abs(dy)) {
          intentRef.current = "horizontal";
          setIsDragging(true);
        } else return;
      }

      if (intentRef.current !== "horizontal") return;

      if (Math.abs(dx) > DRAG_CLICK_THRESHOLD_PX) {
        dragConsumedRef.current = true;
      }
      scroller.scrollLeft = scrollStartRef.current - dx;
    }

    function onUp() {
      teardownWindowListeners(onMove, onUp);
      intentRef.current = "undecided";
      setIsDragging(false);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }

  return (
    <div
      ref={scrollerRef}
      className={`overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
        isDragging ? "cursor-grabbing select-none" : "cursor-grab"
      }`}
      /** 세로 스크롤 우선 허용: 판별 전에는 브라우저가 세로 제스처를 처리할 수 있게 함 */
      style={{ touchAction: "pan-x pan-y" }}
      onPointerDownCapture={onPointerDownCapture}
    >
      <section className="grid min-w-max grid-flow-col grid-rows-2 auto-cols-[13rem] gap-4 pb-1">
        {actors.map((actor) => (
          <Link
            key={actor.id}
            href={`/actors/${actor.id}`}
            className="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white text-zinc-900"
            draggable={false}
            onDragStart={blockNativeDrag}
            onClick={(ev) => {
              if (dragConsumedRef.current) {
                ev.preventDefault();
                dragConsumedRef.current = false;
              }
            }}
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
