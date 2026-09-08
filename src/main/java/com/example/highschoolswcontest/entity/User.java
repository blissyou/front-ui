package com.example.highschoolswcontest.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Kept only so installations with the previous schema can still insert accounts.
    // These columns contain no additional user-provided personal information.
    @Column(nullable = false, unique = true)
    private String loginId;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String name = "";

    @Column(nullable = false)
    private String phone = "";

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String school = "";

    @Column(nullable = false)
    private Integer grade = 0;

    @Column(nullable = false)
    private String role = "USER";

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (loginId == null || loginId.isBlank()) loginId = "account-" + UUID.randomUUID();
        createdAt = LocalDateTime.now();
    }
}
