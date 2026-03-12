package com.ssafy.ddoya.domain.supplement.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "supplement_inventory")
public class SupplementInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inventory_id")
    private Long inventoryId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_supplement_id", nullable = false)
    private Supplement supplement;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;

    @Column(name = "stock_alert_enabled", nullable = false)
    private boolean stockAlertEnabled;

    @Builder
    private SupplementInventory(Supplement supplement, Integer stockQuantity,
            Boolean stockAlertEnabled) {
        this.supplement = supplement;
        this.stockQuantity = stockQuantity;
        this.stockAlertEnabled = stockAlertEnabled != null ? stockAlertEnabled : true;
    }
}
