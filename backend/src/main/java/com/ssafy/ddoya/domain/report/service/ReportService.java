package com.ssafy.ddoya.domain.report.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.ddoya.domain.common.entity.IngredientMaster;
import com.ssafy.ddoya.domain.common.entity.Product;
import com.ssafy.ddoya.domain.common.repository.IngredientMasterRepository;
import com.ssafy.ddoya.domain.common.repository.ProductRepository;
import com.ssafy.ddoya.domain.report.dto.FastApiReportRequest;
import com.ssafy.ddoya.domain.report.dto.FastApiReportResponse;
import com.ssafy.ddoya.domain.report.dto.ReportCreateResponse;
import com.ssafy.ddoya.domain.report.dto.ReportDetailResponse;
import com.ssafy.ddoya.domain.report.entity.AnalysisType;
import com.ssafy.ddoya.domain.report.entity.IntakeTiming;
import com.ssafy.ddoya.domain.report.entity.Report;
import com.ssafy.ddoya.domain.report.entity.ReportComments;
import com.ssafy.ddoya.domain.report.entity.ReportIngredientAnalysis;
import com.ssafy.ddoya.domain.report.entity.ReportIntakeTimingRecommendation;
import com.ssafy.ddoya.domain.report.entity.ReportRecommendedProduct;
import com.ssafy.ddoya.domain.report.repository.ReportCommentsRepository;
import com.ssafy.ddoya.domain.report.repository.ReportIngredientAnalysisRepository;
import com.ssafy.ddoya.domain.report.repository.ReportIntakeTimingRecommendationRepository;
import com.ssafy.ddoya.domain.report.repository.ReportRecommendedProductRepository;
import com.ssafy.ddoya.domain.report.repository.ReportRepository;
import com.ssafy.ddoya.domain.supplement.entity.Supplement;
import com.ssafy.ddoya.domain.supplement.entity.UserSupplementIngredient;
import com.ssafy.ddoya.domain.supplement.repository.SupplementWithIngredientsRepository;
import com.ssafy.ddoya.domain.user.entity.User;
import com.ssafy.ddoya.domain.user.entity.UserIntakeTimingSetting;
import com.ssafy.ddoya.domain.user.repository.UserIntakeTimingSettingRepository;
import com.ssafy.ddoya.domain.user.repository.UserRepository;
import com.ssafy.ddoya.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;

