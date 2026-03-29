package com.ssafy.ddoya.domain.auth.dto;

import com.ssafy.ddoya.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {

    private Long userId;
    private String email;
    private String nickname;

    private String accessToken;
    private String refreshToken;

    public static LoginResponse from(User user) {
        return LoginResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .build();
    }
}
