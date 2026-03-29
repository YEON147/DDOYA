import React from 'react';
import { Image as RNImage } from 'react-native';
import { Image } from 'expo-image';

export const REPORT_DECOR_ACORN = require('../../assets/images/acorn.png');

let acornPrefetchStarted = false;

export function prefetchReportDecorAcorn(): void {
  if (acornPrefetchStarted) return;
  acornPrefetchStarted = true;
  const uri = RNImage.resolveAssetSource(REPORT_DECOR_ACORN)?.uri;
  if (!uri) return;
  void Image.prefetch(uri).catch(() => {});
}

export function ReportDecorAcornImage({ size }: { size: number }) {
  return (
    <Image
      source={REPORT_DECOR_ACORN}
      style={{ width: size, height: size }}
      contentFit="contain"
      cachePolicy="memory-disk"
      priority="high"
      transition={null}
    />
  );
}
