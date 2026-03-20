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

@Component
@RequiredArgsConstructor
@Slf4j
public class IntakeRecordStartupInitializer {

    private final IntakeBatchService intakeBatchService;

    @Value("${app.timezone}")
    private String appTimezone;

    @EventListener(ApplicationReadyEvent.class)
    public void initializeIntakeRecords() {
        LocalDate today = LocalDate.now(ZoneId.of(appTimezone));
        log.info("[BATCH] Startup intake record check for {}", today);
        intakeBatchService.createDailyIntakeRecords(today);
    }
}
