"use client";

import { useMemo, useState } from "react";

type Props = {
  actorName: string;
  photos: string[];
};

export function DetailPhotoCarousel({ actorName, photos }: Props) {
  const [index, setIndex] = useState(0);
  const lastIndex = useMemo(() => Math.max(photos.length - 1, 0), [photos.length]);

  if (photos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-zinc-500">
        등록된 상세 사진이 없습니다.
      </div>
    );
  }

  function prev() {
    setIndex((current) => (current === 0 ? lastIndex : current - 1));
  }

  function next() {
    setIndex((current) => (current === lastIndex ? 0 : current + 1));
  }

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-xl bg-zinc-100">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {photos.map((photo) => (
            <div key={photo} className="w-full flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt={`${actorName} 상세 사진`}
                className="mx-auto h-[520px] w-full max-w-[390px] object-cover"
              />
            </div>
          ))}
        </div>

        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-white"
              aria-label="이전 사진"
            >
              ‹
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-white"
              aria-label="다음 사진"
            >
              ›
            </button>
          </>
        )}
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
