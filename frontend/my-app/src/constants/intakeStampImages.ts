import { Image as ExpoImage } from 'expo-image';
import { Image as RNImage } from 'react-native';

/** 홈 섭취 슬롯 도장 — require 경로 단일화 + 프리패치 */
export const INTAKE_STAMP_SUCCESS = require('../../assets/images/DDOYA_stamp.png');
export const INTAKE_STAMP_FAIL = require('../../assets/images/fail.png');

let stampPrefetchStarted = false;

/** 홈 진입 시 한 번만 호출: 네이티브 디코드·캐시를 미리 채워 도장이 카드와 동시에 보이게 함 */
export function prefetchIntakeStampImages(): void {
  if (stampPrefetchStarted) return;
  stampPrefetchStarted = true;
  const u1 = RNImage.resolveAssetSource(INTAKE_STAMP_SUCCESS)?.uri;
  const u2 = RNImage.resolveAssetSource(INTAKE_STAMP_FAIL)?.uri;
  const uris = [u1, u2].filter(Boolean) as string[];
  if (uris.length === 0) return;
  void ExpoImage.prefetch(uris).catch(() => {});
}
