import type { ImageSourcePropType } from 'react-native';

/** 서버 `bodyPartId`(1~9) → 로컬 일러스트 */
export const BODY_PART_IMAGE_BY_ID = {
  1: require('../assets/images/bodypart/뇌 · 신경계.png'),
  2: require('../assets/images/bodypart/눈 · 귀 · 구강.png'),
  3: require('../assets/images/bodypart/심장 · 혈관 · 혈액.png'),
  4: require('../assets/images/bodypart/폐 · 호흡기.png'),
  5: require('../assets/images/bodypart/위 · 장 · 소화기관.png'),
  6: require('../assets/images/bodypart/간 · 췌장 · 담낭.png'),
  7: require('../assets/images/bodypart/신장 · 방광 · 요로.png'),
  8: require('../assets/images/bodypart/뼈 · 관절 · 근육.png'),
  9: require('../assets/images/bodypart/피부 · 모발 · 손톱.png'),
} as const;

export const DEFAULT_BODY_PART_IMAGE: ImageSourcePropType = BODY_PART_IMAGE_BY_ID[1];

export function getBodyPartImageSource(bodyPartId: number | null | undefined): ImageSourcePropType {
  if (bodyPartId == null) return DEFAULT_BODY_PART_IMAGE;
  const img = BODY_PART_IMAGE_BY_ID[bodyPartId as keyof typeof BODY_PART_IMAGE_BY_ID];
  return img ?? DEFAULT_BODY_PART_IMAGE;
}
