/**
 * 카메라로 찍은 한 장의 사진에서 학습지(밝고 큰 직사각 영역)의
 * axis-aligned bounding box를 찾는다.
 *
 * 알고리즘:
 *  1. ~320px 너비로 다운스케일.
 *  2. 픽셀별 paper 여부 판정 (밝기 ≥ 185, 채널 spread ≤ 45 = 흰 종이).
 *  3. 작은 형태학적 dilation (캐릭터 선·글씨로 끊어진 종이 영역 연결).
 *  4. flood-fill 로 연결 컴포넌트 라벨링 → 최대 컴포넌트의 bounding box.
 *  5. 최소 크기(프레임의 8%) 미만이면 null.
 *  6. 안전 inset (bbox 가장자리가 종이 안쪽이도록) 후 원본 좌표로 매핑.
 *
 * 종이가 검출되지 않으면 null - 호출 측이 fallback 처리.
 */
export interface PaperRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

const WORK_WIDTH = 320;
const PAPER_BRIGHTNESS_MIN = 185;
const PAPER_SPREAD_MAX = 45;
const DILATION_RADIUS = 2;
const MIN_AREA_RATIO = 0.08;
const INSET_RATIO = 0.012;

export function detectPaperRegion(img: HTMLImageElement): PaperRegion | null {
  if (!img.naturalWidth || !img.naturalHeight) return null;

  const aspect = img.naturalHeight / img.naturalWidth;
  const workW = WORK_WIDTH;
  const workH = Math.max(1, Math.round(WORK_WIDTH * aspect));

  const canvas = document.createElement('canvas');
  canvas.width = workW;
  canvas.height = workH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, workW, workH);

  const { data } = ctx.getImageData(0, 0, workW, workH);
  const total = workW * workH;
  let mask: Uint8Array<ArrayBufferLike> = new Uint8Array(total);

  for (let i = 0; i < total; i++) {
    const o = i * 4;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    const brightness = (r + g + b) / 3;
    const spread = Math.max(r, g, b) - Math.min(r, g, b);
    if (brightness >= PAPER_BRIGHTNESS_MIN && spread <= PAPER_SPREAD_MAX) {
      mask[i] = 1;
    }
  }

  mask = dilate(mask, workW, workH, DILATION_RADIUS);

  // 최대 연결 컴포넌트 찾기
  const visited = new Uint8Array(total);
  let bestSize = 0;
  let bestBBox: PaperRegion | null = null;
  const queue: number[] = [];

  for (let start = 0; start < total; start++) {
    if (!mask[start] || visited[start]) continue;

    let minX = workW, minY = workH, maxX = -1, maxY = -1, size = 0;
    queue.length = 0;
    queue.push(start);
    visited[start] = 1;

    let head = 0;
    while (head < queue.length) {
      const idx = queue[head++];
      const x = idx % workW;
      const y = (idx - x) / workW;
      size++;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;

      if (x > 0) {
        const n = idx - 1;
        if (mask[n] && !visited[n]) { visited[n] = 1; queue.push(n); }
      }
      if (x < workW - 1) {
        const n = idx + 1;
        if (mask[n] && !visited[n]) { visited[n] = 1; queue.push(n); }
      }
      if (y > 0) {
        const n = idx - workW;
        if (mask[n] && !visited[n]) { visited[n] = 1; queue.push(n); }
      }
      if (y < workH - 1) {
        const n = idx + workW;
        if (mask[n] && !visited[n]) { visited[n] = 1; queue.push(n); }
      }
    }

    if (size > bestSize) {
      bestSize = size;
      bestBBox = {
        x: minX,
        y: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1,
      };
    }
  }

  if (!bestBBox || bestSize < total * MIN_AREA_RATIO) return null;

  // 안전 inset: bbox 가장자리가 확실히 종이 안쪽이 되도록 살짝 안쪽으로 좁힌다.
  const insetX = Math.round(bestBBox.width * INSET_RATIO);
  const insetY = Math.round(bestBBox.height * INSET_RATIO);
  const insetBBox = {
    x: bestBBox.x + insetX,
    y: bestBBox.y + insetY,
    width: Math.max(1, bestBBox.width - insetX * 2),
    height: Math.max(1, bestBBox.height - insetY * 2),
  };

  // 원본 이미지 좌표로 매핑.
  const scaleX = img.naturalWidth / workW;
  const scaleY = img.naturalHeight / workH;

  const ox = Math.max(0, Math.floor(insetBBox.x * scaleX));
  const oy = Math.max(0, Math.floor(insetBBox.y * scaleY));
  const ow = Math.min(img.naturalWidth - ox, Math.ceil(insetBBox.width * scaleX));
  const oh = Math.min(img.naturalHeight - oy, Math.ceil(insetBBox.height * scaleY));

  return { x: ox, y: oy, width: ow, height: oh };
}

/**
 * 단순 형태학적 dilation. radius 만큼 4-방향으로 확장.
 * 캐릭터 선·글씨로 잘게 끊어진 종이 mask를 연결시킨다.
 */
function dilate(
  mask: Uint8Array,
  width: number,
  height: number,
  radius: number,
): Uint8Array {
  let current = mask;
  for (let r = 0; r < radius; r++) {
    const next = new Uint8Array(current.length);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (current[idx]) {
          next[idx] = 1;
          if (x > 0) next[idx - 1] = 1;
          if (x < width - 1) next[idx + 1] = 1;
          if (y > 0) next[idx - width] = 1;
          if (y < height - 1) next[idx + width] = 1;
        }
      }
    }
    current = next;
  }
  return current;
}
