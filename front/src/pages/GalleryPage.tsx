import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  X,
  Search,
  Images,
} from "lucide-react";
import { galleryApi, type GalleryPhoto } from "../services/api";
import "../gallery.css";

const PAGE_SIZE = 24;

function Artwork({ moment }: { moment: GalleryPhoto }) {
  if (moment.imageUrl)
    return (
      <img
        src={moment.imageUrl}
        alt={moment.title}
        loading="lazy"
        decoding="async"
      />
    );
  return (
    <div
      className={`archive-art archive-art-${["lime", "orange", "dark", "blue", "cream", "pink"][moment.id % 6]}`}
      aria-hidden="true"
    >
      <span className="archive-art-label">
        CREATIVE COMPUTING / {moment.year}
      </span>
      <svg viewBox="0 0 600 420" fill="none">
        {moment.id % 3 === 1 ? (
          Array.from({ length: 9 }, (_, i) => (
            <ellipse
              key={i}
              cx="300"
              cy={130 + i * 20}
              rx={150 - i * 7}
              ry="62"
              transform={`rotate(-22 300 ${130 + i * 20})`}
              fill="currentColor"
              fillOpacity={0.08 + i * 0.025}
              stroke="currentColor"
              strokeWidth="2"
            />
          ))
        ) : moment.id % 3 === 2 ? (
          <g stroke="currentColor" strokeWidth="3">
            <rect x="135" y="80" width="330" height="225" rx="8" />
            <path d="M135 120h330M230 160l-45 40 45 40m140-80 45 40-45 40m-40-95-50 110M260 305v35m80-35v35m-110 0h140" />
            <circle cx="155" cy="100" r="3" />
            <circle cx="170" cy="100" r="3" />
          </g>
        ) : (
          <g stroke="currentColor" strokeWidth="2">
            {[0, 60, 120].map((a) => (
              <ellipse
                key={a}
                cx="300"
                cy="205"
                rx="185"
                ry="70"
                transform={`rotate(${a} 300 205)`}
              />
            ))}
            <circle cx="300" cy="205" r="38" fill="currentColor" />
            <circle cx="460" cy="170" r="13" fill="currentColor" />
          </g>
        )}
      </svg>
      <span className="archive-art-number">0{moment.id} / IDEAS IN ACTION</span>
      <span className="archive-art-sample">ILLUSTRATION</span>
    </div>
  );
}

