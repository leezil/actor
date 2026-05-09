"use client";

import { useMemo, useRef, useState } from "react";

type Props = {
  actorName: string;
  profilePhoto: string;
  photos: string[];
};

export function DetailPhotoCarousel({ actorName, profilePhoto, photos }: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartScrollLeft, setDragStartScrollLeft] = useState(0);
  const visibleCount = 2;
  const renderedPhotos = useMemo(() => {
    if (photos.length >= visibleCount) return photos;
    if (photos.length === 1) return [photos[0], "__placeholder__"];
    return ["__placeholder__", "__placeholder__2"];
  }, [photos]);

  function handlePointerDown(clientX: number) {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    setIsDragging(true);
    setDragStartX(clientX);
    setDragStartScrollLeft(scroller.scrollLeft);
  }

  function handlePointerMove(clientX: number) {
    if (!isDragging) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const delta = clientX - dragStartX;
    scroller.scrollLeft = dragStartScrollLeft - delta;
  }

  function handlePointerUp() {
    setIsDragging(false);
  }

  function blockNativeDrag(e: React.DragEvent<HTMLImageElement>) {
    e.preventDefault();
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="overflow-hidden rounded-xl bg-zinc-100">
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

        <div className="relative overflow-hidden rounded-xl bg-zinc-100 lg:col-span-2">
          <div
            ref={scrollerRef}
            className={`overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            style={{ touchAction: "pan-y" }}
            onMouseDown={(e) => handlePointerDown(e.clientX)}
            onMouseMove={(e) => handlePointerMove(e.clientX)}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={(e) => handlePointerDown(e.touches[0].clientX)}
            onTouchMove={(e) => handlePointerMove(e.touches[0].clientX)}
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
                    <div className="flex aspect-[3/4] items-center justify-center bg-zinc-100 p-4 text-center text-zinc-500">
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
