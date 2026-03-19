package com.ssafy.ddoya.domain.supplement.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.ddoya.domain.auth.dto.CustomUserDetails;
import com.ssafy.ddoya.domain.supplement.dto.*;
import com.ssafy.ddoya.domain.supplement.service.SupplementService;
import com.ssafy.ddoya.global.exception.CustomException;
import com.ssafy.ddoya.global.response.SuccessResponse;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Valid;
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

/**
 * 영양제 관련 API를 제공하는 컨트롤러입니다.
 * 영양제 분석(OCR), 알약 검증, 등록, 목록 조회, 상세 정보 및 수정을 담당합니다.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/supplements")
public class SupplementController {

    private final SupplementService supplementService;
    private final ObjectMapper objectMapper;
    private final Validator validator;

    /**
     * 성분표 이미지를 분석하여 영양소 정보를 추출합니다.
     *
     * @param ingredientsImg 성분표 이미지 파일 (MultipartFile)
     * @return 분석된 성분 정보 및 권장 섭취량 정보를 담은 SuccessResponse
     */
    @PostMapping("/ingredients/ocr")
    public ResponseEntity<SuccessResponse<IngredientAnalyzeResponse>> analyzeIngredients(
            @RequestPart("ingredientsImg") MultipartFile ingredientsImg) {

        IngredientAnalyzeResponse result = supplementService.analyzeIngredients(ingredientsImg);
        return ResponseEntity.ok(SuccessResponse.of("성분표 분석이 완료되었습니다.", result));
    }

    /**
     * 업로드된 사진이 사용 가능한 알약 이미지인지 검증합니다.
     *
     * @param pillImg 알약 이미지 파일 (MultipartFile)
     * @return 검증 성공 여부 및 메시지를 담은 SuccessResponse
     */
    @PostMapping("/pill/validate")
    public ResponseEntity<SuccessResponse<FastApiPillValidationResponse>> validatePillImage(
            @RequestPart("pillImg") MultipartFile pillImg) {
        FastApiPillValidationResponse result = supplementService.validatePillImage(pillImg);
        return ResponseEntity.ok(SuccessResponse.of("알약 검증이 완료되었습니다.", result));
    }

    /**
     * 새로운 영양제를 사용자의 목록에 등록합니다.
     * 알약 이미지 임베딩 추출 후 함께 저장합니다.
     *
     * @param userDetails  인증된 사용자 정보
     * @param pillImg      알약 이미지 파일
     * @param registerJson 영양제 등록 정보 (JSON 문자열)
     * @return 등록된 영양제 정보를 담은 SuccessResponse
     * @throws JsonProcessingException JSON 파싱 오류 시 발생
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> registerSupplement(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestPart("pillImg") MultipartFile pillImg,
            @RequestPart("register") String registerJson) throws JsonProcessingException {

        if (userDetails == null || userDetails.getUser() == null) {
            throw CustomException.unauthorized("인증된 사용자 정보가 없습니다.");
        }
        Long userId = userDetails.getUser().getUserId();

        SupplementRegisterRequest request = objectMapper.readValue(registerJson, SupplementRegisterRequest.class);

        // objectMapper.readValue()는 스프링 @Valid를 우회하므로 수동 검증 수행
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

        // 알약 이미지 Embedding 추출 요청
        FastApiEmbeddingResponse pillReferenceEmbeddingResult = supplementService.pillImageEmbedding(pillImg);

        // 최종 영양제 및 성분 정보 저장
        SupplementRegisterResponse result = supplementService.registerSupplement(userId, pillImg, request,
                pillReferenceEmbeddingResult.getPillReferenceEmbeddingPath());

        return ResponseEntity.ok(SuccessResponse.of("영양제 등록을 성공했습니다.", result));
    }

    /**
     * 현재 사용자가 등록한 영양제 목록을 페이징하여 조회합니다.
     *
     * @param userDetails 인증된 사용자 정보
     * @param page        페이지 번호 (0부터 시작)
     * @param size        페이지 크기
     * @return 영양제 목록 정보를 담은 SuccessResponse
     */
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

    /**
     * 특정 영양제의 상세 정보를 조회합니다.
     *
     * @param userDetails  인증된 사용자 정보
     * @param supplementId 조회할 영양제 ID
     * @return 영양제 상세 정보를 담은 SuccessResponse
     */
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

    /**
     * 등록된 영양제를 삭제합니다. 관련 재고 및 섭취 일정 정보도 함께 삭제됩니다.
     *
     * @param userDetails  인증된 사용자 정보
     * @param supplementId 삭제할 영양제 ID
     * @return 응답 본문 없는SuccessResponse (204 No Content)
     */
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

    /**
     * 영양제의 상세 정보(별칭, 섭취 빈도, 재고 등)를 수정합니다.
     * 섭취 일정은 최종 상태로 동기화(Sync) 처리됩니다.
     *
     * @param userDetails  인증된 사용자 정보
     * @param supplementId 수정할 영양제 ID
     * @param request      수정할 정보 요청 DTO
     * @return 수정된 영양제 정보를 담은 SuccessResponse
     */
    @PatchMapping("/{supplementId}")
    public ResponseEntity<SuccessResponse<SupplementUpdateResponse>> updateSupplement(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long supplementId,
            @Valid @RequestBody SupplementUpdateRequest request) {

        if (userDetails == null || userDetails.getUser() == null) {
            throw CustomException.unauthorized("인증된 사용자 정보가 없습니다.");
        }
        Long userId = userDetails.getUser().getUserId();

        SupplementUpdateResponse result = supplementService.updateSupplement(userId, supplementId, request);
        return ResponseEntity.ok(SuccessResponse.of("영양제 정보를 수정했습니다.", result));
    }
}
