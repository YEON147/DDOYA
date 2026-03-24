package com.ssafy.ddoya.domain.notification.service;

import com.ssafy.ddoya.domain.notification.dto.DeviceTokenRegisterRequest;
import com.ssafy.ddoya.domain.notification.entity.DeviceToken;
import com.ssafy.ddoya.domain.notification.repository.DeviceTokenRepository;
import com.ssafy.ddoya.domain.user.entity.User;
import com.ssafy.ddoya.domain.user.repository.UserRepository;
import com.ssafy.ddoya.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * FCM 모바일 기기별 토큰 관리를 전담하는 서비스입니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DeviceTokenService {

    private final DeviceTokenRepository deviceTokenRepository;
    private final UserRepository userRepository;

    /**
     * 로그인한 사용자가 앱을 켤 때 던져주는 본인의 FCM 기기 토큰을 로컬 DB에 등록합니다.
     * 이미 누군가 등록해둔 토큰인 경우 무조건 현재 로그인한 사용자 소유로 갈아끼우며 재활성화합니다.
     */
    @Transactional
    public void registerToken(Long userId, DeviceTokenRegisterRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> CustomException.notFound("사용자를 찾을 수 없습니다."));

        deviceTokenRepository.findByFcmToken(request.getFcmToken())
                .ifPresentOrElse(
                        existingToken -> {
                            // 토큰이 이미 존재(이전에 로그인했거나 타 계정에서 발급되었던 토큰)할 경우, 권한/활성화 갱신
                            existingToken.activateForUser(user, request.getDeviceType());
                            log.info("FCM 토큰 갱신: userId={} deviceType={}", userId, request.getDeviceType());
                        },
                        () -> {
                            // 한번도 저장되지 않은 완전 신규 토큰일 경우 생성
                            DeviceToken newToken = DeviceToken.builder()
                                    .user(user)
                                    .fcmToken(request.getFcmToken())
                                    .deviceType(request.getDeviceType())
                                    .isActive(true)
                                    .build();
                            deviceTokenRepository.save(newToken);
                            log.info("FCM 신규 토큰 저장: userId={} deviceType={}", userId, request.getDeviceType());
                        }
                );
    }

    /**
     * 사용자가 기기 알림 수신을 종료(로그아웃 등)할 때 호출되어, 해당 특정 토큰만 DB에서 비활성화 처리합니다.
     */
    @Transactional
    public void deactivateToken(Long userId, String fcmToken) {
        deviceTokenRepository.findByFcmToken(fcmToken)
                // 만약 현재 회원의 토큰인 경우에만
                .filter(token -> token.getUser().getUserId().equals(userId))
                .ifPresent(token -> {
                    token.deactivate();
                    log.info("FCM 토큰 비활성화 처리 완료: userId={}", userId);
                });
    }

    /**
     * 특정 사용자에게 푸시를 발신해야 할 때, 수신 가능한 '활성 상태'인 기기 토큰들만 찾아 리턴하는 내부 헬퍼 역할입니다.
     */
    public List<DeviceToken> getActiveTokens(Long userId) {
        return deviceTokenRepository.findAllByUser_UserIdAndIsActiveTrue(userId);
    }
}
