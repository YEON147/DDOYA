package com.ssafy.ddoya.domain.intake.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.ddoya.domain.intake.dto.*;
import com.ssafy.ddoya.domain.intake.entity.IntakeRecord;
import com.ssafy.ddoya.domain.intake.entity.IntakeSchedule;
import com.ssafy.ddoya.domain.intake.entity.IntakeStatus;
import com.ssafy.ddoya.domain.intake.entity.ScheduleType;
import com.ssafy.ddoya.domain.intake.repository.IntakeRecordRepository;
import com.ssafy.ddoya.domain.notification.service.RepurchaseNotificationService;
import com.ssafy.ddoya.domain.supplement.entity.Supplement;
import com.ssafy.ddoya.domain.supplement.entity.SupplementInventory;
import com.ssafy.ddoya.domain.supplement.repository.SupplementInventoryRepository;
import com.ssafy.ddoya.global.exception.CustomException;
import com.ssafy.ddoya.global.util.FastApiUploadUtils;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.lang.reflect.Field;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 사용자의 영양제 복용 인증 및 AI 분석 관련 로직을 담당하는 서비스 클래스입니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class IntakeRecordService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final SupplementInventoryRepository supplementInventoryRepository;
    private final IntakeRecordRepository intakeRecordRepository;
    private final RepurchaseNotificationService repurchaseNotificationService;

    @Value("${app.fastapi.url}")
    private String fastApiUrl;

    @Value("${app.fastapi.mock_enabled}")
    private boolean isFastApiMockEnabled;

    @Value("${app.timezone:Asia/Seoul}")
    private String appTimezone;

    /**
     * 복용 인증 사진을 FastAPI 서버로 분석 요청합니다.
     *
     * @param userId  로그인한 사용자 ID
     * @param image   복용 인증 사진 (MultipartFile)
     * @param request 예상되는 복용 스케줄 목록 등 정보
     * @return FastAPI의 분석 결과 응답
     */
    @Transactional
    public PillVerifyResponse verifyPillIntake(Long userId, MultipartFile image, PillVerifyRequest request) {
        validateRequest(image, request);

        // 요청된 scheduleId 목록 추출
        List<Long> requestedScheduleIds = request.getExpectedSchedules().stream()
                .map(PillVerifyRequest.ExpectedScheduleDto::getScheduleId)
                .toList();

        // ScheduleId 기준으로 오늘자 IntakeRecord 조회 (N+1 방지 Fetch Join)
        LocalDate today = LocalDate.now(ZoneId.of(appTimezone));
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();

        List<IntakeRecord> records = intakeRecordRepository.findRecordsByScheduleIdsWithSupplement(
                userId, requestedScheduleIds, start, end);

        Map<Long, IntakeRecord> recordMap = records.stream()
                .collect(Collectors.toMap(r -> r.getSchedule().getScheduleId(), r -> r));

        // 내부 매핑 객체(VerificationTarget) 생성
        List<IntakeVerificationTarget> targets = buildVerificationTargets(requestedScheduleIds, recordMap);

        // FastAPI 요청 DTO 조립
        FastApiVerifyRequest fastApiRequest = buildFastApiRequest(targets);

        // FastAPI 서버 호출
        FastApiPillVerifyResponse fastApiResponse;
        if (isFastApiMockEnabled) {
            fastApiResponse = generateMockResponse(fastApiRequest);
            log.debug("[verifyPillIntake] Mock 호출 isFastApiMockEnabled = " + isFastApiMockEnabled);
        } else {
            String url = fastApiUrl + "/api/ai/pills/verify";
            fastApiResponse = postVerifyToFastApi(url, image, fastApiRequest);
            log.debug("[verifyPillIntake] FastAPI 호출 isFastApiMockEnabled = " + isFastApiMockEnabled);
        }

        // FastAPI 서버 응답이 null이면 서버 오류로 처리
        if (fastApiResponse == null) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "FastAPI 인증 분석 서버 응답 없음");
        }

        // 예외: 전체 분석 실패 (success = false)
        // 실패 응답 반환
        if (!fastApiResponse.isSuccess()) {
            return PillVerifyResponse.builder()
                    .success(false)
                    .message(fastApiResponse.getMessage() != null ? fastApiResponse.getMessage() : "인증 분석 처리 실패")
                    .results(Collections.emptyList())
                    .build();
        }

        // FastAPI 응답 결과를 Map으로 구성 (기준: userSupplementId)
        Map<Long, FastApiPillVerifyResponse.VerifyResult> aiResultMap = fastApiResponse.getResults().stream()
                .collect(Collectors.toMap(FastApiPillVerifyResponse.VerifyResult::getUserSupplementId, r -> r));

        // 재고 관리를 위해 관련된 SupplementInventory 한꺼번에 조회 (Pessimistic Write Lock 적용)
        List<Long> userSupplementIds = targets.stream()
                .map(IntakeVerificationTarget::getUserSupplementId)
                .distinct()
                .toList();
        Map<Long, SupplementInventory> inventoryMap = supplementInventoryRepository.findForUpdateBySupplementIds(userSupplementIds).stream()
                .collect(Collectors.toMap(inv -> inv.getSupplement().getUserSupplementId(), inv -> inv));

        // 각 항목별 판정 및 상태 업데이트 진행
        LocalDateTime actionAt = LocalDateTime.now();
        // 최종 응답에 담을 영양제별 판정 결과 리스트
        List<PillVerifyResponse.VerifyResult> finalResults = new ArrayList<>();

        // scheduleId 기준으로 만들어 둔 target 목록을 순회하면서
        // 각 스케줄별 인증 성공/실패와 상태 변경 여부를 판단
        for (IntakeVerificationTarget target : targets) {
            Long scheduleId = target.getScheduleId();
            Long suppId = target.getUserSupplementId();
            Integer expectedDose = target.getDosePerIntake();
            IntakeRecord targetRecord = target.getIntakeRecord();
            IntakeStatus beforeStatus = target.getBeforeStatus();

            FastApiPillVerifyResponse.VerifyResult aiResult = aiResultMap.get(suppId);

            // FastAPI 결과 누락 시 부분 실패 처리 (DB 안건드림)
            if (aiResult == null) {
                log.warn("[Verify] AI 응답에서 대상 영양제 식별 누락. userSupplementId={}", suppId);
                finalResults.add(PillVerifyResponse.VerifyResult.builder()
                        .scheduleId(scheduleId)
                        .userSupplementId(suppId)
                        .dosePerIntake(expectedDose)
                        .detectedAmount(null)
                        .matched(false)
                        .beforeStatus(beforeStatus)
                        .afterStatus(beforeStatus) // 원래 상태 유지
                        .stockAdjusted(false)
                        .build());
                continue;
            }

            Integer detectedAmount = aiResult.getDetectedAmount();
            // 기대 복용 개수와 실제 탐지 개수가 같은지 판정한다.
            boolean matched = expectedDose.equals(detectedAmount);

            // 상태 결정 규칙
            // 1) 이미 TAKEN이면 계속 TAKEN 유지
            // 2) 아직 TAKEN이 아니고 matched=true면 TAKEN
            // 3) 그 외에는 기존 상태 유지
            IntakeStatus afterStatus = decideAfterStatus(beforeStatus, matched);

            boolean stockAdjusted = false;

            // 실제 DB 업데이트는 "TAKEN으로 바뀌는 경우"에만 수행
            if (afterStatus == IntakeStatus.TAKEN && beforeStatus != IntakeStatus.TAKEN) {
                targetRecord.updateStatusToTaken(actionAt); 

                SupplementInventory inventory = inventoryMap.get(suppId);
                if (inventory != null) {
                    stockAdjusted = inventory.decreaseWithFloorZero(expectedDose);
                    if (stockAdjusted) {
                        log.warn("[재고 부족] 일부만 복용 처리됨. supplementId={}, 필요수량={}, 현재재고=0(보정됨)", suppId, expectedDose);
                    }
                    // 재고 차감 직후 재구매 알림 조건 확인 및 실시간 발송 트리거
                    repurchaseNotificationService.checkAndSendRepurchaseReminder(inventory);
                }
            }

            finalResults.add(PillVerifyResponse.VerifyResult.builder()
                    .scheduleId(scheduleId)
                    .userSupplementId(suppId)
                    .dosePerIntake(expectedDose)
                    .detectedAmount(detectedAmount)
                    .matched(matched)
                    .beforeStatus(beforeStatus)
                    .afterStatus(afterStatus)
                    .stockAdjusted(stockAdjusted)
                    .build());
        }

        // 결과 래핑
        return PillVerifyResponse.builder()
                .success(true)
                .message("복용 사진 인증 처리가 완료되었습니다.")
                .results(finalResults)
                .build();
    }

    // scheduleId 기준으로 내부 전용 타겟 객체
    // - 응답에 필요한 scheduleId
    // - FastAPI 요청에 필요한 supplement 정보
    // - DB 상태 변경 대상인 intakeRecord
    @Getter
    @Builder
    private static class IntakeVerificationTarget {
        private Long scheduleId;
        private Long userSupplementId;
        private Integer dosePerIntake;
        private String pillReferenceEmbeddingPath;
        private IntakeRecord intakeRecord;
        private IntakeStatus beforeStatus;
    }

    private List<IntakeVerificationTarget> buildVerificationTargets(
            List<Long> requestedScheduleIds, 
            Map<Long, IntakeRecord> recordMap) {
        
        List<IntakeVerificationTarget> targets = new ArrayList<>();

        for (Long scheduleId : requestedScheduleIds) {
            // scheduleId에 해당하는 오늘자의 intake_record가 없음
            IntakeRecord record = recordMap.get(scheduleId);
            if (record == null) {
                throw CustomException.badRequest("스케줄 ID " + scheduleId + " 에 해당하는 섭취 기록이 없거나 본인의 일정이 아닙니다.");
            }

            // 복용 인증 API는 복용(INTAKE) 일정에만 허용
            IntakeSchedule schedule = record.getSchedule();
            if (schedule.getScheduleType() != ScheduleType.INTAKE) {
                throw CustomException.badRequest("스케줄 ID " + scheduleId + " 는 복용(INTAKE) 일정이 아닙니다.");
            }

            // 현재 스케줄에 연결된 supplement
            Supplement supplement = schedule.getSupplement();
            if (supplement == null) {
                throw CustomException.badRequest("스케줄 ID " + scheduleId + " 에 연결된 영양제 정보가 없습니다.");
            }

            // 등록 시 생성한 참조 임베딩 경로가 없음
            if (supplement.getPillReferenceEmbeddingPath() == null || supplement.getPillReferenceEmbeddingPath().isBlank()) {
                throw CustomException.badRequest(
                        String.format("영양제 '%s'의 알약 참조 사진(임베딩 경로)이 없습니다. 다시 등록해주세요.", supplement.getAlias())
                );
            }

            // 이번 스케줄의 1회 복용량이 비정상적
            Integer dosePerIntake = schedule.getDosePerIntake();
            if (dosePerIntake == null || dosePerIntake <= 0) {
                 throw CustomException.badRequest(
                        String.format("영양제 '%s'의 1회 복용 개수가 올바르게 설정되지 않았습니다.", supplement.getAlias())
                );
            }

            targets.add(IntakeVerificationTarget.builder()
                    .scheduleId(scheduleId)
                    .userSupplementId(supplement.getUserSupplementId())
                    .dosePerIntake(dosePerIntake)
                    .pillReferenceEmbeddingPath(supplement.getPillReferenceEmbeddingPath())
                    .intakeRecord(record)
                    .beforeStatus(record.getStatus())
                    .build());
        }

        return targets;
    }

    private FastApiVerifyRequest buildFastApiRequest(List<IntakeVerificationTarget> targets) {
        List<FastApiVerifyRequest.ExpectedItem> fastApiExpectedItems = new ArrayList<>();

        // FastAPI는 scheduleId를 모르기 때문에
        // 각 target에서 supplement 기준 정보만 뽑아 expected_items로 만든다.
        for (IntakeVerificationTarget target : targets) {
            fastApiExpectedItems.add(FastApiVerifyRequest.ExpectedItem.builder()
                    .userSupplementId(target.getUserSupplementId())
                    .dosePerIntake(target.getDosePerIntake())
                    .pillReferenceEmbeddingPath(target.getPillReferenceEmbeddingPath())
                    .build());
        }

        return FastApiVerifyRequest.builder().expectedItems(fastApiExpectedItems).build();
    }

    private IntakeStatus decideAfterStatus(IntakeStatus beforeStatus, boolean matched) {
        // 이미 TAKEN이면 이번 사진 결과가 불일치여도 TAKEN을 유지
        if (beforeStatus == IntakeStatus.TAKEN) {
            return IntakeStatus.TAKEN;
        }

        // 아직 TAKEN이 아니고, 기대 개수와 탐지 개수가 일치하면 TAKEN으로 인정
        if (matched) {
            return IntakeStatus.TAKEN;
        }

        // 일치하지 않으면 기존 상태를 그대로 유지
        return beforeStatus;
    }

    private FastApiPillVerifyResponse postVerifyToFastApi(String url, MultipartFile imageFile, FastApiVerifyRequest request) {
        // HTTP 요청 헤더 생성
        HttpHeaders headers = new HttpHeaders();
        // Content-Type 설정
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        // multipart/form-data 요청 body 생성
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        try {
            // FastAPI 기준 필수 필드명인 "file" 고정 적용 및 유틸 메서드를 통한 파일 변환 처리
            body.add("file", FastApiUploadUtils.convertToResource(imageFile));
            // ObjectMapper로 FastApiVerifyRequest를 JSON으로 말아서 전송
            body.add("expected_items", objectMapper.writeValueAsString(request.getExpectedItems()));
        } catch (Exception e) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "업로드 파일 변환 또는 JSON 직렬화에 실패했습니다.");
        }

        // 요청 body + header를 하나의 HttpEntity로 묶음
        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            return restTemplate.postForEntity(url, requestEntity, FastApiPillVerifyResponse.class).getBody();
        } catch (Exception e) {
            log.error("FastAPI 호출 실패. url={}", url, e);
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "FastAPI 서버 처리 실패");
        }
    }

    /**
     * 요청 파라미터의 유효성을 검증합니다.
     *
     * @param image   검증할 이미지
     * @param request 검증할 요청 DTO
     */
    private void validateRequest(MultipartFile image, PillVerifyRequest request) {
        if (image == null || image.isEmpty()) {
            throw CustomException.badRequest("복용 인증 이미지가 누락되었습니다.");
        }
        if (request.getExpectedSchedules() == null || request.getExpectedSchedules().isEmpty()) {
            throw CustomException.badRequest("분석할 예정 스케줄 목록이 비어있습니다.");
        }
    }

    /**
     * fastApi 준비 완료 시 제거
     * 알약 복용 인증 결과 생성 (테스트용)
     *
     * @param request 요청 데이터
     * @return 생성된 모의 결과 응답
     */
    private FastApiPillVerifyResponse generateMockResponse(FastApiVerifyRequest request) {
        FastApiPillVerifyResponse response = new FastApiPillVerifyResponse();
        
        try {
            Field successField = FastApiPillVerifyResponse.class.getDeclaredField("success");
            successField.setAccessible(true);
            successField.set(response, true);
            
            Field messageField = FastApiPillVerifyResponse.class.getDeclaredField("message");
            messageField.setAccessible(true);
            messageField.set(response, "목업(Mock) 인증 결과입니다.");
            
            Field resultsField = FastApiPillVerifyResponse.class.getDeclaredField("results");
            resultsField.setAccessible(true);
            
            if (request.getExpectedItems() != null) {
                List<FastApiPillVerifyResponse.VerifyResult> mockResults = request.getExpectedItems().stream().map(item -> {
                    FastApiPillVerifyResponse.VerifyResult res = new FastApiPillVerifyResponse.VerifyResult();
                    try {
                        Field idField = FastApiPillVerifyResponse.VerifyResult.class.getDeclaredField("userSupplementId");
                        idField.setAccessible(true);
                        idField.set(res, item.getUserSupplementId());
                        
                        Field doseField = FastApiPillVerifyResponse.VerifyResult.class.getDeclaredField("dosePerIntake");
                        doseField.setAccessible(true);
                        doseField.set(res, item.getDosePerIntake());
                        
                        Field amountField = FastApiPillVerifyResponse.VerifyResult.class.getDeclaredField("detectedAmount");
                        amountField.setAccessible(true);
                        amountField.set(res, item.getDosePerIntake()); // Mock: 기대한 만큼 검출되었다고 가정
                    } catch (Exception ignored) {}
                    return res;
                }).collect(Collectors.toList());
                
                resultsField.set(response, mockResults);
            }
        } catch (Exception e) {
            log.error("Mock 응답 생성 실패", e);
        }

        return response;
    }
}
