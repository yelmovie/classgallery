import type { ThemeId } from './theme';

export type TopicCategory =
  | '관계'
  | '안전'
  | '시민'
  | '디지털'
  | '생활'
  | '계절';

export type TopicStatus = 'available' | 'comingSoon' | 'draft';

export interface TopicAssetPaths {
  /** 배경 이미지 후보 경로. 실제 파일 없어도 빌드/렌더링 깨지지 않게 fallback 처리. */
  backgrounds: string[];
  /** 샘플 캐릭터 컷아웃 후보 경로. */
  characters: string[];
  /** A4 활동지 후보 경로. */
  worksheets: string[];
}

export interface TopicTheme {
  /** 카드 강조 색상 (작은 라벨/링/포커스 등에 사용). */
  accentColor: string;
  /** 카드 placeholder 그라데이션 (배경 에셋 없을 때 노출). */
  gradient: string;
}

export interface TopicPack {
  /** URL-safe 식별자. polished kebab-case. */
  id: string;
  /** 화면에 보이는 제목. */
  title: string;
  /** 원래의 한국어 정식 명칭 (검색/대체 표기). */
  originalName: string;
  /** 카드 보조 한 줄 (현재 화면에는 미사용이지만 데이터에는 보존). */
  subtitle?: string;
  /** 카드 한 줄 설명. */
  description: string;
  /** 분류 필터. */
  category: TopicCategory;
  /** 진행 상태. comingSoon/draft 는 카드 비활성 + 안내 모달. */
  status: TopicStatus;
  /** 클릭 시 이동할 라우트 (선택). available 일 때만 의미 있음. */
  route?: string;
  /**
   * 기존 ThemeMeta(레지스트리)에 연결되는 id.
   * available 토픽이 실제 전시 흐름(/control, /display)을 가진다면 여기에 연결.
   */
  themeId?: ThemeId;
  assets: TopicAssetPaths;
  theme: TopicTheme;
}
