import { IMAGE_EXTRACTION_CONFIG } from '../../constants/imageConfig';
import {
  removeOuterPaperBackground,
  findOpaqueBoundingBox,
} from './canvasBackgroundRemoval';
import { detectPaperRegion } from './detectPaperRegion';
import type { ThemeCropArea } from '../../types/theme';

/**
 * 학습지 전체 사진 → 캐릭터만 남은 PNG dataURL.
 *
 * 파이프라인 (학습지용):
 *  1. 너무 크면 다운스케일 (속도 보호).
 *  2. 1차 안전 crop (하단 글쓰기 박스 등 컷오프). 테마별 cropArea 주입 가능.
 *  3. flood-fill 로 가장자리 배경만 투명화 (near-white + light-gray 둘 다).
 *  4. 남은 캐릭터의 bounding box로 다시 자른다 → 촬영 위치 차이 흡수.
 *  5. PNG로 출력.
 *
 * 캐릭터 자체 색은 손대지 않는다(불투명 유지). 외곽선·그림자는 CSS에서 처리.
 */
export async function extractCharacterCutout(
  file: File,
  cropArea?: ThemeCropArea,
): Promise<string> {
  const img = await loadImageFromFile(file);
  return processImageToCutout(img, { applyInitialCrop: true, cropArea });
}

export interface ExtractWorksheetOptions {
  /** 사용자 정의 crop 영역 (테마별). applyInitialCrop=true 일 때만 적용. */
  cropArea?: ThemeCropArea;
  /**
   * 초기 직사각형 crop을 적용할지. 기본 true. 카메라 캡처처럼 학습지가
   * 프레임에 어떻게 들어올지 모르는 경우 false 로 설정해 전체 프레임에서
   * 캐릭터 추출.
   */
  applyInitialCrop?: boolean;
  /**
   * true 면 먼저 사진 안에서 밝은 종이 영역을 자동 탐지해 그 영역을
   * cropArea 로 사용한다 (카메라 캡처용). 탐지 실패 시 다른 옵션으로 폴백.
   */
  detectPaperRegion?: boolean;
}

/**
 * 학습지 한 장 → 전시용 cutout + 확대 감상용 원본 dataURL 둘 다 생성.
 * 이미지를 한 번만 디코드해서 두 결과를 만든다.
 *
 * - cutoutUrl: 캐릭터만 잘라낸 PNG (전시 화면용)
 * - originalImageUrl: 다운스케일된 원본 학습지 JPEG dataURL (확대 감상용)
 *   - 학생이 적은 글씨까지 보존
 *   - cross-window 전송 가능 (BroadcastChannel)
 */
export async function extractWorksheetData(
  file: File,
  cropAreaOrOptions?: ThemeCropArea | ExtractWorksheetOptions,
): Promise<{ cutoutUrl: string; originalImageUrl: string }> {
  const opts: ExtractWorksheetOptions =
    cropAreaOrOptions && 'x' in cropAreaOrOptions
      ? { cropArea: cropAreaOrOptions, applyInitialCrop: true }
      : { applyInitialCrop: true, ...(cropAreaOrOptions ?? {}) };

  const img = await loadImageFromFile(file);

  // 종이 영역 자동 탐지: 탐지 성공 시 테마의 character cropArea를
  // 검출된 종이 내부에 매핑해서 최종 crop 좌표를 산출한다.
  // 탐지 실패 시 opts 그대로 폴백.
  let effectiveOpts = opts;
  if (opts.detectPaperRegion) {
    const paper = detectPaperRegion(img);
    if (paper) {
      // 테마가 지정한 캐릭터 영역(A4 기준 비율)을 검출된 종이 픽셀 좌표 안에 적용.
      const charCrop = opts.cropArea ?? IMAGE_EXTRACTION_CONFIG.initialCropArea;
      const absX = paper.x + paper.width  * charCrop.x;
      const absY = paper.y + paper.height * charCrop.y;
      const absW = paper.width  * charCrop.width;
      const absH = paper.height * charCrop.height;
      effectiveOpts = {
        ...opts,
        applyInitialCrop: true,
        cropArea: {
          x: absX / img.naturalWidth,
          y: absY / img.naturalHeight,
          width:  absW / img.naturalWidth,
          height: absH / img.naturalHeight,
        },
      };
    }
    // 탐지 실패 시 원래 옵션(applyInitialCrop 등) 그대로 폴백.
  }

  const cutoutUrl = processImageToCutout(img, {
    applyInitialCrop: effectiveOpts.applyInitialCrop ?? true,
    cropArea: effectiveOpts.cropArea,
  });
  const originalImageUrl = createDownscaledOriginalDataUrl(img);
  return { cutoutUrl, originalImageUrl };
}

