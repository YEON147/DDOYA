package com.ssafy.ddoya.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserIntakeTimingSettingRequest {

    @NotBlank(message = "섭취 시각은 필수입니다. (형식: HH:mm)")
    private String intakeTime;

}
