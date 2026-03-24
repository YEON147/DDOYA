package com.ssafy.ddoya.domain.supplement.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 영양제의 재고 정보를 관리하는 엔티티입니다.
 * 현재 남은 수량과 재고 부족 알림 설정 여부를 저장합니다.
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "supplement_inventory")
public class SupplementInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inventory_id")
    private Long inventoryId;

    /**
     * 재고 정보가 연결된 영양제
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_supplement_id", nullable = false)
    private Supplement supplement;

    /**
     * 현재 남은 영양제 수량
     */
    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;

    /**
     * 재고가 부족할 때 알림을 보낼지 여부
     */
    @Column(name = "stock_alert_enabled", nullable = false)
    private boolean stockAlertEnabled;

    @Builder
    private SupplementInventory(Supplement supplement, Integer stockQuantity,
            Boolean stockAlertEnabled) {
        this.supplement = supplement;
        this.stockQuantity = stockQuantity;
        this.stockAlertEnabled = stockAlertEnabled != null ? stockAlertEnabled : true;
    }

    /**
     * 재고 수량 및 알림 설정을 수정합니다.
     *
     * @param stockQuantity 새로운 재고 수량
     * @param stockAlertEnabled 알림 설정 여부
     */
    public void updateInventory(Integer stockQuantity, boolean stockAlertEnabled) {
        this.stockQuantity = stockQuantity;
        this.stockAlertEnabled = stockAlertEnabled;
    }

    /**
     * 재고 알림 설정 여부를 수정합니다.
     *
     * @param enabled 수신 여부
     */
    public void updateStockAlertEnabled(boolean enabled) {
        this.stockAlertEnabled = enabled;
    }

    /**
     * 재고를 주어진 수량만큼 감소시킵니다.
     * 단, 재고가 부족한 경우 음수로 내려가지 않도록 0으로 보정합니다.
     * 
     * @param amount 감소시킬 수량
     * @return 재고가 부족하여 0으로 보정되었는지 여부 (true면 부족하여 보정됨)
     */
    public boolean decreaseWithFloorZero(int amount) {
        if (this.stockQuantity < amount) {
            this.stockQuantity = 0;
            return true;
        } else {
            this.stockQuantity -= amount;
            return false;
        }
    }
}
