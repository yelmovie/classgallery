import { useState } from 'react';
import type { ThemeBackground } from '../../types/theme';

interface BackgroundPickerProps {
  backgrounds: ThemeBackground[];
  selectedId: string | null;
  defaultId: string | null;
  onSelect: (id: string) => void;
}

/**
 * /control 좌측 패널의 "전시 배경 선택" 영역.
 *
 * - 큰 이미지 한 장 + 좌우 화살표 캐러셀 방식
 * - backgrounds.length 가 0 이면 영역 자체 숨김
 * - 1장만 있어도 안전하게 동작 (좌우 화살표 비활성)
 * - selectedId 는 id 기반. 인덱스에 의존하지 않음.
 */
export default function BackgroundPicker({
  backgrounds,
  selectedId,
  defaultId,
  onSelect,
}: BackgroundPickerProps) {
  if (backgrounds.length === 0) return null;

  const activeId = selectedId ?? defaultId;
  const foundIndex = backgrounds.findIndex((b) => b.id === activeId);
  const currentIndex = foundIndex >= 0 ? foundIndex : 0;
  const current = backgrounds[currentIndex];
  const total = backgrounds.length;
  const canCycle = total > 1;

  const go = (dir: -1 | 1) => {
    if (!canCycle) return;
    const next = (currentIndex + dir + total) % total;
    onSelect(backgrounds[next].id);
  };

  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>
        전시 배경 선택
      </label>
      <p style={{ fontSize: 11.5, color: 'var(--color-muted)', marginBottom: 10 }}>
        전시 화면에 보일 배경을 고르세요.
      </p>

      <BackgroundStage
        background={current}
        onPrev={() => go(-1)}
        onNext={() => go(1)}
        canCycle={canCycle}
        displayNumber={currentIndex + 1}
      />

      <div
        aria-live="polite"
        style={{
          marginTop: 8,
          textAlign: 'center',
          fontSize: 13,
          fontWeight: 800,
          color: 'var(--color-primary-dark)',
          letterSpacing: '0.04em',
        }}
      >
        {currentIndex + 1} / {total}
      </div>
    </div>
  );
}

function BackgroundStage({
  background,
  onPrev,
  onNext,
  canCycle,
  displayNumber,
}: {
  background: ThemeBackground;
  onPrev: () => void;
  onNext: () => void;
  canCycle: boolean;
  displayNumber: number;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      role="group"
      aria-label={`${displayNumber}번 배경 선택됨`}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        borderRadius: 12,
        overflow: 'hidden',
        border: '2px solid var(--color-primary)',
        background: imgError
          ? 'linear-gradient(135deg, #c8daea, #97b1c6)'
          : '#e8f2fb',
        boxShadow: '0 4px 14px rgba(31,95,145,0.18)',
      }}
    >
      {!imgError && (
        <img
          src={background.file}
          alt=""
          onError={() => setImgError(true)}
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: background.position ?? 'center',
            display: 'block',
            userSelect: 'none',
          }}
          draggable={false}
        />
      )}

      {canCycle && (
        <>
          <CarouselArrow direction="left"  onClick={onPrev} />
          <CarouselArrow direction="right" onClick={onNext} />
        </>
      )}
    </div>
  );
}

function CarouselArrow({
  direction,
  onClick,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'left' ? '이전 배경' : '다음 배경'}
      style={{
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        left: direction === 'left' ? 6 : undefined,
        right: direction === 'right' ? 6 : undefined,
        width: 28, height: 28, borderRadius: '50%',
        border: 'none',
        background: 'rgba(255,255,255,0.85)',
        color: 'var(--color-primary-dark)',
        fontSize: 16, fontWeight: 800,
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(15,40,65,0.25)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        lineHeight: 1,
        padding: 0,
        transition: 'background 0.15s, transform 0.1s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.85)'; }}
    >
      {direction === 'left' ? '‹' : '›'}
    </button>
  );
}
