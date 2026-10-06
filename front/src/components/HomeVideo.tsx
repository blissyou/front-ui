import { useEffect, useState, type FormEvent } from "react";
import { homeVideoApi, type HomeVideoSettings } from "../services/api";
import "../home-video.css";

export function youtubeId(value: string): string | null {
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol)) return null;
    const host = url.hostname.replace(/^www\./, "");
    const id =
      host === "youtu.be"
        ? url.pathname.slice(1)
        : ["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(
              host,
            )
          ? url.pathname === "/watch"
            ? url.searchParams.get("v")
            : /^\/(embed|shorts|live)\//.test(url.pathname)
              ? url.pathname.split("/")[2]
              : null
          : null;
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function VideoShowcase({ settings }: { settings: HomeVideoSettings }) {
  const id = youtubeId(settings.url);
  const [playing, setPlaying] = useState(false);
  useEffect(() => setPlaying(false), [id]);
  return (
    <section className="home-video" aria-label="대회 소개 영상">
      <div className="home-video-section-word" aria-hidden="true">THE FILM<span>00</span></div>
      <header className="home-video-heading">
        <h2>{settings.title || "상상이 움직이는 순간."}</h2>
        <p>{settings.description}</p>
      </header>
      <div className="home-video-screen">
        {id && playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
            title={settings.title || "대회 소개 영상"}
            allow="encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : id ? (
          <button
            className="home-video-cover"
            onClick={() => setPlaying(true)}
            aria-label="대회 소개 영상 열기"
          >
            <img
              src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
              alt=""
              loading="lazy"
            />
            <span className="home-video-play">▶</span>
            <strong>WATCH THE FILM</strong>
          </button>
        ) : (
          <div className="home-video-empty">
            <span>COMING INTO FRAME</span>
            <strong>
              다음 장면의
              <br />
              주인공은, 너.
            </strong>
            <p>대회 소개 영상을 준비하고 있습니다.</p>
          </div>
        )}
      </div>
      <div className="home-video-caption">
        {id && (
          <a
            href={`https://www.youtube.com/watch?v=${id}`}
            target="_blank"
            rel="noreferrer"
          >
            YouTube에서 보기 ↗
          </a>
        )}
      </div>
    </section>
  );
}

export function HomeVideo() {
  const [settings, setSettings] = useState<HomeVideoSettings>();
  useEffect(() => {
    homeVideoApi
      .get()
      .then(setSettings)
      .catch(() => undefined);
  }, []);
  return settings?.enabled ? <VideoShowcase settings={settings} /> : null;
}

export function HomeVideoAdmin() {
  const [settings, setSettings] = useState<HomeVideoSettings>();
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    homeVideoApi
      .get()
      .then(setSettings)
      .catch(() => setMessage("영상 설정을 불러오지 못했습니다."));
  }, []);
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!settings) return;
    if (settings.url.trim() && !youtubeId(settings.url.trim())) {
      setMessage("올바른 유튜브 영상 주소를 입력해 주세요.");
      return;
    }
    setSaving(true);
    try {
      setSettings(
        await homeVideoApi.save({ ...settings, url: settings.url.trim() }),
      );
      setMessage(
        import.meta.env.VITE_MOCK_MODE === "true"
          ? "이 브라우저에 데모 설정을 저장했습니다. 홈에서 확인하세요."
          : "홈 영상 설정을 저장했습니다.",
      );
    } catch {
      setMessage(
        "저장하지 못했습니다. 로그인 상태와 입력 내용을 확인해 주세요.",
      );
    } finally {
      setSaving(false);
    }
  };
  if (!settings) return <p>{message || "불러오는 중…"}</p>;
  return (
    <section>
      <div className="manage-title">
        <h2>홈 영상 관리</h2>
        <span>영상 주소를 등록하고 홈 화면을 미리 확인하세요.</span>
      </div>
      <form className="admin-form home-video-form" onSubmit={save}>
        {import.meta.env.VITE_MOCK_MODE === "true" && (
          <p>
            목업 설정은 현재 브라우저에만 저장됩니다. 다른 방문자에게는 기본
            영상 설정이 표시됩니다.
          </p>
        )}
        <label>
          영상 제목
          <input
            maxLength={120}
            value={settings.title}
            onChange={(e) =>
              setSettings({ ...settings, title: e.target.value })
            }
          />
        </label>
        <label>
          유튜브 영상 주소
          <input
            type="url"
            placeholder="https://www.youtube.com/watch?v=…"
            value={settings.url}
            onChange={(e) => setSettings({ ...settings, url: e.target.value })}
          />
        </label>
        <label>
          소개 문구
          <textarea
            maxLength={500}
            value={settings.description}
            onChange={(e) =>
              setSettings({ ...settings, description: e.target.value })
            }
          />
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) =>
              setSettings({ ...settings, enabled: e.target.checked })
            }
          />
          홈에 영상 섹션 표시
        </label>
        <button className="btn primary" disabled={saving}>
          {saving ? "저장 중…" : "영상 설정 저장"}
        </button>
        <p role="status">{message}</p>
      </form>
      <VideoShowcase settings={settings} />
    </section>
  );
}
