package com.ssafy.ddoya.domain.intake.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.ddoya.domain.auth.dto.CustomUserDetails;
import com.ssafy.ddoya.domain.intake.dto.PillVerifyRequest;
import com.ssafy.ddoya.domain.intake.dto.PillVerifyResponse;
import com.ssafy.ddoya.domain.intake.service.IntakeRecordService;
import com.ssafy.ddoya.global.exception.CustomException;
import com.ssafy.ddoya.global.response.SuccessResponse;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;
import java.util.stream.Collectors;

/**
 * 사용자의 섭취 기록 및 인증과 관련된 API를 제공하는 컨트롤러 클래스입니다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/intake-records")
public class IntakeRecordController {

    private final IntakeRecordService intakeRecordService;
    private final ObjectMapper objectMapper;
    private final Validator validator;

    /**
     * 복용 사진을 업로드하여 영양제 복용 인증을 수행합니다.
     *
     * @param userDetails 인증된 사용자의 정보
     * @param image       사용자가 촬영한 복용 인증 사진
     * @param requestJson 예상 영양제 목록 등이 포함된 JSON 문자열 (RequestPart)
     * @return AI 분석 결과가 포함된 인증 성공 응답
     * @throws JsonProcessingException JSON 파싱 실패 시 발생
     */
    @PostMapping(value = "/verify", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SuccessResponse<PillVerifyResponse>> verifyPillIntake(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestPart("image") MultipartFile image,
            @RequestPart("request") String requestJson) throws JsonProcessingException {

        // 1. String JSON -> DTO 매핑
        PillVerifyRequest request = objectMapper.readValue(requestJson, PillVerifyRequest.class);

        // 2. objectMapper.readValue()는 스프링 @Valid를 우회하므로 수동 검증 수행
        Set<ConstraintViolation<PillVerifyRequest>> violations = validator.validate(request);
        if (!violations.isEmpty()) {
            String message = violations.stream()
                    .map(ConstraintViolation::getMessage)
                    .collect(Collectors.joining(", "));
            throw CustomException.badRequest(message);
        }

        // 3. 비즈니스 로직 수행
        PillVerifyResponse result = intakeRecordService.verifyPillIntake(userDetails.getUser().getUserId(), image, request);
        return ResponseEntity.ok(SuccessResponse.of("복용 사진 인증 처리가 완료되었습니다.", result));
    }
}
