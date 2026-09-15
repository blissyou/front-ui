import { useEffect, useRef, useState } from "react";

export function ContestSculpture({ interactive = false }: { interactive?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let dispose: (() => void) | undefined;
    import("./sculptureScene")
      .then(({ createSculptureScene }) => {
        if (cancelled || !host.current) return;
        try {
          dispose = createSculptureScene(host.current);
          setReady(true);
        } catch {
          setReady(false);
        }
      })
      .catch(() => {
        if (!cancelled) setReady(false);
      });
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);
  return (
    <div className="contest-sculpture genesis-sculpture">
      <div className="sculpture-webgl" ref={host} aria-hidden="true" />
      {!ready && (
        <div className="genesis-fallback" aria-hidden="true">
          <i /><i /><i />
        </div>
      )}
      <span className="sculpture-caption">A UNIVERSE OF POSSIBILITIES</span>
      <span className="sculpture-corner" aria-hidden="true">+</span>
      {interactive && ready && (
        <span className="galaxy-hint">별빛 위로 마우스를 움직여보세요 ↗</span>
      )}
    </div>
  );
}