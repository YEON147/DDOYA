package com.ssafy.ddoya.domain.notification.service;

import com.ssafy.ddoya.domain.notification.dto.NotificationListResponse;
import com.ssafy.ddoya.domain.notification.entity.NotificationDeliveryLog;
import com.ssafy.ddoya.domain.notification.repository.NotificationDeliveryLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

/**
 * 사용자 알림의 조회 및 전체 삭제를 담당하는 서비스입니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationDeliveryLogRepository deliveryLogRepository;

    /**
     * 특정 사용자의 삭제되지 않은 알림 내역을 최신순으로 페이징 조회합니다.
     */
    public NotificationListResponse getNotifications(Long userId, Pageable pageable) {
        Page<NotificationDeliveryLog> logs = deliveryLogRepository
                .findByUser_UserIdAndIsDeletedFalseOrderBySentAtDesc(userId, pageable);

        return NotificationListResponse.builder()
                .notifications(logs.stream()
                        .map(log -> NotificationListResponse.NotificationDto.builder()
                                .notificationId(log.getDeliveryLogId())
                                .type(log.getType())
                                .title(log.getTitle())
                                .body(log.getBody())
                                .sentAt(log.getSentAt())
                                .relatedId(log.getRelatedId())
                                .build())
                        .collect(Collectors.toList()))
                .page(logs.getNumber())
                .size(logs.getSize())
                .totalElements(logs.getTotalElements())
                .totalPages(logs.getTotalPages())
                .hasNext(logs.hasNext())
                .build();
    }

    /**
     * 특정 사용자의 모든 알림 내역을 전체 삭제(Soft Delete) 합니다.
     */
    @Transactional
    public void deleteAllNotifications(Long userId) {
        deliveryLogRepository.deleteAllByUser_UserId(userId);
        log.info("사용자 알림 내역 전체 삭제 완료: userId={}", userId);
    }
}
