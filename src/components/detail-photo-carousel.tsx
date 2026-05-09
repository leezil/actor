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
  /** setState 미반영 때문에 첫 터치 move가 무시되는 것을 방지 */
  const draggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);

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

  function handlePointerDown(clientX: number) {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    cancelMomentum();
    draggingRef.current = true;
    dragStartXRef.current = clientX;
    dragStartScrollLeftRef.current = scroller.scrollLeft;
    velocityRef.current = 0;
    lastMoveTimeRef.current = performance.now();
    lastMoveXRef.current = clientX;
  }

  function handlePointerMove(clientX: number) {
    if (!draggingRef.current || !scrollerRef.current) return;
    const scroller = scrollerRef.current;
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

  function handlePointerUp() {
    if (!scrollerRef.current) return;
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

  function blockNativeDrag(e: React.DragEvent<HTMLImageElement>) {
    e.preventDefault();
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
            className="cursor-grab overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            /** 가로 패닝 + pinch (모바일). pan-y였을 때 세로만 허용돼 스크롤이 끊김 */
            style={{ touchAction: "pan-x pinch-zoom" }}
            onMouseDown={(e) => handlePointerDown(e.clientX)}
            onMouseMove={(e) => handlePointerMove(e.clientX)}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={(e) => {
              const t = e.touches[0];
              if (t) handlePointerDown(t.clientX);
            }}
            onTouchMove={(e) => {
              const t = e.touches[0];
              if (t) handlePointerMove(t.clientX);
            }}
            onTouchEnd={handlePointerUp}
            onTouchCancel={handlePointerUp}
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
