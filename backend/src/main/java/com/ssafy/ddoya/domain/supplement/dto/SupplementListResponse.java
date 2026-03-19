package com.ssafy.ddoya.domain.supplement.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class SupplementListResponse {

    private List<SupplementSummaryDto> supplements;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean hasNext;

    @Getter
    @Builder
    public static class SupplementSummaryDto {
        private Long userSupplementId;
        private String pillImageUrl;
        private String alias;
        private List<String> primaryIngredientNames;
        private Integer capacity;
    }
}
