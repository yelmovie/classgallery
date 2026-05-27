import { useEffect, useCallback } from 'react';
import { SPOTLIGHT_INTERVAL_MS, MAX_ARTWORKS } from '../../constants/dokdoTheme';
import type { Artwork } from '../../types/artwork';

interface SpotlightPanelProps {
  artworks: Artwork[];
  currentIndex: number;
  onAdvance: () => void;
  enabled: boolean;
  /** 패널 클릭 또는 "크게 보기" 버튼 클릭 시 호출. 부모가 모달을 연다. */
  onOpenViewer?: (artwork: Artwork) => void;
  /** 패널 닫기 버튼 클릭 시 호출. */
  onClose?: () => void;
}

/**
 * 전시 화면 우하단 작은 사이드 패널.
 * - 5초마다 자동 회전하며 현재 작품 미리보기
 * - 표시 우선순위: 원본 학습지(originalImageUrl) > 원본 blob > cutout
 * - 클릭 또는 "크게 보기" 버튼 → 부모가 WorksheetViewerModal 오픈
 */
export default function SpotlightPanel({
  artworks,
  currentIndex,
  onAdvance,
  enabled,
  onOpenViewer,
  onClose,
}: SpotlightPanelProps) {
  const advance = useCallback(() => { onAdvance(); }, [onAdvance]);

  useEffect(() => {
    if (!enabled || artworks.length === 0) return;
    const timer = setInterval(advance, SPOTLIGHT_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [enabled, artworks.length, advance]);

  if (!enabled || artworks.length === 0) return null;

  const artwork = artworks[currentIndex];
  if (!artwork) return null;

  // 패널 미리보기는 학생 글까지 보이도록 원본을 우선 표시 (없으면 fallback)
  const previewSrc = artwork.originalImageUrl ?? artwork.originalPreviewUrl ?? artwork.cutoutUrl;
  const handleOpen = () => onOpenViewer?.(artwork);

  return (
    <div
      data-screenshot-ignore="true"
      style={{
        position: 'absolute', bottom: 28, right: 28, zIndex: 20,
        background: 'rgba(255,255,255,0.93)',
        borderRadius: 20,
        boxShadow: '0 8px 40px rgba(0,0,0,0.22)',
        padding: 16, width: 240,
        display: 'flex', flexDirection: 'column', gap: 10,
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.5)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#2f80d8', letterSpacing: '0.02em' }}>
          확대 감상
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {onOpenViewer && (
            <button
              type="button"
              onClick={handleOpen}
              data-screenshot-ignore="true"
              aria-label="학습지 크게 보기"
              style={{
                fontSize: 11, fontWeight: 700,
                padding: '4px 9px', borderRadius: 99,
                border: 'none',
                background: 'var(--color-primary)',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              크게 보기
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              data-screenshot-ignore="true"
              aria-label="확대 감상 닫기"
              title="닫기"
              style={{
                width: 22, height: 22, borderRadius: 99,
                border: '1px solid rgba(0,0,0,0.08)',
                background: 'rgba(0,0,0,0.04)',
                color: '#607587',
                fontSize: 13, lineHeight: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleOpen}
        aria-label="학습지 크게 보기"
        style={{
          width: '100%', aspectRatio: '1 / 1.2',
          borderRadius: 14, overflow: 'hidden',
          background: 'rgba(234,247,255,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 0, border: 'none',
          cursor: onOpenViewer ? 'zoom-in' : 'default',
        }}
      >
        <img
          src={previewSrc}
          alt="학습지 미리보기"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          style={{
            maxWidth: '94%', maxHeight: '94%',
            objectFit: 'contain',
            opacity: 1,
            background: '#fff',
            borderRadius: 6,
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.12))',
          }}
          draggable={false}
        />
      </button>

      <p style={{ fontSize: 11, color: '#607587', lineHeight: 1.5 }}>
        아이들이 칠한 색과 적은 글을 함께 보여줘요
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8aa0b0' }}>
        <span>다음 작품까지 {SPOTLIGHT_INTERVAL_MS / 1000}초</span>
        <span>최대 {MAX_ARTWORKS}개</span>
      </div>

      {artworks.length > 1 && (
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
          {artworks.slice(0, 10).map((_, i) => (
            <div
              key={i}
              style={{
                width: i === currentIndex % 10 ? 16 : 6,
                height: 6, borderRadius: 3,
                background: i === currentIndex % 10 ? '#2f80d8' : '#c8daea',
                transition: 'width 0.3s ease, background 0.3s ease',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
