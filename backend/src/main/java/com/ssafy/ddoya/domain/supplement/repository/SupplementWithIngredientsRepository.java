package com.ssafy.ddoya.domain.supplement.repository;

import com.ssafy.ddoya.domain.supplement.entity.Supplement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplementWithIngredientsRepository extends JpaRepository<Supplement, Long> {

    /**
     * 사용자의 모든 영양제를 성분 정보와 함께 조회합니다. (N+1 방지 목적)
     * ingredients -> normalizedIngredient 까지 한 쿼리로 페치 조인합니다.
     */
    @Query("SELECT DISTINCT s FROM Supplement s " +
           "LEFT JOIN FETCH s.ingredients i " +
           "LEFT JOIN FETCH i.normalizedIngredient " +
           "WHERE s.user.userId = :userId")
    List<Supplement> findAllWithIngredientsByUserId(@Param("userId") Long userId);
}
