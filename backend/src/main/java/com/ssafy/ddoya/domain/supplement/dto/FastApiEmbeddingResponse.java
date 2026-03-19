package com.ssafy.ddoya.domain.supplement.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * FastAPI 서버로부터 받은 알약 이미지 임베딩 추출 결과를 담는 DTO 클래스입니다.
 */
@Getter
@Builder
public class FastApiEmbeddingResponse {
    /**
     * 임베딩 추출 성공 여부
     */
    private boolean success;

    /**
     * 생성된 임베딩 파일의 저장 경로
     */
    private String pillReferenceEmbeddingPath;

    /**
     * 결과 안내 메시지
     */
    private String message;
}
