import { useState } from 'react';
import type { TopicPack } from '../../types/topicPack';

interface TopicCardProps {
  topic: TopicPack;
  onClick: (topic: TopicPack) => void;
}

/**
 * 주제 카드. 큰 배경 미리보기 + 상태 배지 + 제목 + 한 줄 설명.
 * - 배경 에셋 없으면 그라데이션 placeholder
 * - comingSoon/draft 는 시각적으로 비활성 처리하되 클릭은 가능 (안내 모달 트리거)
 */
export default function TopicCard({ topic, onClick }: TopicCardProps) {
  const [bgError, setBgError] = useState(false);

  const available = topic.status === 'available';
  const showBg = !bgError && topic.assets.backgrounds.length > 0;
  const primaryBg = topic.assets.backgrounds[0];

  const statusLabel = available
    ? '바로 시작'
    : topic.status === 'comingSoon'
      ? '곧 추가돼요'
      : '준비 중';
  const statusBg = available ? '#e6f8f0' : 'rgba(255,255,255,0.78)';
  const statusColor = available ? '#1f8c5d' : 'var(--color-muted)';

  return (
    <button
      type="button"
      onClick={() => onClick(topic)}
      aria-label={`${topic.title} 주제 선택 (${statusLabel})`}
      className="card fade-in"
      style={{
        padding: 0,
        textAlign: 'left',
        cursor: 'pointer',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        border: '1.5px solid var(--color-border)',
        background: 'rgba(255,255,255,0.92)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s',
        opacity: available ? 1 : 0.92,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 14px 38px rgba(31,95,145,0.18)';
        e.currentTarget.style.borderColor = topic.theme.accentColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
        e.currentTarget.style.borderColor = 'var(--color-border)';
      }}
    >
      {/* 배경 미리보기 또는 placeholder */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '16 / 10',
          background: topic.theme.gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {showBg && (
          <img
            src={primaryBg}
            alt=""
            onError={() => setBgError(true)}
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center',
              display: 'block',
            }}
            draggable={false}
          />
        )}
        {/* 상태 배지 */}
        <span
          style={{
            position: 'absolute', top: 12, right: 12,
            padding: '5px 12px', borderRadius: 99,
            fontSize: 12, fontWeight: 800,
            background: statusBg,
            color: statusColor,
            border: '1px solid rgba(255,255,255,0.6)',
            backdropFilter: 'blur(6px)',
          }}
        >
          {statusLabel}
        </span>
        {/* 카테고리 작은 라벨 */}
        <span
          style={{
            position: 'absolute', bottom: 12, left: 12,
            padding: '4px 10px', borderRadius: 99,
            fontSize: 11, fontWeight: 700,
            background: 'rgba(255,255,255,0.85)',
            color: topic.theme.accentColor,
            backdropFilter: 'blur(6px)',
          }}
        >
          {topic.category}
        </span>
        {/* 에셋 없음 안내 (배경 placeholder 상태에서만) */}
        {(!showBg) && (
          <div
            aria-hidden="true"
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 600,
              textShadow: '0 2px 6px rgba(0,0,0,0.18)',
              letterSpacing: '0.02em',
            }}
          >
            에셋 준비 중
          </div>
        )}
      </div>

      {/* 본문 */}
      <div style={{
        padding: '18px 18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        <h3 style={{
          fontSize: 19,
          fontWeight: 800,
          color: 'var(--color-text)',
          lineHeight: 1.25,
        }}>
          {topic.title}
        </h3>
        <p style={{
          fontSize: 14,
          color: 'var(--color-muted)',
          lineHeight: 1.55,
        }}>
          {topic.description}
        </p>
      </div>
    </button>
  );
}
