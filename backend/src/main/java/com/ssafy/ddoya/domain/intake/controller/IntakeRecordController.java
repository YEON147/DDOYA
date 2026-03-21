package com.ssafy.ddoya.domain.intake.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.ddoya.domain.auth.dto.CustomUserDetails;
import com.ssafy.ddoya.domain.intake.dto.FastApiPillVerifyResponse;
import com.ssafy.ddoya.domain.intake.dto.PillVerifyRequest;
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

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/intake-records")
public class IntakeRecordController {

    private final IntakeRecordService intakeRecordService;
    private final ObjectMapper objectMapper;
    private final Validator validator;

    /**
     * 복용 사진 인증 API
     */
    @PostMapping(value = "/verify", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SuccessResponse<FastApiPillVerifyResponse>> verifyPillIntake(
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
        FastApiPillVerifyResponse result = intakeRecordService.verifyPillIntake(image, request);
        return ResponseEntity.ok(SuccessResponse.of("복용 사진 인증 처리가 완료되었습니다.", result));
    }
}
