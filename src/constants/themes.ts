import { DOKDO_THEME, WORKSHEET_VERSION as DOKDO_WORKSHEET_VERSION } from './dokdoTheme';
import type { ThemeId, ThemeMeta, ThemeBackground, ThemeWorksheet } from '../types/theme';

type WorksheetSeed = {
  id: string;
  group: number;
  name: string;
  file: string;
};

const numberedThemeAssetUrls = (
  themeId: string,
  folder: 'samples' | 'worksheets' | 'backgrounds',
  count: number,
): string[] => Array.from(
  { length: count },
  (_, i) => `/assets/themes/${themeId}/${folder}/${i + 1}.png`,
);

const makeVersionedAssetFile = (basePath: string, index: number, version: string): string =>
  `${basePath}/${index}.png?v=${version}`;

const makeThemeWorksheets = (worksheets: readonly WorksheetSeed[]): ThemeWorksheet[] =>
  worksheets.map((w) => ({
    id: w.id,
    group: w.group,
    name: w.name,
    displayName: `${w.group} - ${w.name}`,
    file: w.file,
  }));

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
  worksheets: makeThemeWorksheets(DOKDO_THEME.worksheets),
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
  { id: 'science-lab',        group: 1, name: '과학실 안전',           file: makeVersionedAssetFile(SAFESCHOOL_BASE_WS, 1, DOKDO_WORKSHEET_VERSION) },
  { id: 'fire-extinguisher',  group: 2, name: '소화기 안전',           file: makeVersionedAssetFile(SAFESCHOOL_BASE_WS, 2, DOKDO_WORKSHEET_VERSION) },
  { id: 'hallway',            group: 3, name: '복도 안전',             file: makeVersionedAssetFile(SAFESCHOOL_BASE_WS, 3, DOKDO_WORKSHEET_VERSION) },
  { id: 'tools',              group: 4, name: '가위·도구 사용 안전',   file: makeVersionedAssetFile(SAFESCHOOL_BASE_WS, 4, DOKDO_WORKSHEET_VERSION) },
  { id: 'commute-traffic',    group: 5, name: '등하교 교통안전',       file: makeVersionedAssetFile(SAFESCHOOL_BASE_WS, 5, DOKDO_WORKSHEET_VERSION) },
  { id: 'pe-class',           group: 6, name: '체육시간 안전',         file: makeVersionedAssetFile(SAFESCHOOL_BASE_WS, 6, DOKDO_WORKSHEET_VERSION) },
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
  worksheets: makeThemeWorksheets(safeschoolWorksheets),
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

const SAVEEARTH_SAMPLE_URLS = numberedThemeAssetUrls('saveearth', 'samples', 7);

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
  worksheets: makeThemeWorksheets(saveearthWorksheets),
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
  { id: 'culture-6', group: 6, name: '함께하는 친구 6', file: `${CULTURE_BASE_WS}/6.png${cv}` },
  { id: 'culture-7', group: 7, name: '함께하는 친구 7', file: `${CULTURE_BASE_WS}/7.png${cv}` },
  { id: 'culture-8', group: 8, name: '함께하는 친구 8', file: `${CULTURE_BASE_WS}/8.png${cv}` },
];

const CULTURE_SAMPLE_URLS = numberedThemeAssetUrls('culture', 'samples', 6);

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
  worksheets: makeThemeWorksheets(cultureWorksheets),
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

const FRIEND_SAMPLE_URLS = numberedThemeAssetUrls('friend', 'samples', 6);

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
  worksheets: makeThemeWorksheets(friendWorksheets),
  sampleUrls: FRIEND_SAMPLE_URLS,
  cropArea: { x: 0.04, y: 0.02, width: 0.92, height: 0.48 },
  exhibitionBadge: '💗 친구사랑교육 전시관',
  controlTitle: '💗 친구사랑교육 전시 준비',
};

// ──────────────────────────────────────────────────────────────────────────
// 학교폭력예방교육 (친구를 지키는 나의 약속) — 5장 배경 / 10장 학습지 / 10장 샘플
// ──────────────────────────────────────────────────────────────────────────
const NOVIOLENCE_BACKGROUNDS: ThemeBackground[] = [
  { id: 'hallway',    name: '학교 복도',  file: '/assets/themes/noviolence/backgrounds/1.png' },
  { id: 'classroom',  name: '교실',       file: '/assets/themes/noviolence/backgrounds/2.png' },
  { id: 'counseling', name: '상담 공간',  file: '/assets/themes/noviolence/backgrounds/3.png' },
  { id: 'library',    name: '독서 공간',  file: '/assets/themes/noviolence/backgrounds/4.png' },
  { id: 'playground', name: '운동장',     file: '/assets/themes/noviolence/backgrounds/5.png' },
];

