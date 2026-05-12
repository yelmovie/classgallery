import { useEffect } from 'react';
import type { Artwork } from '../../types/artwork';

interface WorksheetViewerModalProps {
  /** null 이면 닫힘 상태. */
  artwork: Artwork | null;
  onClose: () => void;
  /** 캡처 제외용 표식 — 전시 화면 스크린샷에 모달이 들어가지 않게. */
  excludeFromScreenshot?: boolean;
}

/**
 * 학습지 크게 보기 모달.
 *
 * - 우선순위: artwork.originalImageUrl (다운스케일 dataURL, 학생 글씨 포함)
 *   → 없으면 artwork.originalPreviewUrl (blob URL, 같은 탭에서만 유효)
 *   → 그것도 없으면 fallback 안내 + cutoutUrl
 * - 90vw / 85vh, object-fit: contain, 잘림 방지
 * - 세로로 긴 학습지는 모달 내부 스크롤로 끝까지 볼 수 있음
 * - ESC / 배경 클릭으로 닫기
 */
export default function WorksheetViewerModal({
  artwork,
  onClose,
  excludeFromScreenshot = true,
}: WorksheetViewerModalProps) {
  const open = artwork !== null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open || !artwork) return null;

  // 원본 이미지 우선순위: dataURL (cross-window 안전) > blob URL > cutout
  const fullImage = artwork.originalImageUrl ?? artwork.originalPreviewUrl ?? null;
  const usingFallback = !artwork.originalImageUrl && !artwork.originalPreviewUrl;
  const imageSrc = fullImage ?? artwork.cutoutUrl;

  const ignoreAttrs = excludeFromScreenshot
    ? { 'data-screenshot-ignore': 'true' as const }
    : {};

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="worksheet-viewer-title"
      {...ignoreAttrs}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(10, 30, 50, 0.78)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        overflowY: 'auto',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="fade-in"
        style={{
          background: '#fff',
          borderRadius: 20,
          maxWidth: '90vw',
          maxHeight: '90vh',
          width: 'auto',
          height: 'auto',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}
      >
        {/* 헤더 */}
        <div style={{
          flexShrink: 0,
          padding: '14px 20px 12px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12,
          background: '#fff',
        }}>
          <div>
            <h2
              id="worksheet-viewer-title"
              style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-text)' }}
            >
              📄 학습지 크게 보기
            </h2>
            {usingFallback && (
              <p style={{ fontSize: 11.5, color: '#b08400', marginTop: 4 }}>
                원본 학습지 이미지가 없어 캐릭터 이미지만 표시됩니다.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            style={{
              width: 34, height: 34, borderRadius: 10,
              border: 'none', background: 'var(--color-primary-light)',
              color: 'var(--color-primary)', fontSize: 18, fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >×</button>
        </div>

        {/* 이미지 영역 (세로로 긴 학습지도 모달 내부 스크롤) */}
        <div style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: 16,
          background: 'var(--color-bg)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}>
          <img
            src={imageSrc}
            alt={artwork.originalFileName || '학습지 원본'}
            style={{
              maxWidth: '100%',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
              borderRadius: 10,
              boxShadow: '0 4px 18px rgba(15,40,65,0.18)',
              background: '#fff',
            }}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
