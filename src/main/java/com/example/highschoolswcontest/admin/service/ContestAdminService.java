package com.example.highschoolswcontest.admin.service;

import static com.example.highschoolswcontest.global.ApiSupport.bool;
import static com.example.highschoolswcontest.global.ApiSupport.date;
import static com.example.highschoolswcontest.global.ApiSupport.text;

import com.example.highschoolswcontest.entity.*;
import com.example.highschoolswcontest.global.*;
import com.example.highschoolswcontest.global.ApplicationAnswerCodec;
import com.example.highschoolswcontest.repository.*;
import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ContestAdminService {
  private final ContestRepository contests;
  private final ContestNoticeRepository notices;
  private final QuestionRepository questions;
  private final ApplicationRepository applications;
  private final ApplicationFormFieldRepository applicationFormFields;
  private final UserRepository users;
  private final ApplicationAttachmentRepository attachments;
  private final NoticeAttachmentRepository noticeAttachments;

  public ContestAdminService(
      ContestRepository contests,
      ContestNoticeRepository notices,
      QuestionRepository questions,
      ApplicationRepository applications,
      ApplicationFormFieldRepository applicationFormFields,
      UserRepository users,
      ApplicationAttachmentRepository attachments,
      NoticeAttachmentRepository noticeAttachments) {
    this.contests = contests;
    this.notices = notices;
    this.questions = questions;
    this.applications = applications;
    this.applicationFormFields = applicationFormFields;
    this.users = users;
    this.attachments = attachments;
    this.noticeAttachments = noticeAttachments;
  }

  public Contest createContest(Map<String, Object> body, HttpSession session) {
    ApiSupport.admin(session);
    Contest c = new Contest();
    c.setTitle(text(body, "title"));
    c.setDescription(text(body, "description"));
    c.setStatus(text(body, "status"));
    c.setApplicationStartAt(date(body, "applicationStartAt"));
    c.setApplicationEndAt(date(body, "applicationEndAt"));
    c.setStartDate(date(body, "startDate"));
    c.setEndDate(date(body, "endDate"));
    c.setPublished(bool(body, "published", true));
    return contests.save(c);
  }

  public List<Contest> contests(HttpSession session) {
    ApiSupport.admin(session);
    return contests.findAll();
  }

  public Contest updateContest(Long contestId, Map<String, Object> body, HttpSession session) {
    ApiSupport.admin(session);
    Contest contest = contest(contestId);
    contest.setTitle(text(body, "title"));
    contest.setDescription(text(body, "description"));
    contest.setStatus(text(body, "status"));
    contest.setApplicationStartAt(date(body, "applicationStartAt"));
    contest.setApplicationEndAt(date(body, "applicationEndAt"));
    contest.setStartDate(date(body, "startDate"));
    contest.setEndDate(date(body, "endDate"));
    contest.setPublished(bool(body, "published", contest.isPublished()));
    return contests.save(contest);
  }

  public Contest finishContest(Long contestId, HttpSession session) {
    ApiSupport.admin(session);
    Contest contest = contest(contestId);
    contest.setStatus("FINISHED");
    return contests.save(contest);
  }

  @Transactional
  public void deleteContest(Long contestId, HttpSession session) {
    ApiSupport.admin(session);
    contest(contestId);
    attachments.deleteByContestId(contestId);
    noticeAttachments.deleteByContestId(contestId);
    applications.deleteByContestId(contestId);
    questions.deleteByContestId(contestId);
    notices.deleteByContestId(contestId);
    applicationFormFields.deleteByContestId(contestId);
    contests.deleteById(contestId);
  }

  public Map<String, Object> createNotice(
      Long contestId, Map<String, Object> body, HttpSession session) {
    return createNotice(contestId, body, List.of(), session);
  }

  @Transactional
  public Map<String, Object> createNoticeWithFiles(
      Long contestId, Map<String, Object> body, List<MultipartFile> files, HttpSession session) {
    return createNotice(contestId, body, files, session);
  }

  private Map<String, Object> createNotice(
      Long contestId, Map<String, Object> body, List<MultipartFile> files, HttpSession session) {
    ApiSupport.admin(session);
    String youtubeUrl = text(body, "youtubeUrl");
    if (youtubeUrl != null && !youtubeUrl.isBlank() && !isYoutubeUrl(youtubeUrl)) {
      throw new IllegalArgumentException("올바른 유튜브 주소를 입력해 주세요.");
    }
    ContestNotice n = new ContestNotice();
    n.setContest(contest(contestId));
    n.setTitle(text(body, "title"));
    n.setBody(text(body, "body"));
    n.setSlug(slug(n.getTitle()));
    n.setPinned(bool(body, "pinned", false));
    n.setPublished(bool(body, "published", true));
    n.setYoutubeUrl(youtubeUrl == null || youtubeUrl.isBlank() ? null : youtubeUrl.trim());
    notices.save(n);
    saveNoticeAttachments(n, files);
    return noticeView(n);
  }

  @Transactional(readOnly = true)
  public NoticeAttachment noticeAttachment(
      Long contestId, Long noticeId, Long attachmentId, HttpSession session) {
    ApiSupport.admin(session);
    return noticeAttachments
        .findByIdAndNoticeId(attachmentId, noticeId)
        .filter(item -> item.getNotice().getContest().getId().equals(contestId))
        .orElseThrow(() -> new ApiSupport.Missing("첨부 파일을 찾을 수 없습니다."));
  }

  public Map<String, Object> answer(
      Long contestId, Long questionId, Map<String, Object> body, HttpSession session) {
    ApiSupport.admin(session);
    Question q =
        questions
            .findById(questionId)
            .filter(x -> x.getContest().getId().equals(contestId))
            .orElseThrow(() -> new ApiSupport.Missing("질문을 찾을 수 없습니다."));
    q.setAnswer(text(body, "answer"));
    q.setAnswered(true);
    questions.save(q);
    return Map.of("id", q.getId(), "answered", true, "answer", q.getAnswer());
  }

  public Map<String, Object> createFaq(
      Long contestId, Map<String, Object> body, HttpSession session) {
    ApiSupport.admin(session);
    Long userId = (Long) session.getAttribute("USER_ID");
    User author = users.findById(userId).orElseThrow(ApiSupport.Forbidden::new);
    String title = text(body, "title");
    String answer = text(body, "answer");
    if (title == null || title.isBlank() || answer == null || answer.isBlank()) {
      throw new IllegalArgumentException("FAQ 질문과 답변을 입력해 주세요.");
    }
    String detail = text(body, "body");
    Question faq = new Question();
    faq.setContest(contest(contestId));
    faq.setAuthor(author);
    faq.setTitle(title.trim());
    faq.setBody(detail == null || detail.isBlank() ? title.trim() : detail.trim());
    faq.setAnswer(answer.trim());
    faq.setSecret(false);
    faq.setAnswered(true);
    faq.setFaq(true);
    return questionView(questions.save(faq));
  }

  public List<Map<String, Object>> questions(Long contestId, HttpSession session) {
    ApiSupport.admin(session);
    contest(contestId);
    return questions.findByContestIdOrderByCreatedAtDesc(contestId).stream()
        .map(this::questionView)
        .toList();
  }

  public Map<String, Object> changeApplicationStatus(
      Long contestId, Long applicationId, Map<String, Object> body, HttpSession session) {
    ApiSupport.admin(session);
    Application a =
        applications
            .findById(applicationId)
            .filter(x -> x.getContest().getId().equals(contestId))
            .orElseThrow(() -> new ApiSupport.Missing("신청 내역을 찾을 수 없습니다."));
    String status = text(body, "status");
    if (!Set.of("SUBMITTED", "APPROVED", "REJECTED").contains(status)) {
      throw new IllegalArgumentException("유효하지 않은 신청 상태입니다.");
    }
    a.setStatus(status);
    applications.save(a);
    return Map.of("id", a.getId(), "status", a.getStatus());
  }

  public List<Map<String, Object>> applications(HttpSession session) {
    ApiSupport.admin(session);
    return applications.findAllWithContestAndApplicant().stream()
        .map(this::applicationView)
        .toList();
  }

  public Map<String, Object> application(Long applicationId, Long contestId, HttpSession session) {
    ApiSupport.admin(session);
    Application application =
        applications.findAllWithContestAndApplicant().stream()
            .filter(
                item ->
                    item.getId().equals(applicationId)
                        && item.getContest().getId().equals(contestId))
            .findFirst()
            .orElseThrow(() -> new ApiSupport.Missing("참가 신청을 찾을 수 없습니다."));
    return applicationView(application);
  }

  @Transactional(readOnly = true)
  public ApplicationAttachment applicationAttachment(
      Long contestId, Long applicationId, Long attachmentId, HttpSession session) {
    ApiSupport.admin(session);
    ApplicationAttachment attachment =
        attachments
            .findByIdAndApplicationId(attachmentId, applicationId)
            .filter(item -> item.getApplication().getContest().getId().equals(contestId))
            .orElseThrow(() -> new ApiSupport.Missing("첨부 파일을 찾을 수 없습니다."));
    return attachment;
  }

  private Contest contest(Long id) {
    return contests.findById(id).orElseThrow(() -> new ApiSupport.Missing("대회를 찾을 수 없습니다."));
  }

  private String slug(String title) {
    return title.replaceAll("[^a-zA-Z0-9가-힣]+", "-") + "-" + System.currentTimeMillis();
  }

  private void saveNoticeAttachments(ContestNotice notice, List<MultipartFile> files) {
    for (MultipartFile file : files) {
      if (file == null || file.isEmpty()) continue;
      if (file.getSize() > 10 * 1024 * 1024) {
        throw new IllegalArgumentException("첨부 파일은 파일당 10MB 이하만 등록할 수 있습니다.");
      }
      NoticeAttachment attachment = new NoticeAttachment();
      attachment.setNotice(notice);
      attachment.setOriginalFileName(safeFileName(file.getOriginalFilename()));
      attachment.setContentType(file.getContentType());
      attachment.setFileSize(file.getSize());
      try {
        attachment.setData(file.getBytes());
      } catch (java.io.IOException exception) {
        throw new IllegalStateException("첨부 파일을 저장하지 못했습니다.", exception);
      }
      noticeAttachments.save(attachment);
    }
  }

  private String safeFileName(String originalName) {
    if (originalName == null || originalName.isBlank()) return "attachment";
    String normalized = originalName.replace('\\', '/');
    String name = normalized.substring(normalized.lastIndexOf('/') + 1);
    name = name.replaceAll("[\\r\\n\\u0000]", "_").trim();
    return name.isBlank() ? "attachment" : name;
  }

  private boolean isYoutubeUrl(String value) {
    try {
      java.net.URI uri = java.net.URI.create(value);
      String scheme = uri.getScheme();
      if (!"http".equals(scheme) && !"https".equals(scheme)) return false;
      String host = uri.getHost();
      if (host == null) return false;
      host = host.toLowerCase(java.util.Locale.ROOT);
      String videoId = "";
      if (host.equals("youtu.be")) {
        videoId = uri.getPath().replaceFirst("^/", "").split("/", 2)[0];
      } else if (host.equals("youtube.com") || host.endsWith(".youtube.com")) {
        String path = uri.getPath();
        if ("/watch".equals(path) && uri.getRawQuery() != null) {
          videoId =
              java.util.Arrays.stream(uri.getRawQuery().split("&"))
                  .map(item -> item.split("=", 2))
                  .filter(parts -> parts.length == 2 && "v".equals(parts[0]))
                  .map(
                      parts ->
                          java.net.URLDecoder.decode(
                              parts[1], java.nio.charset.StandardCharsets.UTF_8))
                  .findFirst()
                  .orElse("");
        } else if (path.matches("^/(embed|shorts)/[^/]+.*")) {
          videoId = path.split("/")[2];
        }
      }
      return videoId.matches("[a-zA-Z0-9_-]{6,}");
    } catch (IllegalArgumentException exception) {
      return false;
    }
  }

  private Map<String, Object> applicationView(Application application) {
    User applicant = application.getApplicant();
    Contest contest = application.getContest();
    Map<String, String> answers = ApplicationAnswerCodec.decode(application.getAnswersJson());
    List<Map<String, String>> answerItems =
        applicationFormFields.findByContestIdOrderBySortOrderAscIdAsc(contest.getId()).stream()
            .filter(field -> !"FILE".equals(field.getFieldType()))
            .map(
                field ->
                    Map.of(
                        "label", field.getLabel(),
                        "fieldType", field.getFieldType(),
                        "value", answers.getOrDefault(String.valueOf(field.getId()), "-")))
            .toList();
    List<Map<String, Object>> attachmentItems =
        attachments.findByApplicationIdOrderByIdAsc(application.getId()).stream()
            .map(
                attachment ->
                    Map.<String, Object>of(
                        "id", attachment.getId(),
                        "fieldLabel", attachment.getFieldLabel(),
                        "fileName", attachment.getOriginalFileName(),
                        "contentType",
                            attachment.getContentType() == null ? "" : attachment.getContentType(),
                        "fileSize", attachment.getFileSize()))
            .toList();
    return Map.of(
        "id",
        application.getId(),
        "contestId",
        contest.getId(),
        "contestTitle",
        contest.getTitle(),
        "status",
        application.getStatus(),
        "introduction",
        application.getIntroduction(),
        "answerItems",
        answerItems,
        "attachments",
        attachmentItems,
        "submittedAt",
        application.getSubmittedAt(),
        "applicant",
        Map.of(
            "id", applicant.getId(),
            "email", applicant.getEmail()));
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
        "createdAt", notice.getCreatedAt());
  }

  private Map<String, Object> questionView(Question question) {
    return Map.of(
        "id", question.getId(),
        "title", question.getTitle(),
        "body", question.getBody(),
        "answer", question.getAnswer() == null ? "" : question.getAnswer(),
        "secret", question.isSecret(),
        "answered", question.isAnswered(),
        "faq", question.isFaq(),
        "createdAt", question.getCreatedAt());
  }
}
