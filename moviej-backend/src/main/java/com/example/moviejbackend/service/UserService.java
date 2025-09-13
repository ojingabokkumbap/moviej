package com.example.moviejbackend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.moviejbackend.domain.Post;
import com.example.moviejbackend.domain.User;
import com.example.moviejbackend.repository.UserRepository;

/**
 * UserService는 사용자 관련 비즈니스 로직을 처리하는 서비스 클래스입니다.
 * 이 클래스는 PostRepository를 주입받아 데이터베이스와 상호작용합니다.
 */
@Service
public class UserService {

    @Autowired
    private UserRepository UserRepository;

    public User registerUser(User user) {
        return UserRepository.save(user);
    }    

    public List<User> getAllUsers() {
        return UserRepository.findAll();
    }

    public User findByUserId(String email) {
        return UserRepository.findByUserId(email);
    }

    public Optional<User> login(String email, String password, String userId) {
        Optional<User> userOpt = UserRepository.findByEmail(email);
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            return userOpt;
        }
        return Optional.empty();
    }

    public Optional<User> findByEmail(String email) {
        return UserRepository.findByEmail(email);
    }

}
