package com.example.highschoolswcontest.open.service;

import com.example.highschoolswcontest.entity.*;
import com.example.highschoolswcontest.global.ApiSupport;
import com.example.highschoolswcontest.repository.*;
import jakarta.servlet.http.HttpSession;
import java.util.*;
import org.springframework.stereotype.Service;

@Service
public class ContestPublicService {
  private final ContestRepository contests;
  private final ContestNoticeRepository notices;
  private final QuestionRepository questions;
  private final ApplicationFormFieldRepository applicationFormFields;
  private final NoticeAttachmentRepository noticeAttachments;

  public ContestPublicService(
      ContestRepository contests,
      ContestNoticeRepository notices,
      QuestionRepository questions,
      ApplicationFormFieldRepository applicationFormFields,
      NoticeAttachmentRepository noticeAttachments) {
    this.contests = contests;
    this.notices = notices;
    this.questions = questions;
    this.applicationFormFields = applicationFormFields;
    this.noticeAttachments = noticeAttachments;
  }

  public List<Contest> contests() {
    return contests.findByPublishedTrueOrderByStartDateDesc();
  }

  public Contest contest(Long id) {
    return contests
        .findById(id)
        .filter(Contest::isPublished)
        .orElseThrow(() -> new ApiSupport.Missing("대회를 찾을 수 없습니다."));
  }

  public List<Map<String, Object>> applicationForm(Long contestId) {
    contest(contestId);
    return applicationFormFields.findByContestIdOrderBySortOrderAscIdAsc(contestId).stream()
        .map(this::formFieldView)
        .toList();
  }

  public List<Map<String, Object>> notices(Long id) {
    contest(id);
    return notices.findByContestIdAndPublishedTrueOrderByPinnedDescCreatedAtDesc(id).stream()
        .map(this::noticeView)
        .toList();
  }

  public Map<String, Object> notice(Long contestId, Long noticeId) {
    return notices
        .findByIdAndContestIdAndPublishedTrue(noticeId, contestId)
        .map(this::noticeView)
        .orElseThrow(() -> new ApiSupport.Missing("공지사항을 찾을 수 없습니다."));
  }

  public NoticeAttachment noticeAttachment(Long contestId, Long noticeId, Long attachmentId) {
    notices
        .findByIdAndContestIdAndPublishedTrue(noticeId, contestId)
        .orElseThrow(() -> new ApiSupport.Missing("공지사항을 찾을 수 없습니다."));
    return noticeAttachments
        .findByIdAndNoticeId(attachmentId, noticeId)
        .orElseThrow(() -> new ApiSupport.Missing("첨부 파일을 찾을 수 없습니다."));
  }

  public List<Map<String, Object>> questions(Long contestId, HttpSession session) {
    contest(contestId);
    return questions.findByContestIdOrderByCreatedAtDesc(contestId).stream()
        .filter(q -> canRead(q, session))
        .map(this::questionView)
        .toList();
  }

  public Map<String, Object> question(Long contestId, Long questionId, HttpSession session) {
    Question q =
        questions
            .findById(questionId)
            .filter(x -> x.getContest().getId().equals(contestId) && canRead(x, session))
            .orElseThrow(() -> new ApiSupport.Missing("질문을 찾을 수 없습니다."));
    return questionView(q);
  }

  private boolean canRead(Question question, HttpSession session) {
    if (!question.isSecret()) {
      return true;
    }
    if (session == null) {
      return false;
    }
    if ("ADMIN".equals(session.getAttribute("ROLE"))) {
      return true;
    }
    Object userId = session.getAttribute("USER_ID");
    return userId instanceof Long && question.getAuthor().getId().equals(userId);
  }

  private Map<String, Object> questionView(Question q) {
    return Map.of(
        "id",
        q.getId(),
        "title",
        q.getTitle(),
        "body",
        q.getBody(),
        "answer",
        q.getAnswer() == null ? "" : q.getAnswer(),
        "answered",
        q.isAnswered(),
        "secret",
        q.isSecret(),
        "faq",
        q.isFaq(),
        "createdAt",
        q.getCreatedAt());
  }

  private Map<String, Object> noticeView(ContestNotice notice) {
    List<Map<String, Object>> attachmentItems =
        noticeAttachments.findByNoticeIdOrderByIdAsc(notice.getId()).stream()
            .map(
                attachment ->
                    Map.<String, Object>of(
                        "id", attachment.getId(),
                        "fileName", attachment.getOriginalFileName(),
                        "contentType",
                            attachment.getContentType() == null ? "" : attachment.getContentType(),
                        "fileSize", attachment.getFileSize()))
            .toList();
    return Map.of(
        "id", notice.getId(),
        "title", notice.getTitle(),
        "slug", notice.getSlug(),
        "body", notice.getBody(),
        "youtubeUrl", notice.getYoutubeUrl() == null ? "" : notice.getYoutubeUrl(),
        "attachments", attachmentItems,
        "pinned", notice.isPinned(),
        "published", notice.isPublished(),
        "createdAt", notice.getCreatedAt(),
        "updatedAt", notice.getUpdatedAt());
  }

  private Map<String, Object> formFieldView(ApplicationFormField field) {
    return Map.of(
        "id", field.getId(),
        "label", field.getLabel(),
        "fieldType", field.getFieldType(),
        "required", field.isRequired(),
        "options", splitOptions(field.getOptionsText()),
        "sortOrder", field.getSortOrder());
  }

  private List<String> splitOptions(String optionsText) {
    if (optionsText == null || optionsText.isBlank()) {
      return List.of();
    }
    return Arrays.stream(optionsText.split("\\R|,"))
        .map(String::trim)
        .filter(option -> !option.isBlank())
        .toList();
  }
}
