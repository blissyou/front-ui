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

const demoMembers = [
  { id: 101, email: "demo@contest.dev", password: "demo1234", role: "USER" },
  { id: 1, email: "admin@contest.dev", password: "admin1234", role: "ADMIN" },
] as const;
const sessionKey = "contest-ui-demo-member";
const galleryKey = "contest-ui-demo-gallery";
const galleryColors = ["dbe7b5", "f1cdb8", "becfd8", "e5d8cf"];
const defaultGallery = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  year: index < 6 ? "2025" : "2024",
  category: ["현장 스케치", "작품 전시", "발표"][index % 3],
  title:
    ["아이디어를 나누는 순간", "우리의 첫 번째 데모", "함께 완성한 작품"][
      index % 3
    ] + ` ${index + 1}`,
  description: "대회 현장의 기록입니다.",
  imageUrl: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480"><rect width="640" height="480" fill="#${galleryColors[index % galleryColors.length]}"/><circle cx="320" cy="240" r="${80 + index * 4}" fill="none" stroke="#596052" stroke-width="3"/><path d="M120 330 Q320 ${80 + index * 5} 520 330" fill="none" stroke="#596052" stroke-width="4"/></svg>`)}`,
}));
const galleryPhotos = () =>
  JSON.parse(
    localStorage.getItem(galleryKey) || JSON.stringify(defaultGallery),
  );
const fileUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
const dashboard = {
  applications: [],
  questions: [
    {
      id: 701,
      contestId: 1,
      contestTitle: contest.title,
      title: "발표 자료 형식에 제한이 있나요?",
      secret: false,
      answered: true,
      answer: "PDF 형식으로 제출해 주세요.",
      createdAt: "2026-09-09T10:30:00",
    },
  ],
  notices: notices.map((notice) => ({
    id: notice.id,
    contestId: 1,
    contestTitle: contest.title,
    title: notice.title,
    pinned: notice.pinned,
    createdAt: notice.createdAt,
  })),
};
const adminApplications = [
  {
    id: 801,
    contestId: 1,
    contestTitle: contest.title,
    status: "SUBMITTED",
    introduction: "학교생활 속 에너지 낭비를 줄이는 AI 프로젝트입니다.",
    answers: { team: "NEXT MAKERS", project: "AI 절전 교실" },
    answerItems: [
      { label: "팀 이름", fieldType: "SHORT_TEXT", value: "NEXT MAKERS" },
      {
        label: "프로젝트 소개",
        fieldType: "LONG_TEXT",
        value:
          "교실의 조명과 냉난방 사용 패턴을 학습해 불필요한 에너지 소비를 줄이는 AI 서비스입니다.",
      },
      { label: "프로젝트 분야", fieldType: "SELECT", value: "AI" },
    ],
    attachments: [],
    submittedAt: "2026-09-12T14:20:00",
    applicant: { id: 201, email: "nextmakers@example.com" },
  },
  {
    id: 802,
    contestId: 1,
    contestTitle: contest.title,
    status: "APPROVED",
    introduction: "시각장애 학생을 위한 교내 길찾기 서비스입니다.",
    answers: { team: "CODE WAVE", project: "VOICE CAMPUS" },
    answerItems: [
      { label: "팀 이름", fieldType: "SHORT_TEXT", value: "CODE WAVE" },
      {
        label: "프로젝트 소개",
        fieldType: "LONG_TEXT",
        value:
          "카메라와 음성 안내를 결합해 학교 안에서 안전하게 이동하도록 돕는 모바일 서비스입니다.",
      },
      { label: "프로젝트 분야", fieldType: "SELECT", value: "웹/앱" },
    ],
    attachments: [],
    submittedAt: "2026-09-10T09:35:00",
    applicant: { id: 202, email: "codewave@example.com" },
  },
];

const clone = <T>(value: T): T => structuredClone(value);

