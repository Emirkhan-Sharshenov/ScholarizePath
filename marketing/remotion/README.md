# «Созвездие» — 3D-промо на Remotion + Three.js

16 000 частиц-«университетов» перетекают между формами: звёздная пыль → глобус
(земля из карты сайта) с дугами перелётов → вихрь → шапка из логотипа → слово ScholarizePath.
Переходы — `lightLeak()` из `@remotion/effects`. Сделано по скиллу `remotion-best-practices`
(всё анимировано от `useCurrentFrame()`, без `useFrame()`).

```bash
npm install
npx remotion studio                 # интерактивный предпросмотр
./render-all.sh                     # обе версии (ru/en) + звук → ../scholarizepath-constellation-*.mp4
```

В облачной среде рендер идёт через `chrome-headless-shell` из Playwright и программный WebGL (`--gl=swangle`).
`constellation_music.py` генерирует звук теми же синтезаторами, что и `../reel/music.py`.
