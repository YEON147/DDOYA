package com.ssafy.ddoya.domain.supplement.service;

import com.ssafy.ddoya.domain.common.entity.BodyPart;
import com.ssafy.ddoya.domain.common.entity.IngredientMaster;
import com.ssafy.ddoya.domain.common.repository.BodyPartRepository;
import com.ssafy.ddoya.domain.common.repository.IngredientMasterRepository;
import com.ssafy.ddoya.domain.common.util.ImageCompressUtil;
import com.ssafy.ddoya.domain.intake.entity.IntakeSchedule;
import com.ssafy.ddoya.domain.intake.entity.ScheduleType;
import com.ssafy.ddoya.domain.intake.repository.IntakeRecordRepository;
import com.ssafy.ddoya.domain.intake.repository.IntakeScheduleRepository;
import com.ssafy.ddoya.domain.intake.service.IntakeRecordSyncService;
import com.ssafy.ddoya.domain.notification.repository.NotificationDeliveryLogRepository;
import com.ssafy.ddoya.domain.report.repository.ReportIntakeTimingRecommendationRepository;
import com.ssafy.ddoya.domain.supplement.dto.*;
import com.ssafy.ddoya.domain.supplement.dto.SupplementDetailResponse.IntakeScheduleDto;
import com.ssafy.ddoya.domain.supplement.dto.SupplementUpdateRequest.IntakeScheduleUpdateDto;
import com.ssafy.ddoya.domain.supplement.dto.SupplementListResponse.SupplementSummaryDto;
import com.ssafy.ddoya.domain.report.entity.Report;
import com.ssafy.ddoya.domain.report.repository.ReportRepository;
import com.ssafy.ddoya.domain.supplement.entity.Supplement;
import com.ssafy.ddoya.domain.supplement.entity.SupplementInventory;
import com.ssafy.ddoya.domain.supplement.entity.UserSupplementIngredient;
import com.ssafy.ddoya.domain.supplement.repository.SupplementInventoryRepository;
import com.ssafy.ddoya.domain.supplement.repository.SupplementRepository;
import com.ssafy.ddoya.domain.supplement.repository.UserSupplementIngredientRepository;
import com.ssafy.ddoya.domain.user.entity.User;
import com.ssafy.ddoya.global.exception.CustomException;
import com.ssafy.ddoya.global.util.FastApiUploadUtils;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.unit.DataSize;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

import static java.util.Collections.emptyList;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;

