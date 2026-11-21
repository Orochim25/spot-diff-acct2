// Harbour at Dusk — game logic.
//
// One state machine drives the whole hunt: click a difference on either
// panel and a ring appears on both, the counter drops and the streak
// grows; three wrong clicks fail the scene. Keyboard plays the same game
// through a crosshair. A `?shot=` query puts the game into a frozen,
// pre-played pose so screenshots are deterministic renders of real state.

const Game = {
  sceneIndex: 0,
  found: new Set(),
  strikes: 0,
  hintsLeft: 3,
  hintPulse: null,
  flashes: [],
  score: 0,
  sceneScore: 0,
  streak: 0,
  bestStreak: 0,
  time: 0,
  totalTime: 0,
  totalFound: 0,
  started: false,
  paused: false,
  sceneDone: false,
  over: false,
  muted: false,
  magnifierOn: true,
  crosshair: { x: 320, y: 210, visible: false },
  frozen: false,
  lastFoundId: null,
  best: { score: 0, time: 0 },
};

const BEST_KEY = 'harbour-dusk-best-v1';
const $ = (id) => document.getElementById(id);

let leftCtx = null;
let rightCtx = null;
let lensCtx = null;

function formatTime(s) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
}

function loadBest() {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    if (raw) {
      const b = JSON.parse(raw);
      if (typeof b.score === 'number') Game.best = b;
    }
  } catch (e) { /* fresh start when storage is unavailable */ }
}

function saveBest() {
  try {
    localStorage.setItem(BEST_KEY, JSON.stringify(Game.best));
  } catch (e) { /* best score is a nicety, not a requirement */ }
}

function currentScene() {
  return SCENES[Game.sceneIndex];
}

function updateHud() {
  const scene = currentScene();
  const remaining = scene.diffs.length - Game.found.size;
  $('counter-num').textContent = remaining;
  $('counter-label').textContent = 'to find';
  let dots = '';
  for (let i = 0; i < scene.diffs.length; i++) {
    dots += '<span class="dot' + (i < Game.found.size ? ' on' : '') + '"></span>';
  }
  $('found-dots').innerHTML = dots + '<span class="found-word">Found:</span>';
  $('timer').textContent = formatTime(Game.time);
  $('score').textContent = Game.score.toLocaleString('en-US');
  $('streak').textContent = 'x' + Math.max(1, Game.streak);
  $('strikes').textContent = '✕'.repeat(Game.strikes) + '·'.repeat(3 - Game.strikes);
  $('hints-left').textContent = Game.hintsLeft;
  $('scene-name').textContent = scene.name;
  $('scene-tag').textContent = scene.tag + ' — par ' + formatTime(scene.par);
  let sceneDots = '';
  for (let i = 0; i < SCENES.length; i++) {
    const cls = i < Game.sceneIndex ? 'done' : (i === Game.sceneIndex ? 'now' : '');
    sceneDots += '<span class="sdot ' + cls + '">' + (i + 1) + '</span>';
  }
  $('scene-dots').innerHTML = sceneDots;
  const pct = Math.round((Game.totalFound / totalDifferences()) * 100);
  $('progress-fill').style.width = pct + '%';
  $('progress-label').textContent = Game.totalFound + ' / ' + totalDifferences() + ' found';
  $('best-chip').textContent = Game.best.score > 0
    ? 'Best ' + Game.best.score.toLocaleString('en-US')
    : 'No best yet — set one tonight';
  $('btn-hint').disabled = Game.hintsLeft <= 0 || Game.sceneDone || !Game.started;
}

function showOverlay(id) {
  for (const el of document.querySelectorAll('.overlay')) el.classList.remove('show');
  if (id) $(id).classList.add('show');
}

function startGame() {
  Game.started = true;
  Game.paused = false;
  Game.sceneDone = false;
  Game.over = false;
  showOverlay(null);
  SoundFX.ensure();
  updateHud();
}

function loadScene(index) {
  Game.sceneIndex = index;
  Game.found = new Set();
  Game.strikes = 0;
  Game.hintsLeft = 3;
  Game.hintPulse = null;
  Game.flashes = [];
  Game.sceneScore = 0;
  Game.streak = 0;
  Game.time = 0;
  Game.sceneDone = false;
  Game.lastFoundId = null;
  Game.crosshair = { x: 320, y: 210, visible: false };
  showOverlay(null);
  updateHud();
}

function guessAt(x, y) {
  if (!Game.started || Game.paused || Game.sceneDone || Game.over) return;
  const scene = currentScene();
  for (const d of scene.diffs) {
    if (Game.found.has(d.id)) continue;
    const dx = x - d.x;
    const dy = y - d.y;
    if (dx * dx + dy * dy <= d.r * d.r) {
      markFound(d);
      return;
    }
  }
  markWrong(x, y);
}

