import { DOKDO_THEME, WORKSHEET_VERSION as DOKDO_WORKSHEET_VERSION } from './dokdoTheme';
import type { ThemeId, ThemeMeta, ThemeBackground } from '../types/theme';

/**
 * 모든 창체 주제팩의 단일 진실 (registry).
 * 두 테마 (dokdo, safeschool) 는 사용 가능, 나머지 4개는 placeholder.
 *
 * 새 테마 추가 시 이 파일에만 등록하면 carousel / /packs / /control / /display 모두 자동 인식한다.
 *
 * 배경 파일이 단순 숫자 명명(1.png~N.png) 이므로 이름은 임의로 분위기 있는 한국어로 매핑.
 * 실제 PNG 그림과 더 맞는 이름이 있다면 이 파일만 수정하면 된다.
 */

// ──────────────────────────────────────────────────────────────────────────
// 독도 바다 — 5장 배경
// ──────────────────────────────────────────────────────────────────────────
const DOKDO_BACKGROUNDS: ThemeBackground[] = [
  { id: 'main',    name: '독도 바다',     file: '/assets/themes/dokdo/backgrounds/1.png' },
  { id: 'soft',    name: '잔잔한 바다',   file: '/assets/themes/dokdo/backgrounds/2.png' },
  { id: 'dawn',    name: '여명',          file: '/assets/themes/dokdo/backgrounds/3.png' },
  { id: 'clouds',  name: '하늘과 구름',   file: '/assets/themes/dokdo/backgrounds/4.png' },
  { id: 'sunset',  name: '노을',          file: '/assets/themes/dokdo/backgrounds/5.png' },
];

const dokdoMeta: ThemeMeta = {
  id: 'dokdo',
  name: '독도 바다',
  englishName: 'Dokdo Ocean',
  emoji: '🏝️',
  status: 'available',
  shortDescription: '독도와 바다 친구들을 색칠하고 전시하는 창체 주제팩',
  backgrounds: DOKDO_BACKGROUNDS,
  defaultBackgroundId: 'main',
  worksheets: DOKDO_THEME.worksheets.map((w) => ({
    id: w.id,
    group: w.group,
    name: w.name,
    displayName: `${w.group}모둠 · ${w.name}`,
    file: w.file,
  })),
  sampleUrls: DOKDO_THEME.samples.map((s) => s.url),
  cropArea: { x: 0.04, y: 0.02, width: 0.92, height: 0.48 },
  exhibitionBadge: '🏝️ 독도 바다 전시관',
  controlTitle: '🏝️ 독도 바다 전시 준비',
};

// ──────────────────────────────────────────────────────────────────────────
// 안전한 학교 — 6장 배경
// ──────────────────────────────────────────────────────────────────────────
const SAFESCHOOL_BACKGROUNDS: ThemeBackground[] = [
  { id: 'campus',    name: '학교 전경',     file: '/assets/themes/safeschool/backgrounds/1.png' },
  { id: 'hallway',   name: '복도',          file: '/assets/themes/safeschool/backgrounds/2.png' },
  { id: 'pe',        name: '운동장·체육',   file: '/assets/themes/safeschool/backgrounds/3.png' },
  { id: 'science',   name: '과학실',        file: '/assets/themes/safeschool/backgrounds/4.png' },
  { id: 'traffic',   name: '등하교 교통',   file: '/assets/themes/safeschool/backgrounds/5.png' },
  { id: 'classroom', name: '교실 도구',     file: '/assets/themes/safeschool/backgrounds/6.png' },
];

const SAFESCHOOL_BASE_WS = '/assets/themes/safeschool/worksheets';

// 샘플 파일명에 한글·공백·괄호가 포함되어 있어 명시적으로 encodeURI 처리.
const safeschoolSampleFile = (name: string): string =>
  encodeURI(`/assets/themes/safeschool/samples/${name}`);

const SAFESCHOOL_SAMPLE_URLS = [
  'ChatGPT Image 2026년 5월 12일 오후 07_48_29 (1).png',
  'ChatGPT Image 2026년 5월 12일 오후 07_48_30 (2).png',
  'ChatGPT Image 2026년 5월 12일 오후 07_48_31 (3).png',
  'ChatGPT Image 2026년 5월 12일 오후 07_48_32 (4).png',
  'ChatGPT Image 2026년 5월 12일 오후 07_49_09.png',
  'ChatGPT Image 2026년 5월 12일 오후 07_49_17.png',
].map(safeschoolSampleFile);