const NOVIOLENCE_BASE_WS = '/assets/themes/noviolence/worksheets';
const NOVIOLENCE_VER = '20260513';
const nv = `?v=${NOVIOLENCE_VER}`;

const noviolenceWorksheets = [
  { id: 'hallway-kindness',      group: 1,  name: '복도에서는 서로 배려해요',       file: `${NOVIOLENCE_BASE_WS}/1.png${nv}` },
  { id: 'ask-for-help',          group: 2,  name: '힘들면 바로 알려요',              file: `${NOVIOLENCE_BASE_WS}/2.png${nv}` },
  { id: 'classroom-respect',     group: 3,  name: '교실에서는 존중해요',             file: `${NOVIOLENCE_BASE_WS}/3.png${nv}` },
  { id: 'kind-words',            group: 4,  name: '말 한마디도 중요해요',            file: `${NOVIOLENCE_BASE_WS}/4.png${nv}` },
  { id: 'honest-feelings',       group: 5,  name: '내 마음을 솔직하게 말해요',       file: `${NOVIOLENCE_BASE_WS}/5.png${nv}` },
  { id: 'courage-to-ask',        group: 6,  name: '도움 요청은 용기예요',            file: `${NOVIOLENCE_BASE_WS}/6.png${nv}` },
  { id: 'not-alone',             group: 7,  name: '혼자 두지 않아요',               file: `${NOVIOLENCE_BASE_WS}/7.png${nv}` },
  { id: 'listen-to-friend',      group: 8,  name: '친구의 이야기를 들어요',          file: `${NOVIOLENCE_BASE_WS}/8.png${nv}` },
  { id: 'play-together',         group: 9,  name: '운동장에서도 함께 놀아요',        file: `${NOVIOLENCE_BASE_WS}/9.png${nv}` },
  { id: 'resolve-with-dialogue', group: 10, name: '갈등은 대화로 풀어요',           file: `${NOVIOLENCE_BASE_WS}/10.png${nv}` },
];

const NOVIOLENCE_SAMPLE_URLS = numberedThemeAssetUrls('noviolence', 'samples', 10);

const noviolenceMeta: ThemeMeta = {
  id: 'noviolence',
  name: '학교폭력예방교육',
  englishName: 'School Violence Prevention',
  emoji: '🤝',
  status: 'available',
  shortDescription: '친구를 배려하고 안전한 학교를 만들기 위한 말과 행동을 배워요.',
  description:
    '친구를 배려하고 안전한 학교를 만들기 위해 내가 실천할 일을 생각하고, 이유와 다짐이 드러나게 써 봅시다. 색칠한 캐릭터가 따뜻한 학교 배경 위에 살아 움직입니다.',
  backgrounds: NOVIOLENCE_BACKGROUNDS,
  defaultBackgroundId: 'hallway',
  worksheets: makeThemeWorksheets(noviolenceWorksheets),
  sampleUrls: NOVIOLENCE_SAMPLE_URLS,
  cropArea: { x: 0.04, y: 0.02, width: 0.92, height: 0.48 },
  exhibitionBadge: '🤝 학교폭력예방교육 전시관',
  controlTitle: '🤝 학교폭력예방교육 전시 준비',
};

// ──────────────────────────────────────────────────────────────────────────
// 여름방학 계기교육 — 6장 배경 / 10장 학습지 / 10장 샘플
// crop guide: public/assets/themes/summer/guides/20260526-summer-vacation-crop-guide-v1.json
// characterCropArea: { x:0.04, y:0.02, width:0.92, height:0.48 }
// ──────────────────────────────────────────────────────────────────────────
const SUMMER_BACKGROUNDS: ThemeBackground[] = [
  { id: 'main',     name: '여름 풍경',    file: '/assets/themes/summer/backgrounds/1.png' },
  { id: 'water',    name: '물놀이 장소',  file: '/assets/themes/summer/backgrounds/2.png' },
  { id: 'park',     name: '공원',         file: '/assets/themes/summer/backgrounds/3.png' },
  { id: 'camping',  name: '캠핑장',       file: '/assets/themes/summer/backgrounds/4.png' },
  { id: 'home',     name: '집 안',        file: '/assets/themes/summer/backgrounds/5.png' },
  { id: 'outdoor',  name: '야외 활동',    file: '/assets/themes/summer/backgrounds/6.png' },
];

const SUMMER_BASE_WS = '/assets/themes/summer/worksheets';
const SUMMER_VER = '20260526';
const sv = `?v=${SUMMER_VER}`;

