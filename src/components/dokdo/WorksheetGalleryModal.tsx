import { useEffect, useState } from 'react';
import { THEMES_BY_ID } from '../../constants/themes';
import type { ThemeId, ThemeWorksheet } from '../../types/theme';

interface WorksheetGalleryModalProps {
  /** themeId 가 null 이면 모달이 닫혀있는 상태. */
  themeId: ThemeId | null;
  onClose: () => void;
}

/**
 * 선택된 테마의 활동지 6장을 카드로 보여주고 보기/다운로드 버튼을 제공한다.
 *
 * - 보기: 새 탭에서 PNG 열기
 * - 다운로드: <a download> 트릭
 * - 파일이 없으면 onError 로 placeholder + 안내 메시지
 * - 외부 DB / 외부 저장소 / 로그인 없이 public 정적 파일만 사용
 */
export default function WorksheetGalleryModal({
  themeId,
  onClose,
}: WorksheetGalleryModalProps) {
  const open = themeId !== null;
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

  if (!open || !themeId) return null;
  const theme = THEMES_BY_ID[themeId];
  if (!theme || !theme.worksheets) return null;

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="worksheet-gallery-title"
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(15, 40, 65, 0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="fade-in"
        style={{
          background: '#fff',
          borderRadius: 22,
          maxWidth: 880, width: '100%',
          maxHeight: 'calc(100vh - 40px)',
          overflowY: 'auto',
          boxShadow: '0 24px 60px rgba(15, 40, 65, 0.3)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 12px',
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky', top: 0, background: '#fff', zIndex: 1,
        }}>
          <div>
            <h2
              id="worksheet-gallery-title"
              style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', marginBottom: 4 }}
            >
              📄 {theme.name} 활동지 보기
            </h2>
            <p style={{ fontSize: 12, color: 'var(--color-muted)' }}>
              이 활동지는 A4 세로 출력용입니다.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            style={{
              width: 32, height: 32, borderRadius: 10,
              border: 'none', background: 'var(--color-primary-light)',
              color: 'var(--color-primary)', fontSize: 16, fontWeight: 700,
              cursor: 'pointer',
            }}
          >×</button>
        </div>

        <div style={{
          padding: '20px 24px 28px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 16,
        }}>
          {theme.worksheets.map((ws) => (
            <WorksheetCard key={ws.id} themeId={theme.id} worksheet={ws} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface WorksheetCardProps {
  themeId: ThemeId;
  worksheet: ThemeWorksheet;
}

function WorksheetCard({ themeId, worksheet }: WorksheetCardProps) {
  const [imageError, setImageError] = useState(false);

  // 다운로드 파일명: 영문/숫자 + group 번호 + 짧은 이름.
  // 한글 파일명도 download 속성으로 정상 동작하지만 통일성 위해 영문 형식 사용.
  const safeName = worksheet.name.replace(/[\s·/\\?%*:|"<>]/g, '-');
  const downloadName = `classgallery-${themeId}-${worksheet.group}-${safeName}.png`;

  const handleView = () => {
    window.open(worksheet.file, '_blank', 'noopener,noreferrer');
  };

  return (
    <article
      title={worksheet.displayName}
      aria-label={`${worksheet.group}번 활동지 (${worksheet.displayName})`}
      style={{
        background: 'var(--color-bg)',
        border: '1.5px solid var(--color-border)',
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{
        padding: '8px 12px',
        background: 'var(--color-primary)',
        color: '#fff',
        fontSize: 16, fontWeight: 800,
        textAlign: 'center',
        letterSpacing: '0.02em',
      }}>
        {worksheet.group}
      </div>

      <div style={{
        position: 'relative',
        aspectRatio: '1 / 1.414',
        background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 8,
      }}>
        {!imageError ? (
          <img
            src={worksheet.file}
            alt={`${worksheet.name} 활동지`}
            onError={() => setImageError(true)}
            style={{
              maxWidth: '100%', maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: 6,
            }}
            draggable={false}
          />
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 8, padding: 16, textAlign: 'center',
            color: 'var(--color-muted)',
          }}>
            <span style={{ fontSize: 32 }}>📄</span>
            <p style={{ fontSize: 12 }}>활동지 파일을 찾을 수 없습니다</p>
          </div>
        )}
      </div>

      <div style={{
        padding: '10px 12px 12px',
        display: 'flex', gap: 6,
      }}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={handleView}
          disabled={imageError}
          style={{ flex: 1 }}
        >
          보기
        </button>
        <a
          className="btn btn-primary btn-sm"
          href={imageError ? undefined : worksheet.file}
          download={imageError ? undefined : downloadName}
          aria-disabled={imageError}
          style={{
            flex: 1,
            pointerEvents: imageError ? 'none' : undefined,
            opacity: imageError ? 0.45 : 1,
          }}
        >
          다운로드
        </a>
      </div>
    </article>
  );
}
