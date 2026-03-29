package com.ssafy.ddoya.domain.intake.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * 알약 복용 인증 분석을 요청할 때 사용하는 DTO 클래스입니다.
 */
@Getter
@Setter
public class PillVerifyRequest {

    /** 분석 대상이 되는 기대 스케줄 목록 */
    @NotEmpty(message = "인증할 스케줄 목록이 비어있습니다.")
    @Valid
    private List<ExpectedScheduleDto> expectedSchedules;

    /**
     * 분석 시 기대되는 개별 스케줄 정보 DTO입니다.
     */
    @Getter
    @Setter
    public static class ExpectedScheduleDto {
        /** 스케줄 ID */
        @NotNull(message = "스케줄 ID는 필수입니다.")
        private Long scheduleId;
    }
}
