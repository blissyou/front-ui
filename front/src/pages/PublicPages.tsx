import {useEffect, useRef, useState} from "react";
import {Link} from "react-router-dom";
import {ArrowDown, ArrowUpRight, ArrowRight, Pause, Play} from "lucide-react";
import {contestApi, type Contest} from "../services/api";
import "../home.css";

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
    const [paused, setPaused] = useState(false);
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
            {threshold: 0.12},
        );
        root.current
            ?.querySelectorAll(".arena-reveal")
            .forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);
    const featured =
        contests.find((contest) => contest.status === "OPEN") ?? contests[0];

    return (
        <main ref={root} className={`arena-home${paused ? " motion-paused" : ""}`}>
            <section id="about" className="arena-hero">
                <div className="arena-kicker">
          <span>
            <i/> NEXT GENERATION, YOUR CREATION.
          </span>
                    <span>2026 / NATIONAL HIGH SCHOOL</span>
                </div>
                <div className="arena-hero-grid">
                    <div className="arena-copy">
                        <p className="arena-overline">
                            전국 고등학교 동아리 AI·SW 경진대회
                        </p>
                        <h1>
                            상상을 넘어,
                            <br/>
                            <span>실행의 무대로.</span>
                        </h1>
                        <p className="arena-description">
                            세상을 바꿀 다음 아이디어는 교실 안에 있다.
                            <br/>
                            우리 동아리의 가능성을, AI와 코드로 증명할 시간.
                        </p>
                        <div className="arena-actions">
                            <a className="arena-button" href="#contests">
                                대회 참가하기 <ArrowUpRight size={21}/>
                            </a>
                            <a className="arena-text-link" href="#possibilities">
                                도전 살펴보기 <ArrowDown size={16}/>
                            </a>
                        </div>
                        <div className="arena-hero-note">
                            <span>IDEA → CODE → IMPACT</span>
                            <span>당신의 다음 줄이, 다음 세상을 만든다.</span>
                        </div>
                    </div>
                    <div className="arena-art" aria-hidden="true">
                        <div className="arena-art-top">
                            <span>FIG. 01 — THE NEXT WAVE</span>
                            <span>AI × SW</span>
                        </div>
                        <div className="arena-orbit orbit-one"/>
                        <div className="arena-orbit orbit-two"/>
                        <div className="arena-wireball">
                            {Array.from({length: 9}, (_, i) => (
                                <span key={i} style={{transform: `rotateY(${i * 20}deg)`}}/>
                            ))}
                        </div>
                        <div className="arena-code-mark">
                            &#123;<span>✳</span>&#125;
                        </div>
                        <span className="arena-art-tag tag-one">01 / THINK</span>
                        <span className="arena-art-tag tag-two">02 / BUILD</span>
                        <div className="arena-art-bottom">
              <span>
                HUMAN IDEAS.
                <br/>
                UNLIMITED POSSIBILITIES.
              </span>
                            <span className="arena-cross">+</span>
                        </div>
                    </div>
                </div>
                <div className="arena-hero-bottom">
                    <a href="#contests">
                        <ArrowDown size={16}/> SCROLL TO EXPLORE
                    </a>
                    <button
                        onClick={() => setPaused(!paused)}
                        aria-label={paused ? "애니메이션 재생" : "애니메이션 일시정지"}
                    >
                        {paused ? <Play size={14}/> : <Pause size={14}/>} MOTION{" "}
                        {paused ? "OFF" : "ON"}
                    </button>
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
                <div className="arena-section-heading">
                    <div>
                        <p className="arena-overline">01 / THE CHALLENGE</p>
                        <h2>다음 도전은, 여기서.</h2>
                    </div>
                    <p>
                        아이디어를 꺼내고, 팀을 모으고.
                        <br/>
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
                            다시 시도 <ArrowRight size={16}/>
                        </button>
                    </div>
                ) : featured ? (
                    <Link className="arena-contest" to={`/contests/${featured.id}`}>
                        <div className="arena-contest-poster" aria-hidden="true">
              <span>
                2026
                <br/>
                AI·SW
              </span>
                            <strong>
                                LET’S
                                <br/>
                                BUILD<span>↗</span>
                            </strong>
                            <small>NATIONAL HIGH SCHOOL CLUB CONTEST</small>
                        </div>
                        <div className="arena-contest-info">
              <span
                  className={`arena-status ${featured.status === "OPEN" ? "is-open" : ""}`}
              >
                <i/>
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
                대회 안내 및 참가 신청 <ArrowUpRight size={23}/>
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
                                <ArrowUpRight size={22}/>
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
                    우리의 도전 시작하기 <ArrowUpRight size={21}/>
                </a>
            </section>
        </main>
    );
}
