import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGallery } from '../../context/GalleryContext';
import { useCustomThemes } from '../../context/CustomThemeContext';
import { THEME_LIST } from '../../constants/themes';
import {
  getAdminPasswordMode,
  hasAdminPassword,
  initializeLocalAdminPassword,
  verifyAdminPassword,
} from '../../lib/security/adminAuth';

const SESSION_KEY = 'classgallery-admin-auth';
const NOTICES_KEY = 'classgallery-admin-notices';

const MAX_BG = 5;
const MAX_SAMPLE = 10;
const MAX_WS = 10;

interface Notice {
  id: string;
  text: string;
  createdAt: number;
}

// ─── 메인 페이지 ──────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  const [passwordReady, setPasswordReady] = useState(hasAdminPassword);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState(false);
  const [setupPw, setSetupPw] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');
  const [setupError, setSetupError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);

  const login = async () => {
    setAuthBusy(true);
    const ok = await verifyAdminPassword(pwInput);
    setAuthBusy(false);

    if (ok) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setAuthed(true);
      setPwError(false);
    } else {
      setPwError(true);
      setPwInput('');
    }
  };

  const setupPassword = async () => {
    const next = setupPw.trim();
    if (next.length < 6) {
      setSetupError('비밀번호는 6자 이상으로 설정해주세요.');
      return;
    }
    if (next !== setupConfirm.trim()) {
      setSetupError('비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    setAuthBusy(true);
    await initializeLocalAdminPassword(next);
    setAuthBusy(false);
    setPasswordReady(true);
    sessionStorage.setItem(SESSION_KEY, '1');
    setAuthed(true);
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
  };

  if (!authed) {
    const passwordMode = getAdminPasswordMode();
    return (
      <div style={{
        minHeight: '100vh', background: '#f0f4f8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          background: 'var(--color-surface-solid)', borderRadius: 'var(--radius-card)', padding: '48px 40px',
          boxShadow: 'var(--shadow-card)', width: 340,
          display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center',
        }}>
          <span style={{ fontSize: 40 }}>🔒</span>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
            관리자 게시판
          </h1>

          {!passwordReady && passwordMode === 'local-setup' ? (
            <>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--color-muted)', textAlign: 'center', lineHeight: 1.6 }}>
                처음 사용하는 기기입니다. 관리자 비밀번호를 설정하세요.
              </p>
              <input
                type="password"
                value={setupPw}
                onChange={(e) => { setSetupPw(e.target.value); setSetupError(''); }}
                placeholder="새 비밀번호"
                autoFocus
                style={{
                  width: '100%', padding: '12px 16px', fontSize: 16,
                  border: `1.5px solid ${setupError ? '#e55' : '#d0d8e0'}`,
                  borderRadius: 12, outline: 'none', boxSizing: 'border-box',
                }}
              />
              <input
                type="password"
                value={setupConfirm}
                onChange={(e) => { setSetupConfirm(e.target.value); setSetupError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') void setupPassword(); }}
                placeholder="비밀번호 확인"
                style={{
                  width: '100%', padding: '12px 16px', fontSize: 16,
                  border: `1.5px solid ${setupError ? '#e55' : '#d0d8e0'}`,
                  borderRadius: 12, outline: 'none', boxSizing: 'border-box',
                }}
              />
              {setupError && <p style={{ margin: 0, fontSize: 13, color: '#e55' }}>{setupError}</p>}
              <p style={{ margin: 0, fontSize: 12, color: '#8da0ad', textAlign: 'center', lineHeight: 1.5 }}>
                배포 환경에서는 VITE_CLASSGALLERY_ADMIN_HASH 값을 설정하면 초기 설정 없이 사용할 수 있어요.
              </p>
              <button
                onClick={() => void setupPassword()}
                disabled={authBusy}
                style={{
                  width: '100%', padding: '13px', fontSize: 15, fontWeight: 700,
                  background: 'var(--color-primary)', color: '#fff', border: 'none',
                  borderRadius: 12, cursor: authBusy ? 'wait' : 'pointer',
                  opacity: authBusy ? 0.65 : 1,
                }}
              >
                비밀번호 설정
              </button>
            </>
          ) : (
            <>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--color-muted)', textAlign: 'center' }}>
                관리자 비밀번호를 입력하세요
              </p>
              <input
                type="password"
                value={pwInput}
                onChange={(e) => { setPwInput(e.target.value); setPwError(false); }}
                onKeyDown={(e) => { if (e.key === 'Enter') void login(); }}
                placeholder="비밀번호"
                autoFocus
                style={{
                  width: '100%', padding: '12px 16px', fontSize: 16,
                  border: `1.5px solid ${pwError ? '#e55' : '#d0d8e0'}`,
                  borderRadius: 12, outline: 'none', boxSizing: 'border-box',
                }}
              />
              {pwError && <p style={{ margin: 0, fontSize: 13, color: '#e55' }}>비밀번호가 틀렸습니다.</p>}
              <p style={{ margin: 0, fontSize: 12, color: '#b0bec8', textAlign: 'center', lineHeight: 1.5 }}>
                비밀번호 원문은 코드에 저장하지 않습니다.
              </p>
              <button
                onClick={() => void login()}
                disabled={authBusy}
                style={{
                  width: '100%', padding: '13px', fontSize: 15, fontWeight: 700,
                  background: 'var(--color-primary)', color: '#fff', border: 'none',
                  borderRadius: 12, cursor: authBusy ? 'wait' : 'pointer',
                  opacity: authBusy ? 0.65 : 1,
                }}
              >
                로그인
              </button>
            </>
          )}
          <Link to="/" style={{ fontSize: 13, color: 'var(--color-muted)', textDecoration: 'none' }}>← 홈으로</Link>
        </div>
      </div>
    );
  }

  return <AdminDashboard onLogout={logout} onVerifyPassword={verifyAdminPassword} />;
}

// ─── 대시보드 ─────────────────────────────────────────────────────────────────

function AdminDashboard({
  onLogout,
  onVerifyPassword,
}: {
  onLogout: () => void;
  onVerifyPassword: (password: string) => Promise<boolean>;
}) {
  const { state, clearAll } = useGallery();
  const { artworks, currentTheme, speedMode } = state;
  const { customThemes, deleteTheme } = useCustomThemes();
  const navigate = useNavigate();

  const [notices, setNotices] = useState<Notice[]>(() => {
    try {
      const saved = localStorage.getItem(NOTICES_KEY);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return [
      { id: 'default-1', text: '🎉 CLASS GALLERY에 오신 것을 환영합니다! 왼쪽 메뉴에서 주제를 선택하고, 학생 작품을 업로드해 전시를 시작해보세요.', createdAt: Date.now() },
    ];
  });
  const [noticeInput, setNoticeInput] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearPwInput, setClearPwInput] = useState('');
  const [clearPwError, setClearPwError] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [deleteThemeTarget, setDeleteThemeTarget] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    localStorage.setItem(NOTICES_KEY, JSON.stringify(notices));
  }, [notices]);

  const addNotice = () => {
    const text = noticeInput.trim();
    if (!text) return;
    setNotices((prev) => [{ id: `${Date.now()}`, text, createdAt: Date.now() }, ...prev]);
    setNoticeInput('');
  };

  const currentThemeMeta = [...THEME_LIST, ...customThemes].find((t) => t.id === currentTheme);
  const availableCount = THEME_LIST.filter((t) => t.status === 'available').length + customThemes.length;

  const confirmClearAll = async () => {
    const ok = await onVerifyPassword(clearPwInput);
    if (!ok) {
      setClearPwError(true);
      return;
    }
    clearAll();
    setConfirmClear(false);
    setClearPwInput('');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      {/* 헤더 */}
      <nav style={{
        background: 'var(--color-primary-dark)', padding: '14px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>🛡️</span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>CLASS GALLERY 관리자</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/" style={{
            color: 'rgba(255,255,255,0.7)', fontSize: 13, textDecoration: 'none',
            padding: '6px 14px', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8,
          }}>← 홈</Link>
          <button onClick={onLogout} style={{
            background: 'rgba(255,80,80,0.18)', color: '#ff9090',
            border: '1px solid rgba(255,80,80,0.35)', borderRadius: 8,
            padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 600,
          }}>로그아웃</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* 현황 요약 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
          {[
            { label: '현재 테마', value: currentThemeMeta ? `${currentThemeMeta.emoji} ${currentThemeMeta.name}` : '-', color: 'var(--color-primary)' },
            { label: '업로드된 작품', value: `${artworks.length}개`, color: '#1a8c5d' },
            { label: '재생 속도', value: speedMode === 'paused' ? '⏸ 정지' : speedMode === 'slow' ? '🐢 느림' : speedMode === 'normal' ? '🚶 보통' : '🏃 빠름', color: '#7a5200' },
            { label: '전체 사용 가능 주제', value: `${availableCount}개`, color: '#6a3db5' },
          ].map((stat) => (
            <div key={stat.label} style={{ background: 'var(--color-surface-solid)', borderRadius: 16, padding: '20px 22px', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ fontSize: 12, color: 'var(--color-muted)', fontWeight: 600, marginBottom: 6 }}>{stat.label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* 공지사항 */}
        <Card title="📌 공지사항 게시판">
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <input
              type="text"
              value={noticeInput}
              onChange={(e) => setNoticeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addNotice()}
              placeholder="공지 내용을 입력하고 Enter 또는 등록을 눌러주세요"
              style={{ flex: 1, padding: '10px 14px', fontSize: 14, border: '1.5px solid #d0d8e0', borderRadius: 10, outline: 'none' }}
            />
            <button onClick={addNotice} style={{
              padding: '10px 18px', background: 'var(--color-primary)', color: '#fff',
              border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14,
            }}>등록</button>
          </div>
          {notices.length === 0
            ? <p style={{ color: '#aaa', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>등록된 공지가 없습니다.</p>
            : notices.map((n) => (
              <div key={n.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                background: '#f7fafd', borderRadius: 10, padding: '12px 14px',
                border: '1px solid #e4eaf0', marginBottom: 8,
              }}>
                <span style={{ fontSize: 16 }}>📢</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text)', lineHeight: 1.5 }}>{n.text}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: '#aaa' }}>{new Date(n.createdAt).toLocaleString('ko-KR')}</p>
                </div>
                <button onClick={() => setNotices((prev) => prev.filter((x) => x.id !== n.id))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: 16 }}>×</button>
              </div>
            ))}
        </Card>

        {/* 커스텀 테마 목록 + 새 주제 만들기 */}
        <Card title="🎨 내가 만든 주제">
          {customThemes.length === 0 && !wizardOpen && (
            <p style={{ color: '#aaa', fontSize: 14, textAlign: 'center', padding: '12px 0' }}>
              아직 만든 주제가 없어요. 아래 버튼으로 첫 주제를 만들어보세요!
            </p>
          )}
          {customThemes.map((t) => (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between',
              padding: '12px 14px', borderRadius: 12, background: '#f0f8f4',
              border: '1px solid #c8ead8', marginBottom: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 26 }}>{t.emoji}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text)' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                    배경 {t.backgrounds?.length ?? 0}장 · 샘플 {t.sampleUrls?.length ?? 0}장 · 학습지 {t.worksheets?.length ?? 0}장
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => navigate(`/control?theme=${t.id}`)}
                  style={{
                    padding: '7px 14px', background: 'var(--color-primary)', color: '#fff',
                    border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  }}
                >전시하기</button>
                <button
                  onClick={() => setDeleteThemeTarget({ id: t.id, name: t.name })}
                  style={{
                    padding: '7px 12px', background: '#fff0f0', color: '#c0392b',
                    border: '1px solid #f0b0b0', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                  }}
                >삭제</button>
              </div>
            </div>
          ))}

          {!wizardOpen ? (
            <button
              onClick={() => setWizardOpen(true)}
              style={{
                width: '100%', padding: '14px', marginTop: 8,
                background: 'linear-gradient(135deg, var(--color-primary), #4a9ed8)',
                color: '#fff', border: 'none', borderRadius: 12,
                cursor: 'pointer', fontWeight: 700, fontSize: 15,
                boxShadow: '0 4px 14px rgba(31,111,186,0.25)',
              }}
            >
              ➕ 새 계기교육 주제 만들기
            </button>
          ) : (
            <ThemeWizard onDone={() => setWizardOpen(false)} onCancel={() => setWizardOpen(false)} />
          )}
        </Card>

        {/* 기본 주제팩 현황 */}
        <Card title="📦 기본 제공 주제팩">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {THEME_LIST.filter((t) => t.status === 'available').map((t) => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', borderRadius: 8, background: '#f0f8f4', border: '1px solid #c8ead8',
              }}>
                <span style={{ fontSize: 14, color: 'var(--color-text)' }}>{t.emoji} {t.name}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: '#1a8c5d', color: '#fff' }}>사용 가능</span>
              </div>
            ))}
          </div>
        </Card>

        {/* 빠른 이동 & 갤러리 관리 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          <Card title="🔗 빠른 이동">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { to: '/control', label: '🎮 제어판', desc: '학습지 업로드·속도 조절' },
                { to: '/display', label: '🖼️ 전시 화면', desc: '갤러리 전시 보기' },
                { to: '/packs', label: '📦 주제팩 목록', desc: '주제 선택하기' },
              ].map((item) => (
                <Link key={item.to} to={item.to} style={{
                  display: 'flex', flexDirection: 'column', textDecoration: 'none',
                  padding: '12px 14px', borderRadius: 10, background: '#f7fafd', border: '1px solid #e4eaf0',
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary)' }}>{item.label}</span>
                  <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>{item.desc}</span>
                </Link>
              ))}
              <a href="https://www.instagram.com/moviesamm" target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', flexDirection: 'column', textDecoration: 'none',
                padding: '12px 14px', borderRadius: 10, background: '#fff0f8', border: '1px solid #f0c0d8',
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#c2185b' }}>📷 Instagram</span>
                <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>@moviesamm · 문의 및 업데이트</span>
              </a>
            </div>
          </Card>

          <Card title="🗑️ 갤러리 관리">
            <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--color-muted)' }}>
              현재 업로드된 작품 <strong style={{ color: 'var(--color-primary)' }}>{artworks.length}개</strong>를 모두 삭제합니다.
            </p>
            {!confirmClear ? (
              <button onClick={() => { setConfirmClear(true); setClearPwInput(''); setClearPwError(false); }} disabled={artworks.length === 0} style={{
                width: '100%', padding: '11px', fontSize: 14, fontWeight: 700,
                background: artworks.length === 0 ? '#f0f0f0' : '#fff0f0',
                color: artworks.length === 0 ? '#ccc' : '#c0392b',
                border: `1px solid ${artworks.length === 0 ? '#e0e0e0' : '#f0b0b0'}`,
                borderRadius: 10, cursor: artworks.length === 0 ? 'default' : 'pointer',
              }}>전체 작품 초기화</button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ margin: 0, fontSize: 13, color: '#c0392b', fontWeight: 600 }}>
                  관리자 비밀번호를 입력하면 전체 작품이 삭제됩니다.
                </p>
                <input
                  type="password"
                  value={clearPwInput}
                  onChange={(e) => { setClearPwInput(e.target.value); setClearPwError(false); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      void confirmClearAll();
                    }
                    if (e.key === 'Escape') setConfirmClear(false);
                  }}
                  placeholder="비밀번호 입력"
                  autoFocus
                  style={{
                    width: '100%', padding: '10px 14px', fontSize: 14, boxSizing: 'border-box',
                    border: `1.5px solid ${clearPwError ? '#e55' : '#d0d8e0'}`, borderRadius: 10, outline: 'none',
                  }}
                />
                {clearPwError && <p style={{ margin: 0, fontSize: 12, color: '#e55' }}>비밀번호가 틀렸습니다.</p>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => void confirmClearAll()} style={{
                    flex: 1, padding: '11px', fontSize: 14, fontWeight: 700,
                    background: '#c0392b', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer',
                  }}>확인 · 삭제</button>
                  <button onClick={() => setConfirmClear(false)} style={{
                    flex: 1, padding: '11px', fontSize: 14, background: '#f0f4f8',
                    color: 'var(--color-text)', border: '1px solid #d0d8e0', borderRadius: 10, cursor: 'pointer',
                  }}>취소</button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
      {deleteThemeTarget && (
        <div className="dialog-backdrop" role="presentation" onClick={() => setDeleteThemeTarget(null)}>
          <div
            className="dialog-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-theme-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-theme-title">주제 삭제 확인</h2>
            <p>"{deleteThemeTarget.name}" 주제를 삭제할까요?</p>
            <div className="dialog-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setDeleteThemeTarget(null)}>
                취소
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  void deleteTheme(deleteThemeTarget.id);
                  setDeleteThemeTarget(null);
                }}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 테마 생성 마법사 ─────────────────────────────────────────────────────────

type WizardStep = 'info' | 'backgrounds' | 'samples' | 'worksheets' | 'saving';

function ThemeWizard({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const { createTheme } = useCustomThemes();
  const [step, setStep] = useState<WizardStep>('info');
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📚');
  const [bgFiles, setBgFiles] = useState<File[]>([]);
  const [sampleFiles, setSampleFiles] = useState<File[]>([]);
  const [wsFiles, setWsFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  const steps: WizardStep[] = ['info', 'backgrounds', 'samples', 'worksheets'];
  const stepIdx = steps.indexOf(step);

  const stepLabels: Record<WizardStep, string> = {
    info: '① 기본 정보',
    backgrounds: '② 배경 그림',
    samples: '③ 샘플 그림',
    worksheets: '④ 학습지',
    saving: '저장 중...',
  };

  const canNext = () => {
    if (step === 'info') return name.trim().length > 0 && emoji.trim().length > 0;
    if (step === 'backgrounds') return bgFiles.length >= 1;
    if (step === 'samples') return sampleFiles.length >= 1;
    if (step === 'worksheets') return wsFiles.length >= 1;
    return false;
  };

  const handleNext = () => {
    const order: WizardStep[] = ['info', 'backgrounds', 'samples', 'worksheets'];
    const i = order.indexOf(step);
    if (i < order.length - 1) setStep(order[i + 1]);
  };

  const handleBack = () => {
    const order: WizardStep[] = ['info', 'backgrounds', 'samples', 'worksheets'];
    const i = order.indexOf(step);
    if (i > 0) setStep(order[i - 1]);
  };

  const handleCreate = async () => {
    setStep('saving');
    setError('');
    try {
      await createTheme({
        name: name.trim(),
        emoji: emoji.trim(),
        bgFiles,
        sampleFiles,
        wsFiles,
        onProgress: setProgress,
      });
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 중 오류가 발생했습니다.');
      setStep('worksheets');
    }
  };

  return (
    <div style={{
      marginTop: 16, border: '2px solid #4a9ed8', borderRadius: 16,
      background: '#f7fafd', padding: 24,
    }}>
      {/* 스텝 인디케이터 */}
      {step !== 'saving' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {steps.map((s, i) => (
            <span key={s} style={{
              padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700,
              background: s === step ? 'var(--color-primary)' : i < stepIdx ? 'var(--color-success)' : 'var(--color-primary-light)',
              color: s === step || i < stepIdx ? '#fff' : 'var(--color-muted)',
            }}>{stepLabels[s]}</span>
          ))}
        </div>
      )}

      {step === 'info' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h3 style={{ margin: 0, fontSize: 16, color: 'var(--color-text)' }}>주제 이름과 아이콘을 정해주세요</h3>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: '0 0 80px' }}>
              <label style={{ fontSize: 12, color: 'var(--color-muted)', display: 'block', marginBottom: 6 }}>이모지</label>
              <input
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={4}
                style={{
                  width: '100%', padding: '10px', fontSize: 22, textAlign: 'center',
                  border: '1.5px solid #d0d8e0', borderRadius: 10, outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: 'var(--color-muted)', display: 'block', marginBottom: 6 }}>주제 이름 *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 진로체험 교육, 환경의 날 특별활동..."
                style={{
                  width: '100%', padding: '12px 14px', fontSize: 15,
                  border: '1.5px solid #d0d8e0', borderRadius: 10, outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
          {name && (
            <div style={{
              padding: '12px 16px', background: '#e8f4fd', borderRadius: 10,
              fontSize: 14, color: 'var(--color-primary)', fontWeight: 600,
            }}>
              미리보기: {emoji} {name} 전시관
            </div>
          )}
        </div>
      )}

      {step === 'backgrounds' && (
        <ImageUploadStep
          title="배경 그림을 올려주세요"
          description={`전시 화면의 배경으로 사용할 이미지입니다. 최대 ${MAX_BG}장까지 올릴 수 있어요. (권장: 16:9 가로 이미지)`}
          files={bgFiles}
          maxFiles={MAX_BG}
          onChange={setBgFiles}
          accept="image/*"
        />
      )}

      {step === 'samples' && (
        <ImageUploadStep
          title="샘플 캐릭터 그림을 올려주세요"
          description={`학생 작품이 없을 때 갤러리에서 떠다닐 샘플 이미지입니다. 최대 ${MAX_SAMPLE}장. 배경 없이 캐릭터만 있는 이미지를 권장해요.`}
          files={sampleFiles}
          maxFiles={MAX_SAMPLE}
          onChange={setSampleFiles}
          accept="image/*"
        />
      )}

      {step === 'worksheets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ImageUploadStep
            title="학습지 파일을 올려주세요"
            description={`인쇄해서 학생들이 색칠할 A4 학습지입니다. 최대 ${MAX_WS}장. PNG/JPG 형식의 학습지 이미지를 올려주세요.`}
            files={wsFiles}
            maxFiles={MAX_WS}
            onChange={setWsFiles}
            accept="image/*"
          />
          {error && <p style={{ color: '#c0392b', fontSize: 13, margin: 0 }}>❌ {error}</p>}
        </div>
      )}

      {step === 'saving' && (
        <div style={{ padding: '32px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
          <p style={{ fontSize: 15, color: 'var(--color-text)', fontWeight: 600 }}>주제를 저장하고 있어요...</p>
          <p style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 8 }}>{progress}</p>
        </div>
      )}

      {step !== 'saving' && (
        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
          <button onClick={step === 'info' ? onCancel : handleBack} style={{
            padding: '10px 20px', background: '#f0f4f8', color: 'var(--color-text)',
            border: '1px solid #d0d8e0', borderRadius: 10, cursor: 'pointer', fontSize: 14,
          }}>{step === 'info' ? '취소' : '← 이전'}</button>

          {step !== 'worksheets' ? (
            <button onClick={handleNext} disabled={!canNext()} style={{
              padding: '10px 24px', background: canNext() ? 'var(--color-primary)' : '#c0d0e0', color: '#fff',
              border: 'none', borderRadius: 10, cursor: canNext() ? 'pointer' : 'default',
              fontSize: 14, fontWeight: 700,
            }}>다음 →</button>
          ) : (
            <button onClick={handleCreate} disabled={!canNext()} style={{
              padding: '10px 24px', fontWeight: 700, fontSize: 14,
              background: canNext() ? 'linear-gradient(135deg, #1a8c5d, #27ae60)' : '#c0d0e0',
              color: '#fff', border: 'none', borderRadius: 10,
              cursor: canNext() ? 'pointer' : 'default',
            }}>✅ 주제 만들기</button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── 이미지 업로드 스텝 ───────────────────────────────────────────────────────

function ImageUploadStep({
  title, description, files, maxFiles, onChange, accept,
}: {
  title: string;
  description: string;
  files: File[];
  maxFiles: number;
  onChange: (files: File[]) => void;
  accept: string;
}) {
  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const arr = Array.from(incoming);
    onChange([...files, ...arr].slice(0, maxFiles));
  };

  const remove = (i: number) => {
    onChange(files.filter((_, idx) => idx !== i));
  };

  const previews = useMemo(
    () => files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    })),
    [files],
  );

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h3 style={{ margin: 0, fontSize: 16, color: 'var(--color-text)' }}>{title}</h3>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.6 }}>{description}</p>

      {/* 업로드 드롭존 */}
      <label style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 8, padding: '24px 16px', border: '2px dashed #a0b8d0', borderRadius: 12,
        cursor: files.length >= maxFiles ? 'not-allowed' : 'pointer',
        background: files.length >= maxFiles ? '#f5f5f5' : '#f0f8ff',
        opacity: files.length >= maxFiles ? 0.6 : 1,
      }}>
        <span style={{ fontSize: 28 }}>📁</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary)' }}>
          {files.length >= maxFiles ? `최대 ${maxFiles}장 완료` : `클릭하여 이미지 선택 (${files.length}/${maxFiles})`}
        </span>
        <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>여러 장 동시 선택 가능</span>
        <input
          type="file"
          accept={accept}
          multiple
          disabled={files.length >= maxFiles}
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: 'none' }}
        />
      </label>

      {/* 업로드된 파일 미리보기 */}
      {files.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: 10,
        }}>
          {previews.map(({ file, url }, i) => (
            <div key={`${file.name}-${file.lastModified}-${i}`} style={{ position: 'relative' }}>
              <img
                src={url}
                alt={file.name}
                style={{
                  width: '100%', aspectRatio: '1', objectFit: 'cover',
                  borderRadius: 10, border: '1.5px solid #d0d8e0',
                  display: 'block',
                }}
              />
              <button
                onClick={() => remove(i)}
                style={{
                  position: 'absolute', top: 4, right: 4,
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.55)', color: '#fff',
                  border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >×</button>
              <div style={{
                position: 'absolute', bottom: 4, left: 4,
                background: 'rgba(0,0,0,0.55)', color: '#fff',
                fontSize: 10, padding: '2px 6px', borderRadius: 6, fontWeight: 700,
              }}>{i + 1}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Card 컴포넌트 ────────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--color-surface-solid)', borderRadius: 'var(--radius-card)', padding: '24px 24px 20px',
      boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>{title}</h2>
      {children}
    </div>
  );
}
