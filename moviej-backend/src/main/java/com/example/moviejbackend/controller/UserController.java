package com.example.moviejbackend.controller;

import com.example.moviejbackend.domain.Post;
import com.example.moviejbackend.domain.User;
import com.example.moviejbackend.service.UserService;
import com.example.moviejbackend.util.JwtUtil;

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

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public User registerUser(@RequestBody User user) {
        return userService.registerUser(user);
    }
    
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

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
