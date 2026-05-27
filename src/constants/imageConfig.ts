// 이미지 추출 설정 - 하나의 객체로 단일 책임 관리.
// 매직넘버를 다른 파일로 흩뿌리지 말고 여기서만 조정.
export const IMAGE_EXTRACTION_CONFIG = {
  // 학습지에서 캐릭터 영역을 자르는 비율 (A4 세로, 새 활동지 기준 v1.0.1).
  // 상단 ~50% 만 캐릭터 영역으로 사용한다. y=0.50 부터 시작하는
  // "독도에게 보내는 편지" 제목·안내문·글쓰기 박스는 전시 화면에 절대 들어오지 않도록
  // 미리 잘라낸다. detectPaperRegion 성공 시 이 비율을 종이 내부에 매핑해서 적용.
  initialCropArea: {
    x: 0.04,
    y: 0.02,
    width: 0.92,
    height: 0.48,
  },

  // 가장자리 배경 제거 임계값.
  // nearWhiteChannel: 낮출수록 크림색·미색 종이도 제거 (210 → 더 적극적).
  // borderColorMatchDistance: 높일수록 종이와 비슷한 색도 제거 (75).
  backgroundThresholds: {
    nearWhiteChannel: 210,
    grayChannelSpread: 28,
    grayBrightnessMin: 190,
    borderColorMatchDistance: 75,
    borderUniformityMaxStddev: 30,
  },

  // bounding box 주변 여백 비율 (캐릭터 잘림 방지).
  bboxPaddingRatio: 0.05,
  // 처리 전 최대 이미지 크기 (픽셀).
  maxProcessingSize: 1800,
  // 결과 이미지 한 변 최대 크기 - 1080으로 높여 전시 화면에서 선명하게 보임.
  outputMaxDimension: 1080,
} as const;
