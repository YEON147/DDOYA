package com.ssafy.ddoya.domain.notification.controller;

import com.ssafy.ddoya.domain.auth.dto.CustomUserDetails;
import com.ssafy.ddoya.domain.notification.dto.DeviceTokenRegisterRequest;
import com.ssafy.ddoya.domain.notification.dto.NotificationListResponse;
import com.ssafy.ddoya.domain.notification.dto.PushSendRequest;
import com.ssafy.ddoya.domain.notification.service.DeviceTokenService;
import com.ssafy.ddoya.domain.notification.service.NotificationFacade;
import com.ssafy.ddoya.domain.notification.service.NotificationService;
import com.ssafy.ddoya.global.exception.CustomException;
import com.ssafy.ddoya.global.response.SuccessResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 앱 사용자의 기기 토큰 등록/삭제 및 디버깅을 위한 API 컨트롤러입니다.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
public class NotificationController {

    private final DeviceTokenService deviceTokenService;
    private final NotificationFacade notificationFacade;
    private final NotificationService notificationService;

    /**
     * 사용자의 모든 알림 내역을 최신순으로 페이징 조회합니다.
     */
    @GetMapping
    public ResponseEntity<SuccessResponse<NotificationListResponse>> getNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            Pageable pageable) {
        
        validateUser(userDetails);
        NotificationListResponse response = notificationService.getNotifications(userDetails.getUser().getUserId(), pageable);
        
        return ResponseEntity.ok(SuccessResponse.of("알림 내역 조회가 완료되었습니다.", response));
    }

    /**
     * 사용자의 모든 알림 내역을 전체 삭제 처리합니다.
     */
    @DeleteMapping
    public ResponseEntity<SuccessResponse<Void>> deleteAllNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        validateUser(userDetails);
        notificationService.deleteAllNotifications(userDetails.getUser().getUserId());
        
        return ResponseEntity.ok(SuccessResponse.of("알림 내역 전체 삭제가 완료되었습니다.", null));
    }

    /**
     * 사용자 기기의 가장 최신화된 FCM 토큰을 기록합니다.
     */
    @PostMapping("/tokens")
    public ResponseEntity<SuccessResponse<Void>> registerToken(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody DeviceTokenRegisterRequest request) {
        
        validateUser(userDetails);
        deviceTokenService.registerToken(userDetails.getUser().getUserId(), request);
        
        return ResponseEntity.ok(SuccessResponse.of("기기의 FCM 푸시 토큰이 정상적으로 등록/갱신 완료되었습니다.", null));
    }

    /**
     * 사용자가 기기 로그아웃 또는 푸시 비동의 시 서버에 저장된 활성화 토큰을 죽이는 API입니다.
     */
    @DeleteMapping("/tokens")
    public ResponseEntity<SuccessResponse<Void>> deactivateToken(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> request) {
        
        validateUser(userDetails);
        String fcmToken = request.get("fcmToken");
        
        if (fcmToken == null || fcmToken.isBlank()) {
            throw CustomException.badRequest("비활성화할 대상 FCM 토큰 정보가 누락되었습니다.");
        }
        
        deviceTokenService.deactivateToken(userDetails.getUser().getUserId(), fcmToken);
        
        return ResponseEntity.ok(SuccessResponse.of("요청하신 FCM 기기 수신 토큰이 비활성화되었습니다.", null));
    }

    /**
     * [테스트용 전용 도구] 임의의 특정 대상(userId)에게 지정한 Payload를 포함하여 푸시 노티를 강제 발송합니다.
     */
    @PostMapping("/test")
    public ResponseEntity<SuccessResponse<Void>> sendTestPush(
            @Valid @RequestBody PushSendRequest request) {
        
        // 주의: 운영기 적용 전에 반드시 관리자 ROLE_ADMIN 인증 체크나 망 분리가 사전에 필요합니다!
        notificationFacade.sendTestNotification(
                request.getUserId(),
                request.getTitle(),
                request.getBody(),
                request.getData()
        );
        
        return ResponseEntity.ok(SuccessResponse.of("Firebase 클라우드를 통한 테스트 푸시 호출 스레드가 정상 종료되었습니다.", null));
    }
    
    // 단순 권한 우회 체크용 방어 로직
    private void validateUser(CustomUserDetails userDetails) {
        if (userDetails == null || userDetails.getUser() == null) {
            throw CustomException.unauthorized("올바르게 인증되고 권한 부여된 사용자 정보가 존재하지 않습니다.");
        }
    }
}