const summerWorksheets = [
  { id: 'water-safety',      group: 1,  name: '물놀이 안전',          file: `${SUMMER_BASE_WS}/1.png${sv}` },
  { id: 'sun-heat-safety',   group: 2,  name: '햇볕과 폭염 안전',     file: `${SUMMER_BASE_WS}/2.png${sv}` },
  { id: 'hydration',         group: 3,  name: '물을 자주 마셔요',     file: `${SUMMER_BASE_WS}/3.png${sv}` },
  { id: 'bike-safety',       group: 4,  name: '자전거 안전',          file: `${SUMMER_BASE_WS}/4.png${sv}` },
  { id: 'traffic-safety',    group: 5,  name: '교통안전',             file: `${SUMMER_BASE_WS}/5.png${sv}` },
  { id: 'stranger-safety',   group: 6,  name: '낯선 사람 조심',       file: `${SUMMER_BASE_WS}/6.png${sv}` },
  { id: 'outdoor-safety',    group: 7,  name: '야외활동 안전',        file: `${SUMMER_BASE_WS}/7.png${sv}` },
  { id: 'home-safety',       group: 8,  name: '집에서도 안전',        file: `${SUMMER_BASE_WS}/8.png${sv}` },
  { id: 'buddy-safety',      group: 9,  name: '친구와 함께 안전하게', file: `${SUMMER_BASE_WS}/9.png${sv}` },
  { id: 'safety-promise',    group: 10, name: '안전한 여름방학 약속', file: `${SUMMER_BASE_WS}/10.png${sv}` },
];

const SUMMER_SAMPLE_URLS = numberedThemeAssetUrls('summer', 'samples', 10);

const summerMeta: ThemeMeta = {
  id: 'summer',
  name: '여름방학 계기교육',
  englishName: 'Summer Vacation Safety',
  emoji: '☀️',
  status: 'available',
  shortDescription: '여름방학 안전수칙을 색칠 학습지와 전시 활동으로 표현해요.',
  description:
    '물놀이, 폭염, 교통, 야외활동 등 여름방학 안전 약속을 색칠하고 다짐해요. 색칠한 캐릭터가 시원한 여름 배경 위에 살아 움직입니다.',
  backgrounds: SUMMER_BACKGROUNDS,
  defaultBackgroundId: 'main',
  worksheets: makeThemeWorksheets(summerWorksheets),
  sampleUrls: SUMMER_SAMPLE_URLS,
  cropArea: { x: 0.04, y: 0.02, width: 0.92, height: 0.48 },
  exhibitionBadge: '☀️ 여름방학 계기교육 전시관',
  controlTitle: '☀️ 여름방학 계기교육 전시 준비',
};

// ──────────────────────────────────────────────────────────────────────────
// 민주시민 계기교육 — 5장 배경 / 10장 학습지 / 10장 샘플
// crop guide: public/assets/themes/civic/guides/20260526-democratic-citizenship-crop-guide-v1.json
// characterCropArea: { x:0.04, y:0.02, width:0.92, height:0.48 }
// 학습지 상단(0~0.5) 캐릭터 영역만 전시. 제목/글쓰기 박스(0.5~)는 전시에서 제외.
// NOTE: crop 기준 변경 시 이미 업로드된 학습지의 cutoutUrl 캐싱은 무효화되므로
// 사용자에게 전체 삭제 후 재업로드 안내 필요.
// ──────────────────────────────────────────────────────────────────────────
const CIVIC_BACKGROUNDS: ThemeBackground[] = [
  { id: 'main',      name: '광장의 약속',   file: '/assets/themes/civic/backgrounds/1.png' },
  { id: 'soft',      name: '햇살 광장',     file: '/assets/themes/civic/backgrounds/2.png' },
  { id: 'classroom', name: '함께하는 교실', file: '/assets/themes/civic/backgrounds/3.png' },
  { id: 'community', name: '우리 마을',     file: '/assets/themes/civic/backgrounds/4.png' },
  { id: 'rules',     name: '약속과 규칙',   file: '/assets/themes/civic/backgrounds/5.png' },
];

const CIVIC_BASE_WS = '/assets/themes/civic/worksheets';
const CIVIC_VER = '20260526';
const cvc = `?v=${CIVIC_VER}`;

