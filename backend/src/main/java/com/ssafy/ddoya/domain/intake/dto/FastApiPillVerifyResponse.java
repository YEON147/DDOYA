package com.ssafy.ddoya.domain.intake.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * FastAPI 서버로부터 전달받은 알약 복용 인증 결과 응답 DTO입니다.
 */
@Getter
@NoArgsConstructor
public class FastApiPillVerifyResponse {
    /** 인증 성공 여부 */
    private boolean success;
    /** 결과 메시지 */
    private String message;
    /** 개별 영양제 분석 결과 리스트 */
    private List<VerifyResult> results;

    /**
     * 개별 영양제에 대한 분석 결과 정보를 담는 내부 클래스입니다.
     */
    @Getter
    @NoArgsConstructor
    public static class VerifyResult {
        /** 사용자 등록 영양제 ID */
        @JsonProperty("user_supplement_id")
        private Long userSupplementId;

        /** 기대되는 1회 섭취량 */
        @JsonProperty("dose_per_intake")
        private Integer dosePerIntake;

        /** 사진에서 검출된 알약 개수 */
        @JsonProperty("detected_amount")
        private Integer detectedAmount;
    }
}
