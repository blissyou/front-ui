package com.example.highschoolswcontest.repository;

import com.example.highschoolswcontest.entity.ApplicationFormField;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationFormFieldRepository extends JpaRepository<ApplicationFormField, Long> {
  List<ApplicationFormField> findByContestIdOrderBySortOrderAscIdAsc(Long contestId);

  Optional<ApplicationFormField> findByIdAndContestId(Long id, Long contestId);

  void deleteByContestId(Long contestId);
}
