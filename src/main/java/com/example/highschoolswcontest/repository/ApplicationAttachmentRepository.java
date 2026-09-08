package com.example.highschoolswcontest.repository;

import com.example.highschoolswcontest.entity.ApplicationAttachment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface ApplicationAttachmentRepository
    extends JpaRepository<ApplicationAttachment, Long> {
  List<ApplicationAttachment> findByApplicationIdOrderByIdAsc(Long applicationId);

  Optional<ApplicationAttachment> findByIdAndApplicationId(Long id, Long applicationId);

  @Modifying
  @Query("delete from ApplicationAttachment a where a.application.contest.id = :contestId")
  void deleteByContestId(Long contestId);
}
