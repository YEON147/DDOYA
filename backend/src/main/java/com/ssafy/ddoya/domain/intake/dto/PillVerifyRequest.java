package com.ssafy.ddoya.domain.intake.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PillVerifyRequest {

    @NotEmpty(message = "인증할 영양제 목록이 비어있습니다.")
    @Valid
    private List<ExpectedItemDto> expectedItems;

    @Getter
    @Setter
    public static class ExpectedItemDto {
        @NotNull(message = "영양제 ID는 필수입니다.")
        private Long userSupplementId;

        @NotNull(message = "권장 섭취량은 필수입니다.")
        @Min(value = 1, message = "섭취량은 1개 이상이어야 합니다.")
        private Integer dosePerIntake;

        @NotEmpty(message = "참조 임베딩 경로는 필수입니다.")
        private String pillReferenceEmbeddingPath;
    }
}