const civicWorksheets = [
  { id: 'opinion-expression',  group: 1,  name: '내 의견을 자신 있게 말해요',  file: `${CIVIC_BASE_WS}/1.png${cvc}` },
  { id: 'active-listening',    group: 2,  name: '친구의 의견을 잘 들어요',     file: `${CIVIC_BASE_WS}/2.png${cvc}` },
  { id: 'discussion-solving',  group: 3,  name: '함께 토의하며 해결해요',      file: `${CIVIC_BASE_WS}/3.png${cvc}` },
  { id: 'fair-voting',         group: 4,  name: '공정하게 투표해요',           file: `${CIVIC_BASE_WS}/4.png${cvc}` },
  { id: 'rules-and-promises',  group: 5,  name: '약속과 규칙을 지켜요',        file: `${CIVIC_BASE_WS}/5.png${cvc}` },
  { id: 'care-and-help',       group: 6,  name: '서로 배려하고 도와요',        file: `${CIVIC_BASE_WS}/6.png${cvc}` },
  { id: 'responsible-action',  group: 7,  name: '책임 있게 행동해요',          file: `${CIVIC_BASE_WS}/7.png${cvc}` },
  { id: 'community-care',      group: 8,  name: '우리 공동체를 아껴요',        file: `${CIVIC_BASE_WS}/8.png${cvc}` },
  { id: 'respect-differences', group: 9,  name: '서로 다르지만 모두 소중해요', file: `${CIVIC_BASE_WS}/9.png${cvc}` },
  { id: 'citizen-promise',     group: 10, name: '나는 민주시민으로 약속해요',  file: `${CIVIC_BASE_WS}/10.png${cvc}` },
];

const CIVIC_SAMPLE_URLS = numberedThemeAssetUrls('civic', 'samples', 10);

const civicMeta: ThemeMeta = {
  id: 'civic',
  name: '민주시민 계기교육',
  englishName: 'Democratic Citizenship',
  emoji: '🗳️',
  status: 'available',
  shortDescription: '의견·경청·토의·투표·배려·책임을 색칠하고 전시하는 창체 주제팩',
  description:
    '초등학생이 의견 표현, 경청, 토의, 투표, 약속과 규칙, 배려와 협동, 책임 있는 행동, 공동체 의식, 다양성 존중, 민주시민 다짐을 익히는 창체 주제팩이에요. 색칠한 캐릭터가 민주시민 배경 위에 살아 움직입니다.',
  backgrounds: CIVIC_BACKGROUNDS,
  defaultBackgroundId: 'main',
  worksheets: makeThemeWorksheets(civicWorksheets),
  sampleUrls: CIVIC_SAMPLE_URLS,
  cropArea: { x: 0.04, y: 0.02, width: 0.92, height: 0.48 },
  exhibitionBadge: '🗳️ 민주시민 계기교육 전시관',
  controlTitle: '🗳️ 민주시민 계기교육 전시 준비',
};

// ──────────────────────────────────────────────────────────────────────────
// 정보통신윤리 계기교육 — 5장 배경 / 10장 학습지 / 10장 샘플
// 폴더명은 aiethnic (실제 디스크 기준). themeId, asset path 모두 'aiethnic' 으로 통일.
// crop guide: public/assets/themes/aiethnic/guides/20260526-info-ethics-crop-guide-v1.json
// characterCropArea: { x:0.04, y:0.02, width:0.92, height:0.48 }
// 학습지 상단(0~0.5) 캐릭터 영역만 전시. 제목/글쓰기 박스(0.5~)는 전시에서 제외.
// NOTE: crop 기준 변경 시 이미 업로드된 학습지의 cutoutUrl 캐싱은 무효화되므로
// 사용자에게 전체 삭제 후 재업로드 안내 필요.
// ──────────────────────────────────────────────────────────────────────────
const AIETHNIC_BACKGROUNDS: ThemeBackground[] = [
  { id: 'main',     name: '디지털 광장',    file: '/assets/themes/aiethnic/backgrounds/1.png' },
  { id: 'soft',     name: '맑은 화면',      file: '/assets/themes/aiethnic/backgrounds/2.png' },
  { id: 'network',  name: '연결된 세상',    file: '/assets/themes/aiethnic/backgrounds/3.png' },
  { id: 'shield',   name: '안전한 인터넷',  file: '/assets/themes/aiethnic/backgrounds/4.png' },
  { id: 'promise',  name: '약속의 공간',    file: '/assets/themes/aiethnic/backgrounds/5.png' },
];

const AIETHNIC_BASE_WS = '/assets/themes/aiethnic/worksheets';
const AIETHNIC_VER = '20260526';
const aev = `?v=${AIETHNIC_VER}`;

