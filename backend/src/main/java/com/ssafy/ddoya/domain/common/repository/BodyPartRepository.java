package com.ssafy.ddoya.domain.common.repository;

import com.ssafy.ddoya.domain.common.entity.BodyPart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BodyPartRepository extends JpaRepository<BodyPart, Byte> {
}
