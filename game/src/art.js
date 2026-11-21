// Harbour at Dusk — flat vector art, drawn fresh on Canvas 2D.
//
// Every scene is drawn by a function that takes (ctx, variant). variant
// false draws the ORIGINAL panel; variant true draws the CHANGED panel
// with the scene's seven differences applied. The art is deterministic:
// stars and sparkles come from a seeded generator, never Math.random, and
// no image, font or sound is ever loaded from the network.

const ART_W = 640;
const ART_H = 420;

function seeded(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sky(ctx, stops, horizon) {
  const g = ctx.createLinearGradient(0, 0, 0, horizon);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, ART_W, horizon);
}

function stars(ctx, seed, count, top) {
  const rnd = seeded(seed);
  ctx.save();
  for (let i = 0; i < count; i++) {
    const x = 12 + rnd() * (ART_W - 24);
    const y = 8 + rnd() * top;
    const r = 0.7 + rnd() * 1.4;
    ctx.globalAlpha = 0.35 + rnd() * 0.6;
    ctx.fillStyle = '#ffeecf';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function moon(ctx, x, y, r, crescent) {
  ctx.save();
  const glow = ctx.createRadialGradient(x, y, r * 0.4, x, y, r * 2.6);
  glow.addColorStop(0, 'rgba(255, 233, 176, 0.55)');
  glow.addColorStop(1, 'rgba(255, 233, 176, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, r * 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffe9b0';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  if (crescent) {
    ctx.fillStyle = '#1b2350';
    ctx.beginPath();
    ctx.arc(x + r * 0.45, y - r * 0.18, r * 0.88, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = 'rgba(214, 178, 110, 0.55)';
    ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.2, r * 0.16, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + r * 0.25, y + r * 0.3, r * 0.12, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function sea(ctx, y0, top, bottom) {
  const g = ctx.createLinearGradient(0, y0, 0, ART_H);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, y0, ART_W, ART_H - y0);
}

function waveLines(ctx, y0, seed) {
  const rnd = seeded(seed);
  ctx.save();
  ctx.strokeStyle = 'rgba(150, 220, 220, 0.28)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 7; i++) {
    const y = y0 + 14 + rnd() * (ART_H - y0 - 26);
    const x = rnd() * ART_W * 0.5;
    const len = 40 + rnd() * 90;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + len / 2, y - 4, x + len, y);
    ctx.stroke();
  }
  ctx.restore();
}

function moonGlitter(ctx, x, y0) {
  ctx.save();
  ctx.fillStyle = 'rgba(255, 214, 140, 0.35)';
  for (let i = 0; i < 6; i++) {
    const w = 34 - i * 4;
    const y = y0 + 12 + i * 20;
    ctx.fillRect(x - w / 2, y, w, 4);
  }
  ctx.restore();
}

function gull(ctx, x, y, s, flip) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flip ? -s : s, s);
  ctx.strokeStyle = '#0e1330';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-13, 0); ctx.quadraticCurveTo(-6, -9, 0, 0);
  ctx.quadraticCurveTo(6, -9, 13, 0);
  ctx.stroke();
  ctx.restore();
}

function paperLantern(ctx, x, y, r, color) {
  ctx.save();
  const glow = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 2.1);
  glow.addColorStop(0, color + 'cc');
  glow.addColorStop(1, color + '00');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, r * 2.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 1.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(90, 30, 10, 0.55)';
  ctx.lineWidth = 1.6;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.ellipse(x, y, r * (1 - Math.abs(i) * 0.28), r * 1.18, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#7a4a12';
  ctx.fillRect(x - r * 0.34, y - r * 1.34, r * 0.68, r * 0.24);
  ctx.fillRect(x - r * 0.34, y + r * 1.1, r * 0.68, r * 0.24);
  ctx.restore();
}

