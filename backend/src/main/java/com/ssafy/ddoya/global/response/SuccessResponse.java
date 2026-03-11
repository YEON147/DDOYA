package com.ssafy.ddoya.global.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SuccessResponse<T> {

    private String message;
    private T data;

    public static <T> SuccessResponse<T> of(String message, T data) {
        return SuccessResponse.<T>builder()
                .message(message)
                .data(data)
                .build();
    }

    public static <T> SuccessResponse<T> of(T data) {
        return SuccessResponse.<T>builder()
                .message("요청이 성공했습니다.")
                .data(data)
                .build();
    }

    public static SuccessResponse<Void> of(String message) {
        return SuccessResponse.<Void>builder()
                .message(message)
                .build();
    }
}
