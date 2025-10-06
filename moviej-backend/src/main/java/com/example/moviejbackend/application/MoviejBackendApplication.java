package com.example.moviejbackend.application;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication(scanBasePackages = "com.example.moviejbackend")
@EntityScan("com.example.moviejbackend.domain")
@EnableJpaRepositories("com.example.moviejbackend.repository")
public class MoviejBackendApplication {

    public static void main(String[] args) {

        Dotenv dotenv = Dotenv.load();
        
        System.setProperty("GMAIL_USERNAME", dotenv.get("GMAIL_USERNAME"));
        System.setProperty("GMAIL_APP_PASSWORD", dotenv.get("GMAIL_APP_PASSWORD"));
        
        SpringApplication.run(MoviejBackendApplication.class, args);
    }

}
