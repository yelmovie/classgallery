import type { ThemeId } from './theme';

export interface Artwork {
  id: string;
  originalFileName: string;
  /**
   * blob URL (URL.createObjectURL). 같은 탭에서 "올린 학습지" 목록 썸네일 등 가벼운 미리보기용.
   * 다른 창에서는 무효이므로 cross-window 전송에는 사용하지 않는다.
   */
  originalPreviewUrl: string;
  /**
   * 다운스케일된 원본 학습지 dataURL (JPEG).
   * 확대 감상에서 학생이 적은 글까지 보여주기 위한 풀 학습지 이미지.
   * dataURL 이므로 BroadcastChannel 로 새 창에도 안전하게 전달된다.
   * 일부 기존 작품에는 없을 수 있어 optional.
   */
  originalImageUrl?: string;
  /** 전시 화면에 떠다니는 캐릭터 컷아웃 PNG dataURL. */
  cutoutUrl: string;
  createdAt: number;
  groupId?: string;
}

export type SpeedMode = 'paused' | 'slow' | 'normal' | 'fast';

export interface GalleryState {
  /** 기본 테마 ID(ThemeId) 또는 커스텀 테마 ID('custom-...'). */
  currentTheme: ThemeId | string;
  /** 선생님이 선택한 전시 배경 id. null 이면 테마의 default 사용. */
  selectedBackgroundId: string | null;
  artworks: Artwork[];
  speedMode: SpeedMode;
  spotlightEnabled: boolean;
  currentSpotlightIndex: number;
}

export type GalleryAction =
  | { type: 'SET_THEME'; payload: ThemeId | string }
  | { type: 'SET_BACKGROUND'; payload: string | null }
  | { type: 'ADD_ARTWORKS'; payload: Artwork[] }
  | { type: 'SET_ARTWORKS'; payload: Artwork[] }
  | { type: 'REMOVE_ARTWORK'; payload: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'SET_SPEED'; payload: SpeedMode }
  | { type: 'SET_SPOTLIGHT'; payload: boolean }
  | { type: 'ADVANCE_SPOTLIGHT' };
