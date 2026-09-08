package com.example.highschoolswcontest.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "questions")
@Getter
@Setter
@NoArgsConstructor
public class Question {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  private Contest contest;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  private User author;

  @Column(nullable = false)
  private String title;

  @Column(nullable = false, length = 10000)
  private String body;

  @Column(length = 10000)
  private String answer;

  private boolean secret;
  private boolean answered;
  private boolean faq;
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
