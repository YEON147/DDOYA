package com.ssafy.ddoya.domain.supplement.entity;

import com.ssafy.ddoya.domain.common.entity.IngredientMaster;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 특정 영양제에 포함된 개별 성분 정보를 관리하는 엔티티입니다.
 * 마스터 성분과의 매핑 정보 및 원문 성분명, 함량 등을 저장합니다.
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "user_supplement_ingredient")
public class UserSupplementIngredient {

    @EmbeddedId
    private UserSupplementIngredientId id;

    /**
     * 성분이 포함된 영양제
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userSupplementId")
    @JoinColumn(name = "user_supplement_id", nullable = false)
    private Supplement supplement;

    /**
     * 분석을 통해 매핑된 정규화 성분 마스터 정보
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("normalizedIngredientId")
    @JoinColumn(name = "normalized_ingredient_id", nullable = false)
    private IngredientMaster normalizedIngredient;

    /**
     * 이미지(OCR)에서 추출된 가공되지 않은 원본 성분 이름
     */
    @Column(name = "raw_ingredient_name", nullable = false, length = 200)
    private String rawIngredientName;

    /**
     * 성분 함량의 단위 (mg, ug 등)
     */
    @Column(name = "unit", nullable = false, length = 20)
    private String unit;

    /**
     * 성분 함량
     */
    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    /**
     * 해당 약의 주성분인지 여부
     */
    @Column(name = "is_primary", nullable = false)
    private boolean isPrimary;

    @Builder
    private UserSupplementIngredient(Supplement supplement, IngredientMaster normalizedIngredient,
            String rawIngredientName, String unit,
            BigDecimal amount, boolean isPrimary) {
        this.id = new UserSupplementIngredientId(supplement.getUserSupplementId(),
                normalizedIngredient.getIngredientId());
        this.supplement = supplement;
        this.normalizedIngredient = normalizedIngredient;
        this.rawIngredientName = rawIngredientName;
        this.unit = unit;
        this.amount = amount;
        this.isPrimary = isPrimary;
    }
}
