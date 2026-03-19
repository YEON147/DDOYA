package com.ssafy.ddoya.domain.supplement.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 영양제 상세 정보 조회를 위한 응답 DTO 클래스입니다.
 */
@Getter
@Builder
public class SupplementDetailResponse {

    /**
     * 사용자가 등록한 영양제 ID
     */
    private Long userSupplementId;

    /**
     * 알약 이미지 URL
     */
    private String pillImageUrl;

    /**
     * 영양제 별칭
     */
    private String alias;

    /**
     * 주성분 이름 목록
     */
    private List<String> primaryIngredientNames;

    /**
     * 1일 섭취 횟수
     */
    private Integer dailyDose;

    /**
     * 1회 섭취량
     */
    private Integer dosePerIntake;

    /**
     * 현재 재고 수량
     */
    private Integer stockQuantity;

    /**
     * 재고 부족 알림 활성화 여부
     */
    private Boolean stockNotificationEnabled;

    /**
     * 설정된 섭취 스케줄 리스트
     */
    private List<IntakeScheduleDto> intakeSchedules;

    /**
     * 개별 섭취 시각 정보를 담는 DTO
     */
    @Getter
    @Builder
    public static class IntakeScheduleDto {
        /**
         * 스케줄 ID
         */
        private Long scheduleId;
        /**
         * 섭취 시각 (HH:mm)
         */
        private String intakeTime;
    }
}
