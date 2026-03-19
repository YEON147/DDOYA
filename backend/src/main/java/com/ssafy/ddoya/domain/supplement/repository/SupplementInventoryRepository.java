package com.ssafy.ddoya.domain.supplement.repository;

import com.ssafy.ddoya.domain.supplement.entity.SupplementInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

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
     * 특정 영양제들의 재고 정보를 일괄 삭제합니다.
     *
     * @param supplementIds 삭제할 영양제의 ID 목록
     */
    @Modifying
    @Query("DELETE FROM SupplementInventory i WHERE i.supplement.userSupplementId IN :supplementIds")
    void deleteBySupplementIds(@Param("supplementIds") List<Long> supplementIds);
}
