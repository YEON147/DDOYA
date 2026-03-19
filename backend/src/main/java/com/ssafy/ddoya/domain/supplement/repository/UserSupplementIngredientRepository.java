package com.ssafy.ddoya.domain.supplement.repository;

import com.ssafy.ddoya.domain.supplement.entity.UserSupplementIngredient;
import com.ssafy.ddoya.domain.supplement.entity.UserSupplementIngredientId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserSupplementIngredientRepository
              extends JpaRepository<UserSupplementIngredient, UserSupplementIngredientId> {

       // 영양제 주성분(is_primary=true) 조회
       @Query("SELECT u FROM UserSupplementIngredient u JOIN FETCH u.normalizedIngredient " +
                     "WHERE u.supplement.userSupplementId IN :supplementIds AND u.isPrimary = true")
       List<UserSupplementIngredient> findPrimaryIngredientsBySupplementIds(
                     @Param("supplementIds") List<Long> supplementIds);

       // 영양제 삭제 시 연관 성분 일괄 삭제
       @Modifying
       @Query("DELETE FROM UserSupplementIngredient u WHERE u.supplement.userSupplementId = :supplementId")
       void deleteBySupplementId(@Param("supplementId") Long supplementId);
}
