package com.ssafy.ddoya.domain.user.controller;

import com.ssafy.ddoya.domain.auth.dto.CustomUserDetails;
import com.ssafy.ddoya.domain.user.dto.*;
import com.ssafy.ddoya.domain.user.service.UserService;
import com.ssafy.ddoya.global.response.SuccessResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<SuccessResponse<UserInfoResponse>> getMyInfo(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long userId = userDetails.getUser().getUserId();
        UserInfoResponse result = userService.getMyInfo(userId);
        return ResponseEntity.ok(SuccessResponse.of("사용자 정보를 조회했습니다.", result));
    }

    @PutMapping("/me/nickname")
    public ResponseEntity<SuccessResponse<UserInfoResponse>> updateNickname(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UpdateNicknameRequest request) {

        Long userId = userDetails.getUser().getUserId();
        UserInfoResponse result = userService.updateNickname(userId, request);
        return ResponseEntity.ok(SuccessResponse.of("닉네임이 수정되었습니다.", result));
    }

    @PutMapping("/me/birth")
    public ResponseEntity<SuccessResponse<UserInfoResponse>> updateBirthDate(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UpdateBirthDateRequest request) {

        Long userId = userDetails.getUser().getUserId();
        UserInfoResponse result = userService.updateBirthDate(userId, request);
        return ResponseEntity.ok(SuccessResponse.of("생년월일이 수정되었습니다.", result));
    }

    @PutMapping("/me/height")
    public ResponseEntity<SuccessResponse<UserInfoResponse>> updateHeight(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UpdateHeightRequest request) {

        Long userId = userDetails.getUser().getUserId();
        UserInfoResponse result = userService.updateHeight(userId, request);
        return ResponseEntity.ok(SuccessResponse.of("신장이 수정되었습니다.", result));
    }

    @PutMapping("/me/weight")
    public ResponseEntity<SuccessResponse<UserInfoResponse>> updateWeight(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UpdateWeightRequest request) {

        Long userId = userDetails.getUser().getUserId();
        UserInfoResponse result = userService.updateWeight(userId, request);
        return ResponseEntity.ok(SuccessResponse.of("몸무게가 수정되었습니다.", result));
    }

    @PatchMapping("/me/password")
    public ResponseEntity<SuccessResponse<Void>> changePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {

        Long userId = userDetails.getUser().getUserId();
        userService.changePassword(userId, request);
        return ResponseEntity.ok(SuccessResponse.of("비밀번호가 성공적으로 변경되었습니다."));
    }
}