/**
 * 전시 화면을 새 창으로 띄우기 위한 유틸.
 *
 * - 이미 열린 창이 있으면 새로 열지 말고 focus.
 * - 팝업 차단 시 호출자에게 'blocked' 를 돌려줘서 사용자에게 안내 가능.
 * - window.open 은 사용자 제스처(클릭) 안에서만 호출해야 차단되지 않는다.
 */

export const DISPLAY_WINDOW_NAME = 'classgallery-display';
export const DISPLAY_WINDOW_FEATURES =
  'width=1600,height=900,resizable=yes,scrollbars=no,toolbar=no,location=no,menubar=no';

export type OpenDisplayResult = 'opened' | 'focused' | 'blocked';

let displayWindow: Window | null = null;

function buildDisplayUrl(themeId?: string): string {
  const t = themeId ? `&theme=${encodeURIComponent(themeId)}` : '';
  return `/display?mode=window${t}`;
}

export function openDisplayWindow(themeId?: string): OpenDisplayResult {
  if (displayWindow && !displayWindow.closed) {
    return focusDisplayWindow() ? 'focused' : 'opened';
  }
  const win = window.open(
    buildDisplayUrl(themeId),
    DISPLAY_WINDOW_NAME,
    DISPLAY_WINDOW_FEATURES,
  );
  if (detectPopupBlocked(win)) {
    displayWindow = null;
    return 'blocked';
  }
  displayWindow = win;
  return 'opened';
}

export function focusDisplayWindow(): boolean {
  if (!displayWindow || displayWindow.closed) return false;
  try {
    displayWindow.focus();
    return true;
  } catch {
    return false;
  }
}

export function isDisplayWindowOpen(): boolean {
  return !!displayWindow && !displayWindow.closed;
}

export function detectPopupBlocked(win: Window | null): boolean {
  // window.open이 null을 반환하면 차단된 것. 일부 브라우저는 빈 객체를 반환할 수 있어 추가 확인.
  return win === null || typeof win === 'undefined';
}
