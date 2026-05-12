import type { ThemeBackground, ThemeMeta } from '../../types/theme';

/** 마지막 보호선: 모든 배경이 비었거나 못 찾을 때 ExhibitionStage 가 자체 그라데이션 fallback 사용. */
const FALLBACK_BACKGROUND_URL: string | undefined = undefined;

/**
 * 테마의 backgrounds 를 항상 배열로 돌려준다.
 * meta JSON 이 객체 형태로 들어와도 normalize 가 되도록 약간 방어적으로 작성.
 */
export function getThemeBackgrounds(theme: ThemeMeta): ThemeBackground[] {
  return theme.backgrounds ?? [];
}

/**
 * 테마의 기본 배경. defaultBackgroundId 가 있으면 그것을, 없으면 backgrounds[0] 을.
 * 그것도 없으면 null.
 */
export function getDefaultBackground(theme: ThemeMeta): ThemeBackground | null {
  const list = getThemeBackgrounds(theme);
  if (list.length === 0) return null;
  if (theme.defaultBackgroundId) {
    const found = list.find((b) => b.id === theme.defaultBackgroundId);
    if (found) return found;
  }
  return list[0];
}

/**
 * 선택 ID 로 배경 찾기. 못 찾으면 기본 배경.
 */
export function getBackgroundById(
  theme: ThemeMeta,
  backgroundId: string | null | undefined,
): ThemeBackground | null {
  if (!backgroundId) return getDefaultBackground(theme);
  const found = getThemeBackgrounds(theme).find((b) => b.id === backgroundId);
  return found ?? getDefaultBackground(theme);
}

/**
 * 전시 화면에 실제 적용할 URL.
 * - 선택된 background 가 있으면 그것
 * - 없으면 기본 배경
 * - 그것도 없으면 undefined (ExhibitionStage 가 자체 그라데이션 fallback 사용)
 */
export function resolveBackgroundUrl(
  theme: ThemeMeta,
  selectedBackgroundId: string | null | undefined,
): string | undefined {
  const bg = getBackgroundById(theme, selectedBackgroundId);
  return bg?.file ?? FALLBACK_BACKGROUND_URL;
}
