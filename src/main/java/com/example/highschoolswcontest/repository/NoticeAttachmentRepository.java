package com.example.highschoolswcontest.repository;

import com.example.highschoolswcontest.entity.NoticeAttachment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface NoticeAttachmentRepository extends JpaRepository<NoticeAttachment, Long> {
  List<NoticeAttachment> findByNoticeIdOrderByIdAsc(Long noticeId);

  Optional<NoticeAttachment> findByIdAndNoticeId(Long id, Long noticeId);

  @Modifying
  @Query("delete from NoticeAttachment a where a.notice.contest.id = :contestId")
  void deleteByContestId(Long contestId);
}
