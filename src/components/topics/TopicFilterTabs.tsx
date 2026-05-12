import { TOPIC_CATEGORIES } from '../../data/topicPacks';
import type { TopicCategory } from '../../types/topicPack';

interface TopicFilterTabsProps {
  active: 'all' | TopicCategory;
  onChange: (next: 'all' | TopicCategory) => void;
}

/**
 * 가로 필터 탭. 작은 화면에서는 자동 줄바꿈.
 */
export default function TopicFilterTabs({ active, onChange }: TopicFilterTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="주제 카테고리 필터"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
      }}
    >
      {TOPIC_CATEGORIES.map((cat) => {
        const isActive = cat.id === active;
        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(cat.id)}
            style={{
              padding: '9px 18px',
              borderRadius: 99,
              border: '1.5px solid',
              borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
              background: isActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.85)',
              color: isActive ? '#fff' : 'var(--color-text)',
              fontWeight: isActive ? 800 : 600,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: isActive ? '0 4px 12px rgba(47,128,216,0.25)' : 'none',
            }}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
