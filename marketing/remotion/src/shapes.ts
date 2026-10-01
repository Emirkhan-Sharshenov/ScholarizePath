// Target shapes the particle cloud morphs between. Every generator returns
// N xyz triples (Float32Array, length 3N) plus an rgb colour per particle.
import {LAND} from './land';

export const N = 16000;

// Deterministic PRNG so every render tab builds identical clouds.
export const rng = (seed: number) => () => {
	seed |= 0;
	seed = (seed + 0x6d2b79f5) | 0;
	let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
	t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export type Shape = {pos: Float32Array; col: Float32Array};

const mixc = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k);
export const BLUE = [0.31, 0.61, 1.0];
export const ICE = [0.75, 0.86, 1.0];
export const GOLD = [1.0, 0.82, 0.48];

/** Loose star field in front of and behind the camera's path. */
export function dust(): Shape {
	const r = rng(1);
	const pos = new Float32Array(N * 3);
	const col = new Float32Array(N * 3);
	for (let i = 0; i < N; i++) {
		pos[i * 3] = (r() - 0.5) * 12;
		pos[i * 3 + 1] = (r() - 0.5) * 20;
		pos[i * 3 + 2] = -12 + r() * 16;
		const c = mixc(BLUE, ICE, r());
		const b = 0.45 + r() * 0.65;
		col.set([c[0] * b, c[1] * b, c[2] * b], i * 3);
	}
	return {pos, col};
}

export const GLOBE_R = 1.38;
/** Land dots on a sphere (lon/lat from the site's world map), plus a faint atmosphere shell. */
export function globe(): Shape {
	const r = rng(2);
	const pos = new Float32Array(N * 3);
	const col = new Float32Array(N * 3);
	const D = Math.PI / 180;
	for (let i = 0; i < N; i++) {
		let lon: number, lat: number, rad: number, bright: number, c: number[];
		if (i < LAND.length * 3) {
			[lon, lat] = LAND[i % LAND.length];
			lon += (r() - 0.5) * 1.4;
			lat += (r() - 0.5) * 1.4;
			rad = GLOBE_R;
			bright = 0.55 + r() * 0.45;
			c = mixc(BLUE, ICE, r() * 0.6);
		} else {
			lon = r() * 360 - 180;
			lat = Math.asin(r() * 2 - 1) / D;
			rad = GLOBE_R * (1.0 + r() * 0.03);
			bright = 0.12 + r() * 0.12;
			c = BLUE;
		}
		const x = Math.cos(lat * D) * Math.sin(lon * D);
		const y = Math.sin(lat * D);
		const z = Math.cos(lat * D) * Math.cos(lon * D);
		pos.set([x * rad, y * rad, z * rad], i * 3);
		col.set([c[0] * bright, c[1] * bright, c[2] * bright], i * 3);
	}
	return {pos, col};
}

/** Samples the filled pixels of something drawn on a canvas into a thin 3D slab. */
function sample(draw: (ctx: CanvasRenderingContext2D) => void, w: number, h: number, worldW: number, seed: number, palette: (u: number, v: number) => number[], depth = 0.14): Shape {
	const cv = document.createElement('canvas');
	cv.width = w;
	cv.height = h;
	const ctx = cv.getContext('2d')!;
	draw(ctx);
	const data = ctx.getImageData(0, 0, w, h).data;
	const pts: number[] = [];
	for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) if (data[(y * w + x) * 4 + 3] > 128) pts.push(x, y);
	const r = rng(seed);
	const pos = new Float32Array(N * 3);
	const col = new Float32Array(N * 3);
	const k = worldW / w;
	for (let i = 0; i < N; i++) {
		const j = Math.floor(r() * (pts.length / 2)) * 2;
		const px = pts[j] + (r() - 0.5) * 2;
		const py = pts[j + 1] + (r() - 0.5) * 2;
		pos.set([(px - w / 2) * k, -(py - h / 2) * k, (r() - 0.5) * depth], i * 3);
		const c = palette(px / w, py / h);
		const b = 0.85 + r() * 0.35;
		col.set([c[0] * b, c[1] * b, c[2] * b], i * 3);
	}
	return {pos, col};
}

const LOGO = [
	'M18 290 C120 294 200 318 244 350 L248 386 C205 356 110 322 15 322 L8 294 Z',
	'M42 263 C135 268 205 302 244 346 L240 352 C200 305 120 283 29 277 Z',
	'M112 166 L248 221 L386 164 L386 248 Q298 258 249 310 Q200 258 112 248 Z',
	'M249 0 L495 101 L248 206 L2 101 Z',
	'M422 207 L440 207 L445 236 L443 241 L420 241 L417 236 Z',
];
/** The ScholarizePath mark (mortarboard on an open book) — same paths as BrandLogo.tsx. */
export function cap(): Shape {
	return sample(
		(ctx) => {
			ctx.translate(30, 30);
			ctx.fillStyle = '#fff';
			for (const d of LOGO) {
				const p = new Path2D(d);
				ctx.fill(p);
				ctx.save();
				ctx.translate(497, 0);
				ctx.scale(-1, 1);
				if (d === LOGO[0] || d === LOGO[1]) ctx.fill(p);
				ctx.restore();
			}
			ctx.fillRect(426, 120, 11, 68);
			ctx.beginPath();
			ctx.arc(431, 195, 12, 0, 7);
			ctx.fill();
		},
		560,
		450,
		2.7,
		3,
		(u, v) => (v < 0.55 ? mixc(GOLD, [1, 0.95, 0.85], u) : mixc(BLUE, ICE, u)),
		0.22,
	);
}

/** The wordmark, sampled from Plus Jakarta Sans 800 (the site's display font). */
export function word(): Shape {
	return sample(
		(ctx) => {
			ctx.fillStyle = '#fff';
			ctx.font = "800 150px 'Plus Jakarta Sans'";
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText('ScholarizePath', 600, 110);
		},
		1200,
		220,
		3.05,
		4,
		(u) => mixc(mixc(BLUE, ICE, Math.min(1, u * 1.6)), GOLD, Math.max(0, u - 0.55) * 2),
		0.06,
	);
}

/** Destinations for the flight arcs (lon, lat). */
export const CITIES: [number, number][] = [
	[19.04, 47.5], // Budapest
	[-6.26, 53.35], // Dublin
	[8.54, 47.37], // Zurich
	[114.17, 22.32], // Hong Kong
	[121.56, 25.03], // Taipei
	[-58.38, -34.6], // Buenos Aires
	[-99.13, 19.43], // Mexico City
];
export const ORIGIN: [number, number] = [74.6, 42.87];
