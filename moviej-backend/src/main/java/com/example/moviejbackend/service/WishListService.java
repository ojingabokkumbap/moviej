package com.example.moviejbackend.service;

import com.example.moviejbackend.domain.User;
import com.example.moviejbackend.domain.UserCollection;
import com.example.moviejbackend.dto.response.WishListResponseDto;
import com.example.moviejbackend.repository.UserCollectionRepository;
import com.example.moviejbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishListService {

    private final UserCollectionRepository userCollectionRepository;
    private final UserRepository userRepository;

    /**
     * 찜하기 추가
     */
    @Transactional
    public WishListResponseDto addToWishList(String email, Long movieId, String title, String posterPath) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 중복 체크
        if (userCollectionRepository.existsByUserIdAndMovieId(user.getId(), movieId)) {
            throw new IllegalArgumentException("이미 찜한 영화입니다.");
        }

        UserCollection wishList = UserCollection.builder()
                .user(user)
                .movieId(movieId)
                .title(title)
                .posterPath(posterPath)
                .createdAt(LocalDateTime.now())
                .build();

        UserCollection saved = userCollectionRepository.save(wishList);

        return new WishListResponseDto(
                saved.getId(),
                saved.getMovieId(),
                saved.getTitle(),
                saved.getPosterPath(),
                saved.getCreatedAt(),
                saved.getRating()
        );
    }

    /**
     * 찜하기 삭제
     */
    @Transactional
    public void removeFromWishList(String email, Long movieId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (!userCollectionRepository.existsByUserIdAndMovieId(user.getId(), movieId)) {
            throw new IllegalArgumentException("찜한 영화가 아닙니다.");
        }

        userCollectionRepository.deleteByUserIdAndMovieId(user.getId(), movieId);
    }

    /**
     * 찜 목록 조회 (최신순)
     */
    @Transactional(readOnly = true)
    public List<WishListResponseDto> getWishList(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        List<UserCollection> wishLists = userCollectionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        return wishLists.stream()
                .map(wl -> new WishListResponseDto(
                        wl.getId(),
                        wl.getMovieId(),
                        wl.getTitle(),
                        wl.getPosterPath(),
                        wl.getCreatedAt(),
                        wl.getRating()
                ))
                .collect(Collectors.toList());
    }

    /**
     * 찜 여부 확인 (단건)
     */
    @Transactional(readOnly = true)
    public boolean isInWishList(String email, Long movieId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return userCollectionRepository.existsByUserIdAndMovieId(user.getId(), movieId);
    }

    /**
     * 찜 여부 일괄 확인 (여러 영화를 한 번에 조회)
     */
    @Transactional(readOnly = true)
    public Map<Long, Boolean> checkWishListBatch(String email, List<Long> movieIds) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 사용자가 찜한 영화 ID 목록 조회 (1번의 쿼리)
        List<UserCollection> wishLists = userCollectionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        Set<Long> wishedMovieIds = wishLists.stream()
                .map(UserCollection::getMovieId)
                .collect(Collectors.toSet());

        // 각 영화 ID에 대해 찜 여부 매핑
        return movieIds.stream()
                .collect(Collectors.toMap(
                        movieId -> movieId,
                        wishedMovieIds::contains
                ));
    }

    /**
     * 찜하기 토글 (있으면 삭제, 없으면 추가)
     */
    @Transactional
    public boolean toggleWishList(String email, Long movieId, String title, String posterPath) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (userCollectionRepository.existsByUserIdAndMovieId(user.getId(), movieId)) {
            // 이미 찜했으면 삭제
            userCollectionRepository.deleteByUserIdAndMovieId(user.getId(), movieId);
            return false;  // 찜 해제됨
        } else {
            // 찜하지 않았으면 추가
            UserCollection wishList = UserCollection.builder()
                    .user(user)
                    .movieId(movieId)
                    .title(title)
                    .posterPath(posterPath)
                    .createdAt(LocalDateTime.now())
                    .build();
            userCollectionRepository.save(wishList);
            return true;  // 찜 추가됨
        }
    }
}
