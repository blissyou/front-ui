package com.example.highschoolswcontest.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "applications",
        uniqueConstraints = @UniqueConstraint(columnNames = {"contest_id", "applicant_id"}))
@Getter
@Setter
@NoArgsConstructor
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Contest contest;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User applicant;

    @Column(nullable = false)
    private String status = "SUBMITTED";

    @Column(nullable = false, length = 4000)
    private String introduction;

    @Column(length = 10000)
    private String answersJson;

    private LocalDateTime submittedAt;

    @PrePersist
    void onCreate() {
        submittedAt = LocalDateTime.now();
    }
}