const safeschoolWorksheets = [
  { id: 'science-lab',        group: 1, name: '과학실 안전',           file: `${SAFESCHOOL_BASE_WS}/1.png?v=${DOKDO_WORKSHEET_VERSION}` },
  { id: 'fire-extinguisher',  group: 2, name: '소화기 안전',           file: `${SAFESCHOOL_BASE_WS}/2.png?v=${DOKDO_WORKSHEET_VERSION}` },
  { id: 'hallway',            group: 3, name: '복도 안전',             file: `${SAFESCHOOL_BASE_WS}/3.png?v=${DOKDO_WORKSHEET_VERSION}` },
  { id: 'tools',              group: 4, name: '가위·도구 사용 안전',   file: `${SAFESCHOOL_BASE_WS}/4.png?v=${DOKDO_WORKSHEET_VERSION}` },
  { id: 'commute-traffic',    group: 5, name: '등하교 교통안전',       file: `${SAFESCHOOL_BASE_WS}/5.png?v=${DOKDO_WORKSHEET_VERSION}` },
  { id: 'pe-class',           group: 6, name: '체육시간 안전',         file: `${SAFESCHOOL_BASE_WS}/6.png?v=${DOKDO_WORKSHEET_VERSION}` },
];

const safeschoolMeta: ThemeMeta = {
  id: 'safeschool',
  name: '안전한 학교',
  englishName: 'Safe School',
  emoji: '🏫',
  status: 'available',
  shortDescription: '학교생활 속 안전 약속을 색칠하고 전시하는 창체 주제팩',
  description:
    '학교생활 속 여러 안전 상황을 주제로 학생들이 안전 약속을 쓰고, 색칠한 안전 캐릭터를 전시 화면에 띄우는 창체 주제팩입니다.',
  backgrounds: SAFESCHOOL_BACKGROUNDS,
  defaultBackgroundId: 'campus',
  worksheets: safeschoolWorksheets.map((w) => ({
    id: w.id,
    group: w.group,
    name: w.name,
    displayName: `${w.group}모둠 · ${w.name}`,
    file: w.file,
  })),
  sampleUrls: SAFESCHOOL_SAMPLE_URLS,
  cropArea: { x: 0.06, y: 0.03, width: 0.88, height: 0.47 },
  exhibitionBadge: '🏫 안전한 학교 전시관',
  controlTitle: '🏫 안전한 학교 전시 준비',
};

// ──────────────────────────────────────────────────────────────────────────
// 환경교육 (지구를 위한 나의 약속) — 7장 배경 / 7장 학습지 / 7장 샘플
// ──────────────────────────────────────────────────────────────────────────
const SAVEEARTH_BACKGROUNDS: ThemeBackground[] = [
  { id: 'meadow',   name: '초원',      file: '/assets/themes/saveearth/backgrounds/1.png' },
  { id: 'forest',   name: '숲',        file: '/assets/themes/saveearth/backgrounds/2.png' },
  { id: 'ocean',    name: '바다',      file: '/assets/themes/saveearth/backgrounds/3.png' },
  { id: 'sky',      name: '맑은 하늘', file: '/assets/themes/saveearth/backgrounds/4.png' },
  { id: 'park',     name: '공원',      file: '/assets/themes/saveearth/backgrounds/5.png' },
  { id: 'sunlight', name: '햇살',      file: '/assets/themes/saveearth/backgrounds/6.png' },
  { id: 'earth',    name: '지구',      file: '/assets/themes/saveearth/backgrounds/7.png' },
];

const SAVEEARTH_BASE_WS = '/assets/themes/saveearth/worksheets';
const SAVEEARTH_VER = '20260513';
const sev = `?v=${SAVEEARTH_VER}`;

const saveearthWorksheets = [
  { id: 'promise-1', group: 1, name: '지구 사랑 1', file: `${SAVEEARTH_BASE_WS}/1.png${sev}` },
  { id: 'promise-2', group: 2, name: '지구 사랑 2', file: `${SAVEEARTH_BASE_WS}/2.png${sev}` },
  { id: 'promise-3', group: 3, name: '지구 사랑 3', file: `${SAVEEARTH_BASE_WS}/3.png${sev}` },
  { id: 'promise-4', group: 4, name: '에너지 절약 1', file: `${SAVEEARTH_BASE_WS}/4.png${sev}` },
  { id: 'promise-5', group: 5, name: '지구 친구', file: `${SAVEEARTH_BASE_WS}/5.png${sev}` },
  { id: 'promise-6', group: 6, name: '식물 가꾸기', file: `${SAVEEARTH_BASE_WS}/6.png${sev}` },
  { id: 'promise-7', group: 7, name: '에너지 절약 2', file: `${SAVEEARTH_BASE_WS}/7.png${sev}` },
];

