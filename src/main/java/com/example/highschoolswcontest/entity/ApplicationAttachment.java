package com.example.highschoolswcontest.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "application_attachments")
@Getter
@Setter
@NoArgsConstructor
public class ApplicationAttachment {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  private Application application;

  @Column(nullable = false)
  private Long fieldId;

  @Column(nullable = false)
  private String fieldLabel;

  @Column(nullable = false)
  private String originalFileName;

  private String contentType;

  @Column(nullable = false)
  private long fileSize;

  @Lob
  @Basic(fetch = FetchType.LAZY)
  @Column(nullable = false)
  private byte[] data;
}