/**
 * 영양제 관련 비즈니스 로직을 처리하는 서비스 클래스입니다.
 * 이미지 분석(OCR), 알약 검증, 등록, 목록 및 상세 조회, 수정을 담당합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SupplementService {

    @Value("${spring.servlet.multipart.max-file-size}")
    private DataSize maxFileSize;

    @Value("${app.fastapi.url:http://localhost:8000}")
    private String fastApiUrl;

    // fastApi 준비 완료 시 제거
    @Value("${app.fastapi.mock_enabled:false}")
    private boolean isFastApiMockEnabled;

    private final ImageStorageService imageStorageService;
    private final SupplementRepository supplementRepository;
    private final UserSupplementIngredientRepository userSupplementIngredientRepository;
    private final SupplementInventoryRepository supplementInventoryRepository;
    private final IntakeScheduleRepository intakeScheduleRepository;
    private final IntakeRecordRepository intakeRecordRepository;
    private final IntakeRecordSyncService intakeRecordSyncService;
    private final NotificationDeliveryLogRepository notificationDeliveryLogRepository;
    private final ReportIntakeTimingRecommendationRepository timingRecommendationRepository;
    private final BodyPartRepository bodyPartRepository;
    private final IngredientMasterRepository ingredientMasterRepository;
    private final ReportRepository reportRepository;
    private final EntityManager entityManager;
    private final RestTemplate restTemplate;

    /**
     * 성분표 이미지를 OCR 분석하여 정규화된 성분 정보와 권장 섭취 정보를 추출합니다. (FastAPI 호출)
     *
     * @param ingredientsImg 성분표 이미지 파일
     * @return 분석 과정 중 발생한 메시지와 추출된 성분 목록을 포함한 응답 DTO
     */
    public IngredientAnalyzeResponse analyzeIngredients(MultipartFile ingredientsImg) {
        validateImageFile(ingredientsImg);
        IngredientAnalyzeResponse ocrResult = runOcr(ingredientsImg);

        // 분석 성공(success=true)인 경우에만 신체부위 ID -> 이름 변환 수행
        if (!ocrResult.isSuccess()) {
            return ocrResult;
        }
        return resolveBodyPartName(ocrResult);
    }

    /**
     * 업로드된 사진이 서버에서 인식 가능한 알약 이미지인지 검증합니다. (FastAPI 호출)
     *
     * @param pillImg 알약 사진 파일
     * @return 검증 성공 여부와 안내 메시지
     */
    public FastApiPillValidationResponse validatePillImage(MultipartFile pillImg) {
        validateImageFile(pillImg);
        return runPillImageValidation(pillImg);
    }

    /**
     * 영양제 정보를 사용자의 목록에 저장합니다.
     * 이미지 업로드, Embedding 경로 저장, 재고 및 성분 정보 저장을 포함합니다.
     *
     * @param userId                     등록할 사용자 ID
     * @param pillImg                    알약 원본 사진
     * @param request                    등록 정보 요청 DTO
     * @param pillReferenceEmbeddingPath Embedding 파일 저장 경로
     * @return 등록 완료된 상세 정보를 포함한 응답 DTO
     */
    @Transactional
    public SupplementRegisterResponse registerSupplement(Long userId, MultipartFile pillImg,
            SupplementRegisterRequest request, String pillReferenceEmbeddingPath) {
        // 1. 알약 이미지 업로드 및 URL 획득
        String pillImgUrl = uploadPillImage(pillImg);

        // 연관 엔티티 프록시 조회
        User user = entityManager.getReference(User.class, userId);
        BodyPart bodyPart = null;
        Byte bodyPartId = request.getBodyPartId();
        if (bodyPartId != null)
            bodyPart = entityManager.getReference(BodyPart.class, bodyPartId);

        // 사용자별 영양제 이름(alias) 중복 체크
        if (supplementRepository.existsByUser_UserIdAndAlias(userId, request.getAlias())) {
            throw CustomException.conflict("이미 동일한 이름의 영양제가 등록되어 있습니다: " + request.getAlias());
        }

        // 2. 영양제 기본 정보 저장
        Supplement savedSupplement = saveSupplement(user, bodyPart, pillImgUrl, request, pillReferenceEmbeddingPath);

        // 3. 재고(Inventory) 정보 초기화
        SupplementInventory inventory = saveInventory(savedSupplement, request.getCapacity());

        // 4. 추출된 성분 리스트 저장
        List<SupplementRegisterResponse.IngredientDto> ingredientDtos = saveIngredients(savedSupplement,
                request.getIngredients());

        // 5. 리포트 갱신 필요 표시
        reportRepository.findByUserId(userId).ifPresent(Report::markNeedsRefresh);

        // 응답 DTO 생성
        return buildResponse(savedSupplement, inventory,
                request.getBodyPartId(), request.getBodyPartName(), pillReferenceEmbeddingPath, ingredientDtos);
    }

    /**
     * FastAPI를 통해 성분표 이미지 분석(OCR)을 실행합니다. (FastAPI 호출)
     */
    private IngredientAnalyzeResponse runOcr(MultipartFile ingredientsImg) {
        FastApiOcrResponse ocrResponse;
        // fastApi 준비 완료 시 제거
        if (isFastApiMockEnabled) {
            ocrResponse = generateMockOcrResponse();
        }else {
            String url = fastApiUrl + "/api/ai/ocr/analyze";
            ocrResponse = postImageToFastApi(url, ingredientsImg, FastApiOcrResponse.class);
        }

        // 서버 오류 (응답 본문 없음)
        if (ocrResponse == null) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "FastAPI OCR 서버 응답 없음");
        }

        // 비즈니스 실패 (ex. 낮은 OCR 신뢰도 -> 사용자 재촬영 유도)
        if (!ocrResponse.isSuccess()) {
            return IngredientAnalyzeResponse.builder()
                    .success(false)
                    .message(ocrResponse.getMessage() != null ? ocrResponse.getMessage() : "성분표 재촬영이 필요합니다.")
                    .bodyPartId(null)
                    .bodyPartName(null)
                    .dailyDose(null)
                    .dosePerIntake(null)
                    .ingredients(Collections.emptyList())
                    .build();
        }

        // 서버 오류 (success는 true인데 data가 없음)
        if (ocrResponse.getData() == null) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "FastAPI OCR 응답 데이터(data)가 누락되었습니다.");
        }

        // 일괄 조회를 위해 ingredientId 목록 수집 (null 제외, 중복 제거)
        List<Long> ingredientIds = ocrResponse.getData().getIngredients() != null
                ? ocrResponse.getData().getIngredients().stream()
                        .map(FastApiOcrResponse.OcrIngredient::getIngredientId)
                        .filter(Objects::nonNull)
                        .distinct()
                        .collect(Collectors.toList())
                : Collections.emptyList();

        // IngredientMaster 일괄 조회 (N+1 방지)
        Map<Long, String> masterNameMap = Collections.emptyMap();
        if (!ingredientIds.isEmpty()) {
            masterNameMap = ingredientMasterRepository.findAllById(ingredientIds).stream()
                    .collect(Collectors.toMap(
                            IngredientMaster::getIngredientId,
                            IngredientMaster::getNormalizedName));
        }

        // OCR 결과 성분을 응답 DTO로 변환할 리스트 생성
        List<IngredientAnalyzeResponse.IngredientDto> mappedIngredients = new ArrayList<>();
        if (ocrResponse.getData().getIngredients() != null) {
            for (FastApiOcrResponse.OcrIngredient aiItem : ocrResponse.getData().getIngredients()) {
                Long id = aiItem.getIngredientId();

                // 성분 ID가 없으면 리스트에서 제외 (DB 저장 방지)
                if (id == null) {
                    log.info("[SupplementService] ingredient_id가 null인 성분을 분석 결과에서 제외합니다: originalName={}", aiItem.getOriginalName());
                    continue;
                }

                // 일괄 조회된 Map 에서 이름 매핑 (id 가 존재하므로 masterNameMap 에서 이름을 찾아야 함)
                String normalizedName = masterNameMap.get(id);
                boolean isPrimary = (aiItem.getIsPrimary() != null && aiItem.getIsPrimary() == 1);

                mappedIngredients.add(IngredientAnalyzeResponse.IngredientDto.builder()
                        .normalizedIngredientId(id)
                        .normalizedName(normalizedName)
                        .rawName(aiItem.getOriginalName())
                        .unit(aiItem.getUnit())
                        .amount(aiItem.getAmount())
                        .isPrimary(isPrimary)
                        .build());
            }
        }

        // 섭취 정보 매핑 (daily_dose, dose_per_intake)
        Integer dailyDose = null;
        Integer dosePerIntake = null;
        if (ocrResponse.getData().getServingInfo() != null) {
            dailyDose = ocrResponse.getData().getServingInfo().getDailyDose();
            dosePerIntake = ocrResponse.getData().getServingInfo().getDosePerIntake();
        }

        // 최종 성공 응답 반환
        return IngredientAnalyzeResponse.builder()
                .success(true)
                .message(ocrResponse.getMessage() != null ? ocrResponse.getMessage() : "OCR 분석이 완료되었습니다.")
                .bodyPartId(ocrResponse.getData().getBodyPartId())
                .dailyDose(dailyDose)
                .dosePerIntake(dosePerIntake)
                .ingredients(mappedIngredients)
                .build();
    }

    /**
     * FastAPI를 통해 알약 이미지의 유효성 검증을 실행합니다. (FastAPI 호출)
     */
    private FastApiPillValidationResponse runPillImageValidation(MultipartFile pillImg) {
        // Mock 응답 처리
        if (isFastApiMockEnabled) {
            return generateMockPillValidationResponse();
        }

        String url = fastApiUrl + "/api/ai/pills/register/check";
        FastApiPillValidationResponse validationResponse = postImageToFastApi(url, pillImg,
                FastApiPillValidationResponse.class);

        // 서버 오류 (응답 본문 없음)
        if (validationResponse == null) {
            throw new CustomException(INTERNAL_SERVER_ERROR, "FastAPI 알약 이미지 검증 서버 응답 없음");
        }

        // 비즈니스 실패 (ex. 이미지가 흐리거나 알약이 아님 -> 사용자 재촬영 유도)
        boolean isSuccess = validationResponse.isSuccess();
        String message = validationResponse.getMessage();

        if (message == null) {
            message = isSuccess ? "사용 가능한 알약 이미지입니다." : "알약 사진 재촬영이 필요합니다.";
        }

        return FastApiPillValidationResponse.builder()
                .success(isSuccess)
                .message(message)
                .build();
    }

    /**
     * FastAPI를 통해 알약 이미지 특징점(Embedding)을 추출합니다. (FastAPI 호출)
     */
    public FastApiEmbeddingResponse pillImageEmbedding(MultipartFile pillImg) {
        // Mock 응답 처리
        if (isFastApiMockEnabled) {
            return generateMockPillEmbeddingResponse();
        }

        String url = fastApiUrl + "/api/ai/pills/register/embedding";
        FastApiEmbeddingResponse fastApiEmbeddingResponse = postImageToFastApi(url, pillImg,
                FastApiEmbeddingResponse.class);

        // 서버 오류 (응답 본문 없음)
        if (fastApiEmbeddingResponse == null) {
            throw new CustomException(INTERNAL_SERVER_ERROR, "FastAPI 알약 이미지 임베딩 서버 응답 없음");
        }

        // 비즈니스 실패 (ex. 임베딩 결과 실패)
        boolean isSuccess = fastApiEmbeddingResponse.isSuccess();
        String message = fastApiEmbeddingResponse.getMessage();

        if (message == null) {
            message = isSuccess ? "임베딩 성공하였습니다." : "임베딩 실패하였습니다.";
        }

        return FastApiEmbeddingResponse.builder()
                .success(isSuccess)
                .pillReferenceEmbeddingPath(fastApiEmbeddingResponse.getPillReferenceEmbeddingPath())
                .message(message)
                .build();
    }

    /**
     * 이미지를 FastAPI 서버로 전송합니다.
     * 공통 유틸인 FastApiUploadUtils를 사용하여 "file" 키 규칙을 준수합니다.
     */
    private <T> T postImageToFastApi(String url, MultipartFile imageFile, Class<T> responseType) {
        // HTTP 요청 헤더 생성
        HttpHeaders headers = new HttpHeaders();
        // Content-Type 설정
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        // multipart/form-data 요청 body 생성
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        // FastAPI 기준 필수 필드명인 "file"로 변경
        // MultipartFile -> 온전한 Resource 포맷 변환 (422 오류 제거)
        body.add("file", FastApiUploadUtils.convertToResource(imageFile));

        // 요청 body + header를 하나의 HttpEntity로 묶음
        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            // FastAPI API 호출
            ResponseEntity<T> responseEntity = restTemplate.postForEntity(url, requestEntity, responseType);
            return responseEntity.getBody();
        } catch (Exception e) {
            log.error("FastAPI 호출 실패. url={}", url, e);
            throw new CustomException(INTERNAL_SERVER_ERROR, "FastAPI 서버 호출 실패");
        }
    }

    /**
     * fastApi 준비 완료 시 제거
     * Mock OCR 분석 결과 생성 (테스트용)
     */
    private FastApiOcrResponse generateMockOcrResponse() {
//        List<IngredientAnalyzeResponse.IngredientDto> mockIngredients = new ArrayList<>();
//        mockIngredients.add(IngredientAnalyzeResponse.IngredientDto.builder()
//                .normalizedIngredientId(1L)
//                .normalizedName("비타민C")
//                .rawName("Vitamin C")
//                .unit("mg")
//                .amount(BigDecimal.valueOf(500.0))
//                .isPrimary(true)
//                .build());
//
//        return IngredientAnalyzeResponse.builder()
//                .success(true)
//                .message("OCR 분석 완료 (Mock)")
//                .bodyPartId((byte) 3)
//                .dailyDose(2)
//                .dosePerIntake(1)
//                .ingredients(mockIngredients)
//                .build();
        FastApiOcrResponse.OcrIngredient ingredient1 = FastApiOcrResponse.OcrIngredient.builder()
                .ingredientId(null)
                .originalName("Vitamin C (L-ascorbate)")
                .unit("mg")
                .amount(BigDecimal.valueOf(500.0))
                .isPrimary(1)
                .build();

        FastApiOcrResponse.ServingInfo servingInfo = FastApiOcrResponse.ServingInfo.builder()
                .dailyDose(2)
                .dosePerIntake(1)
                .build();

        FastApiOcrResponse.OcrData data = FastApiOcrResponse.OcrData.builder()
                .bodyPartId((byte) 3)
                .ingredients(List.of(ingredient1))
                .servingInfo(servingInfo)
                .build();

        return FastApiOcrResponse.builder()
                .success(true)
                .message("OCR 분석 완료 (Mock FastAPI)")
                .data(data)
                .build();
    }

    /**
     * fastApi 준비 완료 시 제거
     * 알약 이미지 검증 결과 생성 (테스트용)
     */
    private FastApiPillValidationResponse generateMockPillValidationResponse() {
        return FastApiPillValidationResponse.builder()
                .success(true)
                .message("사용 가능한 알약 이미지입니다. (Mock)")
                .build();
    }

    /**
     * fastApi 준비 완료 시 제거
     * 알약 이미지 임베딩 결과 생성 (테스트용)
     */
    private FastApiEmbeddingResponse generateMockPillEmbeddingResponse() {
        return FastApiEmbeddingResponse.builder()
                .success(true)
                .pillReferenceEmbeddingPath("임베딩 경로 (Mock)")
                .message("임베딩 성공하였습니다. (Mock)")
                .build();
    }

    // OCR 결과의 bodyPartId로 bodyPartName 조회 (기존 success, message 정보 유지)
    private IngredientAnalyzeResponse resolveBodyPartName(IngredientAnalyzeResponse ocrResult) {
        if (ocrResult.getBodyPartId() == null) {
            return ocrResult;
        }

        String bodyPartName = bodyPartRepository.findById(ocrResult.getBodyPartId())
                .map(BodyPart::getBodyPartName)
                .orElse(null);

        return IngredientAnalyzeResponse.builder()
                .success(ocrResult.isSuccess())
                .message(ocrResult.getMessage())
                .bodyPartId(ocrResult.getBodyPartId())
                .bodyPartName(bodyPartName)
                .dailyDose(ocrResult.getDailyDose())
                .dosePerIntake(ocrResult.getDosePerIntake())
                .ingredients(ocrResult.getIngredients())
                .build();
    }

    private Supplement saveSupplement(User user, BodyPart bodyPart, String pillImgUrl,
            SupplementRegisterRequest request, String pillReferenceEmbeddingPath) {
        Supplement supplement = Supplement.builder()
                .user(user)
                .bodyPart(bodyPart)
                .alias(request.getAlias())
                .dailyDose(request.getDailyDose())
                .dosePerIntake(request.getDosePerIntake())
                .capacity(request.getCapacity())
                .pillImageUrl(pillImgUrl)
                .pillReferenceEmbeddingPath(pillReferenceEmbeddingPath)
                .build();
        return supplementRepository.save(supplement);
    }

    private SupplementInventory saveInventory(Supplement supplement, Integer capacity) {
        SupplementInventory inventory = SupplementInventory.builder()
                .supplement(supplement)
                .stockQuantity(capacity)
                .stockAlertEnabled(true)
                .build();
        return supplementInventoryRepository.save(inventory);
    }

    private List<SupplementRegisterResponse.IngredientDto> saveIngredients(
            Supplement supplement, List<SupplementRegisterRequest.IngredientDto> ingredients) {

        if (ingredients == null || ingredients.isEmpty()) {
            return emptyList();
        }

        List<UserSupplementIngredient> entities = new ArrayList<>();
        List<SupplementRegisterResponse.IngredientDto> dtos = new ArrayList<>();

        for (SupplementRegisterRequest.IngredientDto dto : ingredients) {
            // 성분 ID가 null 이면 저장에서 제외
            if (dto.getNormalizedIngredientId() == null)
                continue;

            IngredientMaster master = entityManager.getReference(IngredientMaster.class,
                    dto.getNormalizedIngredientId());
            boolean isPrimary = Boolean.TRUE.equals(dto.getIsPrimary());

            entities.add(UserSupplementIngredient.builder()
                    .supplement(supplement)
                    .normalizedIngredient(master)
                    .rawIngredientName(dto.getRawName())
                    .unit(dto.getUnit())
                    .amount(dto.getAmount())
                    .isPrimary(isPrimary)
                    .build());

            dtos.add(SupplementRegisterResponse.IngredientDto.builder()
                    .normalizedIngredientId(dto.getNormalizedIngredientId())
                    .normalizedName(dto.getNormalizedName())
                    .rawName(dto.getRawName())
                    .unit(dto.getUnit())
                    .amount(dto.getAmount())
                    .isPrimary(isPrimary)
                    .build());
        }

        if (!entities.isEmpty()) {
            userSupplementIngredientRepository.saveAll(entities);
        }
        return dtos;
    }

    private SupplementRegisterResponse buildResponse(Supplement supplement, SupplementInventory inventory,
            Byte bodyPartId, String bodyPartName, String pillReferenceEmbeddingPath,
            List<SupplementRegisterResponse.IngredientDto> ingredientDtos) {
        return SupplementRegisterResponse.builder()
                .supplementId(supplement.getUserSupplementId())
                .pillImageUrl(supplement.getPillImageUrl())
                .alias(supplement.getAlias())
                .dailyDose(supplement.getDailyDose())
                .dosePerIntake(supplement.getDosePerIntake())
                .capacity(supplement.getCapacity())
                .isReflected(supplement.isReflected())
                .bodyPartId(bodyPartId)
                .bodyPartName(bodyPartName)
                .inventoryId(inventory.getInventoryId())
                .stockQuantity(inventory.getStockQuantity())
                .pillReferenceEmbeddingPath(pillReferenceEmbeddingPath)
                .ingredients(ingredientDtos)
                .build();
    }

    // 알약 이미지 압축 후 업로드
    private String uploadPillImage(MultipartFile pillImg) {
        validateImageFile(pillImg);

        try {
            byte[] original = pillImg.getBytes();

            // 원본 이미지 압축 (긴축 1200px, 품질 0.7)
            byte[] compressed = ImageCompressUtil.compressToJpeg(original, 1200, 0.7f);

            // 압축 후 더 커지면 원본 사용
            byte[] toStore = compressed;
            String ext = "jpeg";

            if (original.length <= compressed.length) {
                toStore = original;
                String originalFilename = pillImg.getOriginalFilename();
                if (originalFilename != null && originalFilename.contains(".")) {
                    ext = originalFilename.substring(originalFilename.lastIndexOf(".") + 1);
                }
            }

            // S3 저장 로직
            return imageStorageService.upload(toStore, "supplements/pill", ext);
        } catch (IOException e) {
            throw new CustomException(INTERNAL_SERVER_ERROR, "이미지 처리 중 오류가 발생했습니다.");
        }
    }

    // 이미지 파일 유효성 검사 (빈 파일 / 크기 초과 / 지원하지 않는 형식 검사)
    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw CustomException.badRequest("빈 파일이 포함되어 있습니다.");
        }
        if (file.getSize() > maxFileSize.toBytes()) {
            throw CustomException.badRequest("이미지 파일 크기는 " + maxFileSize.toMegabytes() + "MB 이하만 가능합니다.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !(contentType.equals("image/jpeg")
                || contentType.equals("image/png")
                || contentType.equals("image/webp"))) {
            throw CustomException.badRequest("지원하지 않는 이미지 형식입니다. (jpeg/png/webp만 가능)");
        }
    }

    // 내 영양제 목록 조회
    public SupplementListResponse getMySupplements(Long userId, int page, int size) {
        // 해당 유저가 등록한 영양제를 페이징 조회
        Page<Supplement> supplementPage = supplementRepository.findByUserId(userId, PageRequest.of(page, size));
        List<Supplement> supplements = supplementPage.getContent();

        // 등록된 영양제가 없음
        if (supplements.isEmpty()) {
            return SupplementListResponse.builder()
                    .supplements(emptyList())
                    .page(page)
                    .size(size)
                    .totalElements(0)
                    .totalPages(0)
                    .hasNext(false)
                    .build();
        }

        // 조회된 영양제들의 ID를 추출
        List<Long> supplementIds = supplements.stream().map(Supplement::getUserSupplementId)
                .collect(Collectors.toList());

        // 주성분 일괄 조회 (N+1 방지)
        List<UserSupplementIngredient> primaryIngredients = userSupplementIngredientRepository
                .findPrimaryIngredientsBySupplementIds(supplementIds);

        // supplementId → 주성분명 목록 Map
        Map<Long, List<String>> primaryNameMap = primaryIngredients.stream()
                .collect(Collectors.groupingBy(
                        // key : supplementId
                        u -> u.getSupplement().getUserSupplementId(),

                        // value : 주성분 이름 리스트
                        Collectors.mapping(
                                u -> u.getNormalizedIngredient().getNormalizedName(),
                                Collectors.toList())));

        // 재고 일괄 조회 (N+1 방지)
        Map<Long, Integer> stockQuantityMap = supplementInventoryRepository
                .findBySupplementIds(supplementIds)
                .stream()
                .collect(Collectors.toMap(
                        i -> i.getSupplement().getUserSupplementId(),
                        SupplementInventory::getStockQuantity));

        // Supplement 엔티티 → 응답 DTO 변환
        List<SupplementSummaryDto> dtos = supplements.stream()
                .map(s -> SupplementSummaryDto.builder()
                        .userSupplementId(s.getUserSupplementId())
                        .pillImageUrl(s.getPillImageUrl())
                        .alias(s.getAlias())
                        .bodyPartId(s.getBodyPart() != null ? s.getBodyPart().getBodyPartId() : null)
                        .primaryIngredientNames(primaryNameMap.getOrDefault(s.getUserSupplementId(), emptyList()))
                        .stockQuantity(stockQuantityMap.getOrDefault(s.getUserSupplementId(), 0))
                        .build())
                .collect(Collectors.toList());

        // 최종 응답 객체 생성
        return SupplementListResponse.builder()
                .supplements(dtos)
                .page(supplementPage.getNumber())
                .size(supplementPage.getSize())
                .totalElements(supplementPage.getTotalElements())
                .totalPages(supplementPage.getTotalPages())
                .hasNext(supplementPage.hasNext())
                .build();
    }

    /**
     * 영양제 상세 정보 및 섭취 일정을 조회합니다.
     */
    public SupplementDetailResponse getSupplementDetail(Long userId, Long supplementId) {
        // findByIdAndUserId를 사용하도록 변경하여 성능(Fetch Join)과 권한 체크를 동시에 수행
        Supplement supplement = supplementRepository.findByIdAndUserId(supplementId, userId)
                .orElseThrow(() -> CustomException.notFound("요청한 영양제를 찾을 수 없거나 권한이 없습니다."));

        // 주성분명 목록 조회
        List<String> primaryIngredientNames = userSupplementIngredientRepository
                .findPrimaryIngredientsBySupplementIds(List.of(supplementId))
                .stream()
                .map(u -> u.getNormalizedIngredient().getNormalizedName())
                .collect(Collectors.toList());

        // 재고 조회
        SupplementInventory inventory = supplementInventoryRepository.findBySupplementIds(List.of(supplementId))
                .stream().findFirst().orElseThrow(() -> CustomException.notFound("재고 정보를 찾을 수 없습니다."));

        // 스케줄 조회
        List<IntakeScheduleDto> scheduleDtos = intakeScheduleRepository
                .findBySupplementIdAndIsActiveTrue(supplementId)
                .stream()
                .map(s -> IntakeScheduleDto.builder()
                        .scheduleId(s.getScheduleId())
                        .intakeTime(s.getIntakeTime().toString().substring(0, 5)) // HH:mm
                        .build())
                .collect(Collectors.toList());

        Byte bodyPartId = (supplement.getBodyPart() != null) ? supplement.getBodyPart().getBodyPartId() : null;

        return SupplementDetailResponse.builder()
                .userSupplementId(supplement.getUserSupplementId())
                .pillImageUrl(supplement.getPillImageUrl())
                .alias(supplement.getAlias())
                .bodyPartId(bodyPartId)
                .primaryIngredientNames(primaryIngredientNames)
                .dailyDose(supplement.getDailyDose())
                .dosePerIntake(supplement.getDosePerIntake())
                .stockQuantity(inventory.getStockQuantity())
                .stockNotificationEnabled(inventory.isStockAlertEnabled())
                .intakeSchedules(scheduleDtos)
                .build();
    }

    /**
     * 영양제 및 관련 정보를 삭제합니다.
     * FK 제약 조건 오류를 방지하기 위해 자식 데이터를 먼저 명시적으로 삭제합니다.
     */
    @Transactional
    public void deleteSupplement(Long userId, Long supplementId) {
        Supplement supplement = supplementRepository.findById(supplementId)
                .orElseThrow(() -> CustomException.notFound("요청한 영양제를 찾을 수 없습니다."));

        if (!supplement.getUser().getUserId().equals(userId)) {
            throw CustomException.forbidden("해당 영양제에 대한 권한이 없습니다.");
        }

        log.info("[Supplement 삭제 시작] id={}", supplementId);

        // 1. 리포트 관련 추천 데이터 삭제
        timingRecommendationRepository.deleteByUserSupplementId(supplementId);

        // 2. 섭취 일정 관련 자식 데이터 처리 (기록 및 알림 로그)
        List<Long> scheduleIds = intakeScheduleRepository.findIdsByUserSupplementId(supplementId);
        if (!scheduleIds.isEmpty()) {
            // 2-1. 알림 발송 로그 삭제
            notificationDeliveryLogRepository.deleteByScheduleIdIn(scheduleIds);
            // 2-2. 실제 복용 기록 삭제
            intakeRecordRepository.deleteByScheduleIdIn(scheduleIds);
        }

        // 2-3. 섭취 일정(Schedule) 삭제
        intakeScheduleRepository.deleteByUserSupplementId(supplementId);

        // 3. 기타 영양제 하위 데이터 삭제
        userSupplementIngredientRepository.deleteByUserSupplementId(supplementId);
        supplementInventoryRepository.deleteByUserSupplementId(supplementId);

        log.info("[자식 데이터 삭제 완료]");

        // 4. 부모(Supplement) 최종 삭제
        supplementRepository.delete(supplement);

        // 5. 리포트 갱신 필요 표시
        reportRepository.findByUserId(userId).ifPresent(Report::markNeedsRefresh);

        log.info("[Supplement 삭제 완료]");
    }

    /**
     * 영양제 정보를 수정하며, 섭취 일정(Schedule)은 최종 상태로 동기화합니다.
     */
    @Transactional
    public SupplementUpdateResponse updateSupplement(Long userId, Long supplementId, SupplementUpdateRequest request) {
        Supplement supplement = supplementRepository.findByIdAndUserId(supplementId, userId)
                .orElseThrow(() -> CustomException.notFound("해당 영양제를 찾을 수 없거나 권한이 없습니다."));

        // dailyDose 와 intakeSchedules 개수 일치 검증
        if (request.getDailyDose() != request.getIntakeSchedules().size()) {
            throw CustomException.badRequest(
                    "일일 섭취횟수("
                            + request.getDailyDose() + ")와 스케줄 개수("
                            + request.getIntakeSchedules().size() + ")가 일치하지 않습니다.");
        }

        // intakeTime 중복 검증
        long distinctTimeCount = request.getIntakeSchedules().stream()
                .map(IntakeScheduleUpdateDto::getIntakeTime)
                .distinct().count();
        if (distinctTimeCount != request.getIntakeSchedules().size()) {
            throw CustomException.badRequest("섭취 시각이 중복됩니다.");
        }

        // scheduleId 중복 검증
        long distinctScheduleIdCount = request.getIntakeSchedules().stream()
                .filter(s -> s.getScheduleId() != null)
                .map(IntakeScheduleUpdateDto::getScheduleId)
                .distinct().count();
        long requestedScheduleIdCount = request.getIntakeSchedules().stream()
                .filter(s -> s.getScheduleId() != null).count();
        if (distinctScheduleIdCount != requestedScheduleIdCount) {
            throw CustomException.badRequest("중복된 scheduleId가 존재합니다.");
        }

        // 영양제 기본 정보 수정
        supplement.updateBasicInfo(request.getAlias(), request.getDailyDose(), request.getDosePerIntake());

        // 재고 수정
        SupplementInventory inventory = supplementInventoryRepository.findBySupplementIds(List.of(supplementId))
                .stream().findFirst()
                .orElseThrow(() -> CustomException.notFound("재고 정보를 찾을 수 없습니다."));
        inventory.updateInventory(request.getStockQuantity(), request.getStockNotificationEnabled());

        // 기존 INTAKE 스케줄 목록 조회
        List<IntakeSchedule> existingSchedules = intakeScheduleRepository
                .findBySupplementIdAndUserIdAndScheduleTypeAndIsActiveTrue(supplementId, userId, ScheduleType.INTAKE);

        // 빠른 조회를 위해 scheduleId → IntakeSchedule Map 생성
        Map<Long, IntakeSchedule> existingMap = existingSchedules.stream()
                .collect(Collectors.toMap(IntakeSchedule::getScheduleId, s -> s));

        // 요청에 포함된 scheduleId 집합 (삭제 대상 판단용)
        Set<Long> requestedExistingIds = request.getIntakeSchedules().stream()
                .filter(s -> s.getScheduleId() != null)
                .map(IntakeScheduleUpdateDto::getScheduleId)
                .collect(Collectors.toSet());

        // 기존에는 있지만 요청에 없는 스케줄 비활성화 (물리 삭제 대신 Soft Delete)
        List<IntakeSchedule> schedulesToDeactivate = existingSchedules.stream()
                .filter(s -> !requestedExistingIds.contains(s.getScheduleId()))
                .collect(Collectors.toList());
        if (!schedulesToDeactivate.isEmpty()) {
            for (IntakeSchedule s : schedulesToDeactivate) {
                // 이력 보존을 위해 물리 삭제 대신 비활성화
                intakeRecordSyncService.syncOnUpdate(s.getScheduleId());
                s.deactivate();
            }
        }

        User userRef = entityManager.getReference(User.class, userId);
        Supplement supplementRef = entityManager.getReference(Supplement.class, supplementId);

        List<IntakeSchedule> updatedSchedules = new ArrayList<>();

        for (IntakeScheduleUpdateDto dto : request.getIntakeSchedules()) {
            LocalTime parsedTime = LocalTime.parse(dto.getIntakeTime());

            if (dto.getScheduleId() != null) {
                // scheduleId 있음 → 기존 스케줄 수정 or 교환
                IntakeSchedule existing = existingMap.get(dto.getScheduleId());
                if (existing == null) {
                    throw CustomException.badRequest("존재하지 않거나 권한이 없는 scheduleId입니다.");
                }

                // 시간이 변경된 경우에만 기존 것 비활성화 + 신규 생성 (이력 보존 목적)
                if (!existing.getIntakeTime().equals(parsedTime)) {
                    // 오늘 기록이 지워졌다면(MISSED 등) 새 레코드를 생성해야 함
                    boolean shouldRecreate = intakeRecordSyncService.syncOnUpdate(existing.getScheduleId());
                    existing.deactivate();

                    IntakeSchedule newSchedule = IntakeSchedule.builder()
                            .user(userRef)
                            .supplement(supplementRef)
                            .intakeTime(parsedTime)
                            .scheduleType(ScheduleType.INTAKE)
                            .dosePerIntake(supplement.getDosePerIntake())
                            .isActive(true)
                            .build();
                    IntakeSchedule saved = intakeScheduleRepository.save(newSchedule);
                    updatedSchedules.add(saved);
                    // 정리 여부에 따라 오늘 레코드 재생성 결정
                    intakeRecordSyncService.syncOnUpsert(saved, shouldRecreate);
                } else {
                    // 시간 변경 없으면 기존 스케줄 유지 및 동기화 (MISSED 상태 시간 수정 대응)
                    updatedSchedules.add(existing);
                    intakeRecordSyncService.syncOnUpsert(existing, true);
                }
            } else {
                IntakeSchedule newSchedule = IntakeSchedule.builder()
                        .user(userRef)
                        .supplement(supplementRef)
                        .intakeTime(parsedTime)
                        .scheduleType(ScheduleType.INTAKE)
                        .dosePerIntake(supplement.getDosePerIntake())
                        .isActive(true)
                        .build();
                IntakeSchedule saved = intakeScheduleRepository.save(newSchedule);
                updatedSchedules.add(saved);
                intakeRecordSyncService.syncOnUpsert(saved);
            }
        }

        // 응답 DTO 구성
        List<SupplementUpdateResponse.IntakeScheduleDto> scheduleDtos = updatedSchedules.stream()
                .sorted(Comparator.comparing(IntakeSchedule::getIntakeTime))
                .map(s -> SupplementUpdateResponse.IntakeScheduleDto.builder()
                        .scheduleId(s.getScheduleId())
                        .intakeTime(s.getIntakeTime().toString().substring(0, 5))
                        .build())
                .collect(Collectors.toList());

        return SupplementUpdateResponse.builder()
                .userSupplementId(supplement.getUserSupplementId())
                .alias(supplement.getAlias())
                .dailyDose(supplement.getDailyDose())
                .dosePerIntake(supplement.getDosePerIntake())
                .stockQuantity(inventory.getStockQuantity())
                .stockNotificationEnabled(inventory.isStockAlertEnabled())
                .intakeSchedules(scheduleDtos)
                .build();
    }

    /**
     * 특정 사용자가 등록한 영양제의 재구매 알림 수신 여부를 수정합니다.
     *
     * @param userId           사용자 ID
     * @param userSupplementId 영양제 ID
     * @param enabled          알림 수신 여부
     * @return 수정 결과 응답 DTO
     */
    @Transactional
    public SupplementStockNotificationUpdateResponse updateStockNotificationSetting(
            Long userId, Long userSupplementId, boolean enabled) {

        SupplementInventory inventory = supplementInventoryRepository
                .findBySupplement_UserSupplementIdAndSupplement_User_UserId(userSupplementId, userId)
                .orElseThrow(() -> CustomException.notFound("해당 영양제 또는 재고 정보를 찾을 수 없거나 권한이 없습니다."));

        inventory.updateStockAlertEnabled(enabled);

        return SupplementStockNotificationUpdateResponse.builder()
                .userSupplementId(userSupplementId)
                .stockNotificationEnabled(inventory.isStockAlertEnabled())
                .build();
    }
}
