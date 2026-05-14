/**
 * 브라우저 전용. 업로드 **파일 용량(byte)**을 줄이되, 프로필 사진처럼
 * 선명함이 필요할 때 과한 JPEG 압축·과한 축소를 피합니다.
 *
 * - 품질은 높은 값부터 순서대로 시험하고, 원본보다 작아지는 **가장 높은(선명한) 품질**을 고릅니다.
 * - 해상도 축소는 큰 원본만, 완만한 비율·짧은 변이 너무 작아지면 중단합니다.
 */

/** 이 용량 이하는 그대로 둠. */
const SKIP_OPTIMIZE_UNDER_BYTES = 340 * 1024;

/** 이 용량 이상인데 같은 해상도에서만 줄이기 실패했을 때만 해상도를 조금 낮춤. */
const ALLOW_DIMENSION_SHRINK_ABOVE_BYTES = 720 * 1024;

/** 아주 거대 이미지의 메모리 보호용(일반 업로드는 거의 100% 크기 유지). */
const MAX_CANVAS_LONG_EDGE = 8192;

/** 짧은 변이 이 크기 미만으로는 더 줄이지 않음 (웹에 올린 뒤에도 디테일 유지). */
const MIN_SHORT_EDGE_PX = 1024;

/** 해상도를 낮출 때 배율 (0.93 ≈ 매 단계 약 7% 축소, 완만함). */
const DIM_SHRINK_PER_STEP = 0.93;

/** 해상도 축소 재시도 상한 (대부분 같은 해상도 JPEG만으로 끝남). */
const MAX_SHRINK_STEPS = 8;

/** 낮추지 않는 JPEG 품질 바닥(이보다 과하게 뭉개지지 않도록 후보 목록 자체가 위쪽만 사용). */
const JPEG_QUALITIES_HIGH_FIRST = [
  0.94, 0.93, 0.92, 0.91, 0.9, 0.89, 0.88, 0.87, 0.86,
];

const SKIP_TYPES = new Set(["image/svg+xml", "image/gif"]);

function baseName(filename: string) {
  const i = filename.lastIndexOf(".");
  return i > 0 ? filename.slice(0, i) : filename;
}

async function jpegSmallerPreferringHigherQuality(
  canvas: HTMLCanvasElement,
  originalBytes: number
): Promise<Blob | null> {
  for (const q of JPEG_QUALITIES_HIGH_FIRST) {
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", q);
    });
    if (blob && blob.size < originalBytes) {
      return blob;
    }
  }
  return null;
}

export async function optimizeImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (SKIP_TYPES.has(file.type)) return file;
  if (file.size <= SKIP_OPTIMIZE_UNDER_BYTES) return file;

  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  try {
    let dimFactor =
      Math.max(bitmap.width, bitmap.height) > MAX_CANVAS_LONG_EDGE
        ? MAX_CANVAS_LONG_EDGE / Math.max(bitmap.width, bitmap.height)
        : 1;

    const mayShrinkDimensions =
      file.size >= ALLOW_DIMENSION_SHRINK_ABOVE_BYTES;

    for (let attempt = 0; ; attempt += 1) {
      const w = Math.max(1, Math.round(bitmap.width * dimFactor));
      const h = Math.max(1, Math.round(bitmap.height * dimFactor));

      if (attempt > 0 && Math.min(w, h) < MIN_SHORT_EDGE_PX) break;

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return file;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(bitmap, 0, 0, w, h);

      const blob = await jpegSmallerPreferringHigherQuality(canvas, file.size);
      if (blob) {
        return new File(
          [blob],
          `${baseName(file.name)}.jpg`,
          { type: "image/jpeg", lastModified: Date.now() }
        );
      }

      if (!mayShrinkDimensions || attempt >= MAX_SHRINK_STEPS) break;
      dimFactor *= DIM_SHRINK_PER_STEP;
    }

    return file;
  } finally {
    bitmap.close();
  }
}

export function optimizeImagesForUpload(files: File[]): Promise<File[]> {
  return Promise.all(files.map((f) => optimizeImageForUpload(f)));
}
