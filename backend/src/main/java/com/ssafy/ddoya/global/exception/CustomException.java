package com.ssafy.ddoya.global.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class CustomException extends RuntimeException {

    private final HttpStatus status;

    public CustomException(HttpStatus status, String message) {
        super(message); // RuntimeException의 message 필드
        this.status = status;
    }

    public static CustomException notFound(String message) {
        return new CustomException(HttpStatus.NOT_FOUND, message);
    }

    public static CustomException badRequest(String message) {
        return new CustomException(HttpStatus.BAD_REQUEST, message);
    }

    public static CustomException conflict(String message) {
        return new CustomException(HttpStatus.CONFLICT, message);
    }

    public static CustomException forbidden(String message) {
        return new CustomException(HttpStatus.FORBIDDEN, message);
    }

    public static CustomException unauthorized(String message) {
        return new CustomException(HttpStatus.UNAUTHORIZED, message);
    }
}
