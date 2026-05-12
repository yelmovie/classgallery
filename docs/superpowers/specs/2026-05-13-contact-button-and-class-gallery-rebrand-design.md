# CLASS GALLERY 리브랜드 + 문의하기 버튼 추가 — 설계

작성일: 2026-05-13
프로젝트: classgallery (Vite + React + TypeScript SPA)
목표: 첫페이지 상단에 "문의하기" 버튼을 추가하고, 기존 "안내" 문구를 갱신하며, 브랜드 제목을 "CLASS GALLERY"로 통일한다. 백엔드/DB/관리자 기능은 일절 추가하지 않는다.

---

## 1. 비목표 (Non-goals)

다음은 이번 작업에서 **만들지 않는다**.

- 관리자 로그인 / 비밀번호 검증 / ADMIN_PASSWORD env 처리
- 문의글 사이트 내부 저장 (localStorage / IndexedDB / 외부 DB)
- 문의 게시판 / 답변 게시판 / 관리자 답변 UI
- 파일 업로드 API / 관리자 파일 업로드 UI
- 주제별 학습지 추가/삭제 관리자 UI
- Supabase / Firebase / Vercel KV / Vercel Blob / Postgres 연동
- `api/` 폴더 또는 Vercel Serverless Functions
- `mailto:` 링크
- 코드/HTML/JSON/CSS/public 어디에든 개발자 이메일 주소 노출

확인 결과: 현재 코드베이스에 위 항목 관련 잔존 코드는 **존재하지 않으므로** 제거 작업은 없다.

---

## 2. 변경 파일 목록

| 분류 | 경로 | 변경 요약 |
|---|---|---|
| 신규 | `src/constants/siteConfig.ts` | 사이트 표시 제목 + Google Form URL placeholder 1개 export |
| 신규 | `src/components/common/InfoModal.tsx` | 제목/본문/확인 버튼만 있는 공용 모달 |
| 신규 | `src/components/common/ContactButton.tsx` | 안내 옆 "문의하기" 버튼 + 미설정 시 InfoModal 표시 |
| 수정 | `src/app/page.tsx` | nav 브랜드와 hero 제목을 "CLASS GALLERY"로 변경. nav에 `<ContactButton/>` 삽입 |
| 수정 | `src/components/dokdo/TeacherGuideModal.tsx` | 헤더 문구 변경 + 본문을 명세 6문단으로 교체 |
| 수정 | `src/app/globals.css` | Fredoka 폰트 `@import` + `.brand-title`, `.hero-title` 클래스 |

**손대지 않는다**: `/packs`, `/control`, `/display`, `ExhibitionStage`, `BackgroundPicker`, `SampleCarousel`, 모든 테마/주제팩 데이터, `public/assets/` 전체, BroadcastChannel/스크린샷 코드.

---

## 3. 모듈 상세

### 3.1 `src/constants/siteConfig.ts` (신규)

```ts
export const CONTACT_FORM_URL_PLACEHOLDER = 'PUT_GOOGLE_FORM_URL_HERE';

export const siteConfig = {
  title: 'CLASS GALLERY',
  contactFormUrl: CONTACT_FORM_URL_PLACEHOLDER,
} as const;

export function isContactFormUrlConfigured(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed === CONTACT_FORM_URL_PLACEHOLDER) return false;
  return /^https?:\/\//i.test(trimmed);
}
```

- 이메일 주소는 어디에도 들어가지 않는다.
- 미설정 판정: 빈 문자열 / placeholder 값 / http(s) 스킴 없음 셋 중 하나라도 해당하면 미설정.

### 3.2 `src/components/common/InfoModal.tsx` (신규)

Props: `{ open: boolean; title: string; body: ReactNode; onClose: () => void; ctaLabel?: string }`

행동:
- `open === false` → `null` 반환
- 배경 클릭 / Esc 키 / 닫기 버튼 / 확인 버튼 → `onClose()`
- `aria-modal="true"`, `role="dialog"`, focus ring 유지

스타일: `TeacherGuideModal`과 동일한 토큰/그림자/둥근 모서리. 폭은 더 좁게 (`maxWidth: 400`).

