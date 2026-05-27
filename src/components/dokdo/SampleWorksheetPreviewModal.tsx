import { useEffect } from 'react';

interface Props {
  open: boolean;
  /** 클릭한 샘플 캐릭터 컷아웃 URL. */
  cutoutUrl: string | null;
  /** 그 캐릭터에 매칭되는 학습지 PNG URL. */
  worksheetUrl: string | null;
  /** 학습지 표시명 (선택). */
  worksheetName?: string;
  onClose: () => void;
}

/**
 * 시연용: 학생이 색칠해서 떠다니는 캐릭터(왼쪽) ↔ 그 출처 학습지(오른쪽).
 * "이 캐릭터가 어떤 학습지에서 나왔는지" 한눈에 보여줘서 갤러리 동작 원리를 이해시킨다.
 */
export default function SampleWorksheetPreviewModal({
  open, cutoutUrl, worksheetUrl, worksheetName, onClose,
}: Props) {
  // ESC 로 닫기
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open || !cutoutUrl) return null;

  return (
    <div
      data-screenshot-ignore="true"
      role="dialog"
      aria-label="샘플 캐릭터와 학습지 연결 미리보기"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(8, 24, 40, 0.72)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 'min(960px, 100%)',
          maxHeight: '92vh',
          background: '#fff',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* 헤더 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>🔗</span>
            <span style={{ fontSize: 15, fontWeight: 800 }}>
              캐릭터 ↔ 학습지 연결
            </span>
            <span style={{
              fontSize: 11, fontWeight: 700,
              padding: '3px 9px', borderRadius: 99,
              background: 'rgba(255,220,100,0.85)',
              color: '#7a5200',
            }}>
              시연
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            style={{
              width: 32, height: 32, borderRadius: 99,
              border: '1px solid rgba(0,0,0,0.08)',
              background: 'rgba(0,0,0,0.04)',
              color: '#444', fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', padding: 0,
            }}
          >✕</button>
        </div>

        {/* 본문: 캐릭터 ← → 학습지 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: 16,
          padding: 24,
          alignItems: 'center',
        }}>
          {/* 캐릭터 (cutout) */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 10,
          }}>
            <div style={{
              fontSize: 12, fontWeight: 700, color: 'var(--color-muted)',
            }}>
              떠다니는 캐릭터
            </div>
            <div style={{
              width: '100%', aspectRatio: '1',
              background: 'repeating-conic-gradient(#e0e8f0 0% 25%, #f4f8fb 0% 50%) 0 0 / 14px 14px',
              borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 16,
              border: '1.5px solid var(--color-border)',
            }}>
              <img
                src={cutoutUrl}
                alt="샘플 캐릭터"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                style={{
                  maxWidth: '90%', maxHeight: '90%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.18))',
                }}
                draggable={false}
              />
            </div>
          </div>

          {/* 화살표 */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 6,
            color: 'var(--color-primary)',
          }}>
            <span style={{ fontSize: 28, lineHeight: 1 }}>←</span>
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: 'var(--color-primary-dark)',
              writingMode: 'horizontal-tb',
              whiteSpace: 'nowrap',
            }}>
              색칠하면
            </span>
          </div>

          {/* 학습지 */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 10,
          }}>
            <div style={{
              fontSize: 12, fontWeight: 700, color: 'var(--color-muted)',
            }}>
              학생이 색칠하는 학습지
            </div>
            <div style={{
              width: '100%', aspectRatio: '210 / 297',
              background: '#f0f4f8',
              borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
              border: '1.5px solid var(--color-border)',
            }}>
              {worksheetUrl ? (
                <img
                  src={worksheetUrl}
                  alt={worksheetName ? `${worksheetName} 학습지` : '학습지'}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  draggable={false}
                />
              ) : (
                <div style={{ fontSize: 12, color: 'var(--color-muted)', padding: 16, textAlign: 'center' }}>
                  연결된 학습지가 없어요
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 푸터 안내 */}
        <div style={{
          padding: '12px 18px 18px',
          fontSize: 12.5, color: 'var(--color-muted)',
          lineHeight: 1.5, textAlign: 'center',
          borderTop: '1px dashed var(--color-border)',
        }}>
          학생들이 이 학습지를 색칠하면, 캐릭터 부분만 자동으로 잘려서 위에 떠다니는 작품처럼 전시돼요.
          {worksheetName && (
            <div style={{ marginTop: 4, fontWeight: 700, color: 'var(--color-text)' }}>
              📄 {worksheetName}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
