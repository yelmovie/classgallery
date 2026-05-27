import { useCallback, useEffect, useRef, useState } from 'react';
import { captureVideoFrameToFile, computeGuideBoxCrop } from '../../lib/camera/captureFrame';
import { extractWorksheetData } from '../../lib/image/extractCharacterCutout';
import type { Artwork } from '../../types/artwork';
import type { ThemeCropArea } from '../../types/theme';

const COOLDOWN_AFTER_CAPTURE_MS = 800;

type Phase = 'INITIALIZING' | 'ERROR' | 'READY' | 'CAPTURING' | 'COOLDOWN';

interface CapturedThumb {
  id: string;
  thumbDataUrl: string;
  index: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** 확인완료 버튼을 눌러야 갤러리에 전송됨 */
  onArtworksCaptured: (artworks: Artwork[]) => void;
  /** 남은 슬롯 개수. 0 이면 캡처 비활성화. */
  remainingSlots: number;
  /** 테마별 캐릭터 영역 비율. 미지정 시 기본값 사용. */
  cropArea?: ThemeCropArea;
}

export default function CameraCaptureModal({
  open, onClose, onArtworksCaptured, remainingSlots, cropArea,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [phase, setPhase] = useState<Phase>('INITIALIZING');
  const [flashOn, setFlashOn] = useState(false);
  const [error, setError] = useState<string>('');
  const [thumbs, setThumbs] = useState<CapturedThumb[]>([]);
  const [pendingArtworks, setPendingArtworks] = useState<Artwork[]>([]);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(undefined);

  // 이번 세션에서 추가 가능한 남은 슬롯 (버퍼링된 것 차감)
  const effectiveSlots = remainingSlots - pendingArtworks.length;

  // ------ 카메라 시작/정지 ------
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startStream = useCallback(async (deviceId?: string) => {
    stopStream();
    setError('');
    setPhase('INITIALIZING');
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('이 브라우저에서는 카메라 촬영을 지원하지 않아요. 파일 업로드로 작품을 추가해주세요.');
      }
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      const list = await navigator.mediaDevices.enumerateDevices();
      setDevices(list.filter((d) => d.kind === 'videoinput'));
      if (!selectedDeviceId) {
        const track = stream.getVideoTracks()[0];
        const settings = track?.getSettings?.();
        if (settings?.deviceId) setSelectedDeviceId(settings.deviceId);
      }
      setPhase('READY');
    } catch (err) {
      const message = (() => {
        if (err instanceof DOMException && err.name === 'NotAllowedError') {
          return '카메라 권한이 거부되었어요. 주소창 옆 카메라 아이콘에서 허용하거나, 왼쪽의 작품 추가 버튼으로 사진 파일을 올려주세요.';
        }
        if (err instanceof DOMException && err.name === 'NotFoundError') {
          return '연결된 카메라를 찾지 못했어요. 카메라가 없는 기기에서는 작품 추가 버튼으로 사진 파일을 올려주세요.';
        }
        if (err instanceof Error) {
          return `카메라를 열 수 없었어요: ${err.message}`;
        }
        return '카메라를 열 수 없었어요. 파일 업로드로도 작품을 추가할 수 있어요.';
      })();
      setError(message);
      setPhase('ERROR');
    }
  }, [selectedDeviceId, stopStream]);

  useEffect(() => {
    if (open) {
      void startStream(selectedDeviceId);
    } else {
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
      stopStream();
      setPhase('INITIALIZING');
      setError('');
      setThumbs([]);
      setPendingArtworks([]);
    }
    return () => {
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSelectDevice = (id: string) => {
    setSelectedDeviceId(id);
    void startStream(id);
  };

  // ------ 캡처 (버튼 누를 때만) ------
  const doCapture = useCallback(async () => {
    if (!videoRef.current) return;
    if (effectiveSlots <= 0) {
      setError('더 이상 추가할 수 있는 자리가 없어요.');
      return;
    }

    setPhase('CAPTURING');
    setFlashOn(true);
    window.setTimeout(() => setFlashOn(false), 220);

    try {
      // 가이드 박스(흰 점선) 영역만 잘라 캡처 → 손·배경 완전 제거
      const guideCrop = computeGuideBoxCrop(videoRef.current);
      const file = await captureVideoFrameToFile(videoRef.current, undefined, guideCrop);
      const previewUrl = URL.createObjectURL(file);
      // 이미 가이드 박스(=종이) 영역만 캡처했으므로 detectPaperRegion 불필요.
      // cropArea 로 캐릭터 상단 영역만 추가 crop 후 배경 제거.
      const { cutoutUrl, originalImageUrl } = await extractWorksheetData(file, {
        applyInitialCrop: true,
        cropArea,
      });
      const artwork: Artwork = {
        id: crypto.randomUUID(),
        originalFileName: file.name,
        originalPreviewUrl: previewUrl,
        originalImageUrl,
        cutoutUrl,
        createdAt: Date.now(),
      };

      setPendingArtworks((prev) => [...prev, artwork]);
      setThumbs((prev) => {
        const newIndex = prev.length + 1;
        return [...prev, { id: artwork.id, thumbDataUrl: cutoutUrl, index: newIndex }];
      });

      setPhase('COOLDOWN');
      cooldownTimerRef.current = setTimeout(() => setPhase('READY'), COOLDOWN_AFTER_CAPTURE_MS);
    } catch (err) {
      if (import.meta.env.DEV) console.error('카메라 캡처 처리 실패:', err);
      setError(err instanceof Error ? err.message : '캡처에 실패했어요.');
      setPhase('READY');
    }
  }, [cropArea, effectiveSlots]);

  const handleManualCapture = useCallback(() => {
    if (phase === 'CAPTURING' || phase === 'COOLDOWN' || phase === 'INITIALIZING' || phase === 'ERROR') return;
    void doCapture();
  }, [phase, doCapture]);

  // ------ 확인완료 → 갤러리 전시 ------
  const handleConfirm = useCallback(() => {
    if (pendingArtworks.length === 0) return;
    onArtworksCaptured(pendingArtworks);
    onClose();
  }, [pendingArtworks, onArtworksCaptured, onClose]);

  if (!open) return null;

  const isCaptureDisabled =
    phase === 'INITIALIZING' || phase === 'ERROR' || phase === 'CAPTURING' ||
    phase === 'COOLDOWN' || effectiveSlots <= 0;

  const statusText = (() => {
    switch (phase) {
      case 'INITIALIZING': return '카메라를 켜고 있어요...';
      case 'ERROR': return error || '카메라 오류가 발생했어요.';
      case 'READY': return '그림을 카메라 앞에 보여주세요';
      case 'CAPTURING': return '찰칵! 처리 중...';
      case 'COOLDOWN': return `저장됨 🎉 (${pendingArtworks.length}장)`;
    }
  })();

  return (
    <div
      role="dialog"
      aria-label="카메라로 학습지 캡처"
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(8, 24, 40, 0.78)',
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 'min(480px, calc(100vw - 32px))',
          maxHeight: '96vh',
          background: '#0c1d2e',
          borderRadius: 20,
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* 헤더 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px',
          background: 'rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>📷</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
              카메라로 찍기
            </span>
            <span style={{
              fontSize: 11.5, color: 'rgba(255,255,255,0.6)',
              padding: '3px 9px', borderRadius: 99,
              background: 'rgba(255,255,255,0.08)',
            }}>
              남은 자리 {effectiveSlots}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {devices.length > 1 && (
              <select
                value={selectedDeviceId ?? ''}
                onChange={(e) => handleSelectDevice(e.target.value)}
                style={{
                  fontSize: 12, padding: '6px 10px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                {devices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId} style={{ color: '#000' }}>
                    {d.label || `카메라 ${d.deviceId.slice(0, 6)}`}
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              style={{
                width: 32, height: 32, borderRadius: 99,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.06)',
                color: '#fff', fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', padding: 0,
              }}
            >✕</button>
          </div>
        </div>

        {/* 프리뷰 */}
        <div style={{
          position: 'relative',
          background: '#000',
          aspectRatio: '210 / 297',
          width: '100%',
          overflow: 'hidden',
        }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center',
              display: 'block',
            }}
          />

          {/* 상태 뱃지 */}
          <div style={{
            position: 'absolute', top: 14, left: 14,
            padding: '8px 14px', borderRadius: 99,
            background:
              phase === 'CAPTURING' ? 'rgba(255,255,255,0.92)' :
              phase === 'COOLDOWN' ? 'rgba(80,200,140,0.92)' :
              phase === 'ERROR' ? 'rgba(220,80,80,0.92)' :
              'rgba(20,40,60,0.78)',
            color: phase === 'CAPTURING' ? '#000' : '#fff',
            fontSize: 13, fontWeight: 700,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.15)',
            maxWidth: '70%',
          }}>
            {statusText}
          </div>

          {/* 플래시 */}
          {flashOn && (
            <div style={{
              position: 'absolute', inset: 0,
              background: '#fff',
              animation: 'flash 0.22s ease-out',
              pointerEvents: 'none',
            }} />
          )}

          {/* A4 가이드 라인 */}
          <div style={{
            position: 'absolute', inset: '4% 8%',
            border: '2px dashed rgba(255,255,255,0.4)',
            borderRadius: 8,
            pointerEvents: 'none',
          }}>
            <span style={{
              position: 'absolute', bottom: 8, left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 10, color: 'rgba(255,255,255,0.55)',
              whiteSpace: 'nowrap', letterSpacing: '0.04em',
            }}>
              A4 학습지를 이 안에 맞춰 주세요
            </span>
          </div>
        </div>

        {/* 하단 컨트롤 */}
        <div style={{
          padding: '14px 18px',
          background: 'rgba(255,255,255,0.04)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          {phase === 'ERROR' ? (
            <button
              type="button"
              onClick={() => void startStream(selectedDeviceId)}
              style={{
                padding: '10px 20px', borderRadius: 12,
                background: 'var(--color-primary)',
                color: '#fff', fontWeight: 700, fontSize: 14,
                border: 'none', cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              다시 시도
            </button>
          ) : (
            <button
              type="button"
              onClick={handleManualCapture}
              disabled={isCaptureDisabled}
              style={{
                padding: '10px 20px', borderRadius: 12,
                background: 'var(--color-primary)',
                color: '#fff', fontWeight: 700, fontSize: 14,
                border: 'none', cursor: isCaptureDisabled ? 'not-allowed' : 'pointer',
                opacity: isCaptureDisabled ? 0.45 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              📸 지금 찍기
            </button>
          )}

          <p style={{
            fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.4,
            flex: 1, minWidth: 0,
          }}>
            {phase === 'ERROR'
              ? '카메라가 막히면 모달을 닫고 파일 업로드로 진행할 수 있어요.'
              : '버튼을 눌러야 사진이 저장돼요'}
          </p>

          {/* 확인완료 버튼 */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={pendingArtworks.length === 0}
            style={{
              padding: '10px 16px', borderRadius: 12,
              background: pendingArtworks.length > 0 ? 'rgba(80,200,140,0.9)' : 'rgba(255,255,255,0.08)',
              color: '#fff', fontWeight: 700, fontSize: 13,
              border: 'none', cursor: pendingArtworks.length === 0 ? 'not-allowed' : 'pointer',
              opacity: pendingArtworks.length === 0 ? 0.45 : 1,
              whiteSpace: 'nowrap',
              transition: 'background 0.2s',
            }}
          >
            ✅ 확인완료 → 게시물 전시
          </button>
        </div>

        {/* 썸네일 트레이 (캡처된 사진 + 순번) */}
        {thumbs.length > 0 && (
          <div style={{
            padding: '12px 18px',
            background: 'rgba(0,0,0,0.25)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              marginBottom: 8,
            }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                찍은 사진
              </span>
              <span style={{
                fontSize: 12, fontWeight: 700,
                color: '#fff',
                background: 'rgba(80,200,140,0.8)',
                padding: '2px 8px', borderRadius: 99,
              }}>
                총 {thumbs.length}장
              </span>
            </div>
            <div style={{
              display: 'flex', gap: 8, overflowX: 'auto',
              paddingBottom: 4,
            }}>
              {thumbs.map((t) => (
                <div
                  key={t.id}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    flex: '0 0 auto',
                  }}
                >
                  <div style={{
                    width: 58, height: 58,
                    borderRadius: 8, overflow: 'hidden',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <img
                      src={t.thumbDataUrl}
                      alt={`${t.index}번째 캡처`}
                      style={{ maxWidth: '88%', maxHeight: '88%', objectFit: 'contain' }}
                    />
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: 'rgba(255,255,255,0.65)',
                    lineHeight: 1,
                  }}>
                    {t.index}번
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <style>{`
          @keyframes flash {
            0%   { opacity: 0; }
            30%  { opacity: 0.95; }
            100% { opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}
