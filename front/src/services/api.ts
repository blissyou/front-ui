export type Contest = {
  id: number;
  title: string;
  description: string;
  status: string;
  applicationStartAt: string;
  applicationEndAt: string;
  startDate: string;
  endDate: string;
  published: boolean;
};
export type ContestNotice = {
  id: number;
  title: string;
  slug: string;
  body: string;
  youtubeUrl: string;
  attachments: Array<{
    id: number;
    fileName: string;
    contentType: string;
    fileSize: number;
  }>;
  pinned: boolean;
  published: boolean;
  createdAt: string;
};
export type Question = {
  id: number;
  title: string;
  body: string;
  answer: string;
  secret: boolean;
  answered: boolean;
  faq: boolean;
  createdAt: string;
};
export type Application = {
  id: number;
  contestId: number;
  status: string;
  introduction: string;
  answers: Record<string, string>;
  attachments: Array<{
    id: number;
    fieldLabel: string;
    fileName: string;
    fileSize: number;
  }>;
  submittedAt: string;
};
export type ApplicationFormField = {
  id: number;
  label: string;
  fieldType: "SHORT_TEXT" | "LONG_TEXT" | "SELECT" | "FILE" | "YOUTUBE";
  required: boolean;
  options: string[];
  optionsText?: string;
  sortOrder: number;
};
export type AdminApplication = Application & {
  contestTitle: string;
  answerItems: Array<{
    label: string;
    fieldType: ApplicationFormField["fieldType"];
    value: string;
  }>;
  attachments: Array<{
    id: number;
    fieldLabel: string;
    fileName: string;
    contentType: string;
    fileSize: number;
  }>;
  applicant: {
    id: number;
    email: string;
  };
};
export type AdminUser = {
  id: number;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
};
export type MemberDashboard = {
  applications: Array<{
    id: number;
    contestId: number;
    contestTitle: string;
    contestStatus: string;
    applicationStatus: string;
    submittedAt: string;
  }>;
  questions: Array<{
    id: number;
    contestId: number;
    contestTitle: string;
    title: string;
    secret: boolean;
    answered: boolean;
    answer: string;
    createdAt: string;
  }>;
  notices: Array<{
    id: number;
    contestId: number;
    contestTitle: string;
    title: string;
    pinned: boolean;
    createdAt: string;
  }>;
};

const mockMode = import.meta.env.VITE_MOCK_MODE === "true";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (mockMode) {
    const { mockRequest } = await import("./mockApi");
    return mockRequest<T>(path, options);
  }
  const response = await fetch(`/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<T>;
}

async function requestFormData<T>(path: string, body: FormData): Promise<T> {
  if (mockMode) {
    const { mockRequest } = await import("./mockApi");
    return mockRequest<T>(path, { method: "POST", body });
  }
  const response = await fetch(`/api${path}`, {
    method: "POST",
    credentials: "include",
    body,
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<T>;
}

export const authApi = {
  signup: (body: Record<string, string | number>) =>
    request<Record<string, unknown>>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  login: (email: string, password: string) =>
    request<Record<string, unknown>>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () =>
    request<{ success: boolean }>("/auth/logout", { method: "POST" }),
  me: () => request<Record<string, unknown>>("/auth/me"),
  updateProfile: (body: Record<string, string | number>) =>
    request<Record<string, unknown>>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};
export const memberApi = {
  getDashboard: () => request<MemberDashboard>("/member/dashboard"),
};
export const contestApi = {
  getContests: () => request<Contest[]>("/public/contests"),
  getContest: (id: number) => request<Contest>(`/public/contests/${id}`),
  getNotices: (id: number) =>
    request<ContestNotice[]>(`/public/contests/${id}/notices`),
  getNotice: (contestId: number, noticeId: number) =>
    request<ContestNotice>(`/public/contests/${contestId}/notices/${noticeId}`),
  getApplicationForm: (id: number) =>
    request<ApplicationFormField[]>(`/public/contests/${id}/application-form`),
  getQuestions: (id: number) =>
    request<Question[]>(`/public/contests/${id}/questions`),
  askQuestion: (
    id: number,
    body: { title: string; body: string; secret: boolean },
  ) =>
    request<Question>(`/contests/${id}/questions`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  applyWithFiles: (id: number, body: FormData) =>
    requestFormData<Application>(`/contests/${id}/applications`, body),
  getMyApplication: (id: number) =>
    request<Application>(`/contests/${id}/applications/me`),
};
export const adminApi = {
  getContests: () => request<Contest[]>("/admin/contests"),
  getUsers: () => request<AdminUser[]>("/admin/users"),
  updateUserRole: (userId: number, role: AdminUser["role"]) =>
    request<AdminUser>(`/admin/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
  getApplicationForm: (contestId: number) =>
    request<ApplicationFormField[]>(
      `/admin/contests/${contestId}/application-form`,
    ),
  createApplicationFormField: (
    contestId: number,
    body: {
      label: string;
      fieldType: ApplicationFormField["fieldType"];
      required: boolean;
      optionsText?: string;
    },
  ) =>
    request<ApplicationFormField>(
      `/admin/contests/${contestId}/application-form/fields`,
      { method: "POST", body: JSON.stringify(body) },
    ),
  deleteApplicationFormField: (contestId: number, fieldId: number) =>
    request<{ success: boolean }>(
      `/admin/contests/${contestId}/application-form/fields/${fieldId}`,
      { method: "DELETE" },
    ),
  getQuestions: (contestId: number) =>
    request<Question[]>(`/admin/contests/${contestId}/questions`),
  answerQuestion: (contestId: number, questionId: number, answer: string) =>
    request<{ id: number; answered: boolean; answer: string }>(
      `/admin/contests/${contestId}/questions/${questionId}/answer`,
      { method: "POST", body: JSON.stringify({ answer }) },
    ),
  createFaq: (
    contestId: number,
    body: { title: string; body: string; answer: string },
  ) =>
    request<Question>(`/admin/contests/${contestId}/faqs`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getApplications: () =>
    request<AdminApplication[]>("/admin/contests/applications"),
  getApplication: (contestId: number, applicationId: number) =>
    request<AdminApplication>(
      `/admin/contests/${contestId}/applications/${applicationId}`,
    ),
  updateApplicationStatus: (
    contestId: number,
    applicationId: number,
    status: string,
  ) =>
    request<{ id: number; status: string }>(
      `/admin/contests/${contestId}/applications/${applicationId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      },
    ),
  createContest: (body: Partial<Contest>) =>
    request<Contest>("/admin/contests", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateContest: (contestId: number, body: Partial<Contest>) =>
    request<Contest>(`/admin/contests/${contestId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  finishContest: (contestId: number) =>
    request<Contest>(`/admin/contests/${contestId}/finish`, {
      method: "POST",
    }),
  deleteContest: (contestId: number) =>
    request<{ success: boolean }>(`/admin/contests/${contestId}`, {
      method: "DELETE",
    }),
  createNotice: (contestId: number, body: FormData) =>
    requestFormData<ContestNotice>(
      `/admin/contests/${contestId}/notices`,
      body,
    ),
};
