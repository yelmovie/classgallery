import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TOPIC_PACKS } from '../../data/topicPacks';
import type { TopicPack } from '../../types/topicPack';
import TopicCard from './TopicCard';
import TopicComingSoonModal from './TopicComingSoonModal';

/**
 * 홈 화면 하단 "생활 배움 갤러리" 섹션.
 * - 최대 maxItems 개의 주제 카드를 미니 그리드로 노출
 * - "모두 보기" 링크로 /packs 로 유도
 */
export default function TopicGallerySection({ maxItems = 6 }: { maxItems?: number }) {
  const navigate = useNavigate();
  const [comingSoon, setComingSoon] = useState<TopicPack | null>(null);

  const visible = TOPIC_PACKS.slice(0, maxItems);

  const handleClick = (topic: TopicPack) => {
    if (topic.status === 'available') {
      navigate(topic.route ?? `/packs?theme=${topic.id}`);
    } else {
      setComingSoon(topic);
    }
  };

  return (
    <section
      style={{
        background: 'rgba(255,255,255,0.55)',
        borderTop: '1px solid var(--color-border)',
        padding: '56px 32px',
      }}
    >
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        display: 'flex', flexDirection: 'column', gap: 28,
      }}>
        <header style={{
          display: 'flex', alignItems: 'flex-end',
          justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
        }}>
          <div>
            <h2 style={{
              fontSize: 'clamp(22px, 2.4vw, 30px)',
              fontWeight: 800,
              color: 'var(--color-text)',
              marginBottom: 6,
              lineHeight: 1.25,
            }}>
              생활 배움 갤러리
            </h2>
            <p style={{ fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.6 }}>
              친구들과 함께 배우고 싶은 주제를 골라 보세요.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/packs')}
            className="btn btn-ghost btn-sm"
            aria-label="모든 주제 보기"
          >
            모두 보기 →
          </button>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 20,
          }}
        >
          {visible.map((topic) => (
            <TopicCard key={topic.id} topic={topic} onClick={handleClick} />
          ))}
        </div>
      </div>

      <TopicComingSoonModal topic={comingSoon} onClose={() => setComingSoon(null)} />
    </section>
  );
}
