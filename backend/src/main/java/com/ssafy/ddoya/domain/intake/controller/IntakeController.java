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

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/intake-schedules")
public class IntakeController {

    private final IntakeService intakeService;

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
