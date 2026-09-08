import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "../services/api";

export type Member = {
  id: number;
  email: string;
  role: string;
};
type AuthContextValue = {
  member: Member | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (body: Record<string, string | number>) => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi
      .me()
      .then((data) => setMember(data as Member))
      .catch(() => setMember(null))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      member,
      loading,
      login: async (email: string, password: string) => {
        const data = await authApi.login(email, password);
        setMember(data as Member);
      },
      logout: async () => {
        await authApi.logout();
        setMember(null);
      },
      updateProfile: async (body: Record<string, string | number>) => {
        const data = await authApi.updateProfile(body);
        setMember(data as Member);
      },
    }),
    [member, loading],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthProvider 안에서 사용해야 합니다.");
  return context;
}
