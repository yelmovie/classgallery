import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WorksheetGalleryModal from '../../components/dokdo/WorksheetGalleryModal';
import TopicCard from '../../components/topics/TopicCard';
import TopicFilterTabs from '../../components/topics/TopicFilterTabs';
import TopicComingSoonModal from '../../components/topics/TopicComingSoonModal';
import { filterTopicPacks } from '../../data/topicPacks';
import type { TopicCategory, TopicPack } from '../../types/topicPack';
import { THEMES_BY_ID } from '../../constants/themes';
import type { ThemeId } from '../../types/theme';

/**
 * 주제 고르기 화면.
 * - 필터 탭 + 카드 그리드 (data/topicPacks.ts 의 12 개 주제 + 향후 추가분)
 * - available 카드 클릭 → 하단 상세 영역(배경 안내 + 활동지 6장) 표시 → /control 진입
 * - comingSoon/draft 카드 클릭 → 안내 모달
 */
export default function PacksPage() {
  const navigate = useNavigate();
  const [activeCat, setActiveCat] = useState<'all' | TopicCategory>('all');
  const [comingSoon, setComingSoon] = useState<TopicPack | null>(null);
  const [worksheetsTheme, setWorksheetsTheme] = useState<ThemeId | null>(null);
  const [detailTheme, setDetailTheme] = useState<ThemeId>('dokdo');

  const filtered = useMemo(() => filterTopicPacks(activeCat), [activeCat]);
  const detailThemeMeta = THEMES_BY_ID[detailTheme];

  const handleCardClick = (topic: TopicPack) => {
    if (topic.status === 'available' && topic.themeId) {
      setDetailTheme(topic.themeId);
      // 화면 아래 상세 영역으로 부드러운 스크롤
      requestAnimationFrame(() => {
        document.getElementById('topic-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } else {
      setComingSoon(topic);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <nav style={{
        padding: '14px 32px',
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <Link to="/" className="btn btn-ghost btn-sm">← 홈</Link>
      </nav>

      <div style={{
        maxWidth: 1280, margin: '0 auto',
        padding: '48px 32px 80px',
        display: 'flex', flexDirection: 'column', gap: 36,
      }}>
        {/* 페이지 헤더 */}
        <header>
          <p style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--color-muted)',
            letterSpacing: '0.06em',
            textTransform: 'none',
            marginBottom: 8,
          }}>
            창체 주제
          </p>
          <h1 style={{
            fontSize: 'clamp(28px, 3.4vw, 40px)',
            fontWeight: 800,
            lineHeight: 1.2,
            color: 'var(--color-text)',
            marginBottom: 10,
          }}>
            주제 고르기
          </h1>
          <p style={{ fontSize: 15.5, color: 'var(--color-muted)', lineHeight: 1.6 }}>
            우리 반에서 함께할 주제를 골라 보세요. 활동지와 배경이 준비된 주제는 바로 시작할 수 있어요.
          </p>
        </header>

        {/* 필터 탭 */}
        <TopicFilterTabs active={activeCat} onChange={setActiveCat} />

        {/* 카드 그리드 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 22,
          }}
        >
          {filtered.map((topic) => (
            <TopicCard key={topic.id} topic={topic} onClick={handleCardClick} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{
            padding: 40, textAlign: 'center',
            color: 'var(--color-muted)', fontSize: 14,
          }}>
            이 카테고리에는 아직 주제가 없어요. 다른 카테고리를 살펴보세요.
          </div>
        )}

        {/* 사용 가능 주제 상세 영역: 활동지 + 전시 만들기 진입 */}
        {detailThemeMeta && detailThemeMeta.worksheets && (
          <section id="topic-detail" className="card fade-in" style={{ padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
              <span style={{ fontSize: 36 }}>{detailThemeMeta.emoji}</span>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800 }}>{detailThemeMeta.name}</h2>
                <p style={{ fontSize: 13.5, color: 'var(--color-muted)' }}>
                  활동지 {detailThemeMeta.worksheets.length}종 · A4 학습지 사진 업로드
                </p>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
              gap: 14, marginBottom: 28,
            }}>
              {detailThemeMeta.worksheets.map((ws) => (
                <div
                  key={ws.id}
                  title={ws.displayName}
                  aria-label={`${ws.group}번 활동지 (${ws.displayName})`}
                  style={{
                    background: 'var(--color-bg)',
                    borderRadius: 14,
                    overflow: 'hidden',
                    border: '1.5px solid var(--color-border)',
                    display: 'flex', flexDirection: 'column',
                  }}
                >
                  <div style={{
                    padding: '6px 10px',
                    background: 'var(--color-primary)',
                    color: '#fff', fontSize: 15, fontWeight: 800,
                    textAlign: 'center',
                    letterSpacing: '0.02em',
                  }}>
                    {ws.group}
                  </div>
                  <div style={{
                    padding: 8, flex: 1,
                    display: 'flex', justifyContent: 'center',
                    minHeight: 110,
                  }}>
                    <WorksheetThumb file={ws.file} alt={ws.name} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => navigate(`/control?theme=${detailThemeMeta.id}`)}
              >
                🎨 이 주제로 전시 만들기
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-lg"
                onClick={() => setWorksheetsTheme(detailThemeMeta.id)}
              >
                📄 활동지 보기
              </button>
            </div>
          </section>
        )}
      </div>

      <TopicComingSoonModal topic={comingSoon} onClose={() => setComingSoon(null)} />
      <WorksheetGalleryModal
        themeId={worksheetsTheme}
        onClose={() => setWorksheetsTheme(null)}
      />
    </main>
  );
}

function WorksheetThumb({ file, alt }: { file: string; alt: string }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 6,
        alignItems: 'center', justifyContent: 'center',
        fontSize: 11, color: 'var(--color-muted)',
        textAlign: 'center', padding: 8,
      }}>
        <span style={{ fontSize: 24 }}>📄</span>
        파일을 찾을 수 없습니다
      </div>
    );
  }
  return (
    <img
      src={file}
      alt={alt}
      onError={() => setError(true)}
      style={{
        width: '100%', height: 100,
        objectFit: 'contain',
        borderRadius: 8,
      }}
      draggable={false}
    />
  );
}
