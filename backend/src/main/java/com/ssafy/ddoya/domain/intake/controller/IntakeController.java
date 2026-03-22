package com.ssafy.ddoya.domain.intake.controller;

import com.ssafy.ddoya.domain.auth.dto.CustomUserDetails;
import com.ssafy.ddoya.domain.intake.dto.IntakeScheduleResponse;
import com.ssafy.ddoya.domain.intake.service.IntakeService;
import com.ssafy.ddoya.global.response.SuccessResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

/**
 * 사용자의 영양제 섭취 일정과 관련된 API를 제공하는 컨트롤러 클래스입니다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/intake-schedules")
public class IntakeController {

    private final IntakeService intakeService;

    /**
     * 일별 섭취 스케줄 정보를 조회합니다.
     * 날짜 파라미터가 없는 경우 오늘 날짜를 기준으로 조회합니다.
     *
     * @param userDetails 인증된 사용자의 정보
     * @param date        조회할 대상 날짜 (Optional, 기본값: 오늘)
     * @return 섭취 일정 응답 데이터
     */
    @GetMapping
    public ResponseEntity<SuccessResponse<IntakeScheduleResponse>> getDailyIntakeSchedules(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        Long userId = userDetails.getUser().getUserId();
        LocalDate targetDate = (date != null) ? date : LocalDate.now();

        IntakeScheduleResponse response = intakeService.getDailySchedules(userId, targetDate);
        return ResponseEntity.ok(SuccessResponse.of("일별 섭취 스케줄 조회가 완료되었습니다.", response));
    }
}
