// Harbour at Dusk — scene data.
//
// Four dusk-harbour scenes, seven fair differences each. Every difference
// carries its canvas position (x, y), its click radius (r) and its kind, so
// the art module and the game module can agree on exactly where a change
// lives without sharing magic numbers. Coordinates are in the 640 x 420
// canvas space both panels use. Kinds: removed, recoloured, moved,
// resized, flipped, added — two removed per scene, one of each other kind.

const SCENES = [
  {
    id: 'pier',
    name: 'The Dusk Pier',
    tag: 'Scene 1 of 4',
    par: 90,
    blurb: 'Lanterns on the old pier, gulls coming home.',
    diffs: [
      { id: 'gull-gone', kind: 'removed', x: 150, y: 90, r: 26, label: 'A gull vanished from the dusk sky' },
      { id: 'lantern-teal', kind: 'recoloured', x: 120, y: 262, r: 24, label: 'A pier lantern burns teal, not gold' },
      { id: 'crate-moved', kind: 'moved', x: 115, y: 272, r: 40, label: 'A crate stack slid along the pier' },
      { id: 'boat-bigger', kind: 'resized', x: 300, y: 362, r: 34, label: 'The rowboat grew much bigger' },
      { id: 'flag-flipped', kind: 'flipped', x: 560, y: 238, r: 24, label: 'The pier flag points the other way' },
      { id: 'bucket-added', kind: 'added', x: 350, y: 292, r: 22, label: 'A bucket appeared on the pier' },
      { id: 'boat-gone', kind: 'removed', x: 480, y: 380, r: 28, label: 'The far boat is gone from the water' },
    ],
  },
  {
    id: 'lantern-boats',
    name: 'The Lantern Boats',
    tag: 'Scene 2 of 4',
    par: 100,
    blurb: 'Paper lanterns drift on the dark water.',
    diffs: [
      { id: 'lantern-gone', kind: 'removed', x: 140, y: 300, r: 26, label: 'A floating lantern went out' },
      { id: 'sail-pink', kind: 'recoloured', x: 420, y: 362, r: 24, label: 'A paper sail turned rose pink' },
      { id: 'lantern-moved', kind: 'moved', x: 285, y: 330, r: 36, label: 'A lantern drifted sideways' },
      { id: 'moon-bigger', kind: 'resized', x: 95, y: 62, r: 30, label: 'The crescent moon grew bigger' },
      { id: 'boat-flipped', kind: 'flipped', x: 200, y: 355, r: 26, label: 'A paper boat faces the other way' },
      { id: 'lantern-added', kind: 'added', x: 545, y: 365, r: 22, label: 'A tiny lantern joined the drift' },
      { id: 'post-gone', kind: 'removed', x: 560, y: 405, r: 22, label: 'A dock post is missing' },
    ],
  },
  {
    id: 'night-market',
    name: 'The Night Market Quay',
    tag: 'Scene 3 of 4',
    par: 110,
    blurb: 'Stalls, string lights and a cat on a crate.',
    diffs: [
      { id: 'cat-gone', kind: 'removed', x: 215, y: 345, r: 24, label: 'The market cat wandered off' },
      { id: 'awning-plum', kind: 'recoloured', x: 320, y: 275, r: 30, label: 'The middle awning turned plum' },
      { id: 'crate-moved', kind: 'moved', x: 110, y: 370, r: 32, label: 'A fruit crate slid along the quay' },
      { id: 'lamp-bigger', kind: 'resized', x: 120, y: 300, r: 26, label: 'A stall lamp grew much bigger' },
      { id: 'arrow-flipped', kind: 'flipped', x: 320, y: 240, r: 22, label: 'The stall sign arrow points left' },
      { id: 'apples-added', kind: 'added', x: 520, y: 330, r: 22, label: 'A pile of apples appeared' },
      { id: 'bulb-gone', kind: 'removed', x: 172, y: 204, r: 20, label: 'A string-light bulb went dark' },
    ],
  },
  {
    id: 'lighthouse',
    name: 'The Lighthouse Beam',
    tag: 'Scene 4 of 4',
    par: 120,
    blurb: 'The beam sweeps the rocks — or does it?',
    diffs: [
      { id: 'beam-gone', kind: 'removed', x: 400, y: 150, r: 44, label: 'The lighthouse beam went dark' },
      { id: 'stripes-teal', kind: 'recoloured', x: 130, y: 200, r: 28, label: 'The tower stripes turned teal' },
      { id: 'buoy-moved', kind: 'moved', x: 325, y: 350, r: 30, label: 'The buoy drifted sideways' },
      { id: 'cottage-smaller', kind: 'resized', x: 420, y: 255, r: 30, label: 'The cottage shrank' },
      { id: 'flag-flipped', kind: 'flipped', x: 130, y: 88, r: 22, label: 'The tower flag points the other way' },
      { id: 'rock-added', kind: 'added', x: 470, y: 375, r: 22, label: 'A rock broke the surface' },
      { id: 'gull-gone', kind: 'removed', x: 420, y: 70, r: 24, label: 'A gull vanished from the night sky' },
    ],
  },
];

function sceneCount() {
  return SCENES.length;
}

function totalDifferences() {
  let n = 0;
  for (const s of SCENES) n += s.diffs.length;
  return n;
}
