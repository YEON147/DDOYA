package com.ssafy.ddoya.domain.intake.scheduler;

import com.ssafy.ddoya.domain.intake.service.IntakeBatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;

/**
 * 주기적으로 섭취 기록 생성 업무를 수행하는 스케줄러 클래스입니다.
 */
@Component
@RequiredArgsConstructor
public class IntakeRecordScheduler {

    private final IntakeBatchService intakeBatchService;

    @Value("${app.timezone}")
    private String appTimezone;

    /**
     * 매일 자정(00:00:00)에 실행되어 당일의 섭취 스케줄을 기반으로 기록 데이터를 미리 생성합니다.
     */
    @Scheduled(cron = "0 0 0 * * *", zone = "${app.timezone}")
    public void scheduleIntakeRecordCreation() {
        // 호출 시점의 한국 날짜 기준으로 생성
        LocalDate today = LocalDate.now(ZoneId.of(appTimezone));
        intakeBatchService.createDailyIntakeRecords(today);
    }
}
