package com.ssafy.ddoya.domain.common.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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

    @Column(name = "normalized_name", nullable = false, unique = true, length = 50)
    private String normalizedName;

    @Column(name = "ul_adult_m", precision = 10, scale = 2)
    private BigDecimal ulAdultM;

    @Column(name = "ul_adult_f", precision = 10, scale = 2)
    private BigDecimal ulAdultF;

    @Column(name = "ul_non_adult", precision = 10, scale = 2)
    private BigDecimal ulNonAdult;

    @Column(name = "ul_pregnant", precision = 10, scale = 2)
    private BigDecimal ulPregnant;

    @Column(name = "ul_unit", length = 10)
    private String ulUnit;

    @Enumerated(EnumType.STRING)
    @Column(name = "solubility")
    private SolubilityType solubility;

    @Column(name = "gi_irritant")
    private Boolean giIrritant;

    @Enumerated(EnumType.STRING)
    @Column(name = "effect")
    private EffectType effect;

    @Column(name = "absorption_note", length = 200)
    private String absorptionNote;

    @Column(name = "synonyms", columnDefinition = "JSON")
    private String synonyms;

    @Builder
    private IngredientMaster(String normalizedName, BigDecimal ulAdultM, BigDecimal ulAdultF,
            BigDecimal ulNonAdult, BigDecimal ulPregnant, String ulUnit,
            SolubilityType solubility, Boolean giIrritant, EffectType effect,
            String absorptionNote, String synonyms) {
        this.normalizedName = normalizedName;
        this.ulAdultM = ulAdultM;
        this.ulAdultF = ulAdultF;
        this.ulNonAdult = ulNonAdult;
        this.ulPregnant = ulPregnant;
        this.ulUnit = ulUnit;
        this.solubility = solubility;
        this.giIrritant = giIrritant;
        this.effect = effect;
        this.absorptionNote = absorptionNote;
        this.synonyms = synonyms;
    }
}
