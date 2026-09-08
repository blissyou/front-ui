package com.example.highschoolswcontest.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "contest_notices")
@Getter
@Setter
@NoArgsConstructor
public class ContestNotice {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  private Contest contest;

  @Column(nullable = false)
  private String title;

  @Column(nullable = false, unique = true)
  private String slug;

  @Column(nullable = false, length = 10000)
  private String body;

  private String youtubeUrl;

  private boolean pinned;
  private boolean published;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  @PrePersist
  void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = createdAt;
  }

  @PreUpdate
  void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
