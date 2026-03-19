package com.ssafy.ddoya.domain.supplement.repository;

import com.ssafy.ddoya.domain.supplement.entity.SupplementInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SupplementInventoryRepository extends JpaRepository<SupplementInventory, Long> {

    // 영양제 재고 일괄 조회 (N+1 방지)
    @Query("SELECT i FROM SupplementInventory i WHERE i.supplement.userSupplementId IN :supplementIds")
    List<SupplementInventory> findBySupplementIds(@Param("supplementIds") List<Long> supplementIds);
}