const SAVEEARTH_SAMPLE_URLS = Array.from({ length: 7 }, (_, i) =>
  `/assets/themes/saveearth/samples/${i + 1}.png`,
);

const saveearthMeta: ThemeMeta = {
  id: 'saveearth',
  name: '환경교육',
  englishName: 'Save Earth',
  emoji: '🌍',
  status: 'available',
  shortDescription: '환경을 지키는 약속을 색칠하고 전시하는 주제',
  description:
    '환경을 지키기 위해 내가 실천할 일을 생각하고, 이유와 다짐을 표현해요. 색칠한 캐릭터가 자연 배경 위에 살아 움직입니다.',
  backgrounds: SAVEEARTH_BACKGROUNDS,
  defaultBackgroundId: 'meadow',
  worksheets: saveearthWorksheets.map((w) => ({
    id: w.id,
    group: w.group,
    name: w.name,
    displayName: `${w.group}모둠 · ${w.name}`,
    file: w.file,
  })),
  sampleUrls: SAVEEARTH_SAMPLE_URLS,
  cropArea: { x: 0.04, y: 0.02, width: 0.92, height: 0.48 },
  exhibitionBadge: '🌍 환경교육 전시관',
  controlTitle: '🌍 환경교육 전시 준비',
};

// ──────────────────────────────────────────────────────────────────────────
// 다문화이해교육 (서로 달라도 함께 빛나요) — 5장 배경 / 5장 학습지 / 6장 샘플
// ──────────────────────────────────────────────────────────────────────────
const CULTURE_BACKGROUNDS: ThemeBackground[] = [
  { id: 'world',     name: '세계 마을',  file: '/assets/themes/culture/backgrounds/1.png' },
  { id: 'festival',  name: '축제',       file: '/assets/themes/culture/backgrounds/2.png' },
  { id: 'classroom', name: '함께하는 교실', file: '/assets/themes/culture/backgrounds/3.png' },
  { id: 'rainbow',   name: '무지개 길',  file: '/assets/themes/culture/backgrounds/4.png' },
  { id: 'sky',       name: '맑은 하늘',  file: '/assets/themes/culture/backgrounds/5.png' },
];

const CULTURE_BASE_WS = '/assets/themes/culture/worksheets';
const CULTURE_VER = '20260513';
const cv = `?v=${CULTURE_VER}`;

const cultureWorksheets = [
  { id: 'culture-1', group: 1, name: '함께하는 친구 1', file: `${CULTURE_BASE_WS}/1.png${cv}` },
  { id: 'culture-2', group: 2, name: '함께하는 친구 2', file: `${CULTURE_BASE_WS}/2.png${cv}` },
  { id: 'culture-3', group: 3, name: '함께하는 친구 3', file: `${CULTURE_BASE_WS}/3.png${cv}` },
  { id: 'culture-4', group: 4, name: '함께하는 친구 4', file: `${CULTURE_BASE_WS}/4.png${cv}` },
  { id: 'culture-5', group: 5, name: '함께하는 친구 5', file: `${CULTURE_BASE_WS}/5.png${cv}` },
];

const CULTURE_SAMPLE_URLS = Array.from({ length: 6 }, (_, i) =>
  `/assets/themes/culture/samples/${i + 1}.png`,
);

const cultureMeta: ThemeMeta = {
  id: 'culture',
  name: '다문화이해교육',
  englishName: 'Multicultural Understanding',
  emoji: '🌏',
  status: 'available',
  shortDescription: '서로 다른 문화를 존중하는 마음을 색칠하고 전시하는 주제',
  description:
    '나와 다른 문화를 존중하고, 함께 어울리는 방법을 배워요. 색칠한 친구들이 세계 마을 배경 위에 살아 움직입니다.',
  backgrounds: CULTURE_BACKGROUNDS,
  defaultBackgroundId: 'world',
  worksheets: cultureWorksheets.map((w) => ({
    id: w.id,
    group: w.group,
    name: w.name,
    displayName: `${w.group}모둠 · ${w.name}`,
    file: w.file,
  })),
  sampleUrls: CULTURE_SAMPLE_URLS,
  cropArea: { x: 0.04, y: 0.02, width: 0.92, height: 0.48 },
  exhibitionBadge: '🌏 다문화이해교육 전시관',
  controlTitle: '🌏 다문화이해교육 전시 준비',
};

