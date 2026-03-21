package com.ssafy.ddoya.domain.intake.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.ddoya.domain.intake.dto.*;
import com.ssafy.ddoya.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.lang.reflect.Field;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class IntakeRecordService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.fastapi.url}")
    private String fastApiUrl;

    @Value("${app.fastapi.mock_enabled:false}")
    private boolean isFastApiMockEnabled;

    /**
     * 복용 인증 사진을 FastAPI 서버로 분석 요청합니다.
     */
    public FastApiPillVerifyResponse verifyPillIntake(MultipartFile image, PillVerifyRequest request) {
        validateRequest(image, request);

        // Mock 응답 처리
        if (isFastApiMockEnabled) {
            return generateMockResponse(request);
        }

        String url = fastApiUrl + "/api/ai/pill/verify";
        FastApiPillVerifyResponse fastApiResponse = postVerifyToFastApi(url, image, request);

        // 서버 오류 (응답 본문 없음)
        if (fastApiResponse == null) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "FastAPI 인증 분석 서버 응답 없음");
        }

        return fastApiResponse;
    }

    /**
     * 이미지를 FastAPI 서버로 전송합니다.
     * Multi-Value Map을 활용하여 Multipart 요청을 수행합니다.
     */
    private FastApiPillVerifyResponse postVerifyToFastApi(String url, MultipartFile imageFile, PillVerifyRequest request) {
        // HTTP 요청 헤더 생성
        HttpHeaders headers = new HttpHeaders();
        // Content-Type 설정
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        // multipart/form-data 요청 body 생성
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        try {
            // MultipartFile → ByteArrayResource 변환
            // RestTemplate multipart 요청 시 Resource 타입을 사용해야 파일로 인식됨
            ByteArrayResource resource = new ByteArrayResource(imageFile.getBytes()) {
                // 파일명을 반환하도록 override
                @Override
                public String getFilename() {
                    return imageFile.getOriginalFilename() != null ? imageFile.getOriginalFilename() : "verify_image.jpg";
                }
            };

            // multipart body에 파일 추가
            body.add("file", resource);

            // expected_items JSON 직렬화
            String expectedItemsJson = objectMapper.writeValueAsString(request.getExpectedItems());
            body.add("expected_items", expectedItemsJson);
        } catch (IOException e) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "이미지 파일 처리 실패");
        }

        // 요청 body + header를 하나의 HttpEntity로 묶음
        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            // FastAPI API 호출
            ResponseEntity<FastApiPillVerifyResponse> responseEntity = restTemplate.postForEntity(url, requestEntity,
                    FastApiPillVerifyResponse.class);
            return responseEntity.getBody();
        } catch (Exception e) {
            log.error("FastAPI 호출 실패. url={}", url, e);
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "FastAPI 서버 호출 실패");
        }
    }

    private void validateRequest(MultipartFile image, PillVerifyRequest request) {
        if (image == null || image.isEmpty()) {
            throw CustomException.badRequest("복용 인증 이미지가 누락되었습니다.");
        }
        if (request.getExpectedItems() == null || request.getExpectedItems().isEmpty()) {
            throw CustomException.badRequest("분석할 예상 영양제 목록이 비어있습니다.");
        }
    }

    /**
     * fastApi 준비 완료 시 제거
     * 알약 복용 인증 결과 생성 (테스트용)
     */
    private FastApiPillVerifyResponse generateMockResponse(PillVerifyRequest request) {
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
