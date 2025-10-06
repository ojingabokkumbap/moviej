package com.example.moviejbackend.config; // 적절한 패키지 사용

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class EnvironmentChecker implements CommandLineRunner {

    @Value("${GMAIL_USERNAME}")
    private String gmailUsername;

    @Value("${GMAIL_APP_PASSWORD}")
    private String gmailAppPassword; 

    @Override
    public void run(String... args) throws Exception {
        // 서버 시작 시 이 코드가 딱 한 번 실행됩니다.
        System.out.println("==================================================");
        System.out.println("✅ GMAIL_USERNAME 로드 확인: " + gmailUsername);
        
        // 비밀번호가 '로드'되었는지 확인합니다. (값이 비어있지 않다면 성공)
        if (gmailAppPassword != null && gmailAppPassword.length() > 0) {
            // 비밀번호가 로드되었다는 메시지와 함께, 첫 4자리와 길이를 출력합니다.
            System.out.println("✅ GMAIL_APP_PASSWORD 로드 성공 (첫 4자리: " + gmailAppPassword.substring(0, 4) + ", 길이: " + gmailAppPassword.length() + ")");
        } else {
            System.out.println("❌ GMAIL_APP_PASSWORD 로드 실패: 값이 비어있습니다.");
        }
        
        System.out.println("==================================================");
    }
}