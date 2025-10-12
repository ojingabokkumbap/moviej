package com.example.moviejbackend.controller;

import com.example.moviejbackend.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.Parameter;

@RestController
@RequestMapping("/cloudinary")
public class CloudinaryController {
    @Autowired
    private CloudinaryService cloudinaryService;

@PostMapping(value = "/upload", consumes = "multipart/form-data")
public String upload(
    @Parameter(description = "업로드할 이미지 파일", required = true)
    @RequestParam("file") MultipartFile file
) throws Exception {
    return cloudinaryService.upload(file);
}
}