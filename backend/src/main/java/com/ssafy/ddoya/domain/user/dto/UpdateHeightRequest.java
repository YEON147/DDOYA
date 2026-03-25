package com.ssafy.ddoya.domain.user.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
public class UpdateHeightRequest {

    @NotNull(message = "신장을 입력해주세요.")
    @DecimalMin(value = "0.0", inclusive = false, message = "신장은 0보다 커야 합니다.")
    private BigDecimal heightCm;
}