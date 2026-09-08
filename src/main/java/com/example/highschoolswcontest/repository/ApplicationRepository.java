package com.example.highschoolswcontest.repository;

import com.example.highschoolswcontest.entity.Application;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
  Optional<Application> findByContestIdAndApplicantId(Long contestId, Long applicantId);

  @Query(
      "select a from Application a join fetch a.contest "
          + "where a.contest.id = :contestId and a.applicant.id = :applicantId")
  Optional<Application> findWithContestByContestIdAndApplicantId(Long contestId, Long applicantId);

  @Query(
      "select a from Application a join fetch a.contest join fetch a.applicant "
          + "order by a.submittedAt desc")
  List<Application> findAllWithContestAndApplicant();

  @Query(
      "select a from Application a join fetch a.contest "
          + "where a.applicant.id = :applicantId order by a.submittedAt desc")
  List<Application> findAllWithContestByApplicantId(Long applicantId);

  void deleteByContestId(Long contestId);
}
