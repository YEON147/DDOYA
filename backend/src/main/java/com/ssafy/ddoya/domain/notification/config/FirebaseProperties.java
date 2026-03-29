package com.ssafy.ddoya.domain.notification.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.Base64;

/**
 * Firebase Admin SDK 설정을 관리하는 프로퍼티 클래스입니다.
 * yml의 firebase.config 프리픽스를 바인딩합니다.
 */
@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "firebase.config")
public class FirebaseProperties {

    /**
     * Firebase 서비스 계정 키 JSON 파일의 경로입니다.
     * 로컬 환경에서 classpath: 접두사를 사용하여 파일을 리소스로 읽어올 때 사용합니다.
     */
    private String path;

    /**
     * Firebase 서비스 계정 키 JSON의 Base64 인코딩 문자열입니다.
     * 운영 환경에서 환경변수(Secret)를 통해 주입받을 때 파일 직접 관리의 서버 보안 위험을 해소하기 위해 사용합니다.
     */
    private String base64;

    /**
     * Base64 인코딩된 문자열이 제공되었는지 여부를 반환합니다.
     */
    public boolean hasBase64() {
        return base64 != null && !base64.isBlank();
    }

    /**
     * 설정된 파일 경로가 제공되었는지 여부를 반환합니다.
     */
    public boolean hasPath() {
        return path != null && !path.isBlank();
    }

    /**
     * Base64 인코딩된 문자열을 바이트 배열로 디코딩합니다.
     */
    public byte[] decodeBase64() {
        if (!hasBase64()) return null;
        try {
            return Base64.getDecoder().decode(base64.trim());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
