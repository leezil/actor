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
  const lastIndex = useMemo(() => Math.max(photos.length - 1, 0), [photos.length]);

  function prev() {
    setIndex((current) => (current === 0 ? lastIndex : current - 1));
  }

  function next() {
    setIndex((current) => (current === lastIndex ? 0 : current + 1));
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

  return (
    <div className="space-y-3">
      <div className="mx-auto grid max-w-3xl gap-3 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl bg-zinc-100">
          {profilePhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profilePhoto}
              alt={`${actorName} 대표 사진`}
              className="aspect-[3/4] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[3/4] items-center justify-center text-zinc-500">
              등록된 대표 사진이 없습니다.
            </div>
          )}
        </div>

        <div className="relative overflow-hidden rounded-xl bg-zinc-100">
          {photos.length > 0 ? (
            <>
              <div
                className="flex cursor-grab transition-transform duration-300 ease-out active:cursor-grabbing"
                style={{ transform: `translateX(-${index * 100}%)` }}
                onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
                onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].clientX)}
                onMouseDown={(e) => handleDragStart(e.clientX)}
                onMouseUp={(e) => handleDragEnd(e.clientX)}
                onMouseLeave={() => setDragStartX(null)}
              >
                {photos.map((photo) => (
                  <div key={photo} className="w-full flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo}
                      alt={`${actorName} 상세 사진`}
                      className="aspect-[3/4] w-full object-cover"
                    />
                  </div>
                ))}
              </div>
              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-white"
                    aria-label="이전 사진"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-white"
                    aria-label="다음 사진"
                  >
                    ›
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="flex aspect-[3/4] items-center justify-center text-zinc-500">
              등록된 추가 사진이 없습니다.
            </div>
          )}
        </div>
      </div>

      {photos.length > 1 && (
        <div className="flex items-center justify-center gap-2">
          {photos.map((photo, dotIndex) => (
            <button
              key={photo}
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
