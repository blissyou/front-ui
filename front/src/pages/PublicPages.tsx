import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUpRight, ArrowRight } from "lucide-react";
import { contestApi, type Contest } from "../services/api";
import "../home.css";
import { ContestSculpture } from "../components/ContestSculpture";

const statusText: Record<string, string> = {
  OPEN: "모집 중",
  DRAFT: "준비 중",
  CLOSED: "모집 마감",
  FINISHED: "종료",
};
const date = (value?: string) =>
  value ? value.slice(0, 10).replace(/-/g, ".") : "추후 안내";

export function Home() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const root = useRef<HTMLElement>(null);
  const fetchContests = () => {
    setLoading(true);
    setError("");
    contestApi
      .getContests()
      .then(setContests)
      .catch(() => setError("대회 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  };
  useEffect(fetchContests, []);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    root.current
      ?.querySelectorAll(".arena-reveal")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  const featured =
    contests.find((contest) => contest.status === "OPEN") ?? contests[0];

  return (
    <main ref={root} className="arena-home">
      <section
        id="about"
        className="arena-hero genesis-hero"
        onPointerMove={(event) => {
          if (
            event.currentTarget.closest(".site-motion-paused") ||
            event.pointerType !== "mouse" ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
          )
            return;
          const bounds = event.currentTarget.getBoundingClientRect();
          event.currentTarget.style.setProperty(
            "--look-x",
            `${((event.clientX - bounds.left) / bounds.width - 0.5) * 16}deg`,
          );
          event.currentTarget.style.setProperty(
            "--look-y",
            `${((event.clientY - bounds.top) / bounds.height - 0.5) * -12}deg`,
          );
        }}
        onPointerLeave={(event) => {
          event.currentTarget.style.setProperty("--look-x", "0deg");
          event.currentTarget.style.setProperty("--look-y", "0deg");
        }}
      >
        <div className="arena-kicker">
          <span>
            <i /> NEXT GENERATION, YOUR CREATION.
          </span>
          <span>2026 / NATIONAL HIGH SCHOOL</span>
        </div>
        <div className="arena-hero-grid">
          <div className="arena-copy">
            <p className="arena-overline">
              전국 고등학교 동아리 AI·SW 경진대회
            </p>
            <h1 className="festival-accessible-title">
              작은 시작으로,
              <br />
              <span>너만의 세계를.</span>
            </h1>
            <div className="festival-display" aria-hidden="true">
              <span>MAKE</span>
              <span>WHAT’S</span>
              <span>
                NEXT<span className="festival-period">↗</span>
              </span>
            </div>
            <p className="festival-korean-title">작은 시작으로, 너만의 세계를.</p>
            <p className="arena-description">
              하나의 점이 이 세계가 된 것처럼.
              <br />
              너의 첫 아이디어도, 상상 이상의 무언가가 될 수 있어.
            </p>
            <div className="arena-actions">
              <a className="arena-button" href="#contests">
                대회 참가하기 <ArrowUpRight size={21} />
              </a>
              <a className="arena-text-link" href="#possibilities">
                도전 살펴보기 <ArrowDown size={16} />
              </a>
            </div>
          </div>
          <div className="festival-object-panel">
            <div className="festival-object-label">
              <span>GENESIS / A STUDY OF POSSIBILITY</span>
              <span>[ AI × SW ]</span>
            </div>
            <ContestSculpture interactive />
            <div className="genesis-art-note"><span>ONE SPARK. A WHOLE UNIVERSE.</span><b>이 모든 가능성의 시작은, 너.</b></div>
          </div>
        </div>
        <div className="arena-hero-bottom">
          <a href="#contests">
            <ArrowDown size={16} /> SCROLL TO EXPLORE
          </a>
        </div>
      </section>
      <div className="arena-marquee" aria-hidden="true">
        <div>
          {[0, 1, 2, 3].map((i) => (
            <span key={i}>
              MAKE IT REAL <b>✳</b> AI × SOFTWARE <b>✳</b> CHALLENGE THE NEXT{" "}
              <b>✳</b>{" "}
            </span>
          ))}
        </div>
      </div>
      <section id="contests" className="arena-contests arena-reveal">
        <div className="festival-section-word" aria-hidden="true">
          THE CHALLENGE<span>01</span>
        </div>
        <div className="arena-section-heading">
          <div>
            <p className="arena-overline">01 / THE CHALLENGE</p>
            <h2>다음 도전은, 여기서.</h2>
          </div>
          <p>
            아이디어를 꺼내고, 팀을 모으고.
            <br />
            이제 여러분의 무대를 만나보세요.
          </p>
        </div>
        {loading ? (
          <div className="arena-state" role="status">
            대회 정보를 불러오는 중입니다…
          </div>
        ) : error ? (
          <div className="arena-state" role="alert">
            {error}
            <button onClick={fetchContests}>
              다시 시도 <ArrowRight size={16} />
            </button>
          </div>
        ) : featured ? (
          <Link className="arena-contest" to={`/contests/${featured.id}`}>
            <div className="arena-contest-poster" aria-hidden="true">
              <span>
                2026
                <br />
                AI·SW
              </span>
              <strong>
                LET’S
                <br />
                BUILD<span>↗</span>
              </strong>
              <small>NATIONAL HIGH SCHOOL CLUB CONTEST</small>
            </div>
            <div className="arena-contest-info">
              <span
                className={`arena-status ${featured.status === "OPEN" ? "is-open" : ""}`}
              >
                <i />
                {statusText[featured.status] ?? featured.status}
              </span>
              <h3>{featured.title}</h3>
              <p>{featured.description}</p>
              <dl>
                <div>
                  <dt>참가 신청</dt>
                  <dd>
                    {date(featured.applicationStartAt)} —{" "}
                    {date(featured.applicationEndAt)}
                  </dd>
                </div>
                <div>
                  <dt>대회 기간</dt>
                  <dd>
                    {date(featured.startDate)} — {date(featured.endDate)}
                  </dd>
                </div>
              </dl>
              <span className="arena-contest-cta">
                대회 안내 및 참가 신청 <ArrowUpRight size={23} />
              </span>
            </div>
          </Link>
        ) : (
          <div className="arena-state">
            새로운 도전을 준비하고 있습니다. 대회가 공개되면 이곳에서
            안내합니다.
          </div>
        )}
      </section>
      <section id="possibilities" className="arena-possibilities arena-reveal">
        <div className="festival-section-word" aria-hidden="true">
          NO LIMITS.<span>02</span>
        </div>
        <div className="arena-section-heading">
          <div>
            <p className="arena-overline">02 / YOUR POSSIBILITIES</p>
            <h2>정답 대신, 당신의 방식으로.</h2>
          </div>
        </div>
        <div className="arena-principles">
          {[
            [
              "01",
              "THINK",
              "질문에서 시작하는 AI",
              "일상 속 작은 불편부터 새로운 가능성까지. AI로 풀고 싶은 여러분만의 질문을 찾아보세요.",
              "AI / CURIOSITY",
            ],
            [
              "02",
              "BUILD",
              "아이디어를 움직이는 SW",
              "머릿속 상상을 실제로 작동하는 프로젝트로. 한 줄의 코드로 변화를 시작해 보세요.",
              "SOFTWARE / CREATION",
            ],
            [
              "03",
              "CHALLENGE",
              "함께 만드는 다음 장면",
              "서로 다른 생각이 만나 더 큰 도전이 됩니다. 동아리와 함께 여러분의 결과물을 보여 주세요.",
              "TEAM / CHALLENGE",
            ],
          ].map(([number, title, subtitle, description, tag]) => (
            <article key={number}>
              <div className="arena-principle-top">
                <span>{number}</span>
                <ArrowUpRight size={22} />
              </div>
              <h3>
                {title}
                <span>.</span>
              </h3>
              <h4>{subtitle}</h4>
              <p>{description}</p>
              <small>{tag}</small>
            </article>
          ))}
        </div>
      </section>
      <section className="arena-end arena-reveal">
        <p className="arena-overline">IT STARTS WITH YOUR IDEA.</p>
        <h2>다음은, 여러분 차례.</h2>
        <a className="arena-button" href="#contests">
          우리의 도전 시작하기 <ArrowUpRight size={21} />
        </a>
      </section>
    </main>
  );
}
