package com.ssafy.ddoya.domain.supplement.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
public class SupplementRegisterRequest {

    // ── 사용자 직접 입력 ──────────────────────────
    @NotBlank(message = "영양제 별칭은 필수입니다.")
    private String alias;

    @NotNull(message = "하루 복용 횟수는 필수입니다.")
    @Min(value = 1, message = "하루 복용 횟수는 1 이상이어야 합니다.")
    private Integer dailyDose;

    @NotNull(message = "1회 복용량은 필수입니다.")
    @Min(value = 1, message = "1회 복용량은 1 이상이어야 합니다.")
    private Integer dosePerIntake;

    @NotNull(message = "총 용량은 필수입니다.")
    @Min(value = 0, message = "총 용량은 양수이어야 합니다.")
    private Integer capacity;

    // ── 성분표 분석 결과 ──────────────────────────
    @NotNull(message = "신체 부위 ID는 필수입니다.")
    private Byte bodyPartId;
    private String bodyPartName;
    @Valid
    @NotEmpty(message = "성분 분석 결과는 최소 1개 이상이어야 합니다.")
    private List<IngredientDto> ingredients;

    @Getter
    public static class IngredientDto {
        @NotNull(message = "성분 ID는 필수입니다.")
        private Long normalizedIngredientId;

        @NotBlank(message = "정규화된 성분명은 필수입니다.")
        private String normalizedName;

        @NotBlank(message = "원본 성분명은 필수입니다.")
        private String rawName;

        @NotBlank(message = "성분 단위는 필수입니다.")
        private String unit;

        @NotNull(message = "성분 함량은 필수입니다.")
        private BigDecimal amount;

        @NotNull(message = "주성분 여부는 필수입니다.")
        private Boolean isPrimary;
    }
}
