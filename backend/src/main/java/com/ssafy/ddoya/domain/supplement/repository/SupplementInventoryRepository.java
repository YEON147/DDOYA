package com.ssafy.ddoya.domain.supplement.repository;

import com.ssafy.ddoya.domain.supplement.entity.SupplementInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;

import java.util.List;
import java.util.Optional;

/**
 * SupplementInventory 엔티티에 대한 데이터 액세스 처리를 담당하는 레포지토리입니다.
 */
public interface SupplementInventoryRepository extends JpaRepository<SupplementInventory, Long> {

    /**
     * 여러 영양제 ID에 해당하는 재고 정보를 일괄 조회합니다.
     * N+1 문제를 방지하기 위해 사용됩니다.
     *
     * @param supplementIds 영양제 ID 목록
     * @return 재고 정보 리스트
     */
    @Query("SELECT i FROM SupplementInventory i WHERE i.supplement.userSupplementId IN :supplementIds")
    List<SupplementInventory> findBySupplementIds(@Param("supplementIds") List<Long> supplementIds);

    /**
     * 영양제 섭취 후 재고를 감소시킬 때, 동시성 문제를 방지하기 위해 
     * 해당하는 영양제들의 재고 정보에 비관적 쓰기 락(Pessimistic Write Lock)을 겁니다.
     * 
     * @param supplementIds 영양제 ID 목록
     * @return 재고 정보 리스트
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM SupplementInventory i WHERE i.supplement.userSupplementId IN :supplementIds")
    List<SupplementInventory> findForUpdateBySupplementIds(@Param("supplementIds") List<Long> supplementIds);

    /**
     * 특정 영양제들의 재고 정보를 일괄 삭제합니다.
     *
     * @param supplementIds 삭제할 영양제의 ID 목록
     */
    @Modifying
    @Query("DELETE FROM SupplementInventory i WHERE i.supplement.userSupplementId IN :supplementIds")
    void deleteBySupplementIds(@Param("supplementIds") List<Long> supplementIds);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM SupplementInventory si WHERE si.supplement.userSupplementId = :userSupplementId")
    void deleteByUserSupplementId(@Param("userSupplementId") Long userSupplementId);

    /**
     * 특정 사용자 소유의 영양제에 대한 재고 정보를 조회합니다.
     *
     * @param userSupplementId 영양제 ID
     * @param userId 사용자 ID
     * @return 조회된 재고 정보를 담은 Optional
     */
    Optional<SupplementInventory> findBySupplement_UserSupplementIdAndSupplement_User_UserId(
            Long userSupplementId, Long userId);
}
