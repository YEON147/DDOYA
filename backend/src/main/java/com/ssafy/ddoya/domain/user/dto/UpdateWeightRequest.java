package com.ssafy.ddoya.domain.user.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
public class UpdateWeightRequest {

    @NotNull(message = "몸무게를 입력해주세요.")
    @DecimalMin(value = "0.0", inclusive = false, message = "몸무게는 0보다 커야 합니다.")
    private BigDecimal weightKg;
}