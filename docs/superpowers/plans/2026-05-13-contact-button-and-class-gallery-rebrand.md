# CLASS GALLERY 리브랜드 + 문의하기 버튼 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 홈 페이지에 Google Form 외부 링크 기반 "문의하기" 버튼을 추가하고, 안내 모달 본문을 갱신하며, 브랜드/hero 제목을 "CLASS GALLERY"로 통일한다. 백엔드/DB/관리자 기능은 추가하지 않으며, 개발자 이메일 주소는 어디에도 노출하지 않는다.

**Architecture:** 순수 Vite + React SPA. 새 정적 컴포넌트 3개 (`siteConfig`, `InfoModal`, `ContactButton`)를 추가하고 홈 페이지 / 안내 모달 / 글로벌 CSS를 최소 수정한다. 클릭 시 `siteConfig.contactFormUrl`이 placeholder면 안내 모달, 실제 URL이면 `window.open(url, '_blank', 'noopener,noreferrer')`로 새 탭 오픈.

**Tech Stack:** Vite 5, React 18, React Router 6, TypeScript 5.5, 기존 CSS 변수 토큰(`--color-primary` 등), `.btn-ghost btn-sm` 유틸 클래스. Google Fonts (Fredoka) `@import`.

**Testing approach:** 이 프로젝트에는 자동화 테스트 인프라가 없다. 검증은 `npm run build` (TypeScript 컴파일 + 번들) + `npm run dev` 후 브라우저 수동 확인 + `grep` 으로 이메일/금칙 문자열 0회 확인.

**Spec:** [docs/superpowers/specs/2026-05-13-contact-button-and-class-gallery-rebrand-design.md](../specs/2026-05-13-contact-button-and-class-gallery-rebrand-design.md)

---

### Task 1: `siteConfig.ts` 신규 생성

**Files:**
- Create: `src/constants/siteConfig.ts`

- [ ] **Step 1: 파일 생성 및 내용 작성**

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

- [ ] **Step 2: 타입 컴파일 확인**

Run: `npx tsc -b --noEmit`
Expected: 에러 0개

- [ ] **Step 3: 커밋**

```bash
git add src/constants/siteConfig.ts
git commit -m "feat(config): siteConfig 추가 (CLASS GALLERY 제목 + Google Form URL placeholder)"
```

---

### Task 2: `InfoModal.tsx` 공용 모달 신규 생성

**Files:**
- Create: `src/components/common/InfoModal.tsx`

- [ ] **Step 1: 폴더 + 파일 생성**

```tsx
import { useEffect, type ReactNode } from 'react';

interface InfoModalProps {
  open: boolean;
  title: string;
  body: ReactNode;
  ctaLabel?: string;
  onClose: () => void;
}

export default function InfoModal({
  open,
  title,
  body,
  ctaLabel = '확인',
  onClose,
}: InfoModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(15, 40, 65, 0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="fade-in"
        style={{
          background: '#fff',
          borderRadius: 22,
          maxWidth: 400,
          width: '100%',
          maxHeight: 'calc(100vh - 40px)',
          overflowY: 'auto',
          boxShadow: '0 24px 60px rgba(15, 40, 65, 0.3)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px 12px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <h2
            id="info-modal-title"
            style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-text)' }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              border: 'none',
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            padding: '18px 24px',
            fontSize: 14,
            color: 'var(--color-text)',
            lineHeight: 1.7,
          }}
        >
          {body}
        </div>

        <div
          style={{
            padding: '12px 24px 20px',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button type="button" className="btn btn-primary" onClick={onClose}>
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 컴파일 확인**

Run: `npx tsc -b --noEmit`
Expected: 에러 0개

- [ ] **Step 3: 커밋**

```bash
git add src/components/common/InfoModal.tsx
git commit -m "feat(common): 공용 InfoModal 컴포넌트 추가 (제목/본문/확인)"
```

---

### Task 3: `ContactButton.tsx` 신규 생성

**Files:**
- Create: `src/components/common/ContactButton.tsx`

- [ ] **Step 1: 파일 생성**

```tsx
import { useState } from 'react';
import { isContactFormUrlConfigured, siteConfig } from '../../constants/siteConfig';
import InfoModal from './InfoModal';

