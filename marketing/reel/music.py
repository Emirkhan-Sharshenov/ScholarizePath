"""Synthesizes an original soundtrack + UI sound effects for the promo reel.

Everything is generated from scratch (no samples), so the audio is royalty-free.
Timings mirror the scene timeline in reel.html / reel-en.html.

    python3 music.py ru soundtrack-ru.wav
    python3 music.py en soundtrack-en.wav
"""
import sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
DUR = 38.5
N = int(SR * DUR)
rng = np.random.default_rng(7)

LANG = sys.argv[1] if len(sys.argv) > 1 else 'ru'
OUT = sys.argv[2] if len(sys.argv) > 2 else f'soundtrack-{LANG}.wav'

# ---------------------------------------------------------------- helpers
def t_(d):
    return np.arange(int(SR * d)) / SR

def env(n, a=0.005, r=0.2, sustain=None):
    x = np.arange(n) / SR
    e = np.minimum(1, x / max(a, 1e-4))
    if sustain is None:
        e *= np.exp(-x / r)
    else:
        rel = np.clip((x - sustain) / r, 0, 1)
        e *= 1 - rel
    return e

def lp(x, f, order=2):
    return sosfilt(butter(order, min(f, SR / 2 - 100), 'low', fs=SR, output='sos'), x)

def hp(x, f, order=2):
    return sosfilt(butter(order, f, 'high', fs=SR, output='sos'), x)

def bp(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], 'band', fs=SR, output='sos'), x)

def saw(f, d, detune=0.0):
    tt = t_(d)
    ph = (f * (1 + detune) * tt) % 1
    return 2 * ph - 1

def add(buf, sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N or i + len(sig) <= 0:
        return
    if i < 0:
        sig = sig[-i:]
        i = 0
    sig = sig[: N - i]
    l = np.cos((pan + 1) * np.pi / 4)
    r = np.sin((pan + 1) * np.pi / 4)
    buf[0, i:i + len(sig)] += sig * gain * l * 1.414
    buf[1, i:i + len(sig)] += sig * gain * r * 1.414

def midi(m):
    return 440 * 2 ** ((m - 69) / 12)

def reverb(x, seconds=2.2, mix=0.25):
    ir_n = int(SR * seconds)
    out = np.zeros_like(x)
    for ch in range(2):
        ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / (seconds / 5))
        ir = lp(ir, 6000)
        ir /= np.sqrt(np.sum(ir ** 2))
        out[ch] = fftconvolve(x[ch], ir)[: x.shape[1]]
    return x + out * mix

# ---------------------------------------------------------------- instruments
def kick(d=0.45):
    tt = t_(d)
    f = 45 + 110 * np.exp(-tt * 28)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 7)
    click = rng.standard_normal(len(tt)) * np.exp(-tt * 300) * 0.3
    return np.tanh((s + click) * 1.6)

def clap():
    tt = t_(0.3)
    n = rng.standard_normal(len(tt))
    e = np.exp(-tt * 22) + 0.6 * np.exp(-((tt - 0.012) % 0.011) * 400) * (tt < 0.035)
    return bp(n, 900, 5000) * e * 0.9

def hat(open_=False):
    tt = t_(0.25 if open_ else 0.06)
    n = hp(rng.standard_normal(len(tt)), 7000)
    return n * np.exp(-tt * (12 if open_ else 70))

def bass(m, d):
    f = midi(m)
    s = saw(f, d) * 0.6 + np.sin(2 * np.pi * f * t_(d)) * 0.8
    s = lp(s, 380)
    return np.tanh(s * 1.4) * env(len(s), 0.004, 0.06, sustain=d - 0.06)

def pad(notes, d, cutoff=2200):
    s = np.zeros(int(SR * d))
    for m in notes:
        for dt in (-0.004, 0.0, 0.005):
            s += saw(midi(m), d, dt)
    s = lp(s / (len(notes) * 3), cutoff)
    return s * env(len(s), 0.25, 0.35, sustain=d - 0.35)

def pluck(m, d=0.35):
    f = midi(m)
    tt = t_(d)
    s = (saw(f, d) * 0.5 + np.sin(2 * np.pi * f * tt)) * np.exp(-tt * 9)
    return lp(s, 3500)

def bell(m, d=1.2):
    f = midi(m)
    tt = t_(d)
    s = np.sin(2 * np.pi * f * tt + 2.2 * np.sin(2 * np.pi * f * 3.5 * tt) * np.exp(-tt * 6))
    return s * np.exp(-tt * 3.5)

