package com.example.highschoolswcontest.config;

import com.example.highschoolswcontest.entity.*;
import com.example.highschoolswcontest.global.PasswordHasher;
import com.example.highschoolswcontest.repository.*;
import java.time.LocalDate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.*;

@Configuration
public class PlatformSeedConfig {
  @Bean
  CommandLineRunner seedPlatform(
      UserRepository users,
      ContestRepository contests,
      ContestNoticeRepository notices,
      ApplicationRepository applications,
      QuestionRepository questions,
      ApplicationFormFieldRepository applicationFormFields) {
    return args -> {
      seedUser(
          users,
          "admin1234",
          "admin@contest.local",
          "ADMIN");
      User minji =
          seedUser(
              users,
              "participant1234",
              "minji@example.com",
              "USER");
      User junseo =
          seedUser(
              users,
              "participant1234",
              "junseo@example.com",
              "USER");
      User seoyun =
          seedUser(
              users,
              "participant1234",
              "seoyun@example.com",
              "USER");

      Contest contest =
          contests
              .findByTitle("2026 전국 고등학교 동아리 AI·SW 경진대회")
              .orElseGet(
                  () -> {
                    Contest seedContest = new Contest();
                    seedContest.setTitle("2026 전국 고등학교 동아리 AI·SW 경진대회");
                    seedContest.setDescription("전국 고등학교 동아리의 창의적인 AI·SW 프로젝트를 발굴하는 경진대회입니다.");
                    seedContest.setStatus("OPEN");
                    seedContest.setApplicationStartAt(LocalDate.of(2026, 9, 1));
                    seedContest.setApplicationEndAt(LocalDate.of(2026, 9, 30));
                    seedContest.setStartDate(LocalDate.of(2026, 10, 1));
                    seedContest.setEndDate(LocalDate.of(2026, 11, 30));
                    seedContest.setPublished(true);
                    return contests.save(seedContest);
                  });

      seedApplicationForm(applicationFormFields, contest);

      if (notices.count() < 3) {
        seedNotice(notices, contest, "참가 신청 기간 안내", "참가 신청은 9월 1일부터 9월 30일까지입니다.", true);
        seedNotice(notices, contest, "제출 형식 및 유의사항", "프로젝트 소개와 함께 실행 방법을 구체적으로 작성해 주세요.", false);
        seedNotice(notices, contest, "온라인 설명회 일정", "9월 8일 오후 7시에 온라인 설명회를 진행합니다.", false);
      }

      seedApplication(
          applications, contest, minji, "학교 생활 속 불편을 해결하는 AI 급식 알림 서비스를 제안합니다.", "SUBMITTED");
      seedApplication(
          applications, contest, junseo, "시각장애 학생도 쉽게 이용할 수 있는 음성 기반 학습 플래너를 만들었습니다.", "APPROVED");
      seedApplication(
          applications, contest, seoyun, "교내 분리수거 참여를 높이는 게임형 환경 실천 앱을 기획했습니다.", "REJECTED");

      if (questions.count() == 0) {
        seedQuestion(questions, contest, minji, "개인 참가도 가능한가요?", "개인 참가와 팀 참가 모두 가능합니다.");
        seedQuestion(questions, contest, junseo, "결과물 제출 방식", "결과물 제출 방식은 추후 공지로 안내됩니다.");
      }
    };
  }

  private User seedUser(
      UserRepository users,
      String password,
      String email,
      String role) {
    return users
        .findByEmail(email)
        .orElseGet(
            () -> {
              User user = new User();
              user.setPasswordHash(PasswordHasher.hash(password));
              user.setEmail(email);
              user.setRole(role);
              return users.save(user);
            });
  }

  private void seedApplication(
      ApplicationRepository applications,
      Contest contest,
      User applicant,
      String introduction,
      String status) {
    if (applications
        .findByContestIdAndApplicantId(contest.getId(), applicant.getId())
        .isPresent()) {
      return;
    }
    Application application = new Application();
    application.setContest(contest);
    application.setApplicant(applicant);
    application.setIntroduction(introduction);
    application.setStatus(status);
    applications.save(application);
  }

  private void seedNotice(
      ContestNoticeRepository notices, Contest contest, String title, String body, boolean pinned) {
    ContestNotice notice = new ContestNotice();
    notice.setContest(contest);
    notice.setTitle(title);
    notice.setSlug(title.replaceAll("\\s+", "-") + "-" + System.nanoTime());
    notice.setBody(body);
    notice.setPinned(pinned);
    notice.setPublished(true);
    notices.save(notice);
  }

  private void seedApplicationForm(
      ApplicationFormFieldRepository applicationFormFields, Contest contest) {
    if (!applicationFormFields.findByContestIdOrderBySortOrderAscIdAsc(contest.getId()).isEmpty()) {
      return;
    }
    seedFormField(applicationFormFields, contest, "프로젝트 또는 아이디어 이름", "SHORT_TEXT", true, null, 1);
    seedFormField(applicationFormFields, contest, "프로젝트 또는 아이디어 소개", "LONG_TEXT", true, null, 2);
    seedFormField(applicationFormFields, contest, "참가 형태", "SELECT", true, "개인 참가,팀 참가", 3);
    seedFormField(applicationFormFields, contest, "기대하는 점", "LONG_TEXT", false, null, 4);
  }

  private void seedFormField(
      ApplicationFormFieldRepository applicationFormFields,
      Contest contest,
      String label,
      String fieldType,
      boolean required,
      String optionsText,
      int sortOrder) {
    ApplicationFormField field = new ApplicationFormField();
    field.setContest(contest);
    field.setLabel(label);
    field.setFieldType(fieldType);
    field.setRequired(required);
    field.setOptionsText(optionsText);
    field.setSortOrder(sortOrder);
    applicationFormFields.save(field);
  }

  private void seedQuestion(
      QuestionRepository questions, Contest contest, User author, String title, String answer) {
    Question question = new Question();
    question.setContest(contest);
    question.setAuthor(author);
    question.setTitle(title);
    question.setBody(title);
    question.setAnswer(answer);
    question.setAnswered(true);
    question.setFaq(true);
    questions.save(question);
  }
}
