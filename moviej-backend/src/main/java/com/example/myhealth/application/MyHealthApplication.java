package com.example.myhealth.application;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.example.myhealth")
@EntityScan("com.example.myhealth.domain")
@EnableJpaRepositories("com.example.myhealth.repository")
public class MyHealthApplication {

	public static void main(String[] args) {
		SpringApplication.run(MyHealthApplication.class, args);
	}

}
