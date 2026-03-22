package com.ssafy.ddoya.domain.user.dto;

import com.ssafy.ddoya.domain.user.entity.UserIntakeTimingSetting;
import lombok.Builder;
import lombok.Getter;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Getter
@Builder
public class UserIntakeTimingSettingsListResponse {

    private List<SettingItem> settings;

    public static UserIntakeTimingSettingsListResponse from(List<UserIntakeTimingSetting> settingEntities) {
        List<SettingItem> items = settingEntities.stream()
                .map(SettingItem::from)
                // Enum 선언 순서대로 정렬 (BEFORE_BREAKFAST -> ... -> BEFORE_SLEEP)
                .sorted((a, b) -> a.getEnumOrdinal() - b.getEnumOrdinal())
                .toList();
        return new UserIntakeTimingSettingsListResponse(items);
    }

    @Getter
    @Builder
    public static class SettingItem {
        private Long userIntakeTimingSettingId;
        private String intakeTiming;
        private String intakeTime;
        private int enumOrdinal; // 내부 정렬용

        public static SettingItem from(UserIntakeTimingSetting setting) {
            return SettingItem.builder()
                    .userIntakeTimingSettingId(setting.getUserIntakeTimingSettingId())
                    .intakeTiming(setting.getIntakeTiming().getDisplayName()) // 한글명 반환
                    .intakeTime(setting.getIntakeTime().format(DateTimeFormatter.ofPattern("HH:mm")))
                    .enumOrdinal(setting.getIntakeTiming().ordinal())
                    .build();
        }
    }
}
