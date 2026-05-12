import { useEffect } from 'react';
import type { TopicPack } from '../../types/topicPack';

interface TopicComingSoonModalProps {
  topic: TopicPack | null;
  onClose: () => void;
}

/**
 * comingSoon/draft 상태 주제 카드를 눌렀을 때 뜨는 안내 모달.
 * 가벼운 placeholder — 추후 상세 페이지 라우트로 대체 가능.
 */
export default function TopicComingSoonModal({ topic, onClose }: TopicComingSoonModalProps) {
  const open = topic !== null;

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

  if (!open || !topic) return null;

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="topic-coming-soon-title"
      style={{
        position: 'fixed', inset: 0, zIndex: 120,
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
          maxWidth: 440, width: '100%',
          boxShadow: '0 24px 60px rgba(15, 40, 65, 0.3)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: 120,
            background: topic.theme.gradient,
            position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span
            style={{
              padding: '6px 14px', borderRadius: 99,
              background: 'rgba(255,255,255,0.92)',
              color: topic.theme.accentColor,
              fontSize: 12, fontWeight: 800,
            }}
          >
            {topic.category}
          </span>
        </div>

        <div style={{
          padding: '24px 24px 20px',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <h2
            id="topic-coming-soon-title"
            style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)' }}
          >
            {topic.title}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.6 }}>
            {topic.description}
          </p>
          <div style={{
            padding: '12px 14px',
            background: 'var(--color-primary-light)',
            borderRadius: 12,
            fontSize: 13.5,
            color: 'var(--color-primary-dark)',
            lineHeight: 1.55,
          }}>
            이 주제의 에셋은 곧 추가돼요. 학습지와 배경이 준비되면 바로 사용하실 수 있어요.
          </div>
        </div>

        <div style={{ padding: '8px 24px 20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-primary" onClick={onClose}>확인했어요</button>
        </div>
      </div>
    </div>
  );
}
