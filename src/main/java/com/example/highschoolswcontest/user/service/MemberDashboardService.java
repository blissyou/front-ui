package com.example.highschoolswcontest.user.service;

import com.example.highschoolswcontest.auth.service.AuthService;
import com.example.highschoolswcontest.entity.*;
import com.example.highschoolswcontest.repository.*;
import jakarta.servlet.http.HttpSession;

import java.util.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MemberDashboardService {
    private final AuthService auth;
    private final ApplicationRepository applications;
    private final QuestionRepository questions;
    private final ContestNoticeRepository notices;

    public MemberDashboardService(
            AuthService auth,
            ApplicationRepository applications,
            QuestionRepository questions,
            ContestNoticeRepository notices) {
        this.auth = auth;
        this.applications = applications;
        this.questions = questions;
        this.notices = notices;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> dashboard(HttpSession session) {
        User user = auth.user(session);
        List<Application> myApplications = applications.findAllWithContestByApplicantId(user.getId());
        List<Long> contestIds =
                myApplications.stream().map(item -> item.getContest().getId()).distinct().toList();
        List<ContestNotice> myNotices =
                contestIds.isEmpty()
                        ? List.of()
                        : notices.findAllPublishedWithContestByContestIds(contestIds);

        return Map.of(
                "applications", myApplications.stream().map(this::applicationView).toList(),
                "questions",
                questions.findAllWithContestByAuthorId(user.getId()).stream()
                        .map(this::questionView)
                        .toList(),
                "notices", myNotices.stream().map(this::noticeView).toList());
    }

    private Map<String, Object> applicationView(Application application) {
        Contest contest = application.getContest();
        return Map.of(
                "id", application.getId(),
                "contestId", contest.getId(),
                "contestTitle", contest.getTitle(),
                "contestStatus", contest.getStatus(),
                "applicationStatus", application.getStatus(),
                "submittedAt", application.getSubmittedAt());
    }

    private Map<String, Object> questionView(Question question) {
        return Map.of(
                "id", question.getId(),
                "contestId", question.getContest().getId(),
                "contestTitle", question.getContest().getTitle(),
                "title", question.getTitle(),
                "secret", question.isSecret(),
                "answered", question.isAnswered(),
                "answer", question.getAnswer() == null ? "" : question.getAnswer(),
                "createdAt", question.getCreatedAt());
    }

    private Map<String, Object> noticeView(ContestNotice notice) {
        return Map.of(
                "id", notice.getId(),
                "contestId", notice.getContest().getId(),
                "contestTitle", notice.getContest().getTitle(),
                "title", notice.getTitle(),
                "pinned", notice.isPinned(),
                "createdAt", notice.getCreatedAt());
    }
}
