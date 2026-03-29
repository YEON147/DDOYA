package com.ssafy.ddoya.domain.user.dto;

import com.ssafy.ddoya.domain.report.entity.IntakeTiming;
import com.ssafy.ddoya.domain.user.entity.UserIntakeTimingSetting;
import lombok.Builder;
import lombok.Getter;

import java.time.format.DateTimeFormatter;

@Getter
@Builder
public class UserIntakeTimingSettingResponse {

    private Long userIntakeTimingSettingId;
    private Long userId;
    private IntakeTiming intakeTiming;
    private String intakeTime;

    public static UserIntakeTimingSettingResponse from(UserIntakeTimingSetting setting) {
        return UserIntakeTimingSettingResponse.builder()
                .userIntakeTimingSettingId(setting.getUserIntakeTimingSettingId())
                .userId(setting.getUser().getUserId())
                .intakeTiming(setting.getIntakeTiming())
                .intakeTime(setting.getIntakeTime().format(DateTimeFormatter.ofPattern("HH:mm")))
                .build();
    }
}
