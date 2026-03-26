package com.ssafy.ddoya.domain.user.service;

import com.ssafy.ddoya.domain.user.dto.*;
import com.ssafy.ddoya.domain.user.entity.User;
import com.ssafy.ddoya.domain.user.repository.UserRepository;
import com.ssafy.ddoya.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserInfoResponse getMyInfo(Long userId) {
        User user = getUserById(userId);
        return UserInfoResponse.from(user);
    }

    @Transactional
    public UserInfoResponse updateNickname(Long userId, UpdateNicknameRequest request) {
        User user = getUserById(userId);
        user.updateNickname(request.getNickname().trim());
        return UserInfoResponse.from(user);
    }

    @Transactional
    public UserInfoResponse updateBirthDate(Long userId, UpdateBirthDateRequest request) {
        User user = getUserById(userId);
        user.updateBirthDate(request.getBirthDate());
        return UserInfoResponse.from(user);
    }

    @Transactional
    public UserInfoResponse updateHeight(Long userId, UpdateHeightRequest request) {
        User user = getUserById(userId);
        user.updateHeightCm(request.getHeightCm());
        return UserInfoResponse.from(user);
    }

    @Transactional
    public UserInfoResponse updateWeight(Long userId, UpdateWeightRequest request) {
        User user = getUserById(userId);
        user.updateWeightKg(request.getWeightKg());
        return UserInfoResponse.from(user);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = getUserById(userId);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw CustomException.badRequest("현재 비밀번호가 일치하지 않습니다.");
        }

        if (!request.getNewPassword().equals(request.getNewPasswordConfirm())) {
            throw CustomException.badRequest("새 비밀번호와 새 비밀번호 확인이 일치하지 않습니다.");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw CustomException.badRequest("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
        }

        String encodedPassword = passwordEncoder.encode(request.getNewPassword());
        user.changePassword(encodedPassword);
    }

    private User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> CustomException.notFound("사용자 정보를 찾을 수 없습니다."));
    }
}