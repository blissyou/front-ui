package com.example.highschoolswcontest.repository;

import com.example.highschoolswcontest.entity.Question;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface QuestionRepository extends JpaRepository<Question, Long> {
  List<Question> findByContestIdOrderByCreatedAtDesc(Long contestId);

  @Query(
      "select q from Question q join fetch q.contest "
          + "where q.author.id = :authorId and q.faq = false order by q.createdAt desc")
  List<Question> findAllWithContestByAuthorId(Long authorId);

  void deleteByContestId(Long contestId);
}
