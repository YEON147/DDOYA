package com.ssafy.ddoya.domain.auth.repository;

import com.ssafy.ddoya.domain.auth.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    
    @Transactional
    void deleteByUserId(Long userId);
}
