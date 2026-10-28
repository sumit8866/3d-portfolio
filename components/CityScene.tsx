"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Clone, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// A small city block diorama built from Kenney's CC0 kits in /public/models.

const CITY = "/models/city";
const SUB = "/models/suburban";
const CARS = "/models/cars";

type Building = { url: string; x: number; z: number; rot: number; scale?: number };

const HALF_PI = Math.PI / 2;

// Inner block: skyscraper core surrounded by a ring of buildings facing the road.
const INNER: Building[] = [
  { url: `${CITY}/building-skyscraper-b.glb`, x: -0.65, z: -0.65, rot: 0, scale: 0.9 },
  { url: `${CITY}/building-skyscraper-a.glb`, x: 0.65, z: -0.65, rot: HALF_PI, scale: 0.9 },
  { url: `${CITY}/building-skyscraper-c.glb`, x: -0.65, z: 0.65, rot: -HALF_PI, scale: 0.9 },
  { url: `${CITY}/building-f.glb`, x: 0.65, z: 0.65, rot: 0 },
  { url: `${CITY}/building-a.glb`, x: 1.85, z: -1.85, rot: HALF_PI },
  { url: `${CITY}/building-b.glb`, x: 1.85, z: -0.65, rot: HALF_PI },
  { url: `${CITY}/building-d.glb`, x: 1.85, z: 0.65, rot: HALF_PI },
  { url: `${CITY}/building-c.glb`, x: 1.85, z: 1.85, rot: 0 },
  { url: `${CITY}/building-f.glb`, x: 0.65, z: 1.85, rot: 0 },
  { url: `${CITY}/building-a.glb`, x: -0.65, z: 1.85, rot: 0 },
  { url: `${CITY}/building-d.glb`, x: -1.85, z: 1.85, rot: -HALF_PI },
  { url: `${CITY}/building-b.glb`, x: -1.85, z: 0.65, rot: -HALF_PI },
  { url: `${CITY}/building-f.glb`, x: -1.85, z: -0.65, rot: -HALF_PI },
  { url: `${CITY}/building-c.glb`, x: -1.85, z: -1.85, rot: Math.PI },
  { url: `${CITY}/building-d.glb`, x: -0.65, z: -1.85, rot: Math.PI },
  { url: `${CITY}/building-b.glb`, x: 0.65, z: -1.85, rot: Math.PI },
];

// Outer ring: a row of mixed buildings on each side of the loop road, facing inward.
const OUTER_KINDS = [
  { url: `${SUB}/building-type-a.glb` },
  { url: `${CITY}/building-b.glb` },
  { url: `${SUB}/building-type-c.glb` },
  { url: `${CITY}/building-e.glb`, scale: 0.8 },
  { url: `${SUB}/building-type-e.glb` },
  { url: `${CITY}/building-d.glb` },
];
const SIDES = [
  { x: 0, z: 1, rot: Math.PI },
  { x: 1, z: 0, rot: -HALF_PI },
  { x: 0, z: -1, rot: 0 },
  { x: -1, z: 0, rot: HALF_PI },
];
const OUTER: Building[] = SIDES.flatMap((side, i) =>
  [-2.8, -1.4, 0, 1.4, 2.8].map((t, j) => {
    const kind = OUTER_KINDS[(i * 2 + j) % OUTER_KINDS.length];
    return {
      ...kind,
      x: side.x ? side.x * 4.3 : t,
      z: side.z ? side.z * 4.3 : t,
      rot: side.rot,
    };
  }),
);
const CORNER_TOWERS: Building[] = [
  { url: `${CITY}/building-skyscraper-c.glb`, x: 4.5, z: -4.5, rot: -HALF_PI, scale: 0.75 },
  { url: `${CITY}/building-skyscraper-a.glb`, x: -4.5, z: 4.5, rot: HALF_PI, scale: 0.75 },
];
const TREE_SPOTS: [number, number, number][] = [
  [4.3, 4.3, 1],
  [4.85, 4.6, 0.8],
  [4.55, 4.95, 0.7],
  [-4.3, -4.3, 1],
  [-4.85, -4.6, 0.8],
  [-4.55, -4.95, 0.7],
];

