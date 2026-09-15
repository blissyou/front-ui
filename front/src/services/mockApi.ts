const contest = {
  id: 1,
  title: "2026 전국 고등학교 동아리 AI·SW 경진대회",
  description:
    "전국 고등학교 동아리의 창의적인 AI·SW 프로젝트를 발굴하는 경진대회입니다.",
  status: "OPEN",
  applicationStartAt: "2026-09-01",
  applicationEndAt: "2026-09-30",
  startDate: "2026-10-01",
  endDate: "2026-11-30",
  published: true,
};

const notices = [
  {
    id: 1,
    title: "참가 신청 및 제출 일정 안내",
    slug: "application-schedule",
    body: "참가 신청은 9월 30일까지입니다. 팀 소개와 프로젝트 기획서를 확인한 뒤 제출해 주세요.",
    youtubeUrl: "",
    attachments: [],
    pinned: true,
    published: true,
    createdAt: "2026-09-01T09:00:00",
  },
  {
    id: 2,
    title: "온라인 설명회 안내",
    slug: "online-briefing",
    body: "대회 진행 방식과 심사 기준을 소개하는 온라인 설명회가 열립니다.",
    youtubeUrl: "",
    attachments: [],
    pinned: false,
    published: true,
    createdAt: "2026-09-05T14:00:00",
  },
];

const questions = [
  {
    id: 1,
    title: "팀 인원은 몇 명까지 가능한가요?",
    body: "팀 구성 인원이 궁금합니다.",
    answer: "지도교사 1명과 학생 2~5명으로 구성할 수 있습니다.",
    secret: false,
    answered: true,
    faq: true,
    createdAt: "2026-09-02T11:00:00",
  },
  {
    id: 2,
    title: "여러 학교가 연합해서 참가할 수 있나요?",
    body: "연합 동아리 참가 가능 여부를 알고 싶습니다.",
    answer: "가능합니다. 대표 학교와 지도교사를 지정해 주세요.",
    secret: false,
    answered: true,
    faq: true,
    createdAt: "2026-09-03T13:00:00",
  },
];

const formFields = [
  { id: 1, label: "팀 이름", fieldType: "SHORT_TEXT", required: true, options: [], sortOrder: 1 },
  { id: 2, label: "프로젝트 소개", fieldType: "LONG_TEXT", required: true, options: [], sortOrder: 2 },
  { id: 3, label: "프로젝트 분야", fieldType: "SELECT", required: true, options: ["AI", "웹/앱", "IoT", "게임"], sortOrder: 3 },
  { id: 4, label: "기획서", fieldType: "FILE", required: true, options: [], sortOrder: 4 },
];

const demoMember = { id: 101, email: "demo@contest.dev", role: "USER" };
const sessionKey = "contest-ui-demo-member";
const dashboard = {
  applications: [{ id: 501, contestId: 1, contestTitle: contest.title, contestStatus: "OPEN", applicationStatus: "SUBMITTED", submittedAt: "2026-09-08T17:20:00" }],
  questions: [{ id: 701, contestId: 1, contestTitle: contest.title, title: "발표 자료 형식에 제한이 있나요?", secret: false, answered: true, answer: "PDF 형식으로 제출해 주세요.", createdAt: "2026-09-09T10:30:00" }],
  notices: notices.map((notice) => ({ id: notice.id, contestId: 1, contestTitle: contest.title, title: notice.title, pinned: notice.pinned, createdAt: notice.createdAt })),
};

const clone = <T>(value: T): T => structuredClone(value);

export async function mockRequest<T>(path: string, options: RequestInit = {}) {
  await new Promise((resolve) => window.setTimeout(resolve, 120));
  const method = options.method ?? "GET";
  if (path === "/auth/me" && method === "GET") {
    const member = sessionStorage.getItem(sessionKey);
    if (!member) throw new Error("로그인하지 않았습니다.");
    return JSON.parse(member) as T;
  }
  if (path === "/auth/login" && method === "POST") {
    const body = JSON.parse(String(options.body ?? "{}")) as { email?: string; password?: string };
    if (body.email !== demoMember.email || body.password !== "demo1234") throw new Error("이메일 또는 비밀번호가 일치하지 않습니다.");
    sessionStorage.setItem(sessionKey, JSON.stringify(demoMember));
    return clone(demoMember) as T;
  }
  if (path === "/auth/logout" && method === "POST") {
    sessionStorage.removeItem(sessionKey);
    return { success: true } as T;
  }
  if (path === "/auth/me" && method === "PATCH") return clone(demoMember) as T;
  if (path === "/member/dashboard") {
    if (!sessionStorage.getItem(sessionKey)) throw new Error("로그인이 필요합니다.");
    return clone(dashboard) as T;
  }
  if (path === "/public/contests") return clone([contest]) as T;
  if (path === "/public/contests/1") return clone(contest) as T;
  if (path === "/public/contests/1/notices") return clone(notices) as T;
  const noticeMatch = path.match(/^\/public\/contests\/1\/notices\/(\d+)$/);
  if (noticeMatch) {
    const notice = notices.find((item) => item.id === Number(noticeMatch[1]));
    if (notice) return clone(notice) as T;
  }
  if (path === "/public/contests/1/questions") return clone(questions) as T;
  if (path === "/public/contests/1/application-form") return clone(formFields) as T;
  if (path === "/contests/1/applications/me") {
    if (!sessionStorage.getItem(sessionKey)) throw new Error("로그인이 필요합니다.");
    return { id: 501, contestId: 1, status: "SUBMITTED", introduction: "목업 참가 신청서", answers: { "1": "NEXT MAKERS", "2": "AI로 교실의 에너지 낭비를 줄이는 프로젝트" }, attachments: [], submittedAt: "2026-09-08T17:20:00" } as T;
  }
  if (method !== "GET") throw new Error("UI 데모에서는 저장되지 않습니다.");
  throw new Error(`목업 데이터가 없는 경로입니다: ${path}`);
}
