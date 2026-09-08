import {Link} from "react-router-dom";
import type {ContestNotice} from "../services/api";
import {Empty} from "./UI";

export function NoticeBoard({
                                notices,
                                getNoticeUrl,
                                emptyText = "등록된 공지사항이 없습니다.",
                            }: {
    notices: ContestNotice[];
    getNoticeUrl: (notice: ContestNotice) => string;
    emptyText?: string;
}) {
    if (!notices.length) {
        return <Empty text={emptyText}/>;
    }

    return (
        <div className="notice-board">
            <div className="notice-board-head" aria-hidden="true">
                <span>번호</span>
                <span>제목</span>
                <span>등록일</span>
            </div>
            {notices.map((notice, index) => (
                <article key={notice.id}>
                    <Link className="notice-row" to={getNoticeUrl(notice)}>
            <span className={notice.pinned ? "notice-pin" : ""}>
              {notice.pinned ? "공지" : notices.length - index}
            </span>
                        <strong>{notice.title}</strong>
                        <time>{notice.createdAt?.slice(0, 10) ?? "-"}</time>
                    </Link>
                </article>
            ))}
        </div>
    );
}