export default function ContactButton() {
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = () => {
    if (isContactFormUrlConfigured(siteConfig.contactFormUrl)) {
      window.open(siteConfig.contactFormUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setModalOpen(true);
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={handleClick}
        aria-label="문의하기 — 새 탭으로 열림"
      >
        문의하기
      </button>
      <InfoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="문의하기"
        body={<p style={{ margin: 0 }}>문의 링크가 아직 설정되지 않았습니다. 관리자에게 문의해 주세요.</p>}
      />
    </>
  );
}
```

- [ ] **Step 2: 컴파일 확인**

Run: `npx tsc -b --noEmit`
Expected: 에러 0개

- [ ] **Step 3: 커밋**

```bash
git add src/components/common/ContactButton.tsx
git commit -m "feat(home): 문의하기 버튼 컴포넌트 추가 (Google Form 새 탭 + 미설정 안내)"
```

---

### Task 4: `globals.css` Fredoka 폰트 + 제목 클래스 추가

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: 파일 최상단에 `@import` 추가**

`/* CSS 디자인 토큰 */` 위쪽, 1번째 줄에 다음을 삽입한다. `@import`는 CSS 표준상 다른 규칙보다 먼저 와야 한다.

```css
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&display=swap');

/* CSS 디자인 토큰 */
```

- [ ] **Step 2: 페이드인 키프레임 다음에 `.brand-title`, `.hero-title` 클래스 추가**

`.fade-in { ... }` 블록 바로 아래에 추가:

```css
/* 브랜드/히어로 제목 폰트 (Fredoka) */
.brand-title,
.hero-title {
  font-family: 'Fredoka', 'Nunito', 'Pretendard', system-ui, sans-serif;
  letter-spacing: 0.02em;
}
```

- [ ] **Step 3: 빌드 확인 (CSS는 타입 체크 영향 없지만 dev 서버에서 로드되는지 확인)**

Run: `npm run build`
Expected: 빌드 성공, `dist/` 생성, 폰트 import 관련 경고 없음

- [ ] **Step 4: 커밋**

```bash
git add src/app/globals.css
git commit -m "style(global): Fredoka 폰트 import + brand/hero title 클래스 추가"
```

---

### Task 5: `page.tsx` 브랜드 / hero / nav 갱신

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: import 추가**

파일 상단 import 블록에 다음을 추가:

```tsx
import ContactButton from '../components/common/ContactButton';
import { siteConfig } from '../constants/siteConfig';
```

- [ ] **Step 2: 브랜드 텍스트 + 클래스 변경**

기존:
```tsx
<span style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-text)' }}>
  우리반 라이브 갤러리
</span>
```

다음으로 교체:
```tsx
<span
  className="brand-title"
  style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-text)' }}
>
  {siteConfig.title}
</span>
```

- [ ] **Step 3: nav 우측 버튼 영역 변경 (안내 + 문의하기, 줄바꿈 허용)**

기존:
```tsx
<div style={{ display: 'flex', gap: 8 }}>
  <button
    type="button"
    className="btn btn-ghost btn-sm"
    onClick={() => setGuideOpen(true)}
  >
    안내
  </button>
</div>
```

다음으로 교체:
```tsx
<div
  style={{
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  }}
>
  <button
    type="button"
    className="btn btn-ghost btn-sm"
    onClick={() => setGuideOpen(true)}
  >
    안내
  </button>
  <ContactButton />
</div>
```

- [ ] **Step 4: hero 제목 변경 (두 줄, Fredoka 클래스 적용)**

기존:
```tsx
<h1 style={{
  fontSize: 'clamp(34px, 4vw, 56px)',
  fontWeight: 800,
  lineHeight: 1.15,
  color: 'var(--color-text)',
  marginBottom: 18,
  letterSpacing: '-0.01em',
}}>
  우리 반<br />
  <span style={{ color: 'var(--color-primary)' }}>작품</span>
</h1>
```

다음으로 교체:
```tsx
<h1
  className="hero-title"
  style={{
    fontSize: 'clamp(48px, 7vw, 96px)',
    fontWeight: 700,
    lineHeight: 1.0,
    color: 'var(--color-text)',
    marginBottom: 18,
  }}
>
  CLASS<br />
  <span style={{ color: 'var(--color-primary)' }}>GALLERY</span>
</h1>
```

설명: Fredoka 폰트는 가로폭이 크므로 letterSpacing 은 클래스에서 0.02em 만 적용하고 인라인 letterSpacing 은 제거. 폰트 크기는 영문 두 단어에 어울리게 조금 키움.

- [ ] **Step 5: 컴파일 + 빌드 확인**

Run: `npm run build`
Expected: 빌드 성공, 에러 0개

- [ ] **Step 6: 커밋**

```bash
git add src/app/page.tsx
git commit -m "feat(home): 브랜드/hero 제목을 CLASS GALLERY 로 변경, 문의하기 버튼 추가"
```

---

### Task 6: `TeacherGuideModal.tsx` 안내 본문 교체

**Files:**
- Modify: `src/components/dokdo/TeacherGuideModal.tsx`

- [ ] **Step 1: 헤더 제목 변경**

기존:
```tsx
<h2 id="teacher-guide-title" style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)' }}>
  📋 교사용 안내
</h2>
```

다음으로 교체:
```tsx
<h2 id="teacher-guide-title" style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)' }}>
  📘 안내
