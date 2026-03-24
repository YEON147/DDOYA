package com.ssafy.ddoya.domain.supplement.entity;

import com.ssafy.ddoya.domain.common.entity.BodyPart;
import com.ssafy.ddoya.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 사용자가 등록한 영양제 정보를 나타내는 엔티티입니다.
 * 별칭, 섭취량, 제형 이미지 정보 및 임베딩 경로 등을 관리합니다.
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "supplements")
public class Supplement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_supplement_id")
    private Long userSupplementId;

    /**
     * 영양제를 소유한 사용자
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * 영양제가 작용하는 신체 부위
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "body_part_id", nullable = true)
    private BodyPart bodyPart;

    /**
     * 사용자가 설정한 영양제 이름 (별칭)
     */
    @Column(name = "alias", nullable = false, length = 50)
    private String alias;

    /**
     * 1일 섭취 횟수
     */
    @Column(name = "daily_dose", nullable = false)
    private Integer dailyDose;

    /**
     * 1회 섭취량
     */
    @Column(name = "dose_per_intake", nullable = false)
    private Integer dosePerIntake;

    /**
     * 영양제의 총 용량
     */
    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    /**
     * 리포트에 반영되었는지 여부
     */
    @Column(name = "is_reflected", nullable = false)
    private boolean isReflected;

    /**
     * 알약 원본 이미지의 URL
     */
    @Column(name = "pill_image_url", nullable = false, length = 500)
    private String pillImageUrl;

    /**
     * 알약 이미지의 Embedding 저장 경로
     */
    @Column(name = "pill_reference_embedding_path", length = 500)
    private String pillReferenceEmbeddingPath;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "supplement")
    private List<UserSupplementIngredient> ingredients = new ArrayList<>();

    @Builder
    private Supplement(User user, BodyPart bodyPart, String alias, Integer dailyDose,
            Integer dosePerIntake, Integer capacity, Boolean isReflected,
            String pillImageUrl, String pillReferenceEmbeddingPath) {
        this.user = user;
        this.bodyPart = bodyPart;
        this.alias = alias;
        this.dailyDose = dailyDose;
        this.dosePerIntake = dosePerIntake;
        this.capacity = capacity;
        this.isReflected = isReflected != null ? isReflected : false;
        this.pillImageUrl = pillImageUrl;
        this.pillReferenceEmbeddingPath = pillReferenceEmbeddingPath;
    }

    /**
     * 영양제의 기본 정보를 수정합니다.
     *
     * @param alias         새로운 이름
     * @param dailyDose     새로운 1일 섭취 횟수
     * @param dosePerIntake 새로운 1회 섭취량
     */
    public void updateBasicInfo(String alias, Integer dailyDose, Integer dosePerIntake) {
        this.alias = alias;
        this.dailyDose = dailyDose;
        this.dosePerIntake = dosePerIntake;
    }
}
