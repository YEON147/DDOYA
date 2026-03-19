package com.ssafy.ddoya.domain.supplement.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@EqualsAndHashCode
public class UserSupplementIngredientId implements Serializable {

    @Column(name = "user_supplement_id")
    private Long userSupplementId;

    @Column(name = "normalized_ingredient_id")
    private Long normalizedIngredientId;
}