export async function mockRequest<T>(path: string, options: RequestInit = {}) {
  await new Promise((resolve) => window.setTimeout(resolve, 120));
  const method = options.method ?? "GET";
  if (path === "/public/gallery" && method === "GET")
    return clone(galleryPhotos()) as T;
  if (path === "/admin/gallery" && method === "POST") {
    const member = JSON.parse(sessionStorage.getItem(sessionKey) || "null");
    if (member?.role !== "ADMIN")
      throw new Error("관리자 로그인이 필요합니다.");
    const body = options.body as FormData;
    const current = galleryPhotos();
    const files = body.getAll("files") as File[];
    const nextId =
      Math.max(0, ...current.map((item: { id: number }) => item.id)) + 1;
    const saved = await Promise.all(
      files.map(async (file, index) => ({
        id: nextId + index,
        year: String(body.get("year")),
        category: String(body.get("category")),
        title: `${String(body.get("title"))}${files.length > 1 ? ` ${index + 1}` : ""}`,
        description: String(body.get("description") ?? ""),
        imageUrl: await fileUrl(file),
      })),
    );
    localStorage.setItem(galleryKey, JSON.stringify([...saved, ...current]));
    return clone(saved) as T;
  }
  const galleryDelete = path.match(/^\/admin\/gallery\/(\d+)$/);
  if (galleryDelete && method === "DELETE") {
    const member = JSON.parse(sessionStorage.getItem(sessionKey) || "null");
    if (member?.role !== "ADMIN")
      throw new Error("관리자 로그인이 필요합니다.");
    localStorage.setItem(
      galleryKey,
      JSON.stringify(
        galleryPhotos().filter(
          (item: { id: number }) => item.id !== Number(galleryDelete[1]),
        ),
      ),
    );
    return { success: true } as T;
  }
  if (path === "/public/home-video" && method === "GET") {
    return JSON.parse(
      localStorage.getItem("contest-home-video") ||
        JSON.stringify({
          url: "",
          title: "상상이 움직이는 순간.",
          description: "아이디어가 작품이 되고, 작품이 새로운 도전이 됩니다.",
          enabled: true,
        }),
    ) as T;
  }
  if (path === "/admin/home-video" && method === "PUT") {
    const member = JSON.parse(sessionStorage.getItem(sessionKey) || "null");
    if (member?.role !== "ADMIN")
      throw new Error("관리자 로그인이 필요합니다.");
    const value = JSON.parse(String(options.body));
    localStorage.setItem("contest-home-video", JSON.stringify(value));
    return clone(value) as T;
  }
  if (path === "/auth/me" && method === "GET") {
    const member = sessionStorage.getItem(sessionKey);
    if (!member) throw new Error("로그인하지 않았습니다.");
    return JSON.parse(member) as T;
  }
  if (path === "/auth/login" && method === "POST") {
    const body = JSON.parse(String(options.body ?? "{}")) as {
      email?: string;
      password?: string;
    };
    const account = demoMembers.find(
      (item) => item.email === body.email && item.password === body.password,
    );
    if (!account) throw new Error("이메일 또는 비밀번호가 일치하지 않습니다.");
    const member = { id: account.id, email: account.email, role: account.role };
    sessionStorage.setItem(sessionKey, JSON.stringify(member));
    return clone(member) as T;
  }
  if (path === "/auth/logout" && method === "POST") {
    sessionStorage.removeItem(sessionKey);
    return { success: true } as T;
  }
  if (path === "/auth/me" && method === "PATCH") {
    const member = sessionStorage.getItem(sessionKey);
    if (!member) throw new Error("로그인이 필요합니다.");
    return JSON.parse(member) as T;
  }
  if (path === "/member/dashboard") {
    if (!sessionStorage.getItem(sessionKey))
      throw new Error("로그인이 필요합니다.");
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
  if (path === "/public/contests/1/application-form") return [] as T;
  if (path === "/contests/1/applications/me") {
    if (!sessionStorage.getItem(sessionKey))
      throw new Error("로그인이 필요합니다.");
    throw new Error("제출된 참가 신청서가 없습니다.");
  }
  if (path === "/admin/contests" && method === "GET")
    return clone([contest]) as T;
  if (path === "/admin/users" && method === "GET") {
    return demoMembers.map(({ password: _password, ...member }, index) => ({
      ...member,
      createdAt: index ? "2026-09-01T09:00:00" : "2026-08-20T09:00:00",
    })) as T;
  }
  if (path === "/admin/contests/applications" && method === "GET")
    return clone(adminApplications) as T;
  const adminApplicationMatch = path.match(
    /^\/admin\/contests\/1\/applications\/(\d+)(?:\/status)?$/,
  );
  if (adminApplicationMatch) {
    const application = adminApplications.find(
      (item) => item.id === Number(adminApplicationMatch[1]),
    );
    if (!application) throw new Error("참가 신청을 찾을 수 없습니다.");
    if (method === "PATCH" && path.endsWith("/status")) {
      const body = JSON.parse(String(options.body ?? "{}")) as {
        status?: string;
      };
      if (body.status) application.status = body.status;
      return { id: application.id, status: application.status } as T;
    }
    if (method === "GET") return clone(application) as T;
  }
  if (path === "/admin/contests/1/questions" && method === "GET")
    return clone(questions) as T;
  if (path === "/admin/contests/1/application-form" && method === "GET")
    return [] as T;
  if (method !== "GET") throw new Error("UI 데모에서는 저장되지 않습니다.");
  throw new Error(`목업 데이터가 없는 경로입니다: ${path}`);
}