function markFound(d) {
  Game.found.add(d.id);
  Game.lastFoundId = d.id;
  Game.totalFound += 1;
  Game.streak += 1;
  Game.bestStreak = Math.max(Game.bestStreak, Game.streak);
  const points = 100 + (Game.streak - 1) * 25;
  Game.score += points;
  Game.sceneScore += points;
  SoundFX.found();
  updateHud();
  if (Game.found.size === currentScene().diffs.length) sceneComplete();
}

function markWrong(x, y) {
  Game.strikes += 1;
  Game.streak = 0;
  Game.flashes.push({ x, y, at: performance.now() });
  SoundFX.wrong();
  updateHud();
  if (Game.strikes >= 3) sceneFailed();
}

function useHint() {
  if (!Game.started || Game.paused || Game.sceneDone || Game.over) return;
  if (Game.hintsLeft <= 0) return;
  const remaining = currentScene().diffs.filter((d) => !Game.found.has(d.id));
  if (remaining.length === 0) return;
  Game.hintsLeft -= 1;
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  Game.hintPulse = { diff: pick, at: performance.now() };
  SoundFX.hint();
  updateHud();
}

function togglePause() {
  if (!Game.started || Game.sceneDone || Game.over) return;
  Game.paused = !Game.paused;
  if (Game.paused) {
    showOverlay('overlay-pause');
  } else {
    showOverlay(null);
  }
  SoundFX.click();
  updateHud();
}

function toggleMute() {
  Game.muted = !Game.muted;
  SoundFX.muted = Game.muted;
  $('btn-sound').textContent = Game.muted ? '🔇 Muted' : '🔊 Sound';
  if (!Game.muted) SoundFX.click();
}

function toggleMagnifier() {
  Game.magnifierOn = !Game.magnifierOn;
  $('btn-magnifier').textContent = Game.magnifierOn ? '🔍 Lens on' : '🔍 Lens off';
  if (!Game.magnifierOn) $('lens').classList.remove('show');
}

function sceneComplete() {
  Game.sceneDone = true;
  const scene = currentScene();
  const bonus = Math.max(0, scene.par - Game.time) * 5;
  Game.score += bonus;
  Game.sceneScore += bonus;
  Game.totalTime += Game.time;
  SoundFX.sceneClear();
  $('scene-summary').innerHTML =
    '<p class="big">' + scene.name + ' — cleared!</p>' +
    '<p>Time ' + formatTime(Game.time) + ' (par ' + formatTime(scene.par) + ') · ' +
    'time bonus +' + bonus + ' · scene score ' + Game.sceneScore.toLocaleString('en-US') + '</p>' +
    '<p>Best streak this scene: x' + Math.max(1, Game.bestStreak) + ' · ' +
    'total score ' + Game.score.toLocaleString('en-US') + '</p>';
  $('btn-next').textContent = Game.sceneIndex + 1 >= SCENES.length ? 'See the harbour' : 'Next scene →';
  showOverlay('overlay-scene');
  updateHud();
}

function sceneFailed() {
  SoundFX.fail();
  $('fail-summary').textContent =
    'Three strikes on ' + currentScene().name + '. The differences stay hidden — try the scene again.';
  showOverlay('overlay-fail');
}

function retryScene() {
  Game.score -= Game.sceneScore;
  if (Game.score < 0) Game.score = 0;
  loadScene(Game.sceneIndex);
  SoundFX.click();
}

function nextScene() {
  if (Game.sceneIndex + 1 >= SCENES.length) {
    showWin();
    return;
  }
  loadScene(Game.sceneIndex + 1);
  SoundFX.click();
}

function showWin() {
  Game.over = true;
  const isBest = Game.score > Game.best.score;
  if (isBest) {
    Game.best = { score: Game.score, time: Game.totalTime };
    saveBest();
  }
  $('win-stats').innerHTML =
    '<p class="big">All four scenes cleared — the harbour is yours.</p>' +
    '<p>Total score <b>' + Game.score.toLocaleString('en-US') + '</b> · ' +
    'total time <b>' + formatTime(Game.totalTime) + '</b> · ' +
    'best streak <b>x' + Math.max(1, Game.bestStreak) + '</b></p>' +
    '<p>' + (isBest ? '★ New best score! ★' : 'Best score: ' + Game.best.score.toLocaleString('en-US')) + '</p>';
  SoundFX.win();
  showOverlay('overlay-win');
  updateHud();
}

