package com.ssafy.ddoya.domain.notification.service;

import com.ssafy.ddoya.domain.supplement.entity.SupplementInventory;
import com.ssafy.ddoya.domain.user.repository.UserNotificationSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 재고 감소 시점에 재구매 알림 발송 조건을 검사하고 알림을 트리거하는 서비스입니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RepurchaseNotificationService {

    private final UserNotificationSettingRepository userNotificationSettingRepository;
    private final NotificationFacade notificationFacade;

    /**
     * 재고 정보를 바탕으로 재구매 알림 발송 대상인지 검사하고 알림을 보냅니다.
     * 
     * @param inventory 재고 정보 (이미 영량제 정보가 포함된 상태)
     */
    public void checkAndSendRepurchaseReminder(SupplementInventory inventory) {
        log.debug("[checkAndSendRepurchaseReminder] checkAndSendRepurchaseReminder 호출");
        if (inventory == null || inventory.getSupplement() == null) {
            return;
        }

        Long userId = inventory.getSupplement().getUser().getUserId();
        Long userSupplementId = inventory.getSupplement().getUserSupplementId();
        String supplementAlias = inventory.getSupplement().getAlias();
        int stockQuantity = inventory.getStockQuantity();
        log.debug("[checkAndSendRepurchaseReminder] inventory.getStockQuantity() = {}", inventory.getStockQuantity());

        // 1. 개별 영양제의 재고 알림 설정이 꺼져있으면 스킵
        log.debug("[checkAndSendRepurchaseReminder] inventory.isStockAlertEnabled() = {}", inventory.isStockAlertEnabled());
        if (!inventory.isStockAlertEnabled()) {
            return;
        }

        // 2. 재고가 10개 초과면 스킵
        if (stockQuantity > 10) {
            return;
        }

        // 3. 사용자의 전체 재고 알림 수신 설정 확인
        userNotificationSettingRepository.findByUserId(userId)
                .ifPresent(setting -> {
                    if (setting.isStockNotificationEnabled()) {
                        log.info("재구매 알림 발송 조건 충족: userId={}, supplement={}, stock={}", 
                                userId, supplementAlias, stockQuantity);
                        
                        notificationFacade.sendRepurchaseReminder(
                                userId,
                                userSupplementId,
                                supplementAlias,
                                stockQuantity
                        );
                    }
                });
    }
}
