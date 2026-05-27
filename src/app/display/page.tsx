import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useGallery } from '../../context/GalleryContext';
import { useCustomThemes } from '../../context/CustomThemeContext';
import ExhibitionStage from '../../components/dokdo/ExhibitionStage';
import SpotlightPanel from '../../components/dokdo/SpotlightPanel';
import WorksheetViewerModal from '../../components/dokdo/WorksheetViewerModal';
import SampleDemoPanel from '../../components/dokdo/SampleDemoPanel';
import SampleWorksheetPreviewModal from '../../components/dokdo/SampleWorksheetPreviewModal';
import type { Artwork, SpeedMode } from '../../types/artwork';
import { SPEED_LABELS, MAX_ARTWORKS } from '../../constants/dokdoTheme';
import { getThemeMeta } from '../../constants/themes';
import { useWorksheetSamples } from '../../lib/image/useProcessedSamples';
import { WORKSHEET_SAMPLE_URLS } from '../../constants/worksheetSamples';
import { resolveBackgroundUrl } from '../../lib/themes/getThemeBackgrounds';
import {
  sendDisplayReady,
  sendScreenshotDone,
  sendScreenshotError,
  sendEmailGalleryDone,
  subscribeDisplayMessages,
} from '../../lib/exhibition/displayChannel';
import {
  captureAndDownloadStage,
  STAGE_DOM_ID,
} from '../../lib/exhibition/captureStage';
import GalleryEmailModal from '../../components/email/GalleryEmailModal';

const WINDOW_HINT_HIDE_DELAY_MS = 3000;
const SPEED_ORDER: SpeedMode[] = ['paused', 'slow', 'normal', 'fast'];