function lanternGlow(ctx, x, y, r, color) {
  ctx.save();
  const glow = ctx.createRadialGradient(x, y, 2, x, y, r * 2.4);
  glow.addColorStop(0, color + 'aa');
  glow.addColorStop(1, color + '00');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, r * 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function crate(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = '#8a6a3f';
  ctx.fillRect(-16, -16, 32, 32);
  ctx.strokeStyle = '#5e4423';
  ctx.lineWidth = 2.4;
  ctx.strokeRect(-16, -16, 32, 32);
  ctx.beginPath();
  ctx.moveTo(-16, -16); ctx.lineTo(16, 16);
  ctx.moveTo(16, -16); ctx.lineTo(-16, 16);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 220, 150, 0.25)';
  ctx.fillRect(-16, -16, 32, 7);
  ctx.restore();
}

function ropeCoil(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = '#c9a86a';
  ctx.lineWidth = 3;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(0, 0, 16 - i * 4, 7 - i * 1.6, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function bucket(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = '#7d8a99';
  ctx.beginPath();
  ctx.moveTo(-11, -10); ctx.lineTo(11, -10); ctx.lineTo(8, 11); ctx.lineTo(-8, 11);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#4a5568';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-11, -10); ctx.quadraticCurveTo(0, -20, 11, -10);
  ctx.stroke();
  ctx.restore();
}

function rowboat(ctx, x, y, s, hull, flip) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flip ? -s : s, s);
  ctx.fillStyle = hull;
  ctx.beginPath();
  ctx.moveTo(-34, -6); ctx.lineTo(34, -6); ctx.lineTo(24, 10); ctx.lineTo(-24, 10);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#4a2c14';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(-30, -6, 60, 4);
  ctx.fillStyle = '#8a6a3f';
  ctx.fillRect(-3, -30, 3, 24);
  ctx.restore();
}

function house(ctx, x, y, w, lit) {
  ctx.save();
  ctx.fillStyle = '#141a38';
  ctx.fillRect(x, y, w, 26);
  ctx.beginPath();
  ctx.moveTo(x - 4, y); ctx.lineTo(x + w / 2, y - 14); ctx.lineTo(x + w + 4, y);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = lit ? '#ffd166' : '#232c52';
  ctx.fillRect(x + 7, y + 8, 9, 11);
  ctx.fillRect(x + w - 16, y + 8, 9, 11);
  ctx.restore();
}

function pierDeck(ctx, y) {
  ctx.save();
  ctx.fillStyle = '#6b4a26';
  ctx.fillRect(0, y, ART_W, 26);
  ctx.fillStyle = '#7d5a30';
  ctx.fillRect(0, y, ART_W, 6);
  ctx.strokeStyle = 'rgba(40, 24, 8, 0.7)';
  ctx.lineWidth = 2;
  for (let x = 20; x < ART_W; x += 42) {
    ctx.beginPath(); ctx.moveTo(x, y + 6); ctx.lineTo(x, y + 26); ctx.stroke();
  }
  ctx.fillStyle = '#54371c';
  for (const x of [80, 240, 400, 560]) ctx.fillRect(x - 7, y + 26, 14, 46);
  ctx.restore();
}

function pierPost(ctx, x, topY) {
  ctx.save();
  ctx.fillStyle = '#4a3016';
  ctx.fillRect(x - 4, topY, 8, 60);
  ctx.fillStyle = '#2c1c0c';
  ctx.beginPath(); ctx.arc(x, topY, 7, Math.PI, 0); ctx.fill();
  ctx.restore();
}

function hangingLantern(ctx, x, y, r, color) {
  ctx.save();
  ctx.strokeStyle = '#2c1c0c';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x, y - r - 14); ctx.lineTo(x, y - r); ctx.stroke();
  lanternGlow(ctx, x, y, r, color);
  paperLantern(ctx, x, y, r, color);
  ctx.restore();
}

