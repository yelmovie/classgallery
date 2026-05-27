export type ThemeId =
  | 'dokdo'
  | 'safeschool'
  | 'saveearth'
  | 'culture'
  | 'friend'
  | 'noviolence'
  | 'summer'
  | 'civic'
  | 'aiethnic'
  | 'smartphone'
  | 'food'
  | 'winter'
  | 'earth'
  | 'mind'
  | 'future'
  | 'world';

export interface ThemeCropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ThemeWorksheet {
  id: string;
  group: number;
  name: string;
  displayName: string;
  file: string;
}

/**
 * 한 테마의 전시 배경 선택지.
 * id 는 테마 내부에서 고유. file 은 public 정적 PNG/JPG/WebP 경로.
 * position 은 background-position 값 (기본 center).
 */
export interface ThemeBackground {
  id: string;
  name: string;
  file: string;
  position?: string;
}

/**
 * 사용 가능한 (available) 테마의 자산/메타데이터.
 * status="coming-soon" 테마는 자산이 비어있고 carousel에서 placeholder 로 표시된다.
 */
export interface ThemeMeta {
  /** 기본 테마는 ThemeId, 커스텀 테마는 'custom-...' 형태의 임의 string. */
  id: ThemeId | string;
  name: string;
  englishName?: string;
  emoji: string;
  status: 'available' | 'coming-soon';
  shortDescription: string;
  description?: string;

  // 사용 가능한 테마만 가지는 자산
  /** 선택지로 보여줄 전시 배경 목록. 0개여도 fallback 처리. */
  backgrounds?: ThemeBackground[];
  /** 기본 배경 id. 미지정 시 backgrounds[0] 을 기본으로. */
  defaultBackgroundId?: string;
  worksheets?: ThemeWorksheet[];
  /** Sample 모드 / 홈 carousel 에서 떠다닐 미리보기 컷아웃 URLs. */
  sampleUrls?: string[];
  /** 학습지 사진 업로드 시 1차 crop 영역. */
  cropArea?: ThemeCropArea;
  /** 전시 화면 좌상단 배지 텍스트. */
  exhibitionBadge?: string;
  /** /control 화면 헤더 텍스트. */
  controlTitle?: string;
  /** placeholder 슬라이드용 그라데이션 (coming-soon 만). */
  placeholderGradient?: string;
}
