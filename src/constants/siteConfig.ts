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
  contactFormUrl: 'https://www.instagram.com/moviesamm',
} as const;

export function isContactFormUrlConfigured(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed === CONTACT_FORM_URL_PLACEHOLDER) return false;
  return /^https?:\/\//i.test(trimmed);
}
