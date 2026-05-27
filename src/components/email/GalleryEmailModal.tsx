import { useCallback, useEffect, useRef, useState } from 'react';
import { captureElementAsPng, downloadPng, getScreenshotFileName, STAGE_DOM_ID } from '../../lib/exhibition/captureStage';

const EMAIL_STORAGE_KEY = 'classgallery-teacher-email';

type Phase = 'idle' | 'capturing' | 'ready' | 'opening' | 'done' | 'error';

interface Props {
  open: boolean;
  onClose: () => void;
  themeId: string;
  /** 외부(BroadcastChannel)에서 이메일 주소를 넘겨줄 때 사용 */
  externalEmail?: string;
}

export default function GalleryEmailModal({ open, onClose, themeId, externalEmail }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [email, setEmail] = useState(() => localStorage.getItem(EMAIL_STORAGE_KEY) ?? '');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [mailWindowBlocked, setMailWindowBlocked] = useState(false);
  const blobRef = useRef<Blob | null>(null);
  const filenameRef = useRef('');

  // 외부에서 이메일 전달받으면 자동 세팅
  useEffect(() => {
    if (externalEmail) setEmail(externalEmail);
  }, [externalEmail]);

  // 모달이 열리면 즉시 캡처 시작
  useEffect(() => {
    if (!open) {
      // 닫힐 때 정리
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      blobRef.current = null;
      setPhase('idle');
      setErrorMsg('');
      setMailWindowBlocked(false);
      return;
    }

    let cancelled = false;
    setPhase('capturing');
    setErrorMsg('');

    (async () => {
      try {
        const el = document.getElementById(STAGE_DOM_ID);
        if (!el) throw new Error('전시 화면을 찾을 수 없어요. 전시 화면이 열려 있는지 확인해주세요.');
        const blob = await captureElementAsPng(el as HTMLElement);
        if (cancelled) return;
        blobRef.current = blob;
        filenameRef.current = getScreenshotFileName(themeId);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setPhase('ready');
      } catch (err) {
        if (cancelled) return;
        setErrorMsg(err instanceof Error ? err.message : '갤러리 캡처에 실패했어요.');
        setPhase('error');
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSend = useCallback(() => {
    if (!blobRef.current || !email.trim()) return;

    const trimmedEmail = email.trim();
    localStorage.setItem(EMAIL_STORAGE_KEY, trimmedEmail);
    setMailWindowBlocked(false);

    setPhase('opening');

    // 1) PNG 다운로드
    downloadPng(blobRef.current, filenameRef.current);

    // 2) Gmail 작성창 열기 (Gmail 외 사용자를 위해 mailto 병행)
    const subject = encodeURIComponent('우리반 갤러리 이미지');
    const body = encodeURIComponent(
      `안녕하세요,\n\n첨부된 우리반 갤러리 이미지(${filenameRef.current})를 확인해주세요.\n\nCLASS GALLERY에서 보냈어요.`
    );

    // Gmail 웹 작성창 (Gmail 사용자)
    const isGmail = trimmedEmail.endsWith('@gmail.com');
    const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(trimmedEmail)}&su=${subject}&body=${body}`;
    const mailtoUrl = `mailto:${encodeURIComponent(trimmedEmail)}?subject=${subject}&body=${body}`;

    const opened = window.open(isGmail ? gmailUrl : mailtoUrl, '_blank', 'noopener,noreferrer');
    if (!opened) setMailWindowBlocked(true);

    setPhase('done');
  }, [email]);

  if (!open) return null;

  const canSend = phase === 'ready' && email.trim().length > 0;

  return (
    <div
      role="dialog"
      aria-label="갤러리 메일로 보내기"
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(8, 24, 40, 0.82)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: 'min(480px, calc(100vw - 32px))',
        background: '#0c1d2e',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* 헤더 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>📧</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
              우리반 갤러리 메일로 보내기
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            style={{
              width: 32, height: 32, borderRadius: 99,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.06)',
              color: '#fff', fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>

        {/* 미리보기 */}
        <div style={{
          background: '#000',
          height: 180,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          {phase === 'capturing' && (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
              <p style={{ fontSize: 13 }}>갤러리 이미지를 캡처하고 있어요...</p>
            </div>
          )}
          {previewUrl && (
            <img
              src={previewUrl}
              alt="갤러리 미리보기"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          )}
          {phase === 'error' && (
            <div style={{ textAlign: 'center', color: '#fca5a5', padding: 24 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>⚠️</div>
              <p style={{ fontSize: 13, lineHeight: 1.5 }}>{errorMsg}</p>
            </div>
          )}
        </div>

        {/* 이메일 입력 + 버튼 */}
        <div style={{ padding: '20px' }}>

          {phase !== 'error' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 700,
                color: 'rgba(255,255,255,0.6)', marginBottom: 8,
                letterSpacing: '0.04em',
              }}>
                받는 사람 이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@gmail.com"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff', fontSize: 14,
                  outline: 'none',
                }}
              />
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>
                입력한 주소는 이 기기에만 저장돼요
              </p>
            </div>
          )}

          {/* 상태별 안내 메시지 */}
          {phase === 'done' && (
            <div style={{
              padding: '12px 14px', borderRadius: 10, marginBottom: 14,
              background: 'rgba(80,200,140,0.12)',
              border: '1px solid rgba(80,200,140,0.3)',
              fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6,
            }}>
              <strong style={{ color: '#50c88c' }}>✅ 이미지를 저장했어요!</strong><br />
              {mailWindowBlocked
                ? '메일 창이 차단되었어요. 다운로드 폴더에서 저장된 이미지를 찾아 직접 첨부해주세요.'
                : '메일 창이 열렸어요. 방금 저장된 이미지 파일을 첨부하면 돼요.'}
              <br />
              <code style={{ fontSize: 11 }}>{filenameRef.current}</code>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            {phase !== 'done' && (
              <button
                onClick={handleSend}
                disabled={!canSend}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: 12,
                  background: canSend ? 'rgba(47,128,216,0.9)' : 'rgba(255,255,255,0.08)',
                  color: '#fff', fontWeight: 700, fontSize: 14,
                  border: 'none', cursor: canSend ? 'pointer' : 'not-allowed',
                  opacity: canSend ? 1 : 0.5,
                  transition: 'background 0.2s',
                }}
              >
                {phase === 'capturing' ? '⏳ 캡처 중...' :
                 phase === 'opening' ? '🔄 메일 열기 중...' :
                 phase === 'error' ? '❌ 캡처 실패' :
                 '📧 이미지 저장 & 메일 열기'}
              </button>
            )}
            {phase === 'done' && (
              <button
                onClick={onClose}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: 12,
                  background: 'rgba(80,200,140,0.9)',
                  color: '#fff', fontWeight: 700, fontSize: 14,
                  border: 'none', cursor: 'pointer',
                }}
              >
                ✅ 완료
              </button>
            )}
          </div>

          {phase !== 'done' && phase !== 'error' && (
            <p style={{
              marginTop: 10, fontSize: 11, lineHeight: 1.6,
              color: 'rgba(255,255,255,0.35)', textAlign: 'center',
            }}>
              이미지를 다운로드한 후 열리는 메일창에 첨부해서 보내주세요
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
