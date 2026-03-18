package com.ssafy.ddoya.global.jwt;

import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Date;

// JWT 토큰을 검증하고 정보를 꺼냄
@Component
public class JwtUtil {
    private SecretKey secretKey;

    // secretKey 생성
    public JwtUtil(@Value("${spring.jwt.secret}")String secret) {
        // 문자열 secret을 바이트 배열로 변환 후 SecretKey 객체 생성
        secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8),
                Jwts.SIG.HS256.key().build().getAlgorithm());
    }

    // userId 추출
    public Long getUserId(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("userId", Long.class);
    }

    // category 추출
    public String getCategory(String token) {
        return Jwts.parser().verifyWith(secretKey).build()
                .parseSignedClaims(token).getPayload().get("category", String.class);
    }

    // email 추출
    public String getEmail(String token) {
        return Jwts.parser().verifyWith(secretKey).build()
                .parseSignedClaims(token).getPayload().get("email", String.class);
    }

    // 토큰 만료 여부 확인
    public Boolean isExpired(String token) {
        return Jwts.parser().verifyWith(secretKey).build()
                .parseSignedClaims(token).getPayload().getExpiration().before(new Date());
    }

    // JWT 생성 (category: access / refresh)
    public String createJwt(String category, Long userId, String email, Long expiredMs) {
        return Jwts.builder()
                .claim("category", category)
                .claim("userId", userId)
                .claim("email", email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiredMs))
                .signWith(secretKey)
                .compact();
    }
}
