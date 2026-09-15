import * as THREE from "three";

export function createSculptureScene(host: HTMLDivElement) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 30);
  camera.position.z = 7.2;
  // Seeded spiral arms with sparse bright stars and a dense luminous nucleus.
  const count = 8500;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  let randomState = 42;
  const random = () => { randomState = (1664525 * randomState + 1013904223) >>> 0; return randomState / 4294967296; };
  for (let i = 0; i < count; i++) {
    const radius = i < 1400 ? Math.pow(random(), 2) * 0.55 : 0.18 + Math.pow(random(), 0.8) * 2.55;
    const arm = i % 3;
    const scatter = (random() + random() + random() - 1.5) * (0.08 + radius * 0.06);
    const angle = arm * Math.PI * 2 / 3 + radius * 2.3 + scatter;
    positions[i * 3] = Math.cos(angle) * radius + (random() - 0.5) * 0.09;
    positions[i * 3 + 1] = Math.sin(angle) * radius + (random() - 0.5) * 0.09;
    positions[i * 3 + 2] = (random() - 0.5) * 0.2 * (1 + radius * 0.25);
    if (i > 8100) {
      positions[i * 3] = (random() - 0.5) * 7;
      positions[i * 3 + 1] = (random() - 0.5) * 7;
    }
    seeds[i] = random();
  }
  positions.set([0, 0, 0], 0);
  seeds[0] = 2;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("seed", new THREE.BufferAttribute(seeds, 1));
  const material = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { time: { value: 0 }, cursor: { value: new THREE.Vector2(20, 20) }, influence: { value: 0 }, pixelRatio: { value: renderer.getPixelRatio() } },
    vertexShader: `
      attribute float seed;
      uniform float time;
      uniform vec2 cursor;
      uniform float influence;
      uniform float pixelRatio;
      varying float vSeed;
      varying float vLight;
      void main() {
        vSeed = seed;
        vec3 p = position;
        float a = time * 0.025;
        p.xy = mat2(cos(a), -sin(a), sin(a), cos(a)) * p.xy;
        vec4 view = modelViewMatrix * vec4(p, 1.0);
        vec2 away = view.xy - cursor;
        float distanceToCursor = length(away);
        float force = exp(-distanceToCursor * distanceToCursor * 2.4) * influence;
        vec2 direction = away / max(distanceToCursor, 0.04);
        view.xy += (direction * 0.32 + vec2(sin(seed * 90.0 + time), cos(seed * 67.0 + time)) * 0.13) * force;
        gl_Position = projectionMatrix * view;
        float size = seed > 1.0 ? 260.0 : (seed > 0.965 ? 40.0 + seed * 16.0 : 2.5 + seed * 3.5);
        gl_PointSize = clamp(size * pixelRatio * 5.0 / -view.z, 1.0, 240.0);
        vLight = 0.8 + 0.2 * sin(seed * 32.0 + time * 0.8);
      }
    `,
    fragmentShader: `
      varying float vSeed;
      varying float vLight;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        if (d > 1.0) discard;
        vec3 color = vSeed < 0.7 ? vec3(0.35, 0.72, 1.0) : vec3(1.0, 0.55, 0.3);
        float light;
        if (vSeed > 0.965) {
          color = fract(vSeed * 73.0) < 0.75 ? vec3(0.63, 0.85, 1.0) : vec3(1.0, 0.7, 0.5);
          color = mix(color, vec3(1.0), exp(-d * d * 180.0));
          light = exp(-d * d * 65.0) + 0.2 * exp(-d * d * 8.0);
        } else {
          light = pow(1.0 - d, 1.6) * 0.8;
        }
        if (vSeed > 1.0) { color = vec3(0.82, 0.93, 1.0); light = 0.65 * exp(-d * d * 8.0); }
        gl_FragColor = vec4(color, light * vLight);
      }
    `,
  });
  const field = new THREE.Points(geometry, material);
  field.rotation.set(0.22, -0.12, -0.35);
  scene.add(field);
  let previous = 0, phase = 0, inView = true, disposed = false, contextLost = false;
  let pointerActive = false;
  const targetCursor = new THREE.Vector2(20, 20);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const shell = host.closest(".public-shell");
  const panel = host.closest(".festival-object-panel") ?? host;
  const paused = () => reduced.matches || !!shell?.classList.contains("site-motion-paused");
  const draw = () => { if (!disposed && !contextLost) renderer.render(scene, camera); };
  const animate = (time: number) => {
    const delta = previous ? Math.min((time - previous) / 1000, 0.05) : 0;
    previous = time;
    phase += delta;
    material.uniforms.time.value = phase;
    material.uniforms.influence.value += ((pointerActive ? 1 : 0) - material.uniforms.influence.value) * (1 - Math.exp(-delta * (pointerActive ? 4 : 1.6)));
    material.uniforms.cursor.value.lerp(targetCursor, 1 - Math.exp(-delta * 5));
    draw();
  };
  const sync = () => {
    previous = 0;
    renderer.setAnimationLoop(!paused() && inView && !document.hidden && !contextLost ? animate : null);
    draw();
  };
  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.position.z = 7.4 / Math.min(camera.aspect, 1);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    draw();
  };
  const pointer = (event: Event) => {
    if (paused()) return;
    const e = event as PointerEvent;
    const bounds = host.getBoundingClientRect();
    const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    targetCursor.set(((e.clientX - bounds.left) / bounds.width * 2 - 1) * halfHeight * camera.aspect, (1 - (e.clientY - bounds.top) / bounds.height * 2) * halfHeight);
    if (!pointerActive && material.uniforms.influence.value < 0.01) material.uniforms.cursor.value.copy(targetCursor);
    pointerActive = true;
  };
  const leave = () => { pointerActive = false; };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const visibilityObserver = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); });
  visibilityObserver.observe(host);
  const mutationObserver = new MutationObserver(sync);
  if (shell) mutationObserver.observe(shell, { attributes: true, attributeFilter: ["class"] });
  reduced.addEventListener("change", sync);
  document.addEventListener("visibilitychange", sync);
  panel.addEventListener("pointermove", pointer);
  panel.addEventListener("pointerleave", leave);
  panel.addEventListener("pointerup", leave);
  panel.addEventListener("pointercancel", leave);
  const lost = (event: Event) => { event.preventDefault(); contextLost = true; renderer.setAnimationLoop(null); };
  const restored = () => { contextLost = false; sync(); };
  renderer.domElement.addEventListener("webglcontextlost", lost);
  renderer.domElement.addEventListener("webglcontextrestored", restored);
  resize(); sync();
  return () => {
    disposed = true;
    renderer.setAnimationLoop(null);
    resizeObserver.disconnect(); visibilityObserver.disconnect(); mutationObserver.disconnect();
    reduced.removeEventListener("change", sync);
    document.removeEventListener("visibilitychange", sync);
    panel.removeEventListener("pointermove", pointer);
    panel.removeEventListener("pointerleave", leave);
    panel.removeEventListener("pointerup", leave);
    panel.removeEventListener("pointercancel", leave);
    renderer.domElement.removeEventListener("webglcontextlost", lost);
    renderer.domElement.removeEventListener("webglcontextrestored", restored);
    geometry.dispose(); material.dispose(); renderer.dispose(); renderer.domElement.remove();
  };
}
