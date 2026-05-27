import type { TopicPack, TopicCategory } from '../types/topicPack';

/**
 * 모든 창체 주제의 단일 진실 (Single Source of Truth).
 *
 * 새 주제를 추가할 때 이 배열에만 항목을 넣으면 /packs 카드, 필터, 홈 미리보기에 자동 반영된다.
 *
 * 에셋 폴더 구조:
 *   public/assets/topics/<id>/backgrounds/
 *   public/assets/topics/<id>/characters/
 *   public/assets/topics/<id>/worksheets/
 *
 * 에셋 파일이 아직 없어도 카드는 정상 렌더링되며 placeholder/그라데이션이 표시된다.
 *
 * 기존 dokdo / safeschool 도 같은 데이터 구조로 등록. 이 둘은 themeId 로
 * 실제 전시 흐름(ThemeMeta 레지스트리)에 연결된다.
 */

export const TOPIC_PACKS: TopicPack[] = [
  // ─── 사용 가능 ─────────────────────────────────────────────
  {
    id: 'dokdo',
    title: '독도 바다',
    originalName: '독도교육',
    description: '독도의 바다와 친구들을 색칠하며 우리 땅을 알아가요.',
    category: '시민',
    status: 'available',
    route: '/packs?theme=dokdo',
    themeId: 'dokdo',
    assets: {
      backgrounds: [
        '/assets/themes/dokdo/backgrounds/1.png',
        '/assets/themes/dokdo/backgrounds/2.png',
      ],
      characters: [],
      worksheets: [],
    },
    theme: {
      accentColor: '#2f80d8',
      gradient: 'linear-gradient(135deg, #cfe4f7, #98c1de)',
    },
  },
  {
    id: 'safeschool',
    title: '안전한 학교',
    originalName: '학교안전교육',
    description: '학교생활 속 안전 약속을 색칠하고 함께 지켜요.',
    category: '안전',
    status: 'available',
    route: '/packs?theme=safeschool',
    themeId: 'safeschool',
    assets: {
      backgrounds: ['/assets/themes/safeschool/backgrounds/1.png'],
      characters: [],
      worksheets: [],
    },
    theme: {
      accentColor: '#3a8dd9',
      gradient: 'linear-gradient(135deg, #d4e6f7, #a9c8e6)',
    },
  },
  {
    id: 'saveearth',
    title: '환경교육',
    originalName: '환경교육',
    subtitle: '지구를 위한 나의 약속',
    description: '환경을 지키기 위해 내가 실천할 일을 생각하고 표현해요.',
    category: '생활',
    status: 'available',
    route: '/packs?theme=saveearth',
    themeId: 'saveearth',
    assets: {
      backgrounds: [
        '/assets/themes/saveearth/backgrounds/1.png',
        '/assets/themes/saveearth/backgrounds/2.png',
      ],
      characters: [],
      worksheets: [],
    },
    theme: {
      accentColor: '#4ea88a',
      gradient: 'linear-gradient(135deg, #cfe9dd, #9cc9b6)',
    },
  },

  // ─── 추가 예정 ─────────────────────────────────────────────
  {
    id: 'culture',
    title: '다문화이해교육',
    originalName: '다문화이해교육',
    subtitle: '서로 달라도 함께 빛나요',
    description: '나와 다른 문화를 존중하고, 함께 어울리는 방법을 배워요.',
    category: '시민',
    status: 'available',
    route: '/packs?theme=culture',
    themeId: 'culture',
    assets: {
      backgrounds: [
        '/assets/themes/culture/backgrounds/1.png',
        '/assets/themes/culture/backgrounds/2.png',
      ],
      characters: [],
      worksheets: [],
    },
    theme: {
      accentColor: '#a48ce5',
      gradient: 'linear-gradient(135deg, #ddd2f4, #b9a8e6)',
    },
  },
  {
    id: 'friend',
    title: '친구사랑교육',
    originalName: '친구사랑교육',
    subtitle: '친구야, 함께해서 좋아',
    description: '친구의 마음을 존중하고, 서로 배려하며 함께 지내는 방법을 배워요.',
    category: '관계',
    status: 'available',
    route: '/packs?theme=friend',
    themeId: 'friend',
    assets: {
      backgrounds: [
        '/assets/themes/friend/backgrounds/1.png',
        '/assets/themes/friend/backgrounds/2.png',
      ],
      characters: [],
      worksheets: [],
    },
    theme: {
      accentColor: '#d97a9e',
      gradient: 'linear-gradient(135deg, #f4d6e2, #e2a7c0)',
    },
  },
  {
    id: 'noviolence',
    title: '학교폭력예방교육',
    originalName: '학교폭력예방교육',
    subtitle: '친구를 지키는 나의 약속',
    description: '친구를 배려하고 안전한 학교를 만드는 약속을 표현해요.',
    category: '안전',
    status: 'available',
    route: '/packs?theme=noviolence',
    themeId: 'noviolence',
    assets: {
      backgrounds: [
        '/assets/themes/noviolence/backgrounds/1.png',
        '/assets/themes/noviolence/backgrounds/2.png',
      ],
      characters: [],
      worksheets: [],
    },
    theme: {
      accentColor: '#5e8fd1',
      gradient: 'linear-gradient(135deg, #d2dff2, #9eb4d8)',
    },
  },
  {
    id: 'civic',
    title: '민주시민 계기교육',
    originalName: '민주시민교육',
    subtitle: '함께 정하고 함께 지켜요',
    description: '의견 표현·경청·토의·투표·배려·책임을 익히는 시민 태도 주제팩이에요.',
    category: '시민',
    status: 'available',
    route: '/packs?theme=civic',
    themeId: 'civic',
    assets: {
      backgrounds: [
        '/assets/themes/civic/backgrounds/1.png',
        '/assets/themes/civic/backgrounds/2.png',
      ],
      characters: [],
      worksheets: [],
    },
    theme: {
      accentColor: '#7eaad8',
      gradient: 'linear-gradient(135deg, #d6e6f4, #a0c2e0)',
    },
  },
  {
    id: 'aiethnic',
    title: '정보통신윤리 계기교육',
    originalName: '정보통신윤리교육',
    subtitle: '디지털 세상에서도 바르게 약속해요',
    description: '바른 디지털 사용·댓글 예절·개인정보·저작권 존중·온라인 배려를 배워요.',
    category: '디지털',
    status: 'available',
    route: '/packs?theme=aiethnic',
    themeId: 'aiethnic',
    assets: {
      backgrounds: [
        '/assets/themes/aiethnic/backgrounds/1.png',
        '/assets/themes/aiethnic/backgrounds/2.png',
      ],
      characters: [],
      worksheets: [],
    },
    theme: {
      accentColor: '#6c8db8',
      gradient: 'linear-gradient(135deg, #d6dfee, #a6b8d4)',
    },
  },
  {
    id: 'smartphone',
    title: '스마트폰예방교육',
    originalName: '스마트폰중독예방교육',
    subtitle: '스마트폰을 건강하게 사용해요',
    description: '사용 시간·자세·눈 건강·가족 약속·보행 안전 등 바른 스마트폰 습관을 배워요.',
    category: '디지털',
    status: 'available',
    route: '/packs?theme=smartphone',
    themeId: 'smartphone',
    assets: {
      backgrounds: [
        '/assets/themes/smartphone/backgrounds/1.png',
        '/assets/themes/smartphone/backgrounds/2.png',
      ],
      characters: [],
      worksheets: [],
    },
    theme: {
      accentColor: '#5ea0a8',
      gradient: 'linear-gradient(135deg, #cfe4e7, #98c1c7)',
    },
  },
  {
    id: 'food',
    title: '식품안전 계기교육',
    originalName: '식품안전교육',
    subtitle: '안전하고 건강한 먹거리 습관을 배워요',
    description: '손 씻기·유통기한 확인·불량식품·급식실 안전·알레르기·간식 선택 약속을 익혀요.',
    category: '생활',
    status: 'available',
    route: '/packs?theme=food',
    themeId: 'food',
    assets: {
      backgrounds: [
        '/assets/themes/food/backgrounds/1.png',
        '/assets/themes/food/backgrounds/2.png',
      ],
      characters: [],
      worksheets: [],
    },
    theme: {
      accentColor: '#7cb087',
      gradient: 'linear-gradient(135deg, #d4ead7, #a4cda9)',
    },
  },
  {
    id: 'summer',
    title: '여름방학 계기교육',
    originalName: '여름방학 안전교육',
    subtitle: '여름방학 안전 약속을 색칠하고 표현해요',
    description: '물놀이·폭염·교통·야외활동 등 여름방학 안전 약속을 배려하고 다짐해요.',
    category: '계절',
    status: 'available',
    route: '/packs?theme=summer',
    themeId: 'summer',
    assets: {
      backgrounds: [
        '/assets/themes/summer/backgrounds/1.png',
        '/assets/themes/summer/backgrounds/2.png',
      ],
      characters: [],
      worksheets: [],
    },
    theme: {
      accentColor: '#e08c1a',
      gradient: 'linear-gradient(135deg, #fff0c2, #ffd580)',
    },
  },
  {
    id: 'winter',
    title: '겨울방학 안전 계기교육',
    originalName: '겨울철 안전교육',
    subtitle: '겨울철을 따뜻하고 안전하게 보내요',
    description: '눈썰매·스케이트·스키·빙판길·도로·난로·외출 준비 등 겨울 안전수칙을 익혀요.',
    category: '계절',
    status: 'available',
    route: '/packs?theme=winter',
    themeId: 'winter',
    assets: {
      backgrounds: [
        '/assets/themes/winter/backgrounds/1.png',
        '/assets/themes/winter/backgrounds/2.png',
      ],
      characters: [],
      worksheets: [],
    },
    theme: {
      accentColor: '#8aa0c4',
      gradient: 'linear-gradient(135deg, #dee4f0, #b0bedb)',
    },
  },
];

export const TOPIC_CATEGORIES: Array<{ id: 'all' | TopicCategory; label: string }> = [
  { id: 'all',      label: '전체' },
  { id: '관계',     label: '관계' },
  { id: '안전',     label: '안전' },
  { id: '시민',     label: '시민' },
  { id: '디지털',   label: '디지털' },
  { id: '생활',     label: '생활' },
  { id: '계절',     label: '계절' },
];

export function filterTopicPacks(category: 'all' | TopicCategory, query?: string): TopicPack[] {
  const lower = query?.trim().toLowerCase();
  return TOPIC_PACKS.filter((t) => {
    if (category !== 'all' && t.category !== category) return false;
    if (lower) {
      const hay = `${t.title} ${t.originalName} ${t.description}`.toLowerCase();
      if (!hay.includes(lower)) return false;
    }
    return true;
  });
}

export function getTopicPackById(id: string): TopicPack | undefined {
  return TOPIC_PACKS.find((t) => t.id === id);
}
