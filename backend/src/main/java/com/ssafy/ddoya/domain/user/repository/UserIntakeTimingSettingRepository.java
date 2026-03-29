package com.ssafy.ddoya.domain.user.repository;

import com.ssafy.ddoya.domain.user.entity.UserIntakeTimingSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserIntakeTimingSettingRepository extends JpaRepository<UserIntakeTimingSetting, Long> {
    List<UserIntakeTimingSetting> findAllByUserUserId(Long userId);
}