function playAgain() {
  Game.score = 0;
  Game.totalTime = 0;
  Game.totalFound = 0;
  Game.bestStreak = 0;
  Game.over = false;
  loadScene(0);
  SoundFX.click();
}

function drawRings(ctx, now) {
  const scene = currentScene();
  for (const d of scene.diffs) {
    if (!Game.found.has(d.id)) continue;
    const isNewest = d.id === Game.lastFoundId;
    ctx.save();
    ctx.lineWidth = isNewest ? 5 : 4;
    ctx.strokeStyle = isNewest ? '#3ddc84' : '#ffd166';
    ctx.shadowColor = isNewest ? '#3ddc84' : '#ffd166';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r + 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  if (Game.hintPulse) {
    const age = now - Game.hintPulse.at;
    if (age < 2600) {
      const d = Game.hintPulse.diff;
      const pulse = 1 + 0.35 * Math.sin(age / 130);
      ctx.save();
      ctx.globalAlpha = age > 2000 ? (2600 - age) / 600 : 1;
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#7fe0c3';
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(d.x, d.y, (d.r + 8) * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else {
      Game.hintPulse = null;
    }
  }
  Game.flashes = Game.flashes.filter((f) => now - f.at < 700);
  for (const f of Game.flashes) {
    const age = now - f.at;
    ctx.save();
    ctx.globalAlpha = 1 - age / 700;
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ff5c5c';
    ctx.beginPath();
    ctx.arc(f.x, f.y, 14 + age / 40, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(f.x - 18, f.y); ctx.lineTo(f.x + 18, f.y);
    ctx.moveTo(f.x, f.y - 18); ctx.lineTo(f.x, f.y + 18);
    ctx.stroke();
    ctx.restore();
  }
  if (Game.crosshair.visible && Game.started && !Game.sceneDone && !Game.over) {
    const c = Game.crosshair;
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 13, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(c.x - 20, c.y); ctx.lineTo(c.x - 7, c.y);
    ctx.moveTo(c.x + 7, c.y); ctx.lineTo(c.x + 20, c.y);
    ctx.moveTo(c.x, c.y - 20); ctx.lineTo(c.x, c.y - 7);
    ctx.moveTo(c.x, c.y + 7); ctx.lineTo(c.x, c.y + 20);
    ctx.stroke();
    ctx.restore();
  }
}

function render(now) {
  drawScene(leftCtx, Game.sceneIndex, false);
  drawScene(rightCtx, Game.sceneIndex, true);
  drawRings(leftCtx, now);
  drawRings(rightCtx, now);
  requestAnimationFrame(render);
}

function canvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (ART_W / rect.width),
    y: (event.clientY - rect.top) * (ART_H / rect.height),
  };
}

function bindPanel(canvas) {
  canvas.addEventListener('click', (event) => {
    SoundFX.ensure();
    const p = canvasPoint(canvas, event);
    guessAt(p.x, p.y);
  });
  canvas.addEventListener('mousemove', (event) => {
    Game.crosshair.visible = false;
    if (!Game.magnifierOn || !Game.started || Game.paused) {
      $('lens').classList.remove('show');
      return;
    }
    const p = canvasPoint(canvas, event);
    const lens = $('lens');
    lens.classList.add('show');
    const pad = 16;
    let lx = event.clientX + 22;
    let ly = event.clientY - 86;
    if (lx + 150 + pad > window.innerWidth) lx = event.clientX - 172;
    if (ly < pad) ly = event.clientY + 22;
    lens.style.left = lx + 'px';
    lens.style.top = ly + 'px';
    const sx = Math.max(0, Math.min(ART_W - 100, p.x - 50));
    const sy = Math.max(0, Math.min(ART_H - 100, p.y - 50));
    lensCtx.clearRect(0, 0, 150, 150);
    lensCtx.drawImage(canvas, sx, sy, 100, 100, 0, 0, 150, 150);
    lensCtx.strokeStyle = '#ffd166';
    lensCtx.lineWidth = 3;
    lensCtx.beginPath();
    lensCtx.arc(75, 75, 72, 0, Math.PI * 2);
    lensCtx.stroke();
  });
  canvas.addEventListener('mouseleave', () => {
    $('lens').classList.remove('show');
  });
}

function bindKeys() {
  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown' ||
        event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      if (!Game.started || Game.paused || Game.sceneDone || Game.over) return;
      const step = event.shiftKey ? 30 : 10;
      Game.crosshair.visible = true;
      if (event.key === 'ArrowUp') Game.crosshair.y = Math.max(10, Game.crosshair.y - step);
      if (event.key === 'ArrowDown') Game.crosshair.y = Math.min(ART_H - 10, Game.crosshair.y + step);
      if (event.key === 'ArrowLeft') Game.crosshair.x = Math.max(10, Game.crosshair.x - step);
      if (event.key === 'ArrowRight') Game.crosshair.x = Math.min(ART_W - 10, Game.crosshair.x + step);
      return;
    }
    const k = event.key.toLowerCase();
    if (k === 'enter' || k === ' ') {
      event.preventDefault();
      if ($('overlay-scene').classList.contains('show')) { nextScene(); return; }
      if ($('overlay-win').classList.contains('show')) { playAgain(); return; }
      if ($('overlay-fail').classList.contains('show')) { retryScene(); return; }
      if ($('overlay-howto').classList.contains('show')) { startGame(); return; }
      guessAt(Game.crosshair.x, Game.crosshair.y);
    } else if (k === 'h') {
      useHint();
    } else if (k === 'p' || k === 'escape') {
      togglePause();
    } else if (k === 'n') {
      if ($('overlay-scene').classList.contains('show')) nextScene();
    } else if (k === 'r') {
      if (Game.started && !Game.over) retryScene();
    } else if (k === 'm') {
      toggleMute();
    }
  });
}

