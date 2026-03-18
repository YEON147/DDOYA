package com.ssafy.ddoya.global.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.ddoya.domain.auth.dto.CustomUserDetails;
import com.ssafy.ddoya.domain.auth.dto.LoginRequestDto;
import com.ssafy.ddoya.domain.auth.dto.LoginResponseDto;
import com.ssafy.ddoya.domain.auth.entity.RefreshToken;
import com.ssafy.ddoya.domain.auth.repository.RefreshTokenRepository;
import com.ssafy.ddoya.global.response.ErrorResponse;
import com.ssafy.ddoya.global.response.SuccessResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;
import java.time.LocalDateTime;

// UsernamePasswordAuthenticationFilter : Spring Security에서 기본 로그인 처리를 담당하는 필터
@RequiredArgsConstructor
public class LoginFilter extends UsernamePasswordAuthenticationFilter {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final RefreshTokenRepository refreshTokenRepository;
    private final ObjectMapper objectMapper;

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
            throws AuthenticationException {

        try {
            // 로그인 요청 JSON을 LoginRequestDto로 변환
            LoginRequestDto loginRequest = objectMapper.readValue(request.getInputStream(), LoginRequestDto.class);

            // 이메일과 비밀번호 추출
            String email = loginRequest.getEmail();
            String password = loginRequest.getPassword();

            // Spring Security 인증 객체 생성
            // principal = email, credentials = password
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(email, password);

            // AuthenticationManager에게 인증 요청 (UserDetailsService.loadUserByUsername()가 호출됨)
            return authenticationManager.authenticate(authToken);

        } catch (IOException e) {
            throw new RuntimeException("로그인 요청 파싱 실패");
        }
    }

    // 인증 성공 시 실행
    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response,
            FilterChain chain, Authentication authentication) throws IOException {

        // authentication.getPrincipal() → 로그인한 사용자 정보
        CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();

        // JWT에 넣을 사용자 정보 추출
        Long userId = customUserDetails.getUser().getUserId();
        String email = customUserDetails.getUsername();

        // accessToken, refreshToken 토큰 생성
        String accessToken = jwtUtil.createJwt("access", userId, email, 30 * 60 * 1000L); // 30분
        String refreshToken = jwtUtil.createJwt("refresh", userId, email, 14 * 24 * 60 * 60 * 1000L); // 14일

        // 기존 리프레시 토큰이 있다면 삭제 후 새로 저장
        refreshTokenRepository.deleteByUserId(userId);

        // 데이터베이스에 RefreshToken 저장
        RefreshToken tokenEntity = RefreshToken.builder()
                .userId(userId)
                .token(refreshToken)
                .expiresAt(LocalDateTime.now().plusDays(14)) // 14일
                .build();
        refreshTokenRepository.save(tokenEntity);

        // 응답 데이터 생성
        LoginResponseDto loginResponse = LoginResponseDto.builder()
                .userId(userId)
                .email(email)
                .nickname(customUserDetails.getUser().getNickname())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();

        SuccessResponse<LoginResponseDto> successResponse = SuccessResponse.of("로그인에 성공했습니다.", loginResponse);

        // 클라이언트에게 JSON 응답 반환
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(successResponse));
    }

    // 인증 실패 시 실행
    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException failed) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");

        ErrorResponse errorResponse = ErrorResponse.of(HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다.");

        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}
