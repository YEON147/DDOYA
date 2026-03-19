package com.ssafy.ddoya.global.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
@AllArgsConstructor
public class PageResponse<T> {
    private int currentPage;        // 현재 페이지 수
    private int totalPages;         // 전체 페이지 수
    private Long totalItems;        // 전체 데이터 수
    private List<T> items;          // 페이지에 포함될 실제 데이터

    public static <T> PageResponse<T> fromPage(Page<T> page) {
        return new PageResponse<>(
                page.getNumber(),
                page.getTotalPages(),
                page.getTotalElements(),
                page.getContent()
        );
    }
}
