// Takes the entry's screenshots: serves game/ with serve.ts, loads each
// shot from shots.json in headless Chromium and saves a real render of
// the game's own code into screenshots/. Run: node take-shots.mjs
// (Node 22). The game poses itself from the ?shot= query, so every shot
// is a deterministic render of real game state, never staged by hand.

import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('/home/hatch/workspace/xe-sdk/node_modules/playwright');

const here = fileURLToPath(new URL('.', import.meta.url));
const shots = JSON.parse(readFileSync(join(here, 'shots.json'), 'utf8'));
const PORT = 8091;
const NODE = '/home/hatch/workspace/tools/node-v22.23.4-linux-x64/bin/node';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function launchBrowser() {
  try {
    return await chromium.launch({ args: ['--no-sandbox'] });
  } catch (e) {
    console.log('default launch failed:', String(e.message).split('\n')[0]);
    const exe = '/home/hatch/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome';
    console.log('retrying with', exe);
    return await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
  }
}

const server = spawn(NODE, [join(here, 'serve.ts'), '--port', String(PORT)], {
  stdio: 'inherit',
});
try {
  await sleep(1500);

  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
  page.on('pageerror', (err) => console.log('PAGE ERROR:', String(err)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });

  for (const shot of shots) {
    await page.goto(`http://localhost:${PORT}/${shot.query}`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__ready === true, null, { timeout: 10000 });
    await sleep(700);
    const path = join(here, 'screenshots', shot.name);
    await page.screenshot({ path, type: 'jpeg', quality: 80 });
    const bytes = statSync(path).size;
    console.log(shot.name, bytes, 'bytes', bytes <= 262144 ? 'OK' : 'OVER 256 KiB!');
  }

  await browser.close();
  console.log('done');
} finally {
  server.kill();
}
