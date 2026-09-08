package com.example.highschoolswcontest.user.service;

import com.example.highschoolswcontest.auth.service.AuthService;
import com.example.highschoolswcontest.entity.*;
import com.example.highschoolswcontest.global.ApiSupport;
import com.example.highschoolswcontest.global.ApplicationAnswerCodec;
import com.example.highschoolswcontest.repository.*;
import jakarta.servlet.http.HttpSession;

import java.time.LocalDate;
import java.util.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ParticipationService {
    private final AuthService auth;
    private final ContestRepository contests;
    private final QuestionRepository questions;
    private final ApplicationRepository applications;
    private final ApplicationFormFieldRepository applicationFormFields;
    private final ApplicationAttachmentRepository attachments;

    public ParticipationService(
            AuthService auth,
            ContestRepository contests,
            QuestionRepository questions,
            ApplicationRepository applications,
            ApplicationFormFieldRepository applicationFormFields,
            ApplicationAttachmentRepository attachments) {
        this.auth = auth;
        this.contests = contests;
        this.questions = questions;
        this.applications = applications;
        this.applicationFormFields = applicationFormFields;
        this.attachments = attachments;
    }

    public Map<String, Object> ask(Long contestId, Map<String, Object> body, HttpSession session) {
        User user = auth.user(session);
        Contest contest = contest(contestId);
        Question q = new Question();
        q.setContest(contest);
        q.setAuthor(user);
        q.setTitle(required(body, "title"));
        q.setBody(required(body, "body"));
        q.setSecret(Boolean.parseBoolean(String.valueOf(body.getOrDefault("secret", false))));
        q.setFaq(false);
        questions.save(q);
        return Map.of(
                "id",
                q.getId(),
                "title",
                q.getTitle(),
                "body",
                q.getBody(),
                "answer",
                "",
                "answered",
                false,
                "secret",
                q.isSecret(),
                "faq",
                false,
                "createdAt",
                q.getCreatedAt());
    }

    @Transactional
    public Map<String, Object> apply(Long contestId, Map<String, Object> body, HttpSession session) {
        return apply(contestId, body, Map.of(), session);
    }

    @Transactional
    public Map<String, Object> applyWithFiles(
            Long contestId,
            Map<String, Object> body,
            Map<String, MultipartFile> files,
            HttpSession session) {
        return apply(contestId, body, files, session);
    }

    private Map<String, Object> apply(
            Long contestId,
            Map<String, Object> body,
            Map<String, MultipartFile> files,
            HttpSession session) {
        User user = auth.user(session);
        Contest contest = contest(contestId);
        LocalDate now = LocalDate.now();
        if (contest.getApplicationStartAt() != null
                && (now.isBefore(contest.getApplicationStartAt())
                || now.isAfter(contest.getApplicationEndAt())))
            throw new IllegalStateException("현재 신청 기간이 아닙니다.");
        if (applications.findByContestIdAndApplicantId(contestId, user.getId()).isPresent())
            throw new IllegalArgumentException("이미 참가 신청을 했습니다.");

        Map<String, String> answers = answers(body);
        List<ApplicationFormField> formFields =
                applicationFormFields.findByContestIdOrderBySortOrderAscIdAsc(contestId);
        validateAnswers(formFields, answers, files);

        Application app = new Application();
        app.setContest(contest);
        app.setApplicant(user);
        app.setIntroduction(applicationSummary(formFields, answers));
        app.setAnswersJson(ApplicationAnswerCodec.encode(answers));
        applications.save(app);
        saveAttachments(app, formFields, files);
        return applicationView(app);
    }

    @Transactional(readOnly = true)
    public ApplicationAttachment myAttachment(
            Long contestId, Long attachmentId, HttpSession session) {
        User user = auth.user(session);
        ApplicationAttachment attachment =
                attachments
                        .findById(attachmentId)
                        .orElseThrow(() -> new ApiSupport.Missing("파일을 찾을 수 없습니다."));
        Application application = attachment.getApplication();
        if (!application.getContest().getId().equals(contestId)
                || !application.getApplicant().getId().equals(user.getId())) {
            throw new ApiSupport.Missing("파일을 찾을 수 없습니다.");
        }
        return attachment;
    }

    public Map<String, Object> myApplication(Long contestId, HttpSession session) {
        User user = auth.user(session);
        return applicationView(
                applications
                        .findWithContestByContestIdAndApplicantId(contestId, user.getId())
                        .orElseThrow(() -> new ApiSupport.Missing("참가 신청 내역이 없습니다.")));
    }

    private Contest contest(Long id) {
        return contests
                .findById(id)
                .filter(Contest::isPublished)
                .orElseThrow(() -> new ApiSupport.Missing("대회를 찾을 수 없습니다."));
    }

    private String required(Map<String, Object> body, String key) {
        String value = ApiSupport.text(body, key);
        if (value == null || value.isBlank()) throw new IllegalArgumentException(key + "은(는) 필수입니다.");
        return value.trim();
    }

    private Map<String, Object> applicationView(Application app) {
        return Map.of(
                "id",
                app.getId(),
                "contestId",
                app.getContest().getId(),
                "status",
                app.getStatus(),
                "introduction",
                app.getIntroduction(),
                "answers",
                ApplicationAnswerCodec.decode(app.getAnswersJson()),
                "attachments",
                attachments.findByApplicationIdOrderByIdAsc(app.getId()).stream()
                        .map(
                                attachment ->
                                        Map.<String, Object>of(
                                                "id", attachment.getId(),
                                                "fieldLabel", attachment.getFieldLabel(),
                                                "fileName", attachment.getOriginalFileName(),
                                                "fileSize", attachment.getFileSize()))
                        .toList(),
                "submittedAt",
                app.getSubmittedAt());
    }

    private Map<String, String> answers(Map<String, Object> body) {
        Object rawAnswers = body.get("answers");
        if (!(rawAnswers instanceof Map<?, ?> answerMap)) {
            throw new IllegalArgumentException("신청서 응답이 필요합니다.");
        }
        Map<String, String> answers = new LinkedHashMap<>();
        answerMap.forEach(
                (key, value) ->
                        answers.put(String.valueOf(key), value == null ? "" : String.valueOf(value).trim()));
        return answers;
    }

    private void validateAnswers(
            List<ApplicationFormField> fields,
            Map<String, String> answers,
            Map<String, MultipartFile> files) {
        for (ApplicationFormField field : fields) {
            if ("FILE".equals(field.getFieldType())) {
                MultipartFile file = files.get("file-" + field.getId());
                if (field.isRequired() && (file == null || file.isEmpty())) {
                    throw new IllegalArgumentException(field.getLabel() + " 파일을 첨부해 주세요.");
                }
                if (file != null && file.getSize() > 10 * 1024 * 1024) {
                    throw new IllegalArgumentException("첨부 파일은 10MB 이하만 등록할 수 있습니다.");
                }
                continue;
            }
            String answer = answers.getOrDefault(String.valueOf(field.getId()), "");
            if (field.isRequired() && answer.isBlank()) {
                throw new IllegalArgumentException(field.getLabel() + "은(는) 필수입니다.");
            }
            if ("SELECT".equals(field.getFieldType())
                    && !answer.isBlank()
                    && !options(field.getOptionsText()).contains(answer)) {
                throw new IllegalArgumentException(field.getLabel() + "의 선택지를 확인해 주세요.");
            }
            if ("YOUTUBE".equals(field.getFieldType()) && !answer.isBlank() && !isYoutubeUrl(answer)) {
                throw new IllegalArgumentException(field.getLabel() + "에는 올바른 유튜브 주소를 입력해 주세요.");
            }
        }
    }

    private void saveAttachments(
            Application application,
            List<ApplicationFormField> fields,
            Map<String, MultipartFile> files) {
        for (ApplicationFormField field : fields) {
            if (!"FILE".equals(field.getFieldType())) continue;
            MultipartFile file = files.get("file-" + field.getId());
            if (file == null || file.isEmpty()) continue;
            String originalName = file.getOriginalFilename();
            String safeName = safeFileName(originalName);
            ApplicationAttachment attachment = new ApplicationAttachment();
            attachment.setApplication(application);
            attachment.setFieldId(field.getId());
            attachment.setFieldLabel(field.getLabel());
            attachment.setOriginalFileName(safeName);
            attachment.setContentType(file.getContentType());
            attachment.setFileSize(file.getSize());
            try {
                attachment.setData(file.getBytes());
            } catch (java.io.IOException exception) {
                throw new IllegalStateException("첨부 파일을 저장하지 못했습니다.", exception);
            }
            attachments.save(attachment);
        }
    }

    private String safeFileName(String originalName) {
        if (originalName == null || originalName.isBlank()) return "attachment";
        String normalized = originalName.replace('\\', '/');
        String name = normalized.substring(normalized.lastIndexOf('/') + 1);
        name = name.replaceAll("[\\r\\n\\u0000]", "_").trim();
        return name.isBlank() ? "attachment" : name;
    }

    private String applicationSummary(
            List<ApplicationFormField> fields, Map<String, String> answers) {
        return fields.stream()
                .map(field -> answers.getOrDefault(String.valueOf(field.getId()), ""))
                .filter(answer -> !answer.isBlank())
                .findFirst()
                .orElse("신청서 응답");
    }

    private List<String> options(String optionsText) {
        if (optionsText == null || optionsText.isBlank()) {
            return List.of();
        }
        return Arrays.stream(optionsText.split("\\R|,"))
                .map(String::trim)
                .filter(option -> !option.isBlank())
                .toList();
    }

    private boolean isYoutubeUrl(String value) {
        try {
            java.net.URI uri = java.net.URI.create(value);
            String scheme = uri.getScheme();
            if (!"http".equals(scheme) && !"https".equals(scheme)) return false;
            String host = uri.getHost();
            if (host == null) return false;
            host = host.toLowerCase(Locale.ROOT);
            String videoId = "";
            if (host.equals("youtu.be")) {
                videoId = uri.getPath().replaceFirst("^/", "").split("/", 2)[0];
            } else if (host.equals("youtube.com") || host.endsWith(".youtube.com")) {
                String path = uri.getPath();
                if ("/watch".equals(path) && uri.getRawQuery() != null) {
                    videoId =
                            Arrays.stream(uri.getRawQuery().split("&"))
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
}
