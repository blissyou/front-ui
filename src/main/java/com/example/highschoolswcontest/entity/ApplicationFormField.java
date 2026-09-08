package com.example.highschoolswcontest.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "application_form_fields")
@Getter
@Setter
@NoArgsConstructor
public class ApplicationFormField {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Contest contest;

    @Column(nullable = false)
    private String label;

    @Column(nullable = false)
    private String fieldType;

    @Column(nullable = false)
    private boolean required;

    @Column(length = 2000)
    private String optionsText;

    @Column(nullable = false)
    private Integer sortOrder;
}
