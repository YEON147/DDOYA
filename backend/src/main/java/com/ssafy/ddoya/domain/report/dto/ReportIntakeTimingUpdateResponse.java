package com.ssafy.ddoya.domain.report.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

/**
 * 리포트 복용 시각 확정 저장 응답 DTO
 */
@Getter
@Builder
public class ReportIntakeTimingUpdateResponse {

    private Long reportId;

    @JsonProperty("saved_count")
    private Integer savedCount;

    @JsonProperty("updated_supplement_count")
    private Integer updatedSupplementCount;

    private Boolean needsRefresh;
}