const aiethnicWorksheets = [
  { id: 'smart-device-promise',    group: 1,  name: '스마트 기기를 바르게 사용해요', file: `${AIETHNIC_BASE_WS}/1.png${aev}` },
  { id: 'kind-comments',           group: 2,  name: '댓글도 예쁘게 써요',            file: `${AIETHNIC_BASE_WS}/2.png${aev}` },
  { id: 'personal-info-protection',group: 3,  name: '개인정보를 소중히 지켜요',      file: `${AIETHNIC_BASE_WS}/3.png${aev}` },
  { id: 'copyright-respect',       group: 4,  name: '저작권을 존중해요',             file: `${AIETHNIC_BASE_WS}/4.png${aev}` },
  { id: 'prevent-fake-news',       group: 5,  name: '거짓 정보는 다시 확인해요',     file: `${AIETHNIC_BASE_WS}/5.png${aev}` },
  { id: 'healthy-screen-time',     group: 6,  name: '디지털 기기를 건강하게 써요',   file: `${AIETHNIC_BASE_WS}/6.png${aev}` },
  { id: 'cyberbullying-stop',      group: 7,  name: '사이버 괴롭힘을 멈춰요',        file: `${AIETHNIC_BASE_WS}/7.png${aev}` },
  { id: 'safe-password',           group: 8,  name: '안전한 비밀번호를 사용해요',    file: `${AIETHNIC_BASE_WS}/8.png${aev}` },
  { id: 'online-respect',          group: 9,  name: '온라인에서도 서로 존중해요',    file: `${AIETHNIC_BASE_WS}/9.png${aev}` },
  { id: 'digital-ethics-promise',  group: 10, name: '정보통신 윤리를 약속해요',      file: `${AIETHNIC_BASE_WS}/10.png${aev}` },
];

const AIETHNIC_SAMPLE_URLS = numberedThemeAssetUrls('aiethnic', 'samples', 10);

const aiethnicMeta: ThemeMeta = {
  id: 'aiethnic',
  name: '정보통신윤리 계기교육',
  englishName: 'Digital Citizenship & Info Ethics',
  emoji: '💻',
  status: 'available',
  shortDescription: '바른 디지털 사용·댓글 예절·개인정보·저작권을 색칠하고 전시하는 창체 주제팩',
  description:
    '초등학생이 스마트 기기 바른 사용, 댓글 예절, 개인정보 보호, 저작권 존중, 거짓 정보 확인, 건강한 디지털 습관, 사이버 괴롭힘 예방, 안전한 비밀번호, 온라인 존중, 정보통신 윤리 다짐을 익히는 창체 주제팩이에요.',
  backgrounds: AIETHNIC_BACKGROUNDS,
  defaultBackgroundId: 'main',
  worksheets: makeThemeWorksheets(aiethnicWorksheets),
  sampleUrls: AIETHNIC_SAMPLE_URLS,
  cropArea: { x: 0.04, y: 0.02, width: 0.92, height: 0.48 },
  exhibitionBadge: '💻 정보통신윤리 계기교육 전시관',
  controlTitle: '💻 정보통신윤리 계기교육 전시 준비',
};

// ──────────────────────────────────────────────────────────────────────────
// 스마트폰예방교육 계기교육 — 5장 배경 / 10장 학습지 / 10장 샘플
// 폴더명은 smartphone (실제 디스크 기준). themeId, asset path 모두 'smartphone' 으로 통일.
// crop guide: public/assets/themes/smartphone/guides/20260526-smartphone-habits-crop-guide-v1.json
// characterCropArea: { x:0.04, y:0.02, width:0.92, height:0.48 }
// 학습지 상단(0~0.5) 캐릭터 영역만 전시. 제목/글쓰기 박스(0.5~)는 전시에서 제외.
// NOTE: crop 기준 변경 시 이미 업로드된 학습지의 cutoutUrl 캐싱은 무효화되므로
// 사용자에게 전체 삭제 후 재업로드 안내 필요.
// ──────────────────────────────────────────────────────────────────────────
const SMARTPHONE_BACKGROUNDS: ThemeBackground[] = [
  { id: 'main',     name: '바른 사용 공간',  file: '/assets/themes/smartphone/backgrounds/1.png' },
  { id: 'home',     name: '집 안',          file: '/assets/themes/smartphone/backgrounds/2.png' },
  { id: 'study',    name: '공부방',         file: '/assets/themes/smartphone/backgrounds/3.png' },
  { id: 'outdoor',  name: '안전한 길거리',  file: '/assets/themes/smartphone/backgrounds/4.png' },
  { id: 'promise',  name: '약속의 공간',    file: '/assets/themes/smartphone/backgrounds/5.png' },
];

const SMARTPHONE_BASE_WS = '/assets/themes/smartphone/worksheets';
const SMARTPHONE_VER = '20260526';
const spv = `?v=${SMARTPHONE_VER}`;

