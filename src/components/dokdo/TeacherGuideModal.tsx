import { useEffect } from 'react';

interface TeacherGuideModalProps {
  open: boolean;
  onClose: () => void;
}

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
            📘 안내
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

        <div
          style={{
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            fontSize: 14,
            color: 'var(--color-text)',
            lineHeight: 1.7,
          }}
        >
          <p style={{ margin: 0 }}>
            이 사이트는 우리 반 창의적 체험활동 및 학습 결과물을 보기 좋게 정리하고 감상하기 위한 교육용 웹페이지입니다.
          </p>
          <p style={{ margin: 0 }}>
            학생의 이름, 연락처, 주소, 주민등록번호 등 직접적인 개인정보를 수집하지 않습니다.
          </p>
          <p style={{ margin: 0 }}>
            작품과 학습지는 교실 수업 및 교육 활동을 위한 목적으로만 활용됩니다.
          </p>
          <p style={{ margin: 0 }}>
            사이트 이용 중 문의나 개선 의견이 있으면 "문의하기"를 통해 알려 주세요.
          </p>
          <p style={{ margin: 0 }}>
            문의 시 학생 실명, 연락처, 민감정보, 욕설, 비방, 저작권 침해 자료는 포함하지 말아 주세요.
          </p>
          <p style={{ margin: 0 }}>
            본 사이트는 교육 활동 보조용으로 제공되며, 자료 활용 및 게시 내용은 게시 전 관리자가 최종 확인해야 합니다.
          </p>
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
