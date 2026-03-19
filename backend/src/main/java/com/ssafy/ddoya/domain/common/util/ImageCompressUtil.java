package com.ssafy.ddoya.domain.common.util;

import com.sksamuel.scrimage.ImmutableImage;
import net.coobird.thumbnailator.Thumbnails;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

public class ImageCompressUtil {
    // originalBytes : 원본 이미지 파일(byte 배열), maxSizePx : 이미지의 최대 가로/세로 길이, quality : 화질 (0.0 ~ 1.0)
    public static byte[] compressToJpeg(byte[] originalBytes, int maxSizePx, float quality) {
        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            // byte[] → 이미지로 변환
            Thumbnails.of(new java.io.ByteArrayInputStream(originalBytes))
                    .size(maxSizePx, maxSizePx) // 비율 유지하면서 최대 크기 제한
                    .outputFormat("jpg") // jpg로 통일
                    .outputQuality(quality) // 화질 조절
                    .toOutputStream(os);

            return os.toByteArray(); // 압축된 JPG 이미지의 byte[]
        } catch (IOException e) {
            throw new RuntimeException("이미지 압축 실패", e);
        }
    }

    private static ImmutableImage resizeToFit(ImmutableImage image, int maxSizePx) {
        int w = image.width;
        int h = image.height;

        if (w <= maxSizePx && h <= maxSizePx) {
            return image;
        }

        if (w >= h) {
            return image.scaleToWidth(maxSizePx);
        } else {
            return image.scaleToHeight(maxSizePx);
        }
    }
}
