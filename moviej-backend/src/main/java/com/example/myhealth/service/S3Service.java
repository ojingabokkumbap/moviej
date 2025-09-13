package com.example.myhealth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;

@Service
public class S3Service {

    private final S3Client s3Client;
    private final String bucket;
    private final String region; // region 필드 추가

    public S3Service(
        @Value("${cloud.aws.credentials.access-key}") String accessKey,
        @Value("${cloud.aws.credentials.secret-key}") String secretKey,
        @Value("${cloud.aws.region.static}") String region,
        @Value("${cloud.aws.s3.bucket}") String bucket
    ) {
        this.bucket = bucket;
        this.region = region; // region 저장
        this.s3Client = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(
                        StaticCredentialsProvider.create(
                                AwsBasicCredentials.create(accessKey, secretKey)
                        )
                )
                .build();
    }

    // 테스트용 S3 업로드 메서드
  public String testUpload() throws IOException {
      String testContent = "Hello S3!";
      String key = "test_" + System.currentTimeMillis() + ".txt";
      s3Client.putObject(
          PutObjectRequest.builder()
              .bucket(bucket)
              .key(key)
              .contentType("text/plain")
              .build(),
          software.amazon.awssdk.core.sync.RequestBody.fromString(testContent)
      );
      // region 필드 사용
      return "https://" + bucket + ".s3." + region + ".amazonaws.com/" + key;
  }
}