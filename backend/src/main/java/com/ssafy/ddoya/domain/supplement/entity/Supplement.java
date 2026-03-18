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

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "supplements")
public class Supplement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_supplement_id")
    private Long userSupplementId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "body_part_id", nullable = false)
    private BodyPart bodyPart;

    @Column(name = "alias", nullable = false, length = 50)
    private String alias;

    @Column(name = "daily_dose", nullable = false)
    private Integer dailyDose;

    @Column(name = "dose_per_intake", nullable = false)
    private Integer dosePerIntake;

    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    @Column(name = "is_reflected", nullable = false)
    private boolean isReflected;

    @Column(name = "pill_image_url", nullable = false, length = 500)
    private String pillImageUrl;

    @Column(name = "reference_embedding_path", length = 500)
    private String referenceEmbeddingPath;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "supplement")
    private List<UserSupplementIngredient> ingredients = new ArrayList<>();

    @Builder
    private Supplement(User user, BodyPart bodyPart, String alias, Integer dailyDose,
            Integer dosePerIntake, Integer capacity, Boolean isReflected,
            String pillImageUrl, String referenceEmbeddingPath) {
        this.user = user;
        this.bodyPart = bodyPart;
        this.alias = alias;
        this.dailyDose = dailyDose;
        this.dosePerIntake = dosePerIntake;
        this.capacity = capacity;
        this.isReflected = isReflected != null ? isReflected : false;
        this.pillImageUrl = pillImageUrl;
        this.referenceEmbeddingPath = referenceEmbeddingPath;
    }
}
