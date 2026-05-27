import type { SpeedMode } from '../../types/artwork';
import type { ThemeBackground } from '../../types/theme';
import { SPEED_LABELS } from '../../constants/dokdoTheme';

const SPEED_ORDER: SpeedMode[] = ['paused', 'slow', 'normal', 'fast'];

interface Props {
  speedMode: SpeedMode;
  onSpeedChange: (mode: SpeedMode) => void;
  backgrounds: ThemeBackground[];
  selectedBackgroundId: string | null;
  defaultBackgroundId: string | null;
  onBackgroundChange: (id: string) => void;
}

/**
 * 시연용 전시관에서만 표시되는 인터랙티브 컨트롤 카드.
 * 방문자가 속도/배경을 직접 바꿔 보며 갤러리 동작 방식을 체험할 수 있다.
 * 실제 학생 학습지가 업로드되면 isSampleMode가 false 가 되어 자동으로 사라진다.
 */
export default function SampleDemoPanel({
  speedMode,
  onSpeedChange,
  backgrounds,
  selectedBackgroundId,
  defaultBackgroundId,
  onBackgroundChange,
}: Props) {
  const activeBgId = selectedBackgroundId ?? defaultBackgroundId;

  return (
    <div
      data-screenshot-ignore="true"
      style={{
        position: 'absolute',
        top: 56, left: 16,
        zIndex: 20,
        width: 240,
        background: 'rgba(255,255,255,0.92)',
        borderRadius: 16,
        padding: '12px 14px',
        boxShadow: '0 8px 28px rgba(0,0,0,0.16)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.6)',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 14 }}>🎬</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-primary-dark)' }}>
          시연 컨트롤
        </span>
        <span style={{
          fontSize: 10, fontWeight: 700,
          padding: '2px 6px', borderRadius: 99,
          background: 'rgba(255,220,100,0.85)',
          color: '#7a5200',
          marginLeft: 'auto',
        }}>
          샘플
        </span>
      </div>

      {/* 속도 */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#607587', marginBottom: 5 }}>
          캐릭터 이동 속도
        </div>
        <div
          role="radiogroup"
          aria-label="캐릭터 이동 속도"
          style={{
            display: 'flex', gap: 3,
            padding: 3,
            borderRadius: 10,
            background: 'var(--color-primary-light)',
          }}
        >
          {SPEED_ORDER.map((mode) => {
            const active = speedMode === mode;
            return (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onSpeedChange(mode)}
                style={{
                  flex: 1,
                  padding: '5px 4px',
                  borderRadius: 7,
                  border: 'none',
                  background: active ? 'var(--color-primary)' : 'transparent',
                  color: active ? '#fff' : 'var(--color-text)',
                  fontWeight: active ? 800 : 600,
                  fontSize: 10.5,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {SPEED_LABELS[mode]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 배경 */}
      {backgrounds.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#607587', marginBottom: 5 }}>
            배경 바꾸기
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(backgrounds.length, 5)}, 1fr)`,
            gap: 4,
          }}>
            {backgrounds.map((bg) => {
              const active = activeBgId === bg.id;
              return (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => onBackgroundChange(bg.id)}
                  aria-label={`배경 ${bg.name}`}
                  title={bg.name}
                  style={{
                    aspectRatio: '16 / 10',
                    padding: 0,
                    borderRadius: 6,
                    overflow: 'hidden',
                    border: active ? '2px solid var(--color-primary)' : '1px solid rgba(0,0,0,0.08)',
                    background: 'transparent',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  <img
                    src={bg.file}
                    alt=""
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    draggable={false}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 캐릭터 클릭 힌트 (점멸) */}
      <div
        style={{
          marginTop: 2,
          padding: '8px 10px',
          borderRadius: 10,
          background: 'linear-gradient(120deg, #fff5cf, #ffe6a8)',
          color: '#7a5200',
          fontSize: 11.5, fontWeight: 700,
          textAlign: 'center',
          animation: 'demoHintPulse 1.8s ease-in-out infinite',
        }}
      >
        👆 캐릭터를 눌러보세요
      </div>

      <style>{`
        @keyframes demoHintPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 200, 80, 0.5); }
          50%      { transform: scale(1.035); box-shadow: 0 0 0 6px rgba(255, 200, 80, 0); }
        }
      `}</style>
    </div>
  );
}
