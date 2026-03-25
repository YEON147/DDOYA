package com.ssafy.ddoya.domain.intake.dto;

import com.ssafy.ddoya.domain.intake.entity.IntakeStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 섭취 기록 상태 수정을 위한 요청 DTO 클래스입니다.
 */
@Getter
@NoArgsConstructor
public class IntakeStatusUpdateRequest {

    /**
     * 변경할 상태 (MISSED, SKIPPED 만 허용)
     */
    @NotNull(message = "변경할 상태(status)값은 필수입니다.")
    private IntakeStatus status;
}
