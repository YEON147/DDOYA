package com.ssafy.ddoya.domain.supplement.repository;

import com.ssafy.ddoya.domain.supplement.entity.UserSupplementIngredient;
import com.ssafy.ddoya.domain.supplement.entity.UserSupplementIngredientId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * UserSupplementIngredient 엔티티에 대한 데이터 액세스 처리를 담당하는 레포지토리입니다.
 * 특정 영양제의 주성분 조회 및 삭제 기능을 제공합니다.
 */
@Repository
public interface UserSupplementIngredientRepository
              extends JpaRepository<UserSupplementIngredient, UserSupplementIngredientId> {

    /**
     * 여러 영양제에 대해 주성분 정보를 마스터 정보와 함께 일괄 조회합니다.
     * N+1 문제를 방지하기 위해 마스터 정보를 FETCH JOIN 합니다.
     *
     * @param supplementIds 영양제 ID 목록
     * @return 주성분 리스트
     */
    @Query("SELECT u FROM UserSupplementIngredient u JOIN FETCH u.normalizedIngredient " +
                  "WHERE u.supplement.userSupplementId IN :supplementIds AND u.isPrimary = true")
    List<UserSupplementIngredient> findPrimaryIngredientsBySupplementIds(
                  @Param("supplementIds") List<Long> supplementIds);

    /**
     * 특정 영양제에 소속된 모든 성분 정보를 삭제합니다.
     *
     * @param supplementId 삭제할 영양제의 ID
     */
    @Modifying
    @Query("DELETE FROM UserSupplementIngredient u WHERE u.supplement.userSupplementId = :supplementId")
    void deleteBySupplementId(@Param("supplementId") Long supplementId);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM UserSupplementIngredient usi WHERE usi.supplement.userSupplementId = :userSupplementId")
    void deleteByUserSupplementId(@Param("userSupplementId") Long userSupplementId);
}
