package com.ssafy.ddoya.domain.notification.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

/**
 * Firebase Admin SDK를 초기 연동하는 시스템 설정 클래스입니다.
 * <p>
 * 초기화 전략:
 * 1. Base64 인코딩된 환경변수 설정을 우선 시도 (운영 환경 권장)
 * 2. 위 설정이 없으면 지정된 파일 경로를 통해 자격 증명 로드 시도 (로컬 환경 권장)
 * <p>
 * 앱 부트스트랩 단계에서 @PostConstruct를 통해 자격 증명을 1회 등록합니다.
 * 초기화 실패 시에도 서버 구동 자체는 차단되지 않도록 하여 결함 허용(Fault Tolerance)을 일부 제공합니다.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class FirebaseConfig {

    private final FirebaseProperties properties;
    private final ResourceLoader resourceLoader;

    @PostConstruct
    public void initialize() {
        try {
            // 여러 번 초기화되는 것을 막기 위한 중복 등록 여부 점검
            if (FirebaseApp.getApps().isEmpty()) {
                GoogleCredentials credentials = loadCredentials();

                if (credentials != null) {
                    FirebaseOptions options = FirebaseOptions.builder()
                            .setCredentials(credentials)
                            .build();

                    FirebaseApp.initializeApp(options);
                    log.info("Firebase Admin SDK 어플리케이션이 성공적으로 초기화되었습니다.");
                } else {
                    log.warn("Firebase 설정(JSON 또는 Base64)을 찾을 수 없어 FCM 푸시 기능이 비활성화 상태로 시작됩니다.");
                }
            }
        } catch (Exception e) {
            log.error("Firebase Admin SDK 초기화 중 에러 발생: {}", e.getMessage(), e);
            // 전체 서비스 기동 스톱을 막기 위해 예외를 상위로 전파하지 않음 (현행 정책 유지)
        }
    }

    /**
     * 환경 설정에 따라 GoogleCredentials를 로드합니다.
     */
    private GoogleCredentials loadCredentials() throws Exception {
        // 1. Base64 환경변수 방식 확인 (운영 환경 우선)
        byte[] decodedBytes = properties.decodeBase64();
        if (decodedBytes != null) {
            try (InputStream is = new ByteArrayInputStream(decodedBytes)) {
                log.info("Firebase Admin SDK: Base64 환경변수 정보를 통해 푸시 자격 증명을 로드합니다.");
                return GoogleCredentials.fromStream(is);
            }
        }

        // 2. 파일 경로 방식 확인 (로컬 환경 대안)
        if (properties.hasPath()) {
            Resource resource = resourceLoader.getResource(properties.getPath());
            if (resource.exists()) {
                try (InputStream is = resource.getInputStream()) {
                    log.info("Firebase Admin SDK: 파일 경로 설정을 통해 푸시 자격 증명을 로드합니다. -> {}", properties.getPath());
                    return GoogleCredentials.fromStream(is);
                }
            } else {
                log.warn("Firebase 서비스 계정 키 파일을 찾을 수 없습니다: {}", properties.getPath());
            }
        }

        return null;
    }
}
