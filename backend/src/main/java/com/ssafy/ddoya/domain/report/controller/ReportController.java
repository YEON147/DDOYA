package com.ssafy.ddoya.domain.report.controller;

import com.ssafy.ddoya.domain.auth.dto.CustomUserDetails;
import com.ssafy.ddoya.domain.report.dto.ReportCreateResponse;
import com.ssafy.ddoya.domain.report.service.ReportService;
import com.ssafy.ddoya.global.exception.CustomException;
import com.ssafy.ddoya.global.response.SuccessResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 리포트 생성 및 갱신을 처리하는 컨트롤러입니다.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    /**
     * 로그인 사용자 기준으로 AI 리포트를 생성 또는 갱신합니다.
     * 사용자당 1개의 리포트가 유지되며, 이미 있을 경우 갱신(Upsert)합니다.
     */
    @PostMapping
    public ResponseEntity<SuccessResponse<ReportCreateResponse>> createOrUpdateReport(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        if (userDetails == null || userDetails.getUser() == null) {
            throw CustomException.unauthorized("올바르게 인증된 사용자 정보가 없습니다.");
        }

        ReportCreateResponse response = reportService.createOrUpdateReport(userDetails.getUser().getUserId());

        return ResponseEntity.ok(SuccessResponse.of("리포트 생성 또는 갱신이 완료되었습니다.", response));
    }
}
