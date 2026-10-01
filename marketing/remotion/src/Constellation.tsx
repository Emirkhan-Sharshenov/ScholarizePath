import './fonts.css';
import {useEffect, useMemo, useState} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {lightLeak} from '@remotion/effects/light-leak';
import {AbsoluteFill, Sequence, Solid, continueRender, delayRender, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {N, CITIES, ORIGIN, GLOBE_R, GOLD, cap, dust, globe, rng, word, type Shape} from './shapes';

export type Lang = 'ru' | 'en';
const COPY = {
	ru: {
		c: [
			[0.4, 2.9, '1 500+ университетов.', 'Каждая точка — шанс.'],
			[6.9, 12.2, 'Весь мир —', 'на одной карте.'],
			[13.3, 16.7, '120+ стипендий.', 'AI-советник. Трекер.'],
			[17.9, 21.9, 'Всё для поступления', 'в одном месте.'],
		],
		tag: 'Твой путь начинается здесь',
		foot: 'Бесплатно · ссылка в профиле',
	},
	en: {
		c: [
			[0.4, 2.9, '1,500+ universities.', 'Every point is a chance.'],
			[6.9, 12.2, 'The whole world —', 'on one map.'],
			[13.3, 16.7, '120+ scholarships.', 'AI advisor. Tracker.'],
			[17.9, 21.9, 'Everything to apply', 'in one place.'],
		],
		tag: 'Your path starts here',
		foot: 'Free · link in bio',
	},
} as const;

// ---------------------------------------------------------------- timing helpers
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 8 * x ** 4 : 1 - (-2 * x + 2) ** 4 / 2);
const out5 = (x: number) => 1 - (1 - x) ** 5;
const P = (t: number, a: number, b: number, e: (x: number) => number = ease) => (t <= a ? 0 : t >= b ? 1 : e((t - a) / (b - a)));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

const TILT = 0.38;
const globeAngle = (t: number) => -2.2 + t * 0.11;
const capAngle = (t: number) => lerp(-0.7, 0.45, P(t, 15.5, 22.5, (x) => -(Math.cos(Math.PI * x) - 1) / 2));

// camera dolly: [time, z, y]
const CAM: [number, number, number][] = [
	[0, 15, 0.6], [3, 12, 0.3], [6.6, 8.4, 0], [12.4, 7.4, 0], [13.6, 6.6, 0], [17.4, 8.8, 0], [22, 9.2, 0], [25, 10, 0], [31, 10.15, 0],
];
const camAt = (t: number) => {
	let i = 0;
	while (i < CAM.length - 2 && t > CAM[i + 1][0]) i++;
	const [a, za, ya] = CAM[i];
	const [b, zb, yb] = CAM[i + 1];
	const k = ease(clamp((t - a) / (b - a)));
	return {z: lerp(za, zb, k), y: lerp(ya, yb, k)};
};

// ---------------------------------------------------------------- shaders
const VERT = `
attribute float aSize; attribute float aDelay; attribute vec3 aCol; uniform float uScale; uniform float uT; varying vec3 vCol;
void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv;
  float k = clamp((uT - 3.0 - aDelay * 1.3) / 1.7, 0.0, 1.0); k = k < 0.5 ? 8.0*k*k*k*k : 1.0 - pow(-2.0*k + 2.0, 4.0)/2.0;
  gl_PointSize = aSize * (1.0 + 0.9 * (1.0 - k)) * uScale / -mv.z; vCol = aCol; }`;
const FRAG = `
varying vec3 vCol;
void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); a = a*a;
  float core = smoothstep(0.18, 0.0, d); gl_FragColor = vec4(vCol * (a + core*0.8), 1.0); }`;
const ATMO_V = `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`;
const ATMO_F = `uniform float uO; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - max(dot(vN, vV), 0.0), 2.6); gl_FragColor = vec4(vec3(0.25,0.5,1.0)*f*uO, 1.0); }`;