function flag(ctx, x, y, dir, color) {
  ctx.save();
  ctx.strokeStyle = '#3a2a18';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 46); ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - 46);
  ctx.lineTo(x + dir * 26, y - 38);
  ctx.lineTo(x, y - 30);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function fireflies(ctx, seed, n) {
  const rnd = seeded(seed);
  ctx.save();
  for (let i = 0; i < n; i++) {
    const x = 30 + rnd() * (ART_W - 60);
    const y = 240 + rnd() * 150;
    ctx.fillStyle = 'rgba(255, 220, 120, ' + (0.4 + rnd() * 0.5) + ')';
    ctx.beginPath(); ctx.arc(x, y, 1.8 + rnd() * 1.6, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function paperBoat(ctx, x, y, s, sailColor, flip) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flip ? -s : s, s);
  ctx.fillStyle = '#f2ead8';
  ctx.beginPath();
  ctx.moveTo(-22, 0); ctx.lineTo(22, 0); ctx.lineTo(12, 10); ctx.lineTo(-12, 10);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#8a7a5a';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.fillStyle = sailColor;
  ctx.beginPath();
  ctx.moveTo(0, -24); ctx.lineTo(0, 0); ctx.lineTo(16, 0);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function dockStrip(ctx, y) {
  ctx.save();
  ctx.fillStyle = '#4a3016';
  ctx.fillRect(0, y, ART_W, ART_H - y);
  ctx.fillStyle = '#5d3d1d';
  ctx.fillRect(0, y, ART_W, 5);
  ctx.strokeStyle = 'rgba(30, 18, 6, 0.8)';
  ctx.lineWidth = 2;
  for (let x = 30; x < ART_W; x += 52) {
    ctx.beginPath(); ctx.moveTo(x, y + 5); ctx.lineTo(x, y + 22); ctx.stroke();
  }
  ctx.restore();
}

function shrineGate(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = '#0d1230';
  ctx.fillRect(-26, -46, 8, 46);
  ctx.fillRect(18, -46, 8, 46);
  ctx.fillRect(-34, -54, 68, 8);
  ctx.fillRect(-28, -40, 56, 6);
  ctx.fillStyle = '#1c2450';
  ctx.fillRect(-34, -54, 68, 3);
  ctx.restore();
}

function stall(ctx, x, y, w, awning, sign) {
  ctx.save();
  ctx.fillStyle = '#3a2412';
  ctx.fillRect(x, y + 34, w, 54);
  ctx.fillStyle = '#5d3d1d';
  ctx.fillRect(x - 4, y + 30, w + 8, 8);
  ctx.fillStyle = awning;
  ctx.beginPath();
  ctx.moveTo(x - 8, y + 30); ctx.lineTo(x + w + 8, y + 30);
  ctx.lineTo(x + w, y); ctx.lineTo(x, y);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
  for (let i = 0; i < 4; i++) {
    const sx = x + 6 + i * (w / 4);
    ctx.beginPath();
    ctx.moveTo(sx, y + 30); ctx.lineTo(sx + w / 8, y + 30);
    ctx.lineTo(sx + w / 8 + 2, y); ctx.lineTo(sx + 2, y);
    ctx.closePath(); ctx.fill();
  }
  if (sign) {
    ctx.fillStyle = '#f2e3c0';
    ctx.fillRect(x + w / 2 - 22, y + 40, 44, 16);
    ctx.fillStyle = '#2c1c0c';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sign, x + w / 2, y + 48);
  }
  ctx.restore();
}

function fruitPile(ctx, x, y, color, n) {
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < n; i++) {
    const px = x + (i % 4) * 11 - 16;
    const py = y - Math.floor(i / 4) * 10;
    ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath(); ctx.arc(x - 12, y - 8, 2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function stringLights(ctx, x1, y1, x2, y2, missing) {
  ctx.save();
  ctx.strokeStyle = '#1c1430';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo((x1 + x2) / 2, Math.max(y1, y2) + 46, x2, y2);
  ctx.stroke();
  const bulbs = ['#ffd166', '#ff8a5c', '#7fe0c3', '#ff9ecf', '#ffd166', '#7fb8ff'];
  for (let i = 1; i <= 6; i++) {
    const t = i / 7;
    const bx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * ((x1 + x2) / 2) + t * t * x2;
    const by = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * (Math.max(y1, y2) + 46) + t * t * y2;
    if (missing === i) continue;
    ctx.fillStyle = bulbs[i % bulbs.length];
    ctx.beginPath(); ctx.arc(bx, by + 7, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255, 220, 130, 0.25)';
    ctx.beginPath(); ctx.arc(bx, by + 7, 10, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function bunting(ctx, x1, y1, x2, y2, flip) {
  const colors = ['#ff8a5c', '#ffd166', '#7fe0c3', '#ff9ecf', '#7fb8ff'];
  ctx.save();
  ctx.strokeStyle = '#1c1430';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo((x1 + x2) / 2, Math.max(y1, y2) + 30, x2, y2);
  ctx.stroke();
  for (let i = 1; i <= 7; i++) {
    const t = i / 8;
    const bx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * ((x1 + x2) / 2) + t * t * x2;
    const by = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * (Math.max(y1, y2) + 30) + t * t * y2;
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    if (flip && i === 4) {
      ctx.moveTo(bx - 8, by + 4); ctx.lineTo(bx + 8, by + 4); ctx.lineTo(bx, by + 18);
    } else {
      ctx.moveTo(bx - 8, by + 4); ctx.lineTo(bx + 8, by + 4); ctx.lineTo(bx, by + 18);
    }
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function cat(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = '#232338';
  ctx.beginPath(); ctx.ellipse(0, 0, 13, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(10, -11, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(4, -17); ctx.lineTo(6, -26); ctx.lineTo(10, -18);
  ctx.moveTo(12, -18); ctx.lineTo(15, -26); ctx.lineTo(17, -17);
  ctx.fill();
  ctx.strokeStyle = '#232338';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-12, 4); ctx.quadraticCurveTo(-22, 2, -20, -8); ctx.stroke();
  ctx.fillStyle = '#ffd166';
  ctx.beginPath(); ctx.arc(12, -12, 1.4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function lighthouseTower(ctx, x, yBase, h, stripe) {
  ctx.save();
  const topW = 30, botW = 52;
  ctx.fillStyle = '#f2ead8';
  ctx.beginPath();
  ctx.moveTo(x - botW / 2, yBase); ctx.lineTo(x - topW / 2, yBase - h);
  ctx.lineTo(x + topW / 2, yBase - h); ctx.lineTo(x + botW / 2, yBase);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = stripe;
  for (let i = 0; i < 3; i++) {
    const sy = yBase - h + 22 + i * ((h - 40) / 3);
    const wAt = topW + (botW - topW) * (1 - (sy - (yBase - h)) / h);
    ctx.fillRect(x - wAt / 2 - 1, sy, wAt + 2, 16);
  }
  ctx.fillStyle = '#2c3550';
  ctx.fillRect(x - 22, yBase - h - 12, 44, 12);
  ctx.fillStyle = '#ffd166';
  ctx.beginPath(); ctx.arc(x, yBase - h - 20, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255, 220, 130, 0.5)';
  ctx.beginPath(); ctx.arc(x, yBase - h - 20, 16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2c3550';
  ctx.beginPath(); ctx.moveTo(x - 14, yBase - h - 30); ctx.lineTo(x + 14, yBase - h - 30); ctx.lineTo(x, yBase - h - 40); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function beam(ctx, x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const g = ctx.createLinearGradient(0, 0, 520, 0);
  g.addColorStop(0, 'rgba(255, 224, 138, 0.55)');
  g.addColorStop(1, 'rgba(255, 224, 138, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, -6); ctx.lineTo(520, -52); ctx.lineTo(520, 52); ctx.lineTo(0, 6);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function rocks(ctx, points, color) {
  ctx.save();
  ctx.fillStyle = color;
  for (const [x, y, r] of points) {
    ctx.beginPath();
    ctx.moveTo(x - r, y);
    ctx.quadraticCurveTo(x - r * 0.5, y - r * 1.1, x, y - r * 0.9);
    ctx.quadraticCurveTo(x + r * 0.6, y - r * 1.2, x + r, y);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function buoy(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = '#e05252';
  ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f2ead8';
  ctx.fillRect(-11, -3, 22, 6);
  ctx.fillStyle = '#e05252';
  ctx.fillRect(-3, -20, 6, 10);
  ctx.fillStyle = '#ffd166';
  ctx.beginPath(); ctx.arc(0, -22, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function cottage(ctx, x, y, s, lit) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = '#3a2c4a';
  ctx.fillRect(-26, -8, 52, 26);
  ctx.beginPath();
  ctx.moveTo(-30, -8); ctx.lineTo(0, -26); ctx.lineTo(30, -8);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = lit ? '#ffd166' : '#232c52';
  ctx.fillRect(-18, 2, 9, 11);
  ctx.fillRect(9, 2, 9, 11);
  ctx.fillStyle = '#5d3d1d';
  ctx.fillRect(18, -22, 7, 12);
  ctx.restore();
}

// ---- Scene 1: The Dusk Pier -------------------------------------------
function drawPier(ctx, v) {
  sky(ctx, [[0, '#141b3d'], [0.55, '#3a2b5c'], [1, '#ff8a5c']], 250);
  stars(ctx, 11, 46, 120);
  if (!v) { gull(ctx, 150, 90, 1, false); }
  gull(ctx, 260, 60, 0.9, false);
  gull(ctx, 380, 110, 1.1, true);
  moon(ctx, 520, 70, 26, false);
  sea(ctx, 250, '#123f4a', '#0a2833');
  waveLines(ctx, 250, 21);
  moonGlitter(ctx, 520, 250);
  house(ctx, 60, 224, 52, true);
  house(ctx, 190, 228, 46, true);
  house(ctx, 420, 222, 58, true);
  pierDeck(ctx, 300);
  pierPost(ctx, 120, 240);
  pierPost(ctx, 500, 240);
  hangingLantern(ctx, 120, 262, 13, v ? '#4fd1c5' : '#ffb347');
  hangingLantern(ctx, 500, 262, 13, '#ffb347');
  crate(ctx, v ? 140 : 90, v ? 275 : 268, 1);
  crate(ctx, 90, 240, 0.8);
  crate(ctx, 430, 272, 1);
  ropeCoil(ctx, 200, 290, 1);
  if (v) bucket(ctx, 350, 292, 1);
  flag(ctx, 560, 284, v ? -1 : 1, '#ff5c5c');
  rowboat(ctx, 300, 362, v ? 1.6 : 1, '#8a5a30', false);
  if (!v) rowboat(ctx, 480, 380, 0.9, '#6b4423', true);
  ctx.save();
  ctx.fillStyle = 'rgba(10, 40, 51, 0.5)';
  ctx.fillRect(0, 408, ART_W, 12);
  ctx.restore();
}

// ---- Scene 2: The Lantern Boats ---------------------------------------
function drawLanternBoats(ctx, v) {
  sky(ctx, [[0, '#0f1633'], [0.55, '#2c2350'], [1, '#ff9d76']], 240);
  stars(ctx, 22, 60, 110);
  moon(ctx, 95, 62, v ? 30 : 20, true);
  sea(ctx, 240, '#103a46', '#082430');
  waveLines(ctx, 240, 32);
  shrineGate(ctx, 520, 226, 1);
  if (!v) {
    paperLantern(ctx, 140, 300, 14, '#ffb347');
    ctx.fillStyle = 'rgba(255, 179, 71, 0.3)';
    ctx.fillRect(126, 316, 28, 26);
  }
  paperLantern(ctx, v ? 310 : 260, 330, 13, '#ff9ecf');
  paperLantern(ctx, 380, 310, 12, '#ffb347');
  paperLantern(ctx, 500, 340, 13, '#ffb347');
  if (v) paperLantern(ctx, 545, 365, 9, '#ffb347');
  paperBoat(ctx, 200, 355, 1, '#f2ead8', v);
  paperBoat(ctx, 420, 362, 1, v ? '#ff9ecf' : '#f2ead8', false);
  paperBoat(ctx, 320, 385, 0.8, '#f2ead8', true);
  fireflies(ctx, 42, 8);
  dockStrip(ctx, 396);
  ctx.fillStyle = '#2c1c0c';
  ctx.fillRect(96, 386, 10, 34);
  ctx.fillRect(320, 386, 10, 34);
  if (!v) ctx.fillRect(556, 386, 10, 34);
}

// ---- Scene 3: The Night Market Quay -----------------------------------
function drawMarket(ctx, v) {
  sky(ctx, [[0, '#191d42'], [0.55, '#43305e'], [1, '#ffb37a']], 250);
  stars(ctx, 33, 40, 100);
  moon(ctx, 90, 58, 20, false);
  sea(ctx, 250, '#123f4a', '#0a2833');
  waveLines(ctx, 250, 43);
  ctx.fillStyle = '#1c1430';
  ctx.fillRect(0, 250, ART_W, 170);
  stringLights(ctx, 60, 180, 320, 150, v ? 3 : -1);
  stringLights(ctx, 320, 150, 580, 185, -1);
  bunting(ctx, 60, 120, 580, 120, false);
  stall(ctx, 40, 262, 160, '#e05252', 'FISH');
  stall(ctx, 240, 262, 160, v ? '#7a4a8a' : '#2a9d8f', 'SPICE');
  stall(ctx, 440, 262, 160, '#e8a13c', 'FRUIT');
  hangingLantern(ctx, 120, 300, v ? 20 : 12, '#ffb347');
  hangingLantern(ctx, 320, 300, 12, '#ff9ecf');
  hangingLantern(ctx, 520, 300, 12, '#ffb347');
  fruitPile(ctx, 100, 330, '#ff8a3c', 8);
  fruitPile(ctx, 300, 330, '#c94f6d', 8);
  fruitPile(ctx, 480, 330, '#8ac926', 8);
  if (v) fruitPile(ctx, 520, 330, '#e05252', 8);
  crate(ctx, v ? 130 : 90, 370, 1);
  crate(ctx, 90, 342, 0.8);
  crate(ctx, 520, 375, 1);
  if (!v) cat(ctx, 215, 345, 1);
  ctx.save();
  ctx.fillStyle = '#f2e3c0';
  ctx.fillRect(298, 232, 44, 16);
  ctx.fillStyle = '#2c1c0c';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(v ? '←' : '→', 320, 240);
  ctx.restore();
}

// ---- Scene 4: The Lighthouse Beam -------------------------------------
function drawLighthouse(ctx, v) {
  sky(ctx, [[0, '#0d1530'], [0.55, '#27325e'], [1, '#ff7e5f']], 280);
  stars(ctx, 44, 70, 130);
  moon(ctx, 540, 60, 18, false);
  gull(ctx, 350, 90, 1, false);
  if (!v) gull(ctx, 420, 70, 1, true);
  sea(ctx, 280, '#103a46', '#082430');
  waveLines(ctx, 280, 54);
  rocks(ctx, [[70, 300, 46], [150, 306, 38], [250, 380, 22], [520, 390, 26]], '#232c4a');
  if (v) rocks(ctx, [[470, 375, 16]], '#232c4a');
  cottage(ctx, 420, 262, v ? 0.6 : 1, true);
  lighthouseTower(ctx, 130, 300, 180, v ? '#2a9d8f' : '#e05252');
  flag(ctx, 130, 130, v ? -1 : 1, '#ffd166');
  if (!v) beam(ctx, 130, 108, 0.16);
  buoy(ctx, v ? 350 : 300, 350, 1);
  ctx.save();
  ctx.strokeStyle = 'rgba(200, 235, 235, 0.5)';
  ctx.lineWidth = 2.5;
  for (const [x, y] of [[220, 330], [380, 400], [470, 320]]) {
    ctx.beginPath();
    ctx.moveTo(x - 16, y); ctx.quadraticCurveTo(x, y - 6, x + 16, y);
    ctx.stroke();
  }
  ctx.restore();
}

// ---- Public entry ------------------------------------------------------
const SCENE_DRAWERS = [drawPier, drawLanternBoats, drawMarket, drawLighthouse];

function drawScene(ctx, sceneIndex, variant) {
  ctx.save();
  ctx.clearRect(0, 0, ART_W, ART_H);
  SCENE_DRAWERS[sceneIndex](ctx, variant);
  ctx.restore();
}
