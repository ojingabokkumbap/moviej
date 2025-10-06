package com.example.moviejbackend.controller;

import com.example.moviejbackend.domain.User;
import com.example.moviejbackend.service.UserService;
import com.example.moviejbackend.util.JwtUtil;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    public static class LoginRequest {
        public String email;
        public String password;
    }

    public static class LoginResponse {
        public String userId;
        public String email;
        public String token;
        public String nickname;

        public LoginResponse(String userId, String email, String token, String nickname) {
            this.userId = userId;
            this.email = email;
            this.token = token;
            this.nickname = nickname;
        }
    }

    @PostMapping("signup")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            User newUser = userService.registerUser(user);
            return ResponseEntity.ok(newUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{email}")
    public ResponseEntity<?> findByEmail(@PathVariable String email) {
        Optional<User> userOpt = userService.findByEmail(email);
        if (userOpt.isPresent()) {
            return ResponseEntity.ok(userOpt.get());
        } else {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> user = userService.login(request.email, request.password);
        if (user.isPresent()) {
            String token = JwtUtil.generateToken(user.get().getEmail());
            return ResponseEntity.ok(
                new LoginResponse(
                    String.valueOf(user.get().getId()),
                    user.get().getEmail(),
                    token,
                    user.get().getNickname()
                )
            ); 
        } else {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }
       
    }

    @GetMapping("/find-email")
    public ResponseEntity<?> findEmail(@RequestParam("nickname") String nickname) {
        Optional<User> user = userService.findByNickname(nickname);
        if (user.isPresent()) {
            return ResponseEntity.ok(Map.of("email", user.get().getEmail()));
        } else {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
    }

    public static class ResetRequest {
        public String email;
    }

    @PostMapping("/password-reset-request")
    public ResponseEntity<?> requestPasswordReset(@RequestBody ResetRequest request) {
        //String email = body.get("email");
        String email = request.email;
        Optional<User> userOpt = userService.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        //String token = userService.createPasswordResetToken(userOpt.get());

        // 🚨 임시 비밀번호 생성 및 발송 로직 호출
        String tempPassword = userService.generateTemporaryPassword(userOpt.get());

        return ResponseEntity.ok(Map.of("message", "Temporary password sent to email."));
    }

    // @PostMapping("/password-reset")
    // public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
    //     String token = body.get("token");
    //     String newPassword = body.get("newPassword");

    //     boolean success = userService.resetPassword(token, newPassword);
    //     if (success) {
    //         return ResponseEntity.ok(Map.of("message", "Password has been reset successfully"));
    //     } else {
    //         return ResponseEntity.status(400).body(Map.of("error", "Invalid or expired token"));
    //     }
    // }

    public static class UpdatePasswordRequest {
        public String email;          // 현재 로그인된 사용자의 이메일 (또는 토큰에서 추출)
        public String currentPassword;  // 현재 비밀번호 (임시 비밀번호 또는 기존 비밀번호)
        public String newPassword;      // 새로 설정할 비밀번호
    }

    @PostMapping("/update-password")
    public ResponseEntity<?> updatePassword(@RequestBody UpdatePasswordRequest request) {
        // 🚨 실제 운영 환경에서는 JWT 토큰에서 이메일을 추출해야 합니다. 
        // 여기서는 간단하게 요청 본문에서 email을 받도록 가정합니다.
        
        try {
            userService.updatePassword(
                request.email, 
                request.currentPassword, 
                request.newPassword
            );
            return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
        } catch (IllegalArgumentException e) {
            // 기존 비밀번호 불일치, 새 비밀번호 형식 오류 등의 예외 처리
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "An unexpected error occurred"));
        }
    }
}
