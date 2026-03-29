package com.ssafy.ddoya.global.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.ddoya.domain.auth.repository.RefreshTokenRepository;
import com.ssafy.ddoya.global.jwt.JwtAuthenticationFilter;
import com.ssafy.ddoya.global.jwt.JwtUtil;
import com.ssafy.ddoya.global.jwt.LoginFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    @Value("${cors.allowed-origins:http://localhost:3000,http://localhost:5173,http://localhost:8081}")
    private List<String> allowedOrigins;

    // AuthenticationManager가 인자로 받을 AuthenticationConfiguration 객체 생성자 주입
    private final AuthenticationConfiguration authenticationConfiguration;
    private final JwtUtil jwtUtil;
    private final RefreshTokenRepository refreshTokenRepository;
    private final ObjectMapper objectMapper;

    // AuthenticationManager Bean 등록
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration)
            throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        LoginFilter loginFilter = new LoginFilter(authenticationManager(authenticationConfiguration), jwtUtil,
                refreshTokenRepository, objectMapper);
        loginFilter.setFilterProcessesUrl("/api/auth/login");

        // CSRF disable
        http.csrf((auth) -> auth.disable());

        // CORS 설정 추가
        http.cors((cors) -> cors.configurationSource(corsConfigurationSource()));

        // Form 로그인 방식 disable
        http.formLogin((auth) -> auth.disable());

        // HTTP Basic 인증 방식 disable
        http.httpBasic((auth) -> auth.disable());

        // 경로별 인가 작업
        http.authorizeHttpRequests((auth) -> auth
                .requestMatchers("/api/auth/login", "/api/auth/signup", "/api/auth/refresh", "/api/auth/check-email", "/actuator/health")
                .permitAll()
                .requestMatchers("/api/auth/logout").authenticated()
                .anyRequest().authenticated());

        // JWT 필터 추가 (LoginFilter 앞에)
        http.addFilterBefore(new JwtAuthenticationFilter(jwtUtil), LoginFilter.class);

        // 필터 추가
        http.addFilterAt(loginFilter, UsernamePasswordAuthenticationFilter.class);

        // 세션 설정: STATELESS
        http.sessionManagement((session) -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 허용할 출처 (프론트엔드 도메인)
        configuration.setAllowedOrigins(allowedOrigins);

        // 허용할 HTTP 메서드
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // 브라우저가 접근할 수 있는 헤더
        configuration.setAllowedHeaders(List.of("*"));

        // 프론트엔드에서 응답 헤더의 Authorization 토큰 등을 읽을 수 있도록 허용
        configuration.setExposedHeaders(List.of("Authorization"));

        // 쿠키, 인증 정보 등 전송 허용
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // 모든 API 경로에 대해 위의 설정 적용
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
