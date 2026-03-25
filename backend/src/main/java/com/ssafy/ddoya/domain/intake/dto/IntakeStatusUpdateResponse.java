package com.ssafy.ddoya.domain.intake.dto;

import com.ssafy.ddoya.domain.intake.entity.IntakeStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 섭취 기록 상태 수정을 위한 응답 DTO 클래스입니다.
 */
@Getter
@Builder
public class IntakeStatusUpdateResponse {
    /**
     * 섭취 기록 ID
     */
    private Long intakeRecordId;

    /**
     * 섭취 일정 ID
     */
    private Long scheduleId;

    /**
     * 변경 된 후 상태
     */
    private IntakeStatus status;

    /**
     * 실제 조치 시간 (status가 MISSED, SKIPPED일 경우 null)
     */
    private LocalDateTime actionAt;
}
