import { useEffect, useState } from 'react';
import { extractCharacterCutoutFromUrl } from './extractCharacterCutout';

export interface ProcessedSample {
  id: string;
  /** 배경 제거된 PNG dataURL. 처리 실패 시 원본 URL로 fallback. */
  cutoutUrl: string;
  /** 디버그용: 처리 전 원본 URL. UI에는 노출하지 않는다. */
  originalUrl: string;
}

// 모듈 레벨 캐시 - 페이지 이동/테마 변경해도 같은 URL은 재처리하지 않는다.
const sampleCache = new Map<string, Promise<string>>();

function processSampleOnce(url: string): Promise<string> {
  const existing = sampleCache.get(url);
  if (existing) return existing;
  const promise = extractCharacterCutoutFromUrl(url).catch((err) => {
    console.warn('[sample cutout] 처리 실패, 원본 사용:', url, err);
    return url;
  });
  sampleCache.set(url, promise);
  return promise;
}

/**
 * 주어진 URL 목록의 모든 샘플을 한 번씩만 처리해서 배경 제거된 cutoutUrl 로 반환.
 * URL 이 바뀌면 새 목록을 처리한다. 빈 배열을 주면 빈 결과 반환.
 */
export function useProcessedSamples(urls: string[]): {
  samples: ProcessedSample[];
  isReady: boolean;
} {
  const [samples, setSamples] = useState<ProcessedSample[]>([]);

  // urls 배열 자체는 매 렌더링마다 새 참조일 수 있으므로 join 으로 의존성 안정화
  const urlsKey = urls.join('|');

  useEffect(() => {
    let cancelled = false;
    if (urls.length === 0) {
      setSamples([]);
      return;
    }
    (async () => {
      const results = await Promise.all(
        urls.map(async (url, i) => ({
          id: `sample-${i}-${url}`,
          originalUrl: url,
          cutoutUrl: await processSampleOnce(url),
        })),
      );
      if (!cancelled) setSamples(results);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlsKey]);

  return { samples, isReady: samples.length > 0 };
}
