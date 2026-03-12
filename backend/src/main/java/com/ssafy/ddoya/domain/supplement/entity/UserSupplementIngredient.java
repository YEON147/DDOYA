package com.ssafy.ddoya.domain.supplement.entity;

import com.ssafy.ddoya.domain.common.entity.IngredientMaster;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "user_supplement_ingredient")
public class UserSupplementIngredient {

    @EmbeddedId
    private UserSupplementIngredientId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userSupplementId")
    @JoinColumn(name = "user_supplement_id", nullable = false)
    private Supplement supplement;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("ingredientId")
    @JoinColumn(name = "ingredient_id", nullable = false)
    private IngredientMaster ingredient;

    @Column(name = "raw_ingredient_name", nullable = false, length = 200)
    private String rawIngredientName;

    @Column(name = "unit", nullable = false, length = 20)
    private String unit;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "is_primary", nullable = false)
    private boolean isPrimary;

    @Builder
    private UserSupplementIngredient(Supplement supplement, IngredientMaster ingredient,
            String rawIngredientName, String unit,
            BigDecimal amount, boolean isPrimary) {
        this.id = new UserSupplementIngredientId(supplement.getUserSupplementId(), ingredient.getIngredientId());
        this.supplement = supplement;
        this.ingredient = ingredient;
        this.rawIngredientName = rawIngredientName;
        this.unit = unit;
        this.amount = amount;
        this.isPrimary = isPrimary;
    }
}