const BUILDINGS = [...INNER, ...OUTER, ...CORNER_TOWERS];
const CAR_URLS = ["taxi", "sedan", "police", "suv"].map((n) => `${CARS}/${n}.glb`);
[...new Set(BUILDINGS.map((b) => b.url)), ...CAR_URLS].forEach((url) => useGLTF.preload(url));

// Rounded-square loop for a lane at half-size h, driven counter-clockwise from above.
function makeLoop(h: number, r: number) {
  const v = (x: number, z: number) => new THREE.Vector3(x, 0, z);
  const path = new THREE.CurvePath<THREE.Vector3>();
  path.add(new THREE.LineCurve3(v(h, -h + r), v(h, h - r)));
  path.add(new THREE.QuadraticBezierCurve3(v(h, h - r), v(h, h), v(h - r, h)));
  path.add(new THREE.LineCurve3(v(h - r, h), v(-h + r, h)));
  path.add(new THREE.QuadraticBezierCurve3(v(-h + r, h), v(-h, h), v(-h, h - r)));
  path.add(new THREE.LineCurve3(v(-h, h - r), v(-h, -h + r)));
  path.add(new THREE.QuadraticBezierCurve3(v(-h, -h + r), v(-h, -h), v(-h + r, -h)));
  path.add(new THREE.LineCurve3(v(-h + r, -h), v(h - r, -h)));
  path.add(new THREE.QuadraticBezierCurve3(v(h - r, -h), v(h, -h), v(h, -h + r)));
  return path;
}

// Two lanes around the block; traffic keeps to the right.
const LANES = {
  inner: { path: makeLoop(2.75, 0.45), reverse: false },
  outer: { path: makeLoop(3.25, 0.7), reverse: true },
};

const TRAFFIC = [
  { url: CAR_URLS[0], lane: "inner", start: 0.0, speed: 1.15 },
  { url: CAR_URLS[1], lane: "inner", start: 0.34, speed: 1.15 },
  { url: CAR_URLS[2], lane: "inner", start: 0.67, speed: 1.15 },
  { url: CAR_URLS[3], lane: "outer", start: 0.12, speed: 1.0 },
  { url: CAR_URLS[0], lane: "outer", start: 0.45, speed: 1.0 },
  { url: CAR_URLS[1], lane: "outer", start: 0.78, speed: 1.0 },
] as const;

function Model({ url, x, z, rot, scale = 1 }: Building) {
  const { scene } = useGLTF(url);
  return (
    <Clone
      object={scene}
      position={[x, 0, z]}
      rotation={[0, rot, 0]}
      scale={scale}
      castShadow
      receiveShadow
    />
  );
}

function Car({
  url,
  lane,
  start,
  speed,
  animate,
}: {
  url: string;
  lane: keyof typeof LANES;
  start: number;
  speed: number;
  animate: boolean;
}) {
  const { scene } = useGLTF(url);
  const ref = useRef<THREE.Group>(null);
  const progress = useRef(start);
  const { path, reverse } = LANES[lane];
  const length = useMemo(() => path.getLength(), [path]);
  const point = useMemo(() => new THREE.Vector3(), []);
  const tangent = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    const car = ref.current;
    if (!car) return;
    if (animate) progress.current = (progress.current + (Math.min(dt, 0.05) * speed) / length) % 1;
    const u = reverse ? 1 - progress.current : progress.current;
    path.getPointAt(u, point);
    path.getTangentAt(u, tangent);
    if (reverse) tangent.negate();
    car.position.set(point.x, 0, point.z);
    car.rotation.y = Math.atan2(tangent.x, tangent.z);
  });

  return (
    <group ref={ref}>
      <Clone object={scene} scale={0.26} castShadow />
    </group>
  );
}

function Tree({ x, z, s }: { x: number; z: number; s: number }) {
  return (
    <group position={[x, 0, z]} scale={s}>
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.3, 6]} />
        <meshStandardMaterial color="#7a5a3c" />
      </mesh>
      <mesh position={[0, 0.6, 0]} castShadow>
        <coneGeometry args={[0.32, 0.8, 7]} />
        <meshStandardMaterial color="#3f9a6b" flatShading />
      </mesh>
    </group>
  );
}

