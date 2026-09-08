import {
    ArrowRight,
    CalendarDays,
    ChevronRight,
    CircleAlert,
    Sparkles,
} from "lucide-react";
import type {ReactNode} from "react";

export const statusLabel = {
    draft: "준비중",
    open: "모집중",
    closed: "마감",
    finished: "종료",
} as const;

export function Badge({status}: { status: keyof typeof statusLabel }) {
    return <span className={`badge ${status}`}>{statusLabel[status]}</span>;
}

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
            <CircleAlert size={22}/>
            <p>{text}</p>
        </div>
    );
}

export function Loading() {
    return (
        <div className="loading">
            <Sparkles/> 불러오는 중...
        </div>
    );
}

export function DateInfo({
                             label,
                             value,
                             icon = true,
                         }: {
    label: string;
    value: string;
    icon?: boolean;
}) {
    return (
        <div className="date-info">
            {icon && <CalendarDays size={17}/>}
            <span>
        <small>{label}</small>
        <b>{value}</b>
      </span>
        </div>
    );
}

export function More() {
    return (
        <span className="more">
      더보기 <ChevronRight size={16}/>
    </span>
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
            <ArrowRight size={16}/>
        </button>
    );
}
