import { Image as ExpoImage } from 'expo-image';
import { Image as RNImage } from 'react-native';

export const REPORT_SQUIRREL_IMAGE = require('../../assets/images/DDOYA_report.png');

let prefetchStarted = false;

export function prefetchReportSquirrelImage(): void {
  if (prefetchStarted) return;
  prefetchStarted = true;
  const uri = RNImage.resolveAssetSource(REPORT_SQUIRREL_IMAGE)?.uri;
  if (!uri) return;
  void ExpoImage.prefetch(uri).catch(() => {});
}
