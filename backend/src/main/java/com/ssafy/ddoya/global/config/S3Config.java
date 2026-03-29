package com.ssafy.ddoya.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

/**
 * AWS S3 설정
 * app.s3.enabled=true 일 때만 S3Client 빈을 등록한다.
 * false(기본값) 이면 빈 자체가 생성되지 않으므로 ImageStorageService도 함께 비활성화된다.
 *
 * .env 또는 application-local.yml 에서 비활성화:
 *   S3_ENABLED=false  (또는 app.s3.enabled: false)
 */
@Configuration
@ConditionalOnProperty(name = "app.s3.enabled", havingValue = "true", matchIfMissing = false)
public class S3Config {

    @Value("${AWS_ACCESS_KEY_ID:}")
    private String accessKeyId;

    @Value("${AWS_SECRET_ACCESS_KEY:}")
    private String secretAccessKey;

    @Value("${AWS_REGION:ap-northeast-2}")
    private String region;

    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(
                        StaticCredentialsProvider.create(
                                AwsBasicCredentials.create(accessKeyId, secretAccessKey)
                        )
                )
                .build();
    }
}
