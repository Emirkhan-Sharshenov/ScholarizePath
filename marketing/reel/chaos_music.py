"""Soundtrack + sound effects for the "Chaos → Order" reel (chaos.html).

0–9 s: no beat, rising tension (drone, accelerating clock, notification pings, heartbeat).
9 s: click, a beat of silence, impact — then a calm 96 BPM groove (one bar = 2.5 s,
so every tour section in chaos.html starts on a bar line).

    python3 chaos_music.py ru chaos-ru.wav
    python3 chaos_music.py en chaos-en.wav
"""
import os

_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'music.py')).read()
exec(_src.split('# ---------------------------------------------------------------- music')[0])

DUR = 28.5
N = int(SR * DUR)
music = np.zeros((2, N))
drums = np.zeros((2, N))
fx = np.zeros((2, N))
SNAP = 9.0

# ---------------------------------------------------------------- chaos (0–9 s)
def drone(d):
    tt = t_(d)
    f = 55 * 2 ** (tt / d * 0.5)                      # slowly bends up half an octave
    s = sum(np.sin(2 * np.pi * np.cumsum(f * k * (1 + 0.003 * k)) / SR) / k for k in (1, 2, 3, 5))
    s += 0.25 * saw(110, d, 0.004)[: len(tt)]
    return lp(s, 900) * (tt / d) ** 1.6

add(music, drone(8.85), 0.0, 0.5)
# dissonant cluster that swells toward the click
for m in (60, 61, 66, 67):
    add(music, pad([m], 8.85 - 2.0, cutoff=1600) * np.linspace(0, 1, int(SR * 6.85)) ** 2, 2.0, 0.22)

# clock ticks: accelerating from 1/s to ~8/s
t = 0.4
k = 0
while t < 8.8:
    add(fx, tick() * (1.0 if k % 2 else 0.7), t, 0.35, pan=0.3 if k % 2 else -0.3)
    t += max(0.12, 0.9 * 0.86 ** k)
    k += 1
# heartbeat from 4 s, speeding up
t = 4.0
k = 0
while t < 8.7:
    for off in (0, 0.18):
        add(drums, kick(0.3), t + off, 0.45 if off == 0 else 0.3)
    t += max(0.42, 0.9 - k * 0.07)
    k += 1

def ping(m=88):
    tt = t_(0.5)
    return (np.sin(2 * np.pi * midi(m) * tt) + 0.5 * np.sin(2 * np.pi * midi(m + 7) * tt)) * np.exp(-tt * 9)

# item spawns (mirror chaos.html: SP(n) = 0.25 + 7.2 * n^1.35, 20 items)
KINDS = ['win', 'note', 'win', 'toast', 'win', 'sheet', 'note', 'win', 'toast', 'win', 'note', 'win', 'badge', 'toast', 'win', 'note', 'win', 'win', 'note', 'win']
for i, kind in enumerate(KINDS):
    at = 0.25 + 7.2 * (i / (len(KINDS) - 1)) ** 1.35
    if kind == 'toast' or kind == 'badge':
        add(fx, ping(86 + (i % 3) * 3), at, 0.22, pan=(i % 3 - 1) * 0.5)
    else:
        add(fx, whoosh(0.35), at - 0.1, 0.1, pan=(i % 3 - 1) * 0.5)
        add(fx, pop(0.7 + (i % 4) * 0.1), at, 0.12)
# kinetic words stamped in
for i in range(3):
    add(fx, impact()[: int(SR * 0.5)], 4.4 + i * 0.9, 0.25)
add(music, riser(1.6), 7.2, 0.2)
# button pops in, cursor clicks
add(fx, pop(1.0), 7.7, 0.3)
add(fx, click(), 8.78, 0.7)

# ---------------------------------------------------------------- order (9 s →)
BPM = 96
BEAT = 60 / BPM          # 0.625 s
BAR = BEAT * 4           # 2.5 s
CHORDS = [(48, [55, 60, 64, 67]), (55, [55, 59, 62, 67]), (57, [57, 60, 64, 69]), (53, [53, 57, 60, 65])]  # C G Am F
END = 27.5

add(fx, impact(), SNAP, 0.55)
add(fx, whoosh(1.2, up=False), SNAP - 0.1, 0.25)
for i in range(9):                                   # each item clicks into its slot
    add(fx, pop(1.1 + i * 0.06), SNAP + 0.55 + i * 0.08, 0.16, pan=(i % 3 - 1) * 0.4)
add(music, bell(84, 2.0), SNAP + 0.1, 0.12)

bar = 0
t = SNAP
while t < END:
    root, notes = CHORDS[bar % 4]
    d = min(BAR, END - t + 0.3)
    add(music, pad([n + 12 for n in notes], d + 0.3, cutoff=2000), t, 0.3)
    for off, m, ln in [(0, root - 12, 1.2), (2, root - 12, 0.8), (3, root, 0.6)]:
        add(music, bass(m, ln * BEAT * 1.4), t + off * BEAT, 0.45)
    arp = [notes[0] + 12, notes[2] + 12, notes[1] + 24, notes[2] + 12] * 2
    for k in range(8):
        if t + k * BEAT / 2 < END:
            add(music, pluck(arp[k]), t + k * BEAT / 2, 0.12, pan=-0.3 if k % 2 else 0.3)
    if t >= SNAP + BAR:  # drums enter one bar after the snap
        for b in range(4):
            at = t + b * BEAT
            if at >= END:
                break
            add(drums, kick(), at, 0.7 if b in (0, 2) else 0.0)
            if b in (1, 3):
                add(drums, clap(), at, 0.26)
            add(drums, hat(), at + BEAT / 2, 0.1, pan=0.2)
    t += BAR
    bar += 1

# tour moments
for i in range(3):
    add(fx, bell(79 + i * 3, 0.7), 19.3 + i * 0.35, 0.12)          # deadline dots
add(fx, bell(88, 1.0), 20.4, 0.1)                                  # bell rings
TXT = {'ru': 'Подобрал 3 вуза под твой бюджет ✓', 'en': 'Found 3 universities within your budget ✓'}[LANG]
for i, ch in enumerate(TXT):
    if ch != ' ':
        add(fx, tick(), 21.7 + (i + 1) / len(TXT) * 1.1, 0.1)
add(fx, whoosh(0.7), 24.0, 0.2)                                    # UI slides away
add(fx, pop(0.8), 24.5, 0.22)
add(fx, bell(84, 1.2), 24.9, 0.12)
add(fx, pop(1.1), 25.2, 0.2)
add(music, pad([n + 12 for n in CHORDS[0][1]] + [76], DUR - END + 0.5, cutoff=2400), END - 0.3, 0.35)

mix = reverb(music, 2.4, 0.2) * 0.8 + drums * 0.8 + reverb(fx, 1.1, 0.16) * 0.9
mix = hp(mix, 25)
# a split second of silence right after the click, before the impact
gate = np.ones(N)
a, b = int((8.83) * SR), int((SNAP - 0.02) * SR)
gate[a:b] = 0.08
mix *= gate
mix *= np.clip(np.arange(N) / (SR * 0.05), 0, 1) * np.clip((DUR - np.arange(N) / SR) / 1.0, 0, 1)
mix = np.tanh(mix * 1.1)
mix *= 0.89 / np.max(np.abs(mix))
wavfile.write(OUT, SR, (mix.T * 32767).astype(np.int16))
print('wrote', OUT)
