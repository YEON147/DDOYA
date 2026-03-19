package com.ssafy.ddoya.domain.supplement.repository;

import com.ssafy.ddoya.domain.supplement.entity.UserSupplementIngredient;
import com.ssafy.ddoya.domain.supplement.entity.UserSupplementIngredientId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserSupplementIngredientRepository extends JpaRepository<UserSupplementIngredient, UserSupplementIngredientId> {

    // 영양제 ID 목록에 속하는 주성분(is_primary=true)만 조회
    @Query("SELECT u FROM UserSupplementIngredient u JOIN FETCH u.normalizedIngredient " +
           "WHERE u.supplement.userSupplementId IN :supplementIds AND u.isPrimary = true")
    List<UserSupplementIngredient> findPrimaryIngredientsBySupplementIds(
            @Param("supplementIds") List<Long> supplementIds);
}
