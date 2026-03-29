package com.ssafy.ddoya.domain.intake.scheduler;

import com.ssafy.ddoya.domain.intake.service.IntakeBatchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;

/**
 * 애플리케이션 시작 시 당일의 섭취 기록 존재 여부를 확인하고 초기화하는 컴포넌트입니다.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class IntakeRecordStartupInitializer {

    private final IntakeBatchService intakeBatchService;

    @Value("${app.timezone}")
    private String appTimezone;

    /**
     * 애플리케이션이 준비 완료되었을 때 실행되어 당일의 섭취 기록을 생성(또는 체크)합니다.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void initializeIntakeRecords() {
        LocalDate today = LocalDate.now(ZoneId.of(appTimezone));
        log.info("[BATCH] Startup intake record check for {}", today);
        intakeBatchService.createDailyIntakeRecords(today);
    }
}
