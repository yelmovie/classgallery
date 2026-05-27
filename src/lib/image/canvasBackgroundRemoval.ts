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
  /**
   * 가장자리 픽셀들의 중앙값 색과 RGB 유클리드 거리(0~441)가 이 값보다
   * 작으면 "균일하게 깔린 종이/배경색" 으로 보고 제거 대상에 포함.
   * 캐릭터가 가장자리에 닿지 않도록 초기 crop이 먼저 들어가므로 안전.
   * 값이 클수록 적극적으로 제거(캐릭터를 잡아먹을 위험↑).
   */
  borderColorMatchDistance: number;
  /**
   * 가장자리 색이 충분히 균일할 때만 색-유사도 매칭을 활성화한다.
   * 가장자리 픽셀들의 평균 채널 표준편차가 이 값 이하면 "단색 배경" 으로 판단.
   */
  borderUniformityMaxStddev: number;
}

interface SeedColor { r: number; g: number; b: number }

export function removeOuterPaperBackground(
  imageData: ImageData,
  thresholds: BgRemovalThresholds,
): void {
  const { width, height, data } = imageData;
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];

  // 가장자리에서 균일 색이 감지되면 그 색을 기준으로 색-유사도 매칭도 활성화.
  const seed = sampleBorderSeedColor(imageData, thresholds.borderUniformityMaxStddev);

  for (let x = 0; x < width; x++) {
    tryEnqueue(x, 0, width, data, visited, queue, thresholds, seed);
    tryEnqueue(x, height - 1, width, data, visited, queue, thresholds, seed);
  }
  for (let y = 1; y < height - 1; y++) {
    tryEnqueue(0, y, width, data, visited, queue, thresholds, seed);
    tryEnqueue(width - 1, y, width, data, visited, queue, thresholds, seed);
  }

  let head = 0;
  while (head < queue.length) {
    const idx = queue[head++];
    const x = idx % width;
    const y = (idx - x) / width;
    data[idx * 4 + 3] = 0;

    if (x > 0)          tryEnqueue(x - 1, y,     width, data, visited, queue, thresholds, seed);
    if (x < width - 1)  tryEnqueue(x + 1, y,     width, data, visited, queue, thresholds, seed);
    if (y > 0)          tryEnqueue(x,     y - 1, width, data, visited, queue, thresholds, seed);
    if (y < height - 1) tryEnqueue(x,     y + 1, width, data, visited, queue, thresholds, seed);
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
  seed: SeedColor | null,
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

  let isLikeBorder = false;
  if (!isNearWhite && !isLightDesatGray && seed) {
    const dr = r - seed.r;
    const dg = g - seed.g;
    const db = b - seed.b;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);
    isLikeBorder = dist <= thresholds.borderColorMatchDistance;
  }

  if (isNearWhite || isLightDesatGray || isLikeBorder) {
    visited[idx] = 1;
    queue.push(idx);
  }
}

/**
 * 이미지의 4 변에서 픽셀을 샘플링하여 중앙값(R,G,B 각각) 색을 구한다.
 * 가장자리 색이 충분히 균일한 경우(채널별 표준편차가 임계값 이하)에만
 * SeedColor 를 돌려준다. 그렇지 않으면 null — 색-유사도 매칭 비활성화.
 */
function sampleBorderSeedColor(
  imageData: ImageData,
  uniformityMaxStddev: number,
): SeedColor | null {
  const { width, height, data } = imageData;
  if (width < 4 || height < 4) return null;

  const SAMPLE_STEP = Math.max(1, Math.floor(Math.min(width, height) / 80));
  const rs: number[] = [];
  const gs: number[] = [];
  const bs: number[] = [];

  const push = (x: number, y: number) => {
    const o = (y * width + x) * 4;
    // 알파 0 픽셀은 이미 배경으로 처리됐을 수 있으니 제외.
    if (data[o + 3] < 250) return;
    rs.push(data[o]);
    gs.push(data[o + 1]);
    bs.push(data[o + 2]);
  };

  for (let x = 0; x < width; x += SAMPLE_STEP) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y += SAMPLE_STEP) {
    push(0, y);
    push(width - 1, y);
  }

  if (rs.length < 8) return null;

  const median = (arr: number[]) => {
    const sorted = [...arr].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  };
  const stddev = (arr: number[], mean: number) => {
    const variance = arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length;
    return Math.sqrt(variance);
  };

  const mr = median(rs);
  const mg = median(gs);
  const mb = median(bs);

  const sr = stddev(rs, mr);
  const sg = stddev(gs, mg);
  const sb = stddev(bs, mb);
  const avgStddev = (sr + sg + sb) / 3;

  if (avgStddev > uniformityMaxStddev) return null;

  return { r: mr, g: mg, b: mb };
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
