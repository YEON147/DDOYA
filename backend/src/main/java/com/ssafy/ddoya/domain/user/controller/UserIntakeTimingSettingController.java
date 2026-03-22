package com.ssafy.ddoya.domain.user.controller;

import com.ssafy.ddoya.domain.auth.dto.CustomUserDetails;
import com.ssafy.ddoya.domain.user.dto.UserIntakeTimingSettingRequest;
import com.ssafy.ddoya.domain.user.dto.UserIntakeTimingSettingResponse;
import com.ssafy.ddoya.domain.user.dto.UserIntakeTimingSettingsListResponse;
import com.ssafy.ddoya.domain.user.service.UserIntakeTimingSettingService;
import com.ssafy.ddoya.global.response.SuccessResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/intake-timing-settings")
public class UserIntakeTimingSettingController {

    private final UserIntakeTimingSettingService userIntakeTimingSettingService;

    /**
     * 로그인한 사용자의 섭취 시점별 섭취 시간 목록을 조회합니다.
     */
    @GetMapping
    public ResponseEntity<SuccessResponse<UserIntakeTimingSettingsListResponse>> getUserSettings(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long userId = userDetails.getUser().getUserId();
        UserIntakeTimingSettingsListResponse result = userIntakeTimingSettingService.getUserSettings(userId);
        return ResponseEntity.ok(SuccessResponse.of("사용자별 섭취 설정 목록을 조회했습니다.", result));
    }

    /**
     * 사용자의 특정 섭취 시점 시각을 수정합니다.
     */
    @PatchMapping("/{userIntakeTimingSettingId}")
    public ResponseEntity<SuccessResponse<UserIntakeTimingSettingResponse>> updateIntakeTime(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long userIntakeTimingSettingId,
            @RequestBody @Valid UserIntakeTimingSettingRequest request) {

        Long userId = userDetails.getUser().getUserId();
        UserIntakeTimingSettingResponse result = userIntakeTimingSettingService.updateIntakeTime(userId, userIntakeTimingSettingId, request);
        return ResponseEntity.ok(SuccessResponse.of("섭취 시각이 성공적으로 수정되었습니다.", result));
    }
}
