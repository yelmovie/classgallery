/**
 * 독도 테마 자산 경로와 메타데이터.
 * 외부 DB / Supabase / Firebase 미사용. public/assets 의 정적 파일만 사용한다.
 *
 * WORKSHEET_VERSION:
 *  - 활동지/썸네일 PNG 를 새 버전으로 교체했을 때 캐시 우회용 ?v= 쿼리.
 *  - 새 PNG 를 같은 파일명으로 덮어쓴 경우 브라우저 캐시가 옛 이미지를 보여줄 수 있으므로
 *    이 값을 올리면 강제 재로딩된다.
 *  - 형식: YYYYMMDD (오늘 날짜).
 */
export const WORKSHEET_VERSION = '20260512';
const v = `?v=${WORKSHEET_VERSION}`;

export const DOKDO_THEME = {
  id: 'dokdo',
  label: '독도 바다 전시관',
  backgrounds: {
    main: '/assets/themes/dokdo/backgrounds/1.png',
    soft: '/assets/themes/dokdo/backgrounds/2.png',
  },
  samples: Array.from({ length: 9 }, (_, i) => ({
    id: `sample-${i + 1}`,
    url: `/assets/themes/dokdo/samples/${i + 1}.png`,
  })),
  worksheets: [
    { id: 'island',     group: 1, name: '독도섬',   file: `/assets/themes/dokdo/worksheets/1.png${v}`, thumbnail: `/assets/themes/dokdo/thumbnails/1.png${v}` },
    { id: 'sealion',    group: 2, name: '강치',     file: `/assets/themes/dokdo/worksheets/2.png${v}`, thumbnail: `/assets/themes/dokdo/thumbnails/2.png${v}` },
    { id: 'seagull',    group: 3, name: '갈매기',   file: `/assets/themes/dokdo/worksheets/3.png${v}`, thumbnail: `/assets/themes/dokdo/thumbnails/3.png${v}` },
    { id: 'lighthouse', group: 4, name: '등대',     file: `/assets/themes/dokdo/worksheets/4.png${v}`, thumbnail: `/assets/themes/dokdo/thumbnails/4.png${v}` },
    { id: 'flag',       group: 5, name: '깃발',     file: `/assets/themes/dokdo/worksheets/5.png${v}`, thumbnail: `/assets/themes/dokdo/thumbnails/5.png${v}` },
    { id: 'boat',       group: 6, name: '탐험 배',  file: `/assets/themes/dokdo/worksheets/6.png${v}`, thumbnail: `/assets/themes/dokdo/thumbnails/6.png${v}` },
  ],
} as const;

export const MAX_ARTWORKS = 30;

export const SPEED_VALUES: Record<string, number> = {
  paused: 0,
  slow: 0.35,
  normal: 0.7,
  fast: 1.1,
};

export const SPEED_LABELS: Record<string, string> = {
  paused: '멈춤',
  slow: '느리게',
  normal: '보통',
  fast: '빠르게',
};

export const SPOTLIGHT_INTERVAL_MS = 5000;
