export const colors = {
  background: '#F5F4F1',
  shadowDark: '#D4D1C9',
  shadowLight: '#FFFFFF',
  surface: '#FCFBF8',
  /** 섭취 루틴 카드 등 와이어 베이지 면 */
  surfaceWarm: '#F9F1DF',
  input: '#F2F1EE',
  dark: '#2A2A28',
  text: '#2A2A28',
  /** 보조 텍스트 — dark 톤과 어울리는 웜 그레이 */
  textMuted: '#6F6A62',
  primary: '#F29222',
  point: '#F18A2D',
} as const;

export type ColorToken = keyof typeof colors;
