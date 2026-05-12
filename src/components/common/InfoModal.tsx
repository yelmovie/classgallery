import { useEffect, type ReactNode } from 'react';

interface InfoModalProps {
  open: boolean;
  title: string;
  body: ReactNode;
  ctaLabel?: string;
  onClose: () => void;
}

export default function InfoModal({
  open,
  title,
  body,
  ctaLabel = '확인',
  onClose,
}: InfoModalProps) {
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
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(15, 40, 65, 0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="fade-in"
        style={{
          background: '#fff',
          borderRadius: 22,
          maxWidth: 400,
          width: '100%',
          maxHeight: 'calc(100vh - 40px)',
          overflowY: 'auto',
          boxShadow: '0 24px 60px rgba(15, 40, 65, 0.3)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px 12px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <h2
            id="info-modal-title"
            style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-text)' }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              border: 'none',
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            padding: '18px 24px',
            fontSize: 14,
            color: 'var(--color-text)',
            lineHeight: 1.7,
          }}
        >
          {body}
        </div>

        <div
          style={{
            padding: '12px 24px 20px',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button type="button" className="btn btn-primary" onClick={onClose}>
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
