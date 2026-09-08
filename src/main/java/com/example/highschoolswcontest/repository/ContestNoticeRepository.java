package com.example.highschoolswcontest.repository;

import com.example.highschoolswcontest.entity.ContestNotice;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ContestNoticeRepository extends JpaRepository<ContestNotice, Long> {
  List<ContestNotice> findByContestIdAndPublishedTrueOrderByPinnedDescCreatedAtDesc(Long contestId);

  Optional<ContestNotice> findByContestIdAndSlugAndPublishedTrue(Long contestId, String slug);

  Optional<ContestNotice> findByIdAndContestIdAndPublishedTrue(Long id, Long contestId);

  List<ContestNotice> findByContestIdOrderByPinnedDescCreatedAtDesc(Long contestId);

  @Query(
      "select n from ContestNotice n join fetch n.contest "
          + "where n.contest.id in :contestIds and n.published = true "
          + "order by n.pinned desc, n.createdAt desc")
  List<ContestNotice> findAllPublishedWithContestByContestIds(Collection<Long> contestIds);

  void deleteByContestId(Long contestId);
}
