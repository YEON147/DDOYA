package com.ssafy.ddoya.domain.intake.entity;

import com.ssafy.ddoya.global.exception.CustomException;

/**
 * 섭취 상태를 나타내는 Enum 클래스입니다.
 */
public enum IntakeStatus {
    /** 섭취 완료 */
    TAKEN,
    /** 미섭취 */
    MISSED,
    /** 건너뛰기 */
    SKIPPED;

    /**
     * 상태 변경 가능 여부를 검증합니다.
     * TAKEN으로 변경하는 것은 불가하며, 동일 상태로의 변경도 제한합니다.
     *
     * @param to 변경하려는 목표 상태
     */
    public void validateTransition(IntakeStatus to) {
        if (this == to) {
            throw CustomException.badRequest("이미 같은 상태(" + to.name() + ")입니다.");
        }
        if (to == TAKEN) {
            throw CustomException.badRequest("섭취인증없이 TAKEN 상태로 변경할 수 없습니다.");
        }
    }
}
