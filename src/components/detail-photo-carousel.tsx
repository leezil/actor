"use client";

import { useMemo, useState } from "react";

type Props = {
  actorName: string;
  profilePhoto: string;
  photos: string[];
};

export function DetailPhotoCarousel({ actorName, profilePhoto, photos }: Props) {
  const [index, setIndex] = useState(0);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const visibleCount = 2;
  const renderedPhotos = useMemo(() => {
    if (photos.length >= visibleCount) return photos;
    if (photos.length === 1) return [photos[0], "__placeholder__"];
    return ["__placeholder__", "__placeholder__2"];
  }, [photos]);
  const maxStartIndex = useMemo(
    () => Math.max(renderedPhotos.length - visibleCount, 0),
    [renderedPhotos.length]
  );

  function clampIndex(value: number) {
    return Math.min(Math.max(value, 0), maxStartIndex);
  }

  function prev() {
    setIndex((current) => clampIndex(current - 1));
  }

  function next() {
    setIndex((current) => clampIndex(current + 1));
  }

  function handleDragStart(clientX: number) {
    setDragStartX(clientX);
  }

  function handleDragEnd(clientX: number) {
    if (dragStartX === null) return;
    const delta = clientX - dragStartX;
    setDragStartX(null);
    if (Math.abs(delta) < 40) return;
    if (delta < 0) next();
    if (delta > 0) prev();
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
            className="flex cursor-grab gap-3 p-2 transition-transform duration-300 ease-out active:cursor-grabbing"
            style={{
              transform: `translateX(calc(-${index} * ((100% - 0.75rem) / 2 + 0.75rem)))`,
              touchAction: "pan-y",
            }}
            onPointerDown={(e) => {
              if (photos.length <= visibleCount) return;
              e.currentTarget.setPointerCapture(e.pointerId);
              handleDragStart(e.clientX);
            }}
            onPointerUp={(e) => handleDragEnd(e.clientX)}
            onPointerCancel={() => setDragStartX(null)}
            onPointerLeave={() => setDragStartX(null)}
          >
            {renderedPhotos.map((photo, photoIndex) => (
              <div
                key={`${photo}-${photoIndex}`}
                className="w-[calc((100%-0.75rem)/2)] flex-shrink-0 overflow-hidden rounded-xl"
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

      {photos.length > visibleCount && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: maxStartIndex + 1 }).map((_, dotIndex) => (
            <button
              key={`${dotIndex}-dot`}
              onClick={() => setIndex(dotIndex)}
              className={`h-2.5 w-2.5 rounded-full ${
                dotIndex === index ? "bg-black" : "bg-zinc-300"
              }`}
              aria-label={`${dotIndex + 1}번 사진 보기`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