export function GalleryPage() {
  const [moments, setMoments] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState("전체");
  const [category, setCategory] = useState("전체");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<GalleryPhoto | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const filtered = moments.filter(
    (m) =>
      (year === "전체" || m.year === year) &&
      (category === "전체" || m.category === category) &&
      `${m.title} ${m.year} ${m.category}`.includes(query.trim()),
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const collection = useRef<HTMLElement>(null);
  useEffect(() => {
    galleryApi
      .list()
      .then(setMoments)
      .catch(() => setMoments([]))
      .finally(() => setLoading(false));
  }, []);
  const changePage = (next: number) => {
    setPage(next);
    collection.current?.scrollIntoView({ block: "start" });
  };
  useEffect(() => {
    if (selected && !dialog.current?.open) dialog.current?.showModal();
  }, [selected]);
  const move = (offset: number) => {
    const index = filtered.findIndex((m) => m.id === selected?.id);
    setSelected(filtered[(index + offset + filtered.length) % filtered.length]);
  };
  return (
    <main className="archive-page">
      <section className="archive-hero">
        <div>
          <p className="archive-eyebrow">MOMENTS & MEMORIES</p>
          <h1>
            대회의 순간들<span>.</span>
          </h1>
          <p className="archive-intro">
            함께 만들고, 도전하고, 나누었던 시간을 모았습니다.
          </p>
        </div>
        <div className="archive-heading-mark" aria-hidden="true">
          <Images size={24} />
          <span>
            AI·SW
            <br />
            PHOTO ARCHIVE
          </span>
        </div>
      </section>
      <section
        ref={collection}
        className="archive-collection"
        aria-label="대회 갤러리"
      >
        <div className="archive-toolbar">
          <div className="archive-years" aria-label="연도 필터">
            {[
              "전체",
              ...Array.from(new Set(moments.map((item) => item.year)))
                .sort()
                .reverse(),
            ].map((y) => (
              <button
                key={y}
                aria-pressed={year === y}
                onClick={() => {
                  setYear(y);
                  setPage(1);
                }}
              >
                {y === "전체" ? "전체 기록" : `${y}년`}
              </button>
            ))}
          </div>
          <div className="archive-tools">
            <label>
              분류{" "}
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
              >
                {[
                  "전체",
                  ...Array.from(new Set(moments.map((item) => item.category))),
                ].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="archive-search">
              <Search size={16} />
              <input
                aria-label="사진 검색"
                type="search"
                placeholder="사진 검색"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
              />
            </label>
          </div>
        </div>
        <div className="archive-count" role="status">
          <span>
            총 <strong>{filtered.length}</strong>개의 기록
          </span>
          <small>예시 이미지 · 실제 대회 사진은 추후 공개됩니다.</small>
        </div>
        <div className="archive-grid">
          {visible.map((moment) => (
            <button
              key={moment.id}
              className="archive-card"
              onClick={() => setSelected(moment)}
              aria-label={`${moment.title} 상세 보기`}
            >
              <div className="archive-card-image">
                <Artwork moment={moment} />
                <span className="archive-open">
                  <ArrowUpRight />
                </span>
              </div>
              <div className="archive-card-meta">
                <span>
                  {moment.year} — {moment.category}
                </span>
              </div>
              <h3>{moment.title}</h3>
            </button>
          ))}
        </div>
        {!loading && filtered.length === 0 && (
          <div className="archive-empty">
            <Images size={30} />
            <h2>
              {moments.length
                ? "검색 결과가 없습니다."
                : "아직 등록된 사진이 없습니다."}
            </h2>
            <p>
              {moments.length
                ? "다른 검색어나 분류를 선택해 주세요."
                : "대회의 새로운 기록을 준비하고 있습니다."}
            </p>
            {moments.length > 0 && (
              <button
                onClick={() => {
                  setQuery("");
                  setYear("전체");
                  setCategory("전체");
                  setPage(1);
                }}
              >
                전체 사진 보기
              </button>
            )}
          </div>
        )}
        {pageCount > 1 && (
          <nav className="archive-pagination" aria-label="갤러리 페이지">
            <button
              disabled={page === 1}
              onClick={() => changePage(page - 1)}
              aria-label="이전 페이지"
            >
              <ArrowLeft size={16} />
            </button>
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                aria-label={`${i + 1}페이지`}
                aria-current={page === i + 1 ? "page" : undefined}
                onClick={() => changePage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={page === pageCount}
              onClick={() => changePage(page + 1)}
              aria-label="다음 페이지"
            >
              <ArrowRight size={16} />
            </button>
          </nav>
        )}
      </section>
      <dialog
        ref={dialog}
        className="archive-dialog"
        aria-labelledby="archive-dialog-title"
        onClose={() => setSelected(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") move(1);
          if (e.key === "ArrowLeft") move(-1);
        }}
      >
        {selected && (
          <>
            <button
              className="archive-close"
              autoFocus
              aria-label="상세 보기 닫기"
              onClick={() => dialog.current?.close()}
            >
              <X />
            </button>
            <Artwork moment={selected} />
            <div className="archive-dialog-copy">
              <p>
                {selected.year} / {selected.category} / 예시 기록
              </p>
              <h2 id="archive-dialog-title">{selected.title}</h2>
              <p>{selected.description}</p>
              <div className="archive-dialog-nav">
                <button aria-label="이전 기록" onClick={() => move(-1)}>
                  <ArrowLeft /> 이전
                </button>
                <span>
                  {filtered.findIndex((m) => m.id === selected.id) + 1} /{" "}
                  {filtered.length}
                </span>
                <button aria-label="다음 기록" onClick={() => move(1)}>
                  다음 <ArrowRight />
                </button>
              </div>
            </div>
          </>
        )}
      </dialog>
    </main>
  );
}
