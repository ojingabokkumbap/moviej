package com.example.moviejbackend.controller;

import com.example.moviejbackend.domain.Post;
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

    public static class LoginRequest {
        public String email;
        public String password;
    }

    public UserController(UserService userService) {
        this.userService = userService;
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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> user = userService.login(request.email, request.password);
        if (user.isPresent()) {
            String token = JwtUtil.generateToken(user.get().getEmail());
            return ResponseEntity.ok(
                new LoginResponse(
                String.valueOf(user.get().getId()),
                user.get().getEmail(),
                token
            )
            ); 
        } else {
            //return ResponseEntity.status(401).build();
            // 실패 시 JSON 메시지 반환
            return ResponseEntity.status(401).body(
                Map.of("error", "Invalid email or password")
            );
        }
    }

    @GetMapping("/find-email")
    public ResponseEntity<?> findEmail(@RequestParam String nickname) {
        Optional<User> user = userService.findByNickname(nickname);
        if (user.isPresent()) {
            // 이메일 반환 (보안상 일부만 보여줄 수도 있음: test****@example.com)
            String email = user.get().getEmail();
            return ResponseEntity.ok(Map.of("email", email));
        } else {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
    }

}
