package com.example.highschoolswcontest.admin.service;

import com.example.highschoolswcontest.entity.ApplicationFormField;
import com.example.highschoolswcontest.global.ApiSupport;
import com.example.highschoolswcontest.repository.ApplicationFormFieldRepository;
import com.example.highschoolswcontest.repository.ContestRepository;
import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class ApplicationFormAdminService {
  private static final Set<String> FIELD_TYPES =
      Set.of("SHORT_TEXT", "LONG_TEXT", "SELECT", "FILE", "YOUTUBE");

  private final ContestRepository contests;
  private final ApplicationFormFieldRepository fields;

  public ApplicationFormAdminService(
      ContestRepository contests, ApplicationFormFieldRepository fields) {
    this.contests = contests;
    this.fields = fields;
  }

  public List<Map<String, Object>> fields(Long contestId, HttpSession session) {
    ApiSupport.admin(session);
    return fields.findByContestIdOrderBySortOrderAscIdAsc(contestId).stream()
        .map(this::view)
        .toList();
  }

  public Map<String, Object> create(Long contestId, Map<String, Object> body, HttpSession session) {
    ApiSupport.admin(session);
    String fieldType = required(body, "fieldType");
    if (!FIELD_TYPES.contains(fieldType)) {
      throw new IllegalArgumentException("지원하지 않는 입력 방식입니다.");
    }
    String optionsText = ApiSupport.text(body, "optionsText");
    if ("SELECT".equals(fieldType) && (optionsText == null || optionsText.isBlank())) {
      throw new IllegalArgumentException("선택형 질문에는 선택지를 입력해 주세요.");
    }
    ApplicationFormField field = new ApplicationFormField();
    field.setContest(
        contests.findById(contestId).orElseThrow(() -> new ApiSupport.Missing("대회를 찾을 수 없습니다.")));
    field.setLabel(required(body, "label"));
    field.setFieldType(fieldType);
    field.setRequired(ApiSupport.bool(body, "required", false));
    field.setOptionsText(optionsText == null ? null : optionsText.trim());
    field.setSortOrder(fields.findByContestIdOrderBySortOrderAscIdAsc(contestId).size() + 1);
    return view(fields.save(field));
  }

  public void delete(Long contestId, Long fieldId, HttpSession session) {
    ApiSupport.admin(session);
    ApplicationFormField field =
        fields
            .findByIdAndContestId(fieldId, contestId)
            .orElseThrow(() -> new ApiSupport.Missing("질문을 찾을 수 없습니다."));
    fields.delete(field);
  }

  private String required(Map<String, Object> body, String key) {
    String value = ApiSupport.text(body, key);
    if (value == null || value.isBlank()) {
      throw new IllegalArgumentException(key + "은(는) 필수입니다.");
    }
    return value.trim();
  }

  private Map<String, Object> view(ApplicationFormField field) {
    return Map.of(
        "id", field.getId(),
        "label", field.getLabel(),
        "fieldType", field.getFieldType(),
        "required", field.isRequired(),
        "optionsText", field.getOptionsText() == null ? "" : field.getOptionsText(),
        "sortOrder", field.getSortOrder());
  }
}
