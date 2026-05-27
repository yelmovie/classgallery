import { useState, useCallback, useEffect } from 'react';
import ExhibitionStage from './ExhibitionStage';
import { useProcessedSamples } from '../../lib/image/useProcessedSamples';
import { THEME_LIST } from '../../constants/themes';
import { getDefaultBackground } from '../../lib/themes/getThemeBackgrounds';

/**
 * 홈 화면의 샘플 전시 미리보기 carousel.
 *
 * - 좌우 화살표로 주제팩 간 이동
 * - 사용 가능한 주제는 실제 ExhibitionStage 샘플 재생 (현재 슬라이드만 처리)
 * - 추가 예정 주제는 그라데이션 placeholder
 *
 * 자체적으로 stage 영역을 갖지만, 스크린샷 캡처 대상 #exhibition-stage 는
 * /display 페이지에만 부여한다 (이 carousel 은 홍보용).
 */
const AVAILABLE_THEMES = THEME_LIST.filter((t) => t.status === 'available');

export default function SampleCarousel() {
  const [index, setIndex] = useState(0);
  const current = AVAILABLE_THEMES[index];

  // 성능: 현재 슬라이드가 available 이고 sampleUrls 가 있을 때만 sample 가공.
  const sampleUrlsForCurrent = current.sampleUrls ?? [];
  const { samples } = useProcessedSamples(sampleUrlsForCurrent);

  const go = useCallback((dir: -1 | 1) => {
    setIndex((i) => (i + dir + AVAILABLE_THEMES.length) % AVAILABLE_THEMES.length);
  }, []);

  // 키보드 좌우 화살표 지원
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const previewItems = samples.slice(0, 6).map((s) => ({
    id: s.id,
    imageUrl: s.cutoutUrl,
  }));

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 14, gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="badge" style={{ fontSize: 11 }}>샘플 전시 화면</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>
            {current.emoji} {current.name}
          </span>
        </div>
        <span
          className="badge"
          style={{ fontSize: 11, background: '#e6f8f0', color: '#1f8c5d', border: 'none' }}
        >
          사용 가능
        </span>
      </div>

      <div style={{
        position: 'relative',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 20px 64px rgba(31,95,145,0.22)',
        aspectRatio: '16/9',
        background: 'var(--color-bg)',
      }}>
        <ExhibitionStage
          items={previewItems}
          speedMode="slow"
          compact
          backgroundUrl={getDefaultBackground(current)?.file}
        />

        <CarouselArrow direction="left"  onClick={() => go(-1)} />
        <CarouselArrow direction="right" onClick={() => go(1)} />
      </div>

      <div style={{
        display: 'flex', justifyContent: 'center', gap: 6,
        marginTop: 14,
      }}>
        {AVAILABLE_THEMES.map((t, i) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`${t.name} 미리보기로 이동`}
            aria-current={i === index}
            style={{
              width: i === index ? 22 : 7,
              height: 7,
              borderRadius: 4,
              border: 'none',
              background: i === index ? 'var(--color-primary)' : 'var(--color-border)',
              cursor: 'pointer',
              transition: 'width 0.25s ease, background 0.25s ease',
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function CarouselArrow({ direction, onClick }: {
  direction: 'left' | 'right';
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'left' ? '이전 샘플 보기' : '다음 샘플 보기'}
      style={{
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        left: direction === 'left' ? 14 : undefined,
        right: direction === 'right' ? 14 : undefined,
        width: 40, height: 40, borderRadius: '50%',
        border: 'none',
        background: 'rgba(255,255,255,0.85)',
        color: 'var(--color-primary-dark)',
        fontSize: 18, fontWeight: 700,
        cursor: 'pointer',
        boxShadow: '0 4px 14px rgba(15,40,65,0.2)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 5,
        transition: 'background 0.15s, transform 0.1s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.85)'; }}
    >
      {direction === 'left' ? '‹' : '›'}
    </button>
  );
}
