import type { Artwork } from '../../types/artwork';

export interface SpriteState {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotVelocity: number;
  size: number;
}

// 스프라이트 전체가 차지할 무대 면적 비율 목표치.
// 24명 기준으로도 캐릭터가 충분히 크게 보이도록 0.50으로 확대.
const TARGET_COVERAGE = 0.55;
const SIZE_BOUNDS = {
  minRatio: 0.161,  // 0.14 × 1.15 = 16.1% (이전 대비 +15%)
  maxRatio: 0.368,  // 0.32 × 1.15 = 36.8%
};

const ROTATION_LIMIT_DEG = 4;
const BASE_SPEED_RANGE = { min: 0.22, max: 0.42 };

export function computeSpriteSize(
  count: number,
  stageWidth: number,
  stageHeight: number,
): number {
  if (count <= 0 || stageWidth <= 0 || stageHeight <= 0) return 0;
  const aspect = stageWidth / stageHeight;
  const target = Math.sqrt(TARGET_COVERAGE / Math.max(1, count * aspect));
  const factor = Math.max(SIZE_BOUNDS.minRatio, Math.min(SIZE_BOUNDS.maxRatio, target));
  return stageWidth * factor;
}

/**
 * 그리드 셀 안에서 약간의 무작위 오프셋만 주어 배치한다.
 * - 중앙 몰림 방지: 셀 분할
 * - 겹침 최소화: 셀 안 padding
 * - 완벽한 물리 회피 대신 단순/안정 우선
 */
export function initSprites(
  artworks: Artwork[],
  stageWidth: number,
  stageHeight: number,
): SpriteState[] {
  const count = artworks.length;
  if (count === 0 || stageWidth <= 0 || stageHeight <= 0) return [];

  const size = computeSpriteSize(count, stageWidth, stageHeight);

  // 화면 비율을 고려한 그리드 (예: 16:9면 가로가 더 많은 셀)
  const aspect = stageWidth / stageHeight;
  let cols = Math.max(1, Math.round(Math.sqrt(count * aspect)));
  let rows = Math.max(1, Math.ceil(count / cols));
  while (cols * rows < count) cols += 1;

  const cellW = stageWidth / cols;
  const cellH = stageHeight / rows;
  const cellPadX = Math.max(0, (cellW - size) * 0.5);
  const cellPadY = Math.max(0, (cellH - size) * 0.5);

  return artworks.map((artwork, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);

    // 셀 안에서 작은 jitter — 그리드 티 안 나게
    const jitterX = (Math.random() - 0.5) * cellPadX * 1.2;
    const jitterY = (Math.random() - 0.5) * cellPadY * 1.2;

    const x = clamp(col * cellW + cellPadX + jitterX, 0, stageWidth - size);
    const y = clamp(row * cellH + cellPadY + jitterY, 0, stageHeight - size);

    const angle = Math.random() * Math.PI * 2;
    const speed = BASE_SPEED_RANGE.min +
      Math.random() * (BASE_SPEED_RANGE.max - BASE_SPEED_RANGE.min);

    return {
      id: artwork.id,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rotation: (Math.random() - 0.5) * 4,
      rotVelocity: (Math.random() - 0.5) * 0.012,
      size,
    };
  });
}

export function updateSprites(
  sprites: SpriteState[],
  speedFactor: number,
  stageWidth: number,
  stageHeight: number,
  deltaMs: number,
): SpriteState[] {
  if (speedFactor === 0 || sprites.length === 0) return sprites;

  const step = speedFactor * (deltaMs / 16);

  return sprites.map((s) => {
    let { x, y, vx, vy, rotation, rotVelocity } = s;
    const { size } = s;

    x += vx * step;
    y += vy * step;
    rotation += rotVelocity * step;

    if (rotation > ROTATION_LIMIT_DEG) {
      rotation = ROTATION_LIMIT_DEG;
      rotVelocity = -Math.abs(rotVelocity);
    } else if (rotation < -ROTATION_LIMIT_DEG) {
      rotation = -ROTATION_LIMIT_DEG;
      rotVelocity = Math.abs(rotVelocity);
    }

    if (x <= 0) {
      x = 0;
      vx = Math.abs(vx);
    } else if (x + size >= stageWidth) {
      x = stageWidth - size;
      vx = -Math.abs(vx);
    }

    if (y <= 0) {
      y = 0;
      vy = Math.abs(vy);
    } else if (y + size >= stageHeight) {
      y = stageHeight - size;
      vy = -Math.abs(vy);
    }

    return { ...s, x, y, vx, vy, rotation, rotVelocity };
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
