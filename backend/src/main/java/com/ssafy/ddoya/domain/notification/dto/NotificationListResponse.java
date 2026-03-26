package com.ssafy.ddoya.domain.notification.dto;

import com.ssafy.ddoya.domain.notification.enums.NotificationType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class NotificationListResponse {
    private List<NotificationDto> notifications;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean hasNext;

    @Getter
    @Builder
    public static class NotificationDto {
        private Long notificationId;
        private NotificationType type;
        private String title;
        private String body;
        private LocalDateTime sentAt;
        private Long relatedId;
    }
}
