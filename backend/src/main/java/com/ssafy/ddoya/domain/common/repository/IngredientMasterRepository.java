package com.ssafy.ddoya.domain.common.repository;

import com.ssafy.ddoya.domain.common.entity.IngredientMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IngredientMasterRepository extends JpaRepository<IngredientMaster, Long> {
    Optional<IngredientMaster> findByNormalizedName(String normalizedName);
}
