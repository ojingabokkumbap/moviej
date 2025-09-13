package com.example.myhealth.controller;

import com.example.myhealth.domain.Post;
import com.example.myhealth.service.PostService;
import com.example.myhealth.service.S3Service;
import com.example.myhealth.domain.User;
import com.example.myhealth.service.UserService;

import lombok.Getter;
import lombok.Setter;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import com.example.myhealth.service.S3Service;



@RestController
@RequestMapping("/posts")
public class PostController {

    private final PostService postService;
    private final UserService userService;
    private final S3Service s3Service;

    // PostRepository를 주입받아 초기화
    public PostController(PostService postService, UserService userService, S3Service s3Service) {
        this.postService = postService;
        this.userService = userService;
        this.s3Service = s3Service;
    }
    
    @GetMapping("/s3test")
    public String s3Test() throws IOException {
        return s3Service.testUpload();
    }

    // 초기화 생성자
    // 모든 게시글 조회
    @GetMapping
    public List<Post> getAllPosts() {
        System.out.println("📋 Controller: getAllPosts() 호출됨");
        return postService.getAllPosts();
    }

    // 특정 게시글 조회
    @GetMapping("/view/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable Long id) {
        return postService.getPostById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Getter
    @Setter
    public static class PostRequest {
        private String title;
        private String content;
        private String userId;
    }

    // 새로운 게시글 생성
    @PostMapping("/write")
    public Post createPost(@RequestBody PostRequest postRequest) {
        User user = userService.findByUserId(postRequest.getUserId());
        Post post = new Post();
        post.setTitle(postRequest.getTitle());
        post.setContent(postRequest.getContent());
        post.setUser(user);


        return postService.createPost(post);
    }

    // 게시글 수정
    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable Long id, @RequestBody Post updatedPost) {
        return ResponseEntity.ok(postService.updatePost(id, updatedPost));
    }

    // 게시글 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }


}
