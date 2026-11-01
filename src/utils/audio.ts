/**
 * Procedural romantic melody synthesizer using Web Audio API.
 * Zero external audio files (no 404s).
 * Emulates a sweet, dreamy music-box / celeste with warm ethereal pads.
 */

class RomanticAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private timer: number | null = null;
  private masterGain: GainNode | null = null;
  private padGain: GainNode | null = null;
  private currentNoteIndex = 0;

  // Romantic arpeggio notes (Frequencies in Hz)
  // Progression: Dm9 -> BbMaj7 -> C9 -> Am7
  private melodyNotes = [
    // Section A
    293.66, 349.23, 440.0, 523.25, 659.25, 587.33, 440.0, 349.23, // D4, F4, A4, C5, E5, D5, A4, F4
    233.08, 293.66, 349.23, 440.0, 523.25, 440.0, 349.23, 293.66, // Bb3, D4, F4, A4, C5, A4, F4, D4
    261.63, 329.63, 392.0, 493.88, 587.33, 523.25, 392.0, 329.63, // C4, E4, G4, B4, D5, C5, G4, E4
    220.0, 261.63, 329.63, 440.0, 523.25, 440.0, 329.63, 261.63, // A3, C4, E4, A4, C5, A4, E4, C4
    // Section B (higher register sparkle)
    587.33, 659.25, 783.99, 880.0, 1046.5, 880.0, 659.25, 587.33,
    466.16, 587.33, 698.46, 880.0, 1046.5, 880.0, 698.46, 587.33,
    523.25, 659.25, 783.99, 987.77, 1174.66, 987.77, 783.99, 659.25,
    440.0, 523.25, 659.25, 880.0, 1046.5, 880.0, 659.25, 440.0,
  ];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.padGain = this.ctx.createGain();
      this.padGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      this.padGain.connect(this.masterGain);

      this.startAmbientDrone();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Soft warm ambient background pad drone
  private startAmbientDrone() {
    if (!this.ctx || !this.padGain) return;

    const baseFreqs = [146.83, 220.0, 293.66]; // D3, A3, D4
    baseFreqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const filter = this.ctx!.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

      // Subtle LFO modulation for breathing warmth
      const lfo = this.ctx!.createOscillator();
      const lfoGain = this.ctx!.createGain();
      lfo.frequency.setValueAtTime(0.2 + idx * 0.05, this.ctx!.currentTime);
      lfoGain.gain.setValueAtTime(1.5, this.ctx!.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx!.currentTime);

      osc.connect(filter);
      filter.connect(this.padGain!);
      osc.start();
    });
  }

  // Play a music box / celeste bell chime
  private playBellNote(freq: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Primary bell sine wave
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Harmonics for music box twinkle
    const oscHarmonic = this.ctx.createOscillator();
    const gainHarmonic = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    oscHarmonic.type = 'triangle';
    oscHarmonic.frequency.setValueAtTime(freq * 2.01, now);

    // Envelope: quick attack, long gentle decay
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    gainHarmonic.gain.setValueAtTime(0.001, now);
    gainHarmonic.gain.exponentialRampToValueAtTime(0.06, now + 0.02);
    gainHarmonic.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

    osc.connect(gain);
    oscHarmonic.connect(gainHarmonic);

    gain.connect(this.masterGain);
    gainHarmonic.connect(this.masterGain);

    osc.start(now);
    oscHarmonic.start(now);

    osc.stop(now + 2.0);
    oscHarmonic.stop(now + 1.0);
  }

  // Play lovely chime for special interactions like "Blow a Kiss"
  public playKissChime() {
    this.initContext();
    if (!this.ctx) return;
    const notes = [587.33, 739.99, 880.0, 1174.66, 1479.98]; // D5, F#5, A5, D6, F#6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playBellNote(freq);
      }, idx * 70);
    });
  }

  public playHeartOpenChime() {
    this.initContext();
    if (!this.ctx) return;
    const notes = [349.23, 440.0, 523.25, 659.25, 880.0];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playBellNote(freq);
      }, idx * 110);
    });
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public start() {
    this.initContext();
    if (this.isPlaying) return;
    this.isPlaying = true;

    const step = () => {
      if (!this.isPlaying) return;
      const freq = this.melodyNotes[this.currentNoteIndex];
      this.playBellNote(freq);
      this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melodyNotes.length;

      // Romantic waltz-like pacing (variable rhythm)
      const isDownbeat = this.currentNoteIndex % 4 === 0;
      const delay = isDownbeat ? 620 : 380;
      this.timer = window.setTimeout(step, delay);
    };

    step();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }
}

export const soundManager = new RomanticAudioSynthesizer();
