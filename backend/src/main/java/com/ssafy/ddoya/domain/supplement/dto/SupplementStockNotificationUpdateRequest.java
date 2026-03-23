package com.ssafy.ddoya.domain.supplement.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 특정 영양제의 재구매 알림 수신 여부 수정을 위한 요청 DTO입니다.
 */
@Getter
@Setter
@NoArgsConstructor
public class SupplementStockNotificationUpdateRequest {

    @NotNull(message = "재구매 알림 수신 여부는 필수입니다.")
    private Boolean enabled;

}
