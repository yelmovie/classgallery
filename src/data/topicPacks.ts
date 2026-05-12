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

const topicAssetPath = (id: string, kind: 'backgrounds' | 'characters' | 'worksheets', file: string) =>
  `/assets/topics/${id}/${kind}/${file}`;

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
    id: 'school-violence-prevention',
    title: '학교폭력 예방',
    originalName: '학교폭력예방교육',
    description: '모두가 안전한 교실을 만드는 방법을 배워요.',
    category: '안전',
    status: 'comingSoon',
    assets: {
      backgrounds: [topicAssetPath('school-violence-prevention', 'backgrounds', '1.png')],
      characters: [],
      worksheets: [],
    },
    theme: {
      accentColor: '#5e8fd1',
      gradient: 'linear-gradient(135deg, #d2dff2, #9eb4d8)',
    },
  },
  {
    id: 'democratic-citizenship',
    title: '민주시민',
    originalName: '민주시민교육',
    description: '함께 정하고 함께 지키는 시민의 태도를 배워요.',
    category: '시민',
    status: 'comingSoon',
    assets: {
      backgrounds: [topicAssetPath('democratic-citizenship', 'backgrounds', '1.png')],
      characters: [],
      worksheets: [],
    },
    theme: {
      accentColor: '#7eaad8',
      gradient: 'linear-gradient(135deg, #d6e6f4, #a0c2e0)',
    },
  },
  {
    id: 'digital-ethics',
    title: '정보통신 윤리',
    originalName: '정보통신윤리교육',
    description: '온라인에서도 책임 있게 행동하는 방법을 배워요.',
    category: '디지털',
    status: 'comingSoon',
    assets: {
      backgrounds: [topicAssetPath('digital-ethics', 'backgrounds', '1.png')],
      characters: [],
      worksheets: [],
    },
    theme: {
      accentColor: '#6c8db8',
      gradient: 'linear-gradient(135deg, #d6dfee, #a6b8d4)',
    },
  },
  {
    id: 'smartphone-balance',
    title: '스마트폰 사용 습관',
    originalName: '스마트폰중독예방교육',
    description: '스마트폰을 건강하게 사용하는 방법을 배워요.',
    category: '디지털',
    status: 'comingSoon',
    assets: {
      backgrounds: [topicAssetPath('smartphone-balance', 'backgrounds', '1.png')],
      characters: [],
      worksheets: [],
    },
    theme: {
      accentColor: '#5ea0a8',
      gradient: 'linear-gradient(135deg, #cfe4e7, #98c1c7)',
    },
  },
  {
    id: 'food-safety',
    title: '식품 안전',
    originalName: '식품안전교육',
    description: '안전하고 건강한 먹거리 습관을 배워요.',
    category: '생활',
    status: 'comingSoon',
    assets: {
      backgrounds: [topicAssetPath('food-safety', 'backgrounds', '1.png')],
      characters: [],
      worksheets: [],
    },
    theme: {
      accentColor: '#7cb087',
      gradient: 'linear-gradient(135deg, #d4ead7, #a4cda9)',
    },
  },
  {
    id: 'summer-safety',
    title: '여름철 안전',
    originalName: '여름철 안전교육',
    description: '여름철을 건강하고 안전하게 보내는 방법을 배워요.',
    category: '계절',
    status: 'comingSoon',
    assets: {
      backgrounds: [topicAssetPath('summer-safety', 'backgrounds', '1.png')],
      characters: [],
      worksheets: [],
    },
    theme: {
      accentColor: '#5fb5c4',
      gradient: 'linear-gradient(135deg, #d2ecf2, #9bcfde)',
    },
  },
  {
    id: 'winter-safety',
    title: '겨울철 안전',
    originalName: '겨울철 안전교육',
    description: '겨울철을 따뜻하고 안전하게 보내는 방법을 배워요.',
    category: '계절',
    status: 'comingSoon',
    assets: {
      backgrounds: [topicAssetPath('winter-safety', 'backgrounds', '1.png')],
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
