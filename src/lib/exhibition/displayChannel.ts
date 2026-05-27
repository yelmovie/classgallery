import type { Artwork, SpeedMode } from '../../types/artwork';
import type { ThemeId } from '../../types/theme';

/**
 * /control 과 /display 창 간 상태 동기화.
 * 외부 DB / 서버 / 로그인을 사용하지 않고 브라우저 내부 BroadcastChannel 만 사용한다.
 *
 * - /control: 상태가 바뀌면 send 함수로 메시지를 보낸다.
 * - /display: subscribeDisplayMessages 로 메시지를 받아 로컬 state 에 반영한다.
 * - /display 가 늦게 열려도 sendDisplayReady() 로 알리면 /control 이 최신 SYNC_STATE 를 다시 보낸다.
 */

export const DISPLAY_CHANNEL_NAME = 'classgallery-exhibition';

export interface SyncStatePayload {
  currentTheme: ThemeId | string;
  selectedBackgroundId: string | null;
  artworks: Artwork[];
  speedMode: SpeedMode;
  spotlightEnabled: boolean;
}

export type DisplayMessage =
  | { type: 'DISPLAY_READY' }
  | { type: 'SYNC_STATE'; payload: SyncStatePayload }
  | { type: 'UPDATE_SPEED'; payload: { speedMode: SpeedMode } }
  | { type: 'UPDATE_SPOTLIGHT'; payload: { spotlightEnabled: boolean } }
  | { type: 'UPDATE_BACKGROUND'; payload: { selectedBackgroundId: string | null } }
  | { type: 'CLEAR_ALL' }
  | { type: 'SCREENSHOT_REQUEST' }
  | { type: 'SCREENSHOT_DONE'; filename: string }
  | { type: 'SCREENSHOT_ERROR'; message: string }
  | { type: 'EMAIL_GALLERY_REQUEST'; email: string }
  | { type: 'EMAIL_GALLERY_DONE' }
  | { type: 'EMAIL_GALLERY_ERROR'; message: string };

// 모듈 싱글톤. BroadcastChannel 은 자기 자신에게는 메시지를 보내지 않으므로
// 같은 탭의 송신자/수신자는 서로 충돌하지 않는다.
let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (channel) return channel;
  if (typeof BroadcastChannel === 'undefined') return null;
  try {
    channel = new BroadcastChannel(DISPLAY_CHANNEL_NAME);
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[displayChannel] BroadcastChannel 생성 실패', err);
    channel = null;
  }
  return channel;
}

function post(msg: DisplayMessage): void {
  try {
    getChannel()?.postMessage(msg);
  } catch (err) {
    // 페이로드가 직렬화 불가능하거나 채널이 닫힌 경우. 조용히 무시.
    if (import.meta.env.DEV) console.warn('[displayChannel] postMessage 실패', err);
  }
}

export function sendDisplayReady(): void {
  post({ type: 'DISPLAY_READY' });
}

export function sendSyncState(payload: SyncStatePayload): void {
  post({ type: 'SYNC_STATE', payload });
}

export function sendSpeedUpdate(speedMode: SpeedMode): void {
  post({ type: 'UPDATE_SPEED', payload: { speedMode } });
}

export function sendSpotlightUpdate(spotlightEnabled: boolean): void {
  post({ type: 'UPDATE_SPOTLIGHT', payload: { spotlightEnabled } });
}

export function sendBackgroundUpdate(selectedBackgroundId: string | null): void {
  post({ type: 'UPDATE_BACKGROUND', payload: { selectedBackgroundId } });
}

export function sendClearAll(): void {
  post({ type: 'CLEAR_ALL' });
}

export function sendScreenshotRequest(): void {
  post({ type: 'SCREENSHOT_REQUEST' });
}

export function sendScreenshotDone(filename: string): void {
  post({ type: 'SCREENSHOT_DONE', filename });
}

export function sendScreenshotError(message: string): void {
  post({ type: 'SCREENSHOT_ERROR', message });
}

export function sendEmailGalleryRequest(email: string): void {
  post({ type: 'EMAIL_GALLERY_REQUEST', email });
}

export function sendEmailGalleryDone(): void {
  post({ type: 'EMAIL_GALLERY_DONE' });
}

export function sendEmailGalleryError(message: string): void {
  post({ type: 'EMAIL_GALLERY_ERROR', message });
}

export function subscribeDisplayMessages(
  handler: (msg: DisplayMessage) => void,
): () => void {
  const ch = getChannel();
  if (!ch) return () => {};
  const onMsg = (e: MessageEvent<DisplayMessage>) => handler(e.data);
  ch.addEventListener('message', onMsg);
  return () => ch.removeEventListener('message', onMsg);
}

export function closeChannel(): void {
  if (!channel) return;
  try { channel.close(); } catch { /* ignore */ }
  channel = null;
}