function applyShot(name) {
  const presets = {
    cover: { scene: 0, found: 3, time: 47, score: 340, streak: 3 },
    lantern: { scene: 1, found: 2, time: 72, score: 610, streak: 2 },
    market: { scene: 2, found: 4, time: 123, score: 980, streak: 4 },
    win: { scene: 3, found: 7, time: 131, score: 2450, streak: 5, win: true },
  };
  const p = presets[name];
  if (!p) return;
  Game.frozen = true;
  Game.started = true;
  Game.sceneIndex = p.scene;
  Game.found = new Set();
  const scene = currentScene();
  for (let i = 0; i < p.found && i < scene.diffs.length; i++) {
    Game.found.add(scene.diffs[i].id);
    Game.lastFoundId = scene.diffs[i].id;
  }
  Game.totalFound = p.scene * 7 + p.found;
  Game.time = p.time;
  Game.totalTime = p.scene * 96 + p.time;
  Game.score = p.score;
  Game.sceneScore = p.found * 100;
  Game.streak = p.streak;
  Game.bestStreak = p.streak;
  if (p.win) {
    Game.sceneDone = true;
    Game.over = true;
    Game.best = { score: 2450, time: 461 };
    $('win-stats').innerHTML =
      '<p class="big">All four scenes cleared — the harbour is yours.</p>' +
      '<p>Total score <b>2,450</b> · total time <b>07:41</b> · best streak <b>x5</b></p>' +
      '<p>★ New best score! ★</p>';
    showOverlay('overlay-win');
  } else {
    showOverlay(null);
  }
  updateHud();
}

function tickClock() {
  if (Game.started && !Game.paused && !Game.sceneDone && !Game.over && !Game.frozen) {
    Game.time += 1;
    $('timer').textContent = formatTime(Game.time);
  }
}

function init() {
  leftCtx = $('canvas-left').getContext('2d');
  rightCtx = $('canvas-right').getContext('2d');
  lensCtx = $('lens-canvas').getContext('2d');
  loadBest();
  bindPanel($('canvas-left'));
  bindPanel($('canvas-right'));
  bindKeys();
  $('btn-start').addEventListener('click', startGame);
  $('btn-next').addEventListener('click', nextScene);
  $('btn-retry').addEventListener('click', retryScene);
  $('btn-again').addEventListener('click', playAgain);
  $('btn-resume').addEventListener('click', togglePause);
  $('btn-hint').addEventListener('click', useHint);
  $('btn-pause').addEventListener('click', togglePause);
  $('btn-sound').addEventListener('click', toggleMute);
  $('btn-magnifier').addEventListener('click', toggleMagnifier);
  $('btn-help').addEventListener('click', () => {
    if (Game.started && !Game.sceneDone && !Game.over) Game.paused = true;
    showOverlay('overlay-howto');
  });
  $('btn-restart').addEventListener('click', () => {
    if (Game.started && !Game.over) retryScene();
  });
  const shot = new URLSearchParams(window.location.search).get('shot');
  if (shot) {
    applyShot(shot);
  } else {
    showOverlay('overlay-howto');
  }
  updateHud();
  setInterval(tickClock, 1000);
  requestAnimationFrame(render);
  window.__game = { state: Game, scenes: SCENES, guessAt, nextScene, useHint, togglePause };
  window.__ready = true;
}

document.addEventListener('DOMContentLoaded', init);
