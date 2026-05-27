/**
 * 현재 video 프레임을 JPEG File 객체로 캡처.
 * crop을 지정하면 해당 원본 픽셀 영역만 잘라서 저장한다.
 * 결과 File은 기존 extractWorksheetData 파이프라인에 그대로 입력 가능.
 */

const MAX_CAPTURE_DIM = 2000;
const JPEG_QUALITY = 0.96;

export interface VideoCropRect {
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
}

export async function captureVideoFrameToFile(
  video: HTMLVideoElement,
  fileName: string = `camera-${Date.now()}.jpg`,
  crop?: VideoCropRect,
): Promise<File> {
  if (!video.videoWidth || !video.videoHeight) {
    throw new Error('카메라가 아직 준비되지 않았어요.');
  }

  const srcX = crop?.sourceX ?? 0;
  const srcY = crop?.sourceY ?? 0;
  const srcW = crop?.sourceWidth ?? video.videoWidth;
  const srcH = crop?.sourceHeight ?? video.videoHeight;

  const maxDim = Math.max(srcW, srcH);
  const scale = maxDim > MAX_CAPTURE_DIM ? MAX_CAPTURE_DIM / maxDim : 1;
  const outW = Math.max(1, Math.round(srcW * scale));
  const outH = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('캡처용 Canvas context를 만들 수 없습니다.');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(video, srcX, srcY, srcW, srcH, 0, 0, outW, outH);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY);
  });
  if (!blob) throw new Error('프레임을 캡처할 수 없었어요.');
  return new File([blob], fileName, { type: 'image/jpeg' });
}

/**
 * 카메라 프리뷰 컨테이너(A4 세로 비율)와 비디오 프레임 크기를 바탕으로
 * 흰 점선 가이드 박스에 해당하는 원본 비디오 픽셀 좌표를 계산한다.
 *
 * 가이드 박스 inset: top/bottom 4%, left/right 8% (CameraCaptureModal과 동일)
 * objectFit: cover 로 인한 가로 crop 도 보정한다.
 */
export function computeGuideBoxCrop(video: HTMLVideoElement): VideoCropRect {
  const vw = video.videoWidth;
  const vh = video.videoHeight;

  // 컨테이너 비율 = A4 세로 (210:297)
  const containerAspect = 210 / 297;

  let srcX: number, srcY: number, srcW: number, srcH: number;

  if (vw / vh > containerAspect) {
    // 비디오가 컨테이너보다 가로로 넓음 → 높이 기준 scale, 가로 center-crop
    srcW = vh * containerAspect;
    srcH = vh;
    srcX = (vw - srcW) / 2;
    srcY = 0;
  } else {
    // 비디오가 컨테이너보다 세로로 긺 → 너비 기준 scale, 세로 center-crop
    srcW = vw;
    srcH = vw / containerAspect;
    srcX = 0;
    srcY = (vh - srcH) / 2;
  }

  // 가이드 박스 inset 적용 (top/bottom 4%, left/right 8%)
  const insetX = 0.08;
  const insetY = 0.04;
  return {
    sourceX: srcX + srcW * insetX,
    sourceY: srcY + srcH * insetY,
    sourceWidth:  srcW * (1 - insetX * 2),
    sourceHeight: srcH * (1 - insetY * 2),
  };
}
