package com.ssafy.ddoya.domain.report.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 리포트 복용 시각 확정 저장 요청 DTO
 */
@Getter
@NoArgsConstructor
public class ReportIntakeTimingUpdateRequest {

    @NotEmpty(message = "확정 저장할 영양제 목록이 비어있을 수 없습니다.")
    @Valid
    private List<UserSupplementTimingRequest> userSupplements;

    @Getter
    @NoArgsConstructor
    public static class UserSupplementTimingRequest {

        @NotNull(message = "영양제 ID는 필수입니다.")
        private Long userSupplementId;

        @NotEmpty(message = "복용 시각 목록이 비어있을 수 없습니다.")
        private List<@NotBlank(message = "복용 시각은 공백일 수 없습니다.") 
                     @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "시간 형식은 HH:mm 이어야 합니다.") 
                     String> intakeTimes;
    }
}
