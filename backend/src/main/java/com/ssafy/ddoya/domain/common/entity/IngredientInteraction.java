package com.ssafy.ddoya.domain.common.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "ingredient_interaction", uniqueConstraints = {
        @UniqueConstraint(name = "uk_ingredient_interaction_a_b", columnNames = { "ingredient_a", "ingredient_b" })
})
public class IngredientInteraction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "interaction_id")
    private Long interactionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_a", nullable = false)
    private IngredientMaster ingredientA;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_b", nullable = false)
    private IngredientMaster ingredientB;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private InteractionType type;

    @Column(name = "min_interval_hours")
    private Integer minIntervalHours;

    @Column(name = "note", length = 200)
    private String note;

    @Builder
    private IngredientInteraction(IngredientMaster ingredientA, IngredientMaster ingredientB,
            InteractionType type, Integer minIntervalHours, String note) {
        this.ingredientA = ingredientA;
        this.ingredientB = ingredientB;
        this.type = type;
        this.minIntervalHours = minIntervalHours;
        this.note = note;
    }
}
