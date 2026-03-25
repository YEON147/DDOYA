package com.ssafy.ddoya.domain.common.repository;

import com.ssafy.ddoya.domain.common.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
}
