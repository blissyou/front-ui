import { Link, NavLink, Outlet } from "react-router-dom";
import {
  ClipboardList,
  Flag,
  LayoutDashboard,
  Menu,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../public.css";
import { useAuth } from "../auth/AuthProvider";

export function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { member, loading, logout } = useAuth();
  const location = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [location]);
  return (
    <div className="public-shell">
      <header className="public-nav">
        <Link to="/" className="brand">
          <i>AI</i>
          <span>
            NATIONAL
            <br />
            <b>AI·SW CONTEST</b>
          </span>
        </Link>
        <button
          className="menu-btn"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          aria-controls="public-menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav
          id="public-menu"
          className={open ? "open" : ""}
          onClick={() => setOpen(false)}
        >
          <a href="/#about">대회 소개</a>
          <a href="/#contests">대회 참가</a>
          {!loading &&
            (member ? (
              <>
                <Link className="member-name" to="/member">
                  {member.email}
                </Link>
                <button className="text-button" onClick={() => void logout()}>
                  로그아웃
                </button>
              </>
            ) : (
              <Link to="/member">로그인</Link>
            ))}
          {member?.role === "ADMIN" && (
            <Link className="admin-link" to="/admin">
              운영자
            </Link>
          )}
        </nav>
      </header>
      <Outlet />
      <footer>
        <div className="brand">
          <i>AI</i>
          <span>
            NATIONAL
            <br />
            <b>AI·SW CONTEST</b>
          </span>
        </div>
        <p>
          2026 전국 고등학교 동아리 AI·SW 경진대회
          <br />© HANBIT UNIVERSITY. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </div>
  );
}

const menus = [
  ["/admin", LayoutDashboard, "대시보드"],
  ["/admin/competitions", Flag, "대회 관리"],
  ["/admin/applications", ClipboardList, "참가 신청 관리"],
  ["/admin/users", Users, "사용자 관리"],
] as const;

export function AdminLayout() {
  const { member } = useAuth();
  return (
    <div className="admin-shell">
      <aside>
        <Link to="/" className="brand">
          <i>AI</i>
          <span>
            NATIONAL
            <br />
            <b>AI·SW CONTEST</b>
          </span>
        </Link>
        <p className="side-label">OPERATIONS</p>
        {menus.map(([to, Icon, label]) => (
          <NavLink key={to} end={to === "/admin"} to={to}>
            <Icon size={19} />
            {label}
          </NavLink>
        ))}
        <div className="admin-user">
          <span>{member?.email.slice(0, 1).toUpperCase() ?? "?"}</span>
          <div>
            <b>{member?.email ?? "로그인 필요"}</b>
            <small>
              {member?.role === "ADMIN" ? "Administrator" : "Member"}
            </small>
          </div>
        </div>
      </aside>
      <main className="admin-main">
        <div className="admin-top">
          <div>
            <h1>
              안녕하세요, {member?.email ?? "방문자"} <span>✦</span>
            </h1>
          </div>
          <Link to="/" className="btn outline">
            공개 사이트 보기
          </Link>
        </div>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
