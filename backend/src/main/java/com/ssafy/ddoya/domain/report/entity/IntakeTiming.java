package com.ssafy.ddoya.domain.report.entity;

import java.time.LocalTime;

public enum IntakeTiming {
    BEFORE_BREAKFAST(LocalTime.of(7, 0), "아침 식전"),
    AFTER_BREAKFAST(LocalTime.of(8, 0), "아침 식후"),
    BEFORE_LUNCH(LocalTime.of(12, 0), "점심 식전"),
    AFTER_LUNCH(LocalTime.of(13, 0), "점심 식후"),
    BEFORE_DINNER(LocalTime.of(18, 0), "저녁 식전"),
    AFTER_DINNER(LocalTime.of(19, 0), "저녁 식후"),
    BEFORE_SLEEP(LocalTime.of(23, 0), "취침 전");

    private final LocalTime defaultTime;
    private final String displayName;

    IntakeTiming(LocalTime defaultTime, String displayName) {
        this.defaultTime = defaultTime;
        this.displayName = displayName;
    }

    public LocalTime getDefaultTime() {
        return defaultTime;
    }

    public String getDisplayName() {
        return displayName;
    }
}
