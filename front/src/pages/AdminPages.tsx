import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Settings2 } from "lucide-react";
import {
  adminApi,
  contestApi,
  type AdminApplication,
  type ApplicationFormField,
  type AdminUser,
  type Contest,
  type ContestNotice,
  type Question,
} from "../services/api";
import { Empty, Loading, SubmitButton } from "../components/UI";
import { ContentEditor } from "../components/ContentEditor";
import { NoticeBoard } from "../components/NoticeBoard";

type Feedback = { type: "success" | "error"; text: string } | null;
type DraftField = {
  label: string;
  fieldType: ApplicationFormField["fieldType"];
  required: boolean;
  optionsText: string;
};

const emptyDraftField: DraftField = {
  label: "",
  fieldType: "SHORT_TEXT",
  required: false,
  optionsText: "",
};

function ApplicationFormPreview({
  fields,
  draft,
  onChangeDraft,
  onAdd,
  onRemove,
  questionModalOpen,
  onOpenQuestionModal,
  onCloseQuestionModal,
}: {
  fields: ApplicationFormField[];
  draft: DraftField;
  onChangeDraft: (updater: (field: DraftField) => DraftField) => void;
  onAdd: (event: FormEvent<HTMLFormElement>) => void;
  onRemove: (field: ApplicationFormField) => void;
  questionModalOpen: boolean;
  onOpenQuestionModal: () => void;
  onCloseQuestionModal: () => void;
}) {
  const previewFields =
    questionModalOpen && draft.label.trim()
      ? [
          ...fields,
          {
            id: -1,
            label: draft.label,
            fieldType: draft.fieldType,
            required: draft.required,
            options: draft.optionsText
              .split(/\r?\n|,/)
              .map((option) => option.trim())
              .filter(Boolean),
            sortOrder: fields.length + 1,
          },
        ]
      : fields;

  return (
    <section className="application-form-preview">
      <header className="form-preview-header">
        <div>
          <p className="eyebrow">참가 신청서</p>
          <h3>참가자가 보는 신청서</h3>
          <span>질문을 추가하면 아래 신청서에 바로 반영됩니다.</span>
        </div>
        <div className="form-preview-actions">
          <b>{fields.length}개 질문</b>
          <button
            className="btn primary"
            type="button"
            onClick={onOpenQuestionModal}
          >
            + 질문 추가
          </button>
        </div>
      </header>
      <div className="preview-paper">
        {previewFields.map((field) => (
          <section className="preview-question" key={field.id}>
            <div className="preview-question-title">
              <label>
                <span className="field-label">
                  {field.required && (
                    <span className="required-badge">필수</span>
                  )}
                  {field.label}
                </span>
              </label>
              <small>
                {field.fieldType === "SHORT_TEXT"
                  ? "짧은 답변"
                  : field.fieldType === "LONG_TEXT"
                    ? "긴 답변"
                    : field.fieldType === "SELECT"
                      ? "선택형"
                      : field.fieldType === "FILE"
                        ? "파일 첨부"
                        : "유튜브 영상"}
              </small>
              {field.id > 0 && (
                <button type="button" onClick={() => onRemove(field)}>
                  삭제
                </button>
              )}
            </div>
            {field.fieldType === "LONG_TEXT" ? (
              <textarea disabled placeholder="참가자가 내용을 입력합니다." />
            ) : field.fieldType === "SELECT" ? (
              <select disabled defaultValue="">
                <option value="" disabled>
                  선택해 주세요.
                </option>
                {(field.options ?? field.optionsText?.split(/\r?\n|,/) ?? [])
                  .map((option) => option.trim())
                  .filter(Boolean)
                  .map((option) => (
                    <option key={option}>{option}</option>
                  ))}
              </select>
            ) : field.fieldType === "FILE" ? (
              <div className="preview-file-input">
                <span>파일 선택</span>
                <small>최대 10MB</small>
              </div>
            ) : field.fieldType === "YOUTUBE" ? (
              <div className="preview-youtube-input">
                <span>▶</span>
                <p>유튜브 영상 주소를 입력합니다.</p>
              </div>
            ) : (
              <input disabled placeholder="참가자가 내용을 입력합니다." />
            )}
          </section>
        ))}
        {!previewFields.length && (
          <p className="preview-empty">
            질문 추가 버튼을 눌러 신청서를 만들어 보세요.
          </p>
        )}
      </div>
      {questionModalOpen && (
        <div className="modal-backdrop" onMouseDown={onCloseQuestionModal}>
          <form
            className="admin-form question-modal"
            onSubmit={onAdd}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-title">
              <div>
                <h3>새 질문 추가</h3>
                <p>저장하면 참가자 신청서에 바로 반영됩니다.</p>
              </div>
              <button
                className="modal-close"
                type="button"
                onClick={onCloseQuestionModal}
              >
                ×
              </button>
            </div>
            <label className="full">
              질문
              <input
                required
                value={draft.label}
                onChange={(event) =>
                  onChangeDraft((field) => ({
                    ...field,
                    label: event.target.value,
                  }))
                }
                placeholder="예: 프로젝트 또는 아이디어를 소개해 주세요."
              />
            </label>
            <label>
              입력 방식
              <select
                value={draft.fieldType}
                onChange={(event) =>
                  onChangeDraft((field) => ({
                    ...field,
                    fieldType: event.target.value as DraftField["fieldType"],
                  }))
                }
              >
                <option value="SHORT_TEXT">한 줄 입력</option>
                <option value="LONG_TEXT">긴 글 입력</option>
                <option value="SELECT">선택형</option>
                <option value="FILE">파일 업로드</option>
                <option value="YOUTUBE">유튜브 영상</option>
              </select>
            </label>
            <label className="check modal-check">
              <input
                type="checkbox"
                checked={draft.required}
                onChange={(event) =>
                  onChangeDraft((field) => ({
                    ...field,
                    required: event.target.checked,
                  }))
                }
              />
              필수 응답
            </label>
            {draft.fieldType === "SELECT" && (
              <label className="full">
                선택지
                <input
                  value={draft.optionsText}
                  onChange={(event) =>
                    onChangeDraft((field) => ({
                      ...field,
                      optionsText: event.target.value,
                    }))
                  }
                  placeholder="예: 개인, 팀 (쉼표 또는 줄바꿈으로 구분)"
                />
              </label>
            )}
            <div className="modal-actions full">
              <button
                className="outline"
                type="button"
                onClick={onCloseQuestionModal}
              >
                취소
              </button>
              <button className="btn primary" type="submit">
                질문 추가
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function Message({ value }: { value: Feedback }) {
  if (!value) return null;
  return (
    <p className={value.type === "success" ? "success" : "error-message"}>
      {value.text}
    </p>
  );
}

export function Dashboard() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [unansweredQuestions, setUnansweredQuestions] = useState<
    Array<{ contestId: number; question: Question }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.getContests(),
      adminApi.getApplications(),
      adminApi.getUsers(),
    ])
      .then(async ([contestItems, applicationItems, userItems]) => {
        const questionGroups = await Promise.all(
          contestItems.map(async (contest) => ({
            contestId: contest.id,
            questions: await adminApi.getQuestions(contest.id).catch(() => []),
          })),
        );
        setContests(contestItems);
        setApplications(applicationItems);
        setUsers(userItems);
        setUnansweredQuestions(
          questionGroups.flatMap(({ contestId, questions }) =>
            questions
              .filter((question) => !question.answered)
              .map((question) => ({ contestId, question })),
          ),
        );
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const activeContests = contests.filter(
    (contest) => contest.status === "OPEN",
  );
  const pendingApplications = applications.filter(
    (application) => application.status === "SUBMITTED",
  );
  const nearestDeadline = activeContests
    .filter((contest) => contest.applicationEndAt)
    .sort((left, right) =>
      left.applicationEndAt.localeCompare(right.applicationEndAt),
    )[0];

  return (
    <div className="dashboard">
      <div className="metric-grid dashboard-metrics">
        <article>
          <small>진행 중 대회</small>
          <b>{activeContests.length}</b>
          <span>현재 접수 또는 운영 중</span>
        </article>
        <article>
          <small>승인 대기 신청</small>
          <b>{pendingApplications.length}</b>
          <span>운영자 확인 필요</span>
        </article>
        <article>
          <small>미답변 Q&A</small>
          <b>{unansweredQuestions.length}</b>
          <span>참가자 답변 대기</span>
        </article>
        <article>
          <small>전체 사용자</small>
          <b>{users.length}</b>
          <span>가입 회원 기준</span>
        </article>
      </div>

      <div className="dashboard-workspace">
        <section className="dashboard-panel priority-panel">
          <div className="panel-title">
            <div>
              <p className="eyebrow">PRIORITY</p>
              <h3>지금 처리할 일</h3>
            </div>
          </div>
          <div className="priority-list">
            <Link to="/admin/applications">
              <span className="priority-icon coral">01</span>
              <div>
                <b>승인 대기 참가 신청</b>
                <small>
                  {pendingApplications.length}건의 신청서를 확인해 주세요.
                </small>
              </div>
              <strong>{pendingApplications.length}건 →</strong>
            </Link>
            <Link
              to={
                unansweredQuestions[0]
                  ? `/admin/competitions/${unansweredQuestions[0].contestId}`
                  : "/admin/competitions"
              }
            >
              <span className="priority-icon cyan">02</span>
              <div>
                <b>답변 대기 Q&A</b>
                <small>대회별 Q&A 관리 탭에서 답변을 등록할 수 있습니다.</small>
              </div>
              <strong>{unansweredQuestions.length}건 →</strong>
            </Link>
            <Link to="/admin/competitions">
              <span className="priority-icon lime">03</span>
              <div>
                <b>가장 가까운 신청 마감</b>
                <small>
                  {nearestDeadline
                    ? `${nearestDeadline.title} · ${nearestDeadline.applicationEndAt}`
                    : "진행 중인 대회의 신청 마감일이 없습니다."}
                </small>
              </div>
              <strong>{nearestDeadline ? "확인 →" : "-"}</strong>
            </Link>
          </div>
        </section>

        <section className="dashboard-panel recent-panel">
          <div className="panel-title">
            <div>
              <p className="eyebrow">LATEST</p>
              <h3>최근 참가 신청</h3>
            </div>
            <Link to="/admin/applications">전체 보기 →</Link>
          </div>
          {applications.slice(0, 4).map((application) => (
            <Link
              className="recent-application"
              key={application.id}
              to={`/admin/competitions/${application.contestId}/applications/${application.id}`}
            >
              <span>
                {application.applicant.email.slice(0, 1).toUpperCase()}
              </span>
              <div>
                <b>{application.applicant.email}</b>
                <small>{application.contestTitle}</small>
              </div>
              <em>
                {application.status === "SUBMITTED"
                  ? "접수"
                  : application.status}
              </em>
            </Link>
          ))}
          {!applications.length && <Empty text="최근 참가 신청이 없습니다." />}
        </section>
      </div>
    </div>
  );
}

export function UsersAdmin() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<Feedback>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    adminApi
      .getUsers()
      .then(setUsers)
      .catch((error: Error) =>
        setMessage({
          type: "error",
          text: `사용자 목록을 불러오지 못했습니다. ${error.message}`,
        }),
      )
      .finally(() => setLoading(false));
  }, []);

  const changeRole = (user: AdminUser, role: AdminUser["role"]) => {
    adminApi
      .updateUserRole(user.id, role)
      .then((updated) => {
        setUsers((items) =>
          items.map((item) => (item.id === updated.id ? updated : item)),
        );
        setMessage({
          type: "success",
          text: `${updated.email} 계정의 권한을 변경했습니다.`,
        });
      })
      .catch((error: Error) =>
        setMessage({
          type: "error",
          text: `권한 변경에 실패했습니다. ${error.message}`,
        }),
      );
  };

  const normalizedQuery = query.trim().toLowerCase();
  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(normalizedQuery),
  );

  return (
    <section>
      <div className="manage-title">
        <div>
          <h2>사용자 관리</h2>
          <span>가입한 회원을 확인하고 운영자 권한을 관리합니다.</span>
        </div>
      </div>
      <Message value={message} />
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="user-search">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="이메일로 검색"
              aria-label="사용자 검색"
            />
            <b>
              {normalizedQuery
                ? `${filteredUsers.length}명 검색됨`
                : `전체 ${users.length}명`}
            </b>
          </div>
          <div className="user-admin-table">
            <div className="user-admin-head" aria-hidden="true">
              <span>사용자</span>
              <span>계정 구분</span>
              <span>가입일</span>
              <span>권한</span>
            </div>
            {filteredUsers.map((user) => (
              <article key={user.id}>
                <div className="user-admin-primary">
                  <i>{user.email.slice(0, 1).toUpperCase()}</i>
                  <div>
                    <b>{user.email}</b>
                  </div>
                </div>
                <span>
                  {user.role === "ADMIN" ? "운영자 계정" : "참가자 계정"}
                </span>
                <time>{user.createdAt?.slice(0, 10) ?? "-"}</time>
                <select
                  value={user.role}
                  onChange={(event) =>
                    changeRole(user, event.target.value as AdminUser["role"])
                  }
                >
                  <option value="USER">일반 회원</option>
                  <option value="ADMIN">운영자</option>
                </select>
              </article>
            ))}
            {!filteredUsers.length && (
              <Empty
                text={
                  normalizedQuery
                    ? "검색 결과가 없습니다."
                    : "가입한 사용자가 없습니다."
                }
              />
            )}
          </div>
        </>
      )}
    </section>
  );
}