</h2>
```

- [ ] **Step 2: `SAFETY_NOTES`, `USAGE_STEPS` 상수 삭제**

파일 상단의 두 상수 선언 블록 전체 삭제:

```tsx
const SAFETY_NOTES = [ ... ];
const USAGE_STEPS = [ ... ];
```

- [ ] **Step 3: 본문 두 `<section>` 을 명세 6문단으로 교체**

기존 본문 컨테이너:
```tsx
<div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
  <section>
    <h3 ...>교사용 안전 안내</h3>
    <ul>{SAFETY_NOTES.map(...)}</ul>
  </section>
  <section>
    <h3 ...>수업 사용 흐름</h3>
    <ol>{USAGE_STEPS.map(...)}</ol>
  </section>
</div>
```

다음으로 교체:
```tsx
<div
  style={{
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    fontSize: 14,
    color: 'var(--color-text)',
    lineHeight: 1.7,
  }}
>
  <p style={{ margin: 0 }}>
    이 사이트는 우리 반 창의적 체험활동 및 학습 결과물을 보기 좋게 정리하고 감상하기 위한 교육용 웹페이지입니다.
  </p>
  <p style={{ margin: 0 }}>
    학생의 이름, 연락처, 주소, 주민등록번호 등 직접적인 개인정보를 수집하지 않습니다.
  </p>
  <p style={{ margin: 0 }}>
    작품과 학습지는 교실 수업 및 교육 활동을 위한 목적으로만 활용됩니다.
  </p>
  <p style={{ margin: 0 }}>
    사이트 이용 중 문의나 개선 의견이 있으면 "문의하기"를 통해 알려 주세요.
  </p>
  <p style={{ margin: 0 }}>
    문의 시 학생 실명, 연락처, 민감정보, 욕설, 비방, 저작권 침해 자료는 포함하지 말아 주세요.
  </p>
  <p style={{ margin: 0 }}>
    본 사이트는 교육 활동 보조용으로 제공되며, 자료 활용 및 게시 내용은 게시 전 관리자가 최종 확인해야 합니다.
  </p>
</div>
```

- [ ] **Step 4: 컴파일 + 빌드 확인**

Run: `npm run build`
Expected: 빌드 성공, 에러 0개 (특히 미사용 import 경고 없는지 확인)

- [ ] **Step 5: 커밋**

```bash
git add src/components/dokdo/TeacherGuideModal.tsx
git commit -m "docs(guide): 안내 모달 본문을 신규 6문단으로 교체, 헤더 라벨 통일"
```

---

### Task 7: 통합 검증 (이메일 노출 / 빌드 / 수동 동작)

**Files:** (변경 없음, 검증만)

- [ ] **Step 1: 이메일 / 금칙 문자열 노출 검증**

Run (Grep tool 또는 PowerShell):
```
프로젝트 전체에서 다음 문자열을 grep:
- bongbiyobi
- gmail.com
- mailto:
```

검색 대상: `src/`, `public/`, `index.html`, `package.json`, `vite.config.ts`

Expected: 모두 0회 매치 (스펙 문서 `docs/superpowers/specs/...` 내 1회 등장은 허용 — docs는 코드에 포함되지 않음. `docs/superpowers/plans/` 도 마찬가지)

- [ ] **Step 2: TypeScript 빌드 통과 확인**

Run: `npm run build`
Expected:
- `tsc -b` 단계 통과 (에러 0)
- `vite build` 단계 통과
- `dist/` 폴더 생성
- 콘솔에 에러 메시지 없음

- [ ] **Step 3: 개발 서버 기동 후 수동 동작 확인**

Run: `npm run dev`
브라우저에서 `http://localhost:3000` 확인:

1. nav 좌측: 🎨 + "CLASS GALLERY" (Fredoka 글꼴) 표시 ✓
2. nav 우측: "안내" + "문의하기" 두 버튼 표시, 둥근 파란 테두리 동일 ✓
3. hero 영역: "CLASS" / "GALLERY" 두 줄, GALLERY 는 primary 컬러 ✓
4. "안내" 클릭 → 모달 열림 → 헤더 "📘 안내" → 본문 6문단 표시 → Esc / X / 배경 클릭 / "확인했어요" 로 닫힘 ✓
5. "문의하기" 클릭 (placeholder 상태) → InfoModal 열림 → "문의 링크가 아직 설정되지 않았습니다. 관리자에게 문의해 주세요." 표시 ✓
6. 브라우저 창 폭을 480px 이하로 좁혀도 nav 버튼 줄바꿈으로 가로 스크롤 없음 ✓

- [ ] **Step 4: 기존 기능 회귀 점검**