function Ground() {
  const dashes = useMemo(() => {
    const out: { x: number; z: number; rot: number }[] = [];
    for (let t = -2; t <= 2.01; t += 0.5) {
      out.push({ x: 3, z: t, rot: 0 }, { x: -3, z: t, rot: 0 });
      out.push({ x: t, z: 3, rot: HALF_PI }, { x: t, z: -3, rot: HALF_PI });
    }
    return out;
  }, []);

  return (
    <group>
      {/* floating base with sidewalk top */}
      <mesh position={[0, -0.25, 0]} receiveShadow>
        <boxGeometry args={[11.2, 0.5, 11.2]} />
        <meshStandardMaterial color="#aeb5c2" />
      </mesh>
      <mesh position={[0, -0.9, 0]}>
        <boxGeometry args={[10.6, 0.8, 10.6]} />
        <meshStandardMaterial color="#2a3242" />
      </mesh>
      {/* loop road */}
      <mesh rotation-x={-HALF_PI} position={[0, 0.003, 0]} receiveShadow>
        <planeGeometry args={[7, 7]} />
        <meshStandardMaterial color="#3a3f4b" />
      </mesh>
      {dashes.map((d, i) => (
        <mesh key={i} rotation={[-HALF_PI, 0, d.rot]} position={[d.x, 0.006, d.z]}>
          <planeGeometry args={[0.05, 0.24]} />
          <meshStandardMaterial color="#f5c542" />
        </mesh>
      ))}
      {/* inner block sidewalk */}
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <boxGeometry args={[5, 0.06, 5]} />
        <meshStandardMaterial color="#c6ccd6" />
      </mesh>
    </group>
  );
}

// Slowly turns the city, follows the pointer a little and frames it for the screen size.
function Rig({ animate, children }: { animate: boolean; children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const pointer = useRef({ x: 0, y: 0 });
  const base = useRef(new THREE.Vector3());
  const target = useMemo(() => new THREE.Vector3(0, 0.7, 0), []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    // Back the camera off until the whole diorama (~15.5 x 12.5 units on screen) fits the canvas.
    const span = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const aspect = size.width / size.height;
    const distance = Math.max(15.5 / (0.94 * span * aspect), 12.5 / (0.9 * span));
    base.current.set(1, 0.82, 1).normalize().multiplyScalar(distance);
    camera.position.copy(base.current);
    camera.lookAt(target);
  }, [camera, size, target]);

  useFrame((_, dt) => {
    const step = Math.min(dt, 0.05);
    if (group.current && animate) group.current.rotation.y += step * 0.06;
    const px = animate ? pointer.current.x : 0;
    const py = animate ? pointer.current.y : 0;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, base.current.x + px * 1.2, 3, step);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, base.current.y + py * 0.8, 3, step);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, base.current.z - px * 1.2, 3, step);
    camera.lookAt(target);
  });

  return (
    <group ref={group} rotation-y={-0.35}>
      {children}
    </group>
  );
}

export default function CityScene() {
  const wrapper = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = () => setReducedMotion(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // Stop rendering once the hero scrolls out of view.
  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const animate = !reducedMotion;
  const frameloop = !visible ? "never" : animate ? "always" : "demand";

  return (
    <div ref={wrapper} className="h-full w-full">
      <Canvas
        shadows
        frameloop={frameloop}
        dpr={[1, 1.75]}
        camera={{ fov: 32, near: 0.5, far: 120, position: [14, 12, 14] }}
        gl={{ antialias: true, alpha: true }}
        aria-label="A small 3D city block with cars driving around it"
      >
        <hemisphereLight args={["#dfe9ff", "#2b3140", 1.15]} />
        <directionalLight
          position={[7, 12, 4]}
          intensity={2.4}
          color="#fff0d4"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
          shadow-bias={-0.0006}
        />
        <directionalLight position={[-6, 4, -8]} intensity={0.5} color="#8fb4ff" />
        <Suspense fallback={null}>
          <Rig animate={animate}>
            <Ground />
            {BUILDINGS.map((b, i) => (
              <Model key={i} {...b} />
            ))}
            {TRAFFIC.map((c, i) => (
              <Car key={i} {...c} animate={animate} />
            ))}
            {TREE_SPOTS.map(([x, z, s], i) => (
              <Tree key={i} x={x} z={z} s={s} />
            ))}
          </Rig>
        </Suspense>
      </Canvas>
    </div>
  );
}