export function CompetitionsAdmin() {
  const [message, setMessage] = useState<Feedback>(null);
  const [contests, setContests] = useState<Contest[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingContest, setEditingContest] = useState<Contest | null>(null);
  const [openSettingsId, setOpenSettingsId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    adminApi
      .getContests()
      .then(setContests)
      .catch(() => undefined);
  }, []);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const form = event.currentTarget;
    setMessage(null);
    const fields = new FormData(form);
    setSubmitting(true);

    try {
      const payload = {
        title: String(fields.get("title")),
        description: String(fields.get("description")),
        status: String(fields.get("status")),
        applicationStartAt: String(fields.get("applicationStartAt")),
        applicationEndAt: String(fields.get("applicationEndAt")),
        startDate: String(fields.get("startDate")),
        endDate: String(fields.get("endDate")),
        published: true,
      };
      const contest = editingContest
        ? await adminApi.updateContest(editingContest.id, payload)
        : await adminApi.createContest(payload);
      form.reset();
      setContests((items) =>
        editingContest
          ? items.map((item) => (item.id === contest.id ? contest : item))
          : [...items, contest],
      );
      setMessage({
        type: "success",
        text: editingContest
          ? "대회 정보를 수정했습니다."
          : "대회를 등록했습니다.",
      });
      setCreateOpen(false);
      setEditingContest(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "잠시 후 다시 시도해 주세요.";
      setMessage({
        type: "error",
        text: `대회 등록에 실패했습니다. ${message}`,
      });
    } finally {
      setSubmitting(false);
    }
  };
  const closeModal = () => {
    if (submitting) return;
    setCreateOpen(false);
    setEditingContest(null);
  };
  const finishContest = async (contest: Contest) => {
    if (
      !window.confirm(
        `“${contest.title}” 대회를 종료할까요?\n종료 후에는 참가 신청을 받을 수 없습니다.`,
      )
    )
      return;
    try {
      const updated = await adminApi.finishContest(contest.id);
      setContests((items) =>
        items.map((item) => (item.id === updated.id ? updated : item)),
      );
      setOpenSettingsId(null);
      setMessage({ type: "success", text: "대회를 종료했습니다." });
    } catch (error) {
      setMessage({
        type: "error",
        text: `대회 종료에 실패했습니다. ${error instanceof Error ? error.message : ""}`,
      });
    }
  };
  const deleteContest = async (contest: Contest) => {
    if (
      !window.confirm(
        `“${contest.title}” 대회를 삭제할까요?\n공지, 신청서, 참가 신청, Q&A도 함께 삭제되며 되돌릴 수 없습니다.`,
      )
    )
      return;
    try {
      await adminApi.deleteContest(contest.id);
      setContests((items) => items.filter((item) => item.id !== contest.id));
      setOpenSettingsId(null);
      setMessage({ type: "success", text: "대회를 삭제했습니다." });
    } catch (error) {
      setMessage({
        type: "error",
        text: `대회 삭제에 실패했습니다. ${error instanceof Error ? error.message : ""}`,
      });
    }
  };
  return (
    <section>
      <div className="manage-title competition-list-title">
        <div>
          <h2>대회 관리</h2>
          <span>대회별 공지사항, 참가 신청서, 접수 내역을 관리합니다.</span>
        </div>
        <button className="btn primary" onClick={() => setCreateOpen(true)}>
          + 대회 등록
        </button>
      </div>
      <Message value={message} />
      <div className="competition-admin-list">
        {contests.map((contest) => (
          <article key={contest.id}>
            <Link to={`/admin/competitions/${contest.id}`}>
              <span>{contest.status}</span>
              <b>{contest.title}</b>
              <small>대회 관리 열기 →</small>
            </Link>
            <div
              className="competition-actions"
              aria-label={`${contest.title} 관리`}
            >
              <button
                className="settings-toggle"
                type="button"
                aria-label={`${contest.title} 설정 ${openSettingsId === contest.id ? "닫기" : "열기"}`}
                aria-expanded={openSettingsId === contest.id}
                onClick={() =>
                  setOpenSettingsId((openId) =>
                    openId === contest.id ? null : contest.id,
                  )
                }
              >
                <Settings2 size={20} aria-hidden="true" />
              </button>
              {openSettingsId === contest.id && (
                <div className="competition-settings-menu" role="menu">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setEditingContest(contest);
                      setOpenSettingsId(null);
                    }}
                  >
                    정보 수정
                  </button>
                  {contest.status !== "FINISHED" && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => void finishContest(contest)}
                    >
                      대회 종료
                    </button>
                  )}
                  <button
                    className="danger"
                    type="button"
                    role="menuitem"
                    onClick={() => void deleteContest(contest)}
                  >
                    대회 삭제
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
      {(createOpen || editingContest) && (
        <div className="modal-backdrop">
          <section
            className="admin-form competition-modal"
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-title">
              <h3>{editingContest ? "대회 정보 수정" : "대회 등록"}</h3>
              <button
                className="modal-close"
                type="button"
                onClick={closeModal}
              >
                ×
              </button>
            </div>
            <form key={editingContest?.id ?? "new"} onSubmit={submit}>
              <label className="full">
                대회명
                <input
                  name="title"
                  required
                  defaultValue={editingContest?.title}
                />
              </label>
              <label className="full">
                설명
                <textarea
                  name="description"
                  required
                  defaultValue={editingContest?.description}
                />
              </label>
              <label>
                상태
                <select
                  name="status"
                  defaultValue={editingContest?.status ?? "OPEN"}
                >
                  <option value="OPEN">진행중</option>
                  <option value="DRAFT">준비중</option>
                  <option value="CLOSED">마감</option>
                </select>
              </label>
              <label>
                신청 시작일
                <input
                  name="applicationStartAt"
                  type="date"
                  required
                  defaultValue={editingContest?.applicationStartAt}
                />
              </label>
              <label>
                신청 마감일
                <input
                  name="applicationEndAt"
                  type="date"
                  required
                  defaultValue={editingContest?.applicationEndAt}
                />
              </label>
              <label>
                대회 시작일
                <input
                  name="startDate"
                  type="date"
                  required
                  defaultValue={editingContest?.startDate}
                />
              </label>
              <label>
                대회 종료일
                <input
                  name="endDate"
                  type="date"
                  required
                  defaultValue={editingContest?.endDate}
                />
              </label>
              <SubmitButton disabled={submitting}>
                {submitting
                  ? "저장 중..."
                  : editingContest
                    ? "수정 저장"
                    : "대회 등록"}
              </SubmitButton>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}

export function ApplicationFormAdmin({
  embedded = false,
  fixedContestId,
}: {
  embedded?: boolean;
  fixedContestId?: number;
}) {
  const [contests, setContests] = useState<Contest[]>([]);
  const [contestId, setContestId] = useState(
    fixedContestId ? String(fixedContestId) : "",
  );
  const [fields, setFields] = useState<ApplicationFormField[]>([]);
  const [message, setMessage] = useState<Feedback>(null);
  const [draft, setDraft] = useState<DraftField>(emptyDraftField);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);

  useEffect(() => {
    adminApi
      .getContests()
      .then((items) => {
        setContests(items);
        if (!fixedContestId && items[0]) setContestId(String(items[0].id));
      })
      .catch(() =>
        setMessage({ type: "error", text: "대회 목록을 불러오지 못했습니다." }),
      );
  }, [fixedContestId]);

  useEffect(() => {
    if (!contestId) return;
    adminApi
      .getApplicationForm(Number(contestId))
      .then(setFields)
      .catch(() =>
        setMessage({
          type: "error",
          text: "신청서 항목을 불러오지 못했습니다.",
        }),
      );
  }, [contestId]);

  const addField = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    adminApi
      .createApplicationFormField(Number(contestId), {
        label: draft.label,
        fieldType: draft.fieldType,
        required: draft.required,
        optionsText: draft.optionsText,
      })
      .then((field) => {
        setFields((items) => [...items, field]);
        setDraft(emptyDraftField);
        setQuestionModalOpen(false);
        setMessage({ type: "success", text: "신청서 질문을 추가했습니다." });
      })
      .catch((error: Error) =>
        setMessage({
          type: "error",
          text: `질문 추가에 실패했습니다. ${error.message}`,
        }),
      );
  };

  const removeField = (field: ApplicationFormField) => {
    adminApi
      .deleteApplicationFormField(Number(contestId), field.id)
      .then(() => {
        setFields((items) => items.filter((item) => item.id !== field.id));
        setMessage({ type: "success", text: "신청서 질문을 삭제했습니다." });
      })
      .catch((error: Error) =>
        setMessage({
          type: "error",
          text: `질문 삭제에 실패했습니다. ${error.message}`,
        }),
      );
  };

  return (
    <section>
      {!embedded && (
        <div className="manage-title">
          <h2>참가 신청서 양식</h2>
          <span>대회별로 참가자에게 받을 질문을 구성합니다.</span>
        </div>
      )}
      <Message value={message} />
      {!fixedContestId && (
        <section className="admin-form form-contest-picker">
          <label>
            대상 대회
            <select
              value={contestId}
              onChange={(event) => setContestId(event.target.value)}
            >
              {contests.map((contest) => (
                <option key={contest.id} value={contest.id}>
                  {contest.title}
                </option>
              ))}
            </select>
          </label>
        </section>
      )}
      <ApplicationFormPreview
        fields={fields}
        draft={draft}
        onChangeDraft={setDraft}
        onAdd={addField}
        onRemove={removeField}
        questionModalOpen={questionModalOpen}
        onOpenQuestionModal={() => setQuestionModalOpen(true)}
        onCloseQuestionModal={() => {
          setDraft(emptyDraftField);
          setQuestionModalOpen(false);
        }}
      />
    </section>
  );
}

export function QuestionsAdmin({ fixedContestId }: { fixedContestId: number }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<Feedback>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null,
  );
  const [answer, setAnswer] = useState("");
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [faqDraft, setFaqDraft] = useState({ title: "", body: "", answer: "" });

  useEffect(() => {
    adminApi
      .getQuestions(fixedContestId)
      .then(setQuestions)
      .catch(() =>
        setMessage({ type: "error", text: "Q&A 목록을 불러오지 못했습니다." }),
      )
      .finally(() => setLoading(false));
  }, [fixedContestId]);

  const openQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setAnswer(question.answer ?? "");
  };

  const submitAnswer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedQuestion || !answer.trim()) {
      setMessage({ type: "error", text: "답변 내용을 입력해 주세요." });
      return;
    }
    adminApi
      .answerQuestion(fixedContestId, selectedQuestion.id, answer.trim())
      .then((result) => {
        setQuestions((items) =>
          items.map((item) =>
            item.id === result.id
              ? { ...item, answered: result.answered, answer: result.answer }
              : item,
          ),
        );
        setSelectedQuestion(null);
        setMessage({ type: "success", text: "답변을 저장했습니다." });
      })
      .catch((error: Error) =>
        setMessage({
          type: "error",
          text: `답변 저장에 실패했습니다. ${error.message}`,
        }),
      );
  };

  const submitFaq = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = faqDraft.title.trim();
    const answerText = faqDraft.answer.trim();
    if (!title || !answerText) {
      setMessage({ type: "error", text: "FAQ 질문과 답변을 입력해 주세요." });
      return;
    }
    adminApi
      .createFaq(fixedContestId, {
        title,
        body: faqDraft.body.trim() || title,
        answer: answerText,
      })
      .then((faq) => {
        setQuestions((items) => [faq, ...items]);
        setFaqDraft({ title: "", body: "", answer: "" });
        setFaqModalOpen(false);
        setMessage({ type: "success", text: "FAQ를 등록했습니다." });
      })
      .catch((error: Error) =>
        setMessage({
          type: "error",
          text: `FAQ 등록에 실패했습니다. ${error.message}`,
        }),
      );
  };

  const faqQuestions = questions.filter((question) => question.faq);
  const participantQuestions = questions.filter((question) => !question.faq);

  const renderAdminQuestionBoard = (items: Question[], emptyText: string) =>
    items.length ? (
      <div className="admin-question-board">
        <div className="admin-question-head" aria-hidden="true">
          <span>상태</span>
          <span>질문</span>
          <span>등록일</span>
        </div>
        {items.map((question) => (
          <button
            key={question.id}
            type="button"
            onClick={() => openQuestion(question)}
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
          </button>
        ))}
      </div>
    ) : (
      <Empty text={emptyText} />
    );

  return (
    <section className="questions-admin">
      <div className="manage-title notice-manage-title">
        <div>
          <h3>Q&A 관리</h3>
          <span>FAQ와 참가자가 남긴 문의를 구분해 관리합니다.</span>
        </div>
        <button
          className="btn primary"
          type="button"
          onClick={() => setFaqModalOpen(true)}
        >
          + FAQ 등록
        </button>
      </div>
      <Message value={message} />
      {loading ? (
        <Loading />
      ) : (
        <div className="admin-question-groups">
          <section>
            <div className="admin-question-section-title">
              <div>
                <h4>참가자 Q&A</h4>
                <p>참가자가 남긴 질문과 답변 처리 현황</p>
              </div>
              <span>{participantQuestions.length}개</span>
            </div>
            {renderAdminQuestionBoard(
              participantQuestions,
              "등록된 참가자 질문이 없습니다.",
            )}
          </section>
          <section>
            <div className="admin-question-section-title">
              <div>
                <h4>자주 묻는 질문</h4>
                <p>운영자가 직접 등록한 공식 안내</p>
              </div>
              <span>{faqQuestions.length}개</span>
            </div>
            {renderAdminQuestionBoard(faqQuestions, "등록된 FAQ가 없습니다.")}
          </section>
        </div>
      )}
      {faqModalOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={() => setFaqModalOpen(false)}
        >
          <section
            className="admin-form question-answer-modal faq-create-modal"
            role="dialog"
            aria-modal="true"
            aria-label="FAQ 등록"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-title">
              <div>
                <p className="eyebrow">OFFICIAL FAQ</p>
                <h3>자주 묻는 질문 등록</h3>
              </div>
              <button
                className="modal-close"
                type="button"
                onClick={() => setFaqModalOpen(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={submitFaq}>
              <label className="full">
                질문
                <input
                  value={faqDraft.title}
                  onChange={(event) =>
                    setFaqDraft((draft) => ({
                      ...draft,
                      title: event.target.value,
                    }))
                  }
                  placeholder="참가자가 자주 묻는 질문을 입력해 주세요."
                />
              </label>
              <label className="full">
                질문 설명 <small>(선택)</small>
                <textarea
                  value={faqDraft.body}
                  onChange={(event) =>
                    setFaqDraft((draft) => ({
                      ...draft,
                      body: event.target.value,
                    }))
                  }
                  placeholder="추가로 설명할 내용이 있다면 입력해 주세요."
                />
              </label>
              <label className="full">
                운영자 답변
                <ContentEditor
                  value={faqDraft.answer}
                  onChange={(value) =>
                    setFaqDraft((draft) => ({ ...draft, answer: value }))
                  }
                  placeholder="공식 답변을 작성해 주세요."
                />
              </label>
              <div className="modal-actions full">
                <button
                  className="outline"
                  type="button"
                  onClick={() => setFaqModalOpen(false)}
                >
                  취소
                </button>
                <SubmitButton>FAQ 등록</SubmitButton>
              </div>
            </form>
          </section>
        </div>
      )}
      {selectedQuestion && (
        <div
          className="modal-backdrop"
          onMouseDown={() => setSelectedQuestion(null)}
        >
          <section
            className="admin-form question-answer-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Q&A 답변"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-title">
              <div>
                <p className="eyebrow">
                  {selectedQuestion.answered
                    ? "ANSWERED QUESTION"
                    : "NEW QUESTION"}
                </p>
                <h3>{selectedQuestion.title}</h3>
              </div>
              <button
                className="modal-close"
                type="button"
                onClick={() => setSelectedQuestion(null)}
              >
                ×
              </button>
            </div>
            <section className="question-request">
              <b>질문 내용</b>
              <p>{selectedQuestion.body}</p>
            </section>
            <form onSubmit={submitAnswer}>
              <label className="full">
                답변
                <ContentEditor
                  value={answer}
                  onChange={setAnswer}
                  placeholder="참가자에게 전달할 답변을 작성해 주세요."
                />
              </label>
              <div className="modal-actions full">
                <button
                  className="outline"
                  type="button"
                  onClick={() => setSelectedQuestion(null)}
                >
                  취소
                </button>
                <SubmitButton>
                  {selectedQuestion.answered ? "답변 수정" : "답변 등록"}
                </SubmitButton>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}

const applicationStatusLabel: Record<string, string> = {
  SUBMITTED: "접수",
  REJECTED: "반려",
  APPROVED: "승인",
};

const applicationStatusOrder: Record<string, number> = {
  SUBMITTED: 0,
  REJECTED: 1,
  APPROVED: 2,
};

export function ApplicationsAdmin({
  fixedContestId,
}: {
  fixedContestId?: number;
} = {}) {
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<Feedback>(null);

  const load = () => {
    setLoading(true);
    adminApi
      .getApplications()
      .then((items) =>
        setApplications(
          fixedContestId
            ? items.filter((item) => item.contestId === fixedContestId)
            : items,
        ),
      )
      .catch((error: Error) =>
        setMessage({
          type: "error",
          text: `참가 신청을 불러오지 못했습니다. ${error.message}`,
        }),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [fixedContestId]);

  const orderedApplications = [...applications].sort(
    (left, right) =>
      (applicationStatusOrder[left.status] ?? 99) -
        (applicationStatusOrder[right.status] ?? 99) ||
      right.submittedAt.localeCompare(left.submittedAt),
  );

  const changeStatus = (application: AdminApplication, status: string) => {
    setMessage(null);
    adminApi
      .updateApplicationStatus(application.contestId, application.id, status)
      .then(() => {
        setApplications((items) =>
          items.map((item) =>
            item.id === application.id ? { ...item, status } : item,
          ),
        );
        setMessage({ type: "success", text: "신청 상태를 변경했습니다." });
      })
      .catch((error: Error) =>
        setMessage({
          type: "error",
          text: `상태 변경에 실패했습니다. ${error.message}`,
        }),
      );
  };

  return (
    <section className="applications-admin">
      <div className="manage-title">
        <h2>참가 신청 관리</h2>
      </div>
      <Message value={message} />
      {loading ? (
        <Loading />
      ) : !applications.length ? (
        <Empty text="접수된 참가 신청이 없습니다." />
      ) : (
        <div className="application-admin-list">
          {orderedApplications.map((application) => (
            <article className="application-list-row" key={application.id}>
              <div className="application-applicant-summary">
                {!fixedContestId && <p>{application.contestTitle}</p>}
                <h3>{application.applicant.email}</h3>
              </div>
              <div className="application-row-actions">
                <label>
                  <span>처리 상태</span>
                  <select
                    aria-label={`${application.applicant.email} 신청 상태`}
                    value={application.status}
                    onChange={(event) =>
                      changeStatus(application, event.target.value)
                    }
                  >
                    {Object.entries(applicationStatusLabel).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ),
                    )}
                  </select>
                </label>
                <Link
                  className="application-view-button"
                  to={`/admin/competitions/${application.contestId}/applications/${application.id}`}
                >
                  신청서 보기 <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function CompetitionDetailAdmin() {
  const { contestId } = useParams();
  const id = Number(contestId);
  const [contest, setContest] = useState<Contest>();
  const [tab, setTab] = useState<
    "notices" | "form" | "questions" | "applications"
  >("notices");

  useEffect(() => {
    adminApi
      .getContests()
      .then((items) => setContest(items.find((item) => item.id === id)))
      .catch(() => setContest(undefined));
  }, [id]);

  if (!contest) {
    return <Loading />;
  }

  return (
    <section>
      <Link className="back-link" to="/admin/competitions">
        ← 대회 목록
      </Link>
      <div className="manage-title competition-detail-title">
        <p>{contest.status}</p>
        <h2>{contest.title}</h2>
        <span>{contest.description}</span>
      </div>
      <div className="admin-tabs" role="tablist" aria-label="대회 운영 메뉴">
        <button
          className={tab === "notices" ? "active" : ""}
          onClick={() => setTab("notices")}
        >
          공지사항
        </button>
        <button
          className={tab === "form" ? "active" : ""}
          onClick={() => setTab("form")}
        >
          참가 신청서
        </button>
        <button
          className={tab === "questions" ? "active" : ""}
          onClick={() => setTab("questions")}
        >
          Q&A 관리
        </button>
        <button
          className={tab === "applications" ? "active" : ""}
          onClick={() => setTab("applications")}
        >
          참가 신청 관리
        </button>
      </div>
      {tab === "notices" && <NoticesAdmin fixedContestId={id} />}
      {tab === "form" && <ApplicationFormAdmin embedded fixedContestId={id} />}
      {tab === "questions" && <QuestionsAdmin fixedContestId={id} />}
      {tab === "applications" && <ApplicationsAdmin fixedContestId={id} />}
    </section>
  );
}

export function ApplicationDetailAdmin() {
  const { contestId, applicationId } = useParams();
  const contestNumericId = Number(contestId);
  const applicationNumericId = Number(applicationId);
  const [application, setApplication] = useState<AdminApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<Feedback>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    adminApi
      .getApplication(contestNumericId, applicationNumericId)
      .then(setApplication)
      .catch((reason: Error) => {
        setApplication(null);
        setError(reason.message || "신청서를 불러오지 못했습니다.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [contestNumericId, applicationNumericId]);

  const changeDetailStatus = (status: string) => {
    if (!application || status === application.status) return;
    setStatusSaving(true);
    setStatusMessage(null);
    adminApi
      .updateApplicationStatus(contestNumericId, applicationNumericId, status)
      .then((result) => {
        setApplication((current) =>
          current ? { ...current, status: result.status } : current,
        );
        setStatusMessage({
          type: "success",
          text: `신청 상태를 ${applicationStatusLabel[result.status]}(으)로 변경했습니다.`,
        });
      })
      .catch((reason: Error) =>
        setStatusMessage({
          type: "error",
          text: `상태 변경에 실패했습니다. ${reason.message}`,
        }),
      )
      .finally(() => setStatusSaving(false));
  };

  if (loading) return <Loading />;

  if (!application) {
    return (
      <main className="application-detail-page">
        <Link
          className="back-link"
          to={`/admin/competitions/${contestNumericId}`}
        >
          ← 대회 관리로 돌아가기
        </Link>
        <Empty text={error ?? "참가 신청을 찾을 수 없습니다."} />
        <button className="outline retry-button" onClick={load}>
          다시 불러오기
        </button>
      </main>
    );
  }

  return (
    <main className="application-detail-page">
      <Link
        className="back-link"
        to={`/admin/competitions/${contestNumericId}`}
      >
        ← {application.contestTitle} 관리
      </Link>
      <div className="application-detail-heading">
        <div>
          <p className="eyebrow lime">APPLICATION</p>
          <h2>{application.applicant.email} 참가 신청서</h2>
          <p>{application.contestTitle}</p>
        </div>
        <label className="application-detail-status">
          <span>신청 처리 상태</span>
          <select
            value={application.status}
            disabled={statusSaving}
            onChange={(event) => changeDetailStatus(event.target.value)}
          >
            {Object.entries(applicationStatusLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <small>{statusSaving ? "변경 중..." : "선택 즉시 저장됩니다."}</small>
        </label>
      </div>
      <Message value={statusMessage} />
      <div className="application-detail-meta">
        <div>
          <small>이메일</small>
          <b>{application.applicant.email}</b>
        </div>
        <div>
          <small>신청일</small>
          <b>{application.submittedAt?.slice(0, 10) ?? "-"}</b>
        </div>
      </div>
      <div className="application-detail-answers">
        {application.answerItems.map((answer) => {
          const embedUrl =
            answer.fieldType === "YOUTUBE"
              ? youtubeEmbedUrl(answer.value)
              : null;
          return (
            <section
              className={answer.fieldType === "YOUTUBE" ? "video-answer" : ""}
              key={answer.label}
            >
              <h4>{answer.label}</h4>
              {embedUrl ? (
                <>
                  <div className="youtube-embed">
                    <iframe
                      src={embedUrl}
                      title={answer.label}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                  <a href={answer.value} target="_blank" rel="noreferrer">
                    유튜브에서 보기 →
                  </a>
                </>
              ) : (
                <p>{answer.value}</p>
              )}
            </section>
          );
        })}
      </div>
      {application.attachments?.length > 0 && (
        <section className="application-detail-files">
          <div>
            <h3>첨부 파일</h3>
            <p>참가자가 신청서와 함께 제출한 파일입니다.</p>
          </div>
          <div className="application-file-list">
            {application.attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={`/api/admin/contests/${application.contestId}/applications/${application.id}/attachments/${attachment.id}`}
                download
              >
                <div>
                  <small>{attachment.fieldLabel}</small>
                  <strong>{attachment.fileName}</strong>
                  <span>{formatFileSize(attachment.fileSize)}</span>
                </div>
                <b>다운로드 ↓</b>
              </a>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function youtubeEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    let videoId = "";
    if (host === "youtu.be") videoId = url.pathname.split("/")[1] ?? "";
    if (host === "youtube.com" || host.endsWith(".youtube.com")) {
      if (url.pathname === "/watch") videoId = url.searchParams.get("v") ?? "";
      else if (/^\/(embed|shorts)\//.test(url.pathname)) {
        videoId = url.pathname.split("/")[2] ?? "";
      }
    }
    return /^[a-zA-Z0-9_-]{6,}$/.test(videoId)
      ? `https://www.youtube-nocookie.com/embed/${videoId}`
      : null;
  } catch {
    return null;
  }
}

export function NoticesAdmin({
  fixedContestId,
}: {
  fixedContestId?: number;
} = {}) {
  const [message, setMessage] = useState<Feedback>(null);
  const [body, setBody] = useState("");
  const [notices, setNotices] = useState<ContestNotice[]>([]);
  const [loading, setLoading] = useState(Boolean(fixedContestId));
  const [writeOpen, setWriteOpen] = useState(false);

  useEffect(() => {
    if (!fixedContestId) return;
    setLoading(true);
    contestApi
      .getNotices(fixedContestId)
      .then(setNotices)
      .catch(() =>
        setMessage({ type: "error", text: "공지사항을 불러오지 못했습니다." }),
      )
      .finally(() => setLoading(false));
  }, [fixedContestId]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    if (!body.trim()) {
      setMessage({ type: "error", text: "공지 내용을 입력해 주세요." });
      return;
    }
    const form = event.currentTarget;
    const f = new FormData(form);
    const contestId = fixedContestId ?? Number(f.get("contestId"));
    const submission = new FormData();
    submission.append(
      "notice",
      new Blob(
        [
          JSON.stringify({
            title: String(f.get("title")),
            body: body.trim(),
            youtubeUrl: String(f.get("youtubeUrl") ?? ""),
            pinned: f.get("pinned") === "on",
            published: true,
          }),
        ],
        { type: "application/json" },
      ),
    );
    f.getAll("files").forEach((file) => {
      if (file instanceof File && file.size > 0)
        submission.append("files", file);
    });
    adminApi
      .createNotice(contestId, submission)
      .then((notice) => {
        form.reset();
        setBody("");
        setNotices((items) => [notice, ...items]);
        setMessage({ type: "success", text: "공지사항을 등록했습니다." });
        setWriteOpen(false);
      })
      .catch((error: Error) =>
        setMessage({
          type: "error",
          text: `공지 등록에 실패했습니다. ${error.message || "대회 ID를 확인해 주세요."}`,
        }),
      );
  };
  return (
    <section className="contest-notice-admin">
      <div className="manage-title notice-manage-title">
        <div>
          <h3>대회 공지사항</h3>
          <span>참가자에게 공개되는 공지 게시판입니다.</span>
        </div>
        <button
          className="btn primary"
          type="button"
          onClick={() => setWriteOpen(true)}
        >
          + 공지 작성
        </button>
      </div>
      <Message value={message} />
      {loading ? (
        <Loading />
      ) : (
        <NoticeBoard
          notices={notices}
          getNoticeUrl={(notice) =>
            `/contests/${fixedContestId}/notices/${notice.id}`
          }
          emptyText="아직 등록된 대회 공지사항이 없습니다."
        />
      )}
      {writeOpen && (
        <div className="modal-backdrop" onMouseDown={() => setWriteOpen(false)}>
          <section
            className="admin-form competition-modal notice-write-modal"
            role="dialog"
            aria-modal="true"
            aria-label="공지사항 작성"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-title">
              <div>
                <h3>공지사항 작성</h3>
                <p>등록 즉시 이 대회의 공지 게시판에 공개됩니다.</p>
              </div>
              <button
                className="modal-close"
                type="button"
                onClick={() => setWriteOpen(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={submit}>
              {!fixedContestId && (
                <label>
                  대회 ID
                  <input name="contestId" type="number" required />
                </label>
              )}
              <label className="full">
                제목
                <input name="title" required />
              </label>
              <label className="full">
                내용
                <ContentEditor
                  value={body}
                  onChange={setBody}
                  placeholder="참가자에게 전달할 공지 내용을 작성해 주세요."
                />
              </label>
              <label className="full">
                유튜브 영상 <small>(선택)</small>
                <input
                  name="youtubeUrl"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </label>
              <label className="full notice-file-field">
                첨부 파일 <small>(선택, 파일당 최대 10MB)</small>
                <input name="files" type="file" multiple />
              </label>
              <label className="check">
                <input name="pinned" type="checkbox" /> 상단 고정
              </label>
              <div className="modal-actions full">
                <button
                  className="outline"
                  type="button"
                  onClick={() => setWriteOpen(false)}
                >
                  취소
                </button>
                <SubmitButton>공지 등록</SubmitButton>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
