package com.ssafy.ddoya.domain.auth.dto;

import com.ssafy.ddoya.domain.user.entity.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class SignUpRequest {
    @NotBlank(message = "이메일을 입력해주세요.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String email;

    @NotBlank(message = "비밀번호를 입력해주세요.")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$",
            message = "비밀번호는 8자 이상, 영문/숫자/특수문자를 포함해야 합니다.")
    private String password;

    @NotBlank(message = "비밀번호를 확인해주세요.")
    private String confirmPassword;

    @NotBlank(message = "닉네임을 입력해주세요.")
    private String nickname;

    @NotNull(message = "성별을 선택해주세요.")
    private Gender gender;

    @NotNull(message = "생년월일을 입력해주세요.")
    private LocalDate birthDate;

    @NotNull(message = "신장을 입력해주세요.")
    private BigDecimal heightCm;

    @NotNull(message = "몸무게를 입력해주세요.")
    private BigDecimal weightKg;
}