export default function DisplayPage() {
  const { state, dispatch, advanceSpotlight, setTheme, setSpeed, setBackground } = useGallery();
  const {
    artworks, speedMode, spotlightEnabled, currentSpotlightIndex,
    currentTheme, selectedBackgroundId,
  } = state;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewerArtwork, setViewerArtwork] = useState<Artwork | null>(null);
  const [spotlightPanelOpen, setSpotlightPanelOpen] = useState(false);
  const [samplePreview, setSamplePreview] = useState<{ cutoutUrl: string; worksheetUrl: string } | null>(null);
  const [shotMsg, setShotMsg] = useState('');
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [externalEmail, setExternalEmail] = useState<string | undefined>(undefined);
  const [sharePanelOpen, setSharePanelOpen] = useState(false);
  const [shareQrFailed, setShareQrFailed] = useState(false);
  const [invalidThemeId, setInvalidThemeId] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const { customThemes, isLoading: customThemesLoading } = useCustomThemes();

  const themeMeta = getThemeMeta(currentTheme);
  const { samples: processedSamples, isReady: samplesReady } = useWorksheetSamples(WORKSHEET_SAMPLE_URLS);
  const exhibitionBgUrl = resolveBackgroundUrl(themeMeta, selectedBackgroundId);

  const [searchParams] = useSearchParams();
  const isWindowMode = searchParams.get('mode') === 'window';
  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.pathname = '/display';
    url.searchParams.set('theme', currentTheme);
    url.searchParams.delete('mode');
    return url.toString();
  }, [currentTheme]);
  const shareQrUrl = shareUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(shareUrl)}`
    : '';

  useEffect(() => {
    setShareQrFailed(false);
  }, [shareUrl, sharePanelOpen]);

  useEffect(() => {
    const requested = searchParams.get('theme');
    if (!requested) {
      setInvalidThemeId('');
      return;
    }
    const requestedMeta = getThemeMeta(requested);
    if (requestedMeta.id === requested) {
      setInvalidThemeId('');
    } else if (!customThemesLoading) {
      setInvalidThemeId(requested);
    }
    if (requestedMeta.id === requested && requested !== currentTheme) {
      setTheme(requested);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, customThemes, customThemesLoading]);

  const [windowHintVisible, setWindowHintVisible] = useState(isWindowMode);
  useEffect(() => {
    if (!isWindowMode) return;
    let reHide = 0;
    const t = window.setTimeout(() => setWindowHintVisible(false), WINDOW_HINT_HIDE_DELAY_MS);
    const reveal = () => {
      setWindowHintVisible(true);
      window.clearTimeout(t);
      window.clearTimeout(reHide);
      reHide = window.setTimeout(() => setWindowHintVisible(false), WINDOW_HINT_HIDE_DELAY_MS);
    };
    window.addEventListener('mousemove', reveal);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(reHide);
      window.removeEventListener('mousemove', reveal);
    };
  }, [isWindowMode]);

  const handleCaptureStage = useCallback(async (): Promise<{ ok: true; filename: string } | { ok: false; message: string }> => {
    try {
      const filename = await captureAndDownloadStage(STAGE_DOM_ID, currentTheme);
      return { ok: true, filename };
    } catch (err) {
      const message = err instanceof Error ? err.message : '스크린샷 저장에 실패했어요.';
      if (import.meta.env.DEV) console.warn('[screenshot]', err);
      return { ok: false, message };
    }
  }, [currentTheme]);

  useEffect(() => {
    if (!shotMsg) return;
    const t = window.setTimeout(() => setShotMsg(''), 3000);
    return () => window.clearTimeout(t);
  }, [shotMsg]);

  useEffect(() => {
    const unsub = subscribeDisplayMessages((msg) => {
      switch (msg.type) {
        case 'SYNC_STATE':
          if (msg.payload.currentTheme) {
            dispatch({ type: 'SET_THEME', payload: msg.payload.currentTheme });
          }
          dispatch({ type: 'SET_BACKGROUND', payload: msg.payload.selectedBackgroundId ?? null });
          dispatch({ type: 'SET_ARTWORKS', payload: msg.payload.artworks });
          dispatch({ type: 'SET_SPEED', payload: msg.payload.speedMode });
          dispatch({ type: 'SET_SPOTLIGHT', payload: msg.payload.spotlightEnabled });
          break;
        case 'UPDATE_SPEED':
          dispatch({ type: 'SET_SPEED', payload: msg.payload.speedMode });
          break;
        case 'UPDATE_SPOTLIGHT':
          dispatch({ type: 'SET_SPOTLIGHT', payload: msg.payload.spotlightEnabled });
          break;
        case 'UPDATE_BACKGROUND':
          dispatch({ type: 'SET_BACKGROUND', payload: msg.payload.selectedBackgroundId });
          break;
        case 'CLEAR_ALL':
          dispatch({ type: 'SET_ARTWORKS', payload: [] });
          break;
        case 'SCREENSHOT_REQUEST':
          void handleCaptureStage().then((result) => {
            if (result.ok) {
              setShotMsg('우리반 갤러리 이미지를 저장했어요.');
              sendScreenshotDone(result.filename);
            } else {
              setShotMsg(result.message);
              sendScreenshotError(result.message);
            }
          });
          break;
        case 'EMAIL_GALLERY_REQUEST':
          setExternalEmail(msg.email);
          setEmailModalOpen(true);
          break;
        default:
          break;
      }
    });
    sendDisplayReady();
    return unsub;
  }, [dispatch, handleCaptureStage]);

  const onClickScreenshot = useCallback(async () => {
    const result = await handleCaptureStage();
    setShotMsg(result.ok ? '우리반 갤러리 이미지를 저장했어요.' : result.message);
  }, [handleCaptureStage]);

  const handleCopyShareLink = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShotMsg('전시 화면 링크를 복사했어요.');
    } catch {
      setShotMsg('주소를 선택해서 복사해 주세요.');
    }
  }, [shareUrl]);

  const isSampleMode = artworks.length === 0;
  const displayItems = useMemo(
    () =>
      isSampleMode
        ? processedSamples.map((s) => ({ id: s.id, imageUrl: s.cutoutUrl }))
        : artworks.slice(0, MAX_ARTWORKS).map((a) => ({ id: a.id, imageUrl: a.cutoutUrl })),
    [artworks, isSampleMode, processedSamples],
  );

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      try {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } catch {
        // Browser fullscreen requires a direct user gesture.
      }
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, button, a')) return;

      if (event.key.toLowerCase() === 'f' || event.key === 'Enter') {
        event.preventDefault();
        void toggleFullscreen();
      } else if (event.key === ' ') {
        event.preventDefault();
        setSpeed(speedMode === 'paused' ? 'normal' : 'paused');
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        const currentIndex = SPEED_ORDER.indexOf(speedMode);
        const direction = event.key === 'ArrowUp' ? 1 : -1;
        const nextIndex = Math.max(0, Math.min(SPEED_ORDER.length - 1, currentIndex + direction));
        setSpeed(SPEED_ORDER[nextIndex]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setSpeed, speedMode, toggleFullscreen]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw', height: '100vh',
        background: '#0a3d5e',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', position: 'relative',
      }}
    >
      <div
        id={STAGE_DOM_ID}
        style={{
          position: 'relative',
          width: 'min(100vw, calc(100vh * 16 / 9))',
          height: 'min(100vh, calc(100vw * 9 / 16))',
          maxWidth: 1920,
          overflow: 'hidden',
        }}
      >
        <ExhibitionStage
          items={displayItems}
          speedMode={speedMode}
          backgroundUrl={exhibitionBgUrl}
          emptyTitle={isSampleMode && !samplesReady ? '샘플을 준비하고 있어요' : undefined}
          emptyHint={isSampleMode && !samplesReady ? '잠시만 기다려주세요 · 처음 1~2초 정도 걸려요' : undefined}
          onSpriteClick={(id) => {
            if (isSampleMode) {
              // 시연 모드: 클릭한 캐릭터의 원본 학습지 사진을 모달로 보여준다.
              const sample = processedSamples.find((s) => s.id === id);
              if (sample) {
                setSamplePreview({ cutoutUrl: sample.cutoutUrl, worksheetUrl: sample.originalUrl });
              }
            } else {
              const found = artworks.find((a) => a.id === id);
              if (found) setViewerArtwork(found);
            }
          }}
        />

        <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
          <span className="badge" style={{ fontSize: 13 }}>
            {themeMeta.exhibitionBadge ?? `${themeMeta.emoji} ${themeMeta.name} 전시관`}
          </span>
        </div>

        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', gap: 8 }}>
          {isSampleMode && (
            <span className="badge" style={{ fontSize: 12, background: 'rgba(255,220,100,0.9)', color: '#7a5200' }}>
              샘플
            </span>
          )}
          <span className="badge" style={{ fontSize: 12 }}>
            {speedMode === 'paused' ? '멈춤' : `캐릭터 이동 · ${SPEED_LABELS[speedMode]}`}
          </span>
        </div>

        {!isSampleMode && spotlightPanelOpen && (
          <SpotlightPanel
            artworks={artworks}
            currentIndex={currentSpotlightIndex}
            onAdvance={advanceSpotlight}
            enabled={spotlightEnabled}
            onOpenViewer={(a) => setViewerArtwork(a)}
            onClose={() => setSpotlightPanelOpen(false)}
          />
        )}

        {/* 시연 모드 인터랙티브 컨트롤 (속도/배경 변경 + 캐릭터 클릭 힌트).
            실제 학생 작품이 업로드되면 isSampleMode=false 가 되어 자동으로 사라진다. */}
        {isSampleMode && !isWindowMode && (
          <SampleDemoPanel
            speedMode={speedMode}
            onSpeedChange={setSpeed}
            backgrounds={themeMeta.backgrounds ?? []}
            selectedBackgroundId={selectedBackgroundId}
            defaultBackgroundId={themeMeta.defaultBackgroundId ?? null}
            onBackgroundChange={setBackground}
          />
        )}
      </div>

      {isWindowMode ? (
        <div
          data-screenshot-ignore="true"
          style={{
            position: 'fixed', top: 14, right: 14, zIndex: 60,
            display: 'flex', gap: 6,
            opacity: windowHintVisible ? 1 : 0,
            transition: 'opacity 0.4s ease',
            pointerEvents: windowHintVisible ? 'auto' : 'none',
          }}
        >
          <button
            onClick={onClickScreenshot}
            className="btn btn-sm"
            data-screenshot-ignore="true"
            title="현재 전시 화면을 PNG로 저장합니다"
            style={{
              background: 'rgba(10,30,50,0.5)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
            }}
          >
            저장
          </button>
          <button
            onClick={() => { setExternalEmail(undefined); setEmailModalOpen(true); }}
            className="btn btn-sm"
            data-screenshot-ignore="true"
            title="갤러리 이미지를 캡처해서 메일로 보내요"
            style={{
              background: 'rgba(47,128,216,0.5)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
            }}
          >
            메일
          </button>
          <button
            onClick={() => setSharePanelOpen(true)}
            className="btn btn-sm"
            data-screenshot-ignore="true"
            title="학생 기기에서 볼 수 있는 전시 링크와 QR코드를 보여줍니다"
            style={{
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
            }}
          >
            공유
          </button>
          <button
            onClick={toggleFullscreen}
            className="btn btn-sm"
            data-screenshot-ignore="true"
            title="전체화면 전환"
            style={{
              background: 'rgba(10,30,50,0.5)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {isFullscreen ? '전체화면 종료' : '전체화면'}
          </button>
        </div>
      ) : (
        <div
          data-screenshot-ignore="true"
          style={{
            position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
            zIndex: 50, display: 'flex', gap: 10, flexWrap: 'wrap',
            justifyContent: 'center',
            background: 'rgba(10,30,50,0.6)',
            backdropFilter: 'blur(12px)',
            padding: '10px 16px', borderRadius: 40,
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <Link
            to="/control"
            className="btn btn-ghost btn-sm"
            data-screenshot-ignore="true"
            style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', background: 'transparent' }}
          >
            제어판
          </Link>
          <span style={{
            fontSize: 13, color: 'rgba(255,255,255,0.78)',
            display: 'flex', alignItems: 'center', padding: '0 4px',
          }}>
            {isSampleMode ? '샘플 재생 중' : `${displayItems.length}개 작품`}
          </span>
          {!isSampleMode && (
            <button
              onClick={() => setSpotlightPanelOpen((v) => !v)}
              className="btn btn-sm"
              data-screenshot-ignore="true"
              title="학습지 확대 감상 패널 열기 또는 닫기"
              style={{
                background: spotlightPanelOpen ? 'rgba(47,128,216,0.6)' : 'rgba(255,255,255,0.15)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              {spotlightPanelOpen ? '확대 닫기' : '확대 감상'}
            </button>
          )}
          <button
            onClick={onClickScreenshot}
            className="btn btn-sm"
            data-screenshot-ignore="true"
            title="현재 전시 화면을 PNG로 저장합니다"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            갤러리 저장
          </button>
          <button
            onClick={() => { setExternalEmail(undefined); setEmailModalOpen(true); }}
            className="btn btn-sm"
            data-screenshot-ignore="true"
            title="갤러리 이미지를 캡처해서 메일로 보내요"
            style={{ background: 'rgba(47,128,216,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            메일로 보내기
          </button>
          <button
            onClick={toggleFullscreen}
            className="btn btn-sm"
            data-screenshot-ignore="true"
            title="전체화면 전환"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            {isFullscreen ? '전체화면 종료' : '전체화면'}
          </button>
        </div>
      )}

      {!isWindowMode && (
        <button
          type="button"
          onClick={() => setSharePanelOpen(true)}
          className="btn btn-sm"
          data-screenshot-ignore="true"
          title="학생 기기에서 볼 수 있는 전시 링크와 QR코드를 보여줍니다"
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 50,
            background: 'rgba(10,30,50,0.6)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(12px)',
          }}
        >
          공유
        </button>
      )}

      {sharePanelOpen && (
        <div
          className="dialog-backdrop"
          data-screenshot-ignore="true"
          role="presentation"
          onClick={() => setSharePanelOpen(false)}
        >
          <div
            className="dialog-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-gallery-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="share-gallery-title">전시 화면 QR 공유</h2>
            <p>
              현재 배포 URL을 기준으로 QR코드를 만듭니다. 학생이나 학부모가 개인 기기에서 전시 화면을 열 수 있고, QR이 보이지 않으면 링크 복사를 사용하세요.
            </p>
            {shareQrUrl && !shareQrFailed && (
              <img
                src={shareQrUrl}
                alt="전시 화면 공유 QR 코드"
                onError={() => setShareQrFailed(true)}
                style={{
                  width: 180,
                  height: 180,
                  alignSelf: 'center',
                  borderRadius: 12,
                  border: '1px solid var(--color-border)',
                  background: '#fff',
                  padding: 8,
                }}
              />
            )}
            {shareQrFailed && (
              <p style={{ fontSize: 12, color: 'var(--color-muted)', textAlign: 'center', margin: 0 }}>
                네트워크 제한으로 QR 이미지를 불러오지 못했어요. 아래 링크를 복사해서 공유하면 됩니다.
              </p>
            )}
            <input
              type="text"
              value={shareUrl}
              readOnly
              aria-label="전시 화면 공유 링크"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                background: 'var(--color-bg)',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.currentTarget.select()}
            />
            <div className="dialog-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setSharePanelOpen(false)}>
                닫기
              </button>
              <button type="button" className="btn btn-primary" onClick={handleCopyShareLink}>
                링크 복사
              </button>
            </div>
          </div>
        </div>
      )}

      {invalidThemeId && (
        <div
          className="dialog-backdrop"
          data-screenshot-ignore="true"
          role="presentation"
          onClick={() => setInvalidThemeId('')}
        >
          <div
            className="dialog-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="display-invalid-theme-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="display-invalid-theme-title">주제를 찾을 수 없습니다</h2>
            <p>
              요청한 주제({invalidThemeId})가 현재 등록된 주제팩과 일치하지 않아요.
            </p>
            <div className="dialog-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setInvalidThemeId('')}>
                닫기
              </button>
              <Link to="/packs" className="btn btn-primary">
                주제 선택으로 이동
              </Link>
            </div>
          </div>
        </div>
      )}

      {shotMsg && (
        <div
          data-screenshot-ignore="true"
          style={{
            position: 'fixed', bottom: isWindowMode ? 24 : 80, left: '50%',
            transform: 'translateX(-50%)', zIndex: 70,
            padding: '10px 18px', borderRadius: 30,
            background: 'rgba(15,40,65,0.86)', color: '#fff',
            fontSize: 13, fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          {shotMsg}
        </div>
      )}

      {isSampleMode && !isWindowMode && (
        <div
          data-screenshot-ignore="true"
          style={{
            position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
            zIndex: 50, background: 'rgba(255,220,100,0.9)', color: '#7a5200',
            padding: '8px 20px', borderRadius: 40, fontSize: 13, fontWeight: 600,
          }}
        >
          예시 작품을 보여드리고 있어요. 선생님이 학습지를 올리면 실제 작품이 나와요.
        </div>
      )}

      <WorksheetViewerModal
        artwork={viewerArtwork}
        onClose={() => setViewerArtwork(null)}
      />

      <SampleWorksheetPreviewModal
        open={samplePreview !== null}
        cutoutUrl={samplePreview?.cutoutUrl ?? null}
        worksheetUrl={samplePreview?.worksheetUrl ?? null}
        onClose={() => setSamplePreview(null)}
      />

      <GalleryEmailModal
        open={emailModalOpen}
        onClose={() => { setEmailModalOpen(false); setExternalEmail(undefined); sendEmailGalleryDone(); }}
        themeId={currentTheme}
        externalEmail={externalEmail}
      />
    </div>
  );
}
