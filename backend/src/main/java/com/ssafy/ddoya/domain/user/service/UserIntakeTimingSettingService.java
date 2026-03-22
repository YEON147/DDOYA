package com.ssafy.ddoya.domain.user.service;

import com.ssafy.ddoya.domain.report.entity.IntakeTiming;
import com.ssafy.ddoya.domain.user.dto.UserIntakeTimingSettingRequest;
import com.ssafy.ddoya.domain.user.dto.UserIntakeTimingSettingResponse;
import com.ssafy.ddoya.domain.user.dto.UserIntakeTimingSettingsListResponse;
import com.ssafy.ddoya.domain.user.entity.User;
import com.ssafy.ddoya.domain.user.entity.UserIntakeTimingSetting;
import com.ssafy.ddoya.domain.user.repository.UserIntakeTimingSettingRepository;
import com.ssafy.ddoya.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserIntakeTimingSettingService {

    private final UserIntakeTimingSettingRepository settingRepository;

    /**
     * 섭취 시점의 시각(intakeTime)을 수정합니다.
     * Request DTO에서 String으로 받은 뒤 여기서 LocalTime.parse를 시도합니다.
     * 이유: Jackson의 역직렬화 에러를 피하고, "형식이 올바르지 않습니다"라는 명확한 400 에러 메시지를 던지기 위함입니다.
     */
    @Transactional
    public UserIntakeTimingSettingResponse updateIntakeTime(Long userId, Long settingId,
            UserIntakeTimingSettingRequest request) {
        UserIntakeTimingSetting setting = settingRepository.findById(settingId)
                .orElseThrow(() -> CustomException.notFound("해당 섭취 시점 설정을 찾을 수 없습니다."));

        if (!setting.getUser().getUserId().equals(userId)) {
            throw CustomException.forbidden("다른 사용자의 섭취 시점 설정은 수정할 권한이 없습니다.");
        }

        LocalTime parsedTime;
        try {
            parsedTime = LocalTime.parse(request.getIntakeTime(), DateTimeFormatter.ofPattern("HH:mm"));
        } catch (DateTimeParseException e) {
            throw CustomException.badRequest("섭취 시각 형식이 올바르지 않습니다. (예: 08:30)");
        }

        setting.updateIntakeTime(parsedTime);
        return UserIntakeTimingSettingResponse.from(setting);
    }

    /**
     * 로그인한 사용자의 섭취 시점별 섭취 시간 목록을 조회합니다.
     */
    public UserIntakeTimingSettingsListResponse getUserSettings(Long userId) {
        List<UserIntakeTimingSetting> settings = settingRepository.findAllByUserUserId(userId);
        return UserIntakeTimingSettingsListResponse.from(settings);
    }

    /**
     * 신규 가입 시 기본 7가지 섭취 시점 설정을 생성합니다.
     * IntakeTiming enum에 정의된 기본값을 기반으로 일괄 생성합니다.
     */
    @Transactional
    public void createDefaultSettings(User user) {
        List<UserIntakeTimingSetting> defaultSettings = Arrays.stream(IntakeTiming.values())
                .map(timing -> UserIntakeTimingSetting.builder()
                        .user(user)
                        .intakeTiming(timing)
                        .intakeTime(timing.getDefaultTime())
                        .build())
                .toList();

        settingRepository.saveAll(defaultSettings);
    }
}
