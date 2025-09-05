package com.example.myhealth.service;

import com.example.myhealth.domain.Post;
import com.example.myhealth.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PostService {

    // PostRepository를 주입받아 데이터베이스와 상호작용합니다.
    @Autowired
    private PostRepository postRepository;

    // 모든 게시글을 조회하는 메서드
    public List<Post> getAllPosts() {
         // 데이터베이스에서 모든 게시글을 가져옵니다.
        return postRepository.findAll();
    }

     // 특정 ID를 가진 게시글을 조회하는 메서드
    public Optional<Post> getPostById(Long id) {
        // ID를 기준으로 게시글을 조회합니다. 결과는 Optional로 반환
        return postRepository.findById(id);
    }

    // 새로운 게시글을 생성하는 메서드
    public Post createPost(Post post) {
         // 전달받은 게시글 객체를 데이터베이스에 저장하고 저장된 객체를 반환
        return postRepository.save(post);
    }

    // 특정 ID를 가진 게시글을 수정하는 메서
    public Post updatePost(Long id, Post updatedPost) {
        // 해당 ID의 게시글이 존재하는지 확인
        if (postRepository.existsById(id)) {
            // 수정할 게시글의 ID를 기존 게시글의 ID로 설정
            updatedPost.setId(id);
            // 수정된 게시글을 데이터베이스에 저장하고 반환
            return postRepository.save(updatedPost);
        }
        // 게시글이 존재하지 않으면 null을 반환합니다.
        return null;
    }

    // 특정 ID를 가진 게시글을 삭제하는 메서드
    public void deletePost(Long id) {
         // ID를 기준으로 게시글을 데이터베이스에서 삭제
        postRepository.deleteById(id);
    }
}