# ---------------------------------------------------------------- sfx
def whoosh(d=0.7, up=True):
    tt = t_(d)
    n = rng.standard_normal(len(tt))
    out = np.zeros_like(n)
    seg = 512
    for i in range(0, len(n), seg):
        p = i / len(n)
        fc = 400 + 5000 * (p if up else 1 - p) ** 1.5
        out[i:i + seg] = bp(n[max(0, i - 2048):i + seg], fc * 0.6, min(fc * 1.6, 18000))[-len(n[i:i + seg]):]
    e = np.sin(np.pi * np.clip(tt / d, 0, 1)) ** 2
    return out * e

def riser(d):
    tt = t_(d)
    f = 200 * 2 ** (tt / d * 3)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.3
    noise = hp(rng.standard_normal(len(tt)), 2000) * 0.5
    return (tone + noise) * (tt / d) ** 2

def impact():
    tt = t_(1.6)
    boom = np.sin(2 * np.pi * np.cumsum(38 + 80 * np.exp(-tt * 10)) / SR) * np.exp(-tt * 2.5)
    crash = hp(rng.standard_normal(len(tt)), 3000) * np.exp(-tt * 2.8) * 0.35
    return np.tanh(boom * 1.4) + crash

def pop(pitch=1.0):
    tt = t_(0.09)
    f = 900 * pitch * (1 + 0.8 * np.exp(-tt * 60))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 45)

def tick():
    tt = t_(0.025)
    return bp(rng.standard_normal(len(tt)), 2500, 7000) * np.exp(-tt * 250)

def chime(base=76):
    s = np.zeros(int(SR * 1.4))
    for k, m in enumerate((base, base + 4, base + 7, base + 12)):
        b = bell(m, 1.4 - k * 0.08)
        s[int(k * 0.07 * SR):int(k * 0.07 * SR) + len(b)] += b[: len(s) - int(k * 0.07 * SR)]
    return s * 0.35

def sweep(d):
    tt = t_(d)
    f = 300 * 2 ** (tt / d * 2.2)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / d) * 0.5

def coin():
    tt = t_(0.5)
    s = np.sin(2 * np.pi * midi(88) * tt) * (tt < 0.08) + np.sin(2 * np.pi * midi(93) * tt) * (tt >= 0.08)
    return s * np.exp(-tt * 7) * 0.5

def click():
    tt = t_(0.06)
    return (np.sin(2 * np.pi * 1800 * tt) * 0.6 + bp(rng.standard_normal(len(tt)), 2000, 8000)) * np.exp(-tt * 90)

# ---------------------------------------------------------------- music
music = np.zeros((2, N))
drums = np.zeros((2, N))
fx = np.zeros((2, N))

BPM = 112
BEAT = 60 / BPM
BAR = BEAT * 4
DROP = 3.2          # logo reveal = first downbeat
END = 37.3          # groove stops, tail rings out
# vi – IV – I – V in C major (Am F C G): uplifting, "journey" feel
CHORDS = [(57, [57, 60, 64, 69]), (53, [53, 57, 60, 65]), (48, [55, 60, 64, 67]), (55, [55, 59, 62, 67])]

# intro: filtered pad + riser into the drop
add(music, pad(CHORDS[0][1], DROP + 0.2, cutoff=900), 0, 0.5, 0)
add(music, riser(2.2), DROP - 2.2, 0.22)
add(music, whoosh(0.9, up=True), DROP - 0.8, 0.35)

bar = 0
t = DROP
while t < END:
    root, notes = CHORDS[bar % 4]
    d = min(BAR, END - t + 0.4)
    add(music, pad([n + 12 for n in notes], d + 0.3, cutoff=2600 if t > 11 else 1800), t, 0.32, 0)
    # bass: root on 1, octave pushes on the "and"s
    for k, (off, m, ln) in enumerate([(0, root - 12, 0.9), (1.5, root - 12, 0.4), (2, root, 0.4), (2.5, root - 12, 0.4), (3.5, root, 0.4)]):
        if t + off * BEAT < END:
            add(music, bass(m, ln * BEAT * 1.6), t + off * BEAT, 0.55)
    # arpeggio pluck in 8ths
    arp = [notes[0] + 12, notes[1] + 12, notes[2] + 12, notes[3] + 12, notes[2] + 12, notes[1] + 12, notes[3] + 12, notes[2] + 24]
    for k in range(8):
        at = t + k * BEAT / 2
        if at < END:
            add(music, pluck(arp[k]), at, 0.16, pan=-0.35 if k % 2 else 0.35)
    # drums
    for b in range(4):
        at = t + b * BEAT
        if at >= END:
            break
        add(drums, kick(), at, 0.9)
        if b in (1, 3):
            add(drums, clap(), at, 0.35, pan=0.05)
        add(drums, hat(open_=(b == 3)), at + BEAT / 2, 0.14 if b != 3 else 0.1, pan=0.25)
        if t > 11:  # more energy from the globe scene on
            add(drums, hat(), at + BEAT / 4, 0.07, pan=-0.25)
            add(drums, hat(), at + 3 * BEAT / 4, 0.07, pan=-0.25)
    t += BAR
    bar += 1

