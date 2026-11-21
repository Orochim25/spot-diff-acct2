# Harbour at Dusk — Spot the Difference

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Orochim25/spot-diff-acct2/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Orochim25/spot-diff-acct2/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

A complete spot-the-difference game that plays offline in a desktop browser.
Four dusk-harbour scenes — The Dusk Pier, The Lantern Boats, The Night Market
Quay and The Lighthouse Beam — each hiding 7 differences across two
near-identical flat-vector panels drawn live on Canvas 2D. Find them all:
gold rings mark every find on both panels (the newest glows green), a big
counter shows how many remain, and three strikes fail the scene.

## Play

- Click a difference on either picture; wrong clicks cost a strike.
- **Hint** (3 per scene) pulses a difference you missed.
- **Pause**, timer with a par time per scene, score + streak bonuses.
- Keyboard: arrows move the crosshair, Enter guesses, H hints, P pauses,
  N next, R restart, M mute. Hover a picture for the magnifier lens.
- Sounds are synthesized with WebAudio — no audio files, no network.

## Run it

```sh
node serve.ts            # serves game/ on http://localhost:8080
node take-shots.mjs     # retakes screenshots/ from the real game
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # builds the entry
```

## Layout

- `game/index.html` — page shell, HUD, overlays
- `game/src/scenes.js` — the four scenes and their 7 differences each
- `game/src/art.js` — deterministic Canvas 2D art for every scene
- `game/src/audio.js` — WebAudio sound effects
- `game/src/game.js` — state machine, input, scoring, screenshots poses
- `main.ts` — copies game/ + screenshots/ to /output, writes dossier.json
- `serve.ts`, `shots.json`, `take-shots.mjs` — local play and screenshots
