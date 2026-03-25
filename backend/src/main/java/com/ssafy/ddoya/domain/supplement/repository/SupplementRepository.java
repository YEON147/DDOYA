package com.ssafy.ddoya.domain.supplement.repository;

import com.ssafy.ddoya.domain.supplement.entity.Supplement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Supplement 엔티티에 대한 데이터 액세스 처리를 담당하는 레포지토리입니다.
 * 사용자의 영양제 목록 조회, 중복 확인, 소유권 기반 조회를 수행합니다.
 */
@Repository
public interface SupplementRepository extends JpaRepository<Supplement, Long> {

    /**
     * 특정 사용자가 동일한 별칭(이름)으로 이미 영양제를 등록했는지 확인합니다.
     *
     * @param userId 사용자 ID
     * @param alias 영양제 별칭
     * @return 존재 여부
     */
    boolean existsByUser_UserIdAndAlias(Long userId, String alias);

    /**
     * 특정 사용자가 등록한 영양제 목록을 최신순으로 페이징 조회합니다.
     *
     * @param userId 사용자 ID
     * @param pageable 페이징 정보
     * @return 페이징된 영양제 목록
     */
    @Query("SELECT s FROM Supplement s LEFT JOIN FETCH s.bodyPart WHERE s.user.userId = :userId ORDER BY s.createdAt DESC")
    Page<Supplement> findByUserId(@Param("userId") Long userId, Pageable pageable);

    /**
     * 특정 영양제ID를 가진 영양제를 조회하되, 해당 사용자의 소유인지 함께 검증합니다.
     * N+1 방지를 위해 BodyPart를 페치 조인합니다.
     *
     * @param supplementId 영양제 ID
     * @param userId 사용자 ID
     * @return 조회된 영양제 정보를 담은 Optional
     */
    @Query("SELECT s FROM Supplement s LEFT JOIN FETCH s.bodyPart WHERE s.userSupplementId = :supplementId AND s.user.userId = :userId")
    Optional<Supplement> findByIdAndUserId(
            @Param("supplementId") Long supplementId,
            @Param("userId") Long userId);
}

