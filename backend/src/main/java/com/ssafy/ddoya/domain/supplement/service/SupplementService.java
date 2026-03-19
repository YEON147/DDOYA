package com.ssafy.ddoya.domain.supplement.service;

import com.ssafy.ddoya.domain.common.entity.BodyPart;
import com.ssafy.ddoya.domain.common.entity.IngredientMaster;
import com.ssafy.ddoya.domain.common.repository.BodyPartRepository;
import com.ssafy.ddoya.domain.common.repository.IngredientMasterRepository;
import com.ssafy.ddoya.domain.common.util.ImageCompressUtil;
import com.ssafy.ddoya.domain.intake.entity.IntakeSchedule;
import com.ssafy.ddoya.domain.intake.entity.ScheduleType;
import com.ssafy.ddoya.domain.intake.repository.IntakeScheduleRepository;
import com.ssafy.ddoya.domain.supplement.dto.FastApiOcrResponse;
import com.ssafy.ddoya.domain.supplement.dto.IngredientAnalyzeResponse;
import com.ssafy.ddoya.domain.supplement.dto.SupplementDetailResponse;
import com.ssafy.ddoya.domain.supplement.dto.SupplementDetailResponse.IntakeScheduleDto;
import com.ssafy.ddoya.domain.supplement.dto.SupplementUpdateRequest;
import com.ssafy.ddoya.domain.supplement.dto.SupplementUpdateRequest.IntakeScheduleUpdateDto;
import com.ssafy.ddoya.domain.supplement.dto.SupplementUpdateResponse;
import com.ssafy.ddoya.domain.supplement.dto.SupplementListResponse;
import com.ssafy.ddoya.domain.supplement.dto.SupplementListResponse.SupplementSummaryDto;
import com.ssafy.ddoya.domain.supplement.dto.SupplementRegisterRequest;
import com.ssafy.ddoya.domain.supplement.dto.SupplementRegisterResponse;
import com.ssafy.ddoya.domain.supplement.entity.Supplement;
import com.ssafy.ddoya.domain.supplement.entity.SupplementInventory;
import com.ssafy.ddoya.domain.supplement.entity.UserSupplementIngredient;
import com.ssafy.ddoya.domain.supplement.repository.SupplementInventoryRepository;
import com.ssafy.ddoya.domain.supplement.repository.SupplementRepository;
import com.ssafy.ddoya.domain.supplement.repository.UserSupplementIngredientRepository;
import com.ssafy.ddoya.domain.user.entity.User;
import com.ssafy.ddoya.global.exception.CustomException;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.unit.DataSize;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static java.nio.file.Files.write;
import static java.util.Collections.emptyList;
import static java.util.UUID.randomUUID;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;

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

    // S3 준비 완료 시 주석 해제
    // private final ImageStorageService imageStorageService;
    private final SupplementRepository supplementRepository;
    private final UserSupplementIngredientRepository userSupplementIngredientRepository;
    private final SupplementInventoryRepository supplementInventoryRepository;
    private final IntakeScheduleRepository intakeScheduleRepository;
    private final BodyPartRepository bodyPartRepository;
    private final IngredientMasterRepository ingredientMasterRepository;
    private final EntityManager entityManager;

    // 성분표 분석 (FastAPI 호출)
    public IngredientAnalyzeResponse analyzeIngredients(MultipartFile ingredientsImg) {
        validateImageFile(ingredientsImg);
        IngredientAnalyzeResponse ocrResult = runOcr(ingredientsImg);
        return resolveBodyPartName(ocrResult);
    }

    // 영양제 등록
    @Transactional
    public SupplementRegisterResponse registerSupplement(Long userId, MultipartFile pillImg,
            SupplementRegisterRequest request) {
        // 알약 이미지 업로드
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

        // 영양제 저장 (is_reflected 기본값: false)
        Supplement savedSupplement = saveSupplement(user, bodyPart, pillImgUrl, request);

        // 재고 저장 (stock_quantity=capacity, stock_alert_enabled=true)
        SupplementInventory inventory = saveInventory(savedSupplement, request.getCapacity());

        // 성분 저장 (analyze API 응답값을 프론트가 그대로 전달)
        List<SupplementRegisterResponse.IngredientDto> ingredientDtos = saveIngredients(savedSupplement,
                request.getIngredients());

        // 응답 DTO 생성
        return buildResponse(savedSupplement, inventory,
                request.getBodyPartId(), request.getBodyPartName(), ingredientDtos);
    }

    /**
     * 성분표 이미지 OCR 분석 (FastAPI 연동)
     */
    private IngredientAnalyzeResponse runOcr(MultipartFile ingredientsImg) {
        // fastApi 준비 완료 시 제거
        if (isFastApiMockEnabled) {
            return generateMockOcrResponse();
        }

        String url = fastApiUrl + "/api/ai/ocr/analyze";

        // HTTP 요청 헤더 생성
        HttpHeaders headers = new HttpHeaders();
        // Content-Type 설정
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        // multipart/form-data 요청 body 생성
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        try {
            // MultipartFile → ByteArrayResource 변환
            // RestTemplate multipart 요청 시 Resource 타입을 사용해야 파일로 인식됨
            ByteArrayResource resource = new ByteArrayResource(ingredientsImg.getBytes()) {
                // 파일명을 반환하도록 override
                // 일부 서버에서는 filename이 없으면 파일 파싱을 못할 수 있음
                @Override
                public String getFilename() {
                    return ingredientsImg.getOriginalFilename() != null ? ingredientsImg.getOriginalFilename()
                            : "ingredientImg.jpg";
                }
            };

            // multipart body에 파일 추가
            // FastAPI에서 받을 필드명이 "image" 이므로 동일하게 설정
            body.add("image", resource);
        } catch (IOException e) {
            throw new CustomException(INTERNAL_SERVER_ERROR, "성분표 이미지 읽기 실패");
        }

        // 요청 body + header를 하나의 HttpEntity로 묶음
        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        // FastAPI 호출을 위한 RestTemplate 생성
        RestTemplate restTemplate = new RestTemplate();

        ResponseEntity<FastApiOcrResponse> responseEntity;

        try {
            // FastAPI OCR API 호출
            // 요청: multipart/form-data (image 파일)
            // 응답: FastApiOcrResponse DTO로 매핑
            responseEntity = restTemplate.postForEntity(url, requestEntity, FastApiOcrResponse.class);
        } catch (Exception e) {
            throw new CustomException(INTERNAL_SERVER_ERROR, "FastAPI OCR 서버 호출 실패: " + e.getMessage());
        }

        // FastAPI 응답 body 추출
        FastApiOcrResponse ocrResponse = responseEntity.getBody();
        // 응답 유효성 검증
        if (ocrResponse == null || !ocrResponse.isSuccess() || ocrResponse.getData() == null) {
            throw new CustomException(INTERNAL_SERVER_ERROR, "FastAPI OCR 서버 분석 실패");
        }

        // OCR 결과 성분을 응답 DTO로 변환할 리스트
        List<IngredientAnalyzeResponse.IngredientDto> mappedIngredients = new ArrayList<>();
        // FastAPI 응답의 성분 목록이 존재하면 변환 진행
        if (ocrResponse.getData().getIngredients() != null) {
            for (FastApiOcrResponse.OcrIngredient aiItem : ocrResponse.getData().getIngredients()) {

                // FastAPI가 반환한 ingredient_id
                Long ingredientId = aiItem.getIngredientId();

                // DB에서 ingredient_id 로 정규화된 이름(normalizedName) 조회 (화면 표시용)
                String normalizedName = null;
                if (ingredientId != null) {
                    normalizedName = ingredientMasterRepository.findById(ingredientId)
                            .map(IngredientMaster::getNormalizedName)
                            .orElse(null);
                }

                boolean isPrimary = (aiItem.getIsPrimary() != null && aiItem.getIsPrimary() == 1);

                // OCR 응답 데이터를 응답 DTO로 매핑
                mappedIngredients.add(IngredientAnalyzeResponse.IngredientDto.builder()
                        .normalizedIngredientId(ingredientId)
                        .normalizedName(normalizedName)
                        .rawName(aiItem.getOriginalName())
                        .unit(aiItem.getUnit())
                        .amount(aiItem.getAmount())
                        .isPrimary(isPrimary)
                        .build());
            }
        }

        // 최종적으로 프론트에 반환할 분석 결과 DTO 생성
        return IngredientAnalyzeResponse.builder()
                // FastAPI가 판단한 대표 신체부위 ID
                .bodyPartId(ocrResponse.getData().getBodyPartId())

                // 변환된 성분 리스트
                .ingredients(mappedIngredients)
                .build();
    }

    /**
     * fastApi 준비 완료 시 제거
     * Mock OCR 분석 결과 생성 (테스트용)
     */
    private IngredientAnalyzeResponse generateMockOcrResponse() {
        List<IngredientAnalyzeResponse.IngredientDto> mockIngredients = new ArrayList<>();
        mockIngredients.add(IngredientAnalyzeResponse.IngredientDto.builder()
                .normalizedIngredientId(1L)
                .normalizedName("비타민C")
                .rawName("Vitamin C")
                .unit("mg")
                .amount(java.math.BigDecimal.valueOf(500.0))
                .isPrimary(true)
                .build());

        mockIngredients.add(IngredientAnalyzeResponse.IngredientDto.builder()
                .normalizedIngredientId(2L)
                .normalizedName("아연")
                .rawName("Zinc")
                .unit("mg")
                .amount(java.math.BigDecimal.valueOf(8.5))
                .isPrimary(false)
                .build());

        return IngredientAnalyzeResponse.builder()
                .bodyPartId((byte) 3)
                .ingredients(mockIngredients)
                .build();
    }

    // OCR 결과의 bodyPartId로 bodyPartName 조회
    private IngredientAnalyzeResponse resolveBodyPartName(IngredientAnalyzeResponse ocrResult) {
        if (ocrResult.getBodyPartId() == null) {
            return ocrResult;
        }

        String bodyPartName = bodyPartRepository.findById(ocrResult.getBodyPartId())
                .map(BodyPart::getBodyPartName)
                .orElse(null);

        return IngredientAnalyzeResponse.builder()
                .bodyPartId(ocrResult.getBodyPartId())
                .bodyPartName(bodyPartName)
                .ingredients(ocrResult.getIngredients())
                .build();
    }

    private Supplement saveSupplement(User user, BodyPart bodyPart, String pillImgUrl,
            SupplementRegisterRequest request) {
        Supplement supplement = Supplement.builder()
                .user(user)
                .bodyPart(bodyPart)
                .alias(request.getAlias())
                .dailyDose(request.getDailyDose())
                .dosePerIntake(request.getDosePerIntake())
                .capacity(request.getCapacity())
                .pillImageUrl(pillImgUrl)
                .build();
        return supplementRepository.save(supplement);
    }

    private SupplementInventory saveInventory(Supplement supplement, Integer capacity) {
        SupplementInventory inventory = SupplementInventory.builder()
                .supplement(supplement)
                .stockQuantity(capacity)
                .stockAlertEnabled(true) // 재고 알림 기본값: true
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
            Byte bodyPartId, String bodyPartName,
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

            // S3 준비 완료 시 주석 해제
            // --- [S3 저장 로직] ---
            // return imageStorageService.upload(toStore, "supplements/pill", ext);

            // S3 준비 완료 시 제거
            // --- [로컬 저장 로직 (테스트용)] ---
            String filename = randomUUID() + "." + ext;
            File directory = new File("uploads/supplements/pill");
            if (!directory.exists()) {
                directory.mkdirs();
            }
            write(new File(directory, filename).toPath(), toStore);
            return "/uploads/supplements/pill/" + filename;
            // ────────────────────────────────────

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
            throw CustomException.badRequest(
                    "이미지 파일 크기는 " + maxFileSize.toMegabytes() + "MB 이하만 가능합니다.");
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
        Page<Supplement> supplementPage =
                supplementRepository.findByUserId(userId, PageRequest.of(page, size));

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
        List<Long> supplementIds = supplements.stream()
                .map(Supplement::getUserSupplementId)
                .collect(Collectors.toList());

        // 주성분 일괄 조회 (N+1 방지)
        List<UserSupplementIngredient> primaryIngredients =
                userSupplementIngredientRepository.findPrimaryIngredientsBySupplementIds(supplementIds);

        // supplementId → 주성분명 목록 Map
        Map<Long, List<String>> primaryNameMap = primaryIngredients.stream()
                .collect(Collectors.groupingBy(
                        // key : supplementId
                        u -> u.getSupplement().getUserSupplementId(),

                        // value : 주성분 이름 리스트
                        Collectors.mapping(
                                u -> u.getNormalizedIngredient().getNormalizedName(),
                                Collectors.toList()
                        )
                ));

        // 재고 일괄 조회 (N+1 방지)
        Map<Long, Integer> stockQuantityMap = supplementInventoryRepository
                .findBySupplementIds(supplementIds)
                .stream()
                .collect(Collectors.toMap(
                        i -> i.getSupplement().getUserSupplementId(),
                        SupplementInventory::getStockQuantity
                ));

        // Supplement 엔티티 → 응답 DTO 변환
        List<SupplementSummaryDto> dtos = supplements.stream()
                .map(s -> SupplementSummaryDto.builder()
                        .userSupplementId(s.getUserSupplementId())
                        .pillImageUrl(s.getPillImageUrl())
                        .alias(s.getAlias())
                        .primaryIngredientNames(
                                primaryNameMap.getOrDefault(s.getUserSupplementId(), emptyList()))
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

    // 영양제 상세 조회
    public SupplementDetailResponse getSupplementDetail(Long userId, Long supplementId) {

        Supplement supplement = supplementRepository.findById(supplementId)
                .orElseThrow(() -> CustomException.notFound("요청한 영양제를 찾을 수 없습니다."));

        if (!supplement.getUser().getUserId().equals(userId)) {
            throw CustomException.forbidden("해당 영양제에 대한 권한이 없습니다.");
        }

        // 주성분명 목록 조회
        List<String> primaryIngredientNames =
                userSupplementIngredientRepository
                        .findPrimaryIngredientsBySupplementIds(List.of(supplementId))
                        .stream()
                        .map(u -> u.getNormalizedIngredient().getNormalizedName())
                        .collect(Collectors.toList());

        // 재고 조회
        SupplementInventory inventory =
                supplementInventoryRepository.findBySupplementIds(List.of(supplementId))
                        .stream().findFirst()
                        .orElseThrow(() -> CustomException.notFound("재고 정보를 찾을 수 없습니다."));

        // 스케줄 조회
        List<IntakeScheduleDto> scheduleDtos = intakeScheduleRepository
                .findBySupplementId(supplementId)
                .stream()
                .map(s -> IntakeScheduleDto.builder()
                        .scheduleId(s.getScheduleId())
                        .intakeTime(s.getIntakeTime().toString().substring(0, 5)) // HH:mm
                        .build())
                .collect(Collectors.toList());

        return SupplementDetailResponse.builder()
                .userSupplementId(supplement.getUserSupplementId())
                .pillImageUrl(supplement.getPillImageUrl())
                .alias(supplement.getAlias())
                .primaryIngredientNames(primaryIngredientNames)
                .dailyDose(supplement.getDailyDose())
                .stockQuantity(inventory.getStockQuantity())
                .stockNotificationEnabled(inventory.isStockAlertEnabled())
                .intakeSchedules(scheduleDtos)
                .build();
    }

    // 영양제 삭제
    @Transactional
    public void deleteSupplement(Long userId, Long supplementId) {
        Supplement supplement = supplementRepository.findById(supplementId)
                .orElseThrow(() -> CustomException.notFound("요청한 영양제를 찾을 수 없습니다."));

        // 소유권 검증
        if (!supplement.getUser().getUserId().equals(userId)) {
            throw CustomException.forbidden("해당 영양제에 대한 권한이 없습니다.");
        }

        // FK 제약 순서에 맞게 삭제
        intakeScheduleRepository.deleteBySupplementId(supplementId);         // 1. 스케줄
        userSupplementIngredientRepository.deleteBySupplementId(supplementId); // 2. 성분
        supplementInventoryRepository.deleteBySupplementIds(List.of(supplementId)); // 3. 재고
        supplementRepository.delete(supplement);                              // 4. 영양제
    }

    // 영양제 상세 정보 수정 (최종 상태 동기화 방식)
    @Transactional
    public SupplementUpdateResponse updateSupplement(Long userId, Long supplementId,
            SupplementUpdateRequest request) {

        // 소유권 검증 + 영양제 조회
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
        SupplementInventory inventory =
                supplementInventoryRepository.findBySupplementIds(List.of(supplementId))
                        .stream().findFirst()
                        .orElseThrow(() -> CustomException.notFound("재고 정보를 찾을 수 없습니다."));
        inventory.updateInventory(request.getStockQuantity(), request.getStockNotificationEnabled());

        // 기존 INTAKE 스케줄 목록 조회
        List<IntakeSchedule> existingSchedules = intakeScheduleRepository
                .findBySupplementIdAndUserIdAndScheduleType(supplementId, userId, ScheduleType.INTAKE);

        // 빠른 조회를 위해 scheduleId → IntakeSchedule Map 생성
        Map<Long, IntakeSchedule> existingMap = existingSchedules.stream()
                .collect(Collectors.toMap(IntakeSchedule::getScheduleId, s -> s));

        // 요청에 포함된 scheduleId 집합 (삭제 대상 판단용)
        Set<Long> requestedExistingIds = request.getIntakeSchedules().stream()
                .filter(s -> s.getScheduleId() != null)
                .map(IntakeScheduleUpdateDto::getScheduleId)
                .collect(Collectors.toSet());

        // 기존에는 있지만 요청에 없는 스케줄 삭제
        List<IntakeSchedule> schedulesToDelete = existingSchedules.stream()
                .filter(s -> !requestedExistingIds.contains(s.getScheduleId()))
                .collect(Collectors.toList());
        if (!schedulesToDelete.isEmpty()) {
            intakeScheduleRepository.deleteAll(schedulesToDelete);
        }

        User userRef = entityManager.getReference(User.class, userId);
        Supplement supplementRef = entityManager.getReference(Supplement.class, supplementId);

        List<IntakeSchedule> updatedSchedules = new ArrayList<>();

        for (IntakeScheduleUpdateDto dto : request.getIntakeSchedules()) {
            LocalTime parsedTime = LocalTime.parse(dto.getIntakeTime());

            if (dto.getScheduleId() != null) {
                // scheduleId 있음 → 기존 스케줄 수정
                IntakeSchedule existing = existingMap.get(dto.getScheduleId());
                if (existing == null) {
                    // 이 영양제의 INTAKE 스케줄이 아니면 scheduleId 입력 차단
                    throw CustomException.badRequest(
                            "scheduleId " + dto.getScheduleId() +
                            "는 존재하지 않거나 해당 영양제의 INTAKE 스케줄이 아닙니다.");
                }
                existing.updateIntakeTime(parsedTime);
                updatedSchedules.add(existing);
            } else {
                // scheduleId 없음 → 신규 스케줄 생성
                IntakeSchedule newSchedule = IntakeSchedule.builder()
                        .user(userRef)
                        .supplement(supplementRef)
                        .intakeTime(parsedTime)
                        .scheduleType(ScheduleType.INTAKE)
                        .doseAmount(supplement.getDosePerIntake())
                        .build();
                IntakeSchedule saved = intakeScheduleRepository.save(newSchedule);
                updatedSchedules.add(saved);
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
}