### 3.3 `src/components/common/ContactButton.tsx` (신규)

내부 상태: `modalOpen: boolean`

```ts
function handleClick() {
  if (isContactFormUrlConfigured(siteConfig.contactFormUrl)) {
    window.open(siteConfig.contactFormUrl, '_blank', 'noopener,noreferrer');
  } else {
    setModalOpen(true);
  }
}
```

InfoModal 본문:
> 문의 링크가 아직 설정되지 않았습니다. 관리자에게 문의해 주세요.

버튼 스타일: 기존 `<button className="btn btn-ghost btn-sm">` 와 동일 클래스. 텍스트 "문의하기". `aria-label="문의하기 — 새 탭으로 열림"`.

### 3.4 `src/app/page.tsx` (수정)

**nav 영역**

- 브랜드: `🎨 우리반 라이브 갤러리` → `🎨 CLASS GALLERY` (className `brand-title`)
- 우측 버튼 영역에 `flexWrap: 'wrap'` 적용
- 버튼 순서: `안내` (기존) → `문의하기` (신규 `<ContactButton/>`)

**hero 영역**

- 기존: `우리 반` / `<span color=primary>작품</span>` (두 줄)
- 변경: `CLASS` / `<span color=primary>GALLERY</span>` (두 줄, className `hero-title`)
- 부제 문장의 "친구들이 만든 그림을 고르고..." / "학습지를 올리면 ..." 는 그대로 유지 (한국어 설명 문장은 유지 허용)

**CTA 버튼**: "주제 고르기", "우리 반 갤러리 보기" 텍스트 변경 없음.

### 3.5 `src/components/dokdo/TeacherGuideModal.tsx` (수정)

- 헤더 제목: `📋 교사용 안내` → `📘 안내`
- `SAFETY_NOTES`, `USAGE_STEPS` 두 상수 및 두 `<section>` 제거
- 본문에 명세의 6문단을 `<p>` 요소들로 렌더링. `lineHeight: 1.7`, 문단 사이 간격 `14px`.
- 6문단 4번째 안에 이미 "문의하기를 통해 알려 주세요" 안내가 포함되어 있으므로 별도 보조 문장은 추가하지 않는다.
- 하단 "확인했어요" 버튼은 유지.

본문 6문단 (한 글자도 바꾸지 않는다):

1. 이 사이트는 우리 반 창의적 체험활동 및 학습 결과물을 보기 좋게 정리하고 감상하기 위한 교육용 웹페이지입니다.
2. 학생의 이름, 연락처, 주소, 주민등록번호 등 직접적인 개인정보를 수집하지 않습니다.
3. 작품과 학습지는 교실 수업 및 교육 활동을 위한 목적으로만 활용됩니다.
4. 사이트 이용 중 문의나 개선 의견이 있으면 "문의하기"를 통해 알려 주세요.
5. 문의 시 학생 실명, 연락처, 민감정보, 욕설, 비방, 저작권 침해 자료는 포함하지 말아 주세요.
6. 본 사이트는 교육 활동 보조용으로 제공되며, 자료 활용 및 게시 내용은 게시 전 관리자가 최종 확인해야 합니다.

### 3.6 `src/app/globals.css` (수정)

`:root` 블록 **위쪽**에 `@import`를 둔다 (`@import` 는 다른 규칙보다 앞서야 한다).

```css
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&display=swap');
```

신규 클래스:

```css
.brand-title {
  font-family: 'Fredoka', 'Nunito', 'Pretendard', system-ui, sans-serif;
  letter-spacing: 0.02em;
}

.hero-title {
  font-family: 'Fredoka', 'Nunito', 'Pretendard', system-ui, sans-serif;
  letter-spacing: 0.02em;
}
```

기존 색상/배경/디자인 토큰은 변경 없음. 웜톤/옐로톤 추가 없음.

---

## 4. 반응형 동작

