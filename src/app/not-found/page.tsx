import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <section
        className="card"
        style={{
          width: 'min(100%, 520px)',
          padding: 32,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <span aria-hidden="true" style={{ fontSize: 36, fontWeight: 800, color: 'var(--color-primary)' }}>
          404
        </span>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', marginBottom: 8 }}>
            페이지를 찾을 수 없습니다
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-muted)' }}>
            주소가 바뀌었거나 등록되지 않은 화면입니다. 주제 선택 화면으로 돌아가 다시 시작해 주세요.
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/packs" className="btn btn-primary">
            주제 선택으로 이동
          </Link>
          <Link to="/" className="btn btn-ghost">
            홈으로
          </Link>
        </div>
      </section>
    </main>
  );
}