const smartphoneWorksheets = [
  { id: 'screen-time-promise',        group: 1,  name: '스마트폰 사용 시간을 정해요',   file: `${SMARTPHONE_BASE_WS}/1.png${spv}` },
  { id: 'good-posture',               group: 2,  name: '바른 자세로 사용해요',          file: `${SMARTPHONE_BASE_WS}/2.png${spv}` },
  { id: 'eye-rest',                   group: 3,  name: '눈도 쉬어야 해요',              file: `${SMARTPHONE_BASE_WS}/3.png${spv}` },
  { id: 'family-rules',               group: 4,  name: '가족과의 약속을 지켜요',        file: `${SMARTPHONE_BASE_WS}/4.png${spv}` },
  { id: 'safe-walking',               group: 5,  name: '걸을 때는 보지 않아요',         file: `${SMARTPHONE_BASE_WS}/5.png${spv}` },
  { id: 'balance-study-rest',         group: 6,  name: '공부와 휴식의 균형을 지켜요',   file: `${SMARTPHONE_BASE_WS}/6.png${spv}` },
  { id: 'check-apps-with-adults',     group: 7,  name: '앱은 어른과 함께 확인해요',     file: `${SMARTPHONE_BASE_WS}/7.png${spv}` },
  { id: 'protect-personal-info',      group: 8,  name: '개인정보를 조심해요',           file: `${SMARTPHONE_BASE_WS}/8.png${spv}` },
  { id: 'kind-messages',              group: 9,  name: '메시지도 예쁘게 써요',          file: `${SMARTPHONE_BASE_WS}/9.png${spv}` },
  { id: 'smartphone-habits-promise',  group: 10, name: '스마트폰 바른 사용을 약속해요', file: `${SMARTPHONE_BASE_WS}/10.png${spv}` },
];

const SMARTPHONE_SAMPLE_URLS = numberedThemeAssetUrls('smartphone', 'samples', 10);

const smartphoneMeta: ThemeMeta = {
  id: 'smartphone',
  name: '스마트폰예방교육',
  englishName: 'Smartphone Habits',
  emoji: '📱',
  status: 'available',
  shortDescription: '스마트폰 사용 시간·자세·눈 건강·가족 약속을 색칠하고 전시하는 창체 주제팩',
  description:
    '초등학생이 스마트폰 사용 시간, 바른 자세, 눈 건강, 가족 약속, 보행 안전, 공부와 휴식의 균형, 앱 설치 전 확인, 개인정보 보호, 메시지 예절, 스마트폰 바른 사용 다짐을 익히는 창체 주제팩이에요.',
  backgrounds: SMARTPHONE_BACKGROUNDS,
  defaultBackgroundId: 'main',
  worksheets: makeThemeWorksheets(smartphoneWorksheets),
  sampleUrls: SMARTPHONE_SAMPLE_URLS,
  cropArea: { x: 0.04, y: 0.02, width: 0.92, height: 0.48 },
  exhibitionBadge: '📱 스마트폰예방교육 전시관',
  controlTitle: '📱 스마트폰예방교육 전시 준비',
};

// ──────────────────────────────────────────────────────────────────────────
// 식품안전 계기교육 — 5장 배경 / 10장 학습지 / 10장 샘플
// 폴더명은 food (실제 디스크 기준). themeId, asset path 모두 'food' 으로 통일.
// crop guide: public/assets/themes/food/guides/20260526-food-safety-crop-guide-v1.json
// characterCropArea: { x:0.04, y:0.02, width:0.92, height:0.48 }
// 학습지 상단(0~0.5) 캐릭터 영역만 전시. 제목/글쓰기 박스(0.5~)는 전시에서 제외.
// NOTE: crop 기준 변경 시 이미 업로드된 학습지의 cutoutUrl 캐싱은 무효화되므로
// 사용자에게 전체 삭제 후 재업로드 안내 필요.
// ──────────────────────────────────────────────────────────────────────────
const FOOD_BACKGROUNDS: ThemeBackground[] = [
  { id: 'main',       name: '깨끗한 식탁',  file: '/assets/themes/food/backgrounds/1.png' },
  { id: 'kitchen',    name: '주방',         file: '/assets/themes/food/backgrounds/2.png' },
  { id: 'cafeteria',  name: '급식실',       file: '/assets/themes/food/backgrounds/3.png' },
  { id: 'market',     name: '시장 가게',    file: '/assets/themes/food/backgrounds/4.png' },
  { id: 'promise',    name: '약속의 공간',  file: '/assets/themes/food/backgrounds/5.png' },
];

const FOOD_BASE_WS = '/assets/themes/food/worksheets';
const FOOD_VER = '20260526';
const fdv = `?v=${FOOD_VER}`;

