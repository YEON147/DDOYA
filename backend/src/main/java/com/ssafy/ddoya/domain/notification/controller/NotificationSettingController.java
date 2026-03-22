package com.ssafy.ddoya.domain.notification.controller;

import com.ssafy.ddoya.domain.auth.dto.CustomUserDetails;
import com.ssafy.ddoya.domain.notification.dto.*;
import com.ssafy.ddoya.domain.notification.service.NotificationSettingService;
import com.ssafy.ddoya.global.response.SuccessResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * 사용자의 알림 수신 여부 설정 조회를 위한 API를 제공하는 컨트롤러 클래스입니다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notification-settings")
public class NotificationSettingController {

    private final NotificationSettingService notificationSettingService;

    /**
     * 현재 로그인한 사용자의 알림 수신 여부 설정 목록을 조회합니다.
     *
     * @param userDetails 인증된 사용자 정보
     * @return 알림 수신 설정 정보 응답
     */
    @GetMapping
    public ResponseEntity<SuccessResponse<NotificationSettingResponse>> getNotificationSettings(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long userId = userDetails.getUser().getUserId();
        NotificationSettingResponse result = notificationSettingService.getNotificationSettings(userId);
        return ResponseEntity.ok(SuccessResponse.of("알림 설정 조회에 성공했습니다.", result));
    }

    /** 섭취 알림 수신 여부 수정 */
    @PatchMapping("/intake")
    public ResponseEntity<SuccessResponse<NotificationSettingResponse>> updateIntakeNotificationSetting(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid NotificationSettingUpdateRequest request) {

        Long userId = userDetails.getUser().getUserId();
        NotificationSettingResponse result = notificationSettingService.updateIntakeNotificationSetting(userId, request.getEnabled());
        return ResponseEntity.ok(SuccessResponse.of("섭취 알림 설정이 변경되었습니다.", result));
    }

    /** 휴대 알림 수신 여부 수정 */
    @PatchMapping("/carry")
    public ResponseEntity<SuccessResponse<NotificationSettingResponse>> updateCarryNotificationSetting(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid NotificationSettingUpdateRequest request) {

        Long userId = userDetails.getUser().getUserId();
        NotificationSettingResponse result = notificationSettingService.updateCarryNotificationSetting(userId, request.getEnabled());
        return ResponseEntity.ok(SuccessResponse.of("휴대 알림 설정이 변경되었습니다.", result));
    }

    /** 재고 알림 수신 여부 수정 */
    @PatchMapping("/stock")
    public ResponseEntity<SuccessResponse<NotificationSettingResponse>> updateStockNotificationSetting(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid NotificationSettingUpdateRequest request) {

        Long userId = userDetails.getUser().getUserId();
        NotificationSettingResponse result = notificationSettingService.updateStockNotificationSetting(userId, request.getEnabled());
        return ResponseEntity.ok(SuccessResponse.of("재고 알림 설정이 변경되었습니다.", result));
    }
}
