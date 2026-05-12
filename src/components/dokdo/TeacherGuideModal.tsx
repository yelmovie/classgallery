import { useEffect } from 'react';

interface TeacherGuideModalProps {
  open: boolean;
  onClose: () => void;
}

const SAFETY_NOTES = [
  '학생 이름을 입력하지 않습니다.',
  '학생 얼굴 사진을 업로드하지 않습니다.',
  '학생이 직접 업로드하지 않습니다.',
  '선생님이 수업용 학습지만 업로드합니다.',
  '외부 DB에 저장하지 않습니다.',
  '수업 후 전체 삭제할 수 있습니다.',
];

const USAGE_STEPS = [
  '전시 배경을 고릅니다.',
  '원하는 활동지를 고릅니다.',
  '활동지를 학생들에게 나누어 주고 색칠하게 합니다.',
  '선생님이 완성된 활동지 사진을 찍어 업로드합니다.',
  '전시 화면에는 색칠한 캐릭터만 배경 위에 나타나요.',
];

export default function TeacherGuideModal({ open, onClose }: TeacherGuideModalProps) {
  // Esc 키로 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // 배경 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="teacher-guide-title"
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
          maxWidth: 520, width: '100%',
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
        }}>
          <h2 id="teacher-guide-title" style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)' }}>
            📋 교사용 안내
          </h2>
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

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <section>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-primary-dark)', marginBottom: 10 }}>
              교사용 안전 안내
            </h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, listStyle: 'none' }}>
              {SAFETY_NOTES.map((note) => (
                <li
                  key={note}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    fontSize: 14, color: 'var(--color-text)', lineHeight: 1.5,
                  }}
                >
                  <span style={{
                    flexShrink: 0, width: 18, height: 18, borderRadius: 6,
                    background: 'var(--color-primary-light)', color: 'var(--color-primary)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, marginTop: 1,
                  }}>✓</span>
                  {note}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-primary-dark)', marginBottom: 10 }}>
              수업 사용 흐름
            </h3>
            <ol style={{ display: 'flex', flexDirection: 'column', gap: 8, listStyle: 'none', counterReset: 'step' }}>
              {USAGE_STEPS.map((step, i) => (
                <li
                  key={step}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    fontSize: 14, color: 'var(--color-text)', lineHeight: 1.5,
                  }}
                >
                  <span style={{
                    flexShrink: 0, width: 22, height: 22, borderRadius: '50%',
                    background: 'var(--color-primary)', color: '#fff',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 800,
                  }}>{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div style={{
          padding: '14px 24px 20px',
          display: 'flex', justifyContent: 'flex-end',
        }}>
          <button className="btn btn-primary" onClick={onClose}>확인했어요</button>
        </div>
      </div>
    </div>
  );
}
