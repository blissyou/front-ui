import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  contestApi,
  type Application,
  type ApplicationFormField,
  type Contest,
  type ContestNotice,
  type Question,
} from "../services/api";
import { Empty, Loading, Section, SubmitButton } from "../components/UI";
import { useAuth } from "../auth/AuthProvider";
import { ContestTabs, type ContestTab } from "../components/ContestTabs";
import { NoticeBoard } from "../components/NoticeBoard";
import { ContentEditor } from "../components/ContentEditor";

type Feedback = { type: "success" | "error"; text: string } | null;

export function ContestPage() {
  const { contestId } = useParams();
  const [searchParams] = useSearchParams();
  const id = Number(contestId);
  const [contest, setContest] = useState<Contest>();
  const [notices, setNotices] = useState<ContestNotice[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [application, setApplication] = useState<Application | null>(null);
  const [formFields, setFormFields] = useState<ApplicationFormField[]>([]);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [questionWriteOpen, setQuestionWriteOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null,
  );
  const [longAnswers, setLongAnswers] = useState<Record<number, string>>({});
  const [activeTab, setActiveTab] = useState<ContestTab>(
    searchParams.get("tab") === "notices"
      ? "notices"
      : searchParams.get("tab") === "questions"
        ? "questions"
        : "apply",
  );
  const { member, loading: authLoading } = useAuth();

  const load = () =>
    Promise.all([
      contestApi.getContest(id),
      contestApi.getNotices(id),
      contestApi.getQuestions(id),
      contestApi.getApplicationForm(id),
      member
        ? contestApi.getMyApplication(id).catch(() => null)
        : Promise.resolve(null),
    ]).then(([contest, notices, questions, fields, myApplication]) => {
      setContest(contest);
      setNotices(notices);
      setQuestions(questions);
      setFormFields(fields);
      setApplication(myApplication);
    });
  useEffect(() => {
    load().catch(() => setMessage("대회 정보를 불러오지 못했습니다."));
  }, [id, member]);
  if (!contest) {
    return message ? (
      <main className="loading load-error">
        <p>{message}</p>
        <button className="btn outline" onClick={() => void load()}>
          다시 불러오기
        </button>
      </main>
    ) : (
      <Loading />
    );
  }

  const apply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const missingLongField = formFields.find(
      (field) =>
        field.fieldType === "LONG_TEXT" &&
        field.required &&
        !longAnswers[field.id]?.trim(),
    );
    if (missingLongField) {
      setFeedback({
        type: "error",
        text: `${missingLongField.label} 항목을 입력해 주세요.`,
      });
      return;
    }
    const missingFileField = formFields.find((field) => {
      if (field.fieldType !== "FILE" || !field.required) return false;
      const file = form.get(`file-${field.id}`);
      return !(file instanceof File) || file.size === 0;
    });
    if (missingFileField) {
      setFeedback({
        type: "error",
        text: `${missingFileField.label} 파일을 첨부해 주세요.`,
      });
      return;
    }
    const answers = Object.fromEntries(
      formFields
        .filter((field) => field.fieldType !== "FILE")
        .map((field) =>
          field.fieldType === "LONG_TEXT"
            ? [String(field.id), longAnswers[field.id] ?? ""]
            : [String(field.id), String(form.get(`field-${field.id}`) ?? "")],
        ),
    );
    const submission = new FormData();
    submission.append(
      "answers",
      new Blob([JSON.stringify({ answers })], { type: "application/json" }),
    );
    formFields
      .filter((field) => field.fieldType === "FILE")
      .forEach((field) => {
        const file = form.get(`file-${field.id}`);
        if (file instanceof File && file.size > 0) {
          submission.append(`file-${field.id}`, file);
        }
      });
    contestApi
      .applyWithFiles(id, submission)
      .then((result) => {
        setApplication(result);
        setFeedback({ type: "success", text: "참가 신청이 완료되었습니다." });
      })
      .catch((error: Error) =>
        setFeedback({
          type: "error",
          text: `참가 신청에 실패했습니다. ${error.message || "잠시 후 다시 시도해 주세요."}`,
        }),
      );
  };
  const ask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    contestApi
      .askQuestion(id, {
        title: String(form.get("title")),
        body: String(form.get("body")),
        secret: form.get("secret") === "on",
      })
      .then((question) => {
        formElement.reset();
        setQuestions((items) => [question, ...items]);
        setQuestionWriteOpen(false);
        setFeedback({ type: "success", text: "질문을 등록했습니다." });
      })
      .catch((error: Error) =>
        setFeedback({
          type: "error",
          text: `질문 등록에 실패했습니다. ${error.message || "로그인 상태를 확인해 주세요."}`,
        }),
      );
  };

  const faqQuestions = questions.filter((question) => question.faq);
  const participantQuestions = questions.filter((question) => !question.faq);
  const renderQuestionBoard = (items: Question[], emptyText: string) => (
    <div className="question-board">
      {items.map((question) => (
        <article
          className={`question-item ${selectedQuestion?.id === question.id ? "open" : ""}`}
          key={question.id}
        >
          <button
            className="question-row"
            type="button"
            aria-expanded={selectedQuestion?.id === question.id}
            onClick={() =>
              setSelectedQuestion((selected) =>
                selected?.id === question.id ? null : question,
              )
            }
          >
            <span className={question.answered ? "answered" : "waiting"}>
              {question.faq
                ? "FAQ"
                : question.answered
                  ? "답변 완료"
                  : "답변 대기"}
            </span>
            <strong>
              {question.secret ? "🔒 " : ""}
              {question.title}
            </strong>
            <time>{question.createdAt?.slice(0, 10) ?? "-"}</time>
            <span className="question-disclosure" aria-hidden="true">
              {selectedQuestion?.id === question.id ? "접기" : "내용 보기"}
            </span>
          </button>
          {selectedQuestion?.id === question.id && (
            <div className="question-panel">
              {question.body !== question.title && (
                <p className="question-modal-body">{question.body}</p>
              )}
              <section className="question-answer">
                <span>{question.answered ? "운영자 답변" : "답변 대기"}</span>
                <p>
                  {question.answered
                    ? question.answer
                    : "운영자의 답변을 기다리고 있습니다."}
                </p>
              </section>
            </div>
          )}
        </article>
      ))}
      {!items.length && <Empty text={emptyText} />}
    </div>
  );

  return (
    <main className="detail">
      <section className="detail-hero">
        <div>
          <Link className="public-back" to="/">
            ← 전체 대회
          </Link>
          <p className="eyebrow lime">
            THE CHALLENGE /{" "}
            {{
              OPEN: "모집 중",
              DRAFT: "준비 중",
              CLOSED: "모집 마감",
              FINISHED: "종료",
            }[contest.status] ?? contest.status}
          </p>
          <h1>{contest.title}</h1>
          <p>{contest.description}</p>
          <p>
            신청: {contest.applicationStartAt} — {contest.applicationEndAt}
          </p>
          <p>
            대회: {contest.startDate} — {contest.endDate}
          </p>
        </div>
      </section>
      {feedback && (
        <p
          className={feedback.type === "success" ? "success" : "error-message"}
        >
          {feedback.text}
        </p>
      )}
      <div className="contest-content">
        <ContestTabs activeTab={activeTab} onChange={setActiveTab} />
        {activeTab === "apply" && (
          <Section title="참가 신청">
            {authLoading ? (
              <Loading />
            ) : !member ? (
              <section className="admin-form application-guide">
                <h3>로그인 후 신청할 수 있습니다.</h3>
                <p>회원 정보로 참가 신청 내역을 안전하게 관리합니다.</p>
                <Link className="btn" to="/member">
                  로그인하기
                </Link>
              </section>
            ) : application ? (
              <section className="admin-form application-complete">
                <p className="eyebrow lime">APPLICATION COMPLETE</p>
                <h3>참가 신청이 접수되었습니다.</h3>
                <p>
                  신청 상태: <b>{application.status}</b>
                </p>
                <p>{application.introduction}</p>
                {application.attachments?.length > 0 && (
                  <div className="my-application-files">
                    <strong>제출한 파일</strong>
                    {application.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={`/api/contests/${id}/applications/me/attachments/${attachment.id}`}
                        download
                      >
                        <span>{attachment.fieldLabel}</span>
                        {attachment.fileName} ↓
                      </a>
                    ))}
                  </div>
                )}
              </section>
            ) : (
              <section className="admin-form">
                <form onSubmit={apply}>
                  {formFields.map((field) => (
                    <label className="full" key={field.id}>
                      <span className="field-label">
                        {field.required && (
                          <span className="required-badge">필수</span>
                        )}
                        {field.label}
                      </span>
                      {field.fieldType === "LONG_TEXT" ? (
                        <ContentEditor
                          value={longAnswers[field.id] ?? ""}
                          onChange={(value) =>
                            setLongAnswers((answers) => ({
                              ...answers,
                              [field.id]: value,
                            }))
                          }
                          placeholder="내용을 입력해 주세요."
                          title="상세 내용"
                          helper="줄바꿈으로 문단을 구분해 주세요."
                        />
                      ) : field.fieldType === "SELECT" ? (
                        <select
                          name={`field-${field.id}`}
                          required={field.required}
                          defaultValue=""
                        >
                          <option value="" disabled>
                            선택해 주세요.
                          </option>
                          {field.options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : field.fieldType === "FILE" ? (
                        <div className="application-file-field">
                          <input
                            className="application-file-input"
                            name={`file-${field.id}`}
                            type="file"
                            required={field.required}
                          />
                          <small>
                            파일 1개, 최대 10MB까지 첨부할 수 있습니다.
                          </small>
                        </div>
                      ) : field.fieldType === "YOUTUBE" ? (
                        <input
                          name={`field-${field.id}`}
                          type="url"
                          required={field.required}
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                      ) : (
                        <input
                          name={`field-${field.id}`}
                          required={field.required}
                          placeholder="내용을 입력해 주세요."
                        />
                      )}
                    </label>
                  ))}
                  <SubmitButton>참가 신청</SubmitButton>
                </form>
              </section>
            )}
          </Section>
        )}
        {activeTab === "notices" && (
          <Section title="공지사항">
            <NoticeBoard
              notices={notices}
              getNoticeUrl={(notice) => `/contests/${id}/notices/${notice.id}`}
            />
          </Section>
        )}
        {activeTab === "questions" && (
          <Section
            title="Q&A"
            action={
              <button
                className="btn primary"
                type="button"
                onClick={() => {
                  if (!member) {
                    setFeedback({
                      type: "error",
                      text: "로그인 후 질문을 작성할 수 있습니다.",
                    });
                    return;
                  }
                  setQuestionWriteOpen(true);
                }}
              >
                + 질문 작성
              </button>
            }
          >
            <div className="question-groups">
              <section className="question-group participant-question-group">
                <div className="question-group-title">
                  <div>
                    <h3>참가자 Q&A</h3>
                    <p>참가자가 직접 남긴 질문과 운영자 답변입니다.</p>
                  </div>
                  <span>{participantQuestions.length}개</span>
                </div>
                {renderQuestionBoard(
                  participantQuestions,
                  "등록된 참가자 질문이 없습니다.",
                )}
              </section>
              <section className="question-group faq-group">
                <div className="question-group-title">
                  <div>
                    <h3>자주 묻는 질문</h3>
                    <p>운영자가 정리한 대회 주요 안내입니다.</p>
                  </div>
                  <span>{faqQuestions.length}개</span>
                </div>
                {renderQuestionBoard(faqQuestions, "등록된 FAQ가 없습니다.")}
              </section>
            </div>
            {questionWriteOpen && (
              <div
                className="modal-backdrop"
                onMouseDown={() => setQuestionWriteOpen(false)}
              >
                <section
                  className="admin-form public-question-modal question-write-modal"
                  role="dialog"
                  aria-modal="true"
                  aria-label="질문 작성"
                  onMouseDown={(event) => event.stopPropagation()}
                >
                  <div className="modal-title">
                    <div>
                      <h3>질문 작성</h3>
                      <p>운영자가 확인 후 답변을 등록합니다.</p>
                    </div>
                    <button
                      className="modal-close"
                      type="button"
                      onClick={() => setQuestionWriteOpen(false)}
                    >
                      ×
                    </button>
                  </div>
                  <form onSubmit={ask}>
                    <label className="full">
                      제목
                      <input
                        name="title"
                        required
                        placeholder="질문 제목을 입력해 주세요."
                      />
                    </label>
                    <label className="full">
                      내용
                      <textarea
                        name="body"
                        required
                        placeholder="궁금한 내용을 작성해 주세요."
                      />
                    </label>
                    <label className="check">
                      <input name="secret" type="checkbox" /> 비밀글로 작성
                    </label>
                    <div className="modal-actions full">
                      <button
                        className="outline"
                        type="button"
                        onClick={() => setQuestionWriteOpen(false)}
                      >
                        취소
                      </button>
                      <SubmitButton>질문 등록</SubmitButton>
                    </div>
                  </form>
                </section>
              </div>
            )}
          </Section>
        )}
      </div>
    </main>
  );
}
