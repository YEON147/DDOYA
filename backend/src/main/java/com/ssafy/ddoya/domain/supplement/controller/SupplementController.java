package com.ssafy.ddoya.domain.supplement.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.ddoya.domain.auth.dto.CustomUserDetails;
import com.ssafy.ddoya.domain.supplement.dto.IngredientAnalyzeResponse;
import com.ssafy.ddoya.domain.supplement.dto.SupplementDetailResponse;
import com.ssafy.ddoya.domain.supplement.dto.SupplementListResponse;
import com.ssafy.ddoya.domain.supplement.dto.SupplementRegisterRequest;
import com.ssafy.ddoya.domain.supplement.dto.SupplementRegisterResponse;
import com.ssafy.ddoya.domain.supplement.service.SupplementService;
import com.ssafy.ddoya.global.exception.CustomException;
import com.ssafy.ddoya.global.response.SuccessResponse;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/supplements")
public class SupplementController {

    private final SupplementService supplementService;
    private final ObjectMapper objectMapper;
    private final Validator validator;

    // 성분표 분석 (ocr)
    @PostMapping("/ingredients/ocr")
    public ResponseEntity<SuccessResponse<IngredientAnalyzeResponse>> analyzeIngredients(
            @RequestPart("ingredientsImg") MultipartFile ingredientsImg) {

        IngredientAnalyzeResponse result = supplementService.analyzeIngredients(ingredientsImg);
        return ResponseEntity.ok(SuccessResponse.of("성분표 분석이 완료되었습니다.", result));
    }

    // 내 영양제 등록
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> registerSupplement(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestPart("pillImg") MultipartFile pillImg,
            @RequestPart("register") String registerJson
    ) throws JsonProcessingException {

        if (userDetails == null || userDetails.getUser() == null) {
            throw CustomException.unauthorized("인증된 사용자 정보가 없습니다.");
        }
        Long userId = userDetails.getUser().getUserId();

        SupplementRegisterRequest request =
                objectMapper.readValue(registerJson, SupplementRegisterRequest.class);

        // objectMapper.readValue()는 스프링 @Valid를 우회하므로 수동 검증
        Set<ConstraintViolation<SupplementRegisterRequest>> violations = validator.validate(request);
        if (!violations.isEmpty()) {
            String message = violations.stream()
                    .map(ConstraintViolation::getMessage)
                    .collect(Collectors.joining(", "));
            throw CustomException.badRequest(message);
        }

        if (request.getIngredients() != null) {
            for (var ingredient : request.getIngredients()) {
                log.debug("normalizedIngredientId = " + ingredient.getNormalizedIngredientId());
            }
        }

        SupplementRegisterResponse result =
                supplementService.registerSupplement(userId, pillImg, request);

        return ResponseEntity.ok(SuccessResponse.of("영양제 등록을 성공했습니다.", result));
    }

    // 내 영양제 목록 조회
    @GetMapping
    public ResponseEntity<SuccessResponse<SupplementListResponse>> getMySupplements(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        if (userDetails == null || userDetails.getUser() == null) {
            throw CustomException.unauthorized("인증된 사용자 정보가 없습니다.");
        }
        Long userId = userDetails.getUser().getUserId();

        SupplementListResponse result = supplementService.getMySupplements(userId, page, size);
        return ResponseEntity.ok(SuccessResponse.of("나의 영양제 목록을 조회했습니다.", result));
    }

    // 내 영양제 상세 조회
    @GetMapping("/{supplementId}")
    public ResponseEntity<SuccessResponse<SupplementDetailResponse>> getSupplementDetail(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long supplementId) {

        if (userDetails == null || userDetails.getUser() == null) {
            throw CustomException.unauthorized("인증된 사용자 정보가 없습니다.");
        }
        Long userId = userDetails.getUser().getUserId();

        SupplementDetailResponse result = supplementService.getSupplementDetail(userId, supplementId);
        return ResponseEntity.ok(SuccessResponse.of("영양제 상세 정보를 조회했습니다.", result));
    }

    // 내 영양제 삭제
    @DeleteMapping("/{supplementId}")
    public ResponseEntity<Void> deleteSupplement(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long supplementId) {

        if (userDetails == null || userDetails.getUser() == null) {
            throw CustomException.unauthorized("인증된 사용자 정보가 없습니다.");
        }
        Long userId = userDetails.getUser().getUserId();

        supplementService.deleteSupplement(userId, supplementId);
        return ResponseEntity.noContent().build();
    }
}
