import { ArrowRight, CircleAlert, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export function Section({
  eyebrow,
  title,
  children,
  action,
  id,
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  action?: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="section">
      <div className="section-head">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Empty({
  text = "아직 등록된 내용이 없어요.",
}: {
  text?: string;
}) {
  return (
    <div className="empty">
      <CircleAlert size={22} />
      <p>{text}</p>
    </div>
  );
}

export function Loading() {
  return (
    <div className="loading">
      <Sparkles /> 불러오는 중...
    </div>
  );
}

export function SubmitButton({
  children = "저장하기",
  disabled = false,
}: {
  children?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button className="btn primary" type="submit" disabled={disabled}>
      {children}
      <ArrowRight size={16} />
    </button>
  );
}
