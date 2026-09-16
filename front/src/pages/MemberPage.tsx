import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi, memberApi, type MemberDashboard } from "../services/api";
import { Empty, Loading, SubmitButton } from "../components/UI";
import { useAuth } from "../auth/AuthProvider";
import {
  ArrowUpRight,
  Eye,
  EyeOff,
  LogIn,
  Pause,
  Play,
  UserPlus,
} from "lucide-react";
import "../member-auth.css";

const applicationStatus: Record<string, string> = {
  SUBMITTED: "접수 완료",
  APPROVED: "참가 승인",
  REJECTED: "반려",
};
const mockMode = import.meta.env.VITE_MOCK_MODE === "true";

export function MemberPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [motionPaused, setMotionPaused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const posterRef = useRef<HTMLElement>(null);
  const changeMode = (next: "login" | "signup") => {
    setMode(next);
    setMessage("");
    setPasswordVisible(false);
  };
  const [message, setMessage] = useState("");
  const [dashboard, setDashboard] = useState<MemberDashboard>();
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const { login, member, loading, updateProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!member) {
      setDashboard(undefined);
      return;
    }
    setDashboardLoading(true);
    memberApi
      .getDashboard()
      .then(setDashboard)
      .catch(() => setMessage("개인 활동 정보를 불러오지 못했습니다."))
      .finally(() => setDashboardLoading(false));
  }, [member]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (mode === "login") {
      login(String(form.get("email")), String(form.get("password")))
        .then(() => navigate("/member"))
        .catch(() => setMessage("이메일 또는 비밀번호를 확인해 주세요."));
      return;
    }
    authApi
      .signup({
        email: String(form.get("email")),
        password: String(form.get("password")),
      })
      .then(() => {
        setMessage("회원가입이 완료되었습니다. 로그인해 주세요.");
        setMode("login");
      })
      .catch(() => setMessage("이메일이 이미 가입되어 있는지 확인해 주세요."));
  };

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setMessage("");
    updateProfile({
      email: String(form.get("email")),
      newPassword: String(form.get("newPassword") ?? ""),
    })
      .then(() => setMessage("내 정보를 저장했습니다."))
      .catch(() => setMessage("이메일 또는 새 비밀번호를 확인해 주세요."));
  };

  if (loading) return <Loading />;

  if (member) {
    const unansweredCount =
      dashboard?.questions.filter((question) => !question.answered).length ?? 0;
    return (
      <main className="member-dashboard">
        <header className="member-dashboard-hero">
          <div>
            <p className="eyebrow lime">MY DASHBOARD</p>
            <h1>나의 활동</h1>
            <p>참가 현황과 질문 답변, 놓치면 안 되는 대회 공지를 확인하세요.</p>
          </div>
          <div className="member-identity">
            <strong>{member.email}</strong>
            <small>참가자 계정</small>
          </div>
        </header>

        {message && <p className="form-message member-message">{message}</p>}

        {dashboardLoading || !dashboard ? (
          <Loading />
        ) : (
          <>
            <section className="member-summary-grid" aria-label="활동 요약">
              <article>
                <span>참가 중인 대회</span>
                <strong>{dashboard.applications.length}</strong>
                <small>신청서를 제출한 대회</small>
              </article>
              <article>
                <span>내가 작성한 질문</span>
                <strong>{dashboard.questions.length}</strong>
                <small>공개·비밀 질문 포함</small>
              </article>
              <article className={unansweredCount ? "needs-attention" : ""}>
                <span>답변 대기</span>
                <strong>{unansweredCount}</strong>
                <small>운영자 답변 대기 중</small>
              </article>
              <article>
                <span>확인할 공지</span>
                <strong>{dashboard.notices.length}</strong>
                <small>참가 대회의 최근 공지</small>
              </article>
            </section>

            <div className="member-dashboard-grid">
              <section className="member-dashboard-panel member-contests-panel">
                <PanelTitle
                  title="참가 중인 대회"
                  description="내 신청 상태와 대회 진행 상태를 확인합니다."
                />
                {dashboard.applications.length ? (
                  <div className="member-activity-list">
                    {dashboard.applications.map((application) => (
                      <Link
                        key={application.id}
                        to={`/contests/${application.contestId}`}
                      >
                        <div>
                          <span className="member-status-badge">
                            {applicationStatus[application.applicationStatus] ??
                              application.applicationStatus}
                          </span>
                          <h3>{application.contestTitle}</h3>
                          <p>
                            신청일{" "}
                            {application.submittedAt?.slice(0, 10) ?? "-"}
                          </p>
                        </div>
                        <span>대회 보기 →</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Empty text="아직 참가 신청한 대회가 없습니다." />
                )}
              </section>

              <section className="member-dashboard-panel member-notices-panel">
                <PanelTitle
                  title="확인할 공지사항"
                  description="참가 중인 대회의 중요·최신 공지입니다."
                />
                {dashboard.notices.length ? (
                  <div className="member-notice-list">
                    {dashboard.notices.map((notice) => (
                      <Link
                        key={notice.id}
                        to={`/contests/${notice.contestId}/notices/${notice.id}`}
                      >
                        <span
                          className={notice.pinned ? "important" : "latest"}
                        >
                          {notice.pinned ? "중요" : "공지"}
                        </span>
                        <div>
                          <strong>{notice.title}</strong>
                          <small>
                            {notice.contestTitle} ·{" "}
                            {notice.createdAt?.slice(0, 10)}
                          </small>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Empty text="확인할 공지사항이 없습니다." />
                )}
              </section>

              <section className="member-dashboard-panel member-questions-panel">
                <PanelTitle
                  title="내가 작성한 Q&A"
                  description="비밀글을 포함해 내가 남긴 질문과 답변 상태를 확인합니다."
                />
                {dashboard.questions.length ? (
                  <div className="member-question-list">
                    {dashboard.questions.map((question) => (
                      <Link
                        key={question.id}
                        to={`/contests/${question.contestId}?tab=questions`}
                      >
                        <span
                          className={question.answered ? "answered" : "waiting"}
                        >
                          {question.answered ? "답변 완료" : "답변 대기"}
                        </span>
                        <div>
                          <strong>
                            {question.secret ? "🔒 " : ""}
                            {question.title}
                          </strong>
                          <small>
                            {question.contestTitle} ·{" "}
                            {question.createdAt?.slice(0, 10)}
                          </small>
                        </div>
                        <span>확인 →</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Empty text="아직 작성한 질문이 없습니다." />
                )}
              </section>
            </div>
          </>
        )}

        <section className="member-dashboard-panel member-profile-panel">
          <PanelTitle
            title="내 정보 수정"
            description="참가 신청과 안내에 사용하는 회원 정보입니다."
          />
          <form className="member-profile-form" onSubmit={saveProfile}>
            <label className="full">
              이메일
              <input
                name="email"
                type="email"
                defaultValue={member.email}
                required
              />
            </label>
            <label className="full">
              새 비밀번호
              <input
                name="newPassword"
                type="password"
                placeholder="변경할 때만 입력"
              />
            </label>
            <SubmitButton>정보 저장</SubmitButton>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main
      className={`myteam auth-stage auth-${mode}${motionPaused ? " auth-motion-paused" : ""}`}
    >
      <aside
        className="member-welcome"
        ref={posterRef}
        onPointerMove={(event) => {
          if (
            motionPaused ||
            event.pointerType !== "mouse" ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
          )
            return;
          const rect = event.currentTarget.getBoundingClientRect();
          event.currentTarget.style.setProperty(
            "--pointer-x",
            `${((event.clientX - rect.left) / rect.width - 0.5) * 14}deg`,
          );
          event.currentTarget.style.setProperty(
            "--pointer-y",
            `${((event.clientY - rect.top) / rect.height - 0.5) * -12}deg`,
          );
        }}
        onPointerLeave={() => {
          posterRef.current?.style.setProperty("--pointer-x", "0deg");
          posterRef.current?.style.setProperty("--pointer-y", "0deg");
        }}
      >
        <Link className="public-back" to="/">
          ← 메인으로
        </Link>
        <div className="gate-edition">
          <span>AI·SW CONTEST</span>
          <span>2026 / VOL.01</span>
        </div>
        <div key={mode} className="auth-poster-copy">
          <p className="eyebrow lime">
            {mode === "login"
              ? "PLAYER / RETURN TO THE ARENA"
              : "NEW PLAYER / ENTER THE ARENA"}
          </p>
          <h2>
            {mode === "login" ? (
              <>
                다시 만나 반가워요.
                <br />
                <span>이어서, 도전.</span>
              </>
            ) : (
              <>
                첫 번째 한 걸음.
                <br />
                <span>여기서, 시작.</span>
              </>
            )}
          </h2>
          <div className="gate-headline" aria-hidden="true">
            {mode === "login" ? (
              <>
                BACK
                <br />
                <span>IN THE</span>
                <br />
                GAME.
              </>
            ) : (
              <>
                MAKE
                <br />
                <span>YOUR</span>
                <br />
                MOVE.
              </>
            )}
          </div>
          <p>
            {mode === "login" ? (
              <>
                준비한 아이디어, 멈추지 않도록.
                <br />
                나의 대회와 프로젝트로 돌아가세요.
              </>
            ) : (
              <>
                세상을 바꿀 아이디어가 있다면.
                <br />
                지금 여러분의 도전을 등록하세요.
              </>
            )}
          </p>
        </div>
        <div className="auth-visual" aria-hidden="true">
          <div className="gate-perspective">
            <div className="gate-tunnel">
              {Array.from({ length: 9 }, (_, i) => (
                <i
                  key={i}
                  style={{
                    width: `${100 - i * 8}%`,
                    height: `${100 - i * 8}%`,
                    animationDelay: `${i * -0.35}s`,
                  }}
                />
              ))}
              <span className="gate-core">
                <ArrowUpRight strokeWidth={1} />
              </span>
            </div>
          </div>
          <span className="gate-coordinate">
            {mode === "login" ? "↳ RESUME YOUR NEXT" : "↗ CREATE YOUR NEXT"}
          </span>
        </div>
        <div className="auth-poster-bottom">
          <small>AI × SW / THINK. BUILD. CHALLENGE.</small>
          <button
            type="button"
            onClick={() => setMotionPaused(!motionPaused)}
            aria-label={
              motionPaused ? "애니메이션 재생" : "애니메이션 일시정지"
            }
          >
            {motionPaused ? <Play size={13} /> : <Pause size={13} />}
          </button>
        </div>
      </aside>
      <div className="member-auth-content">
        <div className="gate-ticket-meta">
          <span>PARTICIPANT ACCESS</span>
          <span className="gate-ticket-number">
            {mode === "login" ? "A—01" : "B—02"}
          </span>
        </div>
        <div className="auth-mode-switch" aria-label="계정 메뉴">
          <button
            type="button"
            aria-pressed={mode === "login"}
            className={mode === "login" ? "active" : ""}
            onClick={() => changeMode("login")}
          >
            <LogIn size={16} /> 로그인
          </button>
          <button
            type="button"
            aria-pressed={mode === "signup"}
            className={mode === "signup" ? "active" : ""}
            onClick={() => changeMode("signup")}
          >
            <UserPlus size={16} /> 회원가입
          </button>
        </div>
        <div className="page-heading auth-form-heading" key={`heading-${mode}`}>
          <p className="eyebrow lime">
            {mode === "login" ? "01 / WELCOME BACK" : "02 / JOIN THE CHALLENGE"}
          </p>
          <h1>{mode === "login" ? "로그인" : "회원가입"}</h1>
          <p>
            {mode === "login"
              ? "로그인하고 나의 참가 현황을 확인하세요."
              : "이메일과 비밀번호만으로 계정을 만들 수 있습니다."}
          </p>
        </div>
        {mockMode && mode === "login" && (
          <aside className="demo-account" aria-label="UI 데모 로그인 정보">
            <b>UI DEMO ACCOUNT</b>
            <span><em>USER</em> demo@contest.dev / demo1234</span>
            <span><em>ADMIN</em> admin@contest.dev / admin1234</span>
          </aside>
        )}
        <section className="admin-form">
          <form onSubmit={submit} key={mode} className="auth-entry-form">
            <label className="full">
              이메일
              <input
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>
            <label className="full">
              비밀번호
              <span className="gate-password">
                <input
                  name="password"
                  type={passwordVisible ? "text" : "password"}
                  placeholder={
                    mode === "login"
                      ? "비밀번호를 입력해 주세요"
                      : "사용할 비밀번호를 입력해 주세요"
                  }
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  required
                />
                <button
                  type="button"
                  aria-label={
                    passwordVisible ? "비밀번호 숨기기" : "비밀번호 표시"
                  }
                  aria-pressed={passwordVisible}
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>
            <SubmitButton>
              {mode === "login"
                ? "로그인하고 이어가기"
                : "회원가입하고 도전 시작"}
            </SubmitButton>
          </form>
        </section>
        <p className="auth-feedback" role="status">
          {message}
        </p>
        <div className="auth-switch-hint">
          <span>
            {mode === "login" ? "아직 계정이 없나요?" : "이미 함께하고 있나요?"}
          </span>
          <button
            type="button"
            onClick={() => changeMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "회원가입 →" : "로그인 →"}
          </button>
        </div>
        <div className="gate-ticket-footer" aria-hidden="true">
          <div className="gate-barcode" />
          <span>YOUR IDEAS. YOUR STAGE.</span>
          <ArrowUpRight size={22} />
        </div>
      </div>
    </main>
  );
}

function PanelTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="member-panel-title">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}
