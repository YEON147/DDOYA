package com.ssafy.ddoya.domain.supplement.repository;

import com.ssafy.ddoya.domain.supplement.entity.Supplement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SupplementRepository extends JpaRepository<Supplement, Long> {

    boolean existsByUser_UserIdAndAlias(Long userId, String alias);

    @Query("SELECT s FROM Supplement s WHERE s.user.userId = :userId ORDER BY s.createdAt DESC")
    Page<Supplement> findByUserId(@Param("userId") Long userId, Pageable pageable);
}

