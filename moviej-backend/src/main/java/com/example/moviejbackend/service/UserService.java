package com.example.moviejbackend.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.beans.factory.annotation.Value;

import com.example.moviejbackend.domain.User;
import com.example.moviejbackend.repository.UserRepository;

import jakarta.mail.internet.MimeMessage;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private Cloudinary cloudinary;

    @Value("${app.frontend.url}") 
    private String frontendBaseUrl;

    @Autowired
    private JavaMailSender mailSender;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private final Map<String, PasswordResetToken> tokenStore = new HashMap<>();

    public User registerUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }
        if (userRepository.findByNickname(user.getNickname()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 닉네임입니다.");
        }
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> findByNickname(String nickname) {
        return userRepository.findByNickname(nickname);
    }

    public Optional<User> login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return userOpt;
        }
        return Optional.empty();
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public String createPasswordResetToken(User user) {
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(
                user.getEmail(),
                token,
                LocalDateTime.now().plusMinutes(30)
        );
        tokenStore.put(token, resetToken);
        sendPasswordResetEmail(user.getEmail(), token);
        return token;
    }

    public boolean resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenStore.get(token);
        if (resetToken == null || resetToken.getExpiry().isBefore(LocalDateTime.now())) {
            return false;
        }

        Optional<User> userOpt = userRepository.findByEmail(resetToken.getEmail());
        if (userOpt.isEmpty()) return false;

        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        tokenStore.remove(token);
        return true;
    }

    // UserService.java 또는 관련 클래스
    private void sendPasswordResetEmail(String email, String token) {
        String resetUrl = frontendBaseUrl + "/users/reset-password?token=" + token;
        
        // HTML 이메일 전송은 예외 처리가 필수입니다.
        try {
            // 1. MimeMessage 객체 생성 (HTML을 보내기 위해 이미 생성하셨습니다.)
            MimeMessage mimeMessage = mailSender.createMimeMessage();

            // 2. MimeMessageHelper를 사용하여 메일 설정
            // 'true'는 HTML 콘텐츠를 허용한다는 의미
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

            // 3. HTML 콘텐츠 생성: <a> 태그를 사용하여 클릭 가능한 링크를 만듭니다.
            String htmlContent = "<html>"
                            + "<body>"
                            + "<h3>비밀번호 재설정 요청</h3>"
                            + "<p>아래 링크를 클릭하여 비밀번호를 재설정해 주세요:</p>"
                            // 🚨 클릭 가능한 하이퍼링크
                            + "<p><a href=\"" + resetUrl + "\" style=\"display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;\">"
                            + "비밀번호 재설정하기"
                            + "</a></p>"
                            + "<p style='margin-top: 20px; color: #888; font-size: 0.9em;'>링크가 작동하지 않는다면, 아래 주소를 복사하여 브라우저에 붙여넣어 주세요:<br>" + resetUrl + "</p>"
                            + "</body>"
                            + "</html>";

            // 4. MimeMessageHelper에 메일 정보 설정
            helper.setTo(email);
            helper.setSubject("비밀번호 재설정 요청");
            // 5. 'true'를 설정하여 본문이 HTML임을 명시합니다.
            helper.setText(htmlContent, true); 

            // 6. MimeMessage 전송 (SimpleMailMessage 대신 mimeMessage 전송)
            mailSender.send(mimeMessage);

        } catch (jakarta.mail.MessagingException e) {
            // 전송 실패 시 적절한 예외 처리 (예: 런타임 예외로 던지기)
            throw new RuntimeException("비밀번호 재설정 이메일 전송 중 오류 발생: " + e.getMessage(), e);
        }
    }

    private static class PasswordResetToken {
        private final String email;
        private final String token;
        private final LocalDateTime expiry;

        public PasswordResetToken(String email, String token, LocalDateTime expiry) {
            this.email = email;
            this.token = token;
            this.expiry = expiry;
        }

        public String getEmail() { return email; }
        public String getToken() { return token; }
        public LocalDateTime getExpiry() { return expiry; }
    }

    // =====================================================================
    // 임시 비밀번호 생성 및 업데이트 로직 추가
    // =====================================================================
    public String generateTemporaryPassword(User user) {
        // 1. 10자리 임시 비밀번호 생성 (간단하게 UUID 기반으로 만듭니다)
        String tempPassword = UUID.randomUUID().toString().substring(0, 10);
        
        // 2. 사용자 비밀번호를 임시 비밀번호로 업데이트하고 DB에 저장
        user.setPassword(passwordEncoder.encode(tempPassword));
        userRepository.save(user);

        // 3. 임시 비밀번호를 이메일로 발송
        sendTemporaryPasswordEmail(user.getEmail(), tempPassword);
        
        return tempPassword; // 컨트롤러에서는 사용하지 않지만 로직상 반환
    }

    // =====================================================================
    // 이메일 전송 로직 수정 (임시 비밀번호를 보내도록)
    // =====================================================================
    private void sendTemporaryPasswordEmail(String email, String tempPassword) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
            
            // 🚨 이메일 내용 수정: 임시 비밀번호를 본문에 포함
            String htmlContent = "<html>"
                            + "<body>"
                            + "<h3>임시 비밀번호 발급 안내</h3>"
                            + "<p>요청하신 계정의 임시 비밀번호가 발급되었습니다.</p>"
                            + "<p style='font-size: 1.2em; font-weight: bold; color: #dc3545;'>임시 비밀번호: " + tempPassword + "</p>"
                            + "<p>로그인 후 즉시 비밀번호를 변경해 주세요.</p>"
                            + "<p style='margin-top: 20px; color: #888; font-size: 0.9em;'>"
                            + "보안을 위해 임시 비밀번호는 즉시 변경하는 것을 권장합니다."
                            + "</p>"
                            + "</body>"
                            + "</html>";

            helper.setTo(email);
            helper.setSubject("임시 비밀번호 발급 안내");
            helper.setText(htmlContent, true); 

            mailSender.send(mimeMessage);

        } catch (jakarta.mail.MessagingException e) {
            throw new RuntimeException("임시 비밀번호 이메일 전송 중 오류 발생: " + e.getMessage(), e);
        }
    }

    /**
     * 사용자 비밀번호를 업데이트합니다.
     * @param email 사용자 이메일
     * @param currentPassword 현재 비밀번호 (검증용)
     * @param newPassword 새로 설정할 비밀번호
     */
    public void updatePassword(String email, String currentPassword, String newPassword) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found.");
        }
        
        User user = userOpt.get();
        
        // 1. 현재 비밀번호가 일치하는지 확인
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }
        

        // 3. 새 비밀번호 암호화 및 DB 업데이트
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public String updateProfileImage(String email, MultipartFile file) throws IOException {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");

        // Cloudinary에 이미지 업로드
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
        String imageUrl = uploadResult.get("secure_url").toString();

        // 유저 프로필 이미지 업데이트
        User user = userOpt.get();
        user.setProfileImage(imageUrl);
        userRepository.save(user);

        return imageUrl;
    }   
}