const BG_V = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }`;
const BG_F = `varying vec2 vUv; uniform float uGlow; void main(){ vec2 p = vUv - 0.5; p.y *= 1.78; float d = length(p);
  vec3 c = mix(vec3(0.04,0.09,0.25), vec3(0.0), smoothstep(0.0, 0.85, d)); c += vec3(0.05,0.1,0.3) * uGlow * smoothstep(0.5, 0.0, d); gl_FragColor = vec4(c, 1.0); }`;
function Backdrop({t}: {t: number}) {
	const mat = useMemo(() => new THREE.ShaderMaterial({vertexShader: BG_V, fragmentShader: BG_F, uniforms: {uGlow: {value: 0}}, depthWrite: false, depthTest: false}), []);
	mat.uniforms.uGlow.value = 0.4 + 0.6 * P(t, 4, 7) * (1 - P(t, 12.5, 14)) + 0.5 * P(t, 26.5, 28);
	return (
		<mesh frustumCulled={false} renderOrder={-1}>
			<planeGeometry args={[2, 2]} />
			<primitive object={mat} attach="material" />
		</mesh>
	);
}

const pointsMaterial = () =>
	new THREE.ShaderMaterial({vertexShader: VERT, fragmentShader: FRAG, uniforms: {uScale: {value: 1}, uT: {value: 100}}, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending});

// ---------------------------------------------------------------- the particle field
const D = Math.PI / 180;
const sph = (lon: number, lat: number, r: number): [number, number, number] => [Math.cos(lat * D) * Math.sin(lon * D) * r, Math.sin(lat * D) * r, Math.cos(lat * D) * Math.cos(lon * D) * r];

function Field({t, shapes}: {t: number; shapes: {dust: Shape; globe: Shape; cap: Shape; word: Shape}}) {
	const {camera, size, viewport} = useThree();
	const {geo, mat, delay, size0, pts} = useMemo(() => {
		const g = new THREE.BufferGeometry();
		g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
		g.setAttribute('aCol', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
		const r = rng(9);
		const s = new Float32Array(N);
		const d = new Float32Array(N);
		for (let i = 0; i < N; i++) {
			s[i] = 0.7 + r() ** 3 * 2.6;
			d[i] = r();
		}
		g.setAttribute('aSize', new THREE.BufferAttribute(s, 1));
		g.setAttribute('aDelay', new THREE.BufferAttribute(d, 1));
		const m = pointsMaterial();
		return {geo: g, mat: m, delay: d, size0: s, pts: new THREE.Points(g, m)};
	}, []);

	// camera
	const c = camAt(t);
	camera.position.set(Math.sin(t * 0.31) * 0.35, c.y + Math.sin(t * 0.23) * 0.12, c.z);
	camera.lookAt(0, 0.42 * (1 - P(t, 21.5, 24)), 0);
	mat.uniforms.uScale.value = size.height * viewport.dpr * 0.019;

	const pos = geo.getAttribute('position') as THREE.BufferAttribute;
	const col = geo.getAttribute('aCol') as THREE.BufferAttribute;
	const P_ = pos.array as Float32Array;
	const C_ = col.array as Float32Array;
	const {dust: S0, globe: S1, cap: S2, word: S3} = shapes;
	const ga = globeAngle(t), cg = Math.cos(ga), sg = Math.sin(ga), ct = Math.cos(TILT), st = Math.sin(TILT);
	const ca = capAngle(t), cc = Math.cos(ca), sc = Math.sin(ca);
	const fadeEnd = 1 - 0.72 * P(t, 26.6, 28.2);

	for (let i = 0; i < N; i++) {
		const j = i * 3, dl = delay[i];
		// dust, slowly drifting
		let x = S0.pos[j] + Math.sin(t * 0.5 + i) * 0.05, y = S0.pos[j + 1] + Math.cos(t * 0.4 + i * 1.3) * 0.05, z = S0.pos[j + 2];
		let r = S0.col[j], g = S0.col[j + 1], b = S0.col[j + 2];
		const p1 = ease(clamp((t - 3.0 - dl * 1.3) / 1.7));
		const p2 = ease(clamp((t - 12.7 - dl * 1.1) / 2.8));
		const p3 = ease(clamp((t - 22.3 - dl * 0.9) / 1.7));
		if (p1 > 0) {
			// globe point, spun and tilted
			const gx0 = S1.pos[j], gy0 = S1.pos[j + 1], gz0 = S1.pos[j + 2];
			const gx = gx0 * cg + gz0 * sg, gz1 = -gx0 * sg + gz0 * cg;
			const gy = gy0 * ct - gz1 * st, gz = gy0 * st + gz1 * ct;
			if (p2 <= 0) {
				x = lerp(x, gx, p1); y = lerp(y, gy, p1); z = lerp(z, gz, p1);
				r = lerp(r, S1.col[j], p1); g = lerp(g, S1.col[j + 1], p1); b = lerp(b, S1.col[j + 2], p1);
			} else {
				// vortex from globe into the cap
				const kx = S2.pos[j], ky = S2.pos[j + 1], kz = S2.pos[j + 2];
				const cx = kx * cc + kz * sc, cz = -kx * sc + kz * cc;
				let mx = lerp(gx, cx, p2), my = lerp(gy, ky, p2), mz = lerp(gz, cz, p2);
				const sw = Math.sin(Math.PI * p2), ang = sw * (2.6 + dl * 2.2), push = 1 + sw * (0.9 + dl * 0.8);
				const ra = Math.cos(ang), rb = Math.sin(ang);
				const sx = (mx * ra + mz * rb) * push, sz = (-mx * rb + mz * ra) * push;
				mx = sx; mz = sz; my = my * (1 + sw * 0.35) + Math.sin(dl * 40) * sw * 0.4;
				x = mx; y = my; z = mz;
				r = lerp(S1.col[j], S2.col[j], p2) + sw * 0.25; g = lerp(S1.col[j + 1], S2.col[j + 1], p2) + sw * 0.2; b = lerp(S1.col[j + 2], S2.col[j + 2], p2) + sw * 0.1;
				if (p3 > 0) {
					const wx = S3.pos[j], wy = S3.pos[j + 1], wz = S3.pos[j + 2];
					const lift = Math.sin(Math.PI * p3) * (0.6 + dl * 0.8);
					x = lerp(x, wx, p3); y = lerp(y, wy, p3) + lift * 0.25; z = lerp(z, wz, p3) + lift;
					r = lerp(r, S3.col[j], p3); g = lerp(g, S3.col[j + 1], p3); b = lerp(b, S3.col[j + 2], p3);
				}
			}
		}
		// twinkle
		const tw = 0.82 + 0.18 * Math.sin(t * 3 + i * 7.3);
		P_[j] = x; P_[j + 1] = y; P_[j + 2] = z;
		C_[j] = r * tw * fadeEnd; C_[j + 1] = g * tw * fadeEnd; C_[j + 2] = b * tw * fadeEnd;
	}
	pos.needsUpdate = true;
	col.needsUpdate = true;
	mat.uniforms.uT.value = t; // dust reads larger and shrinks as it settles (vertex shader)
	void size0;
	return <primitive object={pts} frustumCulled={false} />;
}

// flight arcs that ride along with the spinning globe
function Arcs({t}: {t: number}) {
	const K = 150;
	const {geo, mat, pts} = useMemo(() => {
		const g = new THREE.BufferGeometry();
		const n = CITIES.length * K + CITIES.length;
		g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
		g.setAttribute('aCol', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
		g.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(n), 1));
		const m = pointsMaterial();
		return {geo: g, mat: m, pts: new THREE.Points(g, m)};
	}, []);
	const {size, viewport} = useThree();
	mat.uniforms.uScale.value = size.height * viewport.dpr * 0.019;
	const P_ = geo.getAttribute('position').array as Float32Array;
	const C_ = geo.getAttribute('aCol').array as Float32Array;
	const S_ = geo.getAttribute('aSize').array as Float32Array;
	const fade = P(t, 6.4, 6.9) * (1 - P(t, 12.4, 13.1));
	const o = sph(ORIGIN[0], ORIGIN[1], 1);
	CITIES.forEach(([lon, lat], ci) => {
		const d = sph(lon, lat, 1);
		const dot = Math.min(1, Math.max(-1, o[0] * d[0] + o[1] * d[1] + o[2] * d[2]));
		const om = Math.acos(dot), so = Math.sin(om);
		const prog = ease(clamp((t - 6.9 - ci * 0.45) / 1.3));
		for (let k = 0; k < K; k++) {
			const u = k / (K - 1);
			const a = Math.sin((1 - u) * om) / so, b = Math.sin(u * om) / so;
			const alt = GLOBE_R * (1.0 + Math.sin(Math.PI * u) * 0.28);
			const idx = (ci * K + k) * 3;
			P_.set([(o[0] * a + d[0] * b) * alt, (o[1] * a + d[1] * b) * alt, (o[2] * a + d[2] * b) * alt], idx);
			const on = u <= prog ? 1 : 0, head = Math.max(0, 1 - Math.abs(u - prog) * 25) * (prog > 0 && prog < 1 ? 1 : 0) * fade;
			const bright = (0.55 + 0.75 * u) * on * fade;
			C_.set([GOLD[0] * bright + head, GOLD[1] * bright + head, GOLD[2] * bright + head * 0.8], idx);
			S_[ci * K + k] = 1.6 + head * 5;
		}
		// city pin flares when the arc lands
		const pin = P(t, 6.9 + ci * 0.45 + 1.2, 6.9 + ci * 0.45 + 1.6, out5) * fade;
		const pi = (CITIES.length * K + ci) * 3;
		P_.set(d.map((v) => v * GLOBE_R * 1.01), pi);
		C_.set([pin, pin * 0.85, pin * 0.55], pi);
		S_[CITIES.length * K + ci] = 6 + 3 * Math.sin(t * 4 + ci);
	});
	(['position', 'aCol', 'aSize'] as const).forEach((a) => (geo.getAttribute(a).needsUpdate = true));
	return (
		<group rotation={[TILT, globeAngle(t), 0]}>
			<primitive object={pts} frustumCulled={false} />
		</group>
	);
}

function Atmosphere({t}: {t: number}) {
	const mat = useMemo(
		() => new THREE.ShaderMaterial({vertexShader: ATMO_V, fragmentShader: ATMO_F, uniforms: {uO: {value: 0}}, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.FrontSide}),
		[],
	);
	mat.uniforms.uO.value = P(t, 4.2, 6.2) * (1 - P(t, 12.6, 14)) * 1.1;
	return (
		<mesh>
			<sphereGeometry args={[GLOBE_R * 1.08, 64, 64]} />
			<primitive object={mat} attach="material" />
		</mesh>
	);
}

// ---------------------------------------------------------------- 2D layers
const LeakOverlay: React.FC<{seed: number; hue?: number}> = ({seed, hue = 0}) => {
	const frame = useCurrentFrame();
	const {durationInFrames, width, height} = useVideoConfig();
	return (
		<AbsoluteFill style={{mixBlendMode: 'screen', opacity: 0.55}}>
			<Solid width={width} height={height} effects={[lightLeak({seed, hueShift: hue, progress: interpolate(frame, [0, durationInFrames - 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})})]} />
		</AbsoluteFill>
	);
};

function Title({t, a, b, top, bottom}: {t: number; a: number; b: number; top: string; bottom: string}) {
	if (t < a - 0.05 || t > b + 0.05) return null;
	const out = P(t, b - 0.45, b);
	const line = (s: string, j: number) => {
		const p = P(t, a + j * 0.45, a + j * 0.45 + 0.9, out5);
		return (
			<span
				style={{
					display: 'block',
					font: "800 92px/1.05 Manrope",
					letterSpacing: `${lerp(0.02, -0.04, p)}em`,
					opacity: p * (1 - out),
					transform: `translateY(${(1 - p) * 30 - out * 20}px)`,
					filter: `blur(${(1 - p) * 14 + out * 10}px)`,
					...(j ? {background: 'linear-gradient(90deg,#6aa8ff,#b9d6ff 55%,#ffd9a0)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'} : {color: '#f5f5f7'}),
				}}
			>
				{s}
			</span>
		);
	};
	return (
		<div style={{position: 'absolute', left: 40, right: 40, top: 230, textAlign: 'center'}}>
			{line(top, 0)}
			{line(bottom, 1)}
		</div>
	);
}

// ---------------------------------------------------------------- composition
export const Constellation: React.FC<{lang: Lang}> = ({lang}) => {
	const frame = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();
	const t = frame / fps;
	const L = COPY[lang];
	const [handle] = useState(() => delayRender('fonts + particle shapes'));
	const [shapes, setShapes] = useState<null | {dust: Shape; globe: Shape; cap: Shape; word: Shape}>(null);
	const [wordPx, setWordPx] = useState(120);
	useEffect(() => {
		Promise.all(["800 150px 'Plus Jakarta Sans'", '800 92px Manrope', '600 40px Inter'].map((f) => document.fonts.load(f, 'ScholarizePath Аа'))).then(() => {
			setShapes({dust: dust(), globe: globe(), cap: cap(), word: word()});
			// size the crisp wordmark so it lands exactly on the particle word
			const ctx = document.createElement('canvas').getContext('2d')!;
			ctx.font = "800 150px 'Plus Jakarta Sans'";
			const w150 = ctx.measureText('ScholarizePath').width;
			const visW = 2 * 10.15 * Math.tan((35 / 2) * D) * (width / height);
			const targetPx = (3.05 * (w150 / 1200)) / visW * width;
			setWordPx((150 * targetPx) / w150);
			continueRender(handle);
		});
	}, [handle, width, height]);

	const end = P(t, 26.9, 28.0, out5);
	const outro = 1 - P(t, 30.2, 31);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(90% 60% at 50% 50%, #0a1640 0%, #030616 60%, #000 100%)'}}>
			<AbsoluteFill style={{opacity: outro}}>
				{shapes && (
					<ThreeCanvas width={width} height={height} camera={{fov: 35, near: 0.1, far: 100, position: [0, 0, 15]}} gl={{alpha: false, antialias: true}}>
						<Backdrop t={t} />
						<Field t={t} shapes={shapes} />
						<Arcs t={t} />
						<Atmosphere t={t} />
					</ThreeCanvas>
				)}
			</AbsoluteFill>
			<Sequence from={Math.round(12.3 * fps)} durationInFrames={Math.round(1.6 * fps)}>
				<LeakOverlay seed={4} hue={180} />
			</Sequence>
			<Sequence from={Math.round(21.9 * fps)} durationInFrames={Math.round(1.6 * fps)}>
				<LeakOverlay seed={11} />
			</Sequence>
			{L.c.map(([a, b, top, bottom], i) => (
				<Title key={i} t={t} a={a as number} b={b as number} top={top as string} bottom={bottom as string} />
			))}
			{/* crisp wordmark + end card */}
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: outro}}>
				<div style={{font: `800 ${wordPx}px 'Plus Jakarta Sans'`, letterSpacing: 0, color: '#f5f5f7', opacity: end, textShadow: `0 0 ${40 * end}px rgba(110,160,255,.55)`, whiteSpace: 'nowrap'}}>ScholarizePath</div>
			</AbsoluteFill>
			<div style={{position: 'absolute', left: 0, right: 0, top: 1110, textAlign: 'center', opacity: outro}}>
				{(() => {
					const a = P(t, 27.6, 28.5, out5), u = P(t, 28.2, 29.0, out5), f = P(t, 28.8, 29.5, out5);
					return (
						<>
							<div style={{font: '600 46px Inter', color: '#c7d2e6', opacity: a, transform: `translateY(${(1 - a) * 20}px)`}}>{L.tag}</div>
							<div style={{display: 'inline-block', marginTop: 54, padding: '28px 54px', borderRadius: 26, background: '#fff', color: '#0a1a3f', font: "800 50px 'Plus Jakarta Sans'", opacity: u, transform: `scale(${lerp(0.85, 1, u)})`, boxShadow: '0 30px 80px rgba(60,120,255,.45)'}}>scholarizepath.xyz</div>
							<div style={{marginTop: 40, font: '500 34px Inter', color: '#8e9ab3', opacity: f}}>{L.foot}</div>
						</>
					);
				})()}
			</div>
			{/* fade in from black */}
			<AbsoluteFill style={{background: '#000', opacity: 1 - P(t, 0, 0.6), pointerEvents: 'none'}} />
		</AbsoluteFill>
	);
};

