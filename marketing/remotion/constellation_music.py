"""Score + sound design for the "Constellation" film (31 s), timed to src/Constellation.tsx.

    python3 constellation_music.py ru const-ru.wav   (ru/en only change nothing audible; kept for symmetry)
"""
import os

_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'reel', 'music.py')).read()
exec(_src.split('# ---------------------------------------------------------------- music')[0])

DUR = 31.0
N = int(SR * DUR)
music = np.zeros((2, N))
drums = np.zeros((2, N))
fx = np.zeros((2, N))

def piano(m, d=2.4):
    f = midi(m)
    tt = t_(d)
    s = sum(np.sin(2 * np.pi * f * k * tt) * (0.6 ** (k - 1)) * np.exp(-tt * (1.4 + k * 0.9)) for k in (1, 2, 3, 4))
    return lp(s * np.minimum(1, tt / 0.008), 4200)

def sub(d=1.6, f0=42):
    tt = t_(d)
    return np.sin(2 * np.pi * np.cumsum(f0 + 34 * np.exp(-tt * 10)) / SR) * np.exp(-tt * 2.0)

def shimmer(d, base=84):
    """Cloud of soft high bells — particles in sound."""
    out = np.zeros(int(SR * d))
    r = np.random.default_rng(3)
    for k in range(int(d * 9)):
        at = int(r.random() * (len(out) - SR))
        b = piano(base + int(r.integers(0, 4)) * 3 + 12 * int(r.integers(0, 2)), 1.0) * (0.25 + 0.5 * r.random())
        out[at:at + len(b)] += b[: len(out) - at]
    return out

# ---------------------------------------------------------------- space (0–6.5)
add(music, pad([45, 52, 57, 64], 7.2, cutoff=900) * np.linspace(0, 1, int(SR * 7.2)) ** 1.2, 0, 0.5)
add(music, shimmer(6.5), 0, 0.10)
for at, m in [(0.4, 76), (0.85, 72), (1.3, 79), (1.75, 81)]:            # caption words
    add(music, piano(m), at, 0.22, pan=(m % 3 - 1) * 0.3)
add(music, riser(3.3), 3.1, 0.22)                                        # particles converge
add(fx, whoosh(3.0), 3.4, 0.16)
add(fx, sub(2.4, 38), 6.4, 0.6)                                          # globe formed
add(fx, chime(81), 6.45, 0.25)

# ---------------------------------------------------------------- globe (6.5–12.3): pulse + arcs
BPM = 90
BEAT = 60 / BPM
CH = [(57, [57, 60, 64, 67]), (53, [53, 57, 60, 64]), (48, [55, 60, 64, 67]), (55, [55, 59, 62, 67])]
t = 6.5
bar = 0
while t < 12.3:
    root, notes = CH[bar % 4]
    d = min(BEAT * 4, 12.4 - t)
    add(music, pad([n + 12 for n in notes], d + 0.4, cutoff=2000), t, 0.28)
    add(music, bass(root - 12, d * 0.9), t, 0.35)
    for k in range(8):
        at = t + k * BEAT / 2
        if at < 12.3:
            add(music, piano([notes[0], notes[2], notes[3], notes[1]][k % 4] + 12, 1.2), at, 0.09, pan=-0.3 if k % 2 else 0.3)
    for b in range(4):
        at = t + b * BEAT
        if at < 12.3:
            add(drums, kick(0.35), at, 0.45 if b % 2 == 0 else 0.2)
    t += BEAT * 4
    bar += 1
for ci in range(7):                                                      # arcs launch and land
    add(fx, whoosh(0.9), 6.9 + ci * 0.45, 0.06, pan=(ci % 3 - 1) * 0.5)
    add(fx, piano(88 + (ci % 4) * 2, 1.2), 6.9 + ci * 0.45 + 1.2, 0.14, pan=(ci % 3 - 1) * 0.5)

# ---------------------------------------------------------------- vortex (12.3–17)
add(fx, whoosh(1.6), 12.2, 0.3)                                          # light leak
add(fx, impact(), 12.7, 0.3)
add(music, riser(4.0), 12.8, 0.18)
add(music, shimmer(4.2, 79), 12.8, 0.16)
add(music, pad([52, 59, 64, 71], 4.4, cutoff=1500), 12.6, 0.3)
add(fx, sub(2.2, 40), 16.8, 0.55)                                        # cap formed
add(fx, chime(76), 16.9, 0.32)

# ---------------------------------------------------------------- cap (17–22): fuller groove
t = 17.0
bar = 0
while t < 21.9:
    root, notes = CH[(bar + 2) % 4]
    d = min(BEAT * 4, 22.0 - t)
    add(music, pad([n + 12 for n in notes], d + 0.4, cutoff=2600), t, 0.3)
    add(music, bass(root - 12, d * 0.9), t, 0.4)
    for k in range(8):
        at = t + k * BEAT / 2
        if at < 21.9:
            add(music, piano([notes[0], notes[2], notes[3], notes[1]][k % 4] + 12, 1.2), at, 0.1, pan=-0.3 if k % 2 else 0.3)
    for b in range(4):
        at = t + b * BEAT
        if at < 21.9:
            add(drums, kick(), at, 0.6 if b % 2 == 0 else 0.25)
            if b % 2:
                add(drums, clap(), at, 0.18)
            add(drums, hat(), at + BEAT / 2, 0.07)
    t += BEAT * 4
    bar += 1

# ---------------------------------------------------------------- word + end card (22–31)
add(fx, whoosh(1.6), 21.8, 0.3)                                          # second light leak
add(music, riser(2.2), 22.0, 0.15)
add(fx, sub(2.0, 44), 24.2, 0.45)                                        # word formed
add(music, pad([53, 57, 60, 64, 69, 72], DUR - 24.0, cutoff=2600), 24.0, 0.36)
for k, m in enumerate([65, 69, 72, 76, 81]):
    add(music, piano(m, 3.0), 27.0 + k * 0.16, 0.18, pan=(k % 3 - 1) * 0.3)  # crisp wordmark
add(fx, pop(0.8), 28.2, 0.2)                                             # url pill
add(music, shimmer(5.0, 88), 25.5, 0.06)

mix = reverb(music, 3.2, 0.32) * 0.85 + drums * 0.7 + reverb(fx, 1.6, 0.22) * 0.9
mix = hp(mix, 25)
mix *= np.clip(np.arange(N) / (SR * 0.3), 0, 1) * np.clip((DUR - np.arange(N) / SR) / 1.4, 0, 1)
mix = np.tanh(mix * 1.05)
mix *= 0.89 / np.max(np.abs(mix))
wavfile.write(OUT, SR, (mix.T * 32767).astype(np.int16))
print('wrote', OUT)
