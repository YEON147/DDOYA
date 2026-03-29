package com.ssafy.ddoya.domain.supplement.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.s3.enabled", havingValue = "true", matchIfMissing = false)
public class ImageStorageService {

    private final S3Client s3Client;

    @Value("${app.s3.bucket:ddoya-image-bucket}")
    private String bucketName;

    @Value("${aws.cloudfront.domain:}")
    private String cloudFrontDomain;

    public String upload(byte[] bytes, String pathPrefix, String ext) {
        try {
            // 파일명 랜덤 생성
            String filename = UUID.randomUUID() + "." + ext;
            
            // S3 키 생성 (경로 + 파일명)
            String s3Key = pathPrefix + "/" + filename;

            // S3에 업로드
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .contentType(getContentType(ext))
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromBytes(bytes));

            // CloudFront 도메인이 설정되어 있으면 CloudFront URL 반환, 아니면 S3 URL 반환
            if (cloudFrontDomain != null && !cloudFrontDomain.isBlank()) {
                return "https://" + cloudFrontDomain + "/" + s3Key;
            } else {
                return "https://" + bucketName + ".s3.ap-northeast-2.amazonaws.com/" + s3Key;
            }

        } catch (S3Exception e) {
            log.error("S3 업로드 실패: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "이미지 업로드에 실패했습니다.");
        }
    }

    public void deleteByUrl(String url) {
        try {
            // URL에서 S3 키 추출
            String s3Key = extractS3Key(url);

            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();

            s3Client.deleteObject(deleteRequest);
            log.info("S3 파일 삭제 완료: {}", s3Key);

        } catch (S3Exception e) {
            log.warn("S3 파일 삭제 실패: {}", e.getMessage());
        } catch (Exception e) {
            log.warn("파일 삭제 중 오류 발생: {}", e.getMessage());
        }
    }

    /**
     * URL에서 S3 키를 추출합니다.
     *
     * @param url S3 또는 CloudFront URL
     * @return S3 객체 키
     */
    private String extractS3Key(String url) {
        if (url == null || url.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "URL이 비어있습니다.");
        }

        // CloudFront URL 형식: https://cloudfront-domain/path/file.jpg
        // S3 URL 형식: https://bucket-name.s3.region.amazonaws.com/path/file.jpg

        try {
            if (url.contains(cloudFrontDomain) && cloudFrontDomain != null && !cloudFrontDomain.isBlank()) {
                // CloudFront URL에서 키 추출
                return url.substring(url.indexOf(cloudFrontDomain) + cloudFrontDomain.length() + 1);
            } else if (url.contains(".s3.") && url.contains(".amazonaws.com/")) {
                // S3 URL에서 키 추출
                return url.substring(url.indexOf(".amazonaws.com/") + ".amazonaws.com/".length());
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "잘못된 URL 형식입니다.");
            }
        } catch (Exception e) {
            log.error("S3 키 추출 실패: {}", url, e);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "URL에서 S3 키를 추출할 수 없습니다.");
        }
    }

    /**
     * 파일 확장자에 따른 Content-Type을 반환합니다.
     *
     * @param ext 파일 확장자
     * @return Content-Type
     */
    private String getContentType(String ext) {
        return switch (ext.toLowerCase()) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "webp" -> "image/webp";
            default -> "application/octet-stream";
        };
    }
}
