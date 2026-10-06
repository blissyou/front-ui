import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Play, X } from "lucide-react";
import "../welcome.css";

const sourceUrl =
  "https://www.highschool-swcontest.net/%ED%99%98%EC%98%81%EC%82%AC-1";
const imageRoot = "https://static.wixstatic.com/media/";
const videoRoot = "https://video.wixstatic.com/video/";
// Names, affiliations and media verified against the original welcome page.
const speakers = [
  {
    name: "황경호",
    role: "단장",
    institution: "한밭대 SW중심대학사업단",
    label: "HANBAT NATIONAL UNIVERSITY",
    image: "50de4b_5d693df046c940f6af94ae95f9f65399~mv2.jpg",
    video: "50de4b_cc55802565834a77bf7d9bd315cedfe3/1080p/mp4/file.mp4",
  },
  {
    name: "배두환",
    role: "센터장",
    institution: "KAIST SW교육센터",
    label: "KAIST",
    image: "50de4b_e1bb5ffabc464af98c04695367ac83f1~mv2.jpg",
    video: "50de4b_dca4775a8b4748668cfc3dcbc2549454/480p/mp4/file.mp4",
  },
  {
    name: "한태우",
    role: "단장",
    institution: "우송대 SW중심대학사업단",
    label: "WOOSONG UNIVERSITY",
    image: "50de4b_a5ba0714a2ba40ae9dbfae627b4c761d~mv2.jpg",
    video: "50de4b_86669405e02e4b7784419ea3798940e5/720p/mp4/file.mp4",
  },
  {
    name: "김종익",
    role: "단장",
    institution: "충남대 소프트웨어중심대학사업단",
    label: "CHUNGNAM NATIONAL UNIVERSITY",
    image: "",
    video: "50de4b_dc87ba067d3b450eaf7f05f3346d1246/720p/mp4/file.mp4",
  },
  {
    name: "김용석",
    role: "단장",
    institution: "건양대 SW중심대학사업단",
    label: "KONYANG UNIVERSITY",
    image: "50de4b_3c36e87f44d64188b239645089bde5d1~mv2.jpg",
    video: "50de4b_ac92bdb3de9547b7977c7a06d7887bd9/1080p/mp4/file.mp4",
  },
];
type Speaker = (typeof speakers)[number];

export function WelcomePage() {
  const [selected, setSelected] = useState<Speaker | null>(null);
  const [failed, setFailed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const player = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (selected) {
      setFailed(false);
      dialog.current?.showModal();
    }
  }, [selected]);
  const close = () => {
    player.current?.pause();
    dialog.current?.close();
  };

  return (
    <main className="welcome-page">
      <section className="welcome-hero">
        <p className="welcome-kicker">WELCOME / AI × SW CONTEST</p>
        <div className="welcome-heading">
          <h1>
            여러분의 도전을
            <br />
            <span>환영합니다.</span>
          </h1>
          <ArrowUpRight size={76} aria-hidden="true" />
        </div>
        <div className="welcome-intro">
          <p>
            아이디어를 펼치고, 새로운 가능성을 발견하는 시간.
            <br />
            대회에 함께하는 여러분을 위한 환영의 메시지를 만나보세요.
          </p>
          <span>
            05 MESSAGES
            <br />
            ONE SHARED BEGINNING
          </span>
        </div>
      </section>
      <section
        className="welcome-messages"
        aria-labelledby="welcome-messages-title"
      >
        <div className="welcome-section-heading">
          <h2 id="welcome-messages-title">환영의 메시지</h2>
          <p>카드를 선택하면 환영사 영상을 볼 수 있습니다.</p>
        </div>
        <div className="welcome-grid">
          {speakers.map((speaker, index) => (
            <button
              key={speaker.name}
              className="welcome-card"
              onClick={() => setSelected(speaker)}
              aria-label={`${speaker.name} ${speaker.role} 환영사 보기`}
            >
              <div className="welcome-portrait">
                {speaker.image ? (
                  <img
                    src={`${imageRoot}${speaker.image}`}
                    alt={`${speaker.name} ${speaker.role}`}
                    loading="lazy"
                  />
                ) : (
                  <div className="welcome-monogram" aria-hidden="true">
                    <span>MESSAGE FROM</span>
                    <strong>김종익</strong>
                    <small>
                      CHUNGNAM
                      <br />
                      NATIONAL UNIVERSITY
                    </small>
                  </div>
                )}
                <span className="welcome-card-index">0{index + 1}</span>
                <span className="welcome-play">
                  <Play size={17} fill="currentColor" />
                </span>
              </div>
              <div className="welcome-card-copy">
                <span>{speaker.label}</span>
                <h3>
                  {speaker.name} <small>{speaker.role}</small>
                </h3>
                <p>{speaker.institution}</p>
                <div>
                  환영사 보기 <ArrowUpRight size={16} />
                </div>
              </div>
            </button>
          ))}
        </div>
        <p className="welcome-credit">
          이름과 소속은{" "}
          <a href={sourceUrl} target="_blank" rel="noreferrer">
            기존 대회 환영사 페이지
          </a>{" "}
          기준입니다. 영상과 사진의 저작권은 원 저작권자에게 있습니다.
        </p>
      </section>
      <dialog
        ref={dialog}
        className="welcome-dialog"
        aria-labelledby="welcome-video-title"
        onClose={() => {
          player.current?.pause();
          setSelected(null);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        {selected && (
          <>
            <div className="welcome-dialog-heading">
              <div>
                <p>{selected.institution}</p>
                <h2 id="welcome-video-title">
                  {selected.name} {selected.role}의 환영사
                </h2>
              </div>
              <button autoFocus onClick={close} aria-label="환영사 닫기">
                <X size={22} />
              </button>
            </div>
            <video
              ref={player}
              controls
              playsInline
              preload="metadata"
              src={`${videoRoot}${selected.video}`}
              onError={() => setFailed(true)}
              aria-label={`${selected.name} 환영사 영상`}
            />
            {failed && (
              <p className="welcome-video-error" role="alert">
                영상을 불러오지 못했습니다. 아래 원본 영상 링크에서 확인해
                주세요.
              </p>
            )}
            <div className="welcome-dialog-bottom">
              <span>© 원 저작권자 · 환영사 영상</span>
              <a
                href={`${videoRoot}${selected.video}`}
                target="_blank"
                rel="noreferrer"
              >
                원본 영상 열기 ↗
              </a>
            </div>
          </>
        )}
      </dialog>
    </main>
  );
}
