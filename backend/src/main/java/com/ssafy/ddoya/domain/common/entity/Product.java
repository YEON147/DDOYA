package com.ssafy.ddoya.domain.common.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "products")
public class Product {

    @Id
    @Column(name = "product_code", length = 30)
    private String productCode;

    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;

    @Column(name = "product_type", nullable = false, length = 100)
    private String productType;

    @Column(name = "manufacturer", length = 200)
    private String manufacturer;

    @Column(name = "serving_size", length = 50)
    private String servingSize;

    @Column(name = "daily_serving", length = 10)
    private String dailyServing;

    @Column(name = "calcium", precision = 10, scale = 2)
    private BigDecimal calcium;

    @Column(name = "iron", precision = 10, scale = 2)
    private BigDecimal iron;

    @Column(name = "vitamin_a", precision = 10, scale = 2)
    private BigDecimal vitaminA;

    @Column(name = "vitamin_c", precision = 10, scale = 2)
    private BigDecimal vitaminC;

    @Column(name = "vitamin_d", precision = 10, scale = 2)
    private BigDecimal vitaminD;

    @Column(name = "thiamin", precision = 10, scale = 2)
    private BigDecimal thiamin;

    @Column(name = "riboflavin", precision = 10, scale = 2)
    private BigDecimal riboflavin;

    @Column(name = "niacin", precision = 10, scale = 2)
    private BigDecimal niacin;

    @Builder
    private Product(String productCode, String productName, String productType, String manufacturer,
            String servingSize, String dailyServing, BigDecimal calcium, BigDecimal iron,
            BigDecimal vitaminA, BigDecimal vitaminC, BigDecimal vitaminD,
            BigDecimal thiamin, BigDecimal riboflavin, BigDecimal niacin) {
        this.productCode = productCode;
        this.productName = productName;
        this.productType = productType;
        this.manufacturer = manufacturer;
        this.servingSize = servingSize;
        this.dailyServing = dailyServing;
        this.calcium = calcium;
        this.iron = iron;
        this.vitaminA = vitaminA;
        this.vitaminC = vitaminC;
        this.vitaminD = vitaminD;
        this.thiamin = thiamin;
        this.riboflavin = riboflavin;
        this.niacin = niacin;
    }
}
