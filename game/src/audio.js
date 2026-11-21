// Harbour at Dusk — sounds, synthesized with WebAudio.
//
// No audio files are shipped: every effect is a few oscillators through a
// gain envelope, built lazily on the first user gesture so the browser's
// autoplay rules never block the game. Mute is a single flag the game
// module owns; this module only plays.

const SoundFX = {
  ctx: null,
  muted: false,

  ensure() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
      } catch (e) {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  tone(freq, at, dur, type, vol) {
    const ac = this.ensure();
    if (!ac || this.muted) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, ac.currentTime + at);
    gain.gain.exponentialRampToValueAtTime(vol || 0.16, ac.currentTime + at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + at + dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(ac.currentTime + at);
    osc.stop(ac.currentTime + at + dur + 0.05);
  },

  found() {
    this.tone(659, 0, 0.16, 'sine', 0.18);
    this.tone(988, 0.09, 0.26, 'sine', 0.18);
  },

  wrong() {
    this.tone(160, 0, 0.22, 'sawtooth', 0.1);
    this.tone(110, 0.05, 0.26, 'sawtooth', 0.08);
  },

  hint() {
    this.tone(880, 0, 0.1, 'triangle', 0.12);
    this.tone(1174, 0.08, 0.14, 'triangle', 0.1);
  },

  click() {
    this.tone(520, 0, 0.06, 'triangle', 0.07);
  },

  sceneClear() {
    const notes = [523, 659, 784, 1046];
    notes.forEach((f, i) => this.tone(f, i * 0.11, 0.24, 'sine', 0.16));
  },

  win() {
    const notes = [523, 659, 784, 1046, 784, 1046, 1318];
    notes.forEach((f, i) => this.tone(f, i * 0.13, 0.3, 'triangle', 0.15));
  },

  fail() {
    const notes = [392, 330, 262];
    notes.forEach((f, i) => this.tone(f, i * 0.16, 0.3, 'sine', 0.13));
  },
};
