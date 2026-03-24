package com.ssafy.ddoya.domain.common.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "ingredient_master")
public class IngredientMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ingredient_id")
    private Long ingredientId;

    @Column(name = "normalized_name", nullable = false, unique = true, length = 100)
    private String normalizedName;

    @Column(name = "ul_adult_m", precision = 10, scale = 2)
    private BigDecimal ulAdultM;

    @Column(name = "ul_adult_f", precision = 10, scale = 2)
    private BigDecimal ulAdultF;

    @Column(name = "ul_non_adult", precision = 10, scale = 2)
    private BigDecimal ulNonAdult;

    @Column(name = "ul_pregnant", precision = 10, scale = 2)
    private BigDecimal ulPregnant;

    @Column(name = "unit", length = 20)
    private String unit;

    @Enumerated(EnumType.STRING)
    @Column(name = "solubility")
    private SolubilityType solubility;

    @Column(name = "gi_irritant")
    private Boolean giIrritant;

    @Enumerated(EnumType.STRING)
    @Column(name = "effect")
    private EffectType effect;

    @Column(name = "absorption_note", length = 500)
    private String absorptionNote;

    @Column(name = "synonyms", columnDefinition = "JSON")
    private String synonyms;

    @Column(name = "ri_adult_m", precision = 10, scale = 0)
    private BigDecimal riAdultM;

    @Column(name = "ri_adult_f", precision = 10, scale = 0)
    private BigDecimal riAdultF;

    @Column(name = "ri_non_adult", precision = 10, scale = 0)
    private BigDecimal riNonAdult;

    @Column(name = "ri_pregnant", precision = 10, scale = 0)
    private BigDecimal riPregnant;

    // 🔹 부모 영양소 (계층 구조)
    @Column(name = "parent_id")
    private Long parentId;

    @Builder
    private IngredientMaster(
            String normalizedName,
            BigDecimal ulAdultM,
            BigDecimal ulAdultF,
            BigDecimal ulNonAdult,
            BigDecimal ulPregnant,
            String unit,
            SolubilityType solubility,
            Boolean giIrritant,
            EffectType effect,
            String absorptionNote,
            String synonyms,
            BigDecimal riAdultM,
            BigDecimal riAdultF,
            BigDecimal riNonAdult,
            BigDecimal riPregnant,
            Long parentId
    ) {
        this.normalizedName = normalizedName;
        this.ulAdultM = ulAdultM;
        this.ulAdultF = ulAdultF;
        this.ulNonAdult = ulNonAdult;
        this.ulPregnant = ulPregnant;
        this.unit = unit;
        this.solubility = solubility;
        this.giIrritant = giIrritant;
        this.effect = effect;
        this.absorptionNote = absorptionNote;
        this.synonyms = synonyms;
        this.riAdultM = riAdultM;
        this.riAdultF = riAdultF;
        this.riNonAdult = riNonAdult;
        this.riPregnant = riPregnant;
        this.parentId = parentId;
    }
}