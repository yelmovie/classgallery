/**
 * 가장자리에서 시작하는 flood fill로, 종이/체크무늬 배경에 해당하는
 * 픽셀만 투명화한다. 캐릭터 내부의 흰 영역은 그대로 둔다.
 *
 * 제거 대상:
 *  1) near-white: r,g,b가 모두 nearWhiteChannel 보다 큼
 *  2) 옅은 회색 (투명 PNG 미리보기용 체크무늬가 실제 픽셀로 박힌 경우):
 *     채널 간 차이가 grayChannelSpread 이하 (저채도)이고
 *     평균 밝기가 grayBrightnessMin 이상.
 *  → 어떤 경우든 "이미지 가장자리와 연결된" 픽셀만 제거.
 */
export interface BgRemovalThresholds {
  nearWhiteChannel: number;
  grayChannelSpread: number;
  grayBrightnessMin: number;
}

export function removeOuterPaperBackground(
  imageData: ImageData,
  thresholds: BgRemovalThresholds,
): void {
  const { width, height, data } = imageData;
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];

  for (let x = 0; x < width; x++) {
    tryEnqueue(x, 0, width, data, visited, queue, thresholds);
    tryEnqueue(x, height - 1, width, data, visited, queue, thresholds);
  }
  for (let y = 1; y < height - 1; y++) {
    tryEnqueue(0, y, width, data, visited, queue, thresholds);
    tryEnqueue(width - 1, y, width, data, visited, queue, thresholds);
  }

  let head = 0;
  while (head < queue.length) {
    const idx = queue[head++];
    const x = idx % width;
    const y = (idx - x) / width;
    data[idx * 4 + 3] = 0;

    if (x > 0)          tryEnqueue(x - 1, y,     width, data, visited, queue, thresholds);
    if (x < width - 1)  tryEnqueue(x + 1, y,     width, data, visited, queue, thresholds);
    if (y > 0)          tryEnqueue(x,     y - 1, width, data, visited, queue, thresholds);
    if (y < height - 1) tryEnqueue(x,     y + 1, width, data, visited, queue, thresholds);
  }
}

function tryEnqueue(
  x: number,
  y: number,
  width: number,
  data: Uint8ClampedArray,
  visited: Uint8Array,
  queue: number[],
  thresholds: BgRemovalThresholds,
): void {
  const idx = y * width + x;
  if (visited[idx]) return;
  const o = idx * 4;

  // 이미 투명한 픽셀(진짜 alpha PNG 영역)도 "배경"으로 간주해 확장.
  if (data[o + 3] === 0) {
    visited[idx] = 1;
    queue.push(idx); // alpha만 0인 픽셀도 큐에 넣어 인접 배경 확장 가능
    return;
  }

  const r = data[o];
  const g = data[o + 1];
  const b = data[o + 2];

  const isNearWhite =
    r > thresholds.nearWhiteChannel &&
    g > thresholds.nearWhiteChannel &&
    b > thresholds.nearWhiteChannel;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const isLightDesatGray =
    !isNearWhite &&
    max - min < thresholds.grayChannelSpread &&
    (r + g + b) / 3 > thresholds.grayBrightnessMin;

  if (isNearWhite || isLightDesatGray) {
    visited[idx] = 1;
    queue.push(idx);
  }
}

/**
 * 투명하지 않은 픽셀들의 bounding box를 구한다.
 * 모든 픽셀이 투명하면 null.
 */
export function findOpaqueBoundingBox(
  imageData: ImageData,
): { x: number; y: number; width: number; height: number } | null {
  const { width, height, data } = imageData;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0) return null;
  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}