- nav 우측 버튼 컨테이너: `display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end;`
- 화면 폭이 좁아져 두 버튼이 한 줄에 못 들어가면 자연스럽게 줄바꿈
- `.btn-sm` 패딩 `7px 14px` 그대로 사용 → 가로 스크롤 발생 안 함
- 모바일에서 브랜드 텍스트가 길어 보이면 nav 자체 `flex-wrap` 으로 처리

---

## 5. 접근성

- 모달: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Esc 키 닫기 유지
- ContactButton: `aria-label="문의하기 — 새 탭으로 열림"` (URL이 설정된 경우에만 새 탭 열림)
- 키보드 focus ring: 기존 `.btn:focus-visible` 규칙 그대로 적용

---

## 6. 검증 항목

빌드/실행:
- `npm run build` 통과 (TypeScript 에러 0)
- `npm run dev` 후 홈 페이지 정상 렌더링

기능:
- 안내 버튼 → 모달 열림 → 본문 6문단 확인 → Esc/X/배경 클릭/확인 버튼으로 닫힘
- 문의하기 버튼 (placeholder 상태) → InfoModal 열림 → "문의 링크가 아직 설정되지 않았습니다" 표시
- 문의하기 버튼 (실제 URL 채운 상태) → 새 탭으로 해당 URL 열림
- 기존 기능 회귀 점검: 주제 고르기 (/packs), 우리 반 갤러리 보기 (/display), 배경 슬라이드/캐릭터/학습지 보기 모두 동작

이메일 노출 점검:
- 프로젝트 전체에 `bongbiyobi`, `gmail.com`, `mailto:` 문자열 grep → 0회
- `src/`, `public/`, `index.html` 어디에도 이메일 없음 확인

---

## 7. 운영 메모 (코드 주석으로 추가)

`src/constants/siteConfig.ts` 상단 주석:

```ts
/**
 * 정적 운영 방식
 * - 주제 데이터는 src/data/topicPacks.ts
 * - 테마/배경 상수는 src/constants/themes.ts
 * - 이미지/학습지 파일은 public/assets/ 에 직접 추가
 * - 파일 추가 후 TS 데이터 파일 수정 → 재배포
 * - 방문자 업로드와 개인정보 수집 기능은 제공하지 않는다.
 *
 * 문의하기는 외부 Google Form 으로만 연결한다.
 * contactFormUrl 에 실제 Google Form 공개 URL 을 채워서 배포한다.
 * 이메일 주소는 Google Form 응답 알림 설정에서만 사용한다.
 * 프로젝트 코드/HTML/JSON/CSS/public 어디에도 이메일 주소를 넣지 않는다.
 */
```

Google Form 자체에 넣을 안내 문구 (코드 안 들어감, 사용자가 폼 만들 때 사용):

> **제목**: 개발자에게 제안하기
>
> **설명**: 사이트 개선 의견이나 오류 제보를 남겨 주세요. 문의 내용은 사이트에 공개되지 않습니다. 학생 이름, 연락처, 주소, 민감정보, 욕설, 비방, 저작권 침해 자료는 작성하지 말아 주세요. 보내주신 의견은 사이트 개선을 위해서만 확인합니다.

---

## 8. 위험 / 결정 사항

- **다른 페이지 nav**: `/packs` 등 다른 페이지의 nav 에도 "문의하기" 버튼이 자연스러울 수 있으나, 사용자 명세가 "첫페이지 우측 상단"만 명시했으므로 이번 단계는 home 페이지만 적용. 추후 일관성 요청 시 동일 컴포넌트 재사용으로 쉽게 확장 가능.
- **Fredoka 외부 폰트 로딩 실패**: fallback 체인 `'Nunito', 'Pretendard', system-ui, sans-serif`로 처리. Pretendard 가 시스템에 없을 가능성은 있지만 system-ui 가 최종 안전망.
- **`@import` vs `<link>`**: CSS `@import` 는 렌더 블로킹이 더 길 수 있지만 명세가 CSS @import 예시를 직접 제시했고, 폰트는 제목 영역에만 쓰여 영향 작음. 추후 성능 이슈 시 `index.html` `<link rel="preconnect">` + `<link rel="stylesheet">` 로 이전 가능.
