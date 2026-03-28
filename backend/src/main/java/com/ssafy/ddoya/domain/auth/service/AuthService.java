package com.ssafy.ddoya.domain.auth.service;

import com.ssafy.ddoya.domain.auth.dto.SignUpRequest;
import com.ssafy.ddoya.domain.auth.dto.SignUpResponse;
import com.ssafy.ddoya.domain.auth.dto.RefreshTokenResponse;
import com.ssafy.ddoya.domain.auth.entity.RefreshToken;
import com.ssafy.ddoya.domain.auth.repository.RefreshTokenRepository;
import com.ssafy.ddoya.domain.notification.service.NotificationSettingService;
import com.ssafy.ddoya.domain.user.entity.User;
import com.ssafy.ddoya.domain.user.repository.UserRepository;
import com.ssafy.ddoya.domain.user.service.UserIntakeTimingSettingService;
import com.ssafy.ddoya.global.exception.CustomException;
import com.ssafy.ddoya.global.jwt.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;
    private final UserIntakeTimingSettingService userIntakeTimingSettingService;
    private final NotificationSettingService notificationSettingService;

    @Transactional
    public void logout(Long  userId) {
        // Refresh Token 삭제
        refreshTokenRepository.deleteByUserId(userId);
    }

    @Transactional
    public RefreshTokenResponse refresh(String refreshToken) {
        // Refresh Token 검증
        if (refreshToken == null || refreshToken.isBlank()) {
            throw CustomException.unauthorized("Refresh Token이 없습니다.");
        }

        try {
            if (jwtUtil.isExpired(refreshToken)) {
                throw CustomException.unauthorized("만료된 Refresh Token입니다.");
            }

            String category = jwtUtil.getCategory(refreshToken);
            if (!"refresh".equals(category)) {
                throw CustomException.unauthorized("Refresh Token이 아닙니다.");
            }

            // DB에 존재하는지 확인
            RefreshToken savedToken = refreshTokenRepository.findByToken(refreshToken)
                    .orElseThrow(() -> CustomException.unauthorized("DB에 존재하지 않는 Refresh Token입니다."));

            Long userId = jwtUtil.getUserId(refreshToken);
            String email = jwtUtil.getEmail(refreshToken);

            // 새로운 Access Token, Refresh Token 발급
            String newAccessToken = jwtUtil.createJwt("access", userId, email, 30 * 60 * 1000L);
            String newRefreshToken = jwtUtil.createJwt("refresh", userId, email, 14 * 24 * 60 * 60 * 1000L);

            // 기존 토큰 삭제 후 새 리프레시 토큰 저장 (Refresh Token Rotation)
            refreshTokenRepository.delete(savedToken);
            refreshTokenRepository.save(
                    RefreshToken.builder()
                            .userId(userId)
                            .token(newRefreshToken)
                            .expiresAt(java.time.LocalDateTime.now().plusDays(14))
                            .build()
            );

            return RefreshTokenResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .build();
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            throw CustomException.unauthorized("유효하지 않은 Refresh Token입니다.");
        }
    }

    @Transactional
    public SignUpResponse signUp(@Valid SignUpRequest request) {
        String email = request.getEmail();

        // 이메일 중복 여부
        if (userRepository.existsByEmail(email)) {
            throw CustomException.conflict("이미 사용 중인 이메일입니다.");
        }

        // 비밀번호 확인 검증
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw CustomException.badRequest("비밀번호가 일치하지 않습니다.");
        }

        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // User 엔티티 생성
        User user = User.builder()
                .email(email)
                .password(encodedPassword)
                .nickname(request.getNickname())
                .gender(request.getGender())
                .birthDate(request.getBirthDate())
                .heightCm(request.getHeightCm())
                .weightKg(request.getWeightKg())
                .build();

        // 저장
        User savedUser = userRepository.save(user);

        // 기본 섭취 시점 데이터 자동 생성 (BEFORE_BREAKFAST ~ BEFORE_SLEEP)
        userIntakeTimingSettingService.createDefaultSettings(savedUser);

        // 기본 알림 설정 데이터 자동 생성 (모두 허용 상태)
        notificationSettingService.createDefaultNotificationSetting(savedUser);

        // 기본 약 챙김 알림 스케줄 생성 (20:00)
        notificationSettingService.createDefaultCarrySchedule(savedUser);

        return SignUpResponse.from(savedUser);
    }

    public void checkEmailDuplicate(String email) {
        if (userRepository.existsByEmail(email)) {
            throw CustomException.conflict("이미 사용 중인 이메일입니다.");
        }
    }
}
