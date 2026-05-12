// 이미지 추출 설정 - 하나의 객체로 단일 책임 관리.
// 매직넘버를 다른 파일로 흩뿌리지 말고 여기서만 조정.
export const IMAGE_EXTRACTION_CONFIG = {
  // 학습지에서 캐릭터 영역을 자르는 비율 (A4 세로, 새 활동지 기준 v1.0.1).
  // 상단 ~50% 만 캐릭터 영역으로 사용한다. y=0.50 부터 시작하는
  // "독도에게 보내는 편지" 제목·안내문·글쓰기 박스는 전시 화면에 절대 들어오지 않도록
  // 미리 잘라낸다. 이 영역 안에서 다시 캐릭터 bounding box로 auto-crop.
  initialCropArea: {
    x: 0.04,
    y: 0.02,
    width: 0.92,
    height: 0.48,
  },

  // 가장자리 배경 제거 임계값.
  // 1) near-white: r,g,b 모두 이 값 이상이면 흰 종이.
  // 2) light-desat-gray: 채널 차가 적고 밝은 회색이면 체크무늬 / 음영 종이.
  // 둘 다 "가장자리와 연결" 픽셀만 제거하므로 캐릭터 내부 흰색은 보존됨.
  backgroundThresholds: {
    nearWhiteChannel: 225,
    grayChannelSpread: 22,
    grayBrightnessMin: 200,
  },

  // bounding box 주변 여백 비율 (캐릭터 잘림 방지).
  bboxPaddingRatio: 0.04,
  // 처리 전 최대 이미지 크기 (픽셀) - 너무 크면 브라우저가 느려짐.
  maxProcessingSize: 1600,
  // 결과 이미지 한 변 최대 크기 (전시 화면용으로 충분).
  outputMaxDimension: 720,
} as const;
