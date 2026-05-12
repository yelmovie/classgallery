import { useState } from 'react';
import { Link } from 'react-router-dom';
import SampleCarousel from '../components/dokdo/SampleCarousel';
import TeacherGuideModal from '../components/dokdo/TeacherGuideModal';

export default function HomePage() {
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <nav style={{
        padding: '14px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🎨</span>
          <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-text)' }}>
            우리반 라이브 갤러리
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setGuideOpen(true)}
          >
            안내
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        flex: 1,
        maxWidth: 1280,
        width: '100%',
        margin: '0 auto',
        padding: '64px 32px',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 5fr) minmax(0, 7fr)',
        gap: 56,
        alignItems: 'center',
      }}>
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div>
            <h1 style={{
              fontSize: 'clamp(34px, 4vw, 56px)',
              fontWeight: 800,
              lineHeight: 1.15,
              color: 'var(--color-text)',
              marginBottom: 18,
              letterSpacing: '-0.01em',
            }}>
              우리 반<br />
              <span style={{ color: 'var(--color-primary)' }}>작품</span>
            </h1>
            <p style={{
              fontSize: 18,
              color: 'var(--color-text)',
              fontWeight: 600,
              marginBottom: 12,
              lineHeight: 1.5,
            }}>
              친구들이 만든 그림을 고르고, 움직이는 작품으로 감상해요.
            </p>
            <p style={{ fontSize: 15, color: 'var(--color-muted)', lineHeight: 1.7 }}>
              학습지를 올리면, 아이들이 색칠한 작품이<br />
              전시 화면에서 살아 움직여요.
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: 14,
            flexWrap: 'wrap',
          }}>
            <Link
              to="/packs"
              className="btn btn-primary btn-lg"
              style={{
                flex: '1 1 200px',
                padding: '18px 28px',
                fontSize: 17,
                borderRadius: 18,
              }}
            >
              주제 고르기
            </Link>
            <Link
              to="/display"
              className="btn btn-ghost btn-lg"
              style={{
                flex: '1 1 200px',
                padding: '18px 28px',
                fontSize: 17,
                borderRadius: 18,
              }}
            >
              우리 반 갤러리 보기
            </Link>
          </div>
        </div>

        <div className="fade-in">
          <SampleCarousel />
        </div>
      </section>

      <TeacherGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </main>
  );
}
