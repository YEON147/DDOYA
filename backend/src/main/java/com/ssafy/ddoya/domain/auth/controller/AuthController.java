package com.ssafy.ddoya.domain.auth.controller;

import com.ssafy.ddoya.domain.auth.dto.*;
import com.ssafy.ddoya.domain.auth.service.AuthService;
import com.ssafy.ddoya.global.response.SuccessResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/logout")
    public ResponseEntity<SuccessResponse<Void>> logout(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUser().getUserId();
        authService.logout(userId);
        return ResponseEntity.ok(SuccessResponse.of("로그아웃 되었습니다."));
    }

    @PostMapping("/signup")
    public ResponseEntity<SuccessResponse<SignUpResponse>> signUp(
            @Valid @RequestBody SignUpRequest request) {
        SignUpResponse response = authService.signUp(request);
        return ResponseEntity.ok(SuccessResponse.of("회원가입에 성공하였습니다.", response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<SuccessResponse<RefreshTokenResponse>> refresh(
            @RequestBody RefreshTokenRequest request) {

        String refreshToken = request.getRefreshToken();
        RefreshTokenResponse tokens = authService.refresh(refreshToken);

        return ResponseEntity.ok(SuccessResponse.of("토큰이 재발급 되었습니다.", tokens));
    }

    @GetMapping("/check-email")
    public ResponseEntity<SuccessResponse<Void>> checkEmailDuplicate(
            @RequestParam String email) {

        authService.checkEmailDuplicate(email);
        return ResponseEntity.ok(
                SuccessResponse.of("이메일 중복 확인에 성공했습니다.")
        );
    }
}
