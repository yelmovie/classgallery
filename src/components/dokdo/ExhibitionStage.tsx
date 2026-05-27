import { useEffect, useRef, useCallback, useState } from 'react';
import type { SpeedMode } from '../../types/artwork';
import { SPEED_VALUES, DOKDO_THEME } from '../../constants/dokdoTheme';
import {
  initSprites,
  updateSprites,
  type SpriteState,
} from '../../lib/exhibition/movement';

interface ExhibitionItem {
  id: string;
  imageUrl: string;
}

interface ExhibitionStageProps {
  items: ExhibitionItem[];
  speedMode: SpeedMode;
  compact?: boolean;
  emptyTitle?: string;
  emptyHint?: string;
  /** 테마 배경 URL. 미지정 시 독도 기본 배경 사용. */
  backgroundUrl?: string;
  /** 캐릭터 클릭 시 호출. 샘플 모드에서는 전달하지 않으면 비활성. */
  onSpriteClick?: (id: string) => void;
}

export default function ExhibitionStage({
  items,
  speedMode,
  compact = false,
  emptyTitle = '아직 업로드된 작품이 없어요',
  emptyHint = '선생님이 학습지를 올리면 캐릭터가 여기에 떠다녀요',
  backgroundUrl,
  onSpriteClick,
}: ExhibitionStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const spriteEls = useRef<Map<string, HTMLDivElement>>(new Map());
  const statesRef = useRef<SpriteState[]>([]);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const speedRef = useRef<number>(SPEED_VALUES[speedMode]);
  const [bgError, setBgError] = useState(false);

  const applySpriteStyles = useCallback(() => {
    statesRef.current.forEach((s) => {
      const el = spriteEls.current.get(s.id);
      if (!el) return;
      el.style.transform = `translate(${s.x}px, ${s.y}px) rotate(${s.rotation}deg)`;
      el.style.width = `${s.size}px`;
      el.style.height = `${s.size}px`;
    });
  }, []);

  // 속도는 ref로 흘려보내서 매 프레임 리렌더링 방지
  useEffect(() => {
    speedRef.current = SPEED_VALUES[speedMode];
  }, [speedMode]);

  // items 또는 stage 크기 변할 때 sprite 재초기화
  const resetSprites = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (w <= 0 || h <= 0) return;

    const artworkLike = items.map((it) => ({
      id: it.id,
      originalFileName: '',
      originalPreviewUrl: '',
      cutoutUrl: it.imageUrl,
      createdAt: 0,
    }));
    statesRef.current = initSprites(artworkLike, w, h);
    applySpriteStyles();
  }, [items, applySpriteStyles]);

  useEffect(() => {
    resetSprites();
  }, [resetSprites]);

  // ResizeObserver로 화면 크기 변화에도 비례 재배치
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof ResizeObserver === 'undefined') return;

    let prevW = stage.clientWidth;
    let prevH = stage.clientHeight;
    const ro = new ResizeObserver(() => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (w <= 0 || h <= 0) return;
      // 비율 유지: 기존 sprite 위치를 새 크기에 비례해서 옮긴다
      if (prevW > 0 && prevH > 0 && statesRef.current.length > 0) {
        const ratioX = w / prevW;
        const ratioY = h / prevH;
        statesRef.current = statesRef.current.map((s) => ({
          ...s,
          x: s.x * ratioX,
          y: s.y * ratioY,
          size: s.size * Math.min(ratioX, ratioY),
        }));
      } else {
        resetSprites();
      }
      applySpriteStyles();
      prevW = w;
      prevH = h;
    });
    ro.observe(stage);
    return () => ro.disconnect();
  }, [applySpriteStyles, resetSprites]);

  const animate = useCallback((now: number) => {
    const delta = lastTimeRef.current ? Math.min(now - lastTimeRef.current, 64) : 16;
    lastTimeRef.current = now;

    const stage = stageRef.current;
    if (stage) {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      statesRef.current = updateSprites(statesRef.current, speedRef.current, w, h, delta);
      applySpriteStyles();
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [applySpriteStyles]);

  useEffect(() => {
    if (speedMode === 'paused' || items.length === 0) {
      lastTimeRef.current = 0;
      cancelAnimationFrame(rafRef.current);
      applySpriteStyles();
      return undefined;
    }
    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate, applySpriteStyles, items.length, speedMode]);

  const bgUrl = backgroundUrl ?? DOKDO_THEME.backgrounds.main;
  // 배경 URL 바뀌면 이전 에러 상태 초기화
  useEffect(() => { setBgError(false); }, [bgUrl]);

  return (
    <div
      ref={stageRef}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: compact ? undefined : '16 / 9',
        height: compact ? '100%' : undefined,
        overflow: 'hidden',
        borderRadius: compact ? 'inherit' : 0,
        background: 'linear-gradient(180deg, #76b9e8 0%, #1a6ea8 70%, #0f5485 100%)',
      }}
    >
      {!bgError && (
        <img
          src={bgUrl}
          alt=""
          onError={() => setBgError(true)}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center center',
            zIndex: 0,
            userSelect: 'none', pointerEvents: 'none',
          }}
          draggable={false}
        />
      )}

      {items.map((item, i) => (
        <div
          key={item.id}
          ref={(el) => {
            if (el) spriteEls.current.set(item.id, el);
            else spriteEls.current.delete(item.id);
          }}
          onClick={onSpriteClick ? () => onSpriteClick(item.id) : undefined}
          style={{
            position: 'absolute', left: 0, top: 0,
            zIndex: 2, willChange: 'transform',
            cursor: onSpriteClick ? 'pointer' : 'default',
          }}
        >
          <img
            src={item.imageUrl}
            alt={`작품 ${i + 1}`}
            className="character-img"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            draggable={false}
            style={{
              filter: 'saturate(1.30) contrast(1.06) brightness(1.03)',
              imageRendering: 'auto',
              transition: onSpriteClick ? 'transform 0.15s ease' : undefined,
            }}
            onMouseEnter={onSpriteClick ? (e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.08)'; } : undefined}
            onMouseLeave={onSpriteClick ? (e) => { (e.currentTarget as HTMLImageElement).style.transform = ''; } : undefined}
          />
        </div>
      ))}

      {items.length === 0 && !compact && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.85)', zIndex: 3, gap: 12,
          textShadow: '0 2px 8px rgba(0,0,0,0.35)',
        }}>
          <span style={{ fontSize: 56 }}>🌊</span>
          <p style={{ fontSize: 20, fontWeight: 700 }}>{emptyTitle}</p>
          <p style={{ fontSize: 14, opacity: 0.85 }}>{emptyHint}</p>
        </div>
      )}
    </div>
  );
}
