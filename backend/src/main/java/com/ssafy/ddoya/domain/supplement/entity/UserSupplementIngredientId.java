package com.ssafy.ddoya.domain.supplement.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

/**
 * UserSupplementIngredient 엔티티의 복합키를 정의하는 클래스입니다.
 * 영양제 ID와 정규화된 성분 ID의 조합으로 구성됩니다.
 */
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
