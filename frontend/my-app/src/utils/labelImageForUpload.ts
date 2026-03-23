import * as ImageManipulator from 'expo-image-manipulator';

export type PreparedLabelImage = {
  uri: string;
  mimeType: 'image/jpeg';
};

/** 한 단계 더 줄일 때 (413 재시도 등) */
export type LabelImageTier = 'normal' | 'strong';

/**
 * 성분표 OCR 업로드용 JPEG.
 * File/legacy로 용량을 재면 환경별로 깨지거나 느려질 수 있어, 해상도·품질만으로 맞춤.
 */
export async function prepareLabelImageForOcr(
  sourceUri: string,
  tier: LabelImageTier = 'normal'
): Promise<PreparedLabelImage> {
  const { width, compress } =
    tier === 'strong'
      ? { width: 768, compress: 0.36 }
      : { width: 1200, compress: 0.5 };

  const result = await ImageManipulator.manipulateAsync(
    sourceUri,
    [{ resize: { width } }],
    { compress, format: ImageManipulator.SaveFormat.JPEG }
  );

  return { uri: result.uri, mimeType: 'image/jpeg' };
}
