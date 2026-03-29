package com.ssafy.ddoya.domain.supplement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * 특정 영양제의 재구매 알림 수신 여부 수정 결과 응답 DTO입니다.
 */
@Getter
@Builder
@AllArgsConstructor
public class SupplementStockNotificationUpdateResponse {

    private Long userSupplementId;
    private Boolean stockNotificationEnabled;

}
