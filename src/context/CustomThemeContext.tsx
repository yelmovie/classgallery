import {
  createContext, useCallback, useContext,
  useEffect, useState,
} from 'react';
import type { ThemeMeta, ThemeBackground, ThemeWorksheet } from '../types/theme';
import {
  dbLoadImage, dbSaveImage, dbDeleteImages,
  dbSaveRegistry, dbLoadRegistry,
  compressImage,
  type CustomThemeDef,
} from '../lib/customThemes/db';
import {
  registerCustomThemeMeta,
  unregisterCustomThemeMeta,
} from '../constants/themes';

// ─── object URL 캐시 ─────────────────────────────────────────────────────────
// 같은 세션 내 중복 생성 방지. 페이지 새로고침 시 재생성한다.
const _objUrlCache = new Map<string, string>();

async function resolveUrl(id: string): Promise<string | null> {
  if (_objUrlCache.has(id)) return _objUrlCache.get(id)!;
  const blob = await dbLoadImage(id);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  _objUrlCache.set(id, url);
  return url;
}

async function buildThemeMeta(def: CustomThemeDef): Promise<ThemeMeta> {
  const [bgUrls, sampleUrls, wsUrls] = await Promise.all([
    Promise.all(def.backgroundImageIds.map(resolveUrl)),
    Promise.all(def.sampleImageIds.map(resolveUrl)),
    Promise.all(def.worksheetImageIds.map(resolveUrl)),
  ]);

  const backgrounds: ThemeBackground[] = (bgUrls.filter(Boolean) as string[]).map((url, i) => ({
    id: `bg-${i}`,
    name: `배경 ${i + 1}`,
    file: url,
  }));

  const worksheets: ThemeWorksheet[] = (wsUrls.filter(Boolean) as string[]).map((url, i) => ({
    id: `ws-${i}`,
    group: i + 1,
    name: `학습지 ${i + 1}`,
    displayName: `${i + 1}번 · 학습지 ${i + 1}`,
    file: url,
  }));

  return {
    id: def.id,
    name: def.name,
    emoji: def.emoji,
    status: 'available',
    shortDescription: '관리자가 만든 계기교육 주제',
    backgrounds,
    defaultBackgroundId: backgrounds[0]?.id,
    worksheets,
    sampleUrls: sampleUrls.filter(Boolean) as string[],
    cropArea: { x: 0.04, y: 0.02, width: 0.92, height: 0.48 },
    exhibitionBadge: `${def.emoji} ${def.name} 전시관`,
    controlTitle: `${def.emoji} ${def.name} 전시 준비`,
  };
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface CustomThemeContextValue {
  customThemes: ThemeMeta[];
  isLoading: boolean;
  /** 새 커스텀 테마를 생성하고 저장한다. */
  createTheme: (params: {
    name: string;
    emoji: string;
    bgFiles: File[];
    sampleFiles: File[];
    wsFiles: File[];
    onProgress?: (step: string) => void;
  }) => Promise<void>;
  /** 커스텀 테마를 삭제한다. */
  deleteTheme: (id: string) => Promise<void>;
}

const CustomThemeContext = createContext<CustomThemeContextValue | null>(null);

export function CustomThemeProvider({ children }: { children: React.ReactNode }) {
  const [defs, setDefs] = useState<CustomThemeDef[]>([]);
  const [customThemes, setCustomThemes] = useState<ThemeMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 IndexedDB에서 로드
  useEffect(() => {
    dbLoadRegistry()
      .then(async (loaded) => {
        setDefs(loaded);
        const metas = await Promise.all(loaded.map(buildThemeMeta));
        metas.forEach(registerCustomThemeMeta);
        setCustomThemes(metas);
      })
      .catch((e) => { if (import.meta.env.DEV) console.error('[CustomTheme] 로드 실패', e); })
      .finally(() => setIsLoading(false));
  }, []);

  const saveImageGroup = async (
    files: File[],
    prefix: string,
    maxDim: number,
    onProgress?: (step: string) => void,
  ): Promise<string[]> => {
    const ids: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const id = `${prefix}-${Date.now()}-${i}`;
      onProgress?.(`${prefix} ${i + 1}/${files.length} 저장 중...`);
      const blob = await compressImage(files[i], maxDim);
      await dbSaveImage(id, blob);
      ids.push(id);
    }
    return ids;
  };

  const createTheme = useCallback(async ({
    name, emoji, bgFiles, sampleFiles, wsFiles, onProgress,
  }: {
    name: string;
    emoji: string;
    bgFiles: File[];
    sampleFiles: File[];
    wsFiles: File[];
    onProgress?: (step: string) => void;
  }) => {
    const id = `custom-${Date.now()}`;
    onProgress?.('배경 이미지 저장 중...');
    const backgroundImageIds = await saveImageGroup(bgFiles, `${id}-bg`, 1920, onProgress);
    onProgress?.('샘플 이미지 저장 중...');
    const sampleImageIds = await saveImageGroup(sampleFiles, `${id}-sample`, 900, onProgress);
    onProgress?.('학습지 이미지 저장 중...');
    const worksheetImageIds = await saveImageGroup(wsFiles, `${id}-ws`, 1500, onProgress);

    const def: CustomThemeDef = {
      id, name, emoji, createdAt: Date.now(),
      backgroundImageIds, sampleImageIds, worksheetImageIds,
    };

    onProgress?.('테마 등록 중...');
    const newDefs = [...defs, def];
    await dbSaveRegistry(newDefs);
    const meta = await buildThemeMeta(def);
    registerCustomThemeMeta(meta);
    setDefs(newDefs);
    setCustomThemes((prev) => [...prev, meta]);
  }, [defs]);

  const deleteTheme = useCallback(async (id: string) => {
    const def = defs.find((d) => d.id === id);
    if (!def) return;
    const allIds = [
      ...def.backgroundImageIds,
      ...def.sampleImageIds,
      ...def.worksheetImageIds,
    ];
    await dbDeleteImages(allIds);
    // object URL 캐시 정리
    allIds.forEach((imgId) => {
      const url = _objUrlCache.get(imgId);
      if (url) { URL.revokeObjectURL(url); _objUrlCache.delete(imgId); }
    });
    unregisterCustomThemeMeta(id);
    const newDefs = defs.filter((d) => d.id !== id);
    await dbSaveRegistry(newDefs);
    setDefs(newDefs);
    setCustomThemes((prev) => prev.filter((t) => t.id !== id));
  }, [defs]);

  return (
    <CustomThemeContext.Provider value={{ customThemes, isLoading, createTheme, deleteTheme }}>
      {children}
    </CustomThemeContext.Provider>
  );
}

export function useCustomThemes() {
  const ctx = useContext(CustomThemeContext);
  if (!ctx) throw new Error('useCustomThemes: CustomThemeProvider 가 필요합니다.');
  return ctx;
}
