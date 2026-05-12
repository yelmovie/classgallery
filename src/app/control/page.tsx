import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useGallery } from '../../context/GalleryContext';
import { extractWorksheetData } from '../../lib/image/extractCharacterCutout';
import type { Artwork, SpeedMode } from '../../types/artwork';
import type { ThemeId } from '../../types/theme';
import { SPEED_LABELS, MAX_ARTWORKS } from '../../constants/dokdoTheme';
import { THEMES_BY_ID, getThemeMeta } from '../../constants/themes';
import {
  sendSyncState,
  sendSpeedUpdate,
  sendSpotlightUpdate,
  sendBackgroundUpdate,
  sendScreenshotRequest,
  subscribeDisplayMessages,
} from '../../lib/exhibition/displayChannel';
import BackgroundPicker from '../../components/dokdo/BackgroundPicker';
import { getDefaultBackground } from '../../lib/themes/getThemeBackgrounds';
import {
  openDisplayWindow,
  isDisplayWindowOpen,
  type OpenDisplayResult,
} from '../../lib/exhibition/displayWindow';

const SPEED_ORDER: SpeedMode[] = ['paused', 'slow', 'normal', 'fast'];

export default function ControlPage() {
  const {
    state, addArtworks, removeArtwork, clearAll,
    setSpeed, setSpotlight, setTheme, setBackground,
  } = useGallery();
  const { artworks, speedMode, spotlightEnabled, currentTheme, selectedBackgroundId } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processingCount, setProcessingCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [windowMsg, setWindowMsg] = useState<{ kind: 'ok' | 'blocked'; text: string } | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ?theme= 쿼리로 테마 전환
  useEffect(() => {
    const requested = searchParams.get('theme');
    if (requested && requested in THEMES_BY_ID && requested !== currentTheme) {
      setTheme(requested as ThemeId);
    }
    // currentTheme 의존성 제외: 사용자가 직접 setTheme 한 경우 URL 을 다시 따라가지 않게.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const themeMeta = getThemeMeta(currentTheme);

  // 새로 열린 전시 창이 READY 를 보내면 현재 전체 상태를 다시 보내준다.
  // 늦게 열린 창도 즉시 동기화된다.
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // 스크린샷 결과 안내용 토스트
  const [shotMsg, setShotMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  useEffect(() => {
    if (!shotMsg) return;
    const t = window.setTimeout(() => setShotMsg(null), 3000);
    return () => window.clearTimeout(t);
  }, [shotMsg]);

  useEffect(() => {
    const unsub = subscribeDisplayMessages((msg) => {
      if (msg.type === 'DISPLAY_READY') {
        const s = stateRef.current;
        sendSyncState({
          currentTheme: s.currentTheme,
          selectedBackgroundId: s.selectedBackgroundId,
          artworks: s.artworks,
          speedMode: s.speedMode,
          spotlightEnabled: s.spotlightEnabled,
        });
      } else if (msg.type === 'SCREENSHOT_DONE') {
        setShotMsg({ kind: 'ok', text: '우리반 갤러리 이미지를 저장했어요.' });
      } else if (msg.type === 'SCREENSHOT_ERROR') {
        setShotMsg({ kind: 'err', text: msg.message || '스크린샷 저장에 실패했어요.' });
      }
    });
    return unsub;
  }, []);

  const handleSaveGallery = () => {
    if (!isDisplayWindowOpen()) {
      setShotMsg({
        kind: 'err',
        text: '전시 화면을 먼저 열어주세요. "전시 화면 새 창 열기" 버튼을 누르시면 돼요.',
      });
      return;
    }
    sendScreenshotRequest();
    setShotMsg({ kind: 'ok', text: '전시 화면에서 저장하고 있어요... 잠시만요.' });
  };

  // artworks/테마/배경 이 바뀔 때마다 전시 창으로 새 상태 push (SYNC_STATE)
  useEffect(() => {
    sendSyncState({
      currentTheme, selectedBackgroundId,
      artworks, speedMode, spotlightEnabled,
    });
  }, [currentTheme, selectedBackgroundId, artworks, speedMode, spotlightEnabled]);

  // 속도/확대 감상/배경은 lightweight 메시지로도 한 번 더 push (스펙 호환)
  useEffect(() => { sendSpeedUpdate(speedMode); }, [speedMode]);
  useEffect(() => { sendSpotlightUpdate(spotlightEnabled); }, [spotlightEnabled]);
  useEffect(() => { sendBackgroundUpdate(selectedBackgroundId); }, [selectedBackgroundId]);

  const themeBackgrounds = themeMeta.backgrounds ?? [];
  const defaultBg = getDefaultBackground(themeMeta);
  const handleSelectBackground = (id: string) => setBackground(id);

  const handleOpenDisplay = () => {
    const result: OpenDisplayResult = openDisplayWindow(currentTheme);
    if (result === 'blocked') {
      setWindowMsg({
        kind: 'blocked',
        text: '새 창이 열리지 않았어요. 주소창 옆 팝업 차단 알림을 확인하고 팝업을 허용해주세요.',
      });
    } else if (result === 'focused') {
      setWindowMsg({ kind: 'ok', text: '이미 열려 있는 전시 창을 앞으로 가져왔어요.' });
    } else {
      setWindowMsg({ kind: 'ok', text: '오른쪽 모니터나 TV 화면으로 옮겨서 사용하세요.' });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    e.target.value = '';
    setErrorMsg('');

    const remaining = MAX_ARTWORKS - artworks.length;
    if (remaining <= 0) {
      setErrorMsg(`최대 ${MAX_ARTWORKS}개까지 전시할 수 있어요.`);
      return;
    }

    const toProcess = files.slice(0, remaining);
    setProcessingCount((c) => c + toProcess.length);

    const newArtworks: Artwork[] = [];
    for (const file of toProcess) {
      try {
        const previewUrl = URL.createObjectURL(file);
        const { cutoutUrl, originalImageUrl } = await extractWorksheetData(file, themeMeta.cropArea);
        newArtworks.push({
          id: crypto.randomUUID(),
          originalFileName: file.name,
          originalPreviewUrl: previewUrl,
          originalImageUrl,
          cutoutUrl,
          createdAt: Date.now(),
        });
      } catch (err) {
        console.error('이미지 처리 오류:', err);
        setErrorMsg('일부 이미지를 처리할 수 없었어요. 다시 시도해보세요.');
      } finally {
        setProcessingCount((c) => c - 1);
      }
    }

    if (newArtworks.length > 0) addArtworks(newArtworks);

    if (files.length > remaining) {
      setErrorMsg(`최대 ${MAX_ARTWORKS}개까지만 전시할 수 있어요. ${files.length - remaining}개는 추가되지 않았어요.`);
    }
  };

  const handleClearAll = () => {
    if (artworks.length === 0) return;
    if (!confirm(`업로드한 학습지 ${artworks.length}개를 모두 삭제할까요?`)) return;
    clearAll();
    setErrorMsg('');
  };

  const isProcessing = processingCount > 0;

  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        padding: '14px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/" className="btn btn-ghost btn-sm">← 홈</Link>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text)' }}>
            {themeMeta.controlTitle ?? `${themeMeta.emoji} ${themeMeta.name} 전시 준비`}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {artworks.length > 0 && <span className="badge">{artworks.length}개 준비됨</span>}
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/display')}
            disabled={artworks.length === 0}
          >
            전시 시작 →
          </button>
        </div>
      </nav>

      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '260px 1fr 300px',
        gap: 0,
        maxHeight: 'calc(100vh - 57px)',
      }}>
        {/* ── 왼쪽: 설정 ── */}
        <aside style={{
          borderRight: '1px solid var(--color-border)',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          overflowY: 'auto',
          background: 'rgba(255,255,255,0.5)',
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 800 }}>전시 준비</h2>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: 8 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing || artworks.length >= MAX_ARTWORKS}
            >
              {isProcessing ? (
                <><span className="spinner" />처리 중 ({processingCount}개)</>
              ) : '+ 작품 추가하기'}
            </button>
            <p style={{ fontSize: 12, color: 'var(--color-muted)', textAlign: 'center' }}>
              학습지 사진 여러 장 가능 · 최대 {MAX_ARTWORKS}개
            </p>
            {artworks.length >= MAX_ARTWORKS && (
              <p style={{ fontSize: 12, color: '#2db87e', textAlign: 'center', marginTop: 4 }}>
                최대 {MAX_ARTWORKS}개 준비 완료 🎉
              </p>
            )}
          </div>

          {errorMsg && (
            <div style={{
              padding: '10px 14px',
              background: '#fff4f4',
              border: '1px solid #fca5a5',
              borderRadius: 10,
              fontSize: 12,
              color: '#b91c1c',
              lineHeight: 1.5,
            }}>
              {errorMsg}
            </div>
          )}

          <div className="divider" />

          <div>
            <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 8 }}>
              움직임 빠르기
            </label>
            <div
              role="radiogroup"
              aria-label="움직임 빠르기"
              style={{
                display: 'flex',
                gap: 4,
                padding: 4,
                borderRadius: 12,
                background: 'var(--color-primary-light)',
                border: '1px solid var(--color-border)',
                flexWrap: 'wrap',
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
                    aria-pressed={active}
                    aria-label={`움직임 빠르기 ${SPEED_LABELS[mode]}`}
                    onClick={() => setSpeed(mode)}
                    style={{
                      flex: '1 1 0',
                      minWidth: 56,
                      padding: '7px 8px',
                      borderRadius: 8,
                      border: 'none',
                      background: active ? 'var(--color-primary)' : 'transparent',
                      color: active ? '#fff' : 'var(--color-text)',
                      fontWeight: active ? 700 : 600,
                      fontSize: 12.5,
                      cursor: 'pointer',
                      transition: 'background 0.15s, color 0.15s',
                      whiteSpace: 'nowrap',
                      boxShadow: active ? '0 2px 4px rgba(31,95,145,0.18)' : 'none',
                    }}
                  >
                    {SPEED_LABELS[mode]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="divider" />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700 }}>확대 감상</label>
              <button
                onClick={() => setSpotlight(!spotlightEnabled)}
                style={{
                  width: 44, height: 24, borderRadius: 12, border: 'none',
                  background: spotlightEnabled ? 'var(--color-primary)' : '#c4cdd6',
                  position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
                }}
                aria-label={spotlightEnabled ? '확대 감상 끄기' : '확대 감상 켜기'}
              >
                <span style={{
                  position: 'absolute',
                  top: 2, left: spotlightEnabled ? 22 : 2,
                  width: 20, height: 20,
                  borderRadius: '50%',
                  background: '#fff',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  transition: 'left 0.2s',
                }} />
              </button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--color-muted)', lineHeight: 1.5 }}>
              {spotlightEnabled ? '✅ 한 작품씩 크게 보여줘요' : '한 작품씩 크게 보여줘요'}
            </p>
          </div>

          {themeBackgrounds.length > 0 && (
            <>
              <div className="divider" />
              <BackgroundPicker
                backgrounds={themeBackgrounds}
                selectedId={selectedBackgroundId}
                defaultId={defaultBg?.id ?? null}
                onSelect={handleSelectBackground}
              />
            </>
          )}

          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/display')}
              disabled={artworks.length === 0}
            >
              🎬 전시 시작
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleOpenDisplay}
              title="새 창으로 전시 화면을 열고 오른쪽 모니터나 TV로 옮길 수 있어요"
            >
              🪟 전시 화면 새 창 열기
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleSaveGallery}
              title="현재 전시 화면을 PNG로 저장해요"
            >
              📸 우리반 갤러리 저장
            </button>
            {shotMsg && (
              <p style={{
                fontSize: 11.5,
                lineHeight: 1.45,
                padding: '8px 10px',
                borderRadius: 8,
                color: shotMsg.kind === 'err' ? '#b91c1c' : 'var(--color-primary-dark)',
                background: shotMsg.kind === 'err' ? '#fff4f4' : 'var(--color-primary-light)',
                border: `1px solid ${shotMsg.kind === 'err' ? '#fca5a5' : 'transparent'}`,
              }}>
                {shotMsg.text}
              </p>
            )}
            {windowMsg && (
              <p style={{
                fontSize: 11.5,
                lineHeight: 1.45,
                padding: '8px 10px',
                borderRadius: 8,
                color: windowMsg.kind === 'blocked' ? '#b91c1c' : 'var(--color-muted)',
                background: windowMsg.kind === 'blocked' ? '#fff4f4' : 'var(--color-primary-light)',
                border: `1px solid ${windowMsg.kind === 'blocked' ? '#fca5a5' : 'transparent'}`,
              }}>
                {windowMsg.text}
              </p>
            )}
            <button
              className="btn btn-danger"
              onClick={handleClearAll}
              disabled={artworks.length === 0}
            >
              🗑 전체 삭제
            </button>
          </div>
        </aside>

        {/* ── 중앙: 학습지 목록 ── */}
        <section style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>올린 학습지</h2>
            <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>
              전체 사진을 올려도 됩니다. 캐릭터 부분만 자동으로 추려낼게요.
            </p>
          </div>

          {isProcessing && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px',
              background: 'var(--color-primary-light)',
              borderRadius: 12,
              fontSize: 13, color: 'var(--color-primary-dark)',
            }}>
              <span className="spinner" />
              학습지에서 색칠한 부분을 추출하고 있어요... ({processingCount}개 남음)
            </div>
          )}

          {artworks.length === 0 && !isProcessing ? (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 16, color: 'var(--color-muted)', minHeight: 300,
            }}>
              <span style={{ fontSize: 56 }}>📄</span>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 600, marginBottom: 6 }}>아직 올린 학습지가 없어요</p>
                <p style={{ fontSize: 13 }}>왼쪽의 '작품 추가하기' 버튼을 눌러주세요</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
              {artworks.map((artwork, i) => (
                <div
                  key={artwork.id}
                  className="fade-in"
                  style={{
                    background: 'var(--color-surface-solid)',
                    borderRadius: 14,
                    overflow: 'hidden',
                    border: '1.5px solid var(--color-border)',
                    boxShadow: '0 2px 8px rgba(31,95,145,0.08)',
                    position: 'relative',
                  }}
                >
                  <div style={{ position: 'relative', aspectRatio: '3/4', background: '#f0f4f8' }}>
                    <img
                      src={artwork.originalPreviewUrl}
                      alt={`학습지 ${i + 1}`}
                      onError={(e) => { (e.target as HTMLImageElement).src = artwork.cutoutUrl; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      onClick={() => removeArtwork(artwork.id)}
                      style={{
                        position: 'absolute', top: 6, right: 6,
                        width: 26, height: 26, borderRadius: '50%',
                        border: 'none', background: 'rgba(224,82,82,0.88)',
                        color: '#fff', fontSize: 14,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                      title="삭제"
                    >×</button>
                  </div>
                  <div style={{ padding: '6px 10px', fontSize: 11, color: 'var(--color-muted)' }}>
                    {new Date(artwork.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── 오른쪽: 캐릭터 미리보기 ── */}
        <aside style={{
          borderLeft: '1px solid var(--color-border)',
          padding: '24px 20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          background: 'rgba(255,255,255,0.5)',
        }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>화면에 보일 캐릭터</h2>
            <p style={{ fontSize: 12, color: 'var(--color-muted)' }}>색은 진하게, 바깥만 제거</p>
          </div>

          {artworks.length === 0 ? (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 10, color: 'var(--color-muted)', minHeight: 200,
            }}>
              <span style={{ fontSize: 36 }}>🎨</span>
              <p style={{ fontSize: 12, textAlign: 'center' }}>학습지를 올리면 여기에 캐릭터가 나와요</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {artworks.map((artwork, i) => (
                <div
                  key={artwork.id}
                  className="fade-in"
                  style={{
                    aspectRatio: '1',
                    borderRadius: 12,
                    overflow: 'hidden',
                    background: 'repeating-conic-gradient(#e0e8f0 0% 25%, #f4f8fb 0% 50%) 0 0 / 12px 12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1.5px solid var(--color-border)',
                  }}
                >
                  <img
                    src={artwork.cutoutUrl}
                    alt={`캐릭터 ${i + 1}`}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    style={{
                      maxWidth: '85%', maxHeight: '85%',
                      objectFit: 'contain', opacity: 1,
                      filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.12))',
                    }}
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
