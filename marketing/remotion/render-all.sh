#!/bin/bash
# Renders both language versions of the Constellation film and muxes the score.
set -e
cd "$(dirname "$0")"
HS=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
FF=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")
M=../
python3 constellation_music.py ru out/const.wav
for L in ru en; do
  npx remotion render src/index.ts Constellation-$L out/const-$L-v.mp4 --browser-executable=$HS --gl=swangle --codec=h264 --crf=14 --concurrency=4
  $FF -y -loglevel error -i out/const-$L-v.mp4 -i out/const.wav -map 0:v -map 1:a -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=9" -ar 44100 -c:a aac -b:a 256k -shortest -movflags +faststart $M/scholarizepath-constellation-$L.mp4
  $FF -y -loglevel error -ss 19.5 -i $M/scholarizepath-constellation-$L.mp4 -frames:v 1 -q:v 2 $M/constellation-cover-$L.jpg
done
$FF -y -loglevel error -i $M/scholarizepath-constellation-ru.mp4 -vf "fps=1.2,scale=216:384,tile=12x3" -frames:v 1 out/full-scan.jpg
echo ALL_DONE
