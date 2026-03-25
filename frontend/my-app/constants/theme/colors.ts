export const colors = {
  /** Soft Wellness — 앱 전체 베이스 (웜 아이보리) */
  background: '#F9F7F3',
  shadowDark: '#D4D1C9',
  shadowLight: '#FFFFFF',
  /** 본문 카드·면 (배경보다 살짝 밝게) */
  surface: '#FCFAF6',
  /** 강조 카드 — 아이보리 */
  cardIvory: '#FFFEFB',
  /** 섭취 루틴 카드 등 와이어 베이지 면 */
  surfaceWarm: '#F3EDE6',
  input: '#F3F1ED',
  dark: '#2A2A28',
  text: '#2A2A28',
  /** 보조 텍스트 — dark 톤과 어울리는 웜 그레이 */
  textMuted: '#6F6A62',
  /** 라인 아이콘 통일 톤 (#555~#777 계열) */
  iconMuted: '#66615C',
  primary: '#F29222',
  point: '#F18A2D',
} as const;

export type ColorToken = keyof typeof colors;
