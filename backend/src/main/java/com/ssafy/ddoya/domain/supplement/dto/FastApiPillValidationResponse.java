package com.ssafy.ddoya.domain.supplement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * FastAPI 서버로부터 받은 알약 이미지 검증 결과를 담는 DTO 클래스입니다.
 * 업로드된 이미지가 유효한 알약 사진인지 여부를 포함합니다.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FastApiPillValidationResponse {

    /**
     * 사용 가능 여부
     */
    private boolean success;

    /**
     * 검증 결과 메시지
     */
    private String message;
}
