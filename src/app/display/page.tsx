import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useGallery } from '../../context/GalleryContext';
import ExhibitionStage from '../../components/dokdo/ExhibitionStage';
import SpotlightPanel from '../../components/dokdo/SpotlightPanel';
import WorksheetViewerModal from '../../components/dokdo/WorksheetViewerModal';
import type { Artwork } from '../../types/artwork';
import { SPEED_LABELS, MAX_ARTWORKS } from '../../constants/dokdoTheme';
import { THEMES_BY_ID, getThemeMeta } from '../../constants/themes';
import type { ThemeId } from '../../types/theme';
import { useProcessedSamples } from '../../lib/image/useProcessedSamples';
import { resolveBackgroundUrl } from '../../lib/themes/getThemeBackgrounds';
import {
  sendDisplayReady,
  sendScreenshotDone,
  sendScreenshotError,
  subscribeDisplayMessages,
} from '../../lib/exhibition/displayChannel';
import {
  captureAndDownloadStage,
  STAGE_DOM_ID,
} from '../../lib/exhibition/captureStage';

const WINDOW_HINT_HIDE_DELAY_MS = 3000;

export default function DisplayPage() {
  const { state, dispatch, advanceSpotlight, setTheme } = useGallery();
  const {
    artworks, speedMode, spotlightEnabled, currentSpotlightIndex,
    currentTheme, selectedBackgroundId,
  } = state;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewerArtwork, setViewerArtwork] = useState<Artwork | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const themeMeta = getThemeMeta(currentTheme);
  const sampleUrls = themeMeta.sampleUrls ?? [];
  const { samples: processedSamples, isReady: samplesReady } = useProcessedSamples(sampleUrls);
  const exhibitionBgUrl = resolveBackgroundUrl(themeMeta, selectedBackgroundId);

  const [searchParams] = useSearchParams();
  const isWindowMode = searchParams.get('mode') === 'window';

  // ?theme= 쿼리로 테마 전환 (새 창에서 처음 로드 시)
  useEffect(() => {
    const requested = searchParams.get('theme');
    if (requested && requested in THEMES_BY_ID && requested !== currentTheme) {
      setTheme(requested as ThemeId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // 윈도우 모드에서 우측 상단 안내/풀스크린 버튼을 처음 몇 초만 보여준다.
  const [windowHintVisible, setWindowHintVisible] = useState(isWindowMode);
  useEffect(() => {
    if (!isWindowMode) return;
    const t = window.setTimeout(() => setWindowHintVisible(false), WINDOW_HINT_HIDE_DELAY_MS);
    const reveal = () => {
      setWindowHintVisible(true);
      window.clearTimeout(t);
      window.clearTimeout(reHide);
      reHide = window.setTimeout(() => setWindowHintVisible(false), WINDOW_HINT_HIDE_DELAY_MS);
    };
    let reHide = 0;
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
      console.warn('[screenshot]', err);
      return { ok: false, message };
    }
  }, [currentTheme]);

  const [shotMsg, setShotMsg] = useState<string>('');
  useEffect(() => {
    if (!shotMsg) return;
    const t = window.setTimeout(() => setShotMsg(''), 3000);
    return () => window.clearTimeout(t);
  }, [shotMsg]);

  // /control 창에서 오는 메시지를 받아 로컬 state 를 갱신한다.
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
        case 'SCREENSHOT_REQUEST': {
          // /control 에서 요청 → 이 창의 stage 를 캡처해서 저장 후 ack
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
        }
        default:
          // DISPLAY_READY / SCREENSHOT_DONE / SCREENSHOT_ERROR 는 display 가 처리하지 않는다.
          break;
      }
    });
    // 늦게 열렸을 수 있으니 /control 에 READY 알림 → 최신 SYNC_STATE 요청.
    sendDisplayReady();
    return unsub;
  }, [dispatch, handleCaptureStage]);

  const onClickScreenshot = useCallback(async () => {
    const result = await handleCaptureStage();
    setShotMsg(result.ok ? '우리반 갤러리 이미지를 저장했어요.' : result.message);
  }, [handleCaptureStage]);

  const isSampleMode = artworks.length === 0;
  const displayItems = useMemo(
    () =>
      isSampleMode
        ? processedSamples.map((s) => ({ id: s.id, imageUrl: s.cutoutUrl }))
        : artworks.slice(0, MAX_ARTWORKS).map((a) => ({ id: a.id, imageUrl: a.cutoutUrl })),
    [isSampleMode, processedSamples, artworks],
  );

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      try {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } catch { /* 브라우저 제한 */ }
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

  const spotlightDisplayIndex =
    spotlightEnabled && !isSampleMode && artworks.length > 0
      ? currentSpotlightIndex % Math.max(1, displayItems.length)
      : -1;

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
      {/* 16:9 스테이지 - 이 영역이 스크린샷 캡처 대상 (#exhibition-stage) */}
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
          spotlightIndex={spotlightDisplayIndex}
          backgroundUrl={exhibitionBgUrl}
          emptyTitle={isSampleMode && !samplesReady ? '샘플을 준비하고 있어요' : undefined}
          emptyHint={isSampleMode && !samplesReady ? '잠시만 기다려주세요 · 처음 1~2초 정도 걸려요' : undefined}
        />

        <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
          <span className="badge" style={{ fontSize: 13 }}>
            {themeMeta.exhibitionBadge ?? `${themeMeta.emoji} ${themeMeta.name} 전시관`}
          </span>
        </div>

        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', gap: 8 }}>
          {isSampleMode && (
            <span className="badge" style={{ fontSize: 12, background: 'rgba(255,220,100,0.9)', color: '#7a5200' }}>
              ✨ 샘플
            </span>
          )}
          <span className="badge" style={{ fontSize: 12 }}>
            {speedMode === 'paused' ? '⏸ 멈춤' : `캐릭터만 둥둥 · ${SPEED_LABELS[speedMode]}`}
          </span>
        </div>

        {!isSampleMode && (
          <SpotlightPanel
            artworks={artworks}
            currentIndex={currentSpotlightIndex}
            onAdvance={advanceSpotlight}
            enabled={spotlightEnabled}
            onOpenViewer={(a) => setViewerArtwork(a)}
          />
        )}
      </div>

      {/* 윈도우 모드: 우측 상단의 작은 컨트롤 (3초 후 자동 숨김, 마우스 움직이면 다시 표시) */}
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
            📸 저장
          </button>
          <button
            onClick={toggleFullscreen}
            className="btn btn-sm"
            data-screenshot-ignore="true"
            style={{
              background: 'rgba(10,30,50,0.5)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {isFullscreen ? '⊡ 전체화면 종료' : '⛶ 전체 화면'}
          </button>
        </div>
      ) : (
        /* 일반 모드: 하단 컨트롤 (제어판 링크 + 스크린샷 + 전체화면) */
        <div
          data-screenshot-ignore="true"
          style={{
            position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
            zIndex: 50, display: 'flex', gap: 10,
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
            ← 제어판
          </Link>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
          <span style={{
            fontSize: 13, color: 'rgba(255,255,255,0.7)',
            display: 'flex', alignItems: 'center', padding: '0 4px',
          }}>
            {isSampleMode ? '🎬 샘플 재생 중' : `${displayItems.length}개 작품`}
          </span>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
          <button
            onClick={onClickScreenshot}
            className="btn btn-sm"
            data-screenshot-ignore="true"
            title="현재 전시 화면을 PNG로 저장합니다"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            📸 갤러리 저장
          </button>
          <button
            onClick={toggleFullscreen}
            className="btn btn-sm"
            data-screenshot-ignore="true"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            {isFullscreen ? '⊡ 전체화면 종료' : '⛶ 전체화면'}
          </button>
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
          샘플 작품을 보여드리고 있어요 · 선생님이 학습지를 올리면 진짜 작품이 나와요
        </div>
      )}

      <WorksheetViewerModal
        artwork={viewerArtwork}
        onClose={() => setViewerArtwork(null)}
      />
    </div>
  );
}
