package com.ssafy.ddoya.domain.supplement.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FastApiEmbeddingResponse {
    private boolean success;
    private String pillReferenceEmbeddingPath;
    private String message;
}