const ORIGINAL_MAX_DIM = 1400;
const ORIGINAL_JPEG_QUALITY = 0.88;

/**
 * 학습지 사진을 ORIGINAL_MAX_DIM 이하로 다운스케일한 JPEG dataURL 로 변환.
 * 학생이 손으로 쓴 글씨가 보일 정도의 해상도를 유지하면서 BroadcastChannel
 * 전송에 부담되지 않게 압축.
 */
function createDownscaledOriginalDataUrl(img: HTMLImageElement): string {
  let w = img.naturalWidth;
  let h = img.naturalHeight;
  const maxDim = Math.max(w, h);
  if (maxDim > ORIGINAL_MAX_DIM) {
    const scale = ORIGINAL_MAX_DIM / maxDim;
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('원본 다운스케일용 Canvas context를 만들 수 없습니다.');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  // 흰 배경 깔아서 JPEG 알파 손실 보완 (학습지 사진은 보통 흰 종이라 자연스러움).
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', ORIGINAL_JPEG_QUALITY);
}

/**
 * 이미 캐릭터 중심으로 잘려있는 이미지(샘플 등) → 배경 제거된 PNG dataURL.
 *
 * 샘플 PNG가 실제 투명 PNG가 아니라 흰색/체크무늬 배경이 픽셀로 박혀있을 수 있어
 * 이를 자동으로 제거한다. 1차 crop은 건너뛴다.
 */
export async function extractCharacterCutoutFromUrl(url: string): Promise<string> {
  const img = await loadImageFromUrl(url);
  return processImageToCutout(img, { applyInitialCrop: false });
}

// 독도 학습지 사진용 기본 캐릭터 영역 (상단 절반)
const WORKSHEET_PHOTO_CROP: ThemeCropArea = { x: 0.04, y: 0.02, width: 0.92, height: 0.48 };

/**
 * 실제 학습지 촬영 사진 URL → 캐릭터 cutout PNG dataURL.
 *
 * 1. 사진에서 흰 종이 영역을 자동 탐지 (detectPaperRegion).
 * 2. 탐지된 종이 안에 WORKSHEET_PHOTO_CROP 을 적용해 캐릭터 영역 계산.
 * 3. 탐지 실패 시 전체 이미지에 WORKSHEET_PHOTO_CROP 을 직접 적용.
 */
export async function extractWorksheetCutoutFromUrl(url: string): Promise<string> {
  const img = await loadImageFromUrl(url);

  let opts: ProcessOptions = { applyInitialCrop: true, cropArea: WORKSHEET_PHOTO_CROP };

  const paper = detectPaperRegion(img);
  if (paper) {
    const c = WORKSHEET_PHOTO_CROP;
    opts = {
      applyInitialCrop: true,
      cropArea: {
        x:      (paper.x + paper.width  * c.x) / img.naturalWidth,
        y:      (paper.y + paper.height * c.y) / img.naturalHeight,
        width:  (paper.width  * c.width)        / img.naturalWidth,
        height: (paper.height * c.height)        / img.naturalHeight,
      },
    };
  }

  return processImageToCutout(img, opts);
}

interface ProcessOptions {
  applyInitialCrop: boolean;
  cropArea?: ThemeCropArea;
}

function processImageToCutout(img: HTMLImageElement, opts: ProcessOptions): string {
  const {
    initialCropArea,
    backgroundThresholds,
    maxProcessingSize,
    bboxPaddingRatio,
    outputMaxDimension,
  } = IMAGE_EXTRACTION_CONFIG;
  const effectiveCrop = opts.cropArea ?? initialCropArea;

  // 1. 처리용 다운스케일된 크기 계산
  let scaledW = img.naturalWidth;
  let scaledH = img.naturalHeight;
  const maxDim = Math.max(scaledW, scaledH);
  if (maxDim > maxProcessingSize) {
    const scale = maxProcessingSize / maxDim;
    scaledW = Math.round(scaledW * scale);
    scaledH = Math.round(scaledH * scale);
  }

  // 2. crop 영역 결정 (URL 샘플: 전체, File 학습지: 테마별 cropArea 또는 기본값)
  const cropX = opts.applyInitialCrop ? Math.floor(scaledW * effectiveCrop.x) : 0;
  const cropY = opts.applyInitialCrop ? Math.floor(scaledH * effectiveCrop.y) : 0;
  const cropW = opts.applyInitialCrop ? Math.floor(scaledW * effectiveCrop.width)  : scaledW;
  const cropH = opts.applyInitialCrop ? Math.floor(scaledH * effectiveCrop.height) : scaledH;

  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = cropW;
  cropCanvas.height = cropH;
  const cropCtx = cropCanvas.getContext('2d', { willReadFrequently: true });
  if (!cropCtx) throw new Error('Canvas context를 만들 수 없습니다.');

  // 원본 → 스케일링하면서 crop 영역만 캔버스에 그린다.
  cropCtx.drawImage(
    img,
    0, 0, img.naturalWidth, img.naturalHeight,
    -cropX, -cropY, scaledW, scaledH,
  );

  // 3. 가장자리 연결 배경 → 투명
  const imageData = cropCtx.getImageData(0, 0, cropW, cropH);
  removeOuterPaperBackground(imageData, backgroundThresholds);
  cropCtx.putImageData(imageData, 0, 0);

  // 4. 캐릭터의 실제 bounding box로 다시 자르기
  const bbox = findOpaqueBoundingBox(imageData);
  if (!bbox) {
    // 모든 픽셀이 투명 = 거의 흰 종이거나 처리 실패. 일단 1차 crop 결과 반환.
    return cropCanvas.toDataURL('image/png');
  }

  const padX = Math.round(bbox.width * bboxPaddingRatio);
  const padY = Math.round(bbox.height * bboxPaddingRatio);
  const finalX = Math.max(0, bbox.x - padX);
  const finalY = Math.max(0, bbox.y - padY);
  const finalW = Math.min(cropW - finalX, bbox.width  + padX * 2);
  const finalH = Math.min(cropH - finalY, bbox.height + padY * 2);

  // 5. 출력 캔버스 (한 변 outputMaxDimension 이하)
  const outScale = Math.min(1, outputMaxDimension / Math.max(finalW, finalH));
  const outW = Math.max(1, Math.round(finalW * outScale));
  const outH = Math.max(1, Math.round(finalH * outScale));

  const outCanvas = document.createElement('canvas');
  outCanvas.width = outW;
  outCanvas.height = outH;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) throw new Error('출력 Canvas context를 만들 수 없습니다.');
  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = 'high';
  outCtx.drawImage(cropCanvas, finalX, finalY, finalW, finalH, 0, 0, outW, outH);

  return outCanvas.toDataURL('image/png');
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('이미지를 불러올 수 없습니다.'));
    };
    img.src = objectUrl;
  });
}

function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`이미지를 불러올 수 없습니다: ${url}`));
    img.src = url;
  });
}
