"use client";

import { useMemo, useRef } from "react";

type Props = {
  actorName: string;
  profilePhoto: string;
  photos: string[];
};

export function DetailPhotoCarousel({ actorName, profilePhoto, photos }: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const velocityRef = useRef(0);
  const lastMoveTimeRef = useRef(0);
  const lastMoveXRef = useRef(0);
  const momentumFrameRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const dragRafRef = useRef<number | null>(null);
  const latestPointerXRef = useRef(0);

  const visibleCount = 2;
  const renderedPhotos = useMemo(() => {
    if (photos.length >= visibleCount) return photos;
    if (photos.length === 1) return [photos[0], "__placeholder__"];
    return ["__placeholder__", "__placeholder__2"];
  }, [photos]);

  function cancelMomentum() {
    if (momentumFrameRef.current) {
      cancelAnimationFrame(momentumFrameRef.current);
      momentumFrameRef.current = null;
    }
  }

  function cancelDragRaf() {
    if (dragRafRef.current !== null) {
      cancelAnimationFrame(dragRafRef.current);
      dragRafRef.current = null;
    }
  }

  function applyDragScroll(clientX: number) {
    const scroller = scrollerRef.current;
    if (!scroller || !draggingRef.current) return;
    const delta = clientX - dragStartXRef.current;
    scroller.scrollLeft = dragStartScrollLeftRef.current - delta;

    const now = performance.now();
    const dt = now - lastMoveTimeRef.current;
    if (dt > 0) {
      velocityRef.current = (clientX - lastMoveXRef.current) / dt;
      lastMoveTimeRef.current = now;
      lastMoveXRef.current = clientX;
    }
  }

  function scheduleDragScroll(clientX: number) {
    latestPointerXRef.current = clientX;
    if (dragRafRef.current !== null) return;
    dragRafRef.current = requestAnimationFrame(() => {
      dragRafRef.current = null;
      applyDragScroll(latestPointerXRef.current);
    });
  }

  function endDragAndMomentum(clientX?: number) {
    cancelDragRaf();
    const x = clientX ?? latestPointerXRef.current;
    applyDragScroll(x);
    draggingRef.current = false;

    let velocity = velocityRef.current;
    const decay = 0.95;
    const minVelocity = 0.02;

    const tick = () => {
      if (!scrollerRef.current) {
        momentumFrameRef.current = null;
        return;
      }
      if (Math.abs(velocity) < minVelocity) {
        momentumFrameRef.current = null;
        return;
      }
      scrollerRef.current.scrollLeft -= velocity * 20;
      velocity *= decay;
      momentumFrameRef.current = requestAnimationFrame(tick);
    };

    if (Math.abs(velocity) >= minVelocity) {
      momentumFrameRef.current = requestAnimationFrame(tick);
    }
  }

  function onScrollerPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const scroller = scrollerRef.current;
    if (!scroller || !scroller.contains(e.target as Node)) return;

    cancelMomentum();
    cancelDragRaf();
    draggingRef.current = true;
    dragStartXRef.current = e.clientX;
    latestPointerXRef.current = e.clientX;
    dragStartScrollLeftRef.current = scroller.scrollLeft;
    velocityRef.current = 0;
    lastMoveTimeRef.current = performance.now();
    lastMoveXRef.current = e.clientX;

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  function onScrollerPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    scheduleDragScroll(e.clientX);
  }

  function onScrollerPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    if (!draggingRef.current) return;
    endDragAndMomentum(e.clientX);
  }

  function onScrollerLostPointerCapture() {
    if (!draggingRef.current) return;
    endDragAndMomentum();
  }

  function blockNativeDrag(ev: React.DragEvent<HTMLImageElement>) {
    ev.preventDefault();
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="overflow-hidden rounded-xl bg-[var(--background)]">
          {profilePhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profilePhoto}
              alt={`${actorName} 대표 사진`}
              className="aspect-[3/4] w-full object-cover"
              draggable={false}
              onDragStart={blockNativeDrag}
            />
          ) : (
            <div className="flex aspect-[3/4] items-center justify-center text-zinc-500">
              등록된 대표 사진이 없습니다.
            </div>
          )}
        </div>

        <div className="relative overflow-hidden rounded-xl bg-[var(--background)] lg:col-span-2">
          <div
            ref={scrollerRef}
            className="cursor-grab select-none overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ touchAction: "pan-x pinch-zoom" }}
            onPointerDown={onScrollerPointerDown}
            onPointerMove={onScrollerPointerMove}
            onPointerUp={onScrollerPointerUp}
            onPointerCancel={onScrollerPointerUp}
            onLostPointerCapture={onScrollerLostPointerCapture}
          >
            <div className="flex gap-3 p-2">
              {renderedPhotos.map((photo, photoIndex) => (
                <div
                  key={`${photo}-${photoIndex}`}
                  className="w-[calc((100%-0.75rem)/2)] min-w-[calc((100%-0.75rem)/2)] flex-shrink-0 overflow-hidden rounded-xl"
                >
                  {photo.startsWith("__placeholder__") ? (
                    <div className="flex aspect-[3/4] items-center justify-center bg-[var(--background)] p-4 text-center text-zinc-400">
                      등록된 추가 사진이 없습니다.
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo}
                      alt={`${actorName} 추가 사진`}
                      className="aspect-[3/4] w-full object-cover"
                      draggable={false}
                      onDragStart={blockNativeDrag}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
