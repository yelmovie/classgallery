import { useEffect, useState } from 'react';
import JSZip from 'jszip';
import { getThemeMeta } from '../../constants/themes';
import type { ThemeWorksheet } from '../../types/theme';

interface WorksheetGalleryModalProps {
  themeId: string | null;
  onClose: () => void;
}

export default function WorksheetGalleryModal({
  themeId,
  onClose,
}: WorksheetGalleryModalProps) {
  const open = themeId !== null;
  const [downloadState, setDownloadState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadAll = async () => {
    if (!themeId) return;
    const theme = getThemeMeta(themeId);
    if (!theme?.worksheets?.length) return;
    setDownloadState('loading');
    setDownloadProgress(0);

    try {
      const zip = new JSZip();
      const folder = zip.folder(theme.name) ?? zip;
      const total = theme.worksheets.length;

      await Promise.all(
        theme.worksheets.map(async (ws, index) => {
          const url = ws.file.split('?')[0];
          const res = await fetch(url);
          if (!res.ok) throw new Error(`활동지 파일을 불러오지 못했습니다: ${ws.name}`);
          const blob = await res.blob();
          const ext = url.split('.').pop() ?? 'png';
          const safeName = ws.name.replace(/[\s·/\\?%*:|"<>]/g, '-');
          folder.file(`${String(ws.group).padStart(2, '0')}-${safeName}.${ext}`, blob);
          setDownloadProgress(Math.round(((index + 1) / total) * 100));
        }),
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `classgallery-${themeId}-worksheets.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloadState('done');
      window.setTimeout(() => setDownloadState('idle'), 2500);
    } catch (err) {
      if (import.meta.env.DEV) console.error('[downloadAll]', err);
      setDownloadState('error');
      window.setTimeout(() => setDownloadState('idle'), 3000);
    }
  };

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
  const theme = getThemeMeta(themeId);
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
        className="fade-in worksheet-print-root"
        style={{
          background: 'var(--color-surface-solid)',
          borderRadius: 'var(--radius-card)',
          maxWidth: 920, width: '100%',
          maxHeight: 'calc(100vh - 40px)',
          overflowY: 'auto',
          boxShadow: '0 24px 60px rgba(15, 40, 65, 0.3)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        <div className="worksheet-print-header" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12,
          padding: '20px 24px 12px',
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky', top: 0, background: 'var(--color-surface-solid)', zIndex: 1,
        }}>
          <div>
            <h2
              id="worksheet-gallery-title"
              style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', marginBottom: 4 }}
            >
              {theme.name} 활동지 보기
            </h2>
            <p style={{ fontSize: 12, color: 'var(--color-muted)' }}>
              A4 세로 출력용 활동지입니다. 인쇄하기를 누르면 전체 활동지를 바로 출력할 수 있어요.
            </p>
          </div>
          <div className="worksheet-print-controls" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleDownloadAll}
              disabled={downloadState === 'loading'}
            >
              {downloadState === 'loading' ? `${downloadProgress}%` : '전체 저장'}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handlePrint}
            >
              전체 인쇄
            </button>
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
        </div>

        {downloadState === 'done' && (
          <p style={{ margin: '12px 24px 0', color: 'var(--color-primary)', fontSize: 13, fontWeight: 700 }}>
            활동지를 ZIP 파일로 저장했어요.
          </p>
        )}
        {downloadState === 'error' && (
          <p style={{ margin: '12px 24px 0', color: 'var(--color-danger)', fontSize: 13, fontWeight: 700 }}>
            일부 활동지를 저장하지 못했습니다.
          </p>
        )}

        <div className="worksheet-print-grid" style={{
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
  themeId: string;
  worksheet: ThemeWorksheet;
}

function WorksheetCard({ themeId, worksheet }: WorksheetCardProps) {
  const [imageError, setImageError] = useState(false);

  const safeName = worksheet.name.replace(/[\s·/\\?%*:|"<>]/g, '-');
  const downloadName = `classgallery-${themeId}-${worksheet.group}-${safeName}.png`;

  const handleView = () => {
    window.open(worksheet.file, '_blank', 'noopener,noreferrer');
  };

  return (
    <article
      className="worksheet-card"
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
      }}>
        {worksheet.group}
      </div>

      <div className="worksheet-print-page" style={{
        position: 'relative',
        aspectRatio: '1 / 1.414',
        background: 'var(--color-surface-solid)',
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
            <span style={{ fontSize: 32 }}>□</span>
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
          저장
        </a>
      </div>
    </article>
  );
}