const foodWorksheets = [
  { id: 'wash-hands-before-eating', group: 1,  name: '먹기 전 손을 씻어요',          file: `${FOOD_BASE_WS}/1.png${fdv}` },
  { id: 'check-expiration-date',    group: 2,  name: '날짜를 확인해요',              file: `${FOOD_BASE_WS}/2.png${fdv}` },
  { id: 'avoid-unsafe-snacks',      group: 3,  name: '불량식품을 조심해요',          file: `${FOOD_BASE_WS}/3.png${fdv}` },
  { id: 'choose-fresh-food',        group: 4,  name: '신선한 음식을 골라요',         file: `${FOOD_BASE_WS}/4.png${fdv}` },
  { id: 'cafeteria-safety',         group: 5,  name: '급식실에서 안전하게 행동해요', file: `${FOOD_BASE_WS}/5.png${fdv}` },
  { id: 'food-allergy-check',       group: 6,  name: '몸에 맞지 않는 음식은 말해요', file: `${FOOD_BASE_WS}/6.png${fdv}` },
  { id: 'proper-food-storage',      group: 7,  name: '음식을 알맞게 보관해요',       file: `${FOOD_BASE_WS}/7.png${fdv}` },
  { id: 'clean-cooking-tools',      group: 8,  name: '조리도구를 깨끗이 사용해요',   file: `${FOOD_BASE_WS}/8.png${fdv}` },
  { id: 'choose-safe-snacks',       group: 9,  name: '안전한 간식을 선택해요',       file: `${FOOD_BASE_WS}/9.png${fdv}` },
  { id: 'food-safety-promise',      group: 10, name: '식품안전을 약속해요',          file: `${FOOD_BASE_WS}/10.png${fdv}` },
];

const FOOD_SAMPLE_URLS = numberedThemeAssetUrls('food', 'samples', 10);

const foodMeta: ThemeMeta = {
  id: 'food',
  name: '식품안전 계기교육',
  englishName: 'Food Safety',
  emoji: '🍎',
  status: 'available',
  shortDescription: '손 씻기·유통기한·불량식품·급식실 안전을 색칠하고 전시하는 창체 주제팩',
  description:
    '초등학생이 먹기 전 손 씻기, 날짜 확인, 불량식품 조심, 신선한 음식 고르기, 급식실 안전, 알레르기 확인, 음식 보관, 조리도구 위생, 안전한 간식 선택, 식품안전 다짐을 익히는 창체 주제팩이에요.',
  backgrounds: FOOD_BACKGROUNDS,
  defaultBackgroundId: 'main',
  worksheets: makeThemeWorksheets(foodWorksheets),
  sampleUrls: FOOD_SAMPLE_URLS,
  cropArea: { x: 0.04, y: 0.02, width: 0.92, height: 0.48 },
  exhibitionBadge: '🍎 식품안전 계기교육 전시관',
  controlTitle: '🍎 식품안전 계기교육 전시 준비',
};

// ──────────────────────────────────────────────────────────────────────────
// 겨울방학 안전 계기교육 — 5장 배경 / 10장 학습지 / 10장 샘플
// 폴더명은 winter (실제 디스크 기준). themeId, asset path 모두 'winter' 으로 통일.
// crop guide: public/assets/themes/winter/guides/20260526-winter-safety-crop-guide-v1.json
// characterCropArea: { x:0.04, y:0.02, width:0.92, height:0.48 }
// 학습지 상단(0~0.5) 캐릭터 영역만 전시. 제목/글쓰기 박스(0.5~)는 전시에서 제외.
// NOTE: crop 기준 변경 시 이미 업로드된 학습지의 cutoutUrl 캐싱은 무효화되므로
// 사용자에게 전체 삭제 후 재업로드 안내 필요.
// ──────────────────────────────────────────────────────────────────────────
const WINTER_BACKGROUNDS: ThemeBackground[] = [
  { id: 'main',     name: '눈 내린 풍경',  file: '/assets/themes/winter/backgrounds/1.png' },
  { id: 'sled',     name: '눈썰매장',      file: '/assets/themes/winter/backgrounds/2.png' },
  { id: 'rink',     name: '스케이트장',    file: '/assets/themes/winter/backgrounds/3.png' },
  { id: 'street',   name: '겨울 거리',     file: '/assets/themes/winter/backgrounds/4.png' },
  { id: 'home',     name: '따뜻한 집',     file: '/assets/themes/winter/backgrounds/5.png' },
];

const WINTER_BASE_WS = '/assets/themes/winter/worksheets';
const WINTER_VER = '20260526';
const wnv = `?v=${WINTER_VER}`;

