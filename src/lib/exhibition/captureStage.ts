import { toBlob } from 'html-to-image';

/**
 * 전시 stage 영역만 PNG로 캡처해서 사용자 컴퓨터로 다운로드한다.
 *
 * 안전 원칙:
 *  - 서버 업로드 / 공유 / SNS 연결 없음. 다운로드만 한다.
 *  - 학생 이름·얼굴·학교명·학급명은 stage 안에 존재하지 않으므로 자동으로 들어가지 않는다.
 *  - 캡처 대상 외부의 조작 버튼은 stage div 바깥에 있거나 data-screenshot-ignore="true"
 *    속성으로 명시적으로 제외한다.
 */

export const STAGE_DOM_ID = 'exhibition-stage';

// 16:9 stage 기준 약 1600x900 품질을 목표. 일반 데스크탑에선 보통 stage가 약 800~1280px 폭이므로
// pixelRatio 2를 적용해도 1600~2560px 폭 → 충분히 선명하면서 파일 크기도 적당.
const SCREENSHOT_PIXEL_RATIO = 2;

export function getScreenshotFileName(themeId: string): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = pad2(now.getMonth() + 1);
  const dd = pad2(now.getDate());
  const hh = pad2(now.getHours());
  const min = pad2(now.getMinutes());
  const safeTheme = themeId.replace(/[^a-zA-Z0-9_-]/g, '') || 'theme';
  return `classgallery-${safeTheme}-${yyyy}${mm}${dd}-${hh}${min}.png`;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * data-screenshot-ignore="true" 가 붙은 요소는 캡처에서 제외한다.
 */
function shouldIncludeNode(node: Element): boolean {
  if (!(node instanceof HTMLElement)) return true;
  if (node.dataset.screenshotIgnore === 'true') return false;
  return true;
}

export async function captureElementAsPng(element: HTMLElement): Promise<Blob> {
  const blob = await toBlob(element, {
    pixelRatio: SCREENSHOT_PIXEL_RATIO,
    cacheBust: true,
    backgroundColor: '#0a3d5e', // 혹시 배경이 못 잡힐 때를 위한 fallback 색
    filter: shouldIncludeNode,
  });
  if (!blob) throw new Error('html-to-image: toBlob returned null');
  return blob;
}

export function downloadPng(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  // 일부 브라우저는 DOM에 붙어있어야 click 동작
  document.body.appendChild(link);
  link.click();
  link.remove();
  // 다운로드 트리거 후 잠시 뒤 메모리 회수
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/**
 * 현재 문서에서 stage 요소를 찾아 캡처+다운로드까지 한 번에 처리.
 *
 * @returns 저장된 파일명. 실패 시 throw.
 */
export async function captureAndDownloadStage(
  stageId: string = STAGE_DOM_ID,
  themeId: string = 'dokdo',
): Promise<string> {
  const el = document.getElementById(stageId);
  if (!el) {
    throw new Error(`전시 stage 요소(#${stageId})를 찾을 수 없습니다.`);
  }
  const blob = await captureElementAsPng(el);
  const filename = getScreenshotFileName(themeId);
  downloadPng(blob, filename);
  return filename;
}
