package com.example.moviejbackend.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "user_preference_actor")
public class ActorInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long actorId;  // 배우 고유 ID
    
    @JsonProperty("name")  // JSON 응답 시 "name"으로 출력
    private String actorName;
}