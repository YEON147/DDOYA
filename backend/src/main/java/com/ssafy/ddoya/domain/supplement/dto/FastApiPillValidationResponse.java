package com.ssafy.ddoya.domain.supplement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FastApiPillValidationResponse {

    private boolean success;
    private String message;
}
