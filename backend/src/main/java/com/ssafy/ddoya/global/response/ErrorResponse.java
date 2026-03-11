package com.ssafy.ddoya.global.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    private String message;
    private int status;

    public static ErrorResponse of(HttpStatus httpStatus, String message) {
        return ErrorResponse.builder()
                .message(message)
                .status(httpStatus.value())
                .build();
    }

    public static ErrorResponse of(HttpStatus httpStatus) {
        return ErrorResponse.builder()
                .message(httpStatus.getReasonPhrase())
                .status(httpStatus.value())
                .build();
    }
}