const winterWorksheets = [
  { id: 'sled-safety',           group: 1,  name: '눈썰매를 안전하게 타요',          file: `${WINTER_BASE_WS}/1.png${wnv}` },
  { id: 'skating-safety',        group: 2,  name: '스케이트장에서는 조심해요',       file: `${WINTER_BASE_WS}/2.png${wnv}` },
  { id: 'ski-safety',            group: 3,  name: '스키장 안전수칙을 지켜요',        file: `${WINTER_BASE_WS}/3.png${wnv}` },
  { id: 'icy-road-walking',      group: 4,  name: '빙판길에서는 천천히 걸어요',      file: `${WINTER_BASE_WS}/4.png${wnv}` },
  { id: 'winter-road-safety',    group: 5,  name: '도로에서는 더 조심해요',          file: `${WINTER_BASE_WS}/5.png${wnv}` },
  { id: 'hot-object-safety',     group: 6,  name: '뜨거운 것은 함부로 만지지 않아요',file: `${WINTER_BASE_WS}/6.png${wnv}` },
  { id: 'winter-outfit',         group: 7,  name: '따뜻하게 준비하고 나가요',        file: `${WINTER_BASE_WS}/7.png${wnv}` },
  { id: 'friend-winter-rules',   group: 8,  name: '친구와 함께 안전수칙을 지켜요',   file: `${WINTER_BASE_WS}/8.png${wnv}` },
  { id: 'cold-rest',             group: 9,  name: '추울 때는 따뜻하게 쉬어요',       file: `${WINTER_BASE_WS}/9.png${wnv}` },
  { id: 'winter-safety-promise', group: 10, name: '겨울방학 안전을 약속해요',        file: `${WINTER_BASE_WS}/10.png${wnv}` },
];

const WINTER_SAMPLE_URLS = numberedThemeAssetUrls('winter', 'samples', 10);

const winterMeta: ThemeMeta = {
  id: 'winter',
  name: '겨울방학 안전 계기교육',
  englishName: 'Winter Vacation Safety',
  emoji: '❄️',
  status: 'available',
  shortDescription: '눈썰매·빙판길·도로·난로·외출 준비 등 겨울 안전수칙을 색칠하고 전시하는 창체 주제팩',
  description:
    '초등학생이 겨울방학 동안 눈썰매장, 스케이트장, 스키장, 빙판길, 도로, 난로와 뜨거운 물건, 겨울 외출 준비, 친구와의 안전수칙, 추울 때 휴식, 겨울방학 안전 다짐을 익히는 창체 주제팩이에요.',
  backgrounds: WINTER_BACKGROUNDS,
  defaultBackgroundId: 'main',
  worksheets: makeThemeWorksheets(winterWorksheets),
  sampleUrls: WINTER_SAMPLE_URLS,
  cropArea: { x: 0.04, y: 0.02, width: 0.92, height: 0.48 },
  exhibitionBadge: '❄️ 겨울방학 안전 계기교육 전시관',
  controlTitle: '❄️ 겨울방학 안전 계기교육 전시 준비',
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
  noviolenceMeta,
  summerMeta,
  civicMeta,
  aiethnicMeta,
  smartphoneMeta,
  foodMeta,
  winterMeta,
  placeholderTheme('earth',  '지구 회복 숲',   '🌲', 'linear-gradient(135deg, #a0e7a0, #5fa896)'),
  placeholderTheme('mind',   '마음 정원',      '🌸', 'linear-gradient(135deg, #ffc6ff, #bdb2ff)'),
  placeholderTheme('future', '미래 직업 도시', '🌆', 'linear-gradient(135deg, #a0c4ff, #9bf6ff)'),
  placeholderTheme('world',  '세계 마을 축제', '🌍', 'linear-gradient(135deg, #fdffb6, #ffd6a5)'),
];

export const THEMES_BY_ID: Record<ThemeId, ThemeMeta> = THEME_LIST.reduce(
  (acc, t) => {
    acc[t.id as ThemeId] = t;
    return acc;
  },
  {} as Record<ThemeId, ThemeMeta>,
);

// ─── 커스텀 테마 런타임 레지스트리 ────────────────────────────────────────────
// CustomThemeContext 가 IndexedDB 에서 로드한 ThemeMeta 를 이 레지스트리에 등록.
// getThemeMeta() 는 기본 테마 → 커스텀 테마 순서로 조회한다.
const _customRegistry: Record<string, ThemeMeta> = {};

export function registerCustomThemeMeta(meta: ThemeMeta): void {
  _customRegistry[meta.id] = meta;
}

export function unregisterCustomThemeMeta(id: string): void {
  delete _customRegistry[id];
}

export function getAllThemes(): ThemeMeta[] {
  return [...THEME_LIST, ...Object.values(_customRegistry)];
}

export function getThemeMeta(id: ThemeId | string | null | undefined): ThemeMeta {
  if (!id) return dokdoMeta;
  if ((id as ThemeId) in THEMES_BY_ID) return THEMES_BY_ID[id as ThemeId];
  if (id in _customRegistry) return _customRegistry[id];
  return dokdoMeta;
}

export const DEFAULT_THEME_ID: ThemeId = 'dokdo';
