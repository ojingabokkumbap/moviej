package com.example.moviejbackend.application;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.example.moviejbackend")
@EntityScan("com.example.moviejbackend.domain")
@EnableJpaRepositories("com.example.moviejbackend.repository")
public class MoviejBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(MoviejBackendApplication.class, args);
    }

}