// ──────────────────────────────────────────────────────────────────────────
// 친구사랑교육 (친구야, 함께해서 좋아) — 5장 배경 / 5장 학습지 / 6장 샘플
// ──────────────────────────────────────────────────────────────────────────
const FRIEND_BACKGROUNDS: ThemeBackground[] = [
  { id: 'playground', name: '운동장',     file: '/assets/themes/friend/backgrounds/1.png' },
  { id: 'classroom',  name: '교실',       file: '/assets/themes/friend/backgrounds/2.png' },
  { id: 'park',       name: '공원',       file: '/assets/themes/friend/backgrounds/3.png' },
  { id: 'sunny',      name: '햇살 가득',  file: '/assets/themes/friend/backgrounds/4.png' },
  { id: 'heart',      name: '마음 풍경',  file: '/assets/themes/friend/backgrounds/5.png' },
];

const FRIEND_BASE_WS = '/assets/themes/friend/worksheets';
const FRIEND_VER = '20260513';
const fv = `?v=${FRIEND_VER}`;

const friendWorksheets = [
  { id: 'friend-1', group: 1, name: '친구야, 함께해서 좋아',  file: `${FRIEND_BASE_WS}/1.png${fv}` },
  { id: 'friend-2', group: 2, name: '함께 보면 더 즐거워요',  file: `${FRIEND_BASE_WS}/2.png${fv}` },
  { id: 'friend-3', group: 3, name: '마음을 나누는 우리',     file: `${FRIEND_BASE_WS}/3.png${fv}` },
  { id: 'friend-4', group: 4, name: '나누면 더 커지는 우정',  file: `${FRIEND_BASE_WS}/4.png${fv}` },
  { id: 'friend-5', group: 5, name: '우리 반 우정 약속',      file: `${FRIEND_BASE_WS}/5.png${fv}` },
];

const FRIEND_SAMPLE_URLS = Array.from({ length: 6 }, (_, i) =>
  `/assets/themes/friend/samples/${i + 1}.png`,
);

const friendMeta: ThemeMeta = {
  id: 'friend',
  name: '친구사랑교육',
  englishName: 'Friendship & Care',
  emoji: '💗',
  status: 'available',
  shortDescription: '친구를 배려하고 함께하는 마음을 색칠하고 전시하는 주제',
  description:
    '친구의 마음을 존중하고, 서로 배려하며 함께 지내는 방법을 배워요. 색칠한 친구들이 따뜻한 배경 위에 살아 움직입니다.',
  backgrounds: FRIEND_BACKGROUNDS,
  defaultBackgroundId: 'playground',
  worksheets: friendWorksheets.map((w) => ({
    id: w.id,
    group: w.group,
    name: w.name,
    displayName: `${w.group}모둠 · ${w.name}`,
    file: w.file,
  })),
  sampleUrls: FRIEND_SAMPLE_URLS,
  cropArea: { x: 0.04, y: 0.02, width: 0.92, height: 0.48 },
  exhibitionBadge: '💗 친구사랑교육 전시관',
  controlTitle: '💗 친구사랑교육 전시 준비',
};

const placeholderTheme = (
  id: ThemeId,
  name: string,
  emoji: string,
  gradient: string,
): ThemeMeta => ({
  id,
  name,
  emoji,
  status: 'coming-soon',
  shortDescription: '추가 예정',
  placeholderGradient: gradient,
});

export const THEME_LIST: ThemeMeta[] = [
  dokdoMeta,
  safeschoolMeta,
  saveearthMeta,
  cultureMeta,
  friendMeta,
  placeholderTheme('earth',  '지구 회복 숲',   '🌲', 'linear-gradient(135deg, #a0e7a0, #5fa896)'),
  placeholderTheme('mind',   '마음 정원',      '🌸', 'linear-gradient(135deg, #ffc6ff, #bdb2ff)'),
  placeholderTheme('future', '미래 직업 도시', '🌆', 'linear-gradient(135deg, #a0c4ff, #9bf6ff)'),
  placeholderTheme('world',  '세계 마을 축제', '🌍', 'linear-gradient(135deg, #fdffb6, #ffd6a5)'),
];

export const THEMES_BY_ID: Record<ThemeId, ThemeMeta> = THEME_LIST.reduce(
  (acc, t) => {
    acc[t.id] = t;
    return acc;
  },
  {} as Record<ThemeId, ThemeMeta>,
);

export function getThemeMeta(id: ThemeId | string | null | undefined): ThemeMeta {
  if (id && (id as ThemeId) in THEMES_BY_ID) return THEMES_BY_ID[id as ThemeId];
  return dokdoMeta;
}

export const DEFAULT_THEME_ID: ThemeId = 'dokdo';
