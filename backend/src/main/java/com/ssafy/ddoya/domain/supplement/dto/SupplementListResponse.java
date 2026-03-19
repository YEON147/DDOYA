package com.ssafy.ddoya.domain.supplement.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 내 영양제 목록 조회를 위한 응답 DTO 클래스입니다.
 * 페이징 정보와 요약된 영양제 리스트를 포함합니다.
 */
@Getter
@Builder
public class SupplementListResponse {

    /**
     * 조회된 영양제 요약 정보 리스트
     */
    private List<SupplementSummaryDto> supplements;

    /**
     * 현재 페이지 번호 (0부터 시작)
     */
    private int page;

    /**
     * 한 페이지당 사이즈
     */
    private int size;

    /**
     * 전체 검색된 영양제 개수
     */
    private long totalElements;

    /**
     * 전체 페이지 수
     */
    private int totalPages;

    /**
     * 다음 페이지 존재 여부
     */
    private boolean hasNext;

    /**
     * 목록에 표시할 개별 영양제 요약 정보 DTO
     */
    @Getter
    @Builder
    public static class SupplementSummaryDto {
        /**
         * 사용자가 등록한 영양제 ID
         */
        private Long userSupplementId;

        /**
         * 알약 대표 이미지 URL
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
         * 현재 남은 재고 수량
         */
        private Integer stockQuantity;
    }
}
