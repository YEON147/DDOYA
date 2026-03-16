package com.ssafy.ddoya.domain.auth.dto;

import com.ssafy.ddoya.domain.user.entity.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class SignUpRequestDto {
    @NotBlank(message = "이메일을 입력해주세요.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String email;

    @NotBlank(message = "비밀번호를 입력해주세요.")
    private String password;

    @NotBlank(message = "비밀번호를 확인해주세요.")
    private String confirmPassword;

    @NotBlank(message = "닉네임음 입력해주세요.")
    private String nickname;

    private Gender gender;

    @NotNull(message = "생년월일을 입력해주세요.")
    private LocalDate birthDate;

    @NotNull(message = "신장을 입력해주세요.")
    private BigDecimal heightCm;

    @NotNull(message = "몸무게를 입력해주세요.")
    private BigDecimal weightKg;
}
