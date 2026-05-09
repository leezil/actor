"use client";

import { useMemo, useState } from "react";
import { ActorProfile } from "@/types/actor";

type Props = {
  initial?: ActorProfile | null;
  onSaved?: () => void;
};

export function ActorForm({ initial, onSaved }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [birthDate, setBirthDate] = useState(initial?.birthDate ?? "");
  const [heightCm, setHeightCm] = useState(initial?.heightCm?.toString() ?? "");
  const [weightKg, setWeightKg] = useState(initial?.weightKg?.toString() ?? "");
  const [specialties, setSpecialties] = useState(initial?.specialties ?? "");
  const [hobbies, setHobbies] = useState(initial?.hobbies ?? "");
  const [filmography, setFilmography] = useState(initial?.filmography ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(initial?.youtubeUrl ?? "");
  const [existingProfilePhoto, setExistingProfilePhoto] = useState(
    initial?.profilePhoto ?? ""
  );
  const [existingDetailPhotos, setExistingDetailPhotos] = useState(
    initial?.detailPhotos ?? []
  );
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [detailFiles, setDetailFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const title = useMemo(
    () => (initial ? `프로필 수정 - ${initial.name}` : "프로필 등록"),
    [initial]
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const isEdit = !!initial?.id;
    if (!isEdit && !existingProfilePhoto && !profileFile) {
      alert("대표 프로필 사진을 1장 등록해주세요.");
      setLoading(false);
      return;
    }

    let actorId = initial?.id;
    let newProfilePhotoKey: string | undefined;
    const newDetailPhotoKeys: string[] = [];

    async function uploadFiles(files: File[]) {
      const presignRes = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorId,
          files: files.map((file) => ({ name: file.name, type: file.type })),
        }),
      });
      if (!presignRes.ok) return null;
      const presignData = (await presignRes.json()) as {
        actorId: string;
        uploads: { key: string; uploadUrl: string }[];
      };
      actorId = presignData.actorId;

      for (let i = 0; i < files.length; i += 1) {
        const uploadRes = await fetch(presignData.uploads[i].uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": files[i].type || "application/octet-stream",
          },
          body: files[i],
        });
        if (!uploadRes.ok) return null;
      }

      return presignData.uploads.map((upload) => upload.key);
    }

    if (profileFile) {
      const uploaded = await uploadFiles([profileFile]);
      if (!uploaded || uploaded.length === 0) {
        alert("대표 사진 업로드에 실패했습니다.");
        setLoading(false);
        return;
      }
      newProfilePhotoKey = uploaded[0];
    }

    if (detailFiles.length > 0) {
      const uploaded = await uploadFiles(detailFiles);
      if (!uploaded) {
        alert("추가 사진 업로드에 실패했습니다.");
        setLoading(false);
        return;
      }
      newDetailPhotoKeys.push(...uploaded);
    }

    const payload = {
      id: actorId,
      name,
      birthDate,
      heightCm,
      weightKg,
      specialties,
      hobbies,
      filmography,
      youtubeUrl,
      existingProfilePhoto,
      existingDetailPhotos,
      newProfilePhotoKey,
      newDetailPhotoKeys,
    };

    const url = isEdit ? `/api/actors/${initial.id}` : "/api/actors";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      alert("저장에 실패했습니다.");
      setLoading(false);
      return;
    }

    alert(isEdit ? "수정되었습니다." : "등록되었습니다.");
    setLoading(false);
    if (!isEdit) {
      setName("");
      setBirthDate("");
      setHeightCm("");
      setWeightKg("");
      setSpecialties("");
      setHobbies("");
      setFilmography("");
      setYoutubeUrl("");
      setExistingProfilePhoto("");
      setExistingDetailPhotos([]);
      setProfileFile(null);
      setDetailFiles([]);
    }
    onSaved?.();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4"
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <input
        className="w-full rounded border p-2"
        placeholder="이름"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        className="w-full rounded border p-2"
        placeholder="생년월일 (예: 1995-01-01)"
        value={birthDate}
        onChange={(e) => setBirthDate(e.target.value)}
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          className="w-full rounded border p-2"
          placeholder="키(cm)"
          type="number"
          value={heightCm}
          onChange={(e) => setHeightCm(e.target.value)}
          required
        />
        <input
          className="w-full rounded border p-2"
          placeholder="몸무게(kg)"
          type="number"
          value={weightKg}
          onChange={(e) => setWeightKg(e.target.value)}
          required
        />
      </div>
      <textarea
        className="w-full rounded border p-2"
        placeholder="특기"
        value={specialties}
        onChange={(e) => setSpecialties(e.target.value)}
        required
      />
      <textarea
        className="w-full rounded border p-2"
        placeholder="취미"
        value={hobbies}
        onChange={(e) => setHobbies(e.target.value)}
        required
      />
      <textarea
        className="w-full rounded border p-2"
        placeholder="출연작품"
        value={filmography}
        onChange={(e) => setFilmography(e.target.value)}
        required
      />
      <input
        className="w-full rounded border p-2"
        placeholder="유튜브 링크"
        type="url"
        value={youtubeUrl}
        onChange={(e) => setYoutubeUrl(e.target.value)}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium">대표 프로필 사진</label>
        {existingProfilePhoto ? (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={existingProfilePhoto}
              alt="대표 사진"
              className="h-24 w-24 rounded object-cover"
            />
            <button
              type="button"
              onClick={() => setExistingProfilePhoto("")}
              className="absolute -right-2 -top-2 rounded-full bg-red-600 px-2 py-1 text-xs text-white"
            >
              X
            </button>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">등록된 대표 사진이 없습니다.</p>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setProfileFile(e.target.files?.[0] ?? null)}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium">추가 사진</label>
        <div className="flex flex-wrap gap-2">
          {existingDetailPhotos.map((photo) => (
            <div key={photo} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt="상세 사진"
                className="h-20 w-20 rounded object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setExistingDetailPhotos((prev) => prev.filter((p) => p !== photo))
                }
                className="absolute -right-2 -top-2 rounded-full bg-red-600 px-2 py-1 text-xs text-white"
              >
                X
              </button>
            </div>
          ))}
        </div>
      </div>

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => setDetailFiles(Array.from(e.target.files ?? []))}
      />
      <p className="text-xs text-zinc-500">
        추가 사진은 여러 장을 한 번에 선택해서 업로드할 수 있습니다.
      </p>

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "저장 중..." : "저장"}
      </button>
    </form>
  );
}
