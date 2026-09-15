import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loading } from "../components/UI";
import { contestApi, type ContestNotice } from "../services/api";

export function NoticeDetailPage() {
  const { contestId, noticeId } = useParams();
  const contestNumericId = Number(contestId);
  const noticeNumericId = Number(noticeId);
  const [notice, setNotice] = useState<ContestNotice>();
  const [error, setError] = useState("");

  useEffect(() => {
    contestApi
      .getNotice(contestNumericId, noticeNumericId)
      .then(setNotice)
      .catch(() => setError("공지사항을 불러오지 못했습니다."));
  }, [contestNumericId, noticeNumericId]);

  if (!notice) {
    return error ? <main className="loading">{error}</main> : <Loading />;
  }

  return (
    <main className="notice-detail-page">
      <div className="festival-page-masthead">
        <span>THE BULLETIN</span>
        <small>대회 소식 · NOTICE</small>
      </div>
      <section className="notice-detail">
        <Link
          className="public-back"
          to={`/contests/${contestNumericId}?tab=notices`}
        >
          ← 공지사항 목록
        </Link>
        <p className="eyebrow lime">CONTEST / NOTICE</p>
        <h1>{notice.title}</h1>
        <div className="notice-meta">
          <span>{notice.pinned ? "상단 고정" : "일반 공지"}</span>
          <time>{notice.createdAt?.slice(0, 10)}</time>
        </div>
        <div className="notice-detail-body">{notice.body}</div>
        {notice.youtubeUrl && youtubeEmbedUrl(notice.youtubeUrl) && (
          <section className="notice-video-section">
            <h2>영상 안내</h2>
            <div className="youtube-embed notice-youtube-embed">
              <iframe
                src={youtubeEmbedUrl(notice.youtubeUrl) ?? undefined}
                title={`${notice.title} 영상`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <a href={notice.youtubeUrl} target="_blank" rel="noreferrer">
              유튜브에서 보기 →
            </a>
          </section>
        )}
        {notice.attachments?.length > 0 && (
          <section className="notice-attachment-section">
            <h2>첨부 파일</h2>
            <div className="notice-attachment-list">
              {notice.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={`/api/public/contests/${contestNumericId}/notices/${notice.id}/attachments/${attachment.id}`}
                  download
                >
                  <div>
                    <strong>{attachment.fileName}</strong>
                    <span>{formatFileSize(attachment.fileSize)}</span>
                  </div>
                  <b>다운로드 ↓</b>
                </a>
              ))}
            </div>
          </section>
        )}
        <Link
          className="btn outline"
          to={`/contests/${contestNumericId}?tab=notices`}
        >
          공지사항 목록
        </Link>
      </section>
    </main>
  );
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

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
