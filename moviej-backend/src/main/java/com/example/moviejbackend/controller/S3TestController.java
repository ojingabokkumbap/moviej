package com.example.moviejbackend.controller;

import com.example.moviejbackend.service.S3Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.io.IOException;

@RestController
@RequestMapping("/s3")
public class S3TestController {
    private final S3Service s3Service;
    public S3TestController(S3Service s3Service) {
        this.s3Service = s3Service;
    }

    @GetMapping("/test-upload")
    public String testUpload() throws IOException {
        return s3Service.testUpload();
    }
}
