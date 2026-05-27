/**
 * 카메라 라이브 프리뷰에서 "프레임이 정지된 정도" 를 추정.
 *
 * - 영상을 SAMPLE_W × SAMPLE_H 그레이스케일로 다운샘플
 * - 직전 프레임과 평균 픽셀 차이(0~255)를 계산
 * - 차이가 STABLE_DIFF_MAX 이하이면 "정지" 로 본다
 * - 일정 시간 누적해서 "정지가 지속" 인지 판단
 */

const SAMPLE_W = 60;
const SAMPLE_H = 40;

export const DEFAULT_STABLE_DIFF_MAX = 4.5;
export const DEFAULT_CHANGE_DIFF_MIN = 14;

export interface StabilityDetectorOptions {
  /** 한 프레임의 평균 픽셀 차이가 이 값 이하이면 "정지된 프레임" */
  stableDiffMax?: number;
  /** 평균 차이가 이 값 이상이면 "큰 변화" - 새 학생이 와서 그림 보여줌 */
  changeDiffMin?: number;
}

export interface FrameAnalysis {
  /** 직전 프레임과 평균 픽셀 차이 (0~255). 직전 프레임이 없으면 null. */
  diff: number | null;
  /** 평균 밝기 (0~255). 너무 어두우면 카메라 가려진 것일 수 있음. */
  brightness: number;
  /** 프레임이 정지된 것으로 분류되었는지. */
  isStable: boolean;
  /** 직전과 큰 변화가 감지되었는지. */
  isBigChange: boolean;
}

export class StabilityDetector {
  private prevGray: Uint8ClampedArray | null = null;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private stableDiffMax: number;
  private changeDiffMin: number;

  constructor(options: StabilityDetectorOptions = {}) {
    this.stableDiffMax = options.stableDiffMax ?? DEFAULT_STABLE_DIFF_MAX;
    this.changeDiffMin = options.changeDiffMin ?? DEFAULT_CHANGE_DIFF_MIN;
    this.canvas = document.createElement('canvas');
    this.canvas.width = SAMPLE_W;
    this.canvas.height = SAMPLE_H;
    const ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas context를 만들 수 없습니다.');
    this.ctx = ctx;
  }

  /**
   * 현재 video 프레임을 분석한다.
   * video가 아직 준비되지 않았으면 (videoWidth=0) null 반환.
   */
  analyzeFrame(video: HTMLVideoElement): FrameAnalysis | null {
    if (!video.videoWidth || !video.videoHeight) return null;
    if (video.readyState < 2) return null;

    this.ctx.drawImage(video, 0, 0, SAMPLE_W, SAMPLE_H);
    const { data } = this.ctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H);

    const gray = new Uint8ClampedArray(SAMPLE_W * SAMPLE_H);
    let brightnessSum = 0;
    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
      // ITU-R BT.601 luma
      const y = (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000;
      gray[j] = y;
      brightnessSum += y;
    }
    const brightness = brightnessSum / gray.length;

    let diff: number | null = null;
    if (this.prevGray) {
      let sum = 0;
      for (let i = 0; i < gray.length; i++) {
        sum += Math.abs(gray[i] - this.prevGray[i]);
      }
      diff = sum / gray.length;
    }
    this.prevGray = gray;

    return {
      diff,
      brightness,
      isStable: diff !== null && diff <= this.stableDiffMax,
      isBigChange: diff !== null && diff >= this.changeDiffMin,
    };
  }

  reset(): void {
    this.prevGray = null;
  }
}