/**
 * 리포트 생성 및 조회를 담당하는 서비스입니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final ObjectMapper objectMapper;

    @Value("${app.fastapi.url:http://localhost:8000}")
    private String fastApiUrl;

    private final RestTemplate restTemplate;
    private final UserRepository userRepository;
    private final SupplementWithIngredientsRepository supplementWithIngredientsRepository;
    private final UserIntakeTimingSettingRepository intakeTimingSettingRepository;
    private final ReportRepository reportRepository;
    private final ReportIngredientAnalysisRepository ingredientAnalysisRepository;
    private final ReportRecommendedProductRepository recommendedProductRepository;
    private final ReportIntakeTimingRecommendationRepository timingRecommendationRepository;
    private final ReportCommentsRepository reportCommentsRepository;
    private final IngredientMasterRepository ingredientMasterRepository;
    private final ProductRepository productRepository;

    /**
     * 로그인 사용자 기준으로 리포트를 생성 또는 갱신합니다.
     */
    @Transactional
    public ReportCreateResponse createOrUpdateReport(Long userId) {
        // 1. 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> CustomException.notFound("사용자 정보를 찾을 수 없습니다."));

        // 2. 영양제 + 성분 데이터 조회 (N+1 방지: FETCH JOIN)
        List<Supplement> supplements = supplementWithIngredientsRepository.findAllWithIngredientsByUserId(userId);
        if (supplements.isEmpty()) {
            throw CustomException.badRequest("리포트를 생성할 내 영양제가 없습니다. 먼저 영양제를 등록해주세요.");
        }

        // 3. FastAPI 요청 DTO 구성 (성분 없는 영양제는 제외)
        List<FastApiReportRequest.SupplementDto> supplementDtos = buildSupplementDtos(supplements);
        if (supplementDtos.isEmpty()) {
            throw CustomException.badRequest("분석 가능한 성분 정보가 있는 영양제가 없습니다. 영양제 성분 정보를 확인해주세요.");
        }

        FastApiReportRequest request = FastApiReportRequest.builder()
                .userId(userId)
                .gender(user.getGender().name())
                .birthDate(user.getBirthDate())
                .supplements(supplementDtos)
                .build();

        // 4. FastAPI 호출 (트랜잭션 외부 - 실패 시 DB 저장 불가)
        FastApiReportResponse fastApiResponse = callFastApiGenerateReport(request);

        // 5. 사용자 섭취 타이밍 설정 한 번에 조회 → Map 변환 (N+1 방지)
        Map<IntakeTiming, LocalTime> timingSettingMap = buildTimingSettingMap(userId);

        // 6. FastAPI 응답을 DB에 저장 + 응답 DTO 조립 (트랜잭션)
        return saveReportData(user, supplements, supplementDtos, fastApiResponse, timingSettingMap);
    }

    /**
     * 사용자의 최신 리포트 상세 정보를 조회합니다.
     *
     * @param userId 사용자 ID
     * @return 리포트 상세 응답 DTO
     */
    public ReportDetailResponse getReportDetail(Long userId) {
        // 1. 리포트 조회 (사용자당 1개)
        Report report = reportRepository.findByUserId(userId)
                .orElseThrow(() -> CustomException.notFound("리포트를 찾을 수 없습니다."));

        Long reportId = report.getReportId();

        // 2. 하위 데이터 병렬 또는 순차 조회 (Fetch Join 활용)
        Optional<ReportComments> commentsOpt = reportCommentsRepository.findByReport_ReportId(reportId);
        List<ReportRecommendedProduct> recommendedProducts = recommendedProductRepository.findAllByReport_ReportId(reportId);
        List<ReportIntakeTimingRecommendation> timingRecommendations = timingRecommendationRepository.findAllByReport_ReportId(reportId);

        // 2.5 사용자별 섭취 타이밍 설정 조회 (N+1 방지용 Map 활용)
        Map<IntakeTiming, LocalTime> timingSettingMap = buildTimingSettingMap(userId);

        // 3. 추천 제품 그룹화 (Ingredient 기준)
        List<ReportDetailResponse.RecommendedProductsByIngredientDto> productsByIngredient = recommendedProducts.stream()
                .collect(Collectors.groupingBy(rrp -> rrp.getIngredient().getIngredientId()))
                .entrySet().stream()
                .map(entry -> {
                    List<ReportRecommendedProduct> group = entry.getValue();
                    // 그룹 내 첫 번째 데이터에서 성분 정보 추출 (IngredientMaster의 normalizedName 활용)
                    ReportRecommendedProduct first = group.get(0);
                    Long ingId = first.getIngredient().getIngredientId();
                    String ingName = first.getIngredient().getNormalizedName();

                    List<ReportDetailResponse.RecommendedProductDto> productDtos = group.stream()
                            .map(rrp -> ReportDetailResponse.RecommendedProductDto.builder()
                                    .productCode(rrp.getProduct().getProductCode())
                                    .productName(rrp.getProduct().getProductName())
                                    .build())
                            .collect(Collectors.toList());

                    return ReportDetailResponse.RecommendedProductsByIngredientDto.builder()
                            .ingredientId(ingId)
                            .ingredientName(ingName)
                            .recommendedProducts(productDtos)
                            .build();
                })
                .collect(Collectors.toList());

        // 4. 섭취 타이밍 그룹화 (영양제 기준 → 영양제 1개당 여러 타이밍 리스트)
        List<ReportDetailResponse.TimingRecommendationDto> timingRecommendationDtos = timingRecommendations.stream()
                .collect(Collectors.groupingBy(r -> r.getSupplement().getUserSupplementId()))
                .entrySet().stream()
                .map(entry -> {
                    List<ReportIntakeTimingRecommendation> group = entry.getValue();
                    String alias = group.get(0).getSupplement().getAlias();

                    List<ReportDetailResponse.TimingRecommendationDto.IntakeTimingInfo> timingInfos = group.stream()
                            .map(r -> {
                                IntakeTiming timing = r.getIntakeTiming();
                                LocalTime settingTime = timingSettingMap.get(timing);
                                String intakeTimeStr = (settingTime != null) ? settingTime.format(TIME_FORMATTER) : null;
                                return ReportDetailResponse.TimingRecommendationDto.IntakeTimingInfo.builder()
                                        .intakeTiming(timing.name())
                                        .intakeTime(intakeTimeStr)
                                        .build();
                            })
                            .collect(Collectors.toList());

                    return ReportDetailResponse.TimingRecommendationDto.builder()
                            .userSupplementId(entry.getKey())
                            .alias(alias)
                            .intakeTimings(timingInfos)
                            .build();
                })
                .collect(Collectors.toList());

        // 5. 코멘트 조립
        ReportDetailResponse.ReportCommentsDto commentsDto = commentsOpt.map(c -> ReportDetailResponse.ReportCommentsDto.builder()
                        .excessComment(c.getExcessComment())
                        .deficiencyComment(c.getDeficiencyComment())
                        .productComment(c.getProductComment())
                        .scheduleComment(c.getScheduleComment())
                        .build())
                .orElse(null);

        // 6. 최종 응답 조립
        return ReportDetailResponse.builder()
                .reportId(reportId)
                .needsRefresh(report.getNeedsRefresh())
                .updatedAt(report.getUpdatedAt() != null ? report.getUpdatedAt() : report.getCreatedAt())
                .isEditable(false) // 조회 API에서는 항상 false
                .comments(commentsDto)
                .recommendedProductsByIngredient(productsByIngredient)
                .timingRecommendations(timingRecommendationDtos)
                .build();
    }

    /**
     * FastAPI 리포트 생성 API를 호출합니다.
     */
    private FastApiReportResponse callFastApiGenerateReport(FastApiReportRequest request) {
        String url = fastApiUrl + "/api/ai/report/generate";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<FastApiReportRequest> requestEntity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<String> responseEntity =
                    restTemplate.postForEntity(url, requestEntity, String.class);

            log.info("[ReportService] FastAPI status={}", responseEntity.getStatusCode());
            log.info("[ReportService] FastAPI raw body={}", responseEntity.getBody());

            String rawBody = responseEntity.getBody();
            log.info("[ReportService] rawBody={}", rawBody);

            // "null" 문자열 체크 추가 (Jackson readValue("null") 은 null 을 반환함)
            if (rawBody == null || rawBody.isBlank() || "null".equalsIgnoreCase(rawBody)) {
                log.error("[ReportService] FastAPI raw body가 비어 있거나 'null'입니다. url={}", url);
                throw new CustomException(INTERNAL_SERVER_ERROR, "AI 리포트 생성 서버로부터 유효한 응답을 받지 못했습니다.");
            }

            FastApiReportResponse body = objectMapper.readValue(rawBody, FastApiReportResponse.class);

            // 파싱 결과 null 체크 (NPE 방지)
            if (body == null) {
                log.error("[ReportService] FastAPI 응답 파싱 결과가 null입니다. rawBody={}", rawBody);
                throw new CustomException(INTERNAL_SERVER_ERROR, "AI 리포트 응답 형식이 올바르지 않습니다.");
            }

            log.info("[ReportService] FastAPI parsed success={}", body.isSuccess());
            log.info("[ReportService] FastAPI parsed message={}", body.getMessage());
            log.info("[ReportService] FastAPI parsed data null 여부={}", body.getData() == null);

            if (!body.isSuccess()) {
                log.error("[ReportService] FastAPI 응답 success=false. message={}", body.getMessage());
                throw new CustomException(HttpStatus.BAD_GATEWAY, "AI 리포트 생성에 실패했습니다: " + body.getMessage());
            }

            if (body.getData() == null) {
                log.error("[ReportService] FastAPI 응답 data가 null입니다.");
                throw new CustomException(INTERNAL_SERVER_ERROR, "AI 리포트 생성 서버로부터 유효한 데이터를 받지 못했습니다.");
            }

            return body;

        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            log.error("[ReportService] FastAPI 호출 실패. url={}", url, e);
            throw new CustomException(INTERNAL_SERVER_ERROR, "FastAPI 서버 호출 실패");
        }
    }

    /**
     * userId 기준으로 사용자 섭취 타이밍 설정을 한 번에 조회하여
     * Map<IntakeTiming, LocalTime> 형태로 반환합니다. (N+1 방지)
     */
    private Map<IntakeTiming, LocalTime> buildTimingSettingMap(Long userId) {
        List<UserIntakeTimingSetting> settings = intakeTimingSettingRepository.findAllByUserUserId(userId);
        return settings.stream()
                .collect(Collectors.toMap(
                        UserIntakeTimingSetting::getIntakeTiming,
                        UserIntakeTimingSetting::getIntakeTime,
                        (a, b) -> a  // 동일 키 충돌 시 첫 번째 값 사용
                ));
    }

    /**
     * FastAPI 응답 결과를 DB에 저장하고, 응답 DTO를 조립하여 반환합니다.
     */
    @Transactional
    public ReportCreateResponse saveReportData(User user, List<Supplement> allSupplements,
                                               List<FastApiReportRequest.SupplementDto> requestedDtos,
                                               FastApiReportResponse fastApiResponse,
                                               Map<IntakeTiming, LocalTime> timingSettingMap) {
        FastApiReportResponse.ReportData data = fastApiResponse.getData();

        // Report Upsert
        Report report = reportRepository.findByUserId(user.getUserId())
                .map(existing -> {
                    // 갱신: 기존 report 유지, 자식 데이터만 교체
                    return existing;
                })
                .orElseGet(() -> reportRepository.save(
                        Report.builder().user(user).needsRefresh(false).build()
                ));

        Long reportId = report.getReportId();

        // 기존 child 데이터 삭제 (갱신 시 교체 방식)
        ingredientAnalysisRepository.deleteAllByReportId(reportId);
        recommendedProductRepository.deleteAllByReportId(reportId);
        timingRecommendationRepository.deleteAllByReportId(reportId);

        // 성분 분석 저장
        if (data.getIngredientAnalysis() != null) {
            saveIngredientAnalysisList(report, data.getIngredientAnalysis());
        }

        // 추천 제품 저장
        if (data.getRecommendedProducts() != null) {
            saveRecommendedProducts(report, data.getRecommendedProducts());
        }

        // 섭취 타이밍 추천 저장
        Map<Long, Supplement> supplementMap = allSupplements.stream()
                .collect(Collectors.toMap(Supplement::getUserSupplementId, s -> s));
        if (data.getTimingRecommendations() != null) {
            saveTimingRecommendations(report, data.getTimingRecommendations(), supplementMap);
        }

        // 코멘트 저장/갱신 (Upsert)
        if (data.getComments() != null) {
            saveOrUpdateComments(report, data.getComments());
        }

        // 리포트에 반영된 영양제 is_reflected = true 처리
        for (FastApiReportRequest.SupplementDto dto : requestedDtos) {
            Supplement s = supplementMap.get(dto.getUserSupplementId());
            if (s != null) {
                s.markReflected();
            }
        }

        log.info("[ReportService] 리포트 생성/갱신 완료: userId={}, reportId={}", user.getUserId(), reportId);

        // DB 저장 성공 후 needs_refresh = true 로 세팅 (프론트에 갱신 필요 알림)
        report.markNeedsRefresh();

        // timing_recommendations에 intake_time 주입하여 응답 DTO 조립
        List<ReportCreateResponse.TimingRecommendationWithTimeDto> timingWithTime =
                buildTimingWithTime(data.getTimingRecommendations(), timingSettingMap);

        return ReportCreateResponse.builder()
                .reportId(reportId)
                .needsRefresh(report.getNeedsRefresh())
                .updatedAt(report.getUpdatedAt() != null ? report.getUpdatedAt() : LocalDateTime.now())
                .isEditable(true)
                .ingredientAnalysis(data.getIngredientAnalysis())
                .recommendedProducts(data.getRecommendedProducts())
                .timingRecommendations(timingWithTime)
                .comments(data.getComments())
                .build();
    }

    /**
     * FastAPI의 timing_recommendations 목록에 사용자 설정 intake_time을 주입합니다.
     * FastAPI는 intake_timings를 List<String>으로 내려주며,
     * 이를 클라이언트 응답용 List<IntakeTimingInfo> 객체로 변환합니다.
     */
    private List<ReportCreateResponse.TimingRecommendationWithTimeDto> buildTimingWithTime(
            List<FastApiReportResponse.TimingRecommendationDto> timingDtos,
            Map<IntakeTiming, LocalTime> timingSettingMap) {

        if (timingDtos == null) {
            return List.of();
        }

        List<ReportCreateResponse.TimingRecommendationWithTimeDto> result = new ArrayList<>();
        for (FastApiReportResponse.TimingRecommendationDto dto : timingDtos) {
            List<ReportCreateResponse.TimingRecommendationWithTimeDto.IntakeTimingInfo> timingInfos = new ArrayList<>();

            List<String> rawTimings = dto.getIntakeTimings();
            if (rawTimings != null) {
                for (String timingStr : rawTimings) {
                    String intakeTimeStr = resolveIntakeTime(timingStr, timingSettingMap);
                    timingInfos.add(ReportCreateResponse.TimingRecommendationWithTimeDto.IntakeTimingInfo.builder()
                            .intakeTiming(timingStr)
                            .intakeTime(intakeTimeStr)
                            .build());
                }
            }

            result.add(ReportCreateResponse.TimingRecommendationWithTimeDto.builder()
                    .userSupplementId(dto.getUserSupplementId())
                    .alias(dto.getAlias())
                    .intakeTimings(timingInfos)
                    .build());
        }
        return result;
    }

    /**
     * intakeTiming 문자열을 enum으로 변환하여 사용자 설정 시각을 HH:mm로 반환합니다.
     * 맵핑 실패 또는 설정값 부재 시 null을 반환합니다.
     */
    private String resolveIntakeTime(String intakeTimingStr, Map<IntakeTiming, LocalTime> timingSettingMap) {
        if (intakeTimingStr == null || intakeTimingStr.isBlank()) {
            return null;
        }
        try {
            IntakeTiming timingEnum = IntakeTiming.valueOf(intakeTimingStr);
            LocalTime localTime = timingSettingMap.get(timingEnum);
            return (localTime != null) ? localTime.format(TIME_FORMATTER) : null;
        } catch (IllegalArgumentException e) {
            log.warn("[ReportService] 알 수 없는 intake_timing={}, intake_time을 null로 처리합니다.", intakeTimingStr);
            return null;
        }
    }


    // ── private helper ──────────────────────────────────────────────────────

    private List<FastApiReportRequest.SupplementDto> buildSupplementDtos(List<Supplement> supplements) {
        List<FastApiReportRequest.SupplementDto> result = new ArrayList<>();
        for (Supplement supplement : supplements) {
            List<UserSupplementIngredient> ingredientList = supplement.getIngredients();
            if (ingredientList == null || ingredientList.isEmpty()) {
                log.debug("[ReportService] 성분 정보가 없어 FastAPI 요청에서 제외: supplementId={}",
                        supplement.getUserSupplementId());
                continue;
            }

            List<FastApiReportRequest.IngredientDto> ingredientDtos = ingredientList.stream()
                    .map(i -> FastApiReportRequest.IngredientDto.builder()
                            .ingredientId(i.getNormalizedIngredient().getIngredientId())
                            .ingredientName(i.getNormalizedIngredient().getNormalizedName())
                            .amount(i.getAmount())
                            .unit(i.getUnit())
                            .build())
                    .collect(Collectors.toList());

            result.add(FastApiReportRequest.SupplementDto.builder()
                    .userSupplementId(supplement.getUserSupplementId())
                    .alias(supplement.getAlias())
                    .ingredients(ingredientDtos)
                    .build());
        }
        return result;
    }

    private void saveIngredientAnalysisList(Report report,
            List<FastApiReportResponse.IngredientAnalysisDto> analysisList) {
        List<ReportIngredientAnalysis> entities = new ArrayList<>();
        for (FastApiReportResponse.IngredientAnalysisDto dto : analysisList) {
            IngredientMaster ingredient = ingredientMasterRepository.findById(dto.getIngredientId())
                    .orElse(null);
            if (ingredient == null) {
                log.warn("[ReportService] ingredient_id={} 가 없어 성분 분석 저장을 건너뜁니다.", dto.getIngredientId());
                continue;
            }

            AnalysisType analysisType;
            try {
                analysisType = AnalysisType.valueOf(dto.getAnalysisType());
            } catch (IllegalArgumentException e) {
                log.warn("[ReportService] 알 수 없는 analysis_type={}, NORMAL로 대체합니다.", dto.getAnalysisType());
                analysisType = AnalysisType.NORMAL;
            }

            entities.add(ReportIngredientAnalysis.builder()
                    .report(report)
                    .ingredient(ingredient)
                    .normalizedIngredientName(dto.getNormalizedIngredientName())
                    .recommendedAmount(dto.getRecommendedAmount())
                    .currentAmount(dto.getCurrentAmount())
                    .excessRatio(dto.getExcessRatio())
                    .excessAmount(dto.getExcessAmount())
                    .deficiencyRatio(dto.getDeficiencyRatio())
                    .deficiencyAmount(dto.getDeficiencyAmount())
                    .unit(dto.getUnit())
                    .analysisType(analysisType)
                    .build());
        }
        ingredientAnalysisRepository.saveAll(entities);
    }

    private void saveRecommendedProducts(Report report,
            List<FastApiReportResponse.RecommendedProductDto> productDtos) {
        List<ReportRecommendedProduct> entities = new ArrayList<>();
        for (FastApiReportResponse.RecommendedProductDto dto : productDtos) {
            Optional<Product> productOpt = productRepository.findById(dto.getProductCode());
            if (productOpt.isEmpty()) {
                log.warn("[ReportService] product_code={} 가 products 테이블에 없어 건너뜁니다.", dto.getProductCode());
                continue;
            }

            IngredientMaster ingredient = ingredientMasterRepository.findById(dto.getIngredientId())
                    .orElse(null);
            if (ingredient == null) {
                log.warn("[ReportService] ingredient_id={} 가 없어 추천 제품 저장을 건너뜁니다.", dto.getIngredientId());
                continue;
            }

            entities.add(ReportRecommendedProduct.builder()
                    .report(report)
                    .product(productOpt.get())
                    .ingredient(ingredient)
                    .build());
        }
        recommendedProductRepository.saveAll(entities);
    }

    private void saveTimingRecommendations(Report report,
            List<FastApiReportResponse.TimingRecommendationDto> timingDtos,
            Map<Long, Supplement> supplementMap) {
        List<ReportIntakeTimingRecommendation> entities = new ArrayList<>();
        for (FastApiReportResponse.TimingRecommendationDto dto : timingDtos) {
            Supplement supplement = supplementMap.get(dto.getUserSupplementId());
            if (supplement == null) {
                log.warn("[ReportService] user_supplement_id={} 를 찾을 수 없어 타이밍 추천 저장을 건너뜁니다.", dto.getUserSupplementId());
                continue;
            }

            List<String> rawTimings = dto.getIntakeTimings();
            if (rawTimings == null || rawTimings.isEmpty()) {
                log.warn("[ReportService] user_supplement_id={} 의 intake_timings가 비어있어 저장을 건너뜁니다.", dto.getUserSupplementId());
                continue;
            }

            // 1 영양제당 복수 타이밍 각각 엔티티 생성
            for (String timingStr : rawTimings) {
                IntakeTiming intakeTiming;
                try {
                    intakeTiming = IntakeTiming.valueOf(timingStr);
                } catch (IllegalArgumentException e) {
                    log.warn("[ReportService] 알 수 없는 intake_timing='{}' (supplement_id={}), DB 저장을 건너뜁니다.",
                            timingStr, dto.getUserSupplementId());
                    continue;
                }

                entities.add(ReportIntakeTimingRecommendation.builder()
                        .report(report)
                        .supplement(supplement)
                        .intakeTiming(intakeTiming)
                        .build());
            }
        }
        timingRecommendationRepository.saveAll(entities);
    }

    private void saveOrUpdateComments(Report report, FastApiReportResponse.CommentsDto commentsDto) {
        LocalDateTime now = LocalDateTime.now();
        reportCommentsRepository.findByReport_ReportId(report.getReportId())
                .ifPresentOrElse(
                        existing -> {
                            reportCommentsRepository.delete(existing);
                            reportCommentsRepository.flush();
                            reportCommentsRepository.save(buildComments(report, commentsDto, existing.getCreatedAt(), now));
                        },
                        () -> reportCommentsRepository.save(buildComments(report, commentsDto, now, null))
                );
    }

    private ReportComments buildComments(Report report, FastApiReportResponse.CommentsDto dto,
                                          LocalDateTime createdAt, LocalDateTime updatedAt) {
        return ReportComments.builder()
                .report(report)
                .excessComment(dto.getExcessComment())
                .deficiencyComment(dto.getDeficiencyComment())
                .productComment(dto.getProductComment())
                .scheduleComment(dto.getScheduleComment())
                .createdAt(createdAt)
                .updatedAt(updatedAt)
                .build();
    }
}
