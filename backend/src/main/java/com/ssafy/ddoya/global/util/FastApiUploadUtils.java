package com.ssafy.ddoya.global.util;

import com.ssafy.ddoya.global.exception.CustomException;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public class FastApiUploadUtils {

    /**
     * MultipartFile을 RestTemplate으로 전송 시 필수인 파일명이 포함된 Resource 객체로 변환합니다.
     * FastAPI 서버는 "file" 키와 함께 온전한 파일 Resource를 요구합니다.
     */
    public static ByteArrayResource convertToResource(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "빈 파일이 포함되어 있습니다.");
        }

        try {
            return new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload.jpg";
                }
            };
        } catch (IOException e) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "이미지 파일 읽기 실패");
        }
    }
}
