package com.ssafy.ddoya.global.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.ddoya.domain.auth.dto.CustomUserDetails;
import com.ssafy.ddoya.domain.user.entity.User;
import com.ssafy.ddoya.global.response.ErrorResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter { // OncePerRequestFilter : 요청마다 한 번만 실행

    // JWT 생성 / 검증 / 정보 추출을 담당
    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String authorization = request.getHeader("Authorization");

        // Authorization 헤더가 없거나 "Bearer " 로 시작하지 않으면 다음 필터로 넘김
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authorization.substring(7);

        try {
            // 토큰 만료 여부 확인
            if (jwtUtil.isExpired(token)) {
                sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "만료된 JWT 토큰입니다.");
                return;
            }

            // 토큰 카테고리 확인 (액세스 토큰이 아니면 인증 상태 세팅 X)
            String category = jwtUtil.getCategory(token);
            if (!"access".equals(category)) {
                filterChain.doFilter(request, response);
                return;
            }

            Long userId = jwtUtil.getUserId(token);
            String email = jwtUtil.getEmail(token);

            // 임시 User 객체 생성
            User user = User.builder()
                    .userId(userId)
                    .email(email)
                    .password("temppassword")   // 임시 값 (JWT에는 비밀번호가 없음)
                    .build();
            // User 엔티티를 UserDetails 객체로 변환
            CustomUserDetails customUserDetails = new CustomUserDetails(user);

            // 인증 객체 생성
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    customUserDetails,      // 로그인 사용자 정보
                    null,
                    customUserDetails.getAuthorities());

            // SecurityContext에 인증 정보 저장
            SecurityContextHolder.getContext().setAuthentication(authToken);

        } catch (Exception e) {
            // 토큰이 잘못된 경우 인증 정보 제거
            SecurityContextHolder.clearContext();
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "유효하지 않은 JWT 토큰입니다.");
            return;
        }

        // 다음 필터로 요청 전달
        filterChain.doFilter(request, response);
    }
    
    private void sendErrorResponse(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType("application/json;charset=UTF-8");
        
        ErrorResponse errorResponse = ErrorResponse.of(status, message);
        ObjectMapper objectMapper = new ObjectMapper();
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}
