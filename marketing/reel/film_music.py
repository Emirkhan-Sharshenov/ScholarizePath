"""Soundtrack + sound design for the Apple-style film (film.html, 37 s).

    python3 film_music.py ru film-ru.wav
    python3 film_music.py en film-en.wav
"""
import os

_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'music.py')).read()
exec(_src.split('# ---------------------------------------------------------------- music')[0])

DUR = 37.0
N = int(SR * DUR)
music = np.zeros((2, N))
drums = np.zeros((2, N))
fx = np.zeros((2, N))

def piano(m, d=2.2):
    """Soft felt-piano-ish tone: a few decaying partials with a slow attack."""
    f = midi(m)
    tt = t_(d)
    s = sum(np.sin(2 * np.pi * f * k * tt) * (0.6 ** (k - 1)) * np.exp(-tt * (1.6 + k * 0.9)) for k in (1, 2, 3, 4))
    return lp(s * np.minimum(1, tt / 0.008), 4200)

def sub(d=1.2, f0=50):
    tt = t_(d)
    return np.sin(2 * np.pi * np.cumsum(f0 + 30 * np.exp(-tt * 12)) / SR) * np.exp(-tt * 2.2)

# ---------------------------------------------------------------- act 1: intro + laptop (0–8.7)
add(music, pad([45, 52, 57], 8.8, cutoff=700) * np.linspace(0, 1, int(SR * 8.8)) ** 1.5, 0, 0.5)
for at, m in [(0.35, 76), (0.8, 72), (1.2, 79), (1.65, 76)]:          # "Your future … is out there."
    add(music, piano(m, 2.4), at, 0.28, pan=(m % 3 - 1) * 0.3)
add(fx, sub(1.6, 44), 3.0, 0.5)                                         # laptop rises
add(fx, whoosh(1.8), 3.3, 0.14)                                         # lid opens
add(music, riser(1.4), 3.8, 0.12)
add(fx, chime(81), 5.0, 0.3)                                            # screen wakes
add(music, pad([53, 57, 60, 64, 67], 3.8, cutoff=2200), 5.0, 0.3)
for k, m in enumerate([72, 76, 79, 84]):
    add(music, piano(m, 2.0), 5.7 + k * 0.28, 0.16)                     # "ScholarizePath"
t = 6.2
while t < 8.6:                                                          # heartbeat pulse before the dive
    add(drums, kick(0.3), t, 0.35)
    t += 0.625
add(fx, whoosh(1.3), 7.5, 0.3)                                          # push into the screen
add(music, riser(1.2), 7.5, 0.2)

# ---------------------------------------------------------------- act 2: groove (8.7–33.3)
BPM = 96
BEAT = 60 / BPM
BAR = BEAT * 4
DROP = 8.7
END = 33.3
CHORDS = [(53, [53, 57, 60, 64]), (55, [55, 59, 62, 67]), (52, [52, 55, 59, 62]), (57, [57, 60, 64, 67])]  # Fmaj7 G Em7 Am7
add(fx, impact(), DROP, 0.45)
bar = 0
t = DROP
while t < END:
    root, notes = CHORDS[bar % 4]
    d = min(BAR, END - t + 0.3)
    add(music, pad([n + 12 for n in notes], d + 0.3, cutoff=2400), t, 0.26)
    for off, m, ln in [(0, root - 12, 1.4), (1.5, root - 12, 0.5), (2, root, 0.8), (3, root - 12, 0.6)]:
        if t + off * BEAT < END:
            add(music, bass(m, ln * BEAT * 1.4), t + off * BEAT, 0.42)
    arp = [notes[0] + 12, notes[2] + 12, notes[3] + 12, notes[1] + 24, notes[3] + 12, notes[2] + 12, notes[1] + 12, notes[2] + 24]
    for k in range(8):
        at = t + k * BEAT / 2
        if at < END:
            add(music, piano(arp[k], 1.2), at, 0.1, pan=-0.3 if k % 2 else 0.3)
    for b in range(4):
        at = t + b * BEAT
        if at >= END:
            break
        add(drums, kick(), at, 0.7 if b in (0, 2) else 0.25)
        if b in (1, 3):
            add(drums, clap(), at, 0.22)
        add(drums, hat(), at + BEAT / 2, 0.09, pan=0.2)
        if t >= 17.0:
            add(drums, hat(), at + BEAT / 4, 0.05, pan=-0.2)
            add(drums, hat(), at + 3 * BEAT / 4, 0.05, pan=-0.2)
    t += BAR
    bar += 1

for i in range(14):                                                     # map beams rise
    add(fx, piano(84 + (i % 5) * 2, 0.9), 8.7 + 0.4 + i * 0.12, 0.05, pan=(i % 3 - 1) * 0.5)
for tr in (12.4, 16.8, 26.2, 30.4):                                     # scene changes
    add(fx, whoosh(0.9), tr, 0.22)
    add(fx, sub(0.8, 55), tr + 0.5, 0.25)
for i in range(7):                                                      # stack layers separate
    add(fx, pop(0.8 + i * 0.08), 12.8 + i * 0.22, 0.08)
add(fx, chime(79), 14.7, 0.22)                                          # highlighted card lifts
USERQ = "Fully funded Master's in Europe?"
for i, ch in enumerate(USERQ):
    if ch != ' ':
        add(fx, tick(), 18.35 + (i + 1) / len(USERQ) * 0.9, 0.1)
add(fx, pop(1.0), 18.3, 0.18)
add(fx, pop(0.9), 20.1, 0.2)
for i in range(3):
    add(fx, pop(1.2 + i * 0.1), 20.45 + i * 0.2, 0.12)
add(fx, whoosh(1.1), 21.9, 0.25)                                        # phone spins
for i in range(4):
    add(fx, pop(1.3 + i * 0.06), 23.0 + i * 0.15, 0.12)
add(fx, chime(84), 24.5, 0.3)                                           # "High chance"
add(fx, whoosh(0.8), 28.1, 0.16)                                        # card moves on the board
add(fx, chime(76), 28.9, 0.4)                                           # accepted

# ---------------------------------------------------------------- act 3: end card (33.3–37)
add(fx, sub(2.0, 40), 33.7, 0.5)
add(music, pad([53, 57, 60, 64, 69, 72], DUR - 33.6, cutoff=2600), 33.6, 0.4)
for k, m in enumerate([65, 69, 72, 76, 81]):
    add(music, piano(m, 3.0), 33.8 + k * 0.18, 0.2, pan=(k % 3 - 1) * 0.3)
add(fx, pop(0.7), 34.25, 0.2)                                           # cap lands on the book
add(fx, bell(88, 1.4), 34.7, 0.1)                                       # tassel

mix = reverb(music, 3.0, 0.3) * 0.85 + drums * 0.7 + reverb(fx, 1.4, 0.2) * 0.9
mix = hp(mix, 25)
mix *= np.clip(np.arange(N) / (SR * 0.05), 0, 1) * np.clip((DUR - np.arange(N) / SR) / 1.4, 0, 1)
mix = np.tanh(mix * 1.05)
mix *= 0.89 / np.max(np.abs(mix))
wavfile.write(OUT, SR, (mix.T * 32767).astype(np.int16))
print('wrote', OUT)
