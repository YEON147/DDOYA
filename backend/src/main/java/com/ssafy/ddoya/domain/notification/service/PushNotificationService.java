package com.ssafy.ddoya.domain.notification.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.ssafy.ddoya.domain.notification.entity.DeviceToken;
import com.ssafy.ddoya.domain.notification.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 실질적인 푸시 메시지 객체를 만들고 Firebase Admin SDK 통신을 연동하는 하위 서비스입니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PushNotificationService {

    private final DeviceTokenService deviceTokenService;

    /**
     * 특정 사용자 식별자(PK)를 받아서, 현재 살아있는 모든 기기로 알림을 브로드캐스팅합니다.
     */
    public void sendToUser(Long userId, String title, String body, NotificationType type, Map<String, String> data) {
        List<DeviceToken> activeTokens = deviceTokenService.getActiveTokens(userId);

        if (activeTokens.isEmpty()) {
            log.info("푸시 알림 대상 스킵: 해당 사용자는({userId={}})는 활성화된 푸시 알림 기기가 존재하지 않습니다.", userId);
            return;
        }

        // 대상자마다 각각 개인 발송 처리 진행
        for (DeviceToken token : activeTokens) {
            sendToToken(token.getFcmToken(), title, body, type, data);
        }
    }

    /**
     * 단일 FCM 문자열 토큰으로 알림 한 건을 실발송합니다. 
     */
    public void sendToToken(String fcmToken, String title, String body, NotificationType type, Map<String, String> data) {
        if (data == null) {
            data = new HashMap<>();
        }
        // 알림 클릭 이후 클라이언트 앱 라우팅 등을 위해 알림 고유 타입 항상 data 내부에 주입
        data.put("notificationType", type.name());

        Message message = Message.builder()
                .setToken(fcmToken)
                // 기본 OS 팝업 노티스 알림 내용
                .setNotification(Notification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .build())
                // 앱에 몰래 전달해야 하는 Payload
                .putAllData(data)
                .build();

        try {
            // Firebase 서버에 최종 발사
            String response = FirebaseMessaging.getInstance().send(message);
            log.info("성공! FCM 푸시 전송 완료 - token: {}, response: {}", truncateToken(fcmToken), response);
        } catch (Exception e) {
            log.error("에러! FCM 푸시 발송 실패 - token: {}, error: {}", truncateToken(fcmToken), e.getMessage());
            // TODO: Unregistered 에러 응답 발생 시 여기서 deviceTokenService.deactivateToken() 처리 로직으로 확장하여 무효화 토큰 즉시 가비지 컬렉팅.
        }
    }

    private String truncateToken(String token) {
        if (token == null) return "null";
        if (token.length() <= 10) return token;
        return token.substring(0, 10) + "...";
    }
}
