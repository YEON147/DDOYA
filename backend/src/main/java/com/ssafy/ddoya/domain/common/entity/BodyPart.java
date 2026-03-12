package com.ssafy.ddoya.domain.common.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "body_part")
public class BodyPart {

    @Id
    @Column(name = "body_part_id")
    private Integer bodyPartId;

    @Column(name = "body_part_name", nullable = false, unique = true, length = 50, updatable = false)
    private String bodyPartName;

    @Builder
    private BodyPart(Integer bodyPartId, String bodyPartName) {
        this.bodyPartId = bodyPartId;
        this.bodyPartName = bodyPartName;
    }
}
