package com.example.myhealth.controller;

import com.example.myhealth.domain.Post;
import com.example.myhealth.domain.User;
import com.example.myhealth.service.UserService;
import com.example.myhealth.util.JwtUtil;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public static class LoginRequest {
        public String email;
        public String password;
        public String userId;

    }


    // 초기화 생성자

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // 사용자 등록
    @PostMapping
    public User registerUser(@RequestBody User user) {
        return userService.registerUser(user);
    }
    
    // 모든 사용자 조회
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // 이메일로 사용자 조회
    @GetMapping("/{email}")
    public ResponseEntity<User> findByEmail(@PathVariable String email) {
        return userService.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    public static class LoginResponse {
        public String userId;
        public String email;
        public String token;

        public LoginResponse(String userId, String email, String token) {
            this.userId = userId;
            this.email = email;
            this.token = token;
        }
    }


    // 로그인 엔드포인트
    // optional은 .isPresent()로 값이 있는지 확인 
    // 아닐 시 null로 찾기
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> user = userService.login(request.email, request.password, request.userId);
        if (user.isPresent()) {
            String token = JwtUtil.generateToken(user.get().getEmail());
            return ResponseEntity.ok(
                new LoginResponse(
                user.get().getUserId(),
                user.get().getEmail(),
                token
            )
            ); 
        } else {
            return ResponseEntity.status(401).build();
        }
    }
}
