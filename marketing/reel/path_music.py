"""Soundtrack + sound effects for the "Path" reel (path.html).

Reuses the synth voices from music.py (everything above its "music" section),
then lays out a 120 BPM arrangement where every scene change lands on a bar line.

    python3 path_music.py ru path-ru.wav
    python3 path_music.py en path-en.wav
"""
import os
import sys

_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'music.py')).read()
exec(_src.split('# ---------------------------------------------------------------- music')[0])

DUR = 34.0
N = int(SR * DUR)
music = np.zeros((2, N))
drums = np.zeros((2, N))
fx = np.zeros((2, N))

BPM = 120
BEAT = 60 / BPM          # 0.5 s
BAR = BEAT * 4           # 2 s — scenes are exactly two bars long
DROP = 4.0               # line dives into the globe
OUTRO = 28.0             # logo is drawn
CHORDS = [(57, [57, 60, 64, 69]), (53, [53, 57, 60, 65]), (48, [55, 60, 64, 67]), (55, [55, 59, 62, 67])]

# intro: dreamy pad + sparkle while the word is written, riser into the drop
add(music, pad([n + 12 for n in CHORDS[0][1]], DROP + 0.3, cutoff=1100), 0, 0.45)
for k, m in enumerate([81, 84, 88, 91, 93]):
    add(music, bell(m, 1.4), 0.9 + k * 0.22, 0.07, pan=(k % 3 - 1) * 0.5)
add(music, riser(2.4), DROP - 2.4, 0.2)

bar = 0
t = DROP
while t < OUTRO:
    root, notes = CHORDS[bar % 4]
    add(music, pad([n + 12 for n in notes], BAR + 0.3, cutoff=1800 + 900 * min(1, (t - DROP) / 12)), t, 0.3)
    for off, m, ln in [(0, root - 12, 0.9), (1.5, root - 12, 0.4), (2, root, 0.4), (2.5, root - 12, 0.4), (3.5, root, 0.4)]:
        add(music, bass(m, ln * BEAT * 1.6), t + off * BEAT, 0.5)
    arp = [notes[0] + 12, notes[1] + 12, notes[2] + 12, notes[3] + 12, notes[2] + 12, notes[1] + 12, notes[3] + 12, notes[2] + 24]
    for k in range(8):
        add(music, pluck(arp[k]), t + k * BEAT / 2, 0.14, pan=-0.35 if k % 2 else 0.35)
    for b in range(4):
        at = t + b * BEAT
        add(drums, kick(), at, 0.85)
        if b in (1, 3):
            add(drums, clap(), at, 0.32)
        add(drums, hat(open_=(b == 3)), at + BEAT / 2, 0.13)
        if t >= 12:
            add(drums, hat(), at + BEAT / 4, 0.06, pan=-0.25)
            add(drums, hat(), at + 3 * BEAT / 4, 0.06, pan=-0.25)
    t += BAR
    bar += 1

# outro: drums drop out, big chord under the logo, ring out
add(music, pad([n + 12 for n in CHORDS[0][1]] + [76], DUR - OUTRO, cutoff=2400), OUTRO, 0.42)
add(music, bass(CHORDS[0][0] - 12, 2.5), OUTRO, 0.5)
for k, m in enumerate([69, 72, 76, 81, 84]):
    add(music, bell(m, 2.0), OUTRO + 1.3 + k * 0.12, 0.08, pan=(k % 3 - 1) * 0.4)
for b in range(4):  # soft pulse under the URL
    add(drums, kick(), 30.0 + b * BAR / 2, 0.35)

duck = np.ones(N)
t = DROP
while t < OUTRO:
    i = int(t * SR)
    L = int(0.25 * SR)
    seg = 1 - 0.4 * np.exp(-np.arange(L) / SR / 0.07)
    duck[i:i + L] = np.minimum(duck[i:i + L], seg[: max(0, min(L, N - i))])
    t += BEAT
music *= duck

# ---------------------------------------------------------------- sfx (mirror path.html)
add(fx, pop(0.8), 0.1, 0.22)                      # origin dot
add(fx, whoosh(1.0), 0.3, 0.14)                   # loop swoosh
add(fx, whoosh(0.7), 1.25, 0.1)                   # underline
for tr in (3.0, 7.0, 11.0, 15.0, 19.0, 23.0, 27.0):
    add(fx, whoosh(1.0), tr, 0.26)                # line travels to the next scene
add(fx, impact(), DROP, 0.5)
for i in range(7):                                # globe pins
    add(fx, bell(79 + (i % 4) * 2, 0.6), 5.3 + i * 0.12, 0.08, pan=(i % 3 - 1) * 0.4)
add(fx, chime(79), 9.3, 0.35)                     # medal fills gold
add(fx, whoosh(0.9), 10.0, 0.12)                  # medal flip
add(fx, bell(93, 0.8), 11.1, 0.1)                 # shine

TEXT = {'ru': 'Куда поступить с бюджетом $10k в год?', 'en': 'Where can I study on a $10k/year budget?'}[LANG]
for i, ch in enumerate(TEXT):
    if ch != ' ':
        add(fx, tick(), 12.7 + i / len(TEXT), 0.14 * (0.8 + 0.4 * rng.random()))
add(fx, pop(0.9), 14.3, 0.24)
for i in range(3):
    add(fx, pop(1.2 + i * 0.1), 14.7 + i * 0.16, 0.14)
for i in range(4):                                # checks on the beat
    add(fx, tick(), 17.0 + i * 0.5, 0.35)
    add(fx, pop(1.4 + i * 0.12), 17.02 + i * 0.5, 0.2)
add(fx, click(), 19.0, 0.4)                       # 100% stamp
add(fx, whoosh(2.6), 20.1, 0.16)                  # flight
add(fx, chime(81), 22.7, 0.3)                     # landing at the campus
add(fx, whoosh(0.5), 25.0, 0.14)                  # flap opens
add(fx, whoosh(0.7), 25.35, 0.1)                  # letter slides out
add(fx, chime(76), 26.0, 0.55)                    # admitted!
for i in range(6):
    add(fx, pop(1.3 + i * 0.07), 26.05 + i * 0.06, 0.08, pan=(i % 3 - 1) * 0.5)
add(fx, impact(), OUTRO, 0.4)
add(fx, bell(84, 1.2), 29.3, 0.12)                # tassel
add(fx, pop(0.8), 30.6, 0.25)                     # url pill

mix = reverb(music, 2.6, 0.24) * 0.8 + drums * 0.75 + reverb(fx, 1.2, 0.18) * 0.9
mix = hp(mix, 25)
mix *= np.clip(np.arange(N) / (SR * 0.05), 0, 1) * np.clip((DUR - np.arange(N) / SR) / 1.2, 0, 1)
mix = np.tanh(mix * 1.1)
mix *= 0.89 / np.max(np.abs(mix))
wavfile.write(OUT, SR, (mix.T * 32767).astype(np.int16))
print('wrote', OUT)
