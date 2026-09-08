package com.example.highschoolswcontest.entity;

import jakarta.persistence.*;

import java.time.LocalDate;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "contests")
@Getter
@Setter
@NoArgsConstructor
public class Contest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 4000)
    private String description;

    @Column(nullable = false)
    private String status;

    private LocalDate applicationStartAt;
    private LocalDate applicationEndAt;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean published;
}
