package com.example.highschoolswcontest.repository;

import com.example.highschoolswcontest.entity.Contest;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContestRepository extends JpaRepository<Contest, Long> {
  List<Contest> findByPublishedTrueOrderByStartDateDesc();

  Optional<Contest> findByTitle(String title);
}
