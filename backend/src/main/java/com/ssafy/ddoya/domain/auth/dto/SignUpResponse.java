package com.ssafy.ddoya.domain.auth.dto;

import com.ssafy.ddoya.domain.user.entity.Gender;
import com.ssafy.ddoya.domain.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignUpResponse {
    private Long userId;
    private String email;
    private String nickname;
    private Gender gender;
    private LocalDate birthday;
    private BigDecimal heightCm;
    private BigDecimal weightKg;
    private LocalDateTime createdAt;

    public static SignUpResponse from(User user) {
        return SignUpResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .gender(user.getGender())
                .birthday(user.getBirthDate())
                .heightCm(user.getHeightCm())
                .weightKg(user.getWeightKg())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