# final chord rings out
add(music, pad([n + 12 for n in CHORDS[0][1]], 1.6, cutoff=2000), END, 0.35)
add(music, bell(81, 1.6), END, 0.25)

# sidechain-style duck on music under each kick
duck = np.ones(N)
t = DROP
while t < END:
    i = int(t * SR)
    L = int(0.28 * SR)
    seg = 1 - 0.45 * np.exp(-np.arange(L) / SR / 0.07)
    duck[i:i + L] = np.minimum(duck[i:i + L], seg[: max(0, min(L, N - i))])
    t += BEAT
music *= duck

# ---------------------------------------------------------------- sfx timeline
CUTS = [3.2, 7.0, 11.0, 15.6, 20.2, 24.8, 29.2, 33.0]
for c in CUTS[1:]:
    add(fx, whoosh(0.7), c - 0.25, 0.3)
add(fx, impact(), DROP, 0.55)
add(fx, impact(), 33.0, 0.45)

TEXT = {
    'ru': {'hook': 'Но не знаешь, с чего начать?', 'chat': 'Хочу на IT в Европе, бюджет до $10k в год. Что подойдёт?'},
    'en': {'hook': "But don't know where to start?", 'chat': 'I want to study CS in Europe on a $10k/year budget. What fits?'},
}[LANG]

def typing(start, text, cps, gain=0.18):
    for i in range(len(text)):
        if text[i] != ' ':
            add(fx, tick(), start + (i + 1) / cps, gain * (0.8 + 0.4 * rng.random()), pan=rng.uniform(-0.2, 0.2))

# S1 hook
for i in range(3):
    add(fx, pop(0.8 + i * 0.12), 0.15 + i * 0.28, 0.18)
typing(1.45, TEXT['hook'], 26)
# S2 logo: tassel ding
add(fx, bell(84, 1.2), 3.3 + 0.6, 0.12)
# S3 stat cards
for i in range(4):
    add(fx, pop(1 + i * 0.1), 7.0 + 0.85 + i * 0.16, 0.2)
# S4 globe pins
for i, dt in enumerate([.45, .75, 1.25, 1.55, 1.85, 2.55, 2.85]):
    add(fx, bell(79 + (i % 4) * 2, 0.6), 11.0 + dt + 0.75, 0.08, pan=(i % 3 - 1) * 0.4)
# S5 scholarships
typing(15.6 + 1.2, "Fully funded Master's", 22)
for i in range(5):
    add(fx, pop(1.2 + i * 0.05), 15.6 + 1.5 + i * 0.08, 0.1)
for i in range(3):
    add(fx, whoosh(0.35), 15.6 + 2.05 + i * 0.22, 0.12)
    add(fx, pop(1.6), 15.6 + 3.3 + i * 0.2, 0.2)
# S6 AI chat
add(fx, pop(1.1), 20.2 + 1.05, 0.2)
typing(20.2 + 1.1, TEXT['chat'], 48, 0.12)
add(fx, pop(0.9), 20.2 + 3.2, 0.22)
for i in range(3):
    add(fx, pop(1.2 + i * 0.1), 20.2 + 3.5 + i * 0.18, 0.15)
# S7 odds + cost
add(fx, sweep(1.6), 24.8 + 0.9, 0.18)
for i in range(3):
    add(fx, pop(1 + i * 0.12), 24.8 + 2.1 + i * 0.1, 0.14)
add(fx, coin(), 24.8 + 3.9, 0.4)
# S8 tracker: pick up, drop, success
add(fx, whoosh(0.8), 29.2 + 2.0, 0.2)
add(fx, chime(76), 29.2 + 2.8, 0.55)
for i in range(5):
    add(fx, pop(1.3 + i * 0.06), 29.2 + 2.9 + i * 0.1, 0.1)
# S9 CTA
add(fx, pop(0.7), 33.0 + 0.3, 0.25)
add(fx, click(), 33.0 + 3.4, 0.5)
add(fx, chime(81), 33.0 + 3.5, 0.3)

# ---------------------------------------------------------------- mix
mix = reverb(music, 2.4, 0.22) * 0.8 + drums * 0.75 + reverb(fx, 1.2, 0.18) * 0.9
mix = hp(mix, 25)
fade_in = np.clip(np.arange(N) / (SR * 0.05), 0, 1)
fade_out = np.clip((DUR - np.arange(N) / SR) / 1.0, 0, 1)
mix *= fade_in * fade_out
mix = np.tanh(mix * 1.1)
mix *= 0.89 / np.max(np.abs(mix))
wavfile.write(OUT, SR, (mix.T * 32767).astype(np.int16))
print('wrote', OUT)