각 라우트 클릭하여 정상 렌더링 확인:
- `/packs` (주제 고르기) → 주제 카드 그리드 표시
- 주제 카드 클릭 → 학습지 미리보기 + "이 주제로 전시 만들기" / "활동지 보기" 정상
- `/display` (우리 반 갤러리 보기) → 배경 + 캐릭터 떠다님
- `/control?theme=dokdo` → 컨트롤 패널 정상

Expected: 모든 라우트가 깨지지 않고 기존 디자인 유지

- [ ] **Step 5: 임시 확인용 Google Form URL 주입 테스트 (선택)**

`src/constants/siteConfig.ts`의 `contactFormUrl`을 잠깐 `'https://example.com'` 으로 바꿔보고 dev 서버에서 "문의하기" 클릭 → 새 탭 열림 확인. 확인 후 원복.

Expected: 새 탭에서 `https://example.com` 열림. 원복 후 다시 안내 모달.

- [ ] **Step 6: 최종 커밋 (선택)**

검증 중 추가 수정이 발생하면 커밋. 발생하지 않았으면 skip.

---

## 최종 보고 (Task 7 통과 후 사용자에게 보고할 내용)

다음 항목을 정리한 보고 메시지 작성:

1. **수정한 파일 목록**
   - `src/app/page.tsx` (브랜드/hero/nav)
   - `src/app/globals.css` (Fredoka import + 제목 클래스)
   - `src/components/dokdo/TeacherGuideModal.tsx` (본문 6문단)

2. **새로 만든 파일 목록**
   - `src/constants/siteConfig.ts`
   - `src/components/common/InfoModal.tsx`
   - `src/components/common/ContactButton.tsx`

3. **"CLASS GALLERY" 제목/폰트 변경 내용**
   - 브라우저 탭 title: 이미 적용되어 있었음 (`index.html`)
   - nav 브랜드: "우리반 라이브 갤러리" → "CLASS GALLERY"
   - hero 제목: "우리 반 / 작품" → "CLASS / GALLERY" (두 줄)
   - 폰트: Fredoka (`@import` via Google Fonts), fallback `'Nunito', 'Pretendard', system-ui, sans-serif`

4. **문의하기 버튼 동작 방식**
   - placeholder 상태: 안내 모달 ("문의 링크가 아직 설정되지 않았습니다. 관리자에게 문의해 주세요.")
   - 실제 URL 설정 상태: `window.open(url, '_blank', 'noopener,noreferrer')`

5. **Google Form URL 입력 위치**
   - `src/constants/siteConfig.ts` 의 `contactFormUrl` 값을 실제 Google Form 공개 응답 URL 로 교체
   - 교체 후 `npm run build` → 배포

6. **이메일 노출 검증 결과**
   - `src/`, `public/`, `index.html`, `package.json` 전체에서 `bongbiyobi`, `gmail.com`, `mailto:` 모두 0회

7. **관리자 비밀번호 0405 관련 코드**
   - 작성하지 않음. 검색 결과 0회.

8. **기존 기능 테스트 결과**
   - `/packs`, `/display`, `/control` 모두 정상 렌더링
   - 학습지 업로드 / 배경 슬라이드 / 캐릭터 표시 / BroadcastChannel 회귀 없음

---

## 자체 검토 결과

**1. Spec coverage:** 스펙의 모든 6개 변경 파일이 Task 1–6 에 1:1 매핑됨. 검증 항목은 Task 7. 비목표는 spec과 동일.

**2. Placeholder scan:** "TBD", "implement later", "fill in details" 없음. 모든 코드 블록은 실제 코드. Google Form URL 자체가 placeholder인 것은 명세 요구.

**3. Type consistency:** `siteConfig`, `isContactFormUrlConfigured`, `siteConfig.contactFormUrl`, `siteConfig.title`, `InfoModalProps`, `ContactButton` 컴포넌트 이름/시그니처가 Task 1–5 전반에 동일하게 사용됨.

**4. 누락된 요구사항 점검:**
- ✅ 안내 버튼 옆 문의하기 → Task 5 Step 3
- ✅ 둥근 파란 테두리 스타일 통일 → `btn btn-ghost btn-sm` 재사용 (Task 3)
- ✅ 반응형 줄바꿈 → `flexWrap: 'wrap'` (Task 5 Step 3)
- ✅ Google Form 새 탭 → `window.open(url, '_blank', 'noopener,noreferrer')` (Task 3)
- ✅ placeholder 시 안내 모달 → InfoModal (Task 3)
- ✅ 이메일 0회 노출 → Task 7 Step 1 grep 검증
- ✅ 안내 문구 6문단 → Task 6 Step 3
- ✅ CLASS GALLERY 제목 + Fredoka → Task 4, Task 5
- ✅ 관리자 기능 비추가 → 작성하지 않음 + 비목표 명시
- ✅ 기존 기능 회귀 점검 → Task 7 Step 4
