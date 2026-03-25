package com.ssafy.ddoya.domain.notification.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.InputStream;

/**
 * Firebase Admin SDK를 초기 연동하는 시스템 설정 클래스입니다.
 * 앱 부트스트랩 단계 시 @PostConstruct를 통해 자격 증명을 1회 등록합니다.
 */
@Slf4j
@Configuration
public class FirebaseConfig {

    @Value("${firebase.config.path:firebase/firebase-service-key.json}")
    private String firebaseConfigPath;

    @PostConstruct
    public void initialize() {
        try {
            // 여러 번 초기화되는 것을 막기 위한 중복 등록 여부 점검
            if (FirebaseApp.getApps().isEmpty()) {
                ClassPathResource resource = new ClassPathResource(firebaseConfigPath);
                
                // 파일 경로 조회가 실패하더라도 서비스 구동 자체를 막지 않게 에러 캐치 수행
                if (!resource.exists()) {
                    log.warn("Firebase 설정(JSON) 파일을 찾을 수 없어 FCM 푸시 기능이 비활성화 결함 상태로 시작됩니다. -> {}", firebaseConfigPath);
                    return;
                }
                
                InputStream serviceAccount = resource.getInputStream();
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();

                FirebaseApp.initializeApp(options);
                log.info("Firebase Admin SDK 어플리케이션이 성공적으로 등록 초기화되었습니다.");
            }
        } catch (Exception e) {
            log.error("Firebase 초기 구동 중 치명적 에러 발생: {}", e.getMessage(), e);
            // S3처럼 서버 구동 자체를 Block하지 않도록 (현 기본 뼈대 구축 상태) 에러 래핑을 던지진 않습니다.
        }
    }
}